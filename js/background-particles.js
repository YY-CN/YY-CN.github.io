(function() {
  'use strict';

  var canvas = document.getElementById('background-particles');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!canvas || reduceMotion.matches) return;

  var context = canvas.getContext('2d');
  if (!context) return;

  var particles = [];
  var frameId = 0;
  var width = 0;
  var height = 0;
  var pixelRatio = 1;
  var mouse = { x: -1000, y: -1000, active: false };
  var palette = {
    point: 'rgba(154, 101, 69, .42)',
    line: '154, 101, 69'
  };

  function particleCount() {
    var areaCount = Math.round((width * height) / 26000);
    var mobile = window.matchMedia('(max-width: 767px)').matches;
    return Math.max(mobile ? 18 : 28, Math.min(areaCount, mobile ? 34 : 68));
  }

  function makeParticle() {
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.08 + Math.random() * 0.16;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1 + Math.random() * 1.15,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed
    };
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    var count = particleCount();
    if (particles.length > count) particles.length = count;
    while (particles.length < count) particles.push(makeParticle());
  }

  function connect(a, b, distance, maxDistance, strength) {
    var opacity = (1 - distance / maxDistance) * strength;
    if (opacity <= 0) return;

    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.strokeStyle = 'rgba(' + palette.line + ', ' + opacity.toFixed(3) + ')';
    context.lineWidth = 0.7;
    context.stroke();
  }

  function draw() {
    context.clearRect(0, 0, width, height);

    for (var i = 0; i < particles.length; i++) {
      var particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -8) particle.x = width + 8;
      if (particle.x > width + 8) particle.x = -8;
      if (particle.y < -8) particle.y = height + 8;
      if (particle.y > height + 8) particle.y = -8;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = palette.point;
      context.fill();

      for (var j = i + 1; j < particles.length; j++) {
        var other = particles[j];
        var dx = particle.x - other.x;
        var dy = particle.y - other.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 132) connect(particle, other, distance, 132, 0.18);
      }

      if (mouse.active) {
        var mouseDx = particle.x - mouse.x;
        var mouseDy = particle.y - mouse.y;
        var mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
        if (mouseDistance < 155) {
          connect(particle, mouse, mouseDistance, 155, 0.34);
        }
      }
    }

    frameId = window.requestAnimationFrame(draw);
  }

  function start() {
    if (!frameId && !document.hidden) frameId = window.requestAnimationFrame(draw);
  }

  function stop() {
    if (!frameId) return;
    window.cancelAnimationFrame(frameId);
    frameId = 0;
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', function() {
    mouse.active = false;
  });
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) stop();
    else start();
  });
  reduceMotion.addEventListener('change', function(event) {
    if (event.matches) {
      stop();
      canvas.hidden = true;
    } else {
      canvas.hidden = false;
      resize();
      start();
    }
  });

  resize();
  start();
})();
