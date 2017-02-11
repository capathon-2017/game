'use strict';


var highscoreContext;

var Highscore = function(game) {
	Phaser.Group.call(this, game);
	this.game = game;
	this.highscore = this.create(this.game.width - 400, 250, 'highscore');
	this.highscore.anchor.setTo(0.5, 0.5); 
	highscoreContext = this;
	this.httpRequest;

	this.highscores = this.game.cache._cache.json.highscores.data.highscores;

	this.y = this.game.height;
	this.x = 0;
};

Highscore.prototype = Object.create(Phaser.Group.prototype);
Highscore.prototype.constructor = Highscore;

Highscore.prototype.show = function(context) {
	context.highscore.visible = true;
	this.context = context;
	this.topMargin = context.highscore.height - 70;
    this.leftMargin = 220;
    this.scores = [];
    this.makeRequest("http://192.168.1.2:3000/highscores");

	this.game.add.button(this.leftMargin + 130, this.game.height - 100, 'endButton', this.end, this);

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
	this.context.score = undefined;
	this.context.resetGame();
}
Highscore.prototype.makeRequest = function (url) {
    this.httpRequest = new XMLHttpRequest();

    if (!this.httpRequest) {
        this.questions = this.game.cache._cache.json.questions.data;
    }
    else {
        this.httpRequest.onreadystatechange = this.processHighscores;
        this.httpRequest.open('GET', url);
        this.httpRequest.send();
    }
}
Highscore.prototype.processHighscores = function () {
  var httpRequest = this;
  if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200) {
      highscoreContext.addHighscores(httpRequest.responseText);
    } else {
      highscoreContext.addHighscores(JSON.stringify(highscoreContext.game.cache._cache.json.highscores.data.highscores));
    }
  }
}
Highscore.prototype.sortHighscores = function (a,b) {
	  if (a.highscore > b.highscore){
	  	return -1;
	  }
	  if (a.highscore < b.highscore) {
	  	return 1;
	  }
	  return 0;
}
Highscore.prototype.addHighscores = function (highscores) {
    var parseJson = JSON.parse(highscores);
    
    for(var i = 0; i < parseJson.length; i++) {
		if(parseJson[i].name === "Karin") {
			parseJson[i].highscore = this.context.score;
		}
	}
	parseJson.sort(this.sortHighscores);
	for(var i = 0; i < parseJson.length; i++) {
		var text;
		text = parseJson[i].name + ": " + parseJson[i].highscore;
		if(i > 0) {
			this.scores[i] = this.game.add.text(this.leftMargin, this.game.width - 720 + (25 * i), text, this.context.style);
		}
		else {
			this.scores[i] = this.game.add.text(this.leftMargin, this.game.width - 725, text, this.context.style);
		}
	}
}
module.exports = Highscore;
