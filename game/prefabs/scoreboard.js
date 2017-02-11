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

    this.makeRequest("http://192.168.101.223:3000/questions");

    this.style = { font: "20px Arial", fill: "#000", wordWrap: true, wordWrapWidth: this.scoreboard.width, align: "center"};

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
    for(var i = 0; i < this.question.options.length; i++) {
        if(this.answer.text === this.question.options[i]) {
            if(i == this.question.correct) {
                this.context.game.add.text(this.context.leftMargin, (this.context.game.height / 2.1) - this.context.topMargin, "Yes, thats correct", this.style);
                result = true;
            }
            else {
                this.firstLine = this.context.game.add.text(this.context.leftMargin, (this.context.game.height / 2.1) - this.context.topMargin, "Sorry thats the wrong answer", this.style);
                this.secondLine = this.context.game.add.text(this.context.leftMargin, (this.context.game.height / 1.9) - this.context.topMargin, "The right answer was:", this.style);
                this.thirdLine = this.context.game.add.text(this.context.leftMargin, (this.context.game.height / 1.7) - this.context.topMargin, this.question.options[this.question.correct], this.style);
                result = false;
            }
        }
    }

    var buttonTopMargin = 280;
    var leftMargin = this.context.leftMargin + 150;

    if(result) {
        this.context.game.add.button(leftMargin, this.context.game.height - buttonTopMargin, 'continueButton', this.context.resumeGame, this);
    }
    else {
        this.continueButton = this.context.game.add.button(leftMargin, this.context.game.height - buttonTopMargin, 'endButton', this.context.exitGame, this);
        this.context.game.speed = -200;
    }

};
Scoreboard.prototype.makeTextBold = function (item) {
   item.fontWeight = "bold";
   item.fontSize = 20;
   item.font = "Arial";
};
Scoreboard.prototype.makeTextNormal = function (item) {
   item.fontWeight = "normal";
   item.fontSize = 20;
   item.font = "Arial";
};
Scoreboard.prototype.resumeGame = function() {
    this.context.mainHandler.resetGame();
};
Scoreboard.prototype.exitGame = function() {
    this.context.mainHandler.scoreboard.visible = false;
    this.firstLine.visible = false;
    this.secondLine.visible = false;
    this.thirdLine.visible = false;
    this.continueButton.visible = false;
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
      scoreboardContext.addQuestions(scoreboardContext.game.cache._cache.json.questions.data);
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

    this.questionText = this.game.add.text(this.leftMargin, (this.game.height / 2.1) - this.topMargin, question.text, this.style);
    this.add(this.questionText);

    this.answers = [];

    for(var i = 0; i < question.options.length; i++) {
        var offset = 1.8 - (i * 0.20);
        this.answers[i] = this.game.add.text(this.leftMargin, (this.game.height / offset) - this.topMargin, question.options[i], this.style);
        this.answers[i].inputEnabled = true;
        this.answers[i].events.onInputDown.add(this.answerClicked, { "answer": this.answers[i], "question": question, "context": this});
        this.answers[i].events.onInputOver.add(this.makeTextBold, this);
        this.answers[i].events.onInputOut.add(this.makeTextNormal, this);
        this.add(this.answers[i]);
    }
}

module.exports = Scoreboard;
