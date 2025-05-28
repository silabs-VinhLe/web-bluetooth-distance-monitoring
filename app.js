var canvas = document.querySelector('canvas');
var statusText = document.querySelector('#statusText');
const distance_maximum = 10

statusText.addEventListener('click', function() {
  statusText.textContent = 'Connecting...';
  distances = [];
  console.log('connecting...');
  distanceMonitoring.connect()
  .then(() => distanceMonitoring.startNotificationsDistanceMonitoring().then(handleDistanceMonitoring))
  .catch(error => {
    statusText.textContent = error;
  });
});

function handleDistanceMonitoring(distanceMeasurement) {
  distanceMeasurement.addEventListener('characteristicvaluechanged', event => {
    var distanceMeasurement = distanceMonitoring.parseDistanceMonitoring(event.target.value);
    statusText.innerHTML = Math.round(distanceMeasurement.distance * 10) / 10 + ' m';
    distances.push(distanceMeasurement.distance);
    drawWaves();
  });
}

var distances = [];
var mode = 'bar';

canvas.addEventListener('click', event => {
  mode = mode === 'graph' ? 'bar' : 'graph';
  drawWaves();
});

function drawWaves() {
  requestAnimationFrame(() => {
    canvas.width = parseInt(getComputedStyle(canvas).width.slice(0, -2)) * devicePixelRatio;
    canvas.height = parseInt(getComputedStyle(canvas).height.slice(0, -2)) * devicePixelRatio;

    var context = canvas.getContext('2d');
    var margin = 2;
    var max = Math.max(0, Math.round(canvas.width / 11));
    var offset = Math.max(0, distances.length - max);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#005d79';
    if (mode === 'graph') {
      for (var i = 0; i < Math.max(distances.length, max); i++) {
        var barHeight = Math.round(distances[i + offset ] * canvas.height / distance_maximum);
        context.rect(11 * i + margin, canvas.height - barHeight, margin, Math.max(0, barHeight - margin));
        context.stroke();
      }
    } else if (mode === 'bar') {
      var barHeight = 50;
      var barWidth = Math.round(distances[distances.length - 1] * canvas.width / distance_maximum);
      var grd = context.createLinearGradient(0, 0, barWidth, barHeight);
      grd.addColorStop(0, "red");
      grd.addColorStop(1, "blue");
      context.fillStyle = grd;
      context.fillRect(0, canvas.height - barHeight, barWidth, barHeight);
    }
  });
}

window.onresize = drawWaves;

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    drawWaves();
  }
});
