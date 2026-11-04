import type { CustomerStage } from '../lib/submit';

/**
 * A small isometric world: the 548 depot on the left, the customer's house on the right,
 * a road between them and the team's truck driving along it. Everything is projected from
 * one 3D coordinate system (dimetric 2:1, camera turned 20° so the road runs left to right),
 * so the buildings, the truck, the ripples and the ground grid all sit in the same space.
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
  };
}
/** A circle standing in the x–z plane (a wheel), as a polygon. */
const wheel = (cx: number, cy: number, cz: number, r: number, ox?: number, oy?: number, n = 20) =>
  poly(Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * 2 * Math.PI), cy, cz + r * Math.sin((i / n) * 2 * Math.PI)] as V3), ox, oy);
/** A circle lying on the ground, as a polygon. */
const disc = (cx: number, cy: number, r: number, sx = 1, ox?: number, oy?: number, n = 24) =>
  poly(Array.from({ length: n }, (_, i) => [cx + r * sx * Math.cos((i / n) * 2 * Math.PI), cy + r * Math.sin((i / n) * 2 * Math.PI), 0] as V3), ox, oy);
/** Screen basis of the +y face, for text that lies on it. */
const faceMatrix = (x: number, y: number, z: number) => {
  const o = P([x, y, z]);
  const ex = P([x + 1, y, z]);
  return `matrix(${f(ex[0] - o[0])} ${f(ex[1] - o[1])} 0 1 ${f(o[0])} ${f(o[1])})`;
};

/* ---------- the road ---------- */
const roadPt = (t: number): V3 => [10 + 204 * t, -15 * Math.sin(Math.PI * t), 0];
const ROAD_D = Array.from({ length: 41 }, (_, i) => P(roadPt(i / 40)))
  .map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`)
  .join(' ');
const at = (t: number) => {
  const [x, y] = P(roadPt(t));
  return `translate(${f(x)} ${f(y)})`;
};

/* ---------- the ground grid ---------- */
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

/* ---------- the truck, in its own local space (anchor: centre of the base, on the ground) ---------- */
const TX = -P([17, 6.5, 0], 0, 0)[0];
const TY = -P([17, 6.5, 0], 0, 0)[1];
const cargo = box(0, 24, 0, 13, 3, 19, TX, TY);
const cab = box(24, 34, 0, 13, 3, 14, TX, TY);
const hood = box(34, 39, 0.5, 12.5, 3, 9, TX, TY);
const windshield = poly([[34, 1.5, 9.5], [34, 11.5, 9.5], [34, 11.5, 13.2], [34, 1.5, 13.2]], TX, TY);
const sideWindow = poly([[26, 13, 9], [33, 13, 9], [33, 13, 13.2], [26, 13, 13.2]], TX, TY);
const stripe = poly([[0.8, 13, 9], [23.2, 13, 9], [23.2, 13, 11.2], [0.8, 13, 11.2]], TX, TY);
const brassLine = poly([[0.8, 13, 8.3], [23.2, 13, 8.3], [23.2, 13, 8.7], [0.8, 13, 8.7]], TX, TY);
const headlight = poly([[39, 1.5, 5], [39, 3.5, 5], [39, 3.5, 6.6], [39, 1.5, 6.6]], TX, TY);
const WHEELS = [
  { c: P([6, 13.4, 4.3], TX, TY), rim: wheel(6, 13.4, 4.3, 4.3, TX, TY), hub: wheel(6, 13.6, 4.3, 2.3, TX, TY) },
  { c: P([30.5, 13.4, 4.3], TX, TY), rim: wheel(30.5, 13.4, 4.3, 4.3, TX, TY), hub: wheel(30.5, 13.6, 4.3, 2.3, TX, TY) },
];
const SHADOW = disc(19, 7, 11, 1.7, TX, TY);
const textOnSide = (() => {
  const o = P([3, 13, 17.2], TX, TY);
  const ex = P([4, 13, 17.2], TX, TY);
  return `matrix(${f(ex[0] - o[0])} ${f(ex[1] - o[1])} 0 1 ${f(o[0])} ${f(o[1])})`;
})();

/* ---------- the depot and the house ---------- */
const depot = box(-30, -4, -9, 9, 0, 13);
const depotRoof = box(-26, -8, -5, 5, 13, 16);
const depotSign = poly([[-28, 9, 5.5], [-6, 9, 5.5], [-6, 9, 7], [-28, 9, 7]]);
const depotDoor = poly([[-4, -6, 0], [-4, 6, 0], [-4, 6, 9], [-4, -6, 9]]);
const HOUSE_X = 220;
const house = box(HOUSE_X, HOUSE_X + 20, -8, 8, 0, 11);
const roofSide = poly([[HOUSE_X - 1, 9, 10.5], [HOUSE_X + 21, 9, 10.5], [HOUSE_X + 21, 0, 19], [HOUSE_X - 1, 0, 19]]);
const roofBack = poly([[HOUSE_X - 1, -9, 10.5], [HOUSE_X + 21, -9, 10.5], [HOUSE_X + 21, 0, 19], [HOUSE_X - 1, 0, 19]]);
const gable = poly([[HOUSE_X + 20, -8, 11], [HOUSE_X + 20, 8, 11], [HOUSE_X + 20, 0, 18.3]]);
const door = poly([[HOUSE_X + 7, 8, 0], [HOUSE_X + 11.5, 8, 0], [HOUSE_X + 11.5, 8, 6.5], [HOUSE_X + 7, 8, 6.5]]);
const houseWindow = poly([[HOUSE_X + 20, 1, 4.5], [HOUSE_X + 20, 5.5, 4.5], [HOUSE_X + 20, 5.5, 8], [HOUSE_X + 20, 1, 8]]);
const DOOR_GROUND = P([HOUSE_X + 9, 13, 0]);
const DEPOT_LABEL = P([-17, 14, 0]);
const HOUSE_LABEL = P([HOUSE_X + 10, 15, 0]);

const KEY_TIMES = '0;0.08;0.8;0.94;1';
const SPLINES = '0 0 1 1;0.42 0 0.22 1;0 0 1 1;0 0 1 1';
const DUR = '8s';

export function LiveStage({ stage, motion, uid, teamLabel, whereLabel }: { stage: CustomerStage; motion: boolean; uid: string; teamLabel: string; whereLabel: string }) {
  const driving = stage === 'en-route';
  const atDoor = stage === 'arrived' || stage === 'in-progress' || stage === 'done';
  const parked = driving ? (motion ? undefined : at(0.5)) : atDoor ? at(0.93) : at(0.07);
  const anim = driving && motion;
  const rippling = motion && (driving || stage === 'arrived' || stage === 'in-progress');
  const RX = 1.127;
  const RY = 0.65;
  return (
    <svg className="stage" viewBox="0 0 320 136" aria-hidden="true">
      <defs>
        <filter id={`sh${uid}`} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <filter id={`gl${uid}`} x="-20%" y="-80%" width="140%" height="260%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`gs${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a0a10" />
          <stop offset="0.45" stopColor="#5a1a24" />
          <stop offset="0.5" stopColor="#8a3a46" />
          <stop offset="0.56" stopColor="#4a141d" />
          <stop offset="1" stopColor="#1f070c" />
        </linearGradient>
        <linearGradient id={`gt${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffdf9" />
          <stop offset="1" stopColor="#f1e9db" />
        </linearGradient>
      </defs>

      {/* ground */}
      <path d={GRID} className="stage__grid" />
      <path d={ROAD_D} className="stage__road" />
      <path d={ROAD_D} className="stage__lane" />
      <path id={`rd${uid}`} d={ROAD_D} className="stage__trail" pathLength={1} filter={`url(#gl${uid})`} style={anim ? undefined : { strokeDashoffset: atDoor ? 0 : 1 }}>
        {anim && <animate attributeName="stroke-dashoffset" values="1;1;0;0;0" keyTimes={KEY_TIMES} calcMode="spline" keySplines={SPLINES} dur={DUR} repeatCount="indefinite" />}
        {anim && <animate attributeName="opacity" values="1;1;1;1;0" keyTimes={KEY_TIMES} dur={DUR} repeatCount="indefinite" />}
      </path>

      {/* the depot */}
      <g className="stage__bld">
        <polygon points={depot.side} className="bld__side" />
        <polygon points={depot.front} className="bld__front" />
        <polygon points={depot.top} className="bld__top" />
        <polygon points={depotDoor} className="bld__door" />
        <polygon points={depotSign} className="bld__sign" />
        <text transform={faceMatrix(-24, 9.01, 11)} className="bld__text">
          548
        </text>
        <polygon points={depotRoof.side} className="bld__side" />
        <polygon points={depotRoof.front} className="bld__front" />
        <polygon points={depotRoof.top} className="bld__top" />
      </g>
      <text x={DEPOT_LABEL[0]} y={DEPOT_LABEL[1] + 12} textAnchor="middle" className="stage__label">
        {teamLabel}
      </text>

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
      <g className={`stage__bld stage__house ${stage === 'done' ? 'stage__house--done' : stage === 'in-progress' ? 'stage__house--busy' : ''}`}>
        <polygon points={house.side} className="bld__side" />
        <polygon points={house.front} className="bld__front" />
        <polygon points={houseWindow} className="bld__window" />
        <polygon points={door} className="bld__door" />
        <polygon points={roofBack} className="roof__back" />
        <polygon points={roofSide} className="roof__side" />
        <polygon points={gable} className="roof__gable" />
      </g>
      <text x={HOUSE_LABEL[0]} y={HOUSE_LABEL[1] + 12} textAnchor="middle" className="stage__label">
        {whereLabel}
      </text>

      {/* the truck */}
      <g className="stage__truck" transform={parked} opacity={anim ? 0 : 1}>
        {anim && (
          <>
            <animateMotion dur={DUR} repeatCount="indefinite" calcMode="spline" keyPoints="0;0;1;1;1" keyTimes={KEY_TIMES} keySplines={SPLINES}>
              <mpath href={`#rd${uid}`} />
            </animateMotion>
            <animate attributeName="opacity" values="0;1;1;1;0" keyTimes={KEY_TIMES} dur={DUR} repeatCount="indefinite" />
          </>
        )}
        <g>
          {anim && <animateTransform attributeName="transform" type="scale" values="0.9;0.9;1.06;1.06;1.06" keyTimes={KEY_TIMES} calcMode="spline" keySplines={SPLINES} dur={DUR} repeatCount="indefinite" />}
          <g className="truck__bob">
            <polygon points={SHADOW} className="truck__shadow" filter={`url(#sh${uid})`} />
            <polygon points={cargo.side} className="truck__side" />
            <polygon points={cargo.front} className="truck__front" />
            <polygon points={cargo.top} fill={`url(#gt${uid})`} />
            <polygon points={stripe} className="truck__stripe" />
            <polygon points={brassLine} className="truck__brass" />
            <text transform={textOnSide} className="truck__text">
              548
            </text>
            <polygon points={cab.side} className="truck__side" />
            <polygon points={cab.front} className="truck__front" />
            <polygon points={cab.top} fill={`url(#gt${uid})`} />
            <polygon points={sideWindow} fill={`url(#gs${uid})`} className="truck__glass" />
            <polygon points={windshield} fill={`url(#gs${uid})`} className="truck__glass" />
            <polygon points={hood.side} className="truck__side" />
            <polygon points={hood.front} className="truck__front" />
            <polygon points={hood.top} fill={`url(#gt${uid})`} />
            <polygon points={headlight} className="truck__light" />
            {WHEELS.map((w, i) => (
              <g key={i}>
                <polygon points={w.rim} className="truck__tire" />
                <polygon points={w.hub} className="truck__hub" />
                <g className="truck__spokes" transform={`translate(${f(w.c[0])} ${f(w.c[1])})`}>
                  {anim && <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.8s" repeatCount="indefinite" additive="sum" />}
                  <path d="M-1.6 0H1.6M0 -1.6V1.6" />
                </g>
              </g>
            ))}
          </g>
        </g>
      </g>
    </svg>
  );
}
