function ai_grid(w, h, arr) {
	this.arr = new Array();
	for (var a = 0;a < 16;a++) {
		this.arr[a] = arr[a];
	}

	this.w = w;
	this.h = h;
}

ai_grid.prototype.dup = function () {
	return new ai_grid(this.w, this.h, this.arr);
}

ai_grid.prototype.get = function (loc) {
	return this.arr[loc];
}

ai_grid.prototype.set = function (loc, val) {
	this.arr[loc] = val;
}

ai_grid.prototype.reset = function (other) {
	for (var a = 0; a < this.arr.length; a++) {
		this.arr[a] = other.arr[a];
	}
}

ai_grid.prototype.avail = function () {
	var cnt = 0;
	for (var i = 0;i < 16;i++) {
		if (this.get(i) == 0)
			cnt++;
	}

	return cnt;
}

ai_grid.prototype.move = function (dir) {
	// 0: up, 1: right, 2:down, 3: left
	/* step1 is for combining elements in a row/column
	 * step2 is for iterating through the rows/columns
	 * start is the first node to visit */
	var step1, step2, start;
	if (dir == 0) {
		step1 = this.w;
		step2 = 1;
		start = 0;
	} else if (dir == 2) {
		step1 = -this.w;
		step2 = -1;
		start = this.arr.length - 1;
	} else if (dir == 1) {
		step1 = -1;
		step2 = -this.w;
		start = this.arr.length - 1;
	} else if (dir == 3) {
		step1 = 1;
		step2 = this.w;
		start = 0;
	} else
		return false;

	var diff = 0;

	for (var j = 0;j < 4;j++) {
		var merged = false;
		var slot = 0;

		for (var k = 0;k < 4;k++) {
			var loc = start + step2 * j + step1 * k;
			var val = this.get(loc);

			/* Skip empty cells */
			if (!val)
				continue;

			if (!merged && slot) {
				/* We only look at shifted values */
				var loc_merge = start + step2 * j + step1 * (slot - 1);
				var val_merge = this.get(loc_merge);

				if (val == val_merge) {
					this.set(loc_merge, val + 1);
					this.set(loc, 0);
					merged = true;
					diff++;
					/* This node is gone, so skip shifting it */
					continue;
				}
			} else {
				merged = false;
			}

			if (slot == k) {
				slot++;
				continue;
			}

			var loc_to = start + step2 * j + step1 * slot;
			this.set(loc, 0);
			this.set(loc_to, val);
			slot++;
			diff++;
		}
	}

	return diff != 0;
}

ai_grid.prototype.score = function () {
	/* How bad is this grid */
	var cnt = 0;
	for (var i = 0;i < 16;i++) {
		if (this.get(i) > 0)
			cnt++;
	}

	var c = 0x1000000 - 0x1000 * cnt;

	//var c = 0;

	//var seen = [];

	/*for (var i = 0;i < 4;i++) {
		for (var j = 0;j < 4;j++) {
			var g = this.get(4 * i + j);
			if (seen[""+g])
				continue;
			c += g;
			seen[""+g] = true;
		}
	}*/

	/* TODO: Try to find chains and check that the smallest element in
	 *       the chain is not surrounded by larger elements as this would
	 *       make the element inaccessible. */

	for (var i = 0;i < this.h;i++) {
		for (var j = 0;j < this.w;j++) {
			var border = 4;
			var n = this.get(this.w * i + j);

			if (i) {
				var o = this.get(this.w * (i - 1) + j);
				if (o <= n) border--;
			}

			if (j) {
				var o = this.get(this.w * i + j - 1);
				if (o <= n) border--;
			}

			if (i < 3) {
				var o = this.get(this.w * (i + 1) + j);
				if (o <= n) border--;
			}

			if (j < 3) {
				var o = this.get(this.w * i + j + 1);
				if (o <= n) border--;
			}

			/* An element that is inaccessible because it is
			 * surrounded, severly compromises the grid */
			if (border == 4) {
				c -= 0x10000;
			}
		}
	}

	for (var i = 0;i < this.h;i++) {
		for (var j = 0;j < this.w;j++) {
			var yes = false;

			var n = this.get(this.w * i + j);
			// See if we can collapse this node later on
			if (i) {
				var o = this.get(this.w * (i - 1) + j);
				if (n == o + 1) yes = true;
			}
			if (j) {
				var o = this.get(this.w * i + j - 1);
				if (n == o + 1) yes = true;
			}
			if (i < 3) {
				var o = this.get(this.w * (i + 1) + j);
				if (n == o + 1) yes = true;
			}
			if (j < 3) {
				var o = this.get(this.w * i + j + 1);
				if (n == o + 1) yes = true;
			}
			if (yes) {
				c += Math.pow(2, n);
			}
		}
	}

		/*for (var i = 0;i < 4;i++) {
			var prev = this.get(4 * i);
			for (var j = 1;j < 4;j++) {
				var next = this.get(4 * i + j);
				if (next > prev) {
					c -= Math.pow(2, next) - Math.pow(2, prev);
				}
				prev = next;
			}
		}
		for (var i = 0;i < 4;i++) {
			var prev = this.get(i);
			for (var j = 1;j < 4;j++) {
				var next = this.get(i + 4 * j);
				if (next > prev) {
					c -= Math.pow(2, next) - Math.pow(2, prev);
				}
				prev = next;
			}
		}*/

	return c;

}

ai_grid.prototype.bruteforce_recurse = function (n) {
	if (n == 0) {
		/* Let something else handle the intricate details */
		return [this.score(), 0];
	}

	var tot = this.avail();

	var data_arr = new Array(this.w * this.h * 4 * 2);

	var tmp = this.dup();

	for (var dir = 0; dir < 4; dir++) {
		var step1, step2, start;
		switch (dir) {
		case 0: //Down
			step1 = this.w;
			step2 = 1;
			start = 0;
			break;
		case 3: //Left
			step1 = 1;
			step2 = this.w;
			start = 0;
			break;
		case 1: // Right
			step1 = -1;
			step2 = -this.w;
			start = this.arr.length - 1;
			break;
		case 2: //Up
			step1 = -this.w;
			step2 = -1;
			start = this.arr.length - 1;
			break;
		}

		for (var j = 0;j < 4;j++) {
			var merged = false;
			var slot = 0;

			for (var k = 0;k < 4;k++) {
				var prev = start + step2 * j + step1 * (k - 1);

				var loc = start + step2 * j + step1 * k;
				var val = this.get(loc);

				if (val)
					continue;

				if (k && data_arr[prev * 8 + dir * 2 + 0]) {
					data_arr[loc * 8 + dir * 2 + 0] = data_arr[prev * 8 + dir * 2 + 0];
				} else {
					tmp.set(loc, 1);
					if (tmp.move(dir)) {
						data_arr[loc * 8 + dir * 2 + 0] = tmp.bruteforce_recurse(n - 1);
						tmp.reset(this);
					}
				}

				if (k && data_arr[prev * 8 + dir * 2 + 1]) {
					data_arr[loc * 8 + dir * 2 + 1] = data_arr[prev * 8 + dir * 2 + 1];
				} else {
					tmp.set(loc, 2);
					if (tmp.move(dir)) {
						data_arr[loc * 8 + dir * 2 + 1] = tmp.bruteforce_recurse(n - 1);
						tmp.reset(this);
					}
				}

				tmp.set(loc, 0);
			}
		}
	}

	var score = 0;
	var prob_lose = 0;

	for (var y = 0;y < this.h;y++) {
		for (var x = 0;x < this.w;x++) {
			var prob_lose_2 = prob_lose_4 = 1;
			var score_2 = score_4 = 0;

			if (this.get(y * this.w + x) != 0)
				continue;

			for (var dir = 0;dir < 4;dir++) {
				var loc = y * this.w * 8 + x * 8 + dir * 2;
				/* TODO: is this really the best choice */
				if (data_arr[loc] && data_arr[loc][1] < prob_lose_2 && data_arr[loc][0] > score_2) {
					prob_lose_2 = data_arr[loc][1];
					score_2 = data_arr[loc][0];
				}
				/* TODO: is this really the best choice */
				if (data_arr[loc + 1] && data_arr[loc + 1][1] < prob_lose_4 && data_arr[loc + 1][0] > score_4) {
					prob_lose_4 = data_arr[loc + 1][1];
					score_4 = data_arr[loc + 1][0];
				}
			}
			score += 0.9 * score_2 + 0.1 * score_4;
			prob_lose += 0.9 * prob_lose_2 + 0.1 * prob_lose_4
		}
	}

	return [score / tot, prob_lose / tot];
}

ai_grid.prototype.bruteforce = function(n) {
	var best = 0;
	var dir = -1;

	for (var i = 0;i < 4;i++) {
		var tmp = this.dup();
		if (!tmp.move(i))
			continue;

		var v = tmp.bruteforce_recurse(n - 1);
		console.log(i, v);
		if (v[0] > best) {
			best = v[0];
			dir = i;
		}
	}
	console.log("done", dir);
	return dir;
}
