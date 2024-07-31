const Z = 0;
const X = 1;

class ToneMenu {
	constructor(toneList) {
		this.toneIndex = 0;
		this.toneList = toneList;

		//keybind info
		this.held = false;
		this.lastHeld = -1;

		//create container
		this.color = "#ccbaf7";
		this.width = 100 - this.toneList.length * 8;
		this.height = this.width * this.toneList.length;
		this.x = -40;
		this.y = (CANVAS_HEIGHT / 2) - (this.width / 2) * this.toneList.length;

		//lerped container
		this.goalX = -40;
		this.containerVel = 0;
		this.containerAcc = 0;

		//lerped cursor
		this.cX = this.x;
		this.cY = this.y;
		this.colorC = "#f5c690";
		this.goalY = this.cY;
		this.cursorVel = 0;
		this.cursorAcc = 0;

		this.setNewGoalContainer(10);
	}

	getSelected() {
		return this.toneList[this.toneIndex];
	}

	setNewGoalCursor(newGoal) {
		this.goalY = newGoal;
		const dist = this.goalY - this.cY;

		this.cursorVel = dist / 5;
		this.cursorAcc = (Math.abs(dist) / 45) * -Math.sign(this.cursorVel);
	}

	setNewGoalContainer(newGoal) {
		this.goalX = newGoal;
		const dist = this.goalX - this.x;

		this.containerVel = dist / 14;
		this.containerAcc = (Math.abs(dist) / 500) * -Math.sign(this.containerVel);
	}

	updateContainerLerp() {
		this.cX = this.x;
		if (this.goalX !== this.x) {
			this.x += this.containerVel;
			this.containerVel += this.containerAcc;

			console.log(this.x)

			if (Math.abs(this.goalX - this.x) <= 2) {
				//end travel
				this.x = this.goalX;
			}
		}
	}

	updateSelectorBind() {
		//structure where mashing keys will end up moving down only
		if (!this.held) {
			var bareY = this.y + (this.toneIndex) * this.width;

			if (KEYBINDS[88]) {
				//X
				if (this.toneIndex + 1 < this.toneList.length) {
					this.toneIndex++;
					this.held = true;
					this.lastHeld = X;
					this.setNewGoalCursor(bareY + this.width);
				}
			} else if (KEYBINDS[90]) {
				//Z
				if (this.toneIndex - 1 > -1) {
					this.toneIndex--;
					this.held = true;
					this.lastHeld = Z;
					this.setNewGoalCursor(bareY - this.width);
				}
			}
		} else {
			if (!KEYBINDS[88] && this.lastHeld == X) {
				this.held = false;
			} else if (!KEYBINDS[90] && this.lastHeld == Z) {
				this.held = false;
			}
		}
	}

	updateCursor() {
		if (this.goalY !== this.cY) {
			//move to new spot
			this.cY += this.cursorVel;
			this.cursorVel += this.cursorAcc;

			if (Math.abs(this.goalY - this.cY) <= 2) {
				//end travel
				this.cY = this.goalY;
			}
		}
	}

	update() {
		this.updateSelectorBind();
		this.updateCursor();
		this.updateContainerLerp();
	}

	render() {
		ctx.fillStyle = hexToRgbA(this.color, 0.5);
		ctx.strokeStyle = hexToRgbA(this.color, 0.9);
		ctx.lineWidth = 4;

		var fontSize = 1 / this.toneList.length * 220;

		for (var i = 0; i < this.toneList.length; i++) {
			ctx.fillStyle = hexToRgbA(this.color, 0.5);
			ctx.fillRect(this.x, this.y + i * this.width, this.width, this.width);
			ctx.strokeRect(this.x, this.y + i * this.width, this.width, this.width);

			ctx.font = `${fontSize}px UniSansHeavy`;
			ctx.fillStyle = this.color;
			ctx.textAlign = "center";
			ctx.fillText(this.toneList[i].substring(0, 1), this.x + this.width / 2, (this.y + i * this.width) + this.width / 2 + fontSize / 2.8);
		}

		//render cursor
		ctx.shadowBlur = 40;
		ctx.shadowColor = this.colorC;
		ctx.strokeStyle = this.colorC;
		ctx.strokeRect(this.cX, this.cY, this.width, this.width);
		ctx.shadowBlur = 0;
	}
}