import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const COLORS = {
  bg: "#07090f",
  card: "rgba(14, 20, 35, 0.85)",
  border: "rgba(255,255,255,0.07)",
  borderHover: "rgba(255,255,255,0.15)",
  accent: "#38bdf8",
  accent2: "#818cf8",
  accent3: "#34d399",
  danger: "#ef4444",
  warning: "#f59e0b",
  success: "#10b981",
  textPrimary: "#f1f5f9",
  textSecondary: "#94a3b8",
  textMuted: "#475569",
};

function useLiveDashboardSocket() {
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState({
    matchScore: { batting: "IND", runs: 287, wickets: 4, overs: 42.3, target: null, bowling: "AUS" },
    players: [
      { name: "V. Kohli", role: "bat", runs: 89, balls: 97, sr: 91.7, fours: 9, sixes: 2 },
      { name: "S. Iyer", role: "bat", runs: 34, balls: 28, sr: 121.4, fours: 4, sixes: 1 },
      { name: "P. Cummins", role: "bowl", overs: 9, maidens: 1, runs: 48, wickets: 2, econ: 5.3 },
    ],
    events: [
      { id: 1, type: "SIX", player: "R. Jadeja", detail: "Massive hit over long-on!", time: "42.2" },
      { id: 2, type: "FOUR", player: "V. Kohli", detail: "Driven through covers", time: "41.5" },
      { id: 3, type: "WICKET", player: "S. Iyer", detail: "Caught at mid-wicket", time: "40.1" },
      { id: 4, type: "FOUR", player: "V. Kohli", detail: "Cut shot to the boundary", time: "39.4" },
    ],
    alerts: [],
    crowds: { "stand:North": 8200, "stand:South": 9100, "stand:Pavilion": 4300, "stand:VIP East": 1800 },
    queues: { "stall:12": 420000, "stall:15": 120000, "restroom:3": 660000 },
    weather: { temp: 28, humidity: 62, wind: 14, condition: "Partly Cloudy" },
    runRate: [4.2, 5.1, 6.3, 5.8, 6.9, 7.2, 6.5, 7.8],
    recentBalls: ["1", "W", "4", "0", "2", "6"],
    currentRR: 6.72,
    projectedScore: 334,
  });

  useEffect(() => {
    // Connect to the notification-service WebSocket Gateway
    const socket = io("http://localhost:5000", {
        reconnectionDelayMax: 10000,
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("match_events", (payload) => {
      // payload format e.g. { id: 5, type: "FOUR", player: "V. Kohli", detail: "On-drive to fine leg", time: "43.1" }
      try {
        const ev = typeof payload === "string" ? JSON.parse(payload) : payload;
        setData(d => {
            const newRuns = d.matchScore.runs + (ev.type === "SIX" ? 6 : ev.type === "FOUR" || ev.type === "BOUNDARY" ? 4 : ev.type === "WICKET" ? 0 : 1);
            const newOvers = parseFloat((d.matchScore.overs + 0.1).toFixed(1));
            const newWickets = ev.type === "WICKET" ? d.matchScore.wickets + 1 : d.matchScore.wickets;
            return {
                ...d,
                matchScore: { ...d.matchScore, runs: newRuns, overs: newOvers, wickets: newWickets },
                events: [ev, ...d.events].slice(0, 12),
                recentBalls: [...d.recentBalls.slice(-5), ev.type === "SIX" ? "6" : ev.type === "WICKET" ? "W" : ev.type === "FOUR" || ev.type === "BOUNDARY" ? "4" : "1"],
                currentRR: parseFloat((newRuns / newOvers).toFixed(2)),
                projectedScore: Math.round((newRuns / newOvers) * 50),
            };
        });
      } catch (err) {}
    });

    socket.on("crowd_updates", (payload) => {
      try {
        const ev = typeof payload === "string" ? JSON.parse(payload) : payload;
        setData(d => ({
            ...d,
            crowds: {
                ...d.crowds,
                [ev.locationId]: ev.density
            }
        }));
      } catch (err) {}
    });

    socket.on("queue_updates", (payload) => {
        try {
          const ev = typeof payload === "string" ? JSON.parse(payload) : payload;
          setData(d => ({
              ...d,
              queues: {
                  ...d.queues,
                  [ev.serviceId]: ev.estimatedWaitMs
              }
          }));
        } catch (err) {}
    });

    socket.on("alerts", (payload) => {
        try {
            const ev = typeof payload === "string" ? JSON.parse(payload) : payload;
            setData(d => ({
                ...d,
                alerts: [ev, ...d.alerts].slice(0, 10)
            }));
        } catch (err) {}
    });

    return () => socket.disconnect();
  }, []);

  return { connected, data };
}

const STANDS = [
  { id: "North", key: "stand:North", cap: 15000, color: "#38bdf8" },
  { id: "South", key: "stand:South", cap: 12000, color: "#818cf8" },
  { id: "Pavilion", key: "stand:Pavilion", cap: 5000, color: "#34d399" },
  { id: "VIP East", key: "stand:VIP East", cap: 3000, color: "#f59e0b" },
];

const QUEUES = [
  { id: "stall:12", label: "Snacks Stall B", icon: "🍿", color: "#38bdf8" },
  { id: "stall:15", label: "Merch Store", icon: "👕", color: "#818cf8" },
  { id: "restroom:3", label: "Washrooms Gate 3", icon: "🚻", color: "#34d399" },
];

const EVENT_STYLE = {
  SIX: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "6" },
  FOUR: { color: "#38bdf8", bg: "rgba(56,189,248,0.12)", label: "4" },
  BOUNDARY: { color: "#38bdf8", bg: "rgba(56,189,248,0.12)", label: "4" },
  WICKET: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "W" },
  REVIEW: { color: "#818cf8", bg: "rgba(129,140,248,0.12)", label: "?" },
  DEFAULT: { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", label: "•" },
};

function AnimNumber({ value, style }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (value === prev.current) return;
    const start = prev.current;
    const end = value;
    const dur = 400;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (p < 1) requestAnimationFrame(step);
      else prev.current = end;
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span style={style}>{display}</span>;
}

function PulsingDot({ color = "#ef4444", size = 8 }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%", background: color,
        animation: "pulse-ring 1.5s cubic-bezier(0,0,.6,1) infinite",
      }} />
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color }} />
    </span>
  );
}

function Card({ children, style, glow }) {
  return (
    <div style={{
      background: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 16,
      padding: "20px 22px",
      backdropFilter: "blur(20px)",
      position: "relative",
      overflow: "hidden",
      ...(glow && { boxShadow: `0 0 40px ${glow}22` }),
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 14 }}>
      {children}
    </div>
  );
}

function ScoreCard({ data }) {
  const { matchScore, currentRR, projectedScore, recentBalls } = data;
  return (
    <Card glow="#38bdf8" style={{ background: "linear-gradient(135deg, rgba(14,20,35,0.95) 0%, rgba(20,30,55,0.95) 100%)" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <SectionLabel>Live Score · T20 International</SectionLabel>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 48, fontWeight: 800, color: COLORS.textPrimary, fontFamily: "monospace", letterSpacing: -2 }}>
              <AnimNumber value={matchScore.runs} />
              <span style={{ color: COLORS.textSecondary, fontSize: 32 }}>/{matchScore.wickets}</span>
            </span>
          </div>
          <div style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 2 }}>
            {matchScore.batting} <span style={{ color: COLORS.textMuted }}>vs</span> {matchScore.bowling} · Overs {matchScore.overs}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginBottom: 4 }}>
            <PulsingDot color="#ef4444" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#ef4444", letterSpacing: "0.1em" }}>LIVE</span>
          </div>
          <div style={{ fontSize: 13, color: COLORS.textSecondary }}>RR: <span style={{ color: COLORS.accent, fontWeight: 700 }}>{currentRR}</span></div>
          <div style={{ fontSize: 13, color: COLORS.textSecondary }}>Proj: <span style={{ color: COLORS.accent3, fontWeight: 700 }}>{projectedScore}</span></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {recentBalls.map((b, i) => {
          const c = b === "W" ? "#ef4444" : b === "6" ? "#f59e0b" : b === "4" ? "#38bdf8" : b === "0" ? "#475569" : COLORS.textSecondary;
          return (
            <div key={i} style={{
              width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${c}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: c, background: `${c}12`,
              animation: i === recentBalls.length - 1 ? "pop-in 0.3s cubic-bezier(.34,1.56,.64,1)" : "none",
            }}>{b}</div>
          );
        })}
        <div style={{ fontSize: 11, color: COLORS.textMuted, display: "flex", alignItems: "center", marginLeft: 4 }}>last 6 balls</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {data.players.map(p => (
          <div key={p.name} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 3 }}>{p.role === "bat" ? "🏏 Batting" : "⚡ Bowling"}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 2 }}>{p.name}</div>
            {p.role === "bat"
              ? <div style={{ fontSize: 12, color: COLORS.textSecondary }}><span style={{ color: COLORS.accent }}>{p.runs}*</span> ({p.balls}) SR: {p.sr}</div>
              : <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{p.overs}ov · <span style={{ color: COLORS.danger }}>{p.wickets}W</span> · Eco: {p.econ}</div>
            }
          </div>
        ))}
      </div>
    </Card>
  );
}

function RunRateChart({ data }) {
  const canvasRef = useRef(null);
  const { runRate } = data;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const pad = { t: 10, r: 10, b: 24, l: 32 };
    const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
    ctx.clearRect(0, 0, W, H);

    const max = Math.max(...runRate) + 1;
    const min = Math.max(0, Math.min(...runRate) - 1);

    const xScale = i => pad.l + (i / (runRate.length - 1)) * cw;
    const yScale = v => pad.t + (1 - (v - min) / (max - min)) * ch;

    const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
    grad.addColorStop(0, "rgba(56,189,248,0.35)");
    grad.addColorStop(1, "rgba(56,189,248,0.0)");

    ctx.beginPath();
    ctx.moveTo(xScale(0), yScale(runRate[0]));
    for (let i = 1; i < runRate.length; i++) {
      const cp1x = xScale(i - 0.5), cp1y = yScale(runRate[i - 1]);
      const cp2x = xScale(i - 0.5), cp2y = yScale(runRate[i]);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, xScale(i), yScale(runRate[i]));
    }
    ctx.lineTo(xScale(runRate.length - 1), H - pad.b);
    ctx.lineTo(xScale(0), H - pad.b);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(xScale(0), yScale(runRate[0]));
    for (let i = 1; i < runRate.length; i++) {
      const cp1x = xScale(i - 0.5), cp1y = yScale(runRate[i - 1]);
      const cp2x = xScale(i - 0.5), cp2y = yScale(runRate[i]);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, xScale(i), yScale(runRate[i]));
    }
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    [4, 6, 8].forEach(v => {
      ctx.beginPath();
      ctx.moveTo(pad.l, yScale(v));
      ctx.lineTo(W - pad.r, yScale(v));
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#475569";
      ctx.font = "10px monospace";
      ctx.fillText(v, 2, yScale(v) + 4);
    });

    runRate.forEach((v, i) => {
      ctx.beginPath();
      ctx.arc(xScale(i), yScale(v), 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.fill();
    });
  }, [runRate]);

  return (
    <Card>
      <SectionLabel>Run Rate Trend (per over)</SectionLabel>
      <canvas ref={canvasRef} width={560} height={130} style={{ width: "100%", height: 130 }} />
    </Card>
  );
}

function HeatmapCard({ crowds }) {
  const total = STANDS.reduce((s, st) => s + (crowds[st.key] || 0), 0);
  const totalCap = STANDS.reduce((s, st) => s + st.cap, 0);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <SectionLabel>Stadium Density Heatmap</SectionLabel>
        <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
          Total: <span style={{ color: COLORS.accent }}>{total.toLocaleString()}</span> / {totalCap.toLocaleString()}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {STANDS.map(stand => {
          const fans = crowds[stand.key] || 0;
          const pct = Math.min(100, Math.round((fans / stand.cap) * 100));
          const barColor = pct > 85 ? COLORS.danger : pct > 60 ? COLORS.warning : stand.color;
          return (
            <div key={stand.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px", borderTop: `3px solid ${barColor}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{stand.id} Stand</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: barColor, fontFamily: "monospace" }}>{pct}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 6 }}>
                <div style={{
                  height: "100%", borderRadius: 4, background: barColor,
                  width: `${pct}%`, transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
                }} />
              </div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>{fans.toLocaleString()} / {stand.cap.toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function WeatherCard({ weather }) {
  const iconMap = { "Partly Cloudy": "⛅", "Clear": "☀️", "Overcast": "☁️", "Rain": "🌧️" };
  return (
    <Card>
      <SectionLabel>Stadium Conditions</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 38 }}>{iconMap[weather.condition] || "🌤️"}</div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.textPrimary }}>{weather.temp}°C</div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary }}>{weather.condition}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "Humidity", value: `${weather.humidity}%`, color: COLORS.accent },
          { label: "Wind", value: `${weather.wind} km/h`, color: COLORS.accent2 },
          { label: "Pitch", value: "Good", color: COLORS.accent3 },
        ].map(w => (
          <div key={w.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: w.color }}>{w.value}</div>
            <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>{w.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WaitTimesCard({ queues }) {
  return (
    <Card>
      <SectionLabel>Live Queue Wait Times</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {QUEUES.map(q => {
          const ms = queues[q.id];
          const mins = ms !== undefined ? Math.round(ms / 60000) : 0;
          const urgency = mins > 10 ? COLORS.danger : mins > 5 ? COLORS.warning : COLORS.success;
          return (
            <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${urgency}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{q.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{q.label}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>Estimated avg wait</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: urgency, fontFamily: "monospace" }}>{mins}<span style={{ fontSize: 12, fontWeight: 400, color: COLORS.textMuted }}> min</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function EventFeedCard({ events, alerts }) {
  const [tab, setTab] = useState("events");
  return (
    <Card style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 4 }}>
        {["events", "alerts"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "7px 0", borderRadius: 7, border: "none", cursor: "pointer",
            background: tab === t ? "rgba(56,189,248,0.15)" : "transparent",
            color: tab === t ? COLORS.accent : COLORS.textMuted,
            fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
            transition: "all 0.2s",
          }}>
            {t === "events" ? "⚡ Match Events" : `🚨 Alerts ${alerts.length > 0 ? `(${alerts.length})` : ""}`}
          </button>
        ))}
      </div>

      {tab === "events" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", maxHeight: 360 }}>
          {events.length === 0 && (
            <div style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "center", padding: 24 }}>Waiting for match events...</div>
          )}
          {events.map((ev, i) => {
            const s = EVENT_STYLE[ev.type] || EVENT_STYLE.DEFAULT;
            return (
              <div key={ev.id || i} style={{
                display: "flex", gap: 12, alignItems: "flex-start",
                background: s.bg, borderRadius: 10, padding: "10px 12px",
                animation: i === 0 ? "slide-in 0.3s ease" : "none",
                borderLeft: `2px solid ${s.color}`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, background: `${s.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: s.color, flexShrink: 0,
                }}>{s.label}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{ev.type}</span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>Ov {ev.time}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginTop: 1 }}>{ev.player}</div>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 1 }}>{ev.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "alerts" && (
        <div>
          {alerts.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 32, gap: 10 }}>
              <div style={{ fontSize: 32 }}>✅</div>
              <div style={{ color: COLORS.success, fontWeight: 600, fontSize: 14 }}>All Clear</div>
              <div style={{ color: COLORS.textMuted, fontSize: 12 }}>No safety alerts at this time</div>
            </div>
          )}
          {alerts.map((a, i) => (
            <div key={i} style={{ padding: "12px 14px", background: "rgba(239,68,68,0.08)", borderRadius: 10, borderLeft: "3px solid #ef4444", marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.danger, marginBottom: 4 }}>⚠ ALERT</div>
              <div style={{ fontSize: 13, color: COLORS.textPrimary }}>{typeof a === "string" ? JSON.parse(a).message : a.message}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function TopNav({ connected }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(7,9,15,0.85)", backdropFilter: "blur(16px)",
      borderBottom: `1px solid ${COLORS.border}`,
      padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 1 }}>
          {["▌", "█", "▌"].map((c, i) => (
            <span key={i} style={{ color: i === 1 ? COLORS.accent : COLORS.accent2, fontSize: 16, fontWeight: 900, letterSpacing: -3 }}>{c}</span>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary, letterSpacing: -0.5 }}>ArenaPulse</div>
          <div style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.08em" }}>SMART STADIUM EXPERIENCE</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "monospace" }}>
          {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PulsingDot color={connected ? COLORS.success : COLORS.warning} size={7} />
          <span style={{ fontSize: 11, fontWeight: 600, color: connected ? COLORS.success : COLORS.warning, letterSpacing: "0.08em" }}>
            {connected ? "LIVE SYNC" : "CONNECTING"}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>
        <span>{label}</span><span style={{ color, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.8s" }} />
      </div>
    </div>
  );
}

export default function App() {
  const { connected, data } = useLiveDashboardSocket();
  const { crowds, queues, events, alerts, weather, runRate, matchScore } = data;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: ${COLORS.bg}; color: ${COLORS.textPrimary}; min-height: 100vh; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.4); opacity: 0; } }
        @keyframes pop-in { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slide-in { 0% { transform: translateX(-12px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes fade-up { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      `}</style>

      <TopNav connected={connected} />

      <div style={{ padding: "24px", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
          <ScoreCard data={data} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <WeatherCard weather={weather} />
            <Card>
              <SectionLabel>Quick Stats</SectionLabel>
              <StatBar label="Partnership" value={123} max={200} color={COLORS.accent} />
              <StatBar label="Boundaries (4s)" value={22} max={40} color={COLORS.accent2} />
              <StatBar label="Sixes" value={6} max={20} color={COLORS.warning} />
              <StatBar label="Dot Balls %" value={31} max={100} color={COLORS.textMuted} />
            </Card>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <RunRateChart data={data} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
          <HeatmapCard crowds={crowds} />
          <WaitTimesCard queues={queues} />
          <EventFeedCard events={events} alerts={alerts} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
          {[
            { label: "Total Attendance", value: Object.values(crowds).reduce((a, b) => a + b, 0).toLocaleString(), unit: "fans", color: COLORS.accent },
            { label: "Avg Queue Wait", value: "7", unit: "minutes", color: COLORS.warning },
            { label: "Match Overs Left", value: String(Math.round(50 - matchScore.overs)), unit: "overs", color: COLORS.accent3 },
            { label: "Wickets Fallen", value: String(matchScore.wickets), unit: `/ 10`, color: COLORS.danger },
          ].map(s => (
            <Card key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.1em", marginBottom: 8 }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.value}<span style={{ fontSize: 14, fontWeight: 400, color: COLORS.textMuted, marginLeft: 4 }}>{s.unit}</span></div>
            </Card>
          ))}
        </div>

        <div style={{ textAlign: "center", padding: "16px 0 8px", fontSize: 11, color: COLORS.textMuted }}>
          ArenaPulse · Powered by live stadium telemetry · Data updates dynamically
        </div>
      </div>
    </>
  );
}
