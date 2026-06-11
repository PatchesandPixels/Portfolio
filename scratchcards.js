// ─── SCRATCHCARD VISUALIZER ────────────────────────────────────
// Drop actual card PNGs into assets/scratch/ and add them here.

const CARD_IMAGES = [
  'assets/scratch/Candy Cash 2.jpg',
  'assets/scratch/Cash Bless America.jpg',
  'assets/scratch/Cash Grab.jpg',
  'assets/scratch/Cash Truck.jpg',
  'assets/scratch/Cosmic Cash 2.jpg',
  'assets/scratch/Cosmic Cash.jpg',
  'assets/scratch/Dead Presidents.jpg',
  'assets/scratch/Deep Sea Dollars 2.jpg',
  'assets/scratch/Deep Sea Dollars.jpg',
  'assets/scratch/Dino Dollars 2.jpg',
  'assets/scratch/Dino Dollars 3.jpg',
  'assets/scratch/Dino Dollars 4.jpg',
  'assets/scratch/Dinobucks 2.5.jpg',
  'assets/scratch/Dinobucks.jpg',
  'assets/scratch/Dog Gone Lucky 2.jpg',
  'assets/scratch/Dog Gone Lucky.jpg',
  'assets/scratch/Farm Cashola 2.jpg',
  'assets/scratch/Farm Cashola.jpg',
  'assets/scratch/Fast Lane Fortune 2.jpg',
  'assets/scratch/Fast Lane Fortune 3.jpg',
  'assets/scratch/Fast Lane Fortune.jpg',
  'assets/scratch/Food Frenzy.jpg',
  'assets/scratch/Foodie Frenzy.jpg',
  'assets/scratch/Frontier Fortune.jpg',
  'assets/scratch/Glam and Glitter 2.jpg',
  'assets/scratch/Glam and Glitter.jpg',
  'assets/scratch/Gold Digger Scratch Off! 2.2 - 5sqs.jpg',
  'assets/scratch/Gold Digger Scratch Off! 5sqs.jpg',
  'assets/scratch/High Roller.jpg',
  'assets/scratch/King of the Jungle.jpg',
  'assets/scratch/Lava Loot Sweepstakes with frame.jpg',
  'assets/scratch/Lucky Loot.jpg',
  'assets/scratch/Lucky Scratch -2.jpg',
  'assets/scratch/Lucky Scratch.jpg',
  'assets/scratch/Magic Kingdom Background.jpg',
  'assets/scratch/Mega Moola.jpg',
  'assets/scratch/Party Time Bash For Cash 2.jpg',
  'assets/scratch/Party Time Bash For Cash.jpg',
  "assets/scratch/Pirate's Plunder 2.jpg",
  "assets/scratch/Pirate's Plunder.jpg",
  'assets/scratch/Pirates Plunder.jpg',
  'assets/scratch/Retro Riches 5.jpg',
  'assets/scratch/Retro Riches 7.jpg',
  'assets/scratch/Retro Riches.jpg',
  'assets/scratch/Spooky Scratch 2.jpg',
  'assets/scratch/Spooky Scratch.jpg',
  'assets/scratch/THE KINGS TEASURE 2.1.jpg',
  'assets/scratch/THE KINGS TEASURE 2.2.jpg',
  'assets/scratch/Under the Sea Revised.jpg',
  'assets/scratch/Vacation Vibes 1.jpg',
  'assets/scratch/Vacation Vibes 2.jpg',
  'assets/scratch/Vegas Vibes 2.jpg',
  'assets/scratch/Vegas Vibes.jpg',
  'assets/scratch/Weather Wonders 2.jpg',
  'assets/scratch/Weather Wonders.jpg',
  'assets/scratch/Wild West Bonus Bucks.jpg',
  'assets/scratch/Winners Galore.jpg',
  'assets/scratch/Wonders of Weather -2.jpg',
  'assets/scratch/Wonders of Weather.jpg',
  'assets/scratch/Wonders of the World .jpg',
  'assets/scratch/Wonders of the World 2.jpg',
  'assets/scratch/Wonders of the World.jpg',
];

// ─── LOADING SCREEN ────────────────────────────────────────────
(function preload() {
  const loader   = document.getElementById('scLoader');
  const bar      = document.getElementById('scLoaderBar');
  const count    = document.getElementById('scLoaderCount');
  const total    = CARD_IMAGES.length;
  const REVEAL_AT = Math.min(25, total); // reveal once 25 images have loaded
  let loaded = 0;

  CARD_IMAGES.forEach(src => {
    const img = new Image();
    img.onload = img.onerror = () => {
      loaded++;
      const pct = Math.round((loaded / total) * 100);
      bar.style.width   = pct + '%';
      count.textContent = `Loading ${loaded} / ${total}`;
      if (loaded >= REVEAL_AT) {
        loader.classList.add('sc-loader--done');
      }
    };
    img.src = src;
  });
})();

// ─── CONFIG ────────────────────────────────────────────────────
const CARD_W      = 480;
const CARD_H      = Math.round(CARD_W * 328 / 709); // ~222 px
const TOTAL_CARDS = 180;
const DRIFT_SPEED = 0.80;  // world px / frame — rightward drift
const LERP_CAM    = 0.08;  // camera pan smoothing
const LERP_Z      = 0.10;  // depth scroll smoothing

// ─── VIEWPORT ──────────────────────────────────────────────────
const VW = window.innerWidth;
const VH = window.innerHeight;

// World tile — 8× viewport gives cards more breathing room.
const TILE_W = VW * 8;
const TILE_H = VH * 8;

// ─── CAMERA ────────────────────────────────────────────────────
// Fixed 2-D scale — drag pans X/Y, scroll flies through Z depth.
const ZOOM = 0.38;

let camX = TILE_W / 2;
let camY = TILE_H / 2;
let targetCamX = camX;
let targetCamY = camY;

// ─── INFINITE DEPTH SCROLL ─────────────────────────────────────
// zOffset accumulates as the user scrolls.
// effectiveZ wraps it back to [0,1] so the depth field cycles forever —
// cards that reach the front (z→1) pop invisibly to the back (z=0).
let zOffset = 0;
let zTarget  = 0;
const Z_SPEED = 0.003;    // wheel deltaY → depth shift per pixel

function effectiveZ(card) {
  return ((card.z + zOffset) % 1 + 1) % 1;
}

// ─── DEPTH ─────────────────────────────────────────────────────
// z=0 → far (tiny, invisible)   z=1 → close (enormous, invisible)
//
// Scale is linear for the normal range (good initial spread), then
// rapidly accelerates for the top 20% of z so cards "fly past" you
// and clip off the viewport edges — just like a perspective camera.
//
// Opacity fades to 0 at BOTH ends so the toroidal wrap (z=1→z=0)
// is completely invisible — the card is transparent before it teleports.
function depthScale(z) {
  if (z <= 0.8) return 0.15 + z * 1.0625; // linear:  0.15 → 1.0 at z=0.8
  const t = (z - 0.8) / 0.2;              // 0→1 over the final 20%
  return 1.0 + t * t * 5;                 // quadratic burst: 1.0 → 6 (capped for performance)
}
function depthOpacity(z) {
  const fadeIn  = Math.min(1, z / 0.05);                        // 0→0.05: appear from nothing
  const fadeOut = z > 0.90 ? 1 - (z - 0.90) / 0.10 : 1;       // 0.90→1.0: vanish when huge/off-screen
  return fadeIn * fadeOut;
}
function depthDrift(z)   { return DRIFT_SPEED * (0.1 + z * 0.9); }

// ─── STATE ─────────────────────────────────────────────────────
let isDragging    = false;
let hasDragged    = false;   // true if pointer moved enough to count as a drag (not a click)
let dragStartX    = 0, dragStartY    = 0;
let dragCamStartX = 0, dragCamStartY = 0;

// ─── BUILD CARDS ───────────────────────────────────────────────
// Stratified grid placement: tile is divided into a cols×rows grid and
// each card is placed randomly WITHIN its cell. This guarantees even
// coverage with no empty patches — the main visual gap vs. the Spotify
// reference when using pure Math.random() XY placement.
function buildCards() {
  const cards = [];

  // Grid dimensions — match tile aspect ratio so cells are roughly square
  const aspect = TILE_W / TILE_H;
  const cols   = Math.round(Math.sqrt(TOTAL_CARDS * aspect));
  const rows   = Math.ceil(TOTAL_CARDS / cols);
  const cellW  = TILE_W / cols;
  const cellH  = TILE_H / rows;

  for (let i = 0; i < TOTAL_CARDS; i++) {
    const col      = i % cols;
    const row      = Math.floor(i / cols);
    const z        = Math.pow(Math.random(), 2.5); // moderate far-bias — rich mid-range depth field
    const rotation = (Math.random() - 0.5) * 18;
    // Drift slowly rightward with a slight vertical variation — like pages
    // lazily drifting across a table. ±20° cone keeps it feeling natural.
    const angle    = (Math.random() - 0.5) * (Math.PI / 4.5);
    const speed    = depthDrift(z);
    cards.push({
      src: CARD_IMAGES[i % CARD_IMAGES.length],
      x: col * cellW + Math.random() * cellW,
      y: row * cellH + Math.random() * cellH,
      z, rotation,
      driftX: Math.cos(angle) * speed,
      driftY: Math.sin(angle) * speed,
    });
  }
  return cards;
}

// ─── DOM ───────────────────────────────────────────────────────
function createElements(canvas, cards) {
  return cards.map((card, i) => {
    const el = document.createElement('div');
    el.className     = 'sc-card';
    el.dataset.index = i;
    el.style.width   = CARD_W + 'px';
    el.style.height  = CARD_H + 'px';
    const img = document.createElement('img');
    img.src = card.src; img.alt = ''; img.draggable = false;
    el.appendChild(img);
    canvas.appendChild(el);
    return el;
  });
}

// ─── TOROIDAL WRAP (X / Y) ─────────────────────────────────────
// Keeps each card within ±TILE_W/2 of the camera in world space.
// Uses modular arithmetic so it converges in one step at any zoom.
// Z wrapping is handled separately by effectiveZ().
function wrapCard(card) {
  let dx = ((card.x - camX) % TILE_W + TILE_W) % TILE_W;
  if (dx > TILE_W / 2) dx -= TILE_W;
  card.x = camX + dx;

  let dy = ((card.y - camY) % TILE_H + TILE_H) % TILE_H;
  if (dy > TILE_H / 2) dy -= TILE_H;
  card.y = camY + dy;
}

// ─── RENDER ────────────────────────────────────────────────────
// Perspective projection: both position AND scale use depthScale(ez).
// Far cards (ez≈0) cluster near screen centre; close cards (ez≈1) spread
// outward — a card off to the left flies past your left shoulder, not
// at your face. This is what makes it feel like flying through space
// rather than a tunnel converging to a single vanishing point.
function applyTransforms(cards, elements) {
  cards.forEach((card, i) => {
    const ez      = effectiveZ(card);
    const ds      = depthScale(ez);
    const sx      = (card.x - camX) * ZOOM * ds + VW / 2;
    const sy      = (card.y - camY) * ZOOM * ds + VH / 2;
    const scale   = ds * ZOOM;
    const opacity = depthOpacity(ez);
    elements[i].style.transform = `translate(${sx}px,${sy}px) scale(${scale}) rotate(${card.rotation}deg)`;
    elements[i].style.opacity   = opacity;
    elements[i].style.zIndex    = Math.round(ez * 90) + 1;
  });
}

// ─── MAIN LOOP ─────────────────────────────────────────────────
function init() {
  const canvas   = document.getElementById('scCanvas');
  const cards    = buildCards();
  const elements = createElements(canvas, cards);

  function loop() {
    // Smooth camera pan
    camX += (targetCamX - camX) * LERP_CAM;
    camY += (targetCamY - camY) * LERP_CAM;

    // Smooth depth scroll
    zOffset += (zTarget - zOffset) * LERP_Z;

    // Drift cards + X/Y wrap
    cards.forEach(card => {
      card.x += card.driftX;
      card.y += card.driftY;
      wrapCard(card);
    });

    applyTransforms(cards, elements);
    requestAnimationFrame(loop);
  }
  loop();

  // ─── DRAG TO PAN ─────────────────────────────────────────────
  const body = document.body;

  function onDragStart(e) {
    isDragging = true;
    hasDragged = false;
    body.classList.add('sc-dragging');
    const p = e.touches ? e.touches[0] : e;
    dragStartX = p.clientX; dragStartY = p.clientY;
    dragCamStartX = targetCamX; dragCamStartY = targetCamY;
  }
  function onDragMove(e) {
    if (!isDragging) return;
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - dragStartX;
    const dy = p.clientY - dragStartY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasDragged = true;
    targetCamX = dragCamStartX - dx / ZOOM;
    targetCamY = dragCamStartY - dy / ZOOM;
  }
  function onDragEnd() {
    isDragging = false;
    body.classList.remove('sc-dragging');
  }

  canvas.addEventListener('mousedown',  onDragStart);
  window.addEventListener('mousemove',  onDragMove);
  window.addEventListener('mouseup',    onDragEnd);
  canvas.addEventListener('touchstart', onDragStart, { passive: true });
  window.addEventListener('touchmove',  onDragMove,  { passive: true });
  window.addEventListener('touchend',   onDragEnd);

  // ─── SCROLL = INFINITE DEPTH ZOOM ────────────────────────────
  // Scroll shifts all cards through depth (Z). Cards that fly past the
  // front (z > 1) wrap invisibly to the back (z → 0), so you can scroll
  // forever in either direction — just like the Spotify reference.
  window.addEventListener('wheel', e => {
    e.preventDefault();
    zTarget += e.deltaY * Z_SPEED;
  }, { passive: false });

  // ─── CLICK TO EXPAND ─────────────────────────────────────────
  const expanded  = document.getElementById('scExpanded');
  const expandImg = document.getElementById('scExpandedImg');
  const closeBtn  = document.getElementById('scClose');
  const backdrop  = document.getElementById('scBackdrop');

  const openCard  = src => { expandImg.src = src; expanded.classList.add('is-open'); };
  const closeCard = ()  => expanded.classList.remove('is-open');

  canvas.addEventListener('click', e => {
    if (hasDragged) return;
    const card = e.target.closest('.sc-card');
    if (!card) return;
    openCard(cards[parseInt(card.dataset.index)].src);
  });

  closeBtn.addEventListener('click',  closeCard);
  backdrop.addEventListener('click',  closeCard);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCard(); });
}

document.addEventListener('DOMContentLoaded', init);
