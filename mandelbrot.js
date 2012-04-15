var MAX_ITERS = 4000;

var X_MIN = -2;
var X_MAX = 1;
var Y_MIN = -1;
var Y_MAX = 1;

var X_DIST = X_MAX - X_MIN;
var Y_DIST = Y_MAX - Y_MIN;

var WIDTH = 700;
var HEIGHT = 500;

var ZOOM_RATIO = 1;
var VIEWPORT_X = -2;
var VIEWPORT_Y = -1;

// WIDTH * HEIGHT array of ints.
// Each value corresponds to the number of times an escaping sequence passed
// through this pixel.
var points;
function initPoints() {
  points = new Array(WIDTH);
  for (var i = 0; i < points.length; i++) {
    points[i] = new Array(HEIGHT);
    for (var j = 0; j < points[i].length; j++) {
      points[i][j] = 0;
    }
  }
}
initPoints();

function init() {
  var start = +new Date();
  calcPoints();
  var end = +new Date();
  console.log('Took ' + (end - start) + 'ms to calculate points');
  drawPoints();
  end = +new Date();
  console.log('Took ' + (end - start) + 'ms total');
}

function calcPoints() {
  var coords_to_draw = [];
  // Determine a first point.

  var coord = null;
  var last_len = 0;
  for (var i = 0; i < MAX_ITERS; i++) {
    var x = X_MIN + X_DIST * Math.random();
    var y = Y_MIN + Y_DIST * Math.random();

    if (isInMandelbrot([x, y])) {
      continue;
    }

    last_len = escapePathLength(x, y);
    if (last_len > 0) {
      coord = [x, y];
      coords_to_draw.push(coord);
      break;
    }
  }

  while (coords_to_draw.length < 50000) {
    var candidate = mutate(coord);
    if (isInMandelbrot(candidate)) {
      continue;
    }

    var len = escapePathLength(candidate[0], candidate[1]);

    if (len == 0) {
      continue;
    }

    var prob = len / last_len;

    if (Math.random() < prob) {
      coords_to_draw.push(candidate);
      coord = candidate;
      last_len = len;
    }
  }

  for (var i = 0; i < coords_to_draw.length; i++) {
    var coord_0 = coords_to_draw[i];
    var x_0 = coord_0[0];
    var y_0 = coord_0[1];

    var x = 0;
    var y = 0;
    for (var k = 0; k < MAX_ITERS; k++) {
      var new_x = x * x - y * y + x_0;
      var new_y = 2 * x * y + y_0;

      x = new_x;
      y = new_y;
      if (new_x * new_x + new_y * new_y > 4) {
        drawCoordsFrom(x_0, y_0);
        break;
      }
    }
  }
}

function escapePathLength(x, y) {
  var x_0 = x;
  var y_0 = y;

  var in_viewport = false;

  var viewport_x_max = VIEWPORT_X + X_DIST / ZOOM_RATIO;
  var viewport_y_max = VIEWPORT_Y + Y_DIST / ZOOM_RATIO;

  for (var i = 0; i < MAX_ITERS; i++) {
    var new_x = x * x - y * y + x_0;
    var new_y = 2 * x * y + y_0;

    x = new_x;
    y = new_y;

    if (x > VIEWPORT_X && x < viewport_x_max &&
        y > VIEWPORT_Y && y < viewport_y_max) {
      in_viewport = true;
    }

    if (x * x + y * y > 4) {
      if (in_viewport) {
        return i + 1;
      } else {
        return 0;
      }
    }
  }

  return 0;
}

function drawCoordsFrom(x, y) {
  var x_0 = x;
  var y_0 = y;

  while (x * x + y * y <= 4) {
    var px = coordToPixel(x, y);
    incrementPixel(px);

    var new_x = x * x - y * y + x_0;
    var new_y = 2 * x * y + y_0;

    x = new_x;
    y = new_y;
  }
}

function mutate(coord) {
  var x = coord[0];
  var y = coord[1];

  x = X_MIN + X_DIST * Math.random();
  y = Y_MIN + Y_DIST * Math.random();

  return [x, y];
}

function pixelToCoord(i, j) {
  var x = VIEWPORT_X + X_DIST / ZOOM_RATIO * (i / WIDTH);
  var y = VIEWPORT_Y + Y_DIST / ZOOM_RATIO * (j / HEIGHT);

  return [x, y];
}

function coordToPixel(x, y) {
  var x = Math.floor((x - VIEWPORT_X) / (X_DIST / ZOOM_RATIO) * WIDTH);
  var y = Math.floor((y - VIEWPORT_Y) / (Y_DIST / ZOOM_RATIO) * HEIGHT);

  return [x, y];
}

function incCoords(coords) {
  for (var i = 0; i < coords.length; i++) {
    var coord = coords[i];
    var pixel = coordToPixel(coord[0], coord[1]);
    incrementPixel(pixel);
  }
}

function incrementPixel(pixel) {
  if (pixel[0] < 0 || pixel[1] < 0 || pixel[0] >= WIDTH || pixel[1] >= HEIGHT)
    return;

  points[pixel[0]][pixel[1]]++;
}

function deletePixel(pixel) {
  if (pixel[0] < 0 || pixel[1] < 0 || pixel[0] >= WIDTH || pixel[1] >= HEIGHT)
    return;

  points[pixel[0]][pixel[1]] = 0;
}

function drawPoints() {
  var canvas = document.getElementById('background');
  var context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.width, canvas.height);

  var max = 1;
  for (var i = 0; i < points.length; i++) {
    for (var j = 0; j < points[i].length; j++) {
      if (points[i][j] > max) {
        max = points[i][j];
      }
    }
  }
  console.log('Max value: ' + max);

  var image_data = context.createImageData(WIDTH, HEIGHT);

  for (var x = 0; x < WIDTH; x++) {
    for (var y = 0; y < HEIGHT; y++) {
      var val = points[x][y];

      var r = 0;
      var g = 0;
      var b = 0;
      if (val == 0) {
        r = g = b = 0;
      } else {
        var ratio = val / max;

        // 0.3219280948 = ln(0.8) / ln(0.5)
        if (ratio < 0.5) {
          ratio = 0.5 * Math.pow(2 * ratio, 0.3219280948);
        } else {
          ratio = 0.5 * (2 - Math.pow(2 - 2 * ratio, 0.3219280948));
        }

        val = Math.floor(ratio * 255);
        r = g = b = val;
      }

      var idx = (x + (y * WIDTH)) * 4;
      image_data.data[idx] = r;
      image_data.data[idx + 1] = g;
      image_data.data[idx + 2] = b;
      image_data.data[idx + 3] = 255;
    }
  }

  context.putImageData(image_data, 0, 0);
}

function isInMandelbrot(coord) {
  var x = coord[0];
  var y = coord[1];

  if ((x >  -1.2 && x <=  -1.1 && y >  -0.1 && y < 0.1) ||
      (x >  -1.1 && x <=  -0.9 && y >  -0.2 && y < 0.2) ||
      (x >  -0.9 && x <=  -0.8 && y >  -0.1 && y < 0.1) ||
      (x > -0.69 && x <= -0.61 && y >  -0.2 && y < 0.2) ||
      (x > -0.61 && x <=  -0.5 && y > -0.37 && y < 0.37) ||
      (x >  -0.5 && x <= -0.39 && y > -0.48 && y < 0.48) ||
      (x > -0.39 && x <=  0.14 && y > -0.55 && y < 0.55) ||
      (x >  0.14 && x <   0.29 && y > -0.42 && y < -0.07) ||
      (x >  0.14 && x <   0.29 && y >  0.07 && y < 0.42)) {
    return true;
  }

  return false;
}

// TODO: Make this react to onload.
setTimeout(init, 250);
