// Shared combat timing: hit-flash beats and keyed pose sampling.

export function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function lerpNum(a, b, t) {
  return a + (b - a) * t;
}

export function flashBeat(i, n = 8, peak = 0.88) {
  if (i % 2 !== 0) return 0;
  const t = n <= 1 ? 1 : 1 - i / (n - 1);
  return peak * (0.4 + 0.6 * t);
}

export function sampleKeys(keys, t, lerpPose) {
  const x = Math.min(1, Math.max(0, t));
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1].t) i += 1;
  const a = keys[i];
  const b = keys[i + 1];
  const u = (x - a.t) / (b.t - a.t || 1);
  return lerpPose(a.pose, b.pose, easeInOut(u));
}

export function withFlash(pose, flash) {
  return { ...pose, flash };
}
