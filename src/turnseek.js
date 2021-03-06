var TS = {
	canvas: null,
	ctx: null,
	scratch: null,
	scratchDirty: true,
	centerCanvas: null,
	goal: null,
	goalDirty: true,
	colors: [
		"#ffb6db",
		"#b6dbff",
		"#ffff6d",
		"#6db6ff",
		"#24fe23",
		"#009292",
		"#b66dff",
		"#db6d00"
//		"#38e07b",
//		"#9f6cf5",
//		"#fef4da",
//		"#8f8f8f",
//		"#b36283"
	],
	rings: [
		{
			segments: [
				"#38e07b",
				"#9f6cf5",
				"#fef4da"
			],
			rotate: 0,
			goalRotate: 0,
			canvas: null
		}
	],
	goal: {
		x: 0.333,
		y: 0.333
	},
	goalRadius: 0,
	move: {
		ring: null,
		startAngle: 0,
		offsetAngle: 0,
		prevX: 0,
		prevY: 0,
		lastMove: 0
	},
	fudge: 5,
	gameover: false
};
var TO_RADIANS = Math.PI / 180;
var requestAnimationFrame = (window.requestAnimationFrame ||
							 window.mozRequestAnimationFrame ||
							 window.webkitRequestAnimationFrame ||
							 window.msRequestAnimationFrame);
requestAnimationFrame = requestAnimationFrame || function(cb) {
	setTimeout(cb, 10, new Date());
};
var trans = function(str) {
	var lang = (navigator.language || "en-US").substring(0, 2).toLowerCase();
	var table = {
		"ar": {
			"Victory!": "!النصر"
		},
		"cs": {
			"Victory!": "Vítězství!"
		},
		"da": {
			"Victory!": "Sejr!"
		},
		"de": {
			"Victory!": "Sieg!"
		},
		"el": {
			"Victory!": "Νίκη!"
		},
		"en": {
			"Victory!": "Victory!"
		},
		"es": {
			"Victory!": "¡Victoria!"
		},
		"fr": {
			"Victory!": "Victoire!"
		},
		"he": {
			"Victory!": "!נצחון"
		},
		"hi": {
			"Victory!": "विजय!"
		},
		"it": {
			"Victory!": "Vittoria!"
		},
		"ja": {
			"Victory!": "勝利"
		},
		"ko": {
			"Victory!": "승리!"
		},
		"nl": {
			"Victory!": "Overwinning!"
		},
		"no": {
			"Victory!": "Seier!"
		},
		"pl": {
			"Victory!": "Zwycięstwo!"
		},
		"pt": {
			"Victory!": "Vitória!"
		},
		"ro": {
			"Victory!": "Victorie!"
		},
		"ru": {
			"Victory!": "Победы!"
		},
		"sk": {
			"Victory!": "Víťazstvo!"
		},
		"sr": {
			"Victory!": "Победа!"
		},
		"sv": {
			"Victory!": "Seger!"
		},
		"uk": {
			"Victory!": "Перемоги!"
		},
		"yi": {
			"Victory!": "!זיג"
		},
		"zh": {
			"Victory!": "胜利！"
		}
	};
	return table[lang] ? table[lang][str] : str || str;
};

function init() {
	var rings = Math.floor(Math.random() * 2) + 2;
	var segments = 0;
	var ring = null;
	var pool = [];
	TS.rings = [];

	for(var i = 0; i < rings; i++) {
		pool = TS.colors.slice();
		ring = {
			segments: [],
			rotate: Math.floor(Math.random() * 360),
			goalRotate: Math.floor(Math.random() * 360)
		};
		segments = Math.floor(Math.random() * (TS.colors.length - 1)) + 2;
		for(var j = 0; j < segments; j++) {
			ring.segments.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
		}
		TS.rings.push(ring);
	};
	TS.goal.x = Math.random();
	TS.goal.y = Math.random();

	TS.gameover = false;

	TS.goalDirty = true;
	TS.scratchDirty = true;
	TS.goalDirty = true;
	delete TS.centerCanvas;
	TS.centerCanvas = null;
	TS.rings.every(function(ring, r) {
		delete ring.canvas;
		ring.canvas = null;
		return true;
	});
};

function render(goal) {
	var rings = TS.rings.length;
	var radius = 0;
	var segstart = 0;
	var seglength = 0;
	var pos = TS.canvas.width / 2;
	var ctx = TS.ctx;
	var oldCtx = null;

	if(goal === true) {
		ctx = TS.goal.getContext("2d");
	}

	TS.rings.every(function(ring, r) {
		ctx.save();
		ctx.translate(pos, pos);
		if(goal === true) {
			ctx.rotate(ring.goalRotate * TO_RADIANS);
		} else {
			ctx.rotate(ring.rotate * TO_RADIANS);
			if(r === TS.move.ring) {
				ctx.rotate(TS.move.offsetAngle * TO_RADIANS);
			}
		}
		if(!ring.canvas) {
//			console.log("dirty ring " + r);
			oldCtx = ctx;
			ring.canvas = document.createElement("canvas");
			ring.canvas.width = TS.canvas.width;
			ring.canvas.height = TS.canvas.height;
			ctx = ring.canvas.getContext("2d");
			ctx.translate(pos, pos);
			radius = (TS.canvas.width / 2) * ((rings - r + 1) / (rings + 1));
			seglength = (360 / ring.segments.length) * TO_RADIANS;
			ring.segments.every(function(segment, s) {
				segstart = s * seglength;
				ctx.fillStyle = segment;
				ctx.beginPath();
				ctx.arc(0, 0, radius, segstart, (segstart + seglength) % (Math.PI * 2), false);
				ctx.arc(0, 0, 0, (segstart + seglength) % (Math.PI * 2), segstart, true);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				return true;
			});
			ctx = oldCtx;
		}
		ctx.drawImage(ring.canvas, -pos, -pos);
		ctx.restore();
		return true;
	});

	// center
	radius = (TS.canvas.width / 2) * (1 / (rings + 1));
	if(!TS.centerCanvas) {
//		console.log("stale center");
		oldCtx = ctx;
		TS.centerCanvas = document.createElement("canvas");
		TS.centerCanvas.width = TS.canvas.width;
		TS.centerCanvas.height = TS.canvas.height;
		ctx = TS.centerCanvas.getContext("2d");
		ctx.translate(pos, pos);
		TS.goalRadius = radius;
		ctx.fillStyle = "black";
		ctx.lineWidth = 8;
		ctx.strokeStyle = "black";
//		ctx.translate(pos, pos);
		ctx.beginPath();
		ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.stroke();
		ctx.lineWidth = 4;
		ctx.strokeStyle = "white";
		ctx.stroke();
		ctx = oldCtx;
	}
	ctx.save();
	ctx.drawImage(TS.centerCanvas, 0, 0);
	ctx.restore();

	if((TS.goal.x * TS.canvas.width) - radius < 1) {
		TS.goal.x = (radius + 1) / TS.canvas.width;
	}
	if((TS.goal.x * TS.canvas.width) + radius > TS.canvas.width - 1) {
		TS.goal.x = (TS.canvas.width - 1 - radius) / TS.canvas.width;
	}
	if((TS.goal.y * TS.canvas.height) - radius < 1) {
		TS.goal.y = (radius + 1) / TS.canvas.height;
	}
	if((TS.goal.y * TS.canvas.height) + radius > TS.canvas.height - 1) {
		TS.goal.y = (TS.canvas.height - 1 - radius) / TS.canvas.height;
	}

	if(goal === true) {
		TS.goalDirty = false;
		return;
	}

	// center goal
	if(TS.goalDirty) {
		render(true);
	}
	if(TS.scratchDirty) {
		oldCtx = ctx;
		ctx = TS.scratch.getContext("2d");
		ctx.drawImage(TS.goal, 0, 0);
		ctx.save();
		ctx.globalCompositeOperation = "destination-in";
		ctx.beginPath();
		ctx.arc(TS.goal.x * TS.canvas.width, TS.goal.y * TS.canvas.height,
				radius, 0, Math.PI * 2, false);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
		TS.scratchDirty = false;
		ctx = oldCtx;
	}
//	ctx.save();
	ctx.drawImage(TS.scratch,
				  (TS.goal.x * TS.canvas.width) - radius,
				  (TS.goal.y * TS.canvas.height) - radius,
				  radius * 2, radius * 2,
				  pos - radius, pos - radius, radius * 2, radius * 2);
//	ctx.restore();
}

function checkwin() {
	if(TS.gameover) {
		return;
	}
	var allgood = true;
	TS.rings.every(function(ring, r) {
//		console.log(r, Math.abs(ring.rotate - ring.goalRotate));
		if(Math.abs(ring.rotate - ring.goalRotate) > TS.fudge &&
		   Math.abs(ring.rotate - ring.goalRotate) < (360 - TS.fudge)) {
			allgood = false;
		}
		return true;
	});
	if(allgood) {
		TS.gameover = true;
		alert(trans("Victory!"));
		init();
		render();
	}
}

function resize() {
	if(!TS.canvas) {
		return;
	}
	TS.canvas.width = 0;
	TS.canvas.height = 0;

	var parent = TS.canvas.parentElement;
	var ratio = 1;
	var toowide = (parent.clientWidth / parent.clientHeight) > ratio;

	if(toowide) {
		TS.canvas.width = parent.clientHeight * ratio;
		TS.canvas.height = parent.clientHeight;
	} else {
		TS.canvas.width = parent.clientWidth;
		TS.canvas.height = parent.clientWidth / ratio;
	}

	TS.goal.width = TS.canvas.width;
	TS.goal.height = TS.canvas.height;
	TS.scratch.width = TS.canvas.width;
	TS.scratch.height = TS.canvas.height;
	TS.scratchDirty = true;
	TS.goalDirty = true;
	delete TS.centerCanvas;
	TS.centerCanvas = null;
	TS.rings.every(function(ring, r) {
		delete ring.canvas;
		ring.canvas = null;
		return true;
	});

	requestAnimationFrame(render);
}

function mousedown(e) {
	e.preventDefault();
	if(e.changedTouches && e.changedTouches.length) {
		e = e.changedTouches[0];
	}

	var dx = (e.target.width / 2) - (e.clientX - e.target.offsetLeft);
	var dy = (e.target.height / 2) - (e.clientY - e.target.offsetTop);
	var angle = Math.atan2(dx, dy);
	var radius = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))

	angle = angle / (Math.PI / -180);
	if(angle < 0) {
		angle = 360 + angle;
	}

	TS.move.startAngle = angle;
	TS.move.offsetAngle = 0;
	TS.move.prevX = e.clientX;
	TS.move.prevY = e.clientY;
	TS.move.lastMove = new Date();

	if(radius < TS.goalRadius) {
		TS.move.ring = -1;
	} else {
		var rings = TS.rings.length;
		TS.rings.every(function(ring, r) {
			if(radius < (TS.canvas.width/2) * ((rings - r + 1) / (rings + 1))) {
				TS.move.ring = r;
			}
			return true;
		});
	}
//	console.log(TS.move);
//	console.log(angle, radius);
//	console.log(TS.move.offsetX, TS.move.offsetY);
}
function mousemove(e) {
	var now = new Date();
	if(null === TS.move.ring || now - TS.move.lastMove < 16) {
		return;
	}
	e.preventDefault();
//	console.log(now - TS.move.lastMove);
	if(e.changedTouches && e.changedTouches.length) {
		e = e.changedTouches[0];
	}

	TS.move.lastMove = now;

	var dx = (e.target.width / 2) - (e.clientX - e.target.offsetLeft);
	var dy = (e.target.height / 2) - (e.clientY - e.target.offsetTop);
	var angle = Math.atan2(dx, dy);
	var radius = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))

	angle = angle / (Math.PI / -180);
	if(angle < 0) {
		angle += 360;
	}

	if(TS.move.ring < 0) {
		TS.goal.x += (TS.move.prevX - e.clientX) / TS.canvas.width;
		TS.goal.y += (TS.move.prevY - e.clientY) / TS.canvas.width;
		TS.scratchDirty = true;
	}

	TS.move.offsetAngle = angle - TS.move.startAngle;
	TS.move.prevX = e.clientX;
	TS.move.prevY = e.clientY;

//	console.log(dx, dy);

//	console.log(TS.move.offsetX, TS.move.offsetY);
//	console.log(angle, radius);
//	console.log(TS.move);


	render();
}
function mouseup(e) {
	e.preventDefault();
	if(e.changedTouches && e.changedTouches.length) {
		e = e.changedTouches[0];
	}

	if(TS.move.ring !== null) {
		if(TS.move.ring < 0) {
		} else {
			TS.rings[TS.move.ring].rotate += TS.move.offsetAngle % 360;
			if(TS.rings[TS.move.ring].rotate < 0) {
				TS.rings[TS.move.ring].rotate += 360;
			}
		}
	}
	TS.move.ring = null;
	checkwin();
}

window.addEventListener("load", function() {
	TS.canvas = document.querySelector("#display");
	TS.ctx = TS.canvas.getContext("2d");
	TS.goal = document.createElement("canvas");
	TS.scratch = document.createElement("canvas");
	init();
	resize();

	TS.canvas.addEventListener("mousedown", mousedown);
	TS.canvas.addEventListener("mousemove", mousemove);
	TS.canvas.addEventListener("mouseup", mouseup);
	TS.canvas.addEventListener("mouseout", mouseup);

	TS.canvas.addEventListener("touchstart", mousedown);
	TS.canvas.addEventListener("touchmove", mousemove);
	TS.canvas.addEventListener("touchend", mouseup);
	TS.canvas.addEventListener("touchcancel", mouseup);
});

window.addEventListener("resize", resize);