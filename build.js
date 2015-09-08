(function(){

var requestAnimFrame = (function(){
	return window.requestAnimationFrame    ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		window.oRequestAnimationFrame      ||
		window.msRequestAnimationFrame     ||
		function(callback){
			window.setTimeout(callback, 1000 / 60);
		};
})();

var util = {
	rotatePoint: function(pivot, point, angle) {
	  var x = Math.round((Math.cos(angle) * (point.x - pivot.x)) -
	                     (Math.sin(angle) * (point.y - pivot.y)) +
	                     pivot.x),
	      y = Math.round((Math.sin(angle) * (point.x - pivot.x)) +
	                     (Math.cos(angle) * (point.y - pivot.y)) +
	                     pivot.y);
	  return {'x': x, 'y': y};
	},
	rand: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	doPolygonsIntersect: function(a, b) {
		function isUndefined(a) {
			return typeof a == 'undefined'
		} 

	    var polygons = [a, b];
	    var minA, maxA, projected, i, i1, j, minB, maxB;

	    for (i = 0; i < polygons.length; i++) {
	        var polygon = polygons[i];
	        for (i1 = 0; i1 < polygon.length; i1++) {

	            var i2 = (i1 + 1) % polygon.length;
	            var p1 = polygon[i1];
	            var p2 = polygon[i2];

	            var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

	            minA = maxA = undefined;
	            for (j = 0; j < a.length; j++) {
	                projected = normal.x * a[j].x + normal.y * a[j].y;
	                if (isUndefined(minA) || projected < minA) {
	                    minA = projected;
	                }
	                if (isUndefined(maxA) || projected > maxA) {
	                    maxA = projected;
	                }
	            }

	            minB = maxB = undefined;
	            for (j = 0; j < b.length; j++) {
	                projected = normal.x * b[j].x + normal.y * b[j].y;
	                if (isUndefined(minB) || projected < minB) {
	                    minB = projected;
	                }
	                if (isUndefined(maxB) || projected > maxB) {
	                    maxB = projected;
	                }
	            }

	            if (maxA < minB || maxB < minA) {
	                return false;
	            }
	        }
	    }
	    return true;
	}
}

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
			}
			break;
		case 'coin':
			E.draw = function() {
				G.ctx.drawImage(G.SPcoin, E.x,E.y);
			}
			E.pick = function() {
				P.score += 10 * P.velY;
			}
			break;
		case 'heart':
			E.draw = function() {
				P.ctx.drawImage(P.SPheart, E.x,E.y);
			}
			E.pick = function() {
				if(P.life < 3) P.life += 1;
			}
			break;
		case 'rock':
			E.draw = function() {
				G.ctx.drawImage(G.SProck, E.x,E.y);
			}
			E.pick = function() {
				P.life -= 1;
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

				G.timers.powerup.fn = function() {
					P.velY = 1;
					G.scorestep = 1;
				}
			}
			break;
	}

}

function Game() {
	G = this;

	G.canvas = document.getElementById('canvas')
	G.ctx = canvas.getContext('2d')

	G.width = 200;
	G.height = 200;
	G.keys = {};

	G.roadlines = [10, 50, 90, 130, 170, 210];
	G.levelpos = 0;

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
  		text: {}
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
	update: function(dt) {	
		G.scoreclock += dt;

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


		if(Math.random() < 0.05 && G.objects.length < 10) {
			if(Math.random() < 0.3) {
				G.objects.push(new Entity(util.rand(10, G.width-10), G.height, 'coin'))
			} else {
				if(Math.random() < 0.5) {
					G.objects.push(new Entity(util.rand(50, G.width-100), G.height, 'box'))
				}
				else {
					if(Math.random() < 0.5)
						G.objects.push(new Entity(util.rand(10, 50), G.height, 'rock'))
					else 
						G.objects.push(new Entity(util.rand(150, G.width-10), G.height, 'rock'))
				}
			}
		}

		if(Math.random() < 0.005 && G.objects.length < 10 && P.life < 3) {
			G.objects.push(new Entity(util.rand(10, G.width-10), G.height, 'heart'))
		}

		if(Math.random() < 0.001 && G.objects.length < 10) {
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
			ctx.fillText(G.texttodraw, G.width/2, G.height/2);
		}
	},
	loop: function(){
		var now = Date.now()
	    var dt = now - G.lastUpdate;
	    G.lastUpdate = now;

		G.update(dt);
		player.update(dt);
		G.draw();
		player.draw();
		requestAnimationFrame(G.loop);
	},
	addtext: function(text, t) {
		G.texttodraw = text;
		G.timers.text.timer = t;
		G.timers.text.fn = function() {
			G.texttodraw = '';
		}
	}

}


function Player (){
	P = this;

	P.ctx = game.ctx;
	P.width = 18;
	P.height = 18;
	P.speed = 3;
	P.velX = 1;
	P.velY = 1;
	P.angle = 0;
	P.score = 0;
	P.life = 3;

	P.x = game.width/2 - P.width/2;
	P.y = 20;

	P.SPheart = new Image()
	P.SPheart.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAAe1BMVEXuHB/uHSDuICTuISXuIibuGhzuICTuICTuIifuHyPuICTuICTuFxjuICTuICTuIifuFRXuICTuICTuGhruICTuGRvuICTuGRvuHyPuICTuGhvuICTuICTuOEXuGRvuICTuHyPtRljtRlnuGBnuGRruICTuISXuIibuN0V5/FO4AAAAIXRSTlMAAAAAAAkJLS0zMzg+PkhISkpihITU1NnZ6erq7Ozz8/6VymORAAAAR0lEQVQI1wXB2wqAIBAFwONeEpOI6P9/sQeR0nVhm2HotXB7UKpZNFdIPeRMe3IpujFFMTJfbLDBPlm5Py9hNqANMMHj68APz9UZKDGgJnsAAAAASUVORK5CYII='

	P.SPcar = new Image();
	P.SPcar.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAgCAMAAAAootjDAAAAMFBMVEX///////8AAAAHJNgwJTQ+MThgBQemExjILjDMMzPMZmbrSUnxZ2j2+oL4goP9/8RCMSjcAAAAAnRSTlMABHH+CSEAAACZSURBVHjarc9BEgMhCERRYxxJixPvf9v0MGDIPn8h1KtyQbG6V6JzLbHWOp3w2sF/QXfoN6nO+WZzqt4EBcWMa9Db2yRfkk1wyVStRJTGaIkOK0g4h8dVKKVn6oVGqmM82RiVVILYL7lkMvkfsUwtqDlBJEjibKBVu7oBiaxEiuOSA+oklzEbUtzUCyldACof6ZsipwctMvkAX6gN1CyP3dQAAAAASUVORK5CYII=';
}

Player.prototype = {
	constructor: Player,
	getScore: function() {
		return ('000000000' + P.score).substr(-5); 
	},
	draw: function() {
		var ctx = game.ctx

		ctx.save();
		ctx.translate(P.x + P.width/2, P.y + P.height);
		ctx.rotate(Math.PI/180 * P.angle);
		ctx.drawImage(P.SPcar, -P.width/2, -P.height);
		ctx.restore();

	 	ctx.save()
	 	// ctx.scale(0.5, 0.5);
	 	for (var i = 0; i < P.life; i++) {
	 		ctx.drawImage(P.SPheart, i*12 + 3, 1);
	 	};
	 	ctx.restore();

	 	ctx.fillStyle = "white";
	 	ctx.fillText(P.getScore(), canvas.width - 30, 10);
	},
	update: function(dt) {
		
		if(P.velY < 1) {
			P.velY += 0.002;
		}

		if((game.keys[68] || game.keys[39]) && P.angle < 70) {
			P.angle += .6
		}

		if((game.keys[65] || game.keys[37]) && P.angle > -70) {
			P.angle -= .6
		}

		var paddingX = 2
		var paddingY = 2

		var points = [{x: P.x + paddingX, y: P.y + paddingY},
					 {x: P.x + P.width - paddingX, y: P.y + paddingY},
					 {x: P.x + P.width - paddingX, y: P.y + P.height - paddingY},
					 {x: P.x + paddingX, y: P.y + P.height - paddingY}]

		var p = P.x + P.width/2,
			q = P.y + P.height;

		var cAngle = Math.PI/180 * P.angle;


		for (var i = points.length - 1; i >= 0; i--) {
		 	points[i] = util.rotatePoint({x:p, y:q},points[i],cAngle)
		 };


		var dx = -1 * P.velX * Math.sin(Math.PI/180 * P.angle)
		// 	dy =  Math.cos(Math.PI/180 * P.angle);

		// P.velY = dy;

		if(P.x + dx > 0 && P.x +dx < game.width - P.width)
			P.x += dx;


		for (var i = game.objects.length - 1; i >= 0; i--) {
			if((game.objects[i].y < game.height/3) && util.doPolygonsIntersect(points,
					 [{x: game.objects[i].x, y: game.objects[i].y},
					 {x: game.objects[i].x + game.BLOCK_WIDTH, y: game.objects[i].y},
					 {x: game.objects[i].x + game.BLOCK_WIDTH, y: game.objects[i].y + game.BLOCK_WIDTH},
					 {x: game.objects[i].x, y: game.objects[i].y + game.BLOCK_WIDTH}])) {
				game.objects[i].pick()
				game.objects.splice(i, 1)
			}
		};

		return points
	}
}

var player, game;

window.addEventListener("load", function () {
	game = new Game();
	player = new Player();

	game.lastUpdate = Date.now();
	game.loop();
});

})();