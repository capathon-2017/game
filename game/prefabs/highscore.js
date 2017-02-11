'use strict';

var Highscore = function(game) {
	Phaser.Group.call(this, game);
	this.game = game;
	this.highscore = this.create(this.game.width - 400, 300, 'highscore');
	this.highscore.anchor.setTo(0.5, 0.5); 

	this.highscores = this.game.cache._cache.json.highscores.data.highscores;

	this.y = this.game.height;
	this.x = 0;
};

Highscore.prototype = Object.create(Phaser.Group.prototype);
Highscore.prototype.constructor = Highscore;

Highscore.prototype.show = function(context) {
	context.highscore.visible = true;
	this.topMargin = context.highscore.height - 70;
    this.leftMargin = 220;
    this.scores = [];

	for(var i = 0; i < this.highscores.length; i++) {
		var offset = 2.1 - (i * 0.20);
		var text = this.highscores[i].user + ": " + this.highscores[i].score;
		if(i > 0) {
			this.scores[i] = this.game.add.text(this.leftMargin, this.game.width - 720 + (25 * i), text, this.style);
		}
		else {
			this.scores[i] = this.game.add.text(this.leftMargin, this.game.width - 725, text, this.style);
		}
	}

	 this.game.add.button(this.leftMargin + 130, this.game.width - 350, 'startButton', this.end, this);

    this.game.add.tween(this).to({y: 0}, 1000, Phaser.Easing.Bounce.Out, true);
};
Highscore.prototype.makeTextBold = function (item) {
   item.fontWeight = "bold";
   item.fontSize = 20;
   item.font = "Arial";
};
Highscore.prototype.makeTextNormal = function (item) {
   item.fontWeight = "normal";
   item.fontSize = 20;
   item.font = "Arial";
};
Highscore.prototype.end = function () {
}
module.exports = Highscore;
