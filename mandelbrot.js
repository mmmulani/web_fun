var MAX_ITERS = 256;

var X_MIN = -2;
var X_MAX = 1;
var Y_MIN = -1;
var Y_MAX = 1;

function init() {
  var width = 700;
  var height = 500;
  var points = calcPoints(width, height);
  drawPoints(points, width, height);
}

function calcPoints(width, height) {
  var points = new Array(width * height);

  for (var i = 0; i < points.length; i++) {
    points[i] = 0;
  }

  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      var orig_px = [i, j];
      var coord = pixelToCoord(i, j, width, height);
      var x_0 = coord[0];
      var y_0 = coord[1];

      var coords = [coord];

      for (var k = 0; k < MAX_ITERS; k++) {
        var x = coord[0];
        var y = coord[1];
        var new_x = x * x - y * y + x_0;
        var new_y = 2 * x * y + y_0;

        coord = [new_x, new_y];
        coords.push(coord);
        if (new_x * new_x + new_y * new_y > 4) {
          incCoords(coords, points, width, height);
          break;
        }
      }
    }
  }

  console.log('max:');
  var max = 0;
  for (var i = 0; i < points.length; i++) {
    if (points[i] > max) {
      max = points[i];
    }
  }
  console.log(max);

  return points;
}

function pixelToCoord(i, j, width, height) {
  var x_dist = X_MAX - X_MIN;
  var y_dist = Y_MAX - Y_MIN;
  var x = X_MIN + x_dist * (i / width);
  var y = Y_MIN + y_dist * (j / height);

  return [x, y];
}

function coordToPixel(x, y, width, height) {
  var x_dist = X_MAX - X_MIN;
  var y_dist = Y_MAX - Y_MIN;
  var x = Math.floor((x - X_MIN) / x_dist * width);
  var y = Math.floor((y - Y_MIN) / y_dist * height);

  return [x, y];
}

function incCoords(coords, points, width, height) {
  for (var i = 0; i < coords.length; i++) {
    var coord = coords[i];
    var pixel = coordToPixel(coord[0], coord[1], width, height);
    incrementPixel(pixel, points, width, height);
  }
}

function incrementPixel(pixel, points, width, height) {
  var pos = (pixel[1] * width) + pixel[0];
  points[pos]++;
}

function deletePixel(pixel, points, width, height) {
  var pos = (pixel[1] * width) + pixel[0];
  points[pos] = -1;
}

function drawPoints(points, width, height) {
  var canvas = document.getElementById('background');
  var context = canvas.getContext('2d');

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      var val = points[(y * width) + x];
      var fill_style = '';
      if (val == 0) {
        fill_style = 'rgb(0,0,0)';
      } else {
        val = Math.floor((val / 36) * 255);
        fill_style = 'rgb(' + [val, val, val].join(',') + ')';
      }

      context.fillStyle = fill_style;
      context.fillRect(x, y, 1, 1);
    }
  }
}

setTimeout(init, 250);
