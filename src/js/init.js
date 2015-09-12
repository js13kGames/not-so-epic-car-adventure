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