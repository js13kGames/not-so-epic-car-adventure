function Entity(x, y, type) {
	var E = this;

	E.x = x;
	E.y = y;
	E.type = type;
	E.destroyed = false;

	switch(type) {
		case 'box':
			E.draw = function() {
				G.ctx.drawImage(G.SPcone, E.x,E.y);
			}
			E.pick = function() {
				P.life -= 1;
				G.sounds.crash.play();
			}
			break;
		case 'coin':
			E.draw = function() {
				G.ctx.drawImage(G.SPcoin, E.x,E.y);
			}
			E.pick = function() {
				if(P.velY == 2) {
					P.score += 45
				} else if(P.velY > 1.5) {
					P.score += 25
				} else {
					P.score += 10
				}
				G.sounds.coin.play();
			}
			break;
		case 'heart':
			E.draw = function() {
				P.ctx.drawImage(P.SPheart, E.x,E.y);
			}
			E.pick = function() {
				if(P.life < 3) {
					G.sounds.heart.play();
					P.life += 1;
				}
			}
			break;
		case 'rock':
			E.draw = function() {
				G.ctx.drawImage(G.SProck, E.x,E.y);
			}
			E.pick = function() {
				P.life -= 1;
				G.sounds.crash.play();
			}
			break;
		case 'powerup':
			E.draw = function() {
				G.ctx.drawImage(G.SPpowerup, E.x,E.y);
			}
			E.pick = function() {
				P.velY = 2;
				G.timers.powerup.timer = 10;
				G.scorestep = G.scorestep * 10 * P.velY;
				G.sounds.powerup.play();

				G.timers.powerup.fn = function() {
					P.velY = 1;
					G.scorestep = 1;
				}
			}
			break;
	}

}