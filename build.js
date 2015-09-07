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


function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d"),
	width = 200,
	height = 200,
	player = {
		x: 100 - 9,
		y: 20,
		width: 18,
		height: 32,
		speed: 3,
		velX: 1,
		velY: 1,
		angle: 0,
		jumping: false,
		grounded: false,
		score: 0,
		getScore: function() {
			return ('000000000' + this.score).substr(-5); 
		},
		life: 3
	},
	keys = [],
	friction = 1,
	levelpos = 0;

objects = []

roadlines = [10, 50, 90, 130, 170, 210]

var BLOCK_WIDTH = 8,
  LEVEL_HEIGHT = 180,
  collided = false;

var sprites = {}

init()
function init() {
	sprites.car = new Image()
	sprites.car.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAgCAMAAAAootjDAAAAMFBMVEX///////8AAAAHJNgwJTQ+MThgBQemExjILjDMMzPMZmbrSUnxZ2j2+oL4goP9/8RCMSjcAAAAAnRSTlMABHH+CSEAAACZSURBVHjarc9BEgMhCERRYxxJixPvf9v0MGDIPn8h1KtyQbG6V6JzLbHWOp3w2sF/QXfoN6nO+WZzqt4EBcWMa9Db2yRfkk1wyVStRJTGaIkOK0g4h8dVKKVn6oVGqmM82RiVVILYL7lkMvkfsUwtqDlBJEjibKBVu7oBiaxEiuOSA+oklzEbUtzUCyldACof6ZsipwctMvkAX6gN1CyP3dQAAAAASUVORK5CYII='

	sprites.heart = new Image()
	sprites.heart.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAGFBMVEXtYX3uICT////uICTuICTvHSHtYX3uICRn0reDAAAABnRSTlMAAACA2fv1BknTAAAAcElEQVR4AYXOQQ4CIAxE0ZYK3P/GUr9OxgRjV+1/C4jxY/5D3KEeZQvAuQksAOfuoAXg7KClgb5WBzoS9AMaJLy7AN4dfATp4m/kt0x69ndN5qe/wEW9wWW+O2CiDpjQBRK6QEIXSNQdTqoaiQD3eQJuhQjATNX6FQAAAABJRU5ErkJggg=='

	sprites.grass = new Image()
	sprites.grass.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAACVBMVEVBhStauzqJ3G6gHPROAAAAWklEQVR4AaWRwQmAQADD0u4/tD4UQsWHWBA8AzFw5B49p2NMfIreiYH3BcCLqoV2gWMNHCsAz1jImP1HG+wdM9dTm10931WNBa7GAldjgWfBAgv+X5SbF+xVHZvHAjfhtX7bAAAAAElFTkSuQmCC'
	sprites.grass.pattern = ctx.createPattern(sprites.grass, 'repeat')
}


function rotatePoint(pivot, point, angle) {
  // Rotate clockwise, angle in radians
  var x = Math.round((Math.cos(angle) * (point.x - pivot.x)) -
                     (Math.sin(angle) * (point.y - pivot.y)) +
                     pivot.x),
      y = Math.round((Math.sin(angle) * (point.x - pivot.x)) +
                     (Math.cos(angle) * (point.y - pivot.y)) +
                     pivot.y);
  return {'x': x, 'y': y};
}


function update() {
	if(Math.random() < 0.01) 
		player.score += 1

	if(player.velY < 1) {
		player.velY += 0.002;
	}
	var paddingX = 3
	var paddingY = 2

	var points = [{x: player.x + paddingX, y: player.y + paddingY},
				 {x: player.x + player.width - paddingX, y: player.y + paddingY},
				 {x: player.x + player.width - paddingX, y: player.y + player.height - paddingY},
				 {x: player.x + paddingX, y: player.y + player.height - paddingY}]

	var p = player.x + player.width/2,
		q = player.y + player.height;

	var cAngle = Math.PI/180 * player.angle;



	for (var i = points.length - 1; i >= 0; i--) {
	 	points[i] = rotatePoint({x:p, y:q},points[i],cAngle)
	 };



	if(keys[68] || keys[39]) {
		if(player.angle < 70)
		player.angle += .6
	}

	if(keys[65] || keys[37]) {
		if(player.angle > -70)
		player.angle -= .6
	}

	var dx = -1 * player.velX * Math.sin(Math.PI/180 * player.angle),
		dy =  Math.cos(Math.PI/180 * player.angle);

	player.velY = dy;

	if(player.x + dx > 0 && player.x +dx < width - player.width)
		player.x += dx;

	if(Math.random() < 0.05 && objects.length < 10) {
		objects.push({
			x: rand(10, width-10),
			y: height
		})
	}

	collided = false

	for (var i = objects.length - 1; i >= 0; i--) {
		if((objects[i].y < height/2) && doPolygonsIntersect(points,
				 [{x: objects[i].x, y: objects[i].y},
				 {x: objects[i].x + BLOCK_WIDTH, y: objects[i].y},
				 {x: objects[i].x + BLOCK_WIDTH, y: objects[i].y + BLOCK_WIDTH},
				 {x: objects[i].x, y: objects[i].y + BLOCK_WIDTH}])) {
			collided = true
			player.life -= 1
			objects.splice(i, 1)
		}
	};

	return points

}

function draw() {

	var points = update()

	ctx.clearRect(0, 0, width, height);

	for (var i = roadlines.length - 1; i >= 0; i--) {
		roadlines[i] -= player.velY;
		if(roadlines[i] <= -40)
			roadlines[i] = height
	};

	ctx.save()
	if(levelpos > -height) {
		levelpos -= player.velY
	} else {
		levelpos = Math.abs( -height - levelpos) - 32
	}

	ctx.translate(0, 1*levelpos);
	ctx.fillStyle = sprites.grass.pattern
	ctx.fillRect(0,0, width, 2*height)
	ctx.restore()

	ctx.fillStyle = 'grey'
	ctx.fillRect(50, 0, width-100, height)

	ctx.fillStyle = 'yellow'
	ctx.fillRect(canvas.width/2 - 1.5, roadlines[0], 3, 20)
	ctx.fillRect(canvas.width/2 - 1.5, roadlines[1], 3, 20)
	ctx.fillRect(canvas.width/2 - 1.5, roadlines[2], 3, 20)
	ctx.fillRect(canvas.width/2 - 1.5, roadlines[3], 3, 20)
	ctx.fillRect(canvas.width/2 - 1.5, roadlines[4], 3, 20)
	ctx.fillRect(canvas.width/2 - 1.5, roadlines[5], 3, 20)

	ctx.fillStyle = 'brown'
	for (var i = objects.length - 1; i >= 0; i--) {
		objects[i].y -= player.velY;
		if(objects[i].y < -BLOCK_WIDTH) {
			objects.splice(i, 1)
		}
		ctx.fillRect(objects[i].x,objects[i].y,BLOCK_WIDTH,BLOCK_WIDTH)
	};

	ctx.save();
	ctx.translate(player.x + player.width/2, player.y + player.height);
	ctx.rotate(Math.PI/180 * player.angle);
	ctx.drawImage(sprites.car, -player.width/2, -player.height);
	ctx.restore();

	// ctx.strokeStyle = 'green'
	// ctx.beginPath();
 // 	ctx.moveTo(points[0].x,points[0].y);
 // 	ctx.lineTo(points[1].x,points[1].y);
 // 	ctx.lineTo(points[2].x,points[2].y);
 // 	ctx.lineTo(points[3].x,points[3].y);
 // 	ctx.lineTo(points[0].x,points[0].y);
 // 	ctx.stroke();

		// ctx.fillStyle = "rgba(0, 0, 0, 0.4)"; //DARKEN
		// ctx.fillRect(0, 0, width, height);

 	ctx.save()
 	ctx.scale(0.5, 0.5);
 	for (var i = 0; i < player.life; i++) {
 		ctx.drawImage(sprites.heart, i*24 + 3, 1);
 	};
 	ctx.restore();

 	ctx.fillStyle = "white";
 	ctx.fillText(player.getScore(), canvas.width - 30, 10);

	requestAnimationFrame(draw);
}


// setInterval(function(){
// 	player.score += 1;
// }, 1000)

function doPolygonsIntersect (a, b) {

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
};

document.body.addEventListener("keydown", function (e) {
	keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
	keys[e.keyCode] = false;
});


window.addEventListener("load", function () {
	draw();
});