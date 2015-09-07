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

	G.SPgrass = new Image()
	G.SPgrass.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAACVBMVEVBhStauzqJ3G6gHPROAAAAWklEQVR4AaWRwQmAQADD0u4/tD4UQsWHWBA8AzFw5B49p2NMfIreiYH3BcCLqoV2gWMNHCsAz1jImP1HG+wdM9dTm10931WNBa7GAldjgWfBAgv+X5SbF+xVHZvHAjfhtX7bAAAAAElFTkSuQmCC'
	G.SPgrass.pattern = G.ctx.createPattern(G.SPgrass, 'repeat')

	document.body.addEventListener("keydown", function (e) {
		G.keys[e.keyCode] = true;
	});

	document.body.addEventListener("keyup", function (e) {
		G.keys[e.keyCode] = false;
	});

}

Game.prototype = {
	constructor: Game,
	update: function(dt) {	
		G.scoreclock += dt;

		if(G.scoreclock >= 1000) {
			G.scoreclock = 0;
			player.score += 1;
		}

		if(Math.random() < 0.05 && G.objects.length < 10) {
			G.objects.push({
				x: util.rand(10, G.width-10),
				y: G.height
			})
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

		ctx.fillStyle = 'brown'
		for (var i = G.objects.length - 1; i >= 0; i--) {
			G.objects[i].y -= player.velY;
			if(G.objects[i].y < -G.BLOCK_WIDTH) {
				G.objects.splice(i, 1)
			}
			ctx.fillRect(G.objects[i].x,G.objects[i].y,G.BLOCK_WIDTH,G.BLOCK_WIDTH)
		};
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
	P.SPheart.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAGFBMVEXtYX3uICT////uICTuICTvHSHtYX3uICRn0reDAAAABnRSTlMAAACA2fv1BknTAAAAcElEQVR4AYXOQQ4CIAxE0ZYK3P/GUr9OxgRjV+1/C4jxY/5D3KEeZQvAuQksAOfuoAXg7KClgb5WBzoS9AMaJLy7AN4dfATp4m/kt0x69ndN5qe/wEW9wWW+O2CiDpjQBRK6QEIXSNQdTqoaiQD3eQJuhQjATNX6FQAAAABJRU5ErkJggg=='

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
	 	ctx.scale(0.5, 0.5);
	 	for (var i = 0; i < P.life; i++) {
	 		ctx.drawImage(P.SPheart, i*24 + 3, 1);
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
				P.life -= 1
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