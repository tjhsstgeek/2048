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
				c -= 0x40000;
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

	/* Total # of places that element could fall */
	var tot = 0;
	/* Total # of safe places */
	var safe = 0;
	/* What is the probability of losing in this situation */
	var prob_lose = 0;
	/* What is the total score */
	var score = 0;

	var tmp = this.dup();

	var prev_y = [null, null, null, null];
	for (var y = 0;y < this.h;y++) {
		var prev_x = null;
		for (var x = 0;x < this.w;x++) {
			if (this.get(y * this.w + x) != 0) {
				prev_y[x] = prev_x = null;
				continue;
			}

			tot++;

			/* Easy access array */
			var prev = [prev_y[x], prev_x, prev_y[x], prev_x];

			var prob_lose_2 = 1, prob_lose_4 = 1;
			var score_2 = 0, score_4 = 0;

			for (var dir = 0;dir < 4;dir++) {
				if (prev[dir]) {
					var c = prev[dir];
					if (c[0] < prob_lose_2 && c[2] > score_2) {
						prob_lose_2 = c[0];
						score_2 = c[2];
					}
					if (c[1] < prob_lose_4 && c[3] > score_4) {
						prob_lose_4 = c[1];
						score_4 = c[3];
					}
					continue;
				}

				tmp.set(y * this.w + x, 1);
				if (tmp.move(dir)) {
					var c = tmp.bruteforce_recurse(n - 1);
					if (c[1] < prob_lose_2 && c[0] > score_2) {
						prob_lose_2 = c[1];
						score_2 = c[0];
					}

					tmp.reset(this);
				} else {
					/* No moves done, so grid unchanged */
				}

				tmp.set(y * this.w + x, 2);
				if (tmp.move(dir)) {
					var c = tmp.bruteforce_recurse(n - 1);
					if (c[1] < prob_lose_4 && c[0] > score_4) {
						prob_lose_4 = c[1];
						score_4 = c[0];
					}

					tmp.reset(this);
				} else {
					/* No moves done, so grid unchanged */
				}
			}

			/* Reset the index in tmp */
			tmp.set(y * this.w + x, 0);

			score += 0.9 * score_2 + 0.1 * score_4;
			prob_lose += 0.9 * prob_lose_2 + 0.1 * prob_lose_4

			prev_y[x] = prev_x = [prob_lose_2, prob_lose_4, score_2, score_4];
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
