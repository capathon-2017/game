'use strict';

var Scoreboard = function(game) {

  var gameover;

  Phaser.Group.call(this, game);

  this.questions = this.game.cache._json.questions.data;

  this.scoreboard = this.create(this.game.width / 2, 200, 'scoreboard');
  this.scoreboard.anchor.setTo(0.5, 0.5);

  this.y = this.game.height;
  this.x = 0;

};

Scoreboard.prototype = Object.create(Phaser.Group.prototype);
Scoreboard.prototype.constructor = Scoreboard;

Scoreboard.prototype.show = function(score) {

    var style = { font: "20px Arial", fill: "#000000", wordWrap: true, wordWrapWidth: this.scoreboard.width, align: "center"};

    var topMargin = this.scoreboard.height - 70;
    var leftMargin = (this.game.width - (this.scoreboard.width * 1.5)) + 20;

    var question = this.questions.question;

    this.questionText = this.game.add.text(leftMargin, (this.game.height / 2.4) - topMargin, question.text, style);
    this.add(this.questionText);

    this.answers = [];

    for(var i = 0; i < question.options.length; i++) {
        var offset = 2.1 - (i * 0.20);
        this.answers[i] = this.game.add.text(leftMargin, (this.game.height / offset) - topMargin, question.options[i], style);
        this.answers[i].inputEnabled = true;
        this.answers[i].events.onInputDown.add(this.answerClicked, { "answer": this.answers[i], "question": question});
        this.answers[i].events.onInputOver.add(this.makeTextBold, this);
        this.answers[i].events.onInputOut.add(this.makeTextNormal, this);
        this.add(this.answers[i]);
    }

    this.game.add.tween(this).to({y: 0}, 1000, Phaser.Easing.Bounce.Out, true);
};
Scoreboard.prototype.answerClicked = function () {
    for(var i = 0; i < this.question.options.length; i++) {
        if(this.answer === this.question.options[i]) {
            if(i == this.question.correct) {
                //correct answer;
                console.log("Yes, thats correct");
            }
            else {
                console.log("ahhh you had the wrong answer");
                //incorrect answer
            }
        }
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
Scoreboard.prototype.startClick = function() {
  this.game.state.start('play');
};
Scoreboard.prototype.update = function() {
  // write your prefab's specific update code here
};

module.exports = Scoreboard;
