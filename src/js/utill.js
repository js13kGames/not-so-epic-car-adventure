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