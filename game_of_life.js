var state = null;

var GAME_WIDTH = 200;
var GAME_HEIGHT = 200;
var BLOCK_SIZE = 5;

function init() {
  create_game();

  setInterval(next_turn, 250);

  document.addEventListener('mousemove', onMouseMove, false);
}

function create_game() {
  state = new Array(GAME_WIDTH);
  for (var i = 0; i < GAME_WIDTH; i++) {
    var column = new Array(GAME_HEIGHT);
    state[i] = column;
    for (var j = 0; j < GAME_HEIGHT; j++) {
      state[i][j] = 0;
    }
  }
}

function next_turn() {
  iterate_game();
  draw_board(state);
}

function iterate_game() {
  var new_board = new Array(GAME_WIDTH);
  for (var i = 0; i < GAME_WIDTH; i++) {
    var column = new Array(GAME_HEIGHT);
    new_board[i] = column;
    for (var j = 0; j < GAME_HEIGHT; j++) {
      var val = iterate_position(state, i, j);
      new_board[i][j] = val;
    }
  }

  state = new_board;
}

function iterate_position(board, x, y) {
  var living_neighbours = 0;

  var min_x = Math.max(x - 1, 0);
  var max_x = Math.min(x + 1, board.length - 1);

  var min_y = Math.max(y - 1, 0);
  var max_y = Math.min(y + 1, board[x].length - 1);

  for (var i = min_x; i <= max_x; i++) {
    for (var j = min_y; j <= max_y; j++) {
      if (i == x && j == y) {
        continue;
      }

      if (board[i][j] != 0) {
        living_neighbours++;
      }
    }
  }

  if (board[x][y] != 0) {
    if (living_neighbours == 2 || living_neighbours == 3) {
      return board[x][y] + 1;
    }
    return 0;
  } else {
    return +(living_neighbours == 3);
  }
}

function draw_board(board) {
  // TODO: Double buffer.
  var canvas = document.getElementById('background');
  var context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (var i = 0; i < GAME_HEIGHT; i++) {
    for (var j = 0; j < GAME_WIDTH; j++) {
      if (board[j][i] != 0) {
        var val = board[j][i];
        val = 256 - Math.min(val * 16, 256);
        val = val.toString(16);
        var hex_colour = '#' + val + val + val;
        context.fillStyle = hex_colour;
        context.fillRect(
          j * BLOCK_SIZE,
          i * BLOCK_SIZE,
          BLOCK_SIZE,
          BLOCK_SIZE
        );
      }
    }
  }
}

function onMouseMove(e) {
  var x = Math.floor(e.x / BLOCK_SIZE);
  var y = Math.floor(e.y / BLOCK_SIZE);

  if (typeof(state[x]) != "undefined" &&
      typeof(state[x][y]) != "undefined" &&
      state[x][y] == 0) {
    state[x][y] = 3;
  }
}

init();
