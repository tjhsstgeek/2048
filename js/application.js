// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  var gm = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalScoreManager);
  var cnt = 2;
  var int = setInterval(function () {
    var arr = [];
    var amt = 0;
    gm.grid.eachCell(function (x, y, tile) {
      if (tile) {
        arr[y * 4 + x] = Math.log(tile.value) / Math.LN2;
        amt++;
      } else {
        arr[y * 4 + x] = 0;
      }
    });
    var r = 4;
    //if (amt >= 13)
    //  r = 5;
    //if (amt >= 12 || (amt >= 10 && gm.keepPlaying))
    //  r = 4;
    //if ((cnt >= 1024 && !gm.keepPlaying) || cnt >= 2048)
    //  r = 5;
    //if ((cnt++ >= 1048 && !gm.keepPlaying) || cnt >= 2072)
    //  r = 6;
    var grid = new ai_grid(4, 4, arr);
    var dir = grid.bruteforce(r);

    if (dir == -1) {
      clearInterval(int);
      return;
    }
    gm.inputManager.emit("move", dir);
//gm.over = true;
    if (gm.over)
      clearInterval(int);
    if (gm.won && !gm.keepPlaying)
      gm.inputManager.emit("keepPlaying");
  }, 10);

  //var a = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];//[3, 2, 0, 1, 2, 5, 4, 2, 1, 4, 7, 5, 2, 6, 8, 2];
  //var ai = new ai_grid(4, 4, a);
  //console.log(ai.bruteforce(4));
});
