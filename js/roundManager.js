/*
	RoundManager shall receieve a certain set of parameters for the type of game that is about to be played.
	I'm writing this here to quite literally remind myself what the round params object is going to be like in case I get lost

	Param Details:
		fallingSpeed -> how fast the bubbles will fall, aka difficulty gouge
		wantOctave -> whether we want to add random octaves into the mix
		maxLives -> how many max lives we will have
		toneRange -> gives range of tones disregarding octaves
		waveCount -> how many waves of bubbles we want to spawn per level, each wave will have more and more bubbles
		levelCount -> how many levels we want to have
		minBubbles -> min amount of bubbles per wave
		maxBubbles -> max amount of bubbles per wave
		minSpawnDelay -> min bubble spawn delay
		maxSpawnDelay -> max bubble spawn delay 
		minSpawnReach -> minimum reach from top of screen that bubbles spawns in
		maxSpawnReach -> maximum reach from top of screen that bubbles spawns in
*/


class RoundManager {
	constructor(settings) {
		//settings
		this.settings = settings;

		//necessities
		this.ongoing = true;
		this.wave = 1;
		this.level = 1;
		this.particles = [];
		this.touchedBubble = 0;
		this.touchFound = false;
		this.bubbles = [];
		this.healthBar;
		this.toneMenu;
		this.sea;

		//properties & other transitions
		this.startCounter = 50;
		this.startDone = false
		this.spawnBubbleMax = randRange(this.settings.minBubbles, this.settings.maxBubbles);
		this.spawnBubbleCount = 0;
		this.spawningIn = true;
		this.spawnCounter = randRange(this.settings.minSpawnDelay, this.settings.maxSpawnDelay);
		this.breakDelay = 0;
		this.finishing = false;
		this.hurtOpacity = 0;

		//level text
		this.levelTextCount = 1;
		this.levelTextOpacity = 0;
		this.pauseCount = 90;
		this.fadeIn = true;
	}

	initializationCare() {
		if (!this.startDone) {
			if (this.startCounter > 0) {
				this.startCounter--;
			} else {
				//initialize only NOW for dramatic effects!
				this.sea = new Sea(700);

				//set up tone menu...
				const toneMenuRange = [];

				for (var i = 0; i < this.settings.toneRange.length; i++) {
					const note = this.settings.toneRange[i].substring(0, 1);

					//double check to see if there's a sharp or flat duplicate, or if there already is a sharp or flat then natural duplicate
					//either way, we are going to use holding shift to determine sharp/flat fluctuation when clicking on the bubbles, so it doesn't matter which comes first
					var skip = false;
					for (var k = 0; k < toneMenuRange.length; k++) {
						const tNote = toneMenuRange[k];

						if (note == tNote) {
							skip = true;
							break;
						}
					}
					if (skip) continue;

					toneMenuRange.push(note);
				}

				this.toneMenu = new ToneMenu(toneMenuRange);
				this.healthBar = new HealthBar(this.settings.maxLives);
				this.startDone = true;
			}
		}
	}

	endRound() {
		this.finishing = true;

		for (var i = 0; i < this.bubbles.length; i++) {
			const bubble = this.bubbles[i];
			bubble.onlyShrink();
		}

		this.healthBar.setNewGoalX(CANVAS_WIDTH + 60);
		this.sea.setNewGoal(800);
		this.toneMenu.setNewGoalContainer(-100);
	}

	spawnBubble() {
		const note = this.settings.toneRange[randRange(0, this.settings.toneRange.length - 1)];
		const rY = randRange(this.settings.minSpawnReach, this.settings.maxSpawnReach);

		if (note.length == 2) {
			//natural note
			const rX = randRange(NATURAL_BUBBLE_RADIUS, CANVAS_WIDTH - NATURAL_BUBBLE_RADIUS);
			this.bubbles.push(new NaturalBubble(rX, rY, note));
		} else {
			//is a sharp or flat
			//will add this in later
		}
	}

	updateRound() {
		if (this.startDone && !this.finishing) {
			if (this.breakDelay == 0) {
				if (!this.spawningIn) {
					//check for whether wave is over
					//if wave is over, check for whether level is over
					if (this.bubbles.length == 0) {
						//defeated this wave, check for whether we finished a level or not
						if (this.wave + 1 > this.settings.waveCount) {
							this.wave = 1;

							//defeated this level, move onto next level
							if (this.level + 1 > this.settings.levelCount) {
								//we finished the game!
								playSound(gameFinish);
								this.endRound();
							} else {
								this.spawningIn = true;
								this.level++;
								this.breakDelay = 200;
							}
						} else {
							playSound(waveBeat);
							this.spawningIn = true;
							this.wave++;
							this.breakDelay = 30;
						}
					}
				} else {
					//spawn in methodically
					if (this.spawnCounter > 0) {
						this.spawnCounter--;
					} else {
						//spawn in a bubble
						this.spawnCounter = randRange(this.settings.minSpawnDelay, this.settings.maxSpawnDelay);

						if (this.spawnBubbleCount < this.spawnBubbleMax) {
							this.spawnBubble();
							this.spawnBubbleCount++;
						} else {
							//reset for next spawn!
							this.spawnBubbleCount = 0;
							this.spawnBubbleMax = randRange(this.settings.minBubbles, this.settings.maxBubbles);
							this.spawningIn = false;
						}
					}
	 			}
			} else {
				this.breakDelay--;
			}
		}
	}

	updateLevelText() {
		if (this.breakDelay > 0 && this.wave == 1) {
			if (this.fadeIn) {
				if (this.levelTextOpacity < 1) {
					this.levelTextOpacity += 0.02;
				} else {
					this.levelTextOpacity = 1;
					if (this.pauseCount > 0) {
						this.pauseCount--;
					} else {
						playSound(levelBeat);
						this.pauseCount = 90;
						this.levelTextCount++;
						this.fadeIn = false;
					}
				}
			} else {
				if (this.levelTextOpacity > 0) {
					this.levelTextOpacity -= 0.02;
				} else {
					this.levelTextOpacity = 0;
				}
			}
		} else {
			this.fadeIn = true;
		}
	}

	finishingCare() {
		if (this.finishing) {
			if (this.sea.y == this.sea.goalHeight && this.toneMenu.x == this.toneMenu.goalX) {
				this.ongoing = false;
			}
		}
	}

	updateLogic() {
		this.initializationCare();
		this.updateRound();
		this.finishingCare();
		this.updateLevelText();
	}

	updateHurt() {
		if (this.hurtOpacity > 0) {
			this.hurtOpacity -= 0.01;
		} else {
			this.hurtOpacity--;
		}
	}

	updateContent() {
		this.touchFound = false;

		for (var i = 0; i < this.particles.length; i++) {
			const particle = this.particles[i];

			if (particle.delete) {
				this.particles.splice(i, 1);
				continue;
			}

			particle.update();
		}

		for (var i = 0; i < this.bubbles.length; i++) {
			const bubble = this.bubbles[i];

			if (bubble.delete) {
				if (bubble.playing) {
					bubbleToneSynth.triggerRelease(Tone.now());
				}

				this.bubbles.splice(i, 1);
				continue;
			}

			if (!this.touchFound) {
				if (bubble.isTouching()) {
					this.touchedBubble = bubble.id;
					this.touchFound = true;
				}
			}

			bubble.update();
		}

		this.healthBar.update();
		this.toneMenu.update();
		this.sea.update();
		this.updateHurt();
	}

	renderLevelText() {
		ctx.shadowBlur = 20;
		ctx.shadowColor = "#c9b5f7";
		ctx.font = "150px UniSansHeavy";
		ctx.fillStyle = hexToRgbA("#c9b5f7", this.levelTextOpacity);
		ctx.textAlign = "center";
		ctx.fillText(`LEVEL ${this.levelTextCount}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
		ctx.shadowBlur = 0;
	}

	renderContent() {
		//render particles
		for (var i = 0; i < this.particles.length; i++) {
			this.particles[i].render();
		}

		//render bubbles
		for (var i = 0; i < this.bubbles.length; i++) {
			this.bubbles[i].render();
		}

		//render sea
		this.sea.render();

		//render tonemenu
		this.toneMenu.render();

		//render healthbar
		this.healthBar.render();

		//render hurt
		ctx.fillStyle = hexToRgbA(DANGER_COLOR, this.hurtOpacity);
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	update() {
		this.updateLogic();

		if (this.ongoing && this.startDone)
			this.updateContent();
	}

	render() {
		this.renderLevelText();
		if (this.ongoing && this.startDone)
			this.renderContent();
	}
}