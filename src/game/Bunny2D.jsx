// A flat, front-on bunny for the rooms. Same colours and poses as the 3D one
// (bunny3d.js / bunnyPoses.js): sit, stand and loaf.
const C = { body: "#c4a276", tan: "#a88a5f", belly: "#f0e5d1", pink: "#d9a9a0", line: "#5b4a3a", eye: "#262626" };
const st = { stroke: C.line, strokeWidth: 2, strokeLinejoin: "round" };

const Ear = ({ x, tilt, y = 15, ry = 17 }) => (
  <g transform={`rotate(${tilt} ${x} ${y + ry - 4})`}>
    <ellipse cx={x} cy={y} rx="6.5" ry={ry} fill={C.tan} {...st} />
    <ellipse cx={x} cy={y + 2} rx="3" ry={ry - 6} fill={C.pink} />
  </g>
);

function Face({ x, y, sleepy }) {
  return (
    <g>
      <ellipse cx={x} cy={y - 4} rx="3.6" ry="9" fill={C.belly} />
      {sleepy ? (
        <path d={`M${x - 11} ${y} q3 3 6 0 M${x + 5} ${y} q3 3 6 0`} fill="none" stroke={C.eye} strokeWidth="2" strokeLinecap="round" />
      ) : (
        <>
          <circle cx={x - 8} cy={y} r="2.6" fill={C.eye} />
          <circle cx={x + 8} cy={y} r="2.6" fill={C.eye} />
        </>
      )}
      <ellipse cx={x} cy={y + 6} rx="2.6" ry="2" fill={C.pink} stroke={C.line} strokeWidth="1" />
      <path d={`M${x} ${y + 8} q-3 3 -5 1 M${x} ${y + 8} q3 3 5 1`} fill="none" stroke={C.line} strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

const Shadow = ({ rx }) => <ellipse cx="50" cy="97" rx={rx} ry="3" fill="#2f3a24" opacity="0.22" />;

const POSES = {
  sit: (
    <>
      <Shadow rx="30" />
      <Ear x={41} tilt={-8} /><Ear x={59} tilt={8} />
      <ellipse cx="30" cy="82" rx="13" ry="13" fill={C.body} {...st} />
      <ellipse cx="70" cy="82" rx="13" ry="13" fill={C.body} {...st} />
      <ellipse cx="32" cy="94" rx="11" ry="4.5" fill={C.body} {...st} />
      <ellipse cx="68" cy="94" rx="11" ry="4.5" fill={C.body} {...st} />
      <ellipse cx="50" cy="72" rx="24" ry="22" fill={C.body} {...st} />
      <ellipse cx="50" cy="78" rx="13" ry="14" fill={C.belly} />
      <ellipse cx="43" cy="90" rx="5" ry="8" fill={C.body} {...st} />
      <ellipse cx="57" cy="90" rx="5" ry="8" fill={C.body} {...st} />
      <ellipse cx="50" cy="42" rx="20" ry="17" fill={C.body} {...st} />
      <Face x={50} y={43} />
    </>
  ),
  stand: (
    <>
      <Shadow rx="26" />
      <Ear x={42} tilt={-5} y={9} ry={16} /><Ear x={58} tilt={5} y={9} ry={16} />
      <ellipse cx="32" cy="84" rx="12" ry="12" fill={C.body} {...st} />
      <ellipse cx="68" cy="84" rx="12" ry="12" fill={C.body} {...st} />
      <ellipse cx="34" cy="95" rx="10" ry="4" fill={C.body} {...st} />
      <ellipse cx="66" cy="95" rx="10" ry="4" fill={C.body} {...st} />
      <ellipse cx="50" cy="64" rx="19" ry="28" fill={C.body} {...st} />
      <ellipse cx="50" cy="68" rx="11" ry="20" fill={C.belly} />
      <ellipse cx="42" cy="58" rx="5" ry="7" fill={C.body} {...st} />
      <ellipse cx="58" cy="58" rx="5" ry="7" fill={C.body} {...st} />
      <ellipse cx="50" cy="33" rx="18" ry="15" fill={C.body} {...st} />
      <Face x={50} y={34} />
    </>
  ),
  loaf: (
    <>
      <Shadow rx="38" />
      <g transform="rotate(-70 29 50)"><ellipse cx="29" cy="50" rx="5.5" ry="14" fill={C.tan} {...st} /></g>
      <g transform="rotate(70 71 50)"><ellipse cx="71" cy="50" rx="5.5" ry="14" fill={C.tan} {...st} /></g>
      <ellipse cx="50" cy="78" rx="35" ry="19" fill={C.body} {...st} />
      <ellipse cx="41" cy="93" rx="4.5" ry="3" fill={C.belly} {...st} />
      <ellipse cx="59" cy="93" rx="4.5" ry="3" fill={C.belly} {...st} />
      <ellipse cx="50" cy="57" rx="19" ry="15" fill={C.body} {...st} />
      <Face x={50} y={57} sleepy />
    </>
  ),
};

export default function Bunny2D({ pose = "sit", className = "" }) {
  return (
    <svg className={`bunny2d ${className}`} viewBox="0 -8 100 108" aria-hidden="true">{POSES[pose] || POSES.sit}</svg>
  );
}
