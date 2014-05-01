/**
 * Genetic algorithms.
 * The purpose of this is to identify the best values for the multipliers.
 */

function ga(w, h, depth, num_features, num_pop, keep_elite, prob_mutate) {
	this.w = w;
	this.h = h;
	this.population = new Array(num_pop);
	this.num_features = num_features;
	this.keep_elite = keep_elite;
	this.prob_mutate = prob_mutate;

	this.depth = depth;
	if (this.depth == 1) {
		this.step_per_tick = 1000;
		this.num_passes = 8;
	} else {
		this.step_per_tick = 100;
		this.num_passes = 4;
	}

	for (var a = 0;a < num_pop;a++) {
		var features = new Array(num_features);
		for (var b = 0;b < num_features;b++) {
			//features[b] = Math.random();
			features[b] = Math.random() * 2 - 1;
		}
		this.population[a] = new ga_organism(w, h, this.depth, features);
	}

	this.state = 0;
}

ga.prototype.gen_board_bad = function() {
	var arr = new Array();
	for (var c = 0;c < this.w * this.h;c++) {
		arr[c] = 0;
	}
	for (var a = 1;a < 12;a++) {
		var t;
		do {
			t = parseInt(Math.random() * this.w * this.h);
		} while (arr[t]);
		arr[t] = a;
	}

	return arr;
}

//[0.6569217117503285, 0.7830688734538853, 0.6353329580742866, 0.908676762599498, 0.8502209838479757, 0.7067304879892617, 0.769994639325887, 0.07286373781971633, 0.6991871227510273, 0.10170601215213537, 0.8459896305575967, 0.8286891640163958, 0.6485766039695591, 0.2068445908371359, 0.7471432439051569, 0.6954309120774269, 0.7935030485969037, 0.8305149329826236, 0.06450035935267806, 0.07782829878851771, 0.3982527428306639, 0.7090239347890019, 0.12037004460580647, 0.28272534743882716, 0.513981509488076, 0.6978049448225647, 0.7462352896109223, 0.05707388906739652, 0.8042371461633593, 0.04743594257161021, 0.8133057183586061, 0.9532657291274518, 0.9799005601089448, 0.18466358468867838, 0.47924584127031267, 0.562762331450358, 0.05598970246501267, 0.829527381574735, 0.7808529734611511, 0.7238574782386422, 0.471843030070886, 0.1940678593236953, 0.4091515203472227, 0.9180612834170461, 0.013551337644457817, 0.6506992757786065, 0.5368549053091556, 0.9631614256650209, 0.7066579721868038, 0.13418311392888427, 0.10670933593064547, 0.4843442540150136, 0.6374624841846526, 0.5406405774410814, 0.4838171247392893, 0.2105818446725607, 0.32845470681786537, 0.29759931145235896, 0.9065126022323966, 0.8556654553394765, 0.07546189241111279, 0.028942126780748367, 0.10261481534689665, 0.37588410219177604, 0.7732235863804817, 0.6774320693220943, 0.5166036407463253, 0.1653533757198602, 0.48919154331088066, 0.5758033788297325, 0.8395186993293464, 0.2262416547164321, 0.7839806431438774, 0.37784270429983735, 0.48970435792580247, 0.12882105470634997, 0.34535453259013593, 0.5926553385797888, 0.6049740887247026, 0.8526350404135883]

ga.prototype.gen_board2 = function() {
	/* Generate a board close to the 2048 configuration */

	/* This is an OK function that almost solves 2048 */
	var cfg = [0.7821819649543613, 0.9222539837937802, 0.8196204961277544, 0.1274572357069701, 0.9208357390016317, 0.9068120343144983, 0.9932627424132079, 0.5289904030505568, 0.8147082957439125, 0.22688221326097846, 0.8615578215103596, 0.5534307572524995, 0.5674985002260655, 0.9502803438808769, 0.9843023340217769, 0.3291990652214736, 0.7817809018306434, 0.8589172079227865, 0.6356962095014751, 0.5709380751941353, 0.030848414869979024, 0.17631358257494867, 0.26183210173621774, 0.2890653759241104, 0.6222515834961087, 0.9909024145454168, 0.24429524480365217, 0.876922003692016, 0.49955576565116644, 0.28314339951612055, 0.7250005179084837, 0.6250481531023979, 0.7505364352837205, 0.7713774652220309, 0.931724949972704, 0.6623452270869166, 0.12333172536455095, 0.8095831370446831, 0.9268454597331583, 0.7995199947617948, 0.7328233760781586, 0.778678591363132, 0.8437822035048157, 0.18452869239263237, 0.7200209537986666, 0.5036386444699019, 0.39451861986890435, 0.22751842928119004, 0.6096238661557436, 0.8956782796885818, 0.5495600551366806, 0.0844776073936373, 0.3972908006981015, 0.9980823411606252, 0.7168722278438509, 0.01258120290003717, 0.7175695465411991, 0.06469131261110306, 0.5638041342608631, 0.6180428543593735, 0.2680567514616996, 0.4135034750215709, 0.9183910782448947, 0.5253791038412601, 0.6646958005148917, 0.3856877814978361, 0.47666866960935295, 0.5803278181701899, 0.7368296303320676, 0.937863330822438, 0.7590596321970224, 0.43483345676213503, 0.22817644127644598, 0.8826169692911208, 0.011296415235847235, 0.22622313257306814, 0.33011293411254883, 0.7010988057591021, 0.9336795518174767, 0.5872988023329526];

	var arr = new Array();

	for (var c = 0;c < this.w * this.h;c++) {
		arr[c] = 0;
	}

	var t1 = parseInt(Math.random() * this.w * this.h);
	arr[t1] = 1 + parseInt(Math.random() / 0.9);

	var t2;
	do {
		t2 = parseInt(Math.random() * this.w * this.h);
	} while (t2 == t1);
	arr[t2] = 1 + parseInt(Math.random() / 0.9);
	
	var ai = new ai_grid(this.w, this.h, this.depth, arr, cfg);

	for (var a = 0;a < 1000;a++) {
		var dir = ai.bruteforce(2);
		if (dir == -1) {
			/* It failed */
			return this.gen_board();
		}

		if (!ai.move(dir)) {
			/* It failed */
			return this.gen_board();
		}

		var t;
		do {
			t = parseInt(Math.random() * this.w * this.h);
		} while (ai.get(t));
		ai.set_loc(t, 1 + parseInt(Math.random() / 0.9));
	}

	for (var c = 0;c < this.w * this.h;c++)
		if (ai.get(c) == 11)
			return this.gen_board();

	return ai.arr;
}

ga.prototype.gen_board = function() {
	var arr = new Array();

	for (var c = 0;c < this.w * this.h;c++) {
		arr[c] = 0;
	}

	var t1 = parseInt(Math.random() * this.w * this.h);
	arr[t1] = 1 + parseInt(Math.random() / 0.9);

	var t2;
	do {
		t2 = parseInt(Math.random() * this.w * this.h);
	} while (t2 == t1);
	arr[t2] = 1 + parseInt(Math.random() / 0.9);

	return arr;
}

ga.prototype.start = function () {
	this.cur_step = 0;
	this.cur_pass = 0;
	this.cur = 0;

	var todo = new Array();

	this.init = new Array();
	this.passes = new Array();
	for (var a = 0;a < this.num_passes;a++) {
		this.init[a] = this.gen_board();
		this.passes[a] = new Array();
		for (var b = 0;b < 4096;b++) {
			var build = [];
			for (var c = 0;c < this.w * this.h;c++) {
				todo.push(c);
			}
			var val = parseInt(Math.random() / 0.9) + 1;
			for (var c = 0;c < this.w * this.h;c++) {
				var r = parseInt(Math.random() * todo.length);
				var t = todo[r];
				todo.splice(r, 1);
				build.push(t);
				build.push(val);
			}
			this.passes[a].push(build);
		}
	}

	console.log(this.init.arr, this.passes);
}

ga.prototype.stepRandom = function() {
	var cur = this.population[this.cur];

	//console.log(this.cur);
	var ok = cur.step();
	if (!ok) {
		//console.log("Done", cur.score);
		this.cur++;

		if (this.cur == this.population.length)
			return false;
	} else {
		var val = 1 + parseInt(Math.random() / 0.9);
		var l;
		do {
			l = parseInt(Math.random() * this.w * this.h);
		} while (cur.get(l));

		cur.set_loc(l, val);
	}

	return true;
}

ga.prototype.step = function() {
	var cur = this.population[this.cur];

	if (!this.cur_step) {
		cur.sum = 0;
		for (var c = 0;c < this.h * this.w;c++) {
			var v = this.init[this.cur_pass][c];
			cur.set_loc(c, v);
			cur.sum += Math.pow(2, v);
		}
		cur.start();
	}

	var ok = cur.step();

	if (!ok) {
		this.cur++;
		this.cur_step = 0;
		this.sum = 0;

		cur.clear();

		if (this.cur == this.population.length) {
			console.log("Pass", this.cur_pass, "complete");
			if (++this.cur_pass == this.passes.length)
				return false;
			this.cur = 0;
		}
	} else {
		var pass = this.passes[this.cur_pass];
		var step = pass[this.cur_step];

		for (var a = 0;a < step.length;a += 2) {
			var l = step[a];
			if (cur.get(l))
				continue;

			cur.set_loc(l, step[a + 1]);
			cur.sum += Math.pow(2, step[a + 1]);
			break;
		}

		this.cur_step++;
	}

	return true;
}

ga.prototype.tick = function() {
	if (this.state == 0) {
		this.start();
		this.state = 1;
	} else if (this.state == 1) {
		for (var a = 0;a < this.step_per_tick;a++) {
			if (!this.step()) {
				this.state = 2;
				break;
			}
		}
	} else if (this.state == 2) {
		this.evolve();
		this.state = 0;
	}
}

ga.prototype.selectSUS = function (amt) {
	/* Stochastic universal selection */

	var sum = 0;

	for (var a = 0;a < this.population.length;a++) {
		sum += this.population[a].score;
	}

	var dist = sum / amt;

	//console.log('Tot', sum / this.passes.length, 'Avg', (sum / this.population.length) / this.passes.length);

	var point = Math.random() * dist;

	var points = new Array();
	for (var a = 0;a < amt;a++) {
		point += dist * a;
		var pick = 0;
		for (var b = pick;b < this.population.length;b++) {
			var s = this.population[b].score;
			if (point < s) {
				pick = b;
				break;
			}
			point -= s;
		}

		points.push(this.population[pick]);
	}

	return points;
}

ga.prototype.selectRWS = function (amt) {
	/* Roulette wheel selection */

	var sum = 0;

	for (var a = 0;a < this.population.length;a++) {
		sum += this.population[a].score;
	}

	var points = new Array();
	for (var a = 0;a < amt;a++) {
		var point = Math.random() * sum;
		var pick;
		for (var b = 0;b < this.population.length;b++) {
			var s = this.population[b].score;
			if (point < s) {
				sum -= s;
				pick = a;
				break;
			}
			point -= s;
		}

		points.push(this.population[pick]);
	}

	return points;
}

ga.prototype.selectElite = function (amt) {
	var top = this.population.slice(0, amt);

	var sum = 0;
	for (var a = 0;a < top.length;a++) {
		sum += top[a].score / this.passes.length;
	}
	console.log('Avg', sum / amt, 'Best', top[0].features);

	return top;
}

ga.prototype.crossoverOne = function (o1, o2) {
	var point = parseInt(Math.random() * this.num_features);

	var features1 = new Array(this.num_features);
	var features2 = new Array(this.num_features);

	for (var a = 0;a < point;a++) {
		features1[a] = o1.features[a];
		features2[a] = o2.features[a];
	}
	for (var a = point;a < this.num_features;a++) {
		features1[a] = o2.features[a];
		features2[a] = o1.features[a];
	}

	var n1 = new ga_organism(this.w, this.h, this.depth, features1);
	var n2 = new ga_organism(this.w, this.h, this.depth, features2);

	return [n1, n2];
}

ga.prototype.crossoverUniform = function (o1, o2) {
	var features1 = new Array(this.num_features);
	var features2 = new Array(this.num_features);

	for (var a = 0;a < this.num_features;a++) {
		if (Math.random() > 0.5) {
			features1[a] = o1.features[a];
			features2[a] = o2.features[a];
		} else {
			features1[a] = o2.features[a];
			features2[a] = o1.features[a];
		}
	}

	var n1 = new ga_organism(this.w, this.h, this.depth, features1);
	var n2 = new ga_organism(this.w, this.h, this.depth, features2);

	return [n1, n2];
}

ga.prototype.crossoverBlend = function (o1, o2) {
	var mid = Math.random();

	var features = new Array(this.num_features);

	for (var a = 0;a < this.num_features;a++) {
		features[a] = o1.features[a] * (1 - mid) + o2.features[a] * mid;
	}

	return new ga_organism(this.w, this.h, this.depth, features1);
}

ga.prototype.crossoverBlendUniform = function (o1, o2) {
	var features = new Array(this.num_features);

	for (var a = 0;a < this.num_features;a++) {
		var mid = Math.random();
		features[a] = o1.features[a] * (1 - mid) + o2.features[a] * mid;
	}

	return new ga_organism(this.w, this.h, this.depth, features);
}

ga.prototype.mutate = function (o) {
	for (var a = 0;a < this.num_features;a++) {
		if (Math.random() > this.prob_mutate) {
			//o.features[a] = Math.random();
			//o.features[a] = Math.random() * 2 - 1;
			o.features[a] += Math.random() - 0.5;
		}
	}
	//for (var a = 0;a < this.num_features;a++) {
	//	if (Math.random() > this.prob_mutate) {
	//		o.features[a] = o.features[a] + Math.random() * 0.5 - 0.25;
	//	}
	//}
			
}

ga.prototype.evolve = function () {
	this.population.sort(function(a, b) {
		return b.score - a.score;
	});

	var scores = new Array();
	for (var a = 0;a < this.population.length;a++)
		scores.push(this.population[a].score / this.passes.length);
	console.log('Scores:', scores);

	var amt = this.population.length - this.keep_elite;
	var pick = this.selectSUS(amt >> 1);
	var elite = this.selectElite(this.keep_elite);

	var build = new Array();

	for (var a = 0;a < amt;a++) {
		var r1 = parseInt(Math.random() * pick.length);
		var r2 = parseInt(Math.random() * pick.length);
		
		//build = build.concat(this.crossoverOne(pick[r1], pick[r2]));
		build.push(this.crossoverBlendUniform(pick[r1], pick[r2]));
	}

	for (var a = 0;a < build.length;a++) {
		this.mutate(build[a]);
	}

	for (var a = 0;a < this.keep_elite;a++) {
		build.push(new ga_organism(this.w, this.h, this.depth, elite[a].features));
	}

	this.population = build;
}

function ga_organism(w, h, depth, features) {
	this.w = w;
	this.h = h;
	this.depth = depth;
	this.features = features;

	this.score = 0;

	this.have = new Array(16);

	this.ai = new ai_grid(this.w, this.h, this.depth + 4, features);
}

ga_organism.prototype.get = function (loc) {
	return this.ai.get(loc);
} 

ga_organism.prototype.set = function (x, y, val) {
	this.ai.set(x, y, val);
}

ga_organism.prototype.set_loc = function (loc, val) {
	this.ai.set_loc(loc, val);
}

ga_organism.prototype.start = function () {

}

ga_organism.prototype.clear = function() {
	for (var a = 0;a < this.w * this.h;a++)
		this.set_loc(a, 0);
}

ga_organism.prototype.step = function() {
	this.score++;

	var inc = 0;
	/*var sum = this.sum + 20;
	for (var a = 9;a < 11;a++) {
		var mask = (1 << a);

		var m = sum & mask;
		var low = sum & (mask - 1);
		if (m) {
			if (!this.have[a]) {
				for (var b = 0;b < this.w * this.h;b++) {
					if (this.ai.get(b) == a) {
						this.have[b] = true;
					}
				}
			}
			if (!this.have[a]) {
				inc = a - 8;
			}
		} else {
			this.have[a] = false;
		}
	}*/

	/*var cnt = 0;
	this.have[0] = true;
	for (var a = 1;a < 16;a++)
		this.have[a] = false;
	for (var b = 0;b < this.w * this.h;b++) {
		var a = this.ai.get(b);
		if (this.have[a])
			continue;
		this.have[a]++;
		cnt++;
	}

	if (cnt > 8)
		inc = cnt - 8;*/

	if (this.sum >= 1900)
		inc = 1;
	else if (this.sum >= 3800)
		inc = 2;

	var dir = this.ai.bruteforce(this.depth + inc);

	if (dir == -1) {
		return false;
	}

	if (!this.ai.move(dir)) {
		/* Silly algorithm, you can't do that */
		console.log("Illegal Move", dir, "AI:", this.ai);
		return false;
	}

	return true;
}
