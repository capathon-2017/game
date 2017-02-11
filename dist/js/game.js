(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';


var BootState = require('./states/boot');
var MenuState = require('./states/menu');
var PlayState = require('./states/play');
var PreloadState = require('./states/preload');

var game = new Phaser.Game(800, 500, Phaser.AUTO, 'wildcard');

// Game States
game.state.add('boot', BootState);
game.state.add('menu', MenuState);
game.state.add('play', PlayState);
game.state.add('preload', PreloadState);


game.state.start('boot');

  
},{"./states/boot":8,"./states/menu":9,"./states/play":10,"./states/preload":11}],2:[function(require,module,exports){
'use strict';

var Bird = function(game, x, y, frame) {
  Phaser.Sprite.call(this, game, x, y, 'bird', frame);
  this.anchor.setTo(0.5, 0.5);
  this.animations.add('flap');
  this.animations.play('flap', 12, true);

  this.flapSound = this.game.add.audio('flap');

  this.name = 'bird';
  this.alive = false;
  this.onGround = false;

  // enable physics on the bird
  // and disable gravity on the bird
  // until the game is started
  this.game.physics.arcade.enableBody(this);
  this.body.allowGravity = false;
  this.body.collideWorldBounds = true;


  this.events.onKilled.add(this.onKilled, this);
};

Bird.prototype = Object.create(Phaser.Sprite.prototype);
Bird.prototype.constructor = Bird;

Bird.prototype.update = function() {
  // check to see if our angle is less than 90
  // if it is rotate the bird towards the ground by 2.5 degrees
  if(this.angle < 90 && this.alive) {
    this.angle += 2.5;
  }

  if(!this.alive) {
    this.body.velocity.x = 0;
  }
};

Bird.prototype.flap = function() {
  if(!!this.alive) {
    this.flapSound.play();
    //cause our bird to "jump" upward
    this.body.velocity.y = -100;
    // rotate the bird to -40 degrees
    this.game.add.tween(this).to({angle: -40}, 100).start();
  }
};

Bird.prototype.revived = function() {
};

Bird.prototype.onKilled = function() {
  this.exists = true;
  this.visible = true;
  //this.animations.stop();
};

module.exports = Bird;


},{}],3:[function(require,module,exports){
'use strict';

var Ground = function(game, x, y, width, height) {
  Phaser.TileSprite.call(this, game, x, y, width, height, 'ground');
  // start scrolling our ground
  this.autoScroll(-200,0);
  
  // enable physics on the ground sprite
  // this is needed for collision detection
  this.game.physics.arcade.enableBody(this);
      
  // we don't want the ground's body
  // to be affected by gravity or external forces
  this.body.allowGravity = false;
  this.body.immovable = true;


};

Ground.prototype = Object.create(Phaser.TileSprite.prototype);
Ground.prototype.constructor = Ground;

Ground.prototype.update = function() {
  
  // write your prefab's specific update code here
  
};

module.exports = Ground;
},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

var Pipe = function(game, x, y, frame) {
  Phaser.Sprite.call(this, game, x, y, 'ground_pipe', frame);
  this.anchor.setTo(0.5, 0.5);
  this.game.physics.arcade.enableBody(this);

  this.body.allowGravity = false;
  this.body.immovable = true;
  
};

Pipe.prototype = Object.create(Phaser.Sprite.prototype);
Pipe.prototype.constructor = Pipe;

Pipe.prototype.update = function() {
  // write your prefab's specific update code here
  
};

module.exports = Pipe;
},{}],6:[function(require,module,exports){
'use strict';

var Pipe = require('./pipe');

var PipeGroup = function(game, parent, speed) {

  Phaser.Group.call(this, game, parent);

  this.topPipe = new Pipe(this.game, 0, -50, 1);
  this.bottomPipe = new Pipe(this.game, 0, 620, 0);
  this.add(this.topPipe);
  this.add(this.bottomPipe);
  this.hasScored = false;

  this.setAll('body.velocity.x', speed);
};

PipeGroup.prototype = Object.create(Phaser.Group.prototype);
PipeGroup.prototype.constructor = PipeGroup;

PipeGroup.prototype.update = function() {
  this.checkWorldBounds();
};

PipeGroup.prototype.checkWorldBounds = function() {
  if(!this.topPipe.inWorld) {
    this.exists = false;
  }
};

PipeGroup.prototype.reset = function(x, y, difficulty, speed) {
  var tightenCave = Math.min(3*difficulty,80);
  this.topPipe.reset(0,-50);
  this.bottomPipe.reset(0,620-tightenCave);
  this.x = x;
  this.y = y;
  this.setAll('body.velocity.x', speed);
  this.hasScored = false;
  this.exists = true;
};


PipeGroup.prototype.stop = function() {
  this.setAll('body.velocity.x', 0);
};

PipeGroup.prototype.updateSpeed = function(speed) {
  this.setAll('body.velocity.x', speed);
}

module.exports = PipeGroup;

},{"./pipe":5}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', 'assets/preloader.gif');
  },
  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],9:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {

  },
  create: function() {
    // add the background sprite
    this.background = this.game.add.sprite(0,0,'background');

    // add the ground sprite as a tile
    // and start scrolling in the negative x direction
    //this.ground = this.game.add.tileSprite(0,488,1000,112,'ground');
    //this.ground.autoScroll(-200,0);

    /** STEP 1 **/
    // create a group to put the title assets in
    // so they can be manipulated as a whole
    this.titleGroup = this.game.add.group();

    /** STEP 2 **/
    // create the title sprite
    // and add it to the group
    this.title = this.add.sprite(0,0,'title');
    this.titleGroup.add(this.title);

    /** STEP 3 **/
    // create the bird sprite
    // and add it to the title group
    //this.bird = this.add.sprite(200,5,'bird');
    //this.titleGroup.add(this.bird);

    /** STEP 4 **/
    // add an animation to the bird
    // and begin the animation
    //this.bird.animations.add('flap');
    //this.bird.animations.play('flap', 12, true);

    /** STEP 5 **/
    // Set the originating location of the group
    this.titleGroup.x = 275;
    this.titleGroup.y = 100;

    /** STEP 6 **/
    //  create an oscillating animation tween for the group
    this.game.add.tween(this.titleGroup).to({y:115}, 350, Phaser.Easing.Linear.NONE, true, 0, 1000, true);

    // game speed
    this.game.speed = -200;

    // add our start button with a callback
    this.startButton = this.game.add.button(this.game.width/2, 300, 'startButton', this.startClick, this);
    this.startButton.anchor.setTo(0.5,0.5);
  },
  startClick: function() {
    // start button click handler
    // start the 'play' state
    this.game.state.start('play');
  }
};

module.exports = Menu;

},{}],10:[function(require,module,exports){

'use strict';
var Bird = require('../prefabs/bird');
var Ground = require('../prefabs/ground');
var Pipe = require('../prefabs/pipe');
var PipeGroup = require('../prefabs/pipeGroup');
var Scoreboard = require('../prefabs/scoreboard');
var Highscore = require('../prefabs/highscore');

function Play() {
}
Play.prototype = {
  create: function() {
    // start the phaser arcade physics engine
    this.game.physics.startSystem(Phaser.Physics.ARCADE);


    // give our world an initial gravity of 1200
    this.game.physics.arcade.gravity.y = 600;

    // add the background sprite
    this.background = this.game.add.sprite(0,0,'background');

    // create and add a group to hold our pipeGroup prefabs
    this.pipes = this.game.add.group();

    // create and add a new Bird object
    this.bird = new Bird(this.game, 100, this.game.height/2);
    this.game.add.existing(this.bird);

    // create and add a new Ground object
    // this.ground = new Ground(this.game, 0, 488, 1000, 112);
    // this.game.add.existing(this.ground);


    // add keyboard controls
    this.flapKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.flapKey.onDown.addOnce(this.startGame, this);
    this.flapKey.onHoldCallback = this.bird.flap;
    this.flapKey.onHoldContext = this.bird;

    // keep the spacebar from propogating up to the browser
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

    if(this.score === undefined) {
        this.score = 0;
    }
    this.scoreText = this.game.add.bitmapText(this.game.width/2, 10, 'flappyfont',this.score.toString(), 24);

    this.instructionGroup = this.game.add.group();
    this.instructionGroup.add(this.game.add.sprite(this.game.width/2, 100,'getReady'));
    //this.instructionGroup.add(this.game.add.sprite(this.game.width/2, 325,'instructions'));
    this.instructionGroup.setAll('anchor.x', 0.5);
    this.instructionGroup.setAll('anchor.y', 0.5);

    this.pipeGenerator = null;

    this.gameover = false;

    this.pipeHitSound = this.game.add.audio('pipeHit');
    this.groundHitSound = this.game.add.audio('groundHit');
    this.scoreSound = this.game.add.audio('score');

    this.previousCenter = 0;
    this.changeY = 0;
    this.difficultyLevel = 0;
    this.game.speedUpdater = null;

  },

  update: function() {
    // not enable collisions between the bird and the ground
    // this.game.physics.arcade.collide(this.bird, this.ground, this.deathHandler, null, this);

    if(!this.gameover) {
        // enable collisions between the bird and each group in the pipes group
        this.pipes.forEach(function(pipeGroup) {
            this.checkScore(pipeGroup);
            this.game.physics.arcade.collide(this.bird, pipeGroup, this.deathHandler, null, this);
        }, this);
    }
  },
  shutdown: function() {
    this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
    this.bird.destroy();
    this.pipes.destroy();
    this.scoreboard.destroy();
  },
  startGame: function() {
    if(!this.bird.alive && !this.gameover) {
        this.bird.body.allowGravity = true;
        this.bird.alive = true;
        // add a timer : fluid: 0.20 * second
        this.pipeGenerator = this.game.time.events.loop((Phaser.Timer.SECOND * 20) / Math.abs(this.game.speed), this.generatePipes, this);
        this.pipeGenerator.timer.start();

        this.game.speedUpdater = this.game.time.events.loop(Phaser.Timer.SECOND * 5, this.updateSpeed, this);
        this.game.speedUpdater.timer.start();

        this.instructionGroup.destroy();
    }
  },
  checkScore: function(pipeGroup) {
    if(pipeGroup.exists && !pipeGroup.hasScored && pipeGroup.topPipe.world.x <= this.bird.world.x) {
        pipeGroup.hasScored = true;
        this.score++;
        this.scoreText.setText(this.score.toString());
        this.scoreSound.play();
    }
  },
  deathHandler: function(bird, enemy) {
    this.game.physics.arcade.gravity.y = 0;
    this.groundHitSound.play();
    this.scoreboard = new Scoreboard(this.game, this);
    this.game.add.existing(this.scoreboard);
    this.scoreboard.show(this.score);

    this.highscore = new Highscore(this.game);
    this.highscore.visible = false;
    this.game.add.existing(this.highscore);

    if(!this.gameover) {
        this.gameover = true;
        this.bird.kill();
        this.pipes.callAll('stop');
        this.pipeGenerator.timer.stop();
        // this.ground.stopScroll();
    }

  },
  generatePipes: function() {
    this.difficultyLevel = Math.min(70,(Math.floor(this.score/50))); //max level is 50
    // Difficulty decides on max slope
    var maxVar = this.calculateMaxVar(this.score, this.difficultyLevel);

    // Random slope calculation
    var randomChange = this.game.rnd.integerInRange(-maxVar, maxVar);
    var trend = this.changeY + randomChange;

    //Dampen the change
    var newChangeY = Math.sign(trend)*Math.sqrt(Math.abs(trend));

    var newPipeY = this.previousCenter + this.changeY;

    if(newPipeY >= 60) {
        newPipeY = 60; // bound to the max
        trend = -5; //reverse the trend
    } else if(newPipeY <= -120){
        newPipeY = -120; // bound to the max
        trend = 5; //reverse the trend
    }

    // Garbage collector (from original git)
    var pipeGroup = this.pipes.getFirstExists(false);
    //this.pipes.foreach()
    if(!pipeGroup) {
        pipeGroup = new PipeGroup(this.game, this.pipes, this.game.speed);
    }
    pipeGroup.reset(this.game.width, newPipeY, this.difficultyLevel, this.game.speed);


    if(this.pipes.length > 100){ 
        var pipeGroup = this.pipes.getFirstExists(false);
        if(pipeGroup){
            pipeGroup.destroy();
        }
    }

    //Update variables
    this.previousCenter = newPipeY;
    this.changeY = newChangeY;

  },

  calculateMaxVar: function(current_score, difficulty){
    var maxVar = 100+10*(difficulty);
    return maxVar;
  },
  resetGame: function (addScore) {
    if(addScore){
        this.score = this.score + addScore;
    }
    this.create();
    this.startGame();
    //this.pipes.destroy();
  },
  updateSpeed: function() {
    this.game.speed -= 10;
    console.log('speed: ' + this.game.speed);
    this.pipes.callAll('updateSpeed', null, this.game.speed);
    this.pipeGenerator.delay = (Phaser.Timer.SECOND * 20) / Math.abs(this.game.speed);
  }
};

module.exports = Play;

},{"../prefabs/bird":2,"../prefabs/ground":3,"../prefabs/highscore":4,"../prefabs/pipe":5,"../prefabs/pipeGroup":6,"../prefabs/scoreboard":7}],11:[function(require,module,exports){
'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.image('background', 'assets/background_blue.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('title', 'assets/title.png');
    this.load.spritesheet('bird', 'assets/bat.png', 44,28,3);
    // this.load.spritesheet('bird', 'assets/bird.png', 34,24,3);
    this.load.spritesheet('pipe', 'assets/pipes.png', 108,320,2);

    this.load.spritesheet('ground_pipe', 'assets/ground_pipe.png', 74,400,2);
    this.load.image('startButton', 'assets/start-button.png');

    this.load.image('instructions', 'assets/instructions.png');
    this.load.image('getReady', 'assets/get-ready_new.png');

    this.load.image('scoreboard', 'assets/scoreboard.png');
    this.load.image('particle', 'assets/particle.png');
    this.load.image('highscore', 'assets/highscore.png');
    this.load.image('continueButton', 'assets/continue-button.png');
    this.load.image('endButton', 'assets/end-button.png');


    this.load.audio('flap', 'assets/flap.wav');
    this.load.audio('pipeHit', 'assets/pipe-hit.wav');
    this.load.audio('groundHit', 'assets/ground-hit.wav');
    this.load.audio('score', 'assets/score.wav');
    this.load.audio('ouch', 'assets/ouch.wav');

    this.load.bitmapFont('flappyfont', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');

    this.load.json('questions', 'assets/questions.json');
    this.load.json('highscores', 'assets/highscoresmock.json');

  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('menu');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}]},{},[1])