function Player (){
	P = this;

	P.ctx = game.ctx;
	P.width = 18;
	P.height = 18;
	P.speed = 3;
	P.velX = 1;
	P.velY = 0;
	P.angle = 0;
	P.score = 0;
	P.life = 3;

	P.newhighscore = true;

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

function reset() {
	game = new Game();
	player = new Player();

	game.lastUpdate = Date.now();
	game.loop();
}

document.addEventListener("keydown", function (e) {
	if(e.keyCode == 32 && G.state != 'game') {
		e.preventDefault()
		if(G.state == 'menu') {
			G.state = 'game'
		}
		if(G.state == 'gameover') {
			reset();
			G.state = 'game'
		}
	}
});

var player, game;

window.addEventListener("load", reset);