function Game() {
	G = this;

	G.state = 'menu';

	G.canvas = document.getElementById('canvas')
	G.ctx = canvas.getContext('2d')

	G.width = 200;
	G.height = 200;

	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		var scaleX = G.canvas.width / window.innerWidth;
		var scaleY = G.canvas.height / window.innerHeight;
		var scaleToFit = Math.min(scaleX, scaleY);
		 
		G.canvas.style.transformOrigin = "0 0";
		G.canvas.style.transform = "scale("+scaleToFit+")";
	} else {
		G.canvas.style.width = 4*G.width + 'px';
		G.canvas.style.height = 4*G.height + 'px';
	}

	G.setUpAudio()

	G.highscore = localStorage.getItem("highscore") || 0

	G.keys = {};

	G.roadlines = [10, 50, 90, 130, 170, 210];
	G.levelpos = 0;

	G.maxObj = 15;
	G.complexity = 0.04;

	G.BLOCK_WIDTH = 8
  	G.LEVEL_HEIGHT = 180

  	G.objects = [];
  	G.scoreclock = 0;
  	G.scorestep = 1;
  	G.texttodraw = '';

  	G.timers = {
  		powerup: {
  			timer: 0,
  			fn: function() {}
  		},
  		text: {},
  		speed1: {
  			timer: 20,
  			fn: function() {
  				P.velY += 0.2;
  				G.maxObj = 18;
  				G.complexity = 0.06;
  			}
  		},
  		speed2: {
  			timer: 60,
  			fn: function() {
  				P.velY += 0.2;
  				G.maxObj = 23;
  				G.complexity = 0.06;
  			}
  		},
  		speed3: {
  			timer: 90,
  			fn: function() {
  				P.velY += 0.3;
  				G.maxObj = 25;
  				G.complexity = 0.09;
  			}
  		},
  		speed4: {
  			timer: 120,
  			fn: function() {
  				P.velY += 0.2;
  				G.maxObj = 30;
  				G.complexity = 0.1;
  			}
  		}
  	};

  	G.events = {
  		roadblock: {
  			been: true,
  			timer: 15,
  			timer_or: 15
  		},
  		coins: {
  			been: true,
  			timer: 45,
  			timer_or: 45
  		}
  	}

	G.SPgrass = new Image()
	G.SPgrass.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAACVBMVEVBhStauzqJ3G6gHPROAAAAWklEQVR4AaWRwQmAQADD0u4/tD4UQsWHWBA8AzFw5B49p2NMfIreiYH3BcCLqoV2gWMNHCsAz1jImP1HG+wdM9dTm10931WNBa7GAldjgWfBAgv+X5SbF+xVHZvHAjfhtX7bAAAAAElFTkSuQmCC'
	G.SPgrass.pattern = G.ctx.createPattern(G.SPgrass, 'repeat')

	G.SPcone = new Image()
	G.SPcone.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAAD1BMVEXjXAP////jXAP/ZgD////tSXUAAAAAAnRSTlMAAHaTzTgAAAAoSURBVAgdBcGBAQAgDAIgdP+/nEFCPcpxJBXzLoKtOlZpgu0CJhTPB2L/CxttYKG3AAAAAElFTkSuQmCC'

	G.SPcoin = new Image()
	G.SPcoin.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAAFVBMVEXOsRP////OsRPquiz0xDP8/HX/zDMhE5hzAAAAAnRSTlMAAHaTzTgAAAAqSURBVAjXXcaxAcAgDAMwiwT/fzJDt2pS0CK0LTF7bytm+4vZXYJz8gU8HJYAsrhSVWQAAAAASUVORK5CYII='

	G.SProck = new Image()
	G.SProck.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAAHlBMVEUAcrw9Wk9UXVlUZ2D///89Wk9UXVlUZ2BZaGdyeHbYgpACAAAABXRSTlMAAAAAAMJrBrEAAAAvSURBVAgdBcEBDoAgEAOwbl6C/38vgm3GXuzv6V56q95EmeDSBsQ46khqsG8G8AOvYgov5/u+sQAAAABJRU5ErkJggg=='

	G.SPpowerup = new Image()
	G.SPpowerup.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAAGFBMVEVSVHVpa5aDhbT///8m4dJSVHVpa5aDhbSGVF3/AAAABHRSTlMAAAAAs5NmmgAAACtJREFUeAEVxsEBgAAIw0C0puy/seFeNwmaTPiEKarZai/n0lUNrpgHvfkBKj4BNUGaDOoAAAAASUVORK5CYII='

	document.body.addEventListener("keydown", function (e) {
		G.keys[e.keyCode] = true;
	});

	document.body.addEventListener("keyup", function (e) {
		G.keys[e.keyCode] = false;
	});

	document.getElementById('r').addEventListener("touchstart", function (e) {
		G.keys[39] = true;
	});

	document.getElementById('r').addEventListener("touchend", function (e) {
		G.keys[39] = false;
	});

	document.getElementById('l').addEventListener("touchstart", function (e) {
		G.keys[37] = true;
	});

	document.getElementById('l').addEventListener("touchend", function (e) {
		G.keys[37] = false;
	});

}

Game.prototype = {
	constructor: Game,
	setUpAudio: function() {
		G.sounds = {};
		
		G.sounds.crash = new Audio();
		G.sounds.crash.src = jsfxr([3,,0.32,,0.18,0.7103,,-0.4177,,,,-0.16,,,,,,,1,,,0.24,,0.38]);

		G.sounds.powerup = new Audio();
		G.sounds.powerup.src = jsfxr([1,0.14,0.32,0.07,0.54,0.14,,0.1822,,,,,,0.0136,,,-0.56,-0.26,0.44,,,,,0.24]);

		G.sounds.coin = new Audio();
		G.sounds.coin.src = jsfxr([0,,0.0137,0.547,0.3928,0.4569,,,,,,0.4972,0.6884,,,,,,1,,,,,0.24]);		

		G.sounds.heart = new Audio();
		G.sounds.heart.src = jsfxr([0,,0.25,,0.3326,0.2065,,0.4065,,,,,,0.4386,,0.5992,,,1,,,,,0.24]);
	},
	update: function(dt) {	
		G.scoreclock += dt;

		if(P.life == 0) {
			G.gameover();
		}

		if(P.velY < 1) {
			P.velY += 0.01;
		}

		if(G.scoreclock >= 1000) {
			G.scoreclock = 0;
			player.score += G.scorestep;

			if(G.timer && G.timer > 0) {
				G.timer -= 1;
				if(G.timer == 0) {
					G.timer_fn();
					G.timer = undefined;
					G.timer_fn = function() {};
				}
			}

			var keys = Object.keys(G.timers)

			for (var i = keys.length - 1; i >= 0; i--) {
				if(G.timers[keys[i]].timer && G.timers[keys[i]].timer > 0) {
					G.timers[keys[i]].timer -= 1;
					if(G.timers[keys[i]].timer == 0) {
						G.timers[keys[i]].fn();
						G.timers[keys[i]].timer = 0;
						G.timers[keys[i]].fn = function() {};
					}
				}
			};

			var keys = Object.keys(G.events)

			for (var i = keys.length - 1; i >= 0; i--) {
				if(G.events[keys[i]].been && G.events[keys[i]].timer > 0) {
					G.events[keys[i]].timer -= 1;
					if(G.events[keys[i]].timer == 0) {
						G.events[keys[i]].been = false;
						G.events[keys[i]].timer = G.events[keys[i]].timer_or
					}
				}
			};
		}

		if(G.highscore && P.newhighscore && P.score > G.highscore) {
			G.addtext('NEW HIGH SCORE!', 2);
			P.newhighscore = false;
		}

		if(Math.random() < G.complexity && G.objects.length < G.maxObj) {
			if(Math.random() < 0.3) {
				G.objects.push(new Entity(util.rand(10, G.width-10), G.height, 'coin'))
			} else {
				if(Math.random() < 0.5) {
					G.objects.push(new Entity(util.rand(50, G.width-50), G.height, 'box'))
				}
				else {
					if(Math.random() < 0.5)
						G.objects.push(new Entity(util.rand(10, 50), G.height, 'rock'))
					else 
						G.objects.push(new Entity(util.rand(150, G.width-10), G.height, 'rock'))
				}
			}
		}

		if(Math.random() < 0.005 && G.objects.length < G.maxObj && P.life < 3) {
			G.objects.push(new Entity(util.rand(10, G.width-10), G.height, 'heart'))
		}

		if(Math.random() < 0.001 && G.objects.length < G.maxObj) {
			G.objects.push(new Entity(util.rand(10, G.width-10), G.height, 'powerup'))
		}

		if(!G.events.roadblock.been && Math.random() < 0.001) {
			G.addtext('ROADBLOCK!', 2)
			G.objects.push(new Entity(55, G.height, 'box'))
			G.objects.push(new Entity(75, G.height, 'box'))
			G.objects.push(new Entity(95, G.height, 'box'))
			G.objects.push(new Entity(115, G.height, 'box'))
			G.objects.push(new Entity(135, G.height, 'box'))
			G.events.roadblock.been = true;
		}

		if(!G.events.coins.been && Math.random() < 0.001) {
			G.addtext('COINS!', 2)
			for (var i = 0; i < 20; i++) {
				G.objects.push(new Entity(util.rand(10, G.width-10), util.rand(G.height, G.height+20), 'coin'))
			};
			G.events.coins.been = true;
		}


		for (var i = G.roadlines.length - 1; i >= 0; i--) {
			G.roadlines[i] -= player.velY;
			if(G.roadlines[i] <= -40)
				G.roadlines[i] = G.height
		};

		if(G.levelpos > -G.height) {
			G.levelpos -= player.velY
		} else {
			G.levelpos = Math.abs( -G.height - G.levelpos) - 32
		}
	},
	draw: function() {
		var ctx = G.ctx;

		ctx.clearRect(0, 0, G.width, G.height);

		ctx.save()

		ctx.translate(0, 1*G.levelpos);
		ctx.fillStyle = G.SPgrass.pattern
		ctx.fillRect(0,0, G.width, 2*G.height)
		ctx.restore()

		ctx.fillStyle = 'grey'
		ctx.fillRect(50, 0, G.width-100, G.height)

		ctx.fillStyle = 'yellow'
		ctx.fillRect(G.width/2 - 1.5, G.roadlines[0], 3, 20)
		ctx.fillRect(G.width/2 - 1.5, G.roadlines[1], 3, 20)
		ctx.fillRect(G.width/2 - 1.5, G.roadlines[2], 3, 20)
		ctx.fillRect(G.width/2 - 1.5, G.roadlines[3], 3, 20)
		ctx.fillRect(G.width/2 - 1.5, G.roadlines[4], 3, 20)
		ctx.fillRect(G.width/2 - 1.5, G.roadlines[5], 3, 20)

		for (var i = G.objects.length - 1; i >= 0; i--) {
			G.objects[i].y -= player.velY;
			if(G.objects[i].y < -G.BLOCK_WIDTH) {
				G.objects.splice(i, 1)
			}
			if(G.objects[i]) G.objects[i].draw()
		};
		if(G.texttodraw) {
			ctx.fillStyle = "white";
			ctx.textAlign = "center"; 
			ctx.fillText(G.texttodraw, G.width/2, G.height/2);
			ctx.textAlign = "left"; 
		}
	},
	gameover: function() {
		G.state = 'gameover';
		if(P.score > parseInt(G.highscore)) {
			localStorage.setItem("highscore", P.getScore());
			G.highscore = P.getScore();
		}
	},
	drawmenu: function() {
		var ctx = G.ctx;

		var lingrad = ctx.createLinearGradient(0,0,0,150);
		lingrad.addColorStop(0, '#7a21a5');
		lingrad.addColorStop(1, '#4a3355');

		ctx.fillStyle = lingrad;
		ctx.fillRect(0,0,G.height,G.width);


 		ctx.fillStyle = "white";
 		ctx.textAlign = "center"; 

 		ctx.fillText("NOT SO EPIC", G.width/2, 10);
 		ctx.fillText("REVERSE", G.width/2, 20);
 		ctx.fillText("CAR", G.width/2, 30);
 		ctx.fillText("ADVENTURE", G.width/2, 40);

		if(G.highscore) {
	 		ctx.fillText("HIGHSCORE", G.width/2, G.height - 40);
	 		ctx.fillText(G.highscore, G.width/2, G.height - 20);
	 	}
 		 
		ctx.fillText("PRESS <SPACE> TO START", G.width/2, G.height/2);
	},
	drawgameover: function() {
		var ctx = G.ctx;

		var lingrad = ctx.createLinearGradient(0,0,0,150);
		lingrad.addColorStop(0, '#7a21a5');
		lingrad.addColorStop(1, '#4a3355');

		ctx.fillStyle = lingrad;
		ctx.fillRect(0,0,G.height,G.width);


 		ctx.fillStyle = "white";
 		ctx.textAlign = "center"; 

 		ctx.fillText("SCORE", G.width/2, 40);
 		ctx.fillText(P.getScore(), G.width/2, 55);
 		
 		ctx.fillText("PRESS <SPACE> TO TRY AGAIN", G.width/2, G.height/2);

		cancelAnimationFrame(G.loop);
	},
	loop: function(){
		var now = Date.now()
	    var dt = now - G.lastUpdate;
	    G.lastUpdate = now;

	    switch(G.state) {
	    	case 'menu':
	    		G.drawmenu()
	    		requestAnimationFrame(G.loop);
	    	break;
	    	case 'game':
	    		G.update(dt);
	    		player.update(dt);
	    		G.draw();
	    		player.draw();
	    		requestAnimationFrame(G.loop);
	    	break;
	    	case 'gameover':
	    		G.drawgameover()
	    		cancelAnimationFrame(G.loop);
	    	break;

	    }

	},
	addtext: function(text, t) {
		G.texttodraw = text;
		G.timers.text.timer = t;
		G.timers.text.fn = function() {
			G.texttodraw = '';
		}
	}

}