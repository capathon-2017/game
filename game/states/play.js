
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
