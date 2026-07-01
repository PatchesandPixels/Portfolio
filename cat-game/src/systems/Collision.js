/* ============================================================
   Collision — geometry helpers shared by every attack.
   Circle hitboxes + swept-segment distance so fast projectiles
   cannot tunnel through the cursor between frames.
   ============================================================ */

export const Collision = {
  dist(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  },

  /** Distance from point P to segment AB (used for swept CCD). */
  pointToSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - ax, py - ay);
    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx;
    const cy = ay + t * dy;
    return Math.hypot(px - cx, py - cy);
  },

  /**
   * Classify a circular threat against the player.
   * @returns {{hit:boolean, nearMiss:boolean, dist:number}}
   */
  classifyCircle(threatX, threatY, threatRadius, player) {
    const d = Math.hypot(threatX - player.x, threatY - player.y);
    const lethal = threatRadius + player.hitbox;
    const near = lethal + player.nearMissBand;
    return { hit: d <= lethal, nearMiss: d > lethal && d <= near, dist: d };
  },

  /**
   * Swept circle-vs-point: did a moving projectile (prev->cur, radius r)
   * touch the player this frame? Uses segment distance to avoid tunnelling.
   */
  classifySwept(prevX, prevY, curX, curY, radius, player) {
    const d = this.pointToSegment(player.x, player.y, prevX, prevY, curX, curY);
    const lethal = radius + player.hitbox;
    const near = lethal + player.nearMissBand;
    return { hit: d <= lethal, nearMiss: d > lethal && d <= near, dist: d };
  },
};
