function ai_grid(w, h, depth, features) {
	this.arr = new Array(w * h);
	for (var a = 0;a < w * h;a++)
		this.arr[a] = 0;

	this.w = w;
	this.h = h;

	this.features = features;

	this.data_arr = new Array(this.w * this.h * 4 * 2);

	if (depth)
		this.child = new ai_grid(w, h, depth - 1, features);
}

ai_grid.prototype.dup = function () {
	this.child.reset(this);
	return this.child;
	//return new ai_grid(this.w, this.h, this.arr, this.features);
}

ai_grid.prototype.get = function (loc) {
	return this.arr[loc];
}

ai_grid.prototype.set = function (x, y, val) {
	this.arr[y * this.w + x] = val;
}

ai_grid.prototype.set_loc = function (loc, val) {
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

ai_grid.prototype.normal_grid = function() {
	/* Return a normalized grid where the largest element is in the bottom left hand corner */
	/* Theoretically, most large elements would be clumped around the largest element
	 * and the small elements would be clumped on the other side (top right corner) */

	var largest = 0;
	for (var a = 1;a < this.w * this.h;a++)
		if (this.get(a) > this.get(largest))
			largest = a;

	var x = largest % this.w;
	var y = (largest - x) / this.w;

	var mult_x = 2 * x + 1;
	var left = mult_x < this.w;
	var right = mult_x > this.w;
	var mult_y = 2 * x + 1;
	var bottom = mult_y < this.h;
	var top = mult_y > this.h;

	if (left) {
		if (top) {

		} else {

		}
	} else if (right) {
		if (top) {

		} else {
			
		}
	} else {
		if (top) {

		}
	}
}

ai_grid.prototype.move = function (dir) {
	// 0: up, 1: right, 2:down, 3: left
	/* comb_step is for combining elements in a row/column
	 * iter_step is for iterating through the rows/columns
	 * start is the first node to visit */
	var comb_step, iter_step, start, comb_max, iter_max;
	if (dir == 0) {
		comb_step = this.w;
		iter_step = 1;
		start = 0;
		comb_max = this.h;
		iter_max = this.w;
	} else if (dir == 2) {
		comb_step = -this.w;
		iter_step = -1;
		start = this.arr.length - 1;
		comb_max = this.h;
		iter_max = this.w;
	} else if (dir == 1) {
		comb_step = -1;
		iter_step = -this.w;
		start = this.arr.length - 1;
		comb_max = this.w;
		iter_max = this.h;
	} else if (dir == 3) {
		comb_step = 1;
		iter_step = this.w;
		start = 0;
		comb_max = this.w;
		iter_max = this.h;
	} else
		return false;

	var diff = 0;

	for (var j = 0;j < iter_max;j++) {
		var merged = false;
		var slot = 0;

		for (var k = 0;k < comb_max;k++) {
			var loc = start + iter_step * j + comb_step * k;
			var val = this.get(loc);

			/* Skip empty cells */
			if (!val)
				continue;

			if (!merged && slot) {
				/* We only look at shifted values */
				var loc_merge = start + iter_step * j + comb_step * (slot - 1);
				var val_merge = this.get(loc_merge);

				if (val == val_merge) {
					this.set_loc(loc_merge, val + 1);
					this.set_loc(loc, 0);
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

			var loc_to = start + iter_step * j + comb_step * slot;
			this.set_loc(loc, 0);
			this.set_loc(loc_to, val);
			slot++;
			diff++;
		}
	}

	return diff != 0;
}

ai_grid.prototype.score = function () {
	var loc = 0;
	var amt = this.avail();
	var c = 0x10000 + 0x400 * amt * this.features[0];
	loc++;

	/* TODO: Try to find chains and check that the smallest element in
	 *       the chain is not surrounded by larger elements as this would
	 *       make the element inaccessible. */

	for (var i = 0;i < this.h;i++) {
		var edge_y = (i == 0) || (i + 1 == this.h);
		for (var j = 0;j < this.w;j++) {
			var edge_x = (j == 0) || (j + 1 == this.w);

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
				if (edge_x && edge_y)
					c -= 0x400 * this.features[32 + n + loc];
				else if (edge_x || edge_y)
					c -= 0x400 * this.features[16 + n + loc];
				else
					c -= 0x400 * this.features[n + loc];
			}
		}
	}
	loc += 3 * 16;

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
				c += 0x400 * this.features[n + loc];
			}
		}
	}
	loc += 16;

	/* TODO: No more than three copies of a tile */

	/*for (var i = 0;i < this.w * this.h;i++) {
		if (this.get(i))
			c += Math.pow(2, this.get(i)) * this.features[4 + i];
	}*/

	/*for (var i = 0;i < 4;i++) {
		var prev = this.get(4 * i);
		for (var j = 1;j < 4;j++) {
			var next = this.get(4 * i + j);
			if (next > prev) {
				c -= 0x400 * this.features[prev * 16 + next + loc];
				//c -= (Math.pow(2, next) - Math.pow(2, prev)) * this.features[4 * i + j + loc];
				//c -= (next - prev) * this.features[4 * i + j + loc];
			}
			prev = next;
		}
	}
	loc += 256;
	for (var i = 0;i < 4;i++) {
		var prev = this.get(i);
		for (var j = 1;j < 4;j++) {
			var next = this.get(i + 4 * j);
			if (next > prev) {
				c -= 0x400 * this.features[prev * 16 + next + loc];
				//c -= (Math.pow(2, next) - Math.pow(2, prev)) * this.features[4 * i + j + loc];
			}
			prev = next;
		}
	}
	loc += 256;*/

	return c;

}

ai_grid.prototype.bruteforce_recurse = function (n) {
	if (n == 0) {
		/* Let something else handle the intricate details */
		return [this.score(), 0];
	}

	var tot = this.avail();

	var data_arr = this.data_arr;

	var tmp = this.dup();

	for (var dir = 0; dir < 4; dir++) {
		var comb_step, iter_step, start, comb_max, iter_max;
		if (dir == 0) {
			comb_step = this.w;
			iter_step = 1;
			start = 0;
			comb_max = this.h;
			iter_max = this.w;
		} else if (dir == 2) {
			comb_step = -this.w;
			iter_step = -1;
			start = this.arr.length - 1;
			comb_max = this.h;
			iter_max = this.w;
		} else if (dir == 1) {
			comb_step = -1;
			iter_step = -this.w;
			start = this.arr.length - 1;
			comb_max = this.w;
			iter_max = this.h;
		} else if (dir == 3) {
			comb_step = 1;
			iter_step = this.w;
			start = 0;
			comb_max = this.w;
			iter_max = this.h;
		}

		for (var j = 0;j < iter_max;j++) {
			var merged = false;
			var slot = 0;

			for (var k = 0;k < comb_max;k++) {
				var prev = start + iter_step * j + comb_step * (k - 1);

				var loc = start + iter_step * j + comb_step * k;
				var val = this.get(loc);

				data_arr[loc * 8 + dir * 2 + 0] = data_arr[loc * 8 + dir * 2 + 1] = null;

				if (val)
					continue;

				if (k && data_arr[prev * 8 + dir * 2 + 0]) {
					data_arr[loc * 8 + dir * 2 + 0] = data_arr[prev * 8 + dir * 2 + 0];
				} else {
					tmp.set_loc(loc, 1);
					if (tmp.move(dir)) {
						data_arr[loc * 8 + dir * 2 + 0] = tmp.bruteforce_recurse(n - 1);
						tmp.reset(this);
					}
				}

				if (k && data_arr[prev * 8 + dir * 2 + 1]) {
					data_arr[loc * 8 + dir * 2 + 1] = data_arr[prev * 8 + dir * 2 + 1];
				} else {
					tmp.set_loc(loc, 2);
					if (tmp.move(dir)) {
						data_arr[loc * 8 + dir * 2 + 1] = tmp.bruteforce_recurse(n - 1);
						tmp.reset(this);
					}
				}

				tmp.set_loc(loc, 0);
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
				//if (data_arr[loc] && data_arr[loc][1] < prob_lose_2 && data_arr[loc][0] > score_2) {
				//if (data_arr[loc] && (data_arr[loc][1] < prob_lose_2 || (data_arr[loc][1] == prob_lose_2 && data_arr[loc][0] > score_2))) {
				if (data_arr[loc] && (data_arr[loc][0] > score_2 || (data_arr[loc][0] == score_2 && data_arr[loc][1] < prob_lose_2))) {
					prob_lose_2 = data_arr[loc][1];
					score_2 = data_arr[loc][0];
				}
				/* TODO: is this really the best choice */
				//if (data_arr[loc + 1] && data_arr[loc + 1][1] < prob_lose_4 && data_arr[loc + 1][0] > score_4) {
				//if (data_arr[loc + 1] && (data_arr[loc + 1][1] < prob_lose_4 || (data_arr[loc + 1][1] == prob_lose_4 && data_arr[loc + 1][0] > score_4))) {
				if (data_arr[loc + 1] && (data_arr[loc + 1][1] > score_4 || (data_arr[loc + 1][0] == score_4 && data_arr[loc + 1][1] < prob_lose_4))) {
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
		//console.log(i, v);
		if (v[0] > best) {
			best = v[0];
			dir = i;
		}

		tmp.reset(this);
	}
	//console.log("done", dir);
	return dir;
}
