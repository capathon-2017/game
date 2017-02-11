'use strict';

var Pipe = require('./pipe');

var PipeGroup = function(game, parent, speed) {

  Phaser.Group.call(this, game, parent);

  this.topPipe = new Pipe(this.game, 0, -50, 1);
  this.bottomPipe = new Pipe(this.game, 0, 610, 0);
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
  var tightenCave = Math.min(3*difficulty,150);
  this.topPipe.reset(0,-50);
  this.bottomPipe.reset(0,610-tightenCave);
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
