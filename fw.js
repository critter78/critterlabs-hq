(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var colors = ['#F5C842', '#3B8BFF', '#4ADE80', '#ffffff'];
  var layer;
  function ensureLayer() {
    if (layer) return layer;
    layer = document.createElement('div');
    layer.style.cssText = 'position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:9999';
    document.body.appendChild(layer);
    return layer;
  }
  function burst() {
    if (document.hidden) return;
    var logo = document.querySelector('.lmark-wrap') || document.querySelector('.logo');
    if (!logo) return;
    var r = logo.getBoundingClientRect();
    var ox = r.left + r.width / 2, oy = r.top + r.height / 2;
    var L = ensureLayer();
    var reach = Math.min(window.innerWidth, window.innerHeight) * 0.72;
    var n = 80;
    for (var i = 0; i < n; i++) {
      (function () {
        var p = document.createElement('span');
        var c = colors[Math.floor(Math.random() * colors.length)];
        var size = 3 + Math.random() * 4;
        p.style.cssText = 'position:absolute;left:' + ox + 'px;top:' + oy + 'px;width:' + size +
          'px;height:' + size + 'px;border-radius:50%;background:' + c +
          ';box-shadow:0 0 ' + (8 + size) + 'px ' + c + ',0 0 4px ' + c + ';will-change:transform,opacity';
        L.appendChild(p);
        var ang = Math.random() * Math.PI * 2;
        var dist = reach * (0.3 + Math.random() * 0.7);
        var dx = Math.cos(ang) * dist;
        var dy = Math.sin(ang) * dist;
        var grav = dist * 0.45;
        var dur = 1100 + Math.random() * 1100;
        var start = null;
        function step(ts) {
          if (start === null) start = ts;
          var t = (ts - start) / dur;
          if (t >= 1) { p.remove(); return; }
          var ease = 1 - Math.pow(1 - t, 2);
          var x = dx * ease;
          var y = dy * ease + grav * t * t;
          p.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + (1 - 0.55 * t) + ')';
          p.style.opacity = String(1 - t * t);
          requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      })();
    }
  }
  setTimeout(burst, 1300);
  setInterval(burst, 100000);
})();
