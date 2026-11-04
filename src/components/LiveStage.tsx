import type { ReactNode } from 'react';
import type { CustomerStage } from '../lib/submit';

/**
 * A small isometric world at dusk: the 548 depot on the left, the customer's house on the
 * right, an asphalt road between them and the team's truck driving along it; two movers step
 * out at the door and carry things inside. Everything is projected from one 3D coordinate
 * system (dimetric 2:1, camera turned 20° so the road runs left to right), with one light
 * from the upper left: top faces brightest, side faces mid, front faces darkest, soft
 * ambient shadows on the ground and warm lights at night.
 */

type V3 = [number, number, number];
const ALPHA = (-20 * Math.PI) / 180;
const CA = Math.cos(ALPHA);
const SA = Math.sin(ALPHA);
const SC = 0.92;
const OX = 58;
const OY = 46;

/** World → screen, with the scene offset. */
const P = ([x, y, z]: V3, ox = OX, oy = OY): [number, number] => {
  const rx = x * CA - y * SA;
  const ry = x * SA + y * CA;
  return [ox + (rx - ry) * 0.866 * SC, oy + ((rx + ry) * 0.5 - z) * SC];
};
const f = (n: number) => n.toFixed(1);
const poly = (list: V3[], ox?: number, oy?: number) => list.map((p) => P(p, ox, oy).map(f).join(',')).join(' ');

/** The three visible faces of a box: top (+z), front (+x) and side (+y). */
function box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, ox?: number, oy?: number) {
  return {
    top: poly([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], ox, oy),
    front: poly([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], ox, oy),
    side: poly([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], ox, oy),
    /* bevel highlights along the two lit top edges */
    edgeSide: poly([[x0, y1, z1], [x1, y1, z1], [x1, y1 - 0.35, z1], [x0, y1 - 0.35, z1]], ox, oy),
    edgeFront: poly([[x1, y0, z1], [x1, y1, z1], [x1 - 0.35, y1, z1], [x1 - 0.35, y0, z1]], ox, oy),
  };
}
type Box = ReturnType<typeof box>;
/** A circle standing in the x–z plane (a wheel), as a polygon. */
const wheel = (cx: number, cy: number, cz: number, r: number, ox?: number, oy?: number, n = 22) =>
  poly(Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * 2 * Math.PI), cy, cz + r * Math.sin((i / n) * 2 * Math.PI)] as V3), ox, oy);
/** A circle lying on the ground, as a polygon. */
const disc = (cx: number, cy: number, r: number, sx = 1, ox?: number, oy?: number, n = 24) =>
  poly(Array.from({ length: n }, (_, i) => [cx + r * sx * Math.cos((i / n) * 2 * Math.PI), cy + r * Math.sin((i / n) * 2 * Math.PI), 0] as V3), ox, oy);
/** Matrix that lays flat artwork (u → +x, v → down) on the +y face of a box. */
const onSide = (x: number, y: number, z: number, s = 1, ox?: number, oy?: number) => {
  const o = P([x, y, z], ox, oy);
  const ex = P([x + 1, y, z], ox, oy);
  return `matrix(${f((ex[0] - o[0]) * s)} ${f((ex[1] - o[1]) * s)} 0 ${f(s)} ${f(o[0])} ${f(o[1])})`;
};
/** Same for the +x face (u → +y). */
const onFront = (x: number, y: number, z: number, s = 1, ox?: number, oy?: number) => {
  const o = P([x, y, z], ox, oy);
  const ey = P([x, y + 1, z], ox, oy);
  return `matrix(${f((ey[0] - o[0]) * s)} ${f((ey[1] - o[1]) * s)} 0 ${f(s)} ${f(o[0])} ${f(o[1])})`;
};
const ROOFLINE = 'M0 320V104L160 0l160 104v216';

/* ---------- the road ---------- */
const roadPt = (t: number): V3 => [10 + 204 * t, -15 * Math.sin(Math.PI * t), 0];
const ROAD_D = Array.from({ length: 41 }, (_, i) => P(roadPt(i / 40)))
  .map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`)
  .join(' ');
const at = (t: number) => {
  const [x, y] = P(roadPt(t));
  return `translate(${f(x)} ${f(y)})`;
};
const PARK = 0.84;

/* ---------- the ground ---------- */
const GRID = (() => {
  const lines: string[] = [];
  for (let k = -14; k <= 22; k++) {
    const a = P([-120, k * 16, 0]);
    const b = P([420, k * 16, 0]);
    lines.push(`M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`);
    const c = P([k * 16, -140, 0]);
    const d = P([k * 16, 300, 0]);
    lines.push(`M${f(c[0])} ${f(c[1])}L${f(d[0])} ${f(d[1])}`);
  }
  return lines.join('');
})();
const HOUSE_X = 220;
const LAWN = poly([[HOUSE_X - 16, -24, 0], [HOUSE_X + 38, -24, 0], [HOUSE_X + 38, 26, 0], [HOUSE_X - 16, 26, 0]]);
const WALKWAY = poly([[164, 3.5, 0], [HOUSE_X + 12, 8.5, 0], [HOUSE_X + 12, 13.5, 0], [164, 8.5, 0]]);
const DEPOT_APRON = poly([[-34, -14, 0], [12, -14, 0], [12, 14, 0], [-34, 14, 0]]);

/* ---------- the truck, in its own local space (anchor: centre of the base, on the ground) ---------- */
const TX = -P([17, 6.5, 0], 0, 0)[0];
const TY = -P([17, 6.5, 0], 0, 0)[1];
const cargo = box(0, 24, 0, 13, 3, 19, TX, TY);
const cab = box(24, 34, 0, 13, 3, 14, TX, TY);
const hood = box(34, 39, 0.5, 12.5, 3, 9, TX, TY);
const ac = box(27, 31.5, 4, 9, 14, 15.3, TX, TY);
const bumper = box(39, 40, 0.3, 12.7, 3, 4.6, TX, TY);
const rearBumper = box(-0.8, 0, 0.3, 12.7, 3, 4.4, TX, TY);
const mirror = box(33, 34.2, 13, 15.6, 10, 11.6, TX, TY);
const windshield = poly([[34, 1.5, 9.5], [34, 11.5, 9.5], [34, 11.5, 13.2], [34, 1.5, 13.2]], TX, TY);
const windshieldGlint = poly([[34, 2, 12.7], [34, 4.6, 12.7], [34, 9.4, 10], [34, 6.8, 10]], TX, TY);
const sideWindow = poly([[26.5, 13, 9], [33, 13, 9], [33, 13, 13.2], [26.5, 13, 13.2]], TX, TY);
const sideGlint = poly([[27, 13, 12.8], [28.6, 13, 12.8], [31.2, 13, 9.4], [29.6, 13, 9.4]], TX, TY);
const doorSeam = poly([[26, 13, 3.6], [26.3, 13, 3.6], [26.3, 13, 13.4], [26, 13, 13.4]], TX, TY);
const handle = poly([[27.2, 13, 7.6], [29, 13, 7.6], [29, 13, 8.1], [27.2, 13, 8.1]], TX, TY);
const panelSeams = [8.2, 16].map((x) => poly([[x, 13, 5.7], [x + 0.25, 13, 5.7], [x + 0.25, 13, 18.4], [x, 13, 18.4]], TX, TY));
const skirt = poly([[0.6, 13, 3.4], [23.4, 13, 3.4], [23.4, 13, 5.2], [0.6, 13, 5.2]], TX, TY);
const skirtLine = poly([[0.6, 13, 5.2], [23.4, 13, 5.2], [23.4, 13, 5.6], [0.6, 13, 5.6]], TX, TY);
const markers = [3, 12, 20.5].map((x) => poly([[x, 13.01, 3.9], [x + 1, 13.01, 3.9], [x + 1, 13.01, 4.5], [x, 13.01, 4.5]], TX, TY));
const liveryFrame = poly([[1.4, 13, 6.6], [22.6, 13, 6.6], [22.6, 13, 18.2], [1.4, 13, 18.2]], TX, TY);
const roofLights = [31.2, 32.4, 33.6].map((x) => poly([[x, 2, 14], [x + 0.8, 2, 14], [x + 0.8, 2.8, 14], [x, 2.8, 14]], TX, TY));
const headlights = [poly([[39, 1.2, 5.2], [39, 3.6, 5.2], [39, 3.6, 6.8], [39, 1.2, 6.8]], TX, TY), poly([[39, 9.4, 5.2], [39, 11.8, 5.2], [39, 11.8, 6.8], [39, 9.4, 6.8]], TX, TY)];
const grille = [5, 5.9, 6.8].map((z) => poly([[39.01, 4.4, z], [39.01, 8.6, z], [39.01, 8.6, z + 0.35], [39.01, 4.4, z + 0.35]], TX, TY));
const BEAM = poly([[39.5, 1, 0.2], [39.5, 12, 0.2], [66, 22, 0.2], [66, -9, 0.2]], TX, TY);
const BEAM_FROM = P([39.5, 6.5, 0], TX, TY);
const BEAM_TO = P([66, 6.5, 0], TX, TY);
const WHEELS = [6, 30.5].map((x) => ({
  c: P([x, 13.4, 4.3], TX, TY),
  arch: wheel(x, 13.01, 4.6, 5.3, TX, TY),
  rim: wheel(x, 13.4, 4.3, 4.3, TX, TY),
  hub: wheel(x, 13.6, 4.3, 2.4, TX, TY),
}));
const SHADOW = disc(19, 7, 11, 1.7, TX, TY);
const EXHAUST = P([-1.5, 11.5, 2.5], TX, TY);
/* livery: the roofline mark with "548" inside, "GROUPE" above and "MONTRÉAL" below, laid on the side */
const MARK_S = 9.6 / 320;
const markMatrix = onSide(7.2, 13.01, 17.1, MARK_S, TX, TY);
const num548 = onSide(12, 13.01, 8.9, 1, TX, TY);
const wordTop = onSide(12, 13.01, 17.9, 1, TX, TY);
const wordBottom = onSide(12, 13.01, 7.1, 1, TX, TY);
const frontMark = onFront(24.01, 1.5, 18.6, 10 / 320, TX, TY);

/* ---------- the depot ---------- */
const depot = box(-30, -4, -9, 9, 0, 13);
const depotParapet = box(-30, -4, -9, 9, 13, 13.8);
const depotRoof = box(-26, -8, -5, 5, 13.8, 16.4);
const depotSign = poly([[-28, 9, 4.6], [-6, 9, 4.6], [-6, 9, 6], [-28, 9, 6]]);
const depotDoor = poly([[-4, -6, 0], [-4, 6, 0], [-4, 6, 9], [-4, -6, 9]]);
const depotSlats = [1.8, 3.6, 5.4, 7.2].map((z) => poly([[-3.99, -6, z], [-3.99, 6, z], [-3.99, 6, z + 0.3], [-3.99, -6, z + 0.3]]));
const depotMark = onSide(-21.5, 9.01, 11.6, 9 / 320);
const DEPOT_AO = disc(-15, 2, 22, 1.4);
const DEPOT_LABEL = P([-17, 14, 0]);

/* ---------- the house ---------- */
const house = box(HOUSE_X, HOUSE_X + 20, -8, 8, 0, 11);
const roofSide = poly([[HOUSE_X - 1, 9, 10.5], [HOUSE_X + 21, 9, 10.5], [HOUSE_X + 21, 0, 19], [HOUSE_X - 1, 0, 19]]);
const roofBack = poly([[HOUSE_X - 1, -9, 10.5], [HOUSE_X + 21, -9, 10.5], [HOUSE_X + 21, 0, 19], [HOUSE_X - 1, 0, 19]]);
const roofRidge = poly([[HOUSE_X - 1, -0.3, 19], [HOUSE_X + 21, -0.3, 19], [HOUSE_X + 21, 0.3, 19], [HOUSE_X - 1, 0.3, 19]]);
const shingles = [2.3, 4.6, 6.9].map((dy) =>
  poly([
    [HOUSE_X - 1, 9 - dy, 10.5 + dy * (8.5 / 9)],
    [HOUSE_X + 21, 9 - dy, 10.5 + dy * (8.5 / 9)],
    [HOUSE_X + 21, 9 - dy - 0.2, 10.5 + (dy + 0.2) * (8.5 / 9)],
    [HOUSE_X - 1, 9 - dy - 0.2, 10.5 + (dy + 0.2) * (8.5 / 9)],
  ]),
);
const gable = poly([[HOUSE_X + 20, -8, 11], [HOUSE_X + 20, 8, 11], [HOUSE_X + 20, 0, 18.3]]);
const chimney = box(HOUSE_X + 13, HOUSE_X + 16.5, 2.5, 5.5, 14.5, 21);
const door = poly([[HOUSE_X + 7, 8, 0], [HOUSE_X + 11.5, 8, 0], [HOUSE_X + 11.5, 8, 6.5], [HOUSE_X + 7, 8, 6.5]]);
const KNOB = P([HOUSE_X + 10.7, 8.02, 3.4]);
const step = box(HOUSE_X + 6.4, HOUSE_X + 12.1, 8, 10.6, 0, 1.1);
const houseWindow = poly([[HOUSE_X + 20, 1, 4.5], [HOUSE_X + 20, 5.5, 4.5], [HOUSE_X + 20, 5.5, 8], [HOUSE_X + 20, 1, 8]]);
const houseWindowCross = [
  poly([[HOUSE_X + 20.01, 3.1, 4.5], [HOUSE_X + 20.01, 3.4, 4.5], [HOUSE_X + 20.01, 3.4, 8], [HOUSE_X + 20.01, 3.1, 8]]),
  poly([[HOUSE_X + 20.01, 1, 6.1], [HOUSE_X + 20.01, 5.5, 6.1], [HOUSE_X + 20.01, 5.5, 6.4], [HOUSE_X + 20.01, 1, 6.4]]),
];
const sideWindowHouse = poly([[HOUSE_X + 14, 8, 4.5], [HOUSE_X + 17.5, 8, 4.5], [HOUSE_X + 17.5, 8, 8], [HOUSE_X + 14, 8, 8]]);
const sideWindowCross = [
  poly([[HOUSE_X + 15.6, 8.01, 4.5], [HOUSE_X + 15.9, 8.01, 4.5], [HOUSE_X + 15.9, 8.01, 8], [HOUSE_X + 15.6, 8.01, 8]]),
  poly([[HOUSE_X + 14, 8.01, 6.1], [HOUSE_X + 17.5, 8.01, 6.1], [HOUSE_X + 17.5, 8.01, 6.4], [HOUSE_X + 14, 8.01, 6.4]]),
];
const WIN_GLOW = [P([HOUSE_X + 20, 3.2, 6.2]), P([HOUSE_X + 15.7, 8, 6.2])];
const HOUSE_AO = disc(HOUSE_X + 11, 2, 19, 1.3);
const DOOR_GROUND = P([HOUSE_X + 9, 13, 0]);
const HOUSE_LABEL = P([HOUSE_X + 10, 15, 0]);
const bush = { lit: disc(HOUSE_X + 2, 11, 3.2), top: P([HOUSE_X + 2, 11, 3.2]) };

/* lamp post by the walk, trees along the road */
const LAMP = P([HOUSE_X - 9, 20, 0]);
const LAMP_TOP = P([HOUSE_X - 9, 20, 15]);
const LAMP_CONE = `${f(LAMP_TOP[0])},${f(LAMP_TOP[1])} ${f(LAMP[0] - 15)},${f(LAMP[1] + 5)} ${f(LAMP[0] + 15)},${f(LAMP[1] + 5)}`;
const TREES = [
  { c: [62, 36] as [number, number], h: 17, r: 5 },
  { c: [118, -44] as [number, number], h: 20, r: 6 },
  { c: [150, 32] as [number, number], h: 15, r: 4.5 },
  { c: [HOUSE_X + 30, -14] as [number, number], h: 18, r: 5.5 },
].map(({ c, h, r }) => {
  const apex = P([c[0], c[1], h]);
  const mid = P([c[0], c[1], h * 0.55]);
  const base = P([c[0], c[1], 0]);
  const pt = (p: [number, number]) => `${f(p[0])},${f(p[1])}`;
  const tier = (top: [number, number], rr: number, y: number) => `${pt(top)} ${pt([base[0] - rr * 1.127, y])} ${pt([base[0], y + rr * 0.65])} ${pt([base[0] + rr * 1.127, y])}`;
  return {
    lower: tier(mid, r, base[1] - 1),
    lowerShade: `${pt(mid)} ${pt([base[0], base[1] - 1 + r * 0.65])} ${pt([base[0] + r * 1.127, base[1] - 1])}`,
    upper: tier(apex, r * 0.7, mid[1] + 1.5),
    upperShade: `${pt(apex)} ${pt([base[0], mid[1] + 1.5 + r * 0.7 * 0.65])} ${pt([base[0] + r * 0.7 * 1.127, mid[1] + 1.5])}`,
    trunk: poly([[c[0] - 0.7, c[1] + 0.7, 0], [c[0] + 0.7, c[1] + 0.7, 0], [c[0] + 0.7, c[1] + 0.7, 3], [c[0] - 0.7, c[1] + 0.7, 3]]),
    shadow: disc(c[0] + 2.5, c[1] + 2.5, r * 0.9),
  };
});

/* ---------- a mover (anchor: between the feet, on the ground) ---------- */
const legA = [box(-1.5, -0.4, -0.9, 0.9, 0, 4.2, 0, 0), box(0.2, 1.3, -0.9, 0.9, 0, 4.2, 0, 0)];
const legB = [box(-0.5, 0.6, -0.9, 0.9, 0, 4.2, 0, 0), box(-1.3, -0.2, -0.9, 0.9, 0, 4.2, 0, 0)];
const torso = box(-1.6, 1.6, -1.4, 1.4, 4.2, 9.2, 0, 0);
const belt = poly([[-1.6, 1.4, 5.2], [1.6, 1.4, 5.2], [1.6, 1.4, 5.8], [-1.6, 1.4, 5.8]], 0, 0);
const chest = poly([[-1.6, 1.401, 7.2], [1.6, 1.401, 7.2], [1.6, 1.401, 7.8], [-1.6, 1.401, 7.8]], 0, 0);
const arms = [box(0.4, 2.6, -2, -1.4, 5.6, 7.1, 0, 0), box(0.4, 2.6, 1.4, 2, 5.6, 7.1, 0, 0)];
const HEAD = P([0, 0, 10.6], 0, 0);
const CAP = P([0.15, -0.1, 11.9], 0, 0);
const carried = box(1.9, 4.9, -1.6, 1.6, 5.2, 8.4, 0, 0);
const tape = poly([[1.9, 1.6, 6.6], [4.9, 1.6, 6.6], [4.9, 1.6, 7], [1.9, 1.6, 7]], 0, 0);
const pot = box(2.2, 4.4, -1.1, 1.1, 5.2, 7.6, 0, 0);
const LEAVES = (() => {
  const base = P([3.3, 0, 7.6], 0, 0);
  const pt = (p: [number, number]) => `${f(p[0])},${f(p[1])}`;
  return [
    `${pt(base)} ${pt([base[0] - 2.6, base[1] - 3.4])} ${pt([base[0] - 0.4, base[1] - 4.6])}`,
    `${pt(base)} ${pt([base[0] + 0.6, base[1] - 5.2])} ${pt([base[0] + 2.2, base[1] - 3.2])}`,
    `${pt(base)} ${pt([base[0] - 1.2, base[1] - 5.4])} ${pt([base[0] + 1.4, base[1] - 4.6])}`,
  ];
})();
const MOVER_SHADOW = disc(0.6, 0.6, 2.2, 1, 0, 0);
/* from the back of the parked truck to the front door */
const truckWorld = roadPt(PARK);
const WALK_D = (() => {
  const a = P([truckWorld[0] - 23, truckWorld[1] + 9, 0]);
  const b = P([HOUSE_X + 9, 12, 0]);
  return `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`;
})();

function Faces({ b, cls }: { b: Box; cls: string }) {
  return (
    <>
      <polygon points={b.side} className={`${cls}__side`} />
      <polygon points={b.front} className={`${cls}__front`} />
      <polygon points={b.top} className={`${cls}__top`} />
      <polygon points={b.edgeSide} className="bevel" />
      <polygon points={b.edgeFront} className="bevel" />
    </>
  );
}

function Mover({ item, children }: { item: 'box' | 'plant'; children?: ReactNode }) {
  return (
    <g className="mover">
      {children}
      <g transform="scale(1.55)">
        <polygon points={MOVER_SHADOW} className="mover__shadow" />
        <g className="mover__a">
          {legA.map((l, i) => (
            <g key={i}>
              <polygon points={l.side} className="mover__leg" />
              <polygon points={l.front} className="mover__leg2" />
              <polygon points={l.top} className="mover__leg" />
            </g>
          ))}
        </g>
        <g className="mover__b">
          {legB.map((l, i) => (
            <g key={i}>
              <polygon points={l.side} className="mover__leg" />
              <polygon points={l.front} className="mover__leg2" />
              <polygon points={l.top} className="mover__leg" />
            </g>
          ))}
        </g>
        <g className="mover__body">
          <polygon points={torso.side} className="mover__torso" />
          <polygon points={torso.front} className="mover__torso2" />
          <polygon points={torso.top} className="mover__torso3" />
          <polygon points={belt} className="mover__belt" />
          <polygon points={chest} className="mover__belt" />
          {arms.map((a, i) => (
            <g key={i}>
              <polygon points={a.side} className="mover__torso" />
              <polygon points={a.front} className="mover__hand" />
              <polygon points={a.top} className="mover__torso3" />
            </g>
          ))}
          <circle cx={HEAD[0]} cy={HEAD[1]} r="1.75" className="mover__head" />
          <circle cx={CAP[0]} cy={CAP[1]} r="1.5" className="mover__cap" />
          {item === 'box' ? (
            <g className="mover__box">
              <polygon points={carried.side} className="box__side" />
              <polygon points={carried.front} className="box__front" />
              <polygon points={carried.top} className="box__top" />
              <polygon points={tape} className="box__tape" />
            </g>
          ) : (
            <g className="mover__plant">
              <polygon points={pot.side} className="pot__side" />
              <polygon points={pot.front} className="pot__front" />
              <polygon points={pot.top} className="pot__top" />
              {LEAVES.map((d, i) => (
                <polygon key={i} points={d} className={i === 1 ? 'leaf leaf--lit' : 'leaf'} />
              ))}
            </g>
          )}
        </g>
      </g>
    </g>
  );
}

/* timelines */
const DRIVE = { dur: '12s', keyTimes: '0;0.05;0.56;0.95;1', splines: '0 0 1 1;0.42 0 0.22 1;0 0 1 1;0 0 1 1' };
const CARRY = { dur: '6.5s' };

export function LiveStage({ stage, motion, uid, teamLabel, whereLabel }: { stage: CustomerStage; motion: boolean; uid: string; teamLabel: string; whereLabel: string }) {
  const driving = stage === 'en-route';
  const atDoor = stage === 'arrived' || stage === 'in-progress' || stage === 'done';
  const busy = stage === 'arrived' || stage === 'in-progress';
  const parked = driving ? (motion ? undefined : at(0.5)) : atDoor ? at(PARK) : at(0.07);
  const anim = driving && motion;
  const carrying = busy && motion;
  const rippling = motion && (driving || busy);
  const RX = 1.127;
  const RY = 0.65;
  const lampOn = atDoor || driving;
  return (
    <svg className="stage" viewBox="0 0 320 136" aria-hidden="true">
      <defs>
        <filter id={`sh${uid}`} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <filter id={`ao${uid}`} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <filter id={`gl${uid}`} x="-20%" y="-80%" width="140%" height="260%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`lp${uid}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <linearGradient id={`gs${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a0a10" />
          <stop offset="0.45" stopColor="#5a1a24" />
          <stop offset="0.5" stopColor="#8a3a46" />
          <stop offset="0.56" stopColor="#4a141d" />
          <stop offset="1" stopColor="#1f070c" />
        </linearGradient>
        <linearGradient id={`ft${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf9" />
          <stop offset="1" stopColor="#efe6d6" />
        </linearGradient>
        <linearGradient id={`fs${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3ebdd" />
          <stop offset="1" stopColor="#ddd0ba" />
        </linearGradient>
        <linearGradient id={`ff${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6c9b2" />
          <stop offset="1" stopColor="#bfb097" />
        </linearGradient>
        <linearGradient id={`bs${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8dfcd" />
          <stop offset="1" stopColor="#d2c5ad" />
        </linearGradient>
        <linearGradient id={`bf${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8ba9f" />
          <stop offset="1" stopColor="#b2a186" />
        </linearGradient>
        <linearGradient id={`rs${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a3a49" />
          <stop offset="1" stopColor="#7a2634" />
        </linearGradient>
        <linearGradient id={`bm${uid}`} gradientUnits="userSpaceOnUse" x1={BEAM_FROM[0]} y1={BEAM_FROM[1]} x2={BEAM_TO[0]} y2={BEAM_TO[1]}>
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.38" />
          <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`lc${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe3a0" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ffe3a0" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`lg${uid}`}>
          <stop offset="0" stopColor="#ffe3a0" stopOpacity="0.42" />
          <stop offset="1" stopColor="#ffe3a0" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ground */}
      <path d={GRID} className="stage__grid" />
      <polygon points={DEPOT_APRON} className="stage__apron" />
      <polygon points={LAWN} className="stage__lawn" />
      <polygon points={WALKWAY} className="stage__walk" />
      <path d={ROAD_D} className="stage__curb" />
      <path d={ROAD_D} className="stage__road" />
      <path d={ROAD_D} className="stage__lane" />
      <path id={`rd${uid}`} d={ROAD_D} className="stage__trail" pathLength={1} filter={`url(#gl${uid})`} style={anim ? undefined : { strokeDashoffset: atDoor ? 0.16 : 1 }}>
        {anim && <animate attributeName="stroke-dashoffset" values="1;1;0.16;0.16;0.16" keyTimes={DRIVE.keyTimes} calcMode="spline" keySplines={DRIVE.splines} dur={DRIVE.dur} repeatCount="indefinite" />}
        {anim && <animate attributeName="opacity" values="1;1;1;1;0" keyTimes={DRIVE.keyTimes} dur={DRIVE.dur} repeatCount="indefinite" />}
      </path>
      <polygon points={DEPOT_AO} className="ao" filter={`url(#ao${uid})`} />
      <polygon points={HOUSE_AO} className="ao" filter={`url(#ao${uid})`} />
      {lampOn && <ellipse cx={LAMP[0]} cy={LAMP[1]} rx={22} ry={12} fill={`url(#lg${uid})`} />}

      {/* trees behind the road */}
      {TREES.slice(1, 2).map((t, i) => (
        <g key={i} className="tree">
          <polygon points={t.shadow} className="tree__shadow" />
          <polygon points={t.trunk} className="tree__trunk" />
          <polygon points={t.lower} className="tree__lit" />
          <polygon points={t.lowerShade} className="tree__shade" />
          <polygon points={t.upper} className="tree__lit" />
          <polygon points={t.upperShade} className="tree__shade" />
        </g>
      ))}

      {/* the depot */}
      <g className="stage__bld">
        <Faces b={depot} cls="bld" />
        <polygon points={depotDoor} className="bld__door" />
        {depotSlats.map((p, i) => (
          <polygon key={i} points={p} className="bld__slat" />
        ))}
        <polygon points={depotSign} className="bld__sign" />
        <path d={ROOFLINE} transform={depotMark} className="bld__mark" />
        <text transform={onSide(-17, 9.01, 7.2, 1)} textAnchor="middle" className="bld__text">
          548
        </text>
        <Faces b={depotParapet} cls="bld" />
        <Faces b={depotRoof} cls="bld" />
      </g>
      <text x={DEPOT_LABEL[0]} y={DEPOT_LABEL[1] + 12} textAnchor="middle" className="stage__label">
        {teamLabel}
      </text>

      {/* the truck */}
      <g className="stage__truck" transform={parked} opacity={anim ? 0 : 1}>
        {anim && (
          <>
            <animateMotion dur={DRIVE.dur} repeatCount="indefinite" calcMode="spline" keyPoints="0;0;0.84;0.84;0.84" keyTimes={DRIVE.keyTimes} keySplines={DRIVE.splines}>
              <mpath href={`#rd${uid}`} />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes={DRIVE.keyTimes} dur={DRIVE.dur} repeatCount="indefinite" />
          </>
        )}
        <g>
          {anim && <animateTransform attributeName="transform" type="scale" values="0.9;0.9;1.06;1.06;1.06" keyTimes={DRIVE.keyTimes} calcMode="spline" keySplines={DRIVE.splines} dur={DRIVE.dur} repeatCount="indefinite" />}
          {anim && (
            <polygon points={BEAM} fill={`url(#bm${uid})`}>
              <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.06;0.54;0.58;1" dur={DRIVE.dur} repeatCount="indefinite" />
            </polygon>
          )}
          {anim &&
            [0, 1].map((i) => (
              <circle key={i} cx={EXHAUST[0]} cy={EXHAUST[1]} r="1" className="truck__puff">
                <animate attributeName="r" values="0.6;3.2" begin={`${0.6 + i * 0.5}s`} dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="cy" values={`${f(EXHAUST[1])};${f(EXHAUST[1] - 7)}`} begin={`${0.6 + i * 0.5}s`} dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="cx" values={`${f(EXHAUST[0])};${f(EXHAUST[0] - 4)}`} begin={`${0.6 + i * 0.5}s`} dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0" begin={`${0.6 + i * 0.5}s`} dur="1.4s" repeatCount="indefinite" />
              </circle>
            ))}
          <g className="truck__bob">
            <polygon points={SHADOW} className="truck__shadow" filter={`url(#sh${uid})`} />
            <Faces b={rearBumper} cls="brass" />
            <polygon points={cargo.side} fill={`url(#fs${uid})`} />
            <polygon points={cargo.front} fill={`url(#ff${uid})`} />
            <polygon points={cargo.top} fill={`url(#ft${uid})`} />
            <polygon points={cargo.edgeSide} className="bevel" />
            <polygon points={cargo.edgeFront} className="bevel" />
            <path d={ROOFLINE} transform={frontMark} className="truck__markFront" />
            {panelSeams.map((p, i) => (
              <polygon key={i} points={p} className="truck__seam2" />
            ))}
            <polygon points={skirt} className="truck__stripe" />
            <polygon points={skirtLine} className="truck__brass" />
            {markers.map((p, i) => (
              <polygon key={i} points={p} className="truck__marker" />
            ))}
            <polygon points={liveryFrame} className="truck__frame" />
            <path d={ROOFLINE} transform={markMatrix} className="truck__mark" />
            <text transform={num548} textAnchor="middle" className="truck__text">
              548
            </text>
            <text transform={wordTop} textAnchor="middle" className="truck__word">
              GROUPE
            </text>
            <text transform={wordBottom} textAnchor="middle" className="truck__word">
              MONTRÉAL
            </text>
            <polygon points={cab.side} fill={`url(#fs${uid})`} />
            <polygon points={cab.front} fill={`url(#ff${uid})`} />
            <polygon points={cab.top} fill={`url(#ft${uid})`} />
            <polygon points={cab.edgeSide} className="bevel" />
            <polygon points={cab.edgeFront} className="bevel" />
            <Faces b={ac} cls="ac" />
            {roofLights.map((p, i) => (
              <polygon key={i} points={p} className="truck__light" />
            ))}
            <polygon points={doorSeam} className="truck__seam" />
            <polygon points={handle} className="truck__seam" />
            <polygon points={sideWindow} fill={`url(#gs${uid})`} className="truck__glass" />
            <polygon points={sideGlint} className="glint" />
            <polygon points={windshield} fill={`url(#gs${uid})`} className="truck__glass" />
            <polygon points={windshieldGlint} className="glint" />
            <Faces b={mirror} cls="mirror" />
            <polygon points={hood.side} fill={`url(#fs${uid})`} />
            <polygon points={hood.front} fill={`url(#ff${uid})`} />
            <polygon points={hood.top} fill={`url(#ft${uid})`} />
            <polygon points={hood.edgeSide} className="bevel" />
            <polygon points={hood.edgeFront} className="bevel" />
            {grille.map((p, i) => (
              <polygon key={i} points={p} className="truck__grille" />
            ))}
            <Faces b={bumper} cls="brass" />
            {headlights.map((p, i) => (
              <polygon key={i} points={p} className="truck__light" />
            ))}
            {WHEELS.map((w, i) => (
              <g key={i}>
                <polygon points={w.arch} className="truck__arch" />
                <polygon points={w.rim} className="truck__tire" />
                <polygon points={w.hub} className="truck__hub" />
                <g className="truck__spokes" transform={`translate(${f(w.c[0])} ${f(w.c[1])})`}>
                  {anim && <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.8s" repeatCount="indefinite" additive="sum" />}
                  <path d="M-1.7 0H1.7M0 -1.7V1.7M-1.2 -1.2L1.2 1.2M-1.2 1.2L1.2 -1.2" />
                </g>
              </g>
            ))}
          </g>
        </g>
      </g>

      {/* the house, with ripples on the ground while the team is close */}
      {rippling && (
        <>
          <ellipse cx={DOOR_GROUND[0]} cy={DOOR_GROUND[1]} rx={6 * RX} ry={6 * RY} className="stage__ripple">
            <animate attributeName="rx" values={`${6 * RX};${30 * RX}`} dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="ry" values={`${6 * RY};${30 * RY}`} dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0" dur="2.6s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx={DOOR_GROUND[0]} cy={DOOR_GROUND[1]} rx={6 * RX} ry={6 * RY} className="stage__ripple">
            <animate attributeName="rx" values={`${6 * RX};${30 * RX}`} dur="2.6s" begin="1.3s" repeatCount="indefinite" />
            <animate attributeName="ry" values={`${6 * RY};${30 * RY}`} dur="2.6s" begin="1.3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0" dur="2.6s" begin="1.3s" repeatCount="indefinite" />
          </ellipse>
        </>
      )}
      <g className={`stage__bld stage__house ${stage === 'done' ? 'stage__house--done' : ''} ${busy ? 'stage__house--busy' : ''} ${lampOn ? 'stage__house--lit' : ''}`}>
        {lampOn && WIN_GLOW.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4.5" className="win__glow" filter={`url(#lp${uid})`} />)}
        <polygon points={house.side} fill={`url(#bs${uid})`} />
        <polygon points={house.front} fill={`url(#bf${uid})`} />
        <polygon points={houseWindow} className="bld__window" />
        {houseWindowCross.map((p, i) => (
          <polygon key={i} points={p} className="bld__frame" />
        ))}
        <polygon points={sideWindowHouse} className="bld__window" />
        {sideWindowCross.map((p, i) => (
          <polygon key={i} points={p} className="bld__frame" />
        ))}
        <polygon points={door} className="bld__door" />
        <circle cx={KNOB[0]} cy={KNOB[1]} r="0.45" className="bld__knob" />
        <Faces b={step} cls="step" />
        <polygon points={roofBack} className="roof__back" />
        <polygon points={roofSide} fill={`url(#rs${uid})`} />
        {shingles.map((p, i) => (
          <polygon key={i} points={p} className="roof__shingle" />
        ))}
        <polygon points={roofRidge} className="roof__ridge" />
        <polygon points={gable} className="roof__gable" />
        <Faces b={chimney} cls="chimney" />
        <polygon points={bush.lit} className="bush" />
        <circle cx={bush.top[0]} cy={bush.top[1] + 1} r="2.6" className="bush__top" />
      </g>
      {/* lamp post */}
      <g className={`lamp ${lampOn ? 'lamp--on' : ''}`}>
        {lampOn && <polygon points={LAMP_CONE} fill={`url(#lc${uid})`} />}
        <line x1={LAMP[0]} y1={LAMP[1]} x2={LAMP_TOP[0]} y2={LAMP_TOP[1]} className="lamp__pole" />
        <circle cx={LAMP_TOP[0]} cy={LAMP_TOP[1]} r="4" className="lamp__halo" filter={`url(#lp${uid})`} />
        <circle cx={LAMP_TOP[0]} cy={LAMP_TOP[1]} r="1.6" className="lamp__bulb" />
      </g>
      {TREES.filter((_, i) => i !== 1).map((t, i) => (
        <g key={i} className="tree">
          <polygon points={t.shadow} className="tree__shadow" />
          <polygon points={t.trunk} className="tree__trunk" />
          <polygon points={t.lower} className="tree__lit" />
          <polygon points={t.lowerShade} className="tree__shade" />
          <polygon points={t.upper} className="tree__lit" />
          <polygon points={t.upperShade} className="tree__shade" />
        </g>
      ))}
      <text x={HOUSE_LABEL[0]} y={HOUSE_LABEL[1] + 12} textAnchor="middle" className="stage__label">
        {whereLabel}
      </text>

      {/* the movers: out of the truck and into the house */}
      {anim && (
        <>
          <Mover item="box">
            <animateMotion dur={DRIVE.dur} repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.59;0.86;1" calcMode="linear" path={WALK_D} />
            <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.59;0.61;0.86;0.89;1" dur={DRIVE.dur} repeatCount="indefinite" />
          </Mover>
          <Mover item="plant">
            <animateMotion dur={DRIVE.dur} repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.65;0.92;1" calcMode="linear" path={WALK_D} />
            <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.65;0.67;0.92;0.95;1" dur={DRIVE.dur} repeatCount="indefinite" />
          </Mover>
        </>
      )}
      {carrying && (
        <>
          <Mover item="box">
            <animateMotion dur={CARRY.dur} repeatCount="indefinite" keyPoints="0;1;1;0;0" keyTimes="0;0.42;0.5;0.92;1" calcMode="linear" path={WALK_D} />
            <animate attributeName="opacity" values="1;1;0;0;1;1" keyTimes="0;0.42;0.44;0.5;0.52;1" dur={CARRY.dur} repeatCount="indefinite" />
          </Mover>
          <Mover item="plant">
            <animateMotion dur={CARRY.dur} begin="3.2s" repeatCount="indefinite" keyPoints="0;1;1;0;0" keyTimes="0;0.42;0.5;0.92;1" calcMode="linear" path={WALK_D} />
            <animate attributeName="opacity" values="0;0;1;1;0;0;1;1" keyTimes="0;0.001;0.002;0.42;0.44;0.5;0.52;1" begin="3.2s" dur={CARRY.dur} repeatCount="indefinite" fill="freeze" />
          </Mover>
        </>
      )}
    </svg>
  );
}
