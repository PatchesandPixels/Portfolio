/* ════════════════════════════════════════════════════════════════
   PONDDECOR.JS — static shore dressing from the Figma composition
   (Portfolio file, node 693:171). Two layers, both data-driven from
   the placement tables below (percent coordinates of the pond box —
   the decorated bbox: origin (694,86), 803×726 in Figma frame units):

     .pond-ground (z0) — the sandy ground texture under the pond,
       spilling past the box per the layout, feathered by a CSS mask
       so it melts into the page background.
     .pond-decor (z7) — rocks, bushes, flat stones and the stone
       lantern ringing the water, ABOVE the fish and water effects so
       the koi slip beneath the rim.

   Purely presentational: no animation, no interaction, painted once.
   The floating lily pads / lotus flowers are NOT here — they live in
   pondwaves.js' wind-coupled plant layer so they keep bobbing with
   the gusts.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var pond = document.querySelector('.koipond');
  if (!pond) return;

  var DIR = 'assets/koi-pond/';

  /* [file, left%, top%, width%, height%, flipX] */
  var GROUND = ['pond/ground-layer-figma.png', -18, -22, 136, 144, 0];
  var DECOR = [
    ['rocks/stone-tower.png', 0.0, 2.88, 42.23, 47.33, 0],
    ['rocks/round-rock-medium.png', 81.57, 62.95, 5.35, 5.79, 0],
    ['rocks/round-rock-medium.png', 81.2, 49.17, 5.35, 6.06, 0],
    ['rocks/round-rock-medium.png', 42.34, 82.23, 12.7, 14.05, 0],
    ['rocks/round-rock-medium.png', 31.39, 84.57, 8.34, 9.37, 0],
    ['rocks/round-rock-medium.png', 79.58, 66.12, 4.23, 4.68, 0],
    ['rocks/round-rock-large.png', 81.2, 38.43, 8.34, 9.23, 0],
    ['rocks/round-rock-large.png', 65.63, 13.09, 7.6, 8.4, 0],
    ['rocks/round-rock-large.png', 7.1, 56.34, 8.72, 9.64, 0],
    ['rocks/round-rock-large.png', 10.09, 63.5, 5.85, 6.61, 0],
    ['rocks/round-rock-large.png', 38.61, 86.23, 4.98, 5.37, 0],
    ['rocks/round-rock-large.png', 85.43, 35.26, 6.48, 7.16, 0],
    ['rocks/round-rock-large.png', 32.76, 11.85, 3.74, 4.27, 0],
    ['rocks/round-rock-large.png', 45.21, 2.89, 3.86, 4.27, 0],
    ['rocks/round-rock-large.png', 29.64, 13.5, 5.35, 5.92, 0],
    ['rocks/round-rock-large-mid.png', 70.24, 11.29, 12.08, 13.36, 0],
    ['rocks/round-rock-large-mid.png', 12.83, 55.65, 7.1, 7.85, 0],
    ['rocks/round-rock-small.png', 43.09, 2.34, 7.85, 8.68, 0],
    ['rocks/round-rock-small.png', 46.45, 3.17, 7.85, 8.68, 0],
    ['rocks/round-rock-small.png', 32.51, 6.06, 7.97, 8.82, 0],
    ['rocks/round-rock-xl.png', 7.85, 41.6, 7.22, 8.13, 0],
    ['rocks/round-rock-xl.png', 37.36, 87.05, 7.47, 8.26, 0],
    ['rocks/round-rock-xl.png', 9.22, 65.01, 7.22, 8.13, 0],
    ['rocks/round-rock-xl.png', 79.08, 21.49, 20.92, 23.0, 0],
    ['rocks/round-rock-xl.png', 79.95, 51.24, 13.7, 15.15, 0],
    ['rocks/flat-stone-round-small.png', 53.05, 5.51, 10.71, 11.85, 0],
    ['rocks/flat-stone-oval-large.png', 57.04, 4.68, 16.44, 18.18, 0],
    ['rocks/flat-stone-round-large-2.png', 3.49, 47.66, 14.69, 12.81, 0],
    ['rocks/flat-stone-round-large-1.png', 75.22, 17.63, 12.58, 13.77, 0],
    ['rocks/rock-cluster-bushes.png', 7.23, 68.87, 32.88, 21.49, 1],
    ['rocks/rock-cluster-bushes.png', 51.06, 67.91, 38.11, 25.9, 0],
    ['plants/bush-round-top-1.png', 80.33, 14.88, 8.72, 9.64, 0],
    ['plants/bush-round-top-2.png', 80.33, 37.6, 16.56, 18.18, 0],
    ['plants/bush-round-top-2.png', 82.57, 61.29, 9.96, 11.02, 0],
    ['plants/bush-round-top-2.png', 79.95, 65.84, 10.21, 11.16, 0],
    ['plants/bush-round-top-3.png', 36.37, 2.34, 10.09, 11.16, 0],
    ['plants/bush-round-top-3.png', 47.45, 1.93, 9.96, 11.16, 0],
    ['plants/bush-round-top-3.png', 6.35, 45.32, 5.48, 6.06, 0],
    ['plants/bush-round-top-3.png', 4.24, 47.38, 5.6, 6.2, 0],
    ['plants/bush-round-top-3.png', 5.11, 45.87, 5.48, 6.06, 0]
  ];

  function makeImg(d) {
    var img = new Image();
    img.alt = '';
    img.src = DIR + d[0];
    if (d[0].indexOf('rocks/') === 0) {
      img.classList.add('pond-decor-rock');
      if (d[0].indexOf('rock-cluster-bushes') !== -1) img.classList.add('pond-decor-rock-cluster');
    }
    img.style.left = d[1] + '%';
    img.style.top = d[2] + '%';
    img.style.width = d[3] + '%';
    img.style.height = d[4] + '%';
    if (d[5]) img.style.transform = 'scaleX(-1)';
    return img;
  }

  // ground goes FIRST so it paints beneath the pond base (z0 < z1)
  var groundImg = makeImg(GROUND);
  groundImg.className = 'pond-ground';
  groundImg.setAttribute('aria-hidden', 'true');
  pond.insertBefore(groundImg, pond.firstChild);

  var layer = document.createElement('div');
  layer.className = 'pond-decor';
  layer.setAttribute('aria-hidden', 'true');
  DECOR.forEach(function (d) { layer.appendChild(makeImg(d)); });
  pond.appendChild(layer);
})();
