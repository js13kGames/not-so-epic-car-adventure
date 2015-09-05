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
		y: 0,
		width: 18,
		height: 32,
		speed: 3,
		velX: 1,
		velY: 0,
		angle: 0,
		jumping: false,
		grounded: false
	},
	keys = [],
	friction = 1,
	levelpos = 0;

roadlines = [10, 50, 90, 130, 170, 210]

var BLOCK_WIDTH = 50,
  LEVEL_HEIGHT = 180;

var sprites = {}

init()
function init() {
	sprites.car = new Image()
	sprites.car.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAgCAMAAAAootjDAAAAMFBMVEX///////8AAAAHJNgwJTQ+MThgBQemExjILjDMMzPMZmbrSUnxZ2j2+oL4goP9/8RCMSjcAAAAAnRSTlMABHH+CSEAAACZSURBVHjarc9BEgMhCERRYxxJixPvf9v0MGDIPn8h1KtyQbG6V6JzLbHWOp3w2sF/QXfoN6nO+WZzqt4EBcWMa9Db2yRfkk1wyVStRJTGaIkOK0g4h8dVKKVn6oVGqmM82RiVVILYL7lkMvkfsUwtqDlBJEjibKBVu7oBiaxEiuOSA+oklzEbUtzUCyldACof6ZsipwctMvkAX6gN1CyP3dQAAAAASUVORK5CYII='

	sprites.grass = new Image()
	sprites.grass.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAACVBMVEVBhStauzqJ3G6gHPROAAAAWklEQVR4AaWRwQmAQADD0u4/tD4UQsWHWBA8AzFw5B49p2NMfIreiYH3BcCLqoV2gWMNHCsAz1jImP1HG+wdM9dTm10931WNBa7GAldjgWfBAgv+X5SbF+xVHZvHAjfhtX7bAAAAAElFTkSuQmCC'
	sprites.grass.pattern = ctx.createPattern(sprites.grass, 'repeat')
}


function update() {
	if(player.velY < 2) {
		//player.velY += 0.001;
		player.velY = 1;
	}

	if(keys[68] || keys[39]) {
		if(player.angle < 80)
		player.angle += 5
	}

	if(keys[65] || keys[37]) {
		if(player.angle > -80)
		player.angle -= 5
	}

	var dx = -1 * player.velX * player.angle / 50,
		dwidth = 20//player.height*Math.atan(Math.abs(Math.PI/180 * player.angle)) - player.width;

	if(player.x + dx > dwidth && player.x +dx < width - dwidth)
		player.x += dx;

}


function draw() {

	update()

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

	ctx.save();
	ctx.translate(player.x, player.y + 20);
	ctx.rotate(Math.PI/180 * player.angle);
	ctx.drawImage(sprites.car, -(player.width/2), 0);
	ctx.restore();

	requestAnimationFrame(draw);
}

// function colCheck(shapeA, shapeB) {
//     // get the vectors to check against
//     var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
//         vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
//         // add the half widths and half heights of the objects
//         hWidths = (shapeA.width / 2) + (shapeB.width / 2),
//         hHeights = (shapeA.height / 2) + (shapeB.height / 2),
//         colDir = null;

//     // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
//     if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
//         // figures out on which side we are colliding (top, bottom, left, or right)
//         var oX = hWidths - Math.abs(vX),
//             oY = hHeights - Math.abs(vY);
//         if (oX >= oY) {
//             if (vY > 0) {
//                 colDir = "t";
//                 shapeA.y += oY;
//             } else {
//                 colDir = "b";
//                 shapeA.y -= oY;
//             }
//         } else {
//             if (vX > 0) {
//                 colDir = "l";
//                 shapeA.x += oX;
//             } else {
//                 colDir = "r";
//                 shapeA.x -= oX;
//             }
//         }
//     }
//     return colDir;
// }

document.body.addEventListener("keydown", function (e) {
	keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
	keys[e.keyCode] = false;
});


window.addEventListener("load", function () {
	draw();
});