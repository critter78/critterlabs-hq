(function () {
  var lb, lbImg, lbCur, lbTot, lbList, lbIdx;

  function buildLB() {
    lb = document.createElement('div');
    lb.className = 'glb';
    lb.innerHTML = '<button class="glb-close" type="button" aria-label="Close">×</button>'
      + '<button class="glb-nav glb-prev" type="button" aria-label="Previous">‹</button>'
      + '<img alt="">'
      + '<button class="glb-nav glb-next" type="button" aria-label="Next">›</button>'
      + '<div class="glb-count"><b class="glb-cur">1</b> / <span class="glb-tot">1</span></div>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img');
    lbCur = lb.querySelector('.glb-cur');
    lbTot = lb.querySelector('.glb-tot');
    lb.querySelector('.glb-close').addEventListener('click', closeLB);
    lb.querySelector('.glb-prev').addEventListener('click', function (e) { e.stopPropagation(); lbShow(lbIdx - 1); });
    lb.querySelector('.glb-next').addEventListener('click', function (e) { e.stopPropagation(); lbShow(lbIdx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLB();
      else if (e.key === 'ArrowLeft') lbShow(lbIdx - 1);
      else if (e.key === 'ArrowRight') lbShow(lbIdx + 1);
    });
  }

  function openLB(list, start) {
    if (!lb) buildLB();
    lbList = list;
    lbTot.textContent = list.length;
    lbShow(start);
    lb.classList.add('open');
  }
  function lbShow(i) {
    lbIdx = (i + lbList.length) % lbList.length;
    lbImg.src = lbList[lbIdx].src;
    lbCur.textContent = lbIdx + 1;
  }
  function closeLB() { lb.classList.remove('open'); }

  function setup(g) {
    var imgs = [].slice.call(g.querySelectorAll('.gimg'));
    if (!imgs.length) return;
    var dotsWrap = g.querySelector('.gdots');
    var cur = g.querySelector('.gcur');
    var tot = g.querySelector('.gtot');
    var idx = 0, dots = [];
    if (tot) tot.textContent = imgs.length;

    function show(i) {
      idx = (i + imgs.length) % imgs.length;
      imgs.forEach(function (im, j) { im.classList.toggle('active', j === idx); });
      dots.forEach(function (d, j) { d.classList.toggle('active', j === idx); });
      if (cur) cur.textContent = idx + 1;
    }

    if (dotsWrap) {
      imgs.forEach(function (im, i) {
        var d = document.createElement('i');
        if (i === 0) d.className = 'active';
        d.addEventListener('click', function () { show(i); });
        dotsWrap.appendChild(d);
        dots.push(d);
      });
    }

    var prev = g.querySelector('.gprev'), next = g.querySelector('.gnext');
    if (prev) prev.addEventListener('click', function () { show(idx - 1); });
    if (next) next.addEventListener('click', function () { show(idx + 1); });
    imgs.forEach(function (im) { im.addEventListener('click', function () { openLB(imgs, idx); }); });
  }

  [].slice.call(document.querySelectorAll('[data-gallery]')).forEach(setup);
})();
