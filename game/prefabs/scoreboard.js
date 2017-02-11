'use strict';

var scoreboardContext;

var Scoreboard = function(game, mainHandler) {

  var gameover;

  Phaser.Group.call(this, game);

  this.game = game;
  this.mainHandler = mainHandler;
  this.httpRequest;

  this.scoreboard = this.create(this.game.width / 2, 200, 'scoreboard');
  this.scoreboard.anchor.setTo(0.5, 0.5);
  scoreboardContext = this;

  this.y = this.game.height;
  this.x = 0;
};

Scoreboard.prototype = Object.create(Phaser.Group.prototype);
Scoreboard.prototype.constructor = Scoreboard;

Scoreboard.prototype.show = function(score) {

    this.makeRequest("http://192.168.1.2:3000/questions");

    this.style = { font: "15px Arial", fill: "#000", wordWrap: true, wordWrapWidth: (this.scoreboard.width - 30), align: "center"};

    this.topMargin = this.scoreboard.height - 70;
    this.leftMargin = (this.game.width - (this.scoreboard.width * 1.5)) + 10;

    this.game.add.tween(this).to({y: 0}, 1000, Phaser.Easing.Bounce.Out, true);
};
Scoreboard.prototype.answerClicked = function () {
    this.context.questionText.visible = false;

    for(var j = 0; j < this.context.answers.length; j++) {
        this.context.answers[j].visible = false;
        this.context.answers[j].inputEnabled = false;
    }

    var result;
    var points = 0;
    for(var i = 0; i < this.question.options.length; i++) {
        if(this.answer.text === this.question.options[i]) {
            if(i == this.question.correct) {
                this.context.game.add.text(this.context.leftMargin + 230, (this.context.game.height / 1.4) - (this.context.topMargin - 10), "Yes, thats correct", this.context.style);
                points = this.context.pointsForDifficulty(this.question.difficulty);
                result = true;
            }
            else {
                this.firstLine = this.context.game.add.text(this.context.leftMargin + 230, (this.context.game.height / 1.4) - (this.context.topMargin - 10), "Sorry thats the wrong answer", this.context.style);
                this.secondLine = this.context.game.add.text(this.context.leftMargin + 230, (this.context.game.height / 1.4) - (this.context.topMargin - 40), "The right answer was:", this.context.style);
                this.thirdLine = this.context.game.add.text(this.context.leftMargin + 230, (this.context.game.height / 1.4) - (this.context.topMargin - 70), this.question.options[this.question.correct], this.context.style);
                result = false;
            }
        }
    }

    var buttonTopMargin = 180;
    var leftMargin = this.context.leftMargin + 430;

    if(result) {
        this.context.game.add.button(leftMargin, this.context.game.height - buttonTopMargin, 'continueButton', this.context.resumeGame, { "newContext": this, "points": points});
    }
    else {
        this.continueButton = this.context.game.add.button(leftMargin, this.context.game.height - buttonTopMargin, 'endButton', this.context.exitGame, this);
        this.context.game.speed = -200;
    }

};
Scoreboard.prototype.pointsForDifficulty = function (difficulty) {
  var points = 0;
  if(difficulty == "very easy"){
    points = 50;
  }
  else if(difficulty == "easy"){
    points = 100;
  }
  else if(difficulty == "though"){
    points = 250;
  }
  else if(difficulty == "very though"){
    points = 500;
  }
  return points;
};
Scoreboard.prototype.makeTextBold = function (item) {
   item.fontWeight = "bold";
   item.fontSize = 15;
   item.font = "Arial";
};
Scoreboard.prototype.makeTextNormal = function (item) {
   item.fontWeight = "normal";
   item.fontSize = 15;
   item.font = "Arial";
};
Scoreboard.prototype.resumeGame = function() {
    this.newContext.context.mainHandler.resetGame(this.points);
};
Scoreboard.prototype.exitGame = function() {
    this.context.mainHandler.scoreboard.destroy();
    this.firstLine.destroy();
    this.secondLine.destroy();
    this.thirdLine.destroy();
    this.continueButton.destroy();
    this.context.mainHandler.highscore.show(this.context.mainHandler);
};
Scoreboard.prototype.makeRequest = function (url) {
    this.httpRequest = new XMLHttpRequest();

    if (!this.httpRequest) {
        this.questions = this.game.cache._cache.json.questions.data;
    }
    else {
        this.httpRequest.onreadystatechange = this.processQuestions;
        this.httpRequest.open('GET', url);
        this.httpRequest.send();
    }
}
Scoreboard.prototype.processQuestions = function () {
  var httpRequest = this;
  if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200) {
      scoreboardContext.addQuestions(httpRequest.responseText);
    } else {
      scoreboardContext.addQuestions(JSON.stringify(scoreboardContext.game.cache._cache.json.questions.data));
    }
  }
}
Scoreboard.prototype.addQuestions = function (questions) {
    var parseJson = JSON.parse(questions);

    var questionsArray = [];

    for(var i = 0; i < parseJson.length; i++) {
      questionsArray.push(parseJson[i].question);
    }

    var question = questionsArray[this.game.rnd.integerInRange(0, questionsArray.length -1)];

    this.titleStyle = { font: "15px Arial", fill: "#000", wordWrap: true, wordWrapWidth: (this.scoreboard.width - 30), align: "center", fontWeight: "bold"};

    this.questionText = this.game.add.text(this.leftMargin + 230, (this.game.height / 1.4) - (this.topMargin - 10), question.text, this.titleStyle);
    this.add(this.questionText);

    this.answers = [];

    for(var i = 0; i < question.options.length; i++) {
        var offset = 35 + (i * 50);
        this.answers[i] = this.game.add.text(this.leftMargin + 230, (this.game.height / 1.3) - (this.topMargin - offset), question.options[i], this.style);
        this.answers[i].inputEnabled = true; 
        this.answers[i].events.onInputDown.add(this.answerClicked, { "answer": this.answers[i], "question": question, "context": this});
        this.answers[i].events.onInputOver.add(this.makeTextBold, this);
        this.answers[i].events.onInputOut.add(this.makeTextNormal, this);
        this.add(this.answers[i]);
    }
}

module.exports = Scoreboard;
