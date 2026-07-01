# Cat Game Mouse Game

A browser game where a cartoon cat mistakes your cursor for a real mouse and hunts it.
You are the mouse. Survive its telegraphed attacks, bait near-misses for points, and don't get caught.

This is the **Phase 5 prototype**: the full modular shell plus Stage 1 (the telegraphed lunge).
Phase 6 adds the bow-and-arrow attack using the same `Attack` interface.

## Run it locally

It's plain ES modules — no build step. ES modules can't be loaded from `file://`, so serve the
folder over HTTP from inside `cat-game/`:

```bash
# any one of these, from the cat-game/ directory:
python3 -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000>.

## Controls

- **Move the mouse** to dodge. Don't be inside the red ring when the cat lands.
- **Esc** — pause / resume
- **🐭** — swap between the mouse character and your native cursor
- **🔊** — mute / unmute
- **⏸** — pause

## How it's built

Vanilla JS (ES modules) + DOM/CSS, no framework. See
`docs/superpowers/specs/2026-06-14-cat-game-mouse-game-design.md` for the full design,
stage progression, and the Fairness Contract.

```
cat-game/
  index.html
  styles/   main.css  cat.css  effects.css
  src/
    config.js            # ALL tunable values
    core/    EventBus  GameState  Loop  Pointer
    systems/ Settings  Audio  Scoring  Mood  Cat  StageDirector  AttackManager  Collision
    render/  Renderer
    attacks/ Attack (base)  LungeAttack
    ui/      Hud
    main.js              # bootstrap + wiring
```

### Adding a new attack

1. Create `src/attacks/MyAttack.js` extending `Attack`, implementing `start()`, `update(dt)`,
   and `cleanup()`. Use `this.fairTelegraph(...)` to honor the Fairness Contract.
2. Register it in `main.js` (`new AttackManager(ctx, { lunge: LungeAttack, myattack: MyAttack })`).
3. Add its name to the relevant stage in `config.js` `stages[]`.

No other code changes are required.
