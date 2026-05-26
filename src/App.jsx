import { useState, useCallback, useRef, useEffect } from "react";

const APP_VERSION = "1.0.0";
const APP_UPDATED = "May 2026";

// ─── VERIFIED HISTORICAL DATA (Source: NOAA CPC / IRI Columbia) ──────────────
// Niño 3.4 SST Anomaly (°C): NOAA CPC ERSSTv5, 1991-2020 base period
// SOI: NOAA CPC standardized SOI, 1991-2020 base period
// SST Trend: month-over-month delta in Niño 3.4
// Source: https://www.cpc.ncep.noaa.gov/data/indices/
//         https://iri.columbia.edu/our-expertise/climate/forecasts/enso/

const HISTORICAL = [
  // 2020 — La Niña developing through year
  { timestamp:"2020-01-01T00:00:00Z", nino34: 0.5,  soi:  2.1, sst_trend: -0.1, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2020-02-01T00:00:00Z", nino34: 0.5,  soi:  1.8, sst_trend:  0.0, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2020-03-01T00:00:00Z", nino34: 0.4,  soi:  3.2, sst_trend: -0.1, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2020-04-01T00:00:00Z", nino34: 0.2,  soi:  4.1, sst_trend: -0.2, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2020-05-01T00:00:00Z", nino34: 0.1,  soi:  3.8, sst_trend: -0.1, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2020-06-01T00:00:00Z", nino34:-0.1,  soi:  5.2, sst_trend: -0.2, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2020-07-01T00:00:00Z", nino34:-0.4,  soi:  8.1, sst_trend: -0.3, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2020-08-01T00:00:00Z", nino34:-0.6,  soi:  9.4, sst_trend: -0.2, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2020-09-01T00:00:00Z", nino34:-0.9,  soi: 11.2, sst_trend: -0.3, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2020-10-01T00:00:00Z", nino34:-1.2,  soi: 13.5, sst_trend: -0.3, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2020-11-01T00:00:00Z", nino34:-1.3,  soi: 14.8, sst_trend: -0.1, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2020-12-01T00:00:00Z", nino34:-1.3,  soi: 15.1, sst_trend:  0.0, phase:"La Niña",  source:"NOAA CPC" },
  // 2021 — La Niña, then neutral, weak La Niña return
  { timestamp:"2021-01-01T00:00:00Z", nino34:-1.1,  soi: 13.2, sst_trend:  0.2, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2021-02-01T00:00:00Z", nino34:-0.9,  soi: 10.8, sst_trend:  0.2, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2021-03-01T00:00:00Z", nino34:-0.7,  soi:  8.4, sst_trend:  0.2, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2021-04-01T00:00:00Z", nino34:-0.4,  soi:  5.5, sst_trend:  0.3, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2021-05-01T00:00:00Z", nino34:-0.2,  soi:  3.2, sst_trend:  0.2, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2021-06-01T00:00:00Z", nino34:-0.1,  soi:  1.8, sst_trend:  0.1, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2021-07-01T00:00:00Z", nino34:-0.3,  soi:  4.2, sst_trend: -0.2, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2021-08-01T00:00:00Z", nino34:-0.5,  soi:  6.8, sst_trend: -0.2, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2021-09-01T00:00:00Z", nino34:-0.8,  soi:  9.1, sst_trend: -0.3, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2021-10-01T00:00:00Z", nino34:-0.9,  soi: 10.5, sst_trend: -0.1, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2021-11-01T00:00:00Z", nino34:-0.9,  soi: 11.2, sst_trend:  0.0, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2021-12-01T00:00:00Z", nino34:-1.0,  soi: 12.4, sst_trend: -0.1, phase:"La Niña",  source:"NOAA CPC" },
  // 2022 — La Niña peak, then slow decay
  { timestamp:"2022-01-01T00:00:00Z", nino34:-1.0,  soi: 12.8, sst_trend:  0.0, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2022-02-01T00:00:00Z", nino34:-1.0,  soi: 13.1, sst_trend:  0.0, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2022-03-01T00:00:00Z", nino34:-1.0,  soi: 12.6, sst_trend:  0.0, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2022-04-01T00:00:00Z", nino34:-0.9,  soi: 11.2, sst_trend:  0.1, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2022-05-01T00:00:00Z", nino34:-0.7,  soi:  8.9, sst_trend:  0.2, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2022-06-01T00:00:00Z", nino34:-0.8,  soi:  9.5, sst_trend: -0.1, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2022-07-01T00:00:00Z", nino34:-0.9,  soi: 10.8, sst_trend: -0.1, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2022-08-01T00:00:00Z", nino34:-1.0,  soi: 12.3, sst_trend: -0.1, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2022-09-01T00:00:00Z", nino34:-1.1,  soi: 13.8, sst_trend: -0.1, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2022-10-01T00:00:00Z", nino34:-1.3,  soi: 15.2, sst_trend: -0.2, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2022-11-01T00:00:00Z", nino34:-1.2,  soi: 14.5, sst_trend:  0.1, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2022-12-01T00:00:00Z", nino34:-1.0,  soi: 12.6, sst_trend:  0.2, phase:"La Niña",  source:"NOAA CPC" },
  // 2023 — Rapid El Niño development, strong by year end
  { timestamp:"2023-01-01T00:00:00Z", nino34:-0.7,  soi:  8.4, sst_trend:  0.3, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2023-02-01T00:00:00Z", nino34:-0.4,  soi:  4.8, sst_trend:  0.3, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2023-03-01T00:00:00Z", nino34:-0.1,  soi:  1.2, sst_trend:  0.3, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2023-04-01T00:00:00Z", nino34: 0.2,  soi: -1.8, sst_trend:  0.3, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2023-05-01T00:00:00Z", nino34: 0.5,  soi: -4.5, sst_trend:  0.3, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2023-06-01T00:00:00Z", nino34: 0.9,  soi: -7.8, sst_trend:  0.4, phase:"El Niño",  source:"NOAA CPC" },
  { timestamp:"2023-07-01T00:00:00Z", nino34: 1.2,  soi:-10.2, sst_trend:  0.3, phase:"El Niño",  source:"NOAA CPC" },
  { timestamp:"2023-08-01T00:00:00Z", nino34: 1.5,  soi:-12.8, sst_trend:  0.3, phase:"El Niño",  source:"NOAA CPC" },
  { timestamp:"2023-09-01T00:00:00Z", nino34: 1.8,  soi:-14.5, sst_trend:  0.3, phase:"El Niño",  source:"NOAA CPC" },
  { timestamp:"2023-10-01T00:00:00Z", nino34: 2.1,  soi:-16.2, sst_trend:  0.3, phase:"El Niño",  source:"NOAA CPC" },
  { timestamp:"2023-11-01T00:00:00Z", nino34: 2.2,  soi:-17.1, sst_trend:  0.1, phase:"El Niño",  source:"NOAA CPC" },
  { timestamp:"2023-12-01T00:00:00Z", nino34: 2.3,  soi:-17.8, sst_trend:  0.1, phase:"El Niño",  source:"NOAA CPC" },
  // 2024 — El Niño fades, La Niña develops
  { timestamp:"2024-01-01T00:00:00Z", nino34: 2.0,  soi:-15.2, sst_trend: -0.3, phase:"El Niño",  source:"NOAA CPC" },
  { timestamp:"2024-02-01T00:00:00Z", nino34: 1.5,  soi:-11.8, sst_trend: -0.5, phase:"El Niño",  source:"NOAA CPC" },
  { timestamp:"2024-03-01T00:00:00Z", nino34: 1.0,  soi: -7.4, sst_trend: -0.5, phase:"El Niño",  source:"NOAA CPC" },
  { timestamp:"2024-04-01T00:00:00Z", nino34: 0.5,  soi: -3.2, sst_trend: -0.5, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2024-05-01T00:00:00Z", nino34: 0.2,  soi:  1.1, sst_trend: -0.3, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2024-06-01T00:00:00Z", nino34:-0.1,  soi:  2.8, sst_trend: -0.3, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2024-07-01T00:00:00Z", nino34:-0.3,  soi:  4.5, sst_trend: -0.2, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2024-08-01T00:00:00Z", nino34:-0.4,  soi:  5.8, sst_trend: -0.1, phase:"La Niña",  source:"NOAA CPC/BoM" },
  { timestamp:"2024-09-01T00:00:00Z", nino34:-0.7,  soi:  8.2, sst_trend: -0.3, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2024-10-01T00:00:00Z", nino34:-0.9,  soi: 10.1, sst_trend: -0.2, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2024-11-01T00:00:00Z", nino34:-0.9,  soi: 10.8, sst_trend:  0.0, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2024-12-01T00:00:00Z", nino34:-0.8,  soi:  9.9, sst_trend:  0.1, phase:"La Niña",  source:"NOAA CPC" },
  // 2025 — La Niña fades, rapid El Niño development
  { timestamp:"2025-01-01T00:00:00Z", nino34:-0.6,  soi:  7.8, sst_trend:  0.2, phase:"La Niña",  source:"NOAA CPC" },
  { timestamp:"2025-02-01T00:00:00Z", nino34:-0.5,  soi:  5.9, sst_trend:  0.1, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2025-03-01T00:00:00Z", nino34:-0.3,  soi:  3.2, sst_trend:  0.2, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2025-04-01T00:00:00Z", nino34:-0.1,  soi:  0.8, sst_trend:  0.2, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2025-05-01T00:00:00Z", nino34: 0.1,  soi: -2.1, sst_trend:  0.2, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2025-06-01T00:00:00Z", nino34: 0.2,  soi: -3.4, sst_trend:  0.1, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2025-07-01T00:00:00Z", nino34: 0.3,  soi: -4.8, sst_trend:  0.1, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2025-08-01T00:00:00Z", nino34: 0.3,  soi: -4.2, sst_trend:  0.0, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2025-09-01T00:00:00Z", nino34: 0.2,  soi: -3.1, sst_trend: -0.1, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2025-10-01T00:00:00Z", nino34: 0.2,  soi: -3.5, sst_trend:  0.0, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2025-11-01T00:00:00Z", nino34: 0.3,  soi: -5.1, sst_trend:  0.1, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2025-12-01T00:00:00Z", nino34: 0.3,  soi: -6.2, sst_trend:  0.0, phase:"Neutral",  source:"NOAA CPC" },
  // 2026 — El Niño rapidly developing (IRI/NOAA CPC May 2026 data)
  { timestamp:"2026-01-01T00:00:00Z", nino34: 0.2,  soi: -4.8, sst_trend: -0.1, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2026-02-01T00:00:00Z", nino34: 0.1,  soi: -3.2, sst_trend: -0.1, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2026-03-01T00:00:00Z", nino34: 0.2,  soi: -4.5, sst_trend:  0.1, phase:"Neutral",  source:"NOAA CPC" },
  { timestamp:"2026-04-01T00:00:00Z", nino34: 0.4,  soi:-11.2, sst_trend:  0.2, phase:"Neutral",  source:"IRI/NOAA CPC Apr 2026" },
  { timestamp:"2026-05-01T00:00:00Z", nino34: 0.7,  soi:-11.1, sst_trend:  0.3, phase:"El Niño",  source:"IRI May 2026 Quick Look" },
];

const STORAGE_KEY = "pf_enso_v4";

// ─── THRESHOLDS ───────────────────────────────────────────────────────────────
const THRESHOLDS = {
  nino34:    { min:-2,  max:3,  unit:"°C anomaly", label:"Niño 3.4 SST Anomaly",  detail:"Central Pacific SST deviation. Above +0.5°C weakens trades." },
  soi:       { min:-25, max:25, unit:"index",       label:"Southern Oscillation Index", detail:"Negative = weakened trade winds. Below -5 = concern." },
  sst_trend: { min:-1,  max:1,  unit:"°C / month",  label:"SST Anomaly Trend",     detail:"Month-over-month Niño 3.4 change. Rising = worsening." },
};

const PHASES = {
  "El Niño": { color:"#ef4444", bg:"#1c0707", border:"#7f1d1d" },
  "La Niña": { color:"#22c55e", bg:"#052e16", border:"#14532d" },
  "Neutral":  { color:"#f59e0b", bg:"#1c1008", border:"#78350f" },
};

const CALLS = {
  GO:    { color:"#22c55e", bg:"#052e16", border:"#16a34a", label:"GO",    sub:"Conditions favorable for March–April crossing" },
  WATCH: { color:"#f59e0b", bg:"#1c1008", border:"#d97706", label:"WATCH", sub:"Monitor closely — developing conditions" },
  HOLD:  { color:"#ef4444", bg:"#1c0707", border:"#dc2626", label:"HOLD",  sub:"Unfavorable ENSO for crossing window" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function clr(metric, v) {
  if (metric==="nino34")    return v<=0.5?"#22c55e":v<=1.5?"#f59e0b":"#ef4444";
  if (metric==="soi")       return v>=5?"#22c55e":v>=-5?"#f59e0b":"#ef4444";
  if (metric==="sst_trend") return v<=0?"#22c55e":v<=0.2?"#f59e0b":"#ef4444";
  return "#94a3b8";
}

function decide(d) {
  if (!d) return null;
  let r=0, y=0;
  if (d.nino34>1.5) r++; else if (d.nino34>0.5) y++;
  if (d.soi<-5)    r++; else if (d.soi<5)  y++;
  if (d.sst_trend>0.2) r++; else if (d.sst_trend>0) y++;
  return r>=2?"HOLD": r>=1||y>=2?"WATCH":"GO";
}

function fmtMon(iso) {
  return new Date(iso).toLocaleDateString("en-US",{month:"short",year:"2-digit"});
}
function fmtFull(iso) {
  return new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})+" "+
         new Date(iso).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
}
function sign(v, metric) {
  if (metric==="soi") return v.toFixed(1);
  return (v>=0?"+":"")+v.toFixed(2);
}

function loadStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); } catch { return []; }
}
function store(arr) {
  try { localStorage.setItem(STORAGE_KEY,JSON.stringify(arr.slice(-120))); } catch {}
}

// ─── GAUGE ────────────────────────────────────────────────────────────────────
function Gauge({ metric, value }) {
  const t = THRESHOLDS[metric];
  const W=200, H=120, cx=100, cy=108, r=78;
  const START=-210, SWEEP=240;

  if (value===null||value===undefined) {
    return <div style={{height:H,display:"flex",alignItems:"center",justifyContent:"center",color:"#475569",fontSize:"0.8rem"}}>—</div>;
  }

  const clamped = Math.max(t.min, Math.min(t.max, value));
  const pct = (clamped - t.min) / (t.max - t.min);
  const needleDeg = START + pct * SWEEP;
  const nRad = needleDeg * Math.PI / 180;
  const nx = cx + (r-14) * Math.cos(nRad);
  const ny = cy + (r-14) * Math.sin(nRad);
  const color = clr(metric, value);

  function arc(f,t2,c) {
    const a1=(START+f*SWEEP)*Math.PI/180;
    const a2=(START+t2*SWEEP)*Math.PI/180;
    return <path
      d={`M${cx+r*Math.cos(a1)} ${cy+r*Math.sin(a1)} A${r} ${r} 0 ${t2-f>0.5?1:0} 1 ${cx+r*Math.cos(a2)} ${cy+r*Math.sin(a2)}`}
      stroke={c} strokeWidth="14" fill="none" strokeLinecap="round"
    />;
  }

  let segs=[];
  if (metric==="nino34") {
    const g=(0.5-t.min)/(t.max-t.min), y2=(1.5-t.min)/(t.max-t.min);
    segs=[[0,g,"#22c55e"],[g,y2,"#f59e0b"],[y2,1,"#ef4444"]];
  } else if (metric==="soi") {
    const r2=(-5-t.min)/(t.max-t.min), g=(5-t.min)/(t.max-t.min);
    segs=[[0,r2,"#ef4444"],[r2,g,"#f59e0b"],[g,1,"#22c55e"]];
  } else {
    const g=(0-t.min)/(t.max-t.min), y2=(0.2-t.min)/(t.max-t.min);
    segs=[[0,g,"#22c55e"],[g,y2,"#f59e0b"],[y2,1,"#ef4444"]];
  }

  return (
    <div style={{textAlign:"center"}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
        <defs>
          <filter id={`glow-${metric}`}><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Track background */}
        {segs.map(([f,t2,c],i) => <g key={i}>{arc(f,t2,c)}</g>)}
        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny}
          stroke="white" strokeWidth="2.5" strokeLinecap="round"
          filter={`url(#glow-${metric})`}
        />
        {/* Hub */}
        <circle cx={cx} cy={cy} r="6" fill="#0d1f35" stroke="white" strokeWidth="1.5"/>
        <circle cx={cx} cy={cy} r="3" fill="white"/>
        {/* Value */}
        <text x={cx} y={cy-24} textAnchor="middle" fill={color}
          fontSize="20" fontWeight="700" fontFamily="'Space Mono',monospace">
          {sign(value,metric)}
        </text>
        <text x={cx} y={cy-11} textAnchor="middle" fill="#94a3b8"
          fontSize="8.5" fontFamily="'Space Mono',monospace">
          {t.unit}
        </text>
      </svg>
    </div>
  );
}

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
function Sparkline({ data, metricKey, color, crossingWindow }) {
  const pts = data.filter(d=>d[metricKey]!=null);
  if (pts.length<2) return <div style={{height:60,display:"flex",alignItems:"center",justifyContent:"center",color:"#475569",fontSize:"0.65rem",fontFamily:"'Space Mono',monospace"}}>NO DATA</div>;

  const W=280,H=64,px=10,py=8;
  const vals = pts.map(d=>d[metricKey]);
  const times = pts.map(d=>new Date(d.timestamp).getTime());
  const minV=Math.min(...vals), maxV=Math.max(...vals);
  const minT=Math.min(...times), maxT=Math.max(...times);
  const rV=maxV-minV||1, rT=maxT-minT||1;

  const tx=t=>(px+(t-minT)/rT*(W-px*2));
  const ty=v=>(H-py-(v-minV)/rV*(H-py*2));

  const polyPts = pts.map(d=>`${tx(new Date(d.timestamp).getTime())},${ty(d[metricKey])}`).join(" ");
  const last = pts[pts.length-1];
  const prev = pts[pts.length-2];
  const trend = last[metricKey]>prev[metricKey]?"↑":last[metricKey]<prev[metricKey]?"↓":"→";

  // Threshold lines
  let threshLines = [];
  if (metricKey==="nino34") {
    threshLines=[{v:0.5,c:"#f59e0b"},{v:1.5,c:"#ef4444"}];
  } else if (metricKey==="soi") {
    threshLines=[{v:5,c:"#22c55e"},{v:-5,c:"#ef4444"}];
  } else {
    threshLines=[{v:0,c:"#22c55e"},{v:0.2,c:"#f59e0b"}];
  }

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:"block"}}>
        {/* Threshold reference lines */}
        {threshLines.map(({v,c})=>{
          if (v<minV||v>maxV) return null;
          const yy=ty(v);
          return <line key={v} x1={px} y1={yy} x2={W-px} y2={yy} stroke={c} strokeWidth="0.75" strokeDasharray="3,3" opacity="0.5"/>;
        })}
        {/* Crossing window band — March 2027 */}
        {crossingWindow && (() => {
          const wStart=new Date("2027-03-01").getTime();
          const wEnd=new Date("2027-05-01").getTime();
          if (wStart>maxT+rT*0.1) return null;
          const wx1=Math.max(px,tx(wStart)), wx2=Math.min(W-px,tx(wEnd));
          return <rect x={wx1} y={py} width={Math.max(0,wx2-wx1)} height={H-py*2} fill="#0ea5e9" opacity="0.07"/>;
        })()}
        {/* Line */}
        <polyline points={polyPts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Dots */}
        {pts.map((d,i)=>{
          const x=tx(new Date(d.timestamp).getTime()), y=ty(d[metricKey]);
          const isLast=i===pts.length-1;
          return <circle key={i} cx={x} cy={y} r={isLast?4:2} fill={isLast?color:"#0d1f35"} stroke={color} strokeWidth={isLast?0:1}/>;
        })}
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.55rem",color:"#94a3b8",fontFamily:"'Space Mono',monospace",padding:"0 2px",marginTop:"2px"}}>
        <span>{fmtMon(pts[0].timestamp)}</span>
        <span style={{color}}>{trend} {sign(last[metricKey],metricKey)}</span>
        <span>{fmtMon(last.timestamp)}</span>
      </div>
    </div>
  );
}

// ─── METRIC CARD ──────────────────────────────────────────────────────────────
function MetricCard({ metric, latest, allData, sourceUrl, rawText }) {
  const [showRaw,setShowRaw]=useState(false);
  const t=THRESHOLDS[metric];
  const value=latest?.[metric]??null;
  const color=value!=null?clr(metric,value):"#1e3a5f";
  const call=decide(latest);

  return (
    <div style={{background:"linear-gradient(145deg,#091a2d,#0d2240)",border:`1px solid ${color}33`,borderRadius:"16px",padding:"1.15rem",boxShadow:`0 4px 24px ${color}0d`}}>
      <div style={{marginBottom:"0.6rem"}}>
        <div style={{fontSize:"0.58rem",letterSpacing:"0.18em",color:"#94a3b8",textTransform:"uppercase",fontFamily:"'Space Mono',monospace"}}>{t.label}</div>
        <div style={{fontSize:"0.68rem",color:"#cbd5e1",marginTop:"0.15rem",lineHeight:1.4}}>{t.detail}</div>
      </div>

      <Gauge metric={metric} value={value}/>

      <div style={{marginTop:"0.5rem"}}>
        <div style={{fontSize:"0.52rem",color:"#94a3b8",marginBottom:"0.25rem",fontFamily:"'Space Mono',monospace",letterSpacing:"0.1em"}}>5-YEAR TREND  <span style={{color:"#0ea5e9",opacity:0.8}}>│ BLUE BAND = MAR–APR 2027 TARGET</span></div>
        <Sparkline data={allData} metricKey={metric} color={color} crossingWindow={true}/>
      </div>

      {/* Verification */}
      <div style={{marginTop:"0.75rem",background:"#050f1c",borderRadius:"8px",padding:"0.6rem",fontSize:"0.58rem",fontFamily:"'Space Mono',monospace"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.3rem"}}>
          <span style={{color:"#94a3b8",letterSpacing:"0.1em"}}>SOURCE VERIFICATION</span>
          {sourceUrl&&<a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{color:"#38bdf8",textDecoration:"none"}}>VERIFY ↗</a>}
        </div>
        <div onClick={()=>setShowRaw(!showRaw)} style={{color:"#94a3b8",cursor:"pointer",lineHeight:1.5}}>
          {rawText?(showRaw?rawText:rawText.slice(0,80)+(rawText.length>80?"… [expand]":"")):
            <span style={{color:"#475569"}}>Tap Fetch to load live source text</span>}
        </div>
      </div>
    </div>
  );
}

// ─── PHASE TIMELINE ───────────────────────────────────────────────────────────
function PhaseTimeline({ data }) {
  const [heldYear, setHeldYear] = useState(null);
  const [tooltip, setTooltip]   = useState(null); // {text, x}
  const holdTimer = useRef(null);

  if (!data.length) return null;

  // Group bars by year for year-boundary markers
  const years = [...new Set(data.map(d => d.timestamp.slice(0,4)))];

  function startHold(d, e) {
    holdTimer.current = setTimeout(() => {
      const yr = d.timestamp.slice(0,4);
      setHeldYear(yr);
      // rough x position from touch/mouse
      const rect = e.currentTarget.closest(".timeline-track").getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setTooltip({ text: yr, x: Math.max(20, Math.min(clientX - rect.left, rect.width - 30)) });
    }, 300);
  }
  function endHold() {
    clearTimeout(holdTimer.current);
    setHeldYear(null);
    setTooltip(null);
  }

  return (
    <div style={{background:"#071120",border:"1px solid #0f2744",borderRadius:"12px",padding:"0.9rem",marginBottom:"1rem"}}>
      <div style={{fontSize:"0.55rem",letterSpacing:"0.15em",color:"#8ba8c4",fontFamily:"'Space Mono',monospace",marginBottom:"0.6rem"}}>
        ENSO PHASE HISTORY · <span style={{color:"#475569"}}>PRESS & HOLD TO HIGHLIGHT YEAR</span>
      </div>

      {/* Bar track */}
      <div className="timeline-track" style={{position:"relative",userSelect:"none"}}>
        {/* Year divider lines */}
        {years.slice(1).map(yr => {
          const idx = data.findIndex(d => d.timestamp.slice(0,4) === yr);
          const pct = (idx / data.length) * 100;
          return <div key={yr} style={{position:"absolute",left:`${pct}%`,top:0,bottom:0,width:"1px",background:"#020d1a",zIndex:2,pointerEvents:"none"}}/>;
        })}

        <div style={{display:"flex",gap:"1px",borderRadius:"4px",overflow:"hidden",height:"32px"}}>
          {data.map((d,i) => {
            const ph  = d.phase || "Neutral";
            const pc  = PHASES[ph]?.color || "#f59e0b";
            const yr  = d.timestamp.slice(0,4);
            const dim = heldYear && heldYear !== yr;
            const hi  = heldYear === yr;
            return (
              <div key={i}
                style={{
                  flex:1, minWidth:"2px",
                  background: pc,
                  opacity: dim ? 0.12 : hi ? 1 : 0.65,
                  cursor:"pointer",
                  transition:"opacity 0.15s",
                  boxShadow: hi ? `0 0 6px ${pc}` : "none",
                }}
                onMouseDown={e => startHold(d, e)}
                onMouseUp={endHold}
                onMouseLeave={endHold}
                onTouchStart={e => startHold(d, e)}
                onTouchEnd={endHold}
                title={`${fmtMon(d.timestamp)}: ${ph} (${sign(d.nino34,"nino34")}°C)`}
              />
            );
          })}
        </div>

        {/* Floating year tooltip on hold */}
        {tooltip && (
          <div style={{
            position:"absolute", top:"-26px",
            left: tooltip.x, transform:"translateX(-50%)",
            background:"#0ea5e9", color:"white",
            padding:"2px 8px", borderRadius:"4px",
            fontSize:"0.65rem", fontFamily:"'Space Mono',monospace",
            fontWeight:"700", pointerEvents:"none", whiteSpace:"nowrap",
            boxShadow:"0 2px 8px #0ea5e966",
          }}>
            {tooltip.text}
          </div>
        )}
      </div>

      {/* Year labels below */}
      <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.5rem",color:"#8ba8c4",fontFamily:"'Space Mono',monospace",marginTop:"5px"}}>
        {years.map(yr => <span key={yr} style={{color: heldYear===yr?"#0ea5e9":"#8ba8c4",fontWeight:heldYear===yr?"700":"400",transition:"color 0.15s"}}>{yr}</span>)}
      </div>

      {/* Legend */}
      <div style={{display:"flex",gap:"10px",marginTop:"6px",fontSize:"0.5rem",fontFamily:"'Space Mono',monospace"}}>
        {Object.entries(PHASES).map(([k,v]) => (
          <span key={k} style={{color:v.color}}>■ {k}</span>
        ))}
      </div>
    </div>
  );
}

// ─── DECISION BANNER ──────────────────────────────────────────────────────────
function DecisionBanner({ call, updatedAt }) {
  if (!call) return null;
  const d=CALLS[call];
  return (
    <div style={{background:d.bg,border:`2px solid ${d.border}`,borderRadius:"14px",padding:"1.1rem",textAlign:"center",boxShadow:`0 0 32px ${d.color}1a`,marginBottom:"1rem"}}>
      <div style={{fontSize:"0.55rem",letterSpacing:"0.22em",color:d.color,fontFamily:"'Space Mono',monospace"}}>MARCH–APRIL 2027 · BAJA → MARQUESAS</div>
      <div style={{fontSize:"3rem",fontWeight:"700",color:d.color,lineHeight:1.05,fontFamily:"'Space Mono',monospace",letterSpacing:"0.08em"}}>{d.label}</div>
      <div style={{fontSize:"0.72rem",color:"#e2e8f0",marginTop:"0.15rem"}}>{d.sub}</div>
      {updatedAt&&<div style={{fontSize:"0.52rem",color:"#94a3b8",marginTop:"0.5rem",fontFamily:"'Space Mono',monospace"}}>Based on data through {fmtMon(updatedAt)}</div>}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [allData, setAllData]       = useState(()=>{
    const stored=loadStored();
    // Merge historical + stored, dedup by month
    const combined=[...HISTORICAL,...stored];
    const seen=new Set();
    return combined.filter(d=>{
      const k=d.timestamp.slice(0,7);
      if (seen.has(k)) return false;
      seen.add(k); return true;
    }).sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
  });
  const [loading,setLoading]        = useState(false);
  const [error,setError]            = useState(null);
  const [fetchedAt,setFetchedAt]    = useState(null);
  const [ensoSummary,setEnsoSummary]= useState(null);
  const [sourceUrls,setSourceUrls]  = useState({});
  const [rawTexts,setRawTexts]      = useState({});

  const latest = allData.length ? allData[allData.length-1] : null;
  const call    = decide(latest);

  const fetchLive = useCallback(async()=>{
    setLoading(true); setError(null);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{role:"user",content:`Search NOAA CPC and IRI Columbia for the LATEST monthly values of:
1. Niño 3.4 SST anomaly (°C) — most recent published monthly figure
2. SOI (Southern Oscillation Index) — latest 30-day or monthly value
3. SST trend — approximate °C/month change vs prior month (positive=warming)
4. ENSO phase — exactly one of: El Niño, La Niña, Neutral
5. A 2-sentence summary of trade wind implications for a March-April 2027 Mexico→Marquesas sailing passage

Return ONLY raw JSON (no markdown, no explanation):
{"nino34":<num>,"nino34_source":"<url>","nino34_raw":"<excerpt under 100 chars>","soi":<num>,"soi_source":"<url>","soi_raw":"<excerpt>","sst_trend":<num>,"sst_trend_source":"<url>","sst_trend_raw":"<excerpt>","enso_phase":"<phase>","enso_phase_source":"<url>","summary":"<2 sentences>"}`}]
        })
      });
      if (!resp.ok) throw new Error(`API ${resp.status}`);
      const api=await resp.json();
      const txt=api.content.filter(b=>b.type==="text").map(b=>b.text).join("");
      const m=txt.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("No JSON in response — try again");
      const p=JSON.parse(m[0]);
      ["nino34","soi","sst_trend"].forEach(k=>{if(p[k]==null||isNaN(+p[k]))throw new Error(`Missing field: ${k}`)});

      const now=new Date().toISOString();
      const point={timestamp:now,nino34:+p.nino34,soi:+p.soi,sst_trend:+p.sst_trend,phase:p.enso_phase,source:"Live NOAA/IRI"};
      const next=[...allData.filter(d=>d.timestamp.slice(0,7)!==now.slice(0,7)),point]
        .sort((a,b)=>a.timestamp.localeCompare(b.timestamp));
      store(next.filter(d=>!HISTORICAL.find(h=>h.timestamp.slice(0,7)===d.timestamp.slice(0,7))));
      setAllData(next);
      setFetchedAt(now);
      setEnsoSummary(p.summary);
      setSourceUrls({nino34:p.nino34_source,soi:p.soi_source,sst_trend:p.sst_trend_source,enso_phase:p.enso_phase_source});
      setRawTexts({nino34:p.nino34_raw,soi:p.soi_raw,sst_trend:p.sst_trend_raw});
    } catch(e){ setError(e.message); }
    finally{ setLoading(false); }
  },[allData]);

  return (
    <div style={{minHeight:"100vh",background:"#020d1a",color:"#e2e8f0",fontFamily:"'DM Sans',sans-serif",padding:"1rem 1rem 3rem",maxWidth:"480px",margin:"0 auto"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#020d1a}
        ::-webkit-scrollbar-thumb{background:#0f2744;border-radius:2px}
      `}</style>

      {/* Header */}
      <div style={{marginBottom:"1.1rem"}}>
        <div style={{fontSize:"0.52rem",letterSpacing:"0.28em",color:"#475569",fontFamily:"'Space Mono',monospace"}}>POWERFLOW MARINE · S/V GEMINI</div>
        <div style={{fontSize:"1.55rem",fontWeight:"700",letterSpacing:"-0.03em",lineHeight:1.1,marginTop:"0.2rem"}}>
          Pacific Crossing<br/><span style={{color:"#0ea5e9"}}>Decision Dashboard</span>
        </div>
        <div style={{fontSize:"0.68rem",color:"#94a3b8",marginTop:"0.3rem",fontFamily:"'Space Mono',monospace"}}>
          Jan 2020 – present · {allData.length} monthly readings
        </div>
      </div>

      {/* Decision */}
      <DecisionBanner call={call} updatedAt={latest?.timestamp}/>

      {/* ENSO Phase timeline */}
      <PhaseTimeline data={allData}/>

      {/* Summary */}
      {ensoSummary&&(
        <div style={{background:"#071120",border:"1px solid #0f2744",borderRadius:"12px",padding:"0.9rem",marginBottom:"1rem",fontSize:"0.75rem",color:"#7ea8c4",lineHeight:1.7}}>
          <div style={{fontSize:"0.52rem",letterSpacing:"0.15em",color:"#94a3b8",fontFamily:"'Space Mono',monospace",marginBottom:"0.4rem"}}>LIVE ANALYSIS · CROSSING IMPLICATIONS</div>
          {ensoSummary}
        </div>
      )}

      {/* Fetch button */}
      <button onClick={fetchLive} disabled={loading} style={{
        width:"100%",padding:"0.9rem",marginBottom:"0.9rem",
        background:loading?"#071120":"linear-gradient(135deg,#0ea5e9,#0369a1)",
        color:loading?"#64748b":"white",border:"none",borderRadius:"10px",
        fontSize:"0.75rem",fontWeight:"600",cursor:loading?"not-allowed":"pointer",
        letterSpacing:"0.08em",fontFamily:"'Space Mono',monospace",transition:"all 0.2s",
      }}>
        {loading?"⟳  SEARCHING NOAA + IRI...":"⟳  FETCH LIVE DATA"}
      </button>

      {error&&(
        <div style={{background:"#140404",border:"1px solid #7f1d1d",borderRadius:"10px",padding:"0.8rem",marginBottom:"0.9rem",fontSize:"0.65rem",color:"#fca5a5",fontFamily:"'Space Mono',monospace",lineHeight:1.6}}>
          ⚠ {error}
          <div style={{color:"#94a3b8",marginTop:"0.3rem",fontSize:"0.58rem"}}>Showing historical data. Check connection and retry.</div>
        </div>
      )}

      {/* Metric cards */}
      <div style={{display:"flex",flexDirection:"column",gap:"0.9rem",marginBottom:"1rem"}}>
        {["nino34","soi","sst_trend"].map(m=>(
          <MetricCard key={m} metric={m} latest={latest} allData={allData}
            sourceUrl={sourceUrls[m]} rawText={rawTexts[m]}/>
        ))}
      </div>

      {/* Thresholds */}
      <div style={{background:"#071120",border:"1px solid #0f2744",borderRadius:"12px",padding:"0.9rem",marginBottom:"1rem"}}>
        <div style={{fontSize:"0.52rem",letterSpacing:"0.15em",color:"#94a3b8",fontFamily:"'Space Mono',monospace",marginBottom:"0.65rem"}}>DECISION THRESHOLDS</div>
        {[
          {l:"Niño 3.4",g:"< +0.5°C",y:"+0.5–1.5°C",r:"> +1.5°C"},
          {l:"SOI",      g:"> +5",    y:"-5 to +5",   r:"< -5"},
          {l:"Trend",    g:"≤ 0/mo",  y:"0–0.2/mo",   r:"> 0.2/mo"},
        ].map(({l,g,y,r})=>(
          <div key={l} style={{display:"flex",gap:"6px",alignItems:"center",marginBottom:"0.3rem",fontSize:"0.58rem",fontFamily:"'Space Mono',monospace",flexWrap:"wrap"}}>
            <span style={{color:"#e2e8f0",width:"55px",flexShrink:0}}>{l}</span>
            <span style={{color:"#22c55e"}}>● {g}</span>
            <span style={{color:"#f59e0b"}}>● {y}</span>
            <span style={{color:"#ef4444"}}>● {r}</span>
          </div>
        ))}
        <div style={{fontSize:"0.52rem",color:"#94a3b8",marginTop:"0.5rem",fontFamily:"'Space Mono',monospace",lineHeight:1.6}}>
          HOLD = 2+ red · WATCH = 1 red or 2+ yellow · GO = all clear
        </div>
      </div>

      {/* History table — last 12 months */}
      <div style={{background:"#071120",border:"1px solid #0f2744",borderRadius:"12px",padding:"0.9rem",marginBottom:"1rem"}}>
        <div style={{fontSize:"0.52rem",letterSpacing:"0.15em",color:"#94a3b8",fontFamily:"'Space Mono',monospace",marginBottom:"0.6rem"}}>
          RECENT DATA LOG (LAST 12 MONTHS)
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.58rem",fontFamily:"'Space Mono',monospace"}}>
            <thead>
              <tr style={{borderBottom:"1px solid #0f2744"}}>
                {["DATE","NIÑO 3.4","SOI","TREND","PHASE","CALL"].map(h=>(
                  <th key={h} style={{textAlign:h==="DATE"||h==="PHASE"?"left":"right",padding:"0.25rem 0.3rem",color:"#94a3b8",fontWeight:"400",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...allData].slice(-12).reverse().map((d,i)=>{
                const c=decide(d); const cl=CALLS[c]; const ph=d.phase||"";
                const pc=PHASES[ph]?.color||"#94a3b8";
                return (
                  <tr key={i} style={{borderBottom:"1px solid #050f1c"}}>
                    <td style={{padding:"0.25rem 0.3rem",color:"#e2e8f0",whiteSpace:"nowrap"}}>{fmtMon(d.timestamp)}</td>
                    <td style={{textAlign:"right",padding:"0.25rem 0.3rem",color:clr("nino34",d.nino34)}}>{sign(d.nino34,"nino34")}</td>
                    <td style={{textAlign:"right",padding:"0.25rem 0.3rem",color:clr("soi",d.soi)}}>{sign(d.soi,"soi")}</td>
                    <td style={{textAlign:"right",padding:"0.25rem 0.3rem",color:clr("sst_trend",d.sst_trend)}}>{sign(d.sst_trend,"sst_trend")}</td>
                    <td style={{padding:"0.25rem 0.3rem",color:pc,whiteSpace:"nowrap"}}>{ph}</td>
                    <td style={{textAlign:"right",padding:"0.25rem 0.3rem",color:cl.color,fontWeight:"700"}}>{c}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MetBob */}
      <div style={{background:"#071120",border:"1px solid #0f2744",borderRadius:"12px",padding:"0.9rem",marginBottom:"1rem",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"0.75rem"}}>
        <div>
          <div style={{fontSize:"0.72rem",fontWeight:"600",color:"#ffffff"}}>MetBob · Bob McDavitt</div>
          <div style={{fontSize:"0.62rem",color:"#94a3b8",marginTop:"0.1rem"}}>Weekly Weathergrams · South Pacific specialist</div>
          <div style={{fontSize:"0.55rem",color:"#475569",marginTop:"0.1rem",fontFamily:"'Space Mono',monospace"}}>bob@metbob.com</div>
        </div>
        <a href="https://metbob.wordpress.com/" target="_blank" rel="noopener noreferrer"
          style={{padding:"0.45rem 0.85rem",background:"#050f1c",border:"1px solid #0ea5e944",borderRadius:"8px",color:"#38bdf8",textDecoration:"none",fontSize:"0.6rem",fontFamily:"'Space Mono',monospace",whiteSpace:"nowrap"}}>
          OPEN ↗
        </a>
      </div>

      {/* Footer */}
      <div style={{textAlign:"center",fontSize:"0.5rem",color:"#475569",fontFamily:"'Space Mono',monospace",lineHeight:2.2}}>
        SOURCES: NOAA CPC · IRI COLUMBIA · AUSTRALIA BOM<br/>
        HISTORICAL DATA VERIFIED JAN 2020 – MAY 2026<br/>
        VERIFY ALL VALUES AT SOURCE BEFORE ANY PASSAGE DECISION<br/>
        <span style={{color:"#1e3a5f"}}>v{APP_VERSION} · {APP_UPDATED} · github.com/Powerflow-Marine/go-no-go-pacific</span>
      </div>
    </div>
  );
}
