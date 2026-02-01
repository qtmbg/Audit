import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  CircleDashed,
  Zap,
  ShieldAlert,
  Layers,
  Cpu,
  Activity,
  Target,
  Clock,
  Send,
  Printer,
  RotateCcw,
  Link as LinkIcon,
} from "lucide-react";

/**
 * QTMBG — STRUCTURAL AUDIT (CRA / Vercel-safe JS)
 * Goal: deep free diagnostic + push to book a call.
 * - 5 Forces
 * - 20 questions (4 per force)
 * - symptom selection -> contextualizes diagnosis
 * - results: bottleneck + structural leak narrative + fix plan (today + 7 days) + booking ladder
 * - export: email required only for export/save
 */

const STORAGE_KEY = "qtmbg-structural-audit-v1";

/* ---------- 5 FORCES ---------- */
const FORCES = [
  { id: "essence", label: "ESSENCE", icon: Zap, micro: "Mechanism, truth, positioning spine" },
  { id: "identity", label: "IDENTITY", icon: ShieldAlert, micro: "Status, credibility, perception" },
  { id: "offer", label: "OFFER", icon: Layers, micro: "Packaging, pricing, decision speed" },
  { id: "system", label: "SYSTEM", icon: Cpu, micro: "Path, conversion, pipeline control" },
  { id: "growth", label: "GROWTH", icon: Activity, micro: "North star, rhythm, scale" },
];

/* ---------- SYMPTOMS (entry) ---------- */
const SYMPTOMS = [
  {
    id: "low-conversion",
    label: "Traffic but low conversion",
    sub: "People visit, but don’t buy / apply / book.",
    bias: { essence: 1, identity: 1, offer: 2, system: 3, growth: 0 },
  },
  {
    id: "price-resistance",
    label: "Price resistance / negotiation",
    sub: "Prospects like you but hesitate, negotiate, or ghost.",
    bias: { essence: 1, identity: 2, offer: 3, system: 1, growth: 0 },
  },
  {
    id: "unclear-positioning",
    label: "Unclear positioning",
    sub: "You struggle to explain what’s different in one line.",
    bias: { essence: 3, identity: 1, offer: 1, system: 0, growth: 0 },
  },
  {
    id: "feast-famine",
    label: "Feast / famine leads",
    sub: "Revenue depends on hustle and luck.",
    bias: { essence: 0, identity: 0, offer: 1, system: 3, growth: 1 },
  },
  {
    id: "busy-no-scale",
    label: "Busy but not scaling",
    sub: "More work doesn’t equal more profit.",
    bias: { essence: 0, identity: 1, offer: 1, system: 2, growth: 2 },
  },
];

/* ---------- DEEP QUESTION BANK (4 per force = 20) ----------
   Choice values: 1 / 3 / 5
*/
const Q = [
  // ESSENCE (4)
  {
    id: "e1",
    force: "essence",
    text: "Can a stranger explain your mechanism after 15 seconds on your site?",
    a: "No — it reads like generic services.",
    b: "Somewhat — but it’s not named or repeatable.",
    c: "Yes — it’s specific, named, and obvious.",
  },
  {
    id: "e2",
    force: "essence",
    text: "Do you repel the wrong buyer with a clear stance (not everyone, not everything)?",
    a: "No — I try to sound broadly appealing.",
    b: "Sometimes — but it’s inconsistent.",
    c: "Yes — a clear “this is for X, not Y.”",
  },
  {
    id: "e3",
    force: "essence",
    text: "Is your claim defensible with proof or reasoning (not vibes)?",
    a: "No — it’s aspirational and soft.",
    b: "Some — but not tight enough to convince skeptics.",
    c: "Yes — claim + proof logic + examples.",
  },
  {
    id: "e4",
    force: "essence",
    text: "Do your best clients buy because of the same core reason (pattern), or random reasons?",
    a: "Random — every deal feels different.",
    b: "Some pattern, but I haven’t productized it.",
    c: "Clear pattern — it’s the spine of my positioning.",
  },

  // IDENTITY (4)
  {
    id: "i1",
    force: "identity",
    text: "Do you look and sound like the price you want to charge?",
    a: "No — it feels inconsistent or “template.”",
    b: "Clean, but not premium / not memorable.",
    c: "Yes — instantly high-status and distinct.",
  },
  {
    id: "i2",
    force: "identity",
    text: "Do you have a proof stack (results, artifacts, authority) that reduces doubt fast?",
    a: "No — mostly claims, few receipts.",
    b: "Some proof, but scattered or weak.",
    c: "Yes — tight proof stack placed strategically.",
  },
  {
    id: "i3",
    force: "identity",
    text: "Is your messaging consistent across homepage, social, deck, and calls?",
    a: "No — it changes depending on context.",
    b: "Mostly, but it drifts under pressure.",
    c: "Yes — one spine everywhere.",
  },
  {
    id: "i4",
    force: "identity",
    text: "Do prospects trust you before the call (pre-sold), or do you need to convince live?",
    a: "I need to convince live.",
    b: "Mixed — depends on the lead source.",
    c: "Pre-sold — the call is mostly confirmation.",
  },

  // OFFER (4)
  {
    id: "o1",
    force: "offer",
    text: "Is there one obvious flagship offer that a buyer can choose without a custom proposal?",
    a: "No — it’s custom / confusing / too many options.",
    b: "Somewhat — but people still hesitate.",
    c: "Yes — one flagship with clean scope + price.",
  },
  {
    id: "o2",
    force: "offer",
    text: "Is your offer priced as transformation (outcome), not time (hours / tasks)?",
    a: "No — price logic is time-based.",
    b: "Mixed — partly time-based, partly outcome.",
    c: "Yes — outcome-based pricing is explicit.",
  },
  {
    id: "o3",
    force: "offer",
    text: "Do buyers understand the steps (delivery) and why it works (mechanism)?",
    a: "No — it’s vague.",
    b: "Some — but not crisp enough to remove doubt.",
    c: "Yes — clear steps + logic.",
  },
  {
    id: "o4",
    force: "offer",
    text: "Does your offer create decision speed (days), or decision drag (weeks)?",
    a: "Decision drag — lots of “let me think.”",
    b: "Mixed — depends on lead quality.",
    c: "Decision speed — clear next step.",
  },

  // SYSTEM (4)
  {
    id: "s1",
    force: "system",
    text: "Is your path from attention → cash mapped as a simple sequence (not improv)?",
    a: "No — it’s messy and improvised.",
    b: "Some map exists, but not enforced.",
    c: "Yes — one clear path and it’s enforced.",
  },
  {
    id: "s2",
    force: "system",
    text: "Do you have one primary capture point + automated follow-up (nurture) that runs without you?",
    a: "No — everything is manual.",
    b: "Some automation, but inconsistent.",
    c: "Yes — capture + nurture runs weekly.",
  },
  {
    id: "s3",
    force: "system",
    text: "Do you filter prospects before calls (to protect time + positioning)?",
    a: "No — I take most calls.",
    b: "Some filters, but easy to bypass.",
    c: "Yes — filters are real and strict.",
  },
  {
    id: "s4",
    force: "system",
    text: "Do you know where the leak is (drop-off point) with actual numbers?",
    a: "No — I’m guessing.",
    b: "Some numbers, but incomplete.",
    c: "Yes — clear funnel metrics + leak point.",
  },

  // GROWTH (4)
  {
    id: "g1",
    force: "growth",
    text: "Do you have a single north star metric you review weekly (same day)?",
    a: "No — I react to urgency.",
    b: "Sometimes — but not disciplined.",
    c: "Yes — same day, same metric.",
  },
  {
    id: "g2",
    force: "growth",
    text: "Is your strategy one focused lane (channel + message), or many scattered tactics?",
    a: "Scattered — too many tactics.",
    b: "Some focus but I keep switching.",
    c: "Focused lane for 30–60 days.",
  },
  {
    id: "g3",
    force: "growth",
    text: "Can growth happen without you being the bottleneck (handoff, artifacts, systems)?",
    a: "No — it depends on me.",
    b: "Partly — some handoff is possible.",
    c: "Yes — artifacts + systems carry it.",
  },
  {
    id: "g4",
    force: "growth",
    text: "Do you have a referral trigger that reliably produces warm intros?",
    a: "No — referrals are random.",
    b: "Sometimes — when I remember to ask.",
    c: "Yes — built into the process.",
  },
];

/* ---------- STRUCTURAL LEAK NARRATIVES ---------- */
const LEAKS = {
  essence: {
    name: "MECHANISM BLUR",
    core: "Your brand may be good, but your mechanism isn’t named, repeatable, and obvious. That forces prospects to ‘figure you out’—which slows trust and crushes decision speed.",
    whyItHurts:
      "When the mechanism is blurry, everything downstream weakens: identity looks generic, offers feel risky, and pricing becomes negotiable. Buyers don’t pay premium for what they can’t clearly explain.",
    evidence: [
      "Prospects ask: “So what exactly do you do?”",
      "Your pitch changes depending on who’s in front of you.",
      "You keep editing the homepage because it still doesn’t ‘click’.",
    ],
    todayMove:
      "Write ONE sentence: “I help [WHO] get [OUTCOME] using [NAMED MECHANISM] in [TIME].” Put it on your hero + bio today.",
    weekPlan: [
      "Name the mechanism (2–4 words). If you can’t name it, you can’t own it.",
      "Create one ‘repulsion line’: who this is NOT for.",
      "Build a proof stack page: 3 receipts that defend the claim.",
      "Publish one contrarian belief that supports the mechanism.",
    ],
    assets: ["Mechanism One-Liner", "Repulsion Line", "Proof Stack Block", "Contrarian Post"],
  },
  identity: {
    name: "STATUS GAP",
    core: "Your results may be real, but your perception doesn’t match the price. That creates silent doubt, negotiation, and ‘let me think’ behavior.",
    whyItHurts:
      "Premium is mostly pre-call. If you need to convince live, your close rate depends on performance instead of system. That’s exhausting and not scalable.",
    evidence: [
      "You hesitate to send your website to certain prospects.",
      "You get compliments but not premium decisions.",
      "Prospects compare you to cheaper options.",
    ],
    todayMove:
      "Replace soft language with proof logic: outcome, constraints, numbers, and a claim you can defend.",
    weekPlan: [
      "Upgrade top 3 assets: homepage hero, offer page, one case study.",
      "Install a ‘credibility spine’ section: receipts + authority + methodology.",
      "Align tone across touchpoints: one spine, same claims, same visuals.",
      "Publish one authority teardown (you diagnosing a brand).",
    ],
    assets: ["Credibility Spine", "Case Study Rewrite", "Authority Teardown", "Signature Visual Element"],
  },
  offer: {
    name: "DECISION FRICTION",
    core: "People like you—but the offer doesn’t make choosing easy. Either too many options, unclear scope, weak mechanism, or time-based pricing creates hesitation.",
    whyItHurts:
      "When the offer is not a clean decision, you fall into proposals, negotiation, and time-waste. You end up working harder for the same revenue.",
    evidence: [
      "‘Let me think’ becomes the default response.",
      "You build custom proposals too often.",
      "Pricing talks feel tense or confusing.",
    ],
    todayMove:
      "Choose ONE flagship path and write: who it’s for, what they get, how it works, and the price.",
    weekPlan: [
      "Collapse offers → 1 flagship + 1 entry step (or ascension step).",
      "Rewrite the offer page: steps + mechanism + proof + clear CTA.",
      "Clarify pricing logic: transformation > time.",
      "Create one objection-killer asset: ‘Why this costs what it costs.’",
    ],
    assets: ["Flagship Offer Page", "Pricing Logic Block", "Objection-Killer Asset", "Offer Ladder"],
  },
  system: {
    name: "PIPELINE LEAK",
    core: "You may have demand, but you don’t have control. Without a disciplined path from attention to cash, you’re stuck in feast/famine and manual chasing.",
    whyItHurts:
      "A weak system turns good branding into wasted attention. You cannot scale what you can’t measure, and you can’t measure what isn’t mapped.",
    evidence: [
      "You’re busy but revenue is unpredictable.",
      "Follow-up is inconsistent.",
      "You can’t point to one leak with numbers.",
    ],
    todayMove:
      "Write your path in 6 steps: Viewer → Lead → Filter → Call → Close → Referral. Then enforce it.",
    weekPlan: [
      "Install one capture point + one nurture email sequence (5 emails).",
      "Add one filter question that repels bad fits.",
      "Track 3 numbers weekly: visits, leads, booked calls.",
      "Fix one leak: either capture, booking, or close rate—pick one.",
    ],
    assets: ["Simple Funnel Map", "Nurture Sequence", "Booking Filter", "Weekly Metrics Ritual"],
  },
  growth: {
    name: "NO NORTH STAR",
    core: "You’re moving, but without a single metric and rhythm, growth becomes emotional. You switch tactics and never compound.",
    whyItHurts:
      "Scaling is mostly compounding small wins. Without rhythm, you reset every week and confuse both the market and your own team.",
    evidence: [
      "Direction changes weekly.",
      "Too many tactics, no compounding.",
      "Scaling feels chaotic and exhausting.",
    ],
    todayMove:
      "Pick ONE metric for 30 days (qualified leads/week or close rate). Review it every week on the same day.",
    weekPlan: [
      "Choose one channel to dominate for 30 days.",
      "Define a weekly cadence: publish, nurture, sell.",
      "Add a referral trigger at the moment of first win.",
      "Build one handoff artifact that reduces your involvement.",
    ],
    assets: ["North Star Metric", "30-Day Lane", "Referral Trigger", "Handoff Artifact"],
  },
};

/* ---------- helpers ---------- */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function pctFromChoice(v) {
  if (v === 1) return 20;
  if (v === 3) return 60;
  return 100;
}
function bandLabel(pct) {
  if (pct >= 80) return "STRONG";
  if (pct >= 55) return "UNSTABLE";
  return "CRITICAL";
}
function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function loadStateSafe() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return safeParse(raw);
  } catch {
    return null;
  }
}
function saveStateSafe(s) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}
function sortForcesByWeakest(scores) {
  const pairs = Object.keys(scores).map((k) => [k, scores[k]]);
  pairs.sort((a, b) => a[1] - b[1]);
  return pairs;
}
function getQueryParams() {
  try {
    const p = new URLSearchParams(window.location.search);
    const out = {};
    for (const [k, v] of p.entries()) out[k] = v;
    return out;
  } catch {
    return {};
  }
}
function applySymptomBias(rawScores, symptomId) {
  const s = SYMPTOMS.find((x) => x.id === symptomId);
  if (!s) return rawScores;
  const biased = { ...rawScores };
  Object.keys(s.bias).forEach((f) => {
    const shift = s.bias[f] * 2; // max 6 points shift
    biased[f] = clamp(biased[f] - shift, 0, 100);
  });
  return biased;
}

/* ---------- UI atoms ---------- */
function AppShell({ children }) {
  return (
    <div className="qbg">
      <style>{CSS}</style>
      <div className="wrap">
        <div className="main">{children}</div>
        <div className="footer">
          <span className="footerTag">QTMBG</span>
          <span className="muted">
            Structural Audit is a diagnostic. Use it to convert insight into execution.
          </span>
        </div>
      </div>
    </div>
  );
}

function TopBar({ title = "Structural Audit", rightText }) {
  return (
    <div className="topbar">
      <div className="brandRow">
        <span className="brandBadge">QUANTUM BRANDING</span>
        <span className="brandTitle">{title}</span>
      </div>
      <div className="topmeta">{rightText}</div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

function Btn({ children, onClick, variant = "primary", disabled = false, icon }) {
  return (
    <button
      type="button"
      className={`btn ${variant} ${disabled ? "disabled" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {children}
      <ArrowRight size={16} />
    </button>
  );
}

function ProgressBar({ current, total }) {
  const pct = clamp((current / total) * 100, 0, 100);
  return (
    <div className="progress">
      <div className="progressIn" style={{ width: `${pct}%` }} />
    </div>
  );
}

function useDecayTimer(createdAtISO) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const created = new Date(createdAtISO).getTime();
  const expires = created + 48 * 60 * 60 * 1000;
  const remaining = Math.max(0, expires - now);
  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  const secs = Math.floor((remaining % (60 * 60 * 1000)) / 1000);
  return { hours, mins, secs, expired: remaining === 0 };
}

function DecayTimer({ createdAtISO }) {
  const { hours, mins, secs, expired } = useDecayTimer(createdAtISO);
  if (expired) {
    return (
      <div className="timer expired">
        <Clock size={14} />
        <span>Analysis expired — rerun audit for fresh output</span>
      </div>
    );
  }
  return (
    <div className="timer">
      <Clock size={14} />
      <span>
        Insights expire in{" "}
        <strong>
          {String(hours).padStart(2, "0")}:{String(mins).padStart(2, "0")}:
          {String(secs).padStart(2, "0")}
        </strong>
      </span>
    </div>
  );
}

/* ---------- main app ---------- */
export default function App() {
  const qp = useMemo(() => getQueryParams(), []);

  const [state, setState] = useState({
    view: "start", // start -> symptom -> audit -> checkpoint -> results -> export
    createdAtISO: new Date().toISOString(),
    name: "",
    email: "",
    website: "",
    symptom: "",
    idx: 0,
    answers: {}, // questionId -> 1/3/5
    fromSignal: qp.from === "signal",
    seedStage: qp.stage || "",
    seedPrimary: qp.primary || "",
    seedSecondary: qp.secondary || "",
  });

  useEffect(() => {
    const loaded = loadStateSafe();
    if (loaded && loaded.view) setState(loaded);
  }, []);

  useEffect(() => saveStateSafe(state), [state]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.view, state.idx]);

  const total = Q.length;

  const rawScores = useMemo(() => {
    const sums = { essence: 0, identity: 0, offer: 0, system: 0, growth: 0 };
    const counts = { essence: 0, identity: 0, offer: 0, system: 0, growth: 0 };

    Q.forEach((qq) => {
      const v = state.answers[qq.id];
      if (!v) return;
      sums[qq.force] += pctFromChoice(v);
      counts[qq.force] += 1;
    });

    const out = {};
    Object.keys(sums).forEach((f) => {
      out[f] = counts[f] ? Math.round(sums[f] / counts[f]) : 0;
    });
    return out;
  }, [state.answers]);

  const scores = useMemo(() => applySymptomBias(rawScores, state.symptom), [rawScores, state.symptom]);

  const diagnosis = useMemo(() => {
    const sorted = sortForcesByWeakest(scores);
    const bottleneck = sorted[0] ? sorted[0][0] : "essence";
    const second = sorted[1] ? sorted[1][0] : "identity";
    return { bottleneck, second, sorted };
  }, [scores]);

  const symptomObj = useMemo(
    () => SYMPTOMS.find((s) => s.id === state.symptom) || null,
    [state.symptom]
  );

  const currentQ = Q[state.idx];
  const forceMeta = FORCES.find((f) => f.id === currentQ?.force);

  const startAudit = () => {
    setState((p) => ({
      ...p,
      view: "symptom",
      createdAtISO: new Date().toISOString(),
      idx: 0,
      answers: {},
    }));
  };

  const beginQuestions = () => {
    setState((p) => ({
      ...p,
      view: "audit",
      idx: 0,
    }));
  };

  const resetAll = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState({
      view: "start",
      createdAtISO: new Date().toISOString(),
      name: "",
      email: "",
      website: "",
      symptom: "",
      idx: 0,
      answers: {},
      fromSignal: qp.from === "signal",
      seedStage: qp.stage || "",
      seedPrimary: qp.primary || "",
      seedSecondary: qp.secondary || "",
    });
  };

  const pickSymptom = (id) => setState((p) => ({ ...p, symptom: id }));

  const pickAnswer = (qid, val) => {
    setState((p) => {
      const nextAnswers = { ...p.answers, [qid]: val };
      const nextIdx = p.idx + 1;

      if (nextIdx === 10) {
        return { ...p, answers: nextAnswers, idx: nextIdx, view: "checkpoint" };
      }

      if (nextIdx >= total) {
        return { ...p, answers: nextAnswers, idx: total - 1, view: "results" };
      }

      return { ...p, answers: nextAnswers, idx: nextIdx };
    });
  };

  const goBack = () => setState((p) => ({ ...p, idx: Math.max(0, p.idx - 1) }));
  const continueFromCheckpoint = () => setState((p) => ({ ...p, view: "audit" }));

  const toExport = () => setState((p) => ({ ...p, view: "export" }));

  const bookCall = () => {
    window.location.href = "https://qtmbg.com/book";
  };

  const openSignal = () => {
    window.location.href = "https://signal.qtmbg.com";
  };

  const printThis = () => window.print();

  const exportText = useMemo(() => {
    const b = diagnosis.bottleneck;
    const leak = LEAKS[b];
    const sorted = diagnosis.sorted || [];
    const lines = [];
    lines.push("QTMBG — STRUCTURAL AUDIT");
    lines.push(`Date: ${new Date(state.createdAtISO).toLocaleString()}`);
    if (state.website) lines.push(`Website: ${state.website}`);
    if (symptomObj) lines.push(`Symptom: ${symptomObj.label} — ${symptomObj.sub}`);
    lines.push("");
    lines.push(`BOTTLENECK: ${b.toUpperCase()} — ${leak.name}`);
    lines.push("");
    lines.push("SCORES:");
    sorted.forEach(([k, v]) => {
      lines.push(`- ${k.toUpperCase()}: ${v} (${bandLabel(v)})`);
    });
    lines.push("");
    lines.push("STRUCTURAL DIAGNOSIS:");
    lines.push(leak.core);
    lines.push("");
    lines.push("WHY IT HURTS:");
    lines.push(leak.whyItHurts);
    lines.push("");
    lines.push("EVIDENCE:");
    leak.evidence.forEach((e) => lines.push(`- ${e}`));
    lines.push("");
    lines.push("TODAY MOVE:");
    lines.push(leak.todayMove);
    lines.push("");
    lines.push("7-DAY PLAN:");
    leak.weekPlan.forEach((w, i) => lines.push(`${i + 1}. ${w}`));
    lines.push("");
    lines.push("ASSETS TO BUILD:");
    leak.assets.forEach((a) => lines.push(`- ${a}`));
    lines.push("");
    lines.push("NEXT STEP:");
    lines.push("Book your leak review: https://qtmbg.com/book");
    return lines.join("\n");
  }, [diagnosis, state.createdAtISO, state.website, symptomObj]);

  /* ---------- views ---------- */

  if (state.view === "start") {
    return (
      <AppShell>
        <TopBar title="Structural Audit" rightText="~6–9 min • 5 forces • bottleneck + fix plan" />

        <div className="hero">
          <div className="kicker center">STRUCTURAL AUDIT</div>
          <div className="h1 center">Find the structural leak causing your symptom.</div>
          <div className="sub center">
            Pick a symptom, run the 5-force checklist, and get a bottleneck + a fix plan you can execute.
          </div>
        </div>

        <Card>
          <div className="label">Operator coordinates (optional to start)</div>

          <div className="grid2">
            <div className="field">
              <div className="label2">Name</div>
              <input
                className="input"
                value={state.name}
                onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <div className="field">
              <div className="label2">Email (required for export)</div>
              <input
                className="input"
                value={state.email}
                onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@email.com"
                autoComplete="email"
              />
              <div className="tiny muted" style={{ marginTop: 6 }}>
                We only require this when you export / save.
              </div>
            </div>
          </div>

          <div className="field">
            <div className="label2">Website (optional)</div>
            <input
              className="input"
              value={state.website}
              onChange={(e) => setState((p) => ({ ...p, website: e.target.value }))}
              placeholder="https://yoursite.com"
              autoComplete="url"
            />
          </div>

          {state.fromSignal && (
            <div className="seed">
              <div className="seedTitle">Incoming context detected</div>
              <div className="seedRow">
                <span className="seedTag">from signal</span>
                <span className="tiny muted">
                  stage: <b>{state.seedStage || "—"}</b> • primary: <b>{state.seedPrimary || "—"}</b> • secondary:{" "}
                  <b>{state.seedSecondary || "—"}</b>
                </span>
              </div>
            </div>
          )}

          <div className="ctaRow">
            <Btn variant="primary" onClick={startAudit} icon={<Target size={16} />}>
              Start audit
            </Btn>

            <button className="link" type="button" onClick={openSignal}>
              Or run the fast Signal Scan
            </button>
          </div>

          <div className="trust">
            <div className="trustItem">
              <CheckCircle2 size={14} />
              <span>Deeper than a quiz</span>
            </div>
            <div className="trustItem">
              <CheckCircle2 size={14} />
              <span>Outputs a real fix plan</span>
            </div>
            <div className="trustItem">
              <CheckCircle2 size={14} />
              <span>Designed to book the right call</span>
            </div>
          </div>
        </Card>
      </AppShell>
    );
  }

  if (state.view === "symptom") {
    return (
      <AppShell>
        <TopBar title="Structural Audit" rightText="step 1/3 • choose symptom" />

        <div className="hero">
          <div className="kicker center">STEP 1</div>
          <div className="h1 center">Pick the symptom you want to fix.</div>
          <div className="sub center">
            This forces the audit to produce a fix plan aligned to your real pain — not generic advice.
          </div>
        </div>

        <Card>
          <div className="choices">
            {SYMPTOMS.map((s) => {
              const active = state.symptom === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`choice ${active ? "active" : ""}`}
                  onClick={() => pickSymptom(s.id)}
                >
                  <div className="choiceDot">
                    {active ? <CheckCircle2 size={14} /> : <CircleDashed size={14} />}
                  </div>
                  <div className="choiceBlock">
                    <div className="choiceTitle">{s.label}</div>
                    <div className="tiny muted">{s.sub}</div>
                  </div>
                  <ChevronRight size={16} className="chev" />
                </button>
              );
            })}
          </div>

          <div className="ctaRow" style={{ marginTop: 16 }}>
            <Btn
              variant="primary"
              onClick={beginQuestions}
              disabled={!state.symptom}
              icon={<ArrowRight size={16} />}
            >
              Continue
            </Btn>
            <button className="link" type="button" onClick={resetAll}>
              Reset
            </button>
          </div>
        </Card>
      </AppShell>
    );
  }

  if (state.view === "checkpoint") {
    const answered = Object.keys(state.answers).length;
    return (
      <AppShell>
        <TopBar title="Structural Audit" rightText="checkpoint • depth lock" />

        <Card className="aha">
          <div className="ahaIcon">
            <Target size={32} />
          </div>

          <div className="ahaTitle">Good. This is where most “free audits” stop.</div>

          <div className="ahaText">
            You’ve answered <strong>{answered}</strong> questions. The next half is where the audit becomes useful:
            it isolates the structural bottleneck instead of giving generic advice.
          </div>

          <div className="ahaHint">
            Keep going. You’ll get: (1) bottleneck, (2) why it’s causing your symptom, (3) today move, (4) 7-day plan,
            (5) the assets to build.
          </div>

          <div className="ctaRow" style={{ justifyContent: "center" }}>
            <Btn variant="primary" onClick={continueFromCheckpoint} icon={<ArrowRight size={16} />}>
              Continue the audit
            </Btn>
          </div>

          <div className="tiny muted center">You’re building trust by not being shallow.</div>
        </Card>
      </AppShell>
    );
  }

  if (state.view === "audit") {
    const current = state.idx + 1;
    const totalQ = total;
    const Icon = forceMeta ? forceMeta.icon : CircleDashed;

    const val = state.answers[currentQ.id] || 0;

    const choose = (v) => pickAnswer(currentQ.id, v);

    return (
      <AppShell>
        <TopBar title="Structural Audit" rightText="~6–9 min • 20 questions • deep output" />

        <div className="scanHead">
          <div className="scanLeft">
            <div className="kicker">
              Question {current} / {totalQ}
            </div>
            <div className="forceLine">
              <Icon size={18} />
              <div>
                <div className="forceName">{forceMeta ? forceMeta.label : ""}</div>
                <div className="tiny muted">{forceMeta ? forceMeta.micro : ""}</div>
              </div>
            </div>
          </div>

          <div className="scanRight">
            <button className="link" type="button" onClick={goBack} disabled={state.idx === 0}>
              Back
            </button>
          </div>
        </div>

        <ProgressBar current={current} total={totalQ} />

        <Card>
          <div className="qText">{currentQ.text}</div>

          <div className="choices">
            <button className={`choice mini ${val === 1 ? "active" : ""}`} type="button" onClick={() => choose(1)}>
              <div className="choiceDot">{val === 1 ? <CheckCircle2 size={14} /> : <CircleDashed size={14} />}</div>
              <div className="choiceBlock">
                <div className="choiceTitle">1/5</div>
                <div className="tiny muted">{currentQ.a}</div>
              </div>
              <ChevronRight size={16} className="chev" />
            </button>

            <button className={`choice mini ${val === 3 ? "active" : ""}`} type="button" onClick={() => choose(3)}>
              <div className="choiceDot">{val === 3 ? <CheckCircle2 size={14} /> : <CircleDashed size={14} />}</div>
              <div className="choiceBlock">
                <div className="choiceTitle">3/5</div>
                <div className="tiny muted">{currentQ.b}</div>
              </div>
              <ChevronRight size={16} className="chev" />
            </button>

            <button className={`choice mini ${val === 5 ? "active" : ""}`} type="button" onClick={() => choose(5)}>
              <div className="choiceDot">{val === 5 ? <CheckCircle2 size={14} /> : <CircleDashed size={14} />}</div>
              <div className="choiceBlock">
                <div className="choiceTitle">5/5</div>
                <div className="tiny muted">{currentQ.c}</div>
              </div>
              <ChevronRight size={16} className="chev" />
            </button>
          </div>

          <div className="tiny muted" style={{ marginTop: 14 }}>
            Tip: answer based on what a cold prospect experiences — not what you *intend*.
          </div>
        </Card>
      </AppShell>
    );
  }

  if (state.view === "export") {
    const canSubmit = Boolean(state.email && state.email.includes("@"));
    const submitExport = () => {
      console.log("STRUCTURAL AUDIT EXPORT:", {
        name: state.name,
        email: state.email,
        website: state.website,
        symptom: state.symptom,
        scores,
        bottleneck: diagnosis.bottleneck,
      });
      alert("Saved. Check your inbox soon.");
      setState((p) => ({ ...p, view: "results" }));
    };

    return (
      <AppShell>
        <TopBar title="Structural Audit" rightText="export • save" />

        <div className="hero">
          <div className="kicker center">EXPORT</div>
          <div className="h1 center">Save your audit output.</div>
          <div className="sub center">
            We only ask for email here — because this is the part you may want to keep.
          </div>
        </div>

        <Card>
          <div className="grid2">
            <div className="field">
              <div className="label2">Email (required)</div>
              <input
                className="input"
                value={state.email}
                onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </div>
            <div className="field">
              <div className="label2">Name (optional)</div>
              <input
                className="input"
                value={state.name}
                onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="field">
            <div className="label2">Website (optional)</div>
            <input
              className="input"
              value={state.website}
              onChange={(e) => setState((p) => ({ ...p, website: e.target.value }))}
              placeholder="https://yoursite.com"
              autoComplete="url"
            />
          </div>

          <div className="ctaRow">
            <Btn variant="primary" onClick={submitExport} disabled={!canSubmit} icon={<Send size={16} />}>
              Email me the output
            </Btn>

            <button
              className="btn secondary"
              type="button"
              onClick={() => {
                try {
                  navigator.clipboard.writeText(exportText);
                  alert("Copied to clipboard.");
                } catch {
                  alert("Copy failed. You can still print.");
                }
              }}
            >
              <LinkIcon size={16} />
              Copy output
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="tiny muted" style={{ marginTop: 10 }}>
            No spam. One useful email with your audit breakdown.
          </div>
        </Card>
      </AppShell>
    );
  }

  // RESULTS
  const b = diagnosis.bottleneck;
  const leak = LEAKS[b];
  const bMeta = FORCES.find((f) => f.id === b);
  const second = diagnosis.second;
  const secondMeta = FORCES.find((f) => f.id === second);

  return (
    <AppShell>
      <TopBar title="Structural Audit" rightText="results • bottleneck + fix plan" />
      <DecayTimer createdAtISO={state.createdAtISO} />

      <div className="hero">
        <div className="kicker center">YOUR BOTTLENECK</div>
        <div className="h1 leak center">{leak.name}</div>
        <div className="sub center">
          Structural root in <b>{bMeta ? bMeta.label : b.toUpperCase()}</b>
          {symptomObj ? (
            <>
              {" "}
              causing <b>{symptomObj.label}</b>
            </>
          ) : null}
          .
        </div>
      </div>

      <Card className="symptoms">
        <div className="panelTitle">Structural diagnosis</div>
        <div className="panelText">{leak.core}</div>

        <div className="panelTitle mt">Why it’s causing your symptom</div>
        <div className="panelText">{leak.whyItHurts}</div>

        <div className="panelTitle mt">Evidence signals</div>
        <div className="symptomList">
          {leak.evidence.map((e, i) => (
            <div key={i} className="symptomItem">
              <CheckCircle2 size={16} />
              <span>{e}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="resultGrid">
          <div className="panel">
            <div className="panelTitle">Today move</div>
            <div className="panelText strong">{leak.todayMove}</div>

            <div className="panelTitle mt">7-day execution plan</div>
            <ul className="list">
              {leak.weekPlan.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>

            <div className="panelTitle mt">Assets to build</div>
            <div className="assetGrid">
              {leak.assets.map((a, i) => (
                <div key={i} className="asset">
                  <span className="assetDot" />
                  <span>{a}</span>
                </div>
              ))}
            </div>

            <div className="panelTitle mt">Secondary weakness</div>
            <div className="panelText small">
              Your second weakness is <b>{secondMeta ? secondMeta.label : second.toUpperCase()}</b>. Fix the bottleneck
              first, then tighten the secondary.
            </div>

            <div className="panelTitle mt">Export / print</div>
            <div className="ctaRow">
              <Btn variant="secondary" onClick={toExport} icon={<Send size={16} />}>
                Email / Save output
              </Btn>
              <button className="btn secondary" type="button" onClick={printThis}>
                <Printer size={16} />
                Print / PDF
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="panel soft">
            <div className="panelTitle">Signal snapshot</div>

            <div className="bars">
              {Object.keys(scores).map((f) => {
                const meta = FORCES.find((x) => x.id === f);
                const pct = scores[f];
                const isB = f === b;
                const isS = f === second;
                const tag = isB ? "BOTTLENECK" : isS ? "SECONDARY" : bandLabel(pct);

                return (
                  <div key={f} className="barRow">
                    <div className="barLeft">
                      <div className="barName">{meta ? meta.label : f}</div>
                      <div className={`tag ${isB ? "tagHard" : isS ? "tagWarn" : ""}`}>{tag}</div>
                    </div>
                    <div className="barWrap">
                      <div className="barIn" style={{ width: `${pct}%` }} />
                      <div className="barPct">{pct}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="panelTitle mt">Now: book the leak review</div>
            <div className="panelText small">
              If you want this to turn into real conversion, the call is where we translate the plan into exact assets,
              sequence, and copy for your situation.
            </div>

            <div className="commitLadder">
              <button className="commitStep primary" type="button" onClick={bookCall}>
                <div className="commitIcon">
                  <Target size={18} />
                </div>
                <div className="commitContent">
                  <div className="commitTitle">Book the 15-min leak review</div>
                  <div className="commitSub">Confirm the bottleneck on your real assets + next move</div>
                </div>
                <ArrowRight size={18} />
              </button>

              <button className="commitStep" type="button" onClick={bookCall}>
                <div className="commitIcon">
                  <Zap size={18} />
                </div>
                <div className="commitContent">
                  <div className="commitTitle">Upgrade: Full Brand MRI</div>
                  <div className="commitSub">Deep diagnosis + build plan + priority stack</div>
                </div>
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="rowBetween">
              <button className="link" type="button" onClick={resetAll}>
                <RotateCcw size={14} style={{ marginRight: 8 }} />
                New audit
              </button>
              <button className="link" type="button" onClick={openSignal}>
                Run Signal Scan
              </button>
            </div>

            <div className="tiny muted mt">
              This is built to feel “not like a freebie” — depth, structure, and a real plan.
            </div>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}

/* ---------- CSS (clean white; NO pink tint; matches Signal foundation) ---------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sometype+Mono:wght@400;500;600;700;800&display=swap');

:root{
  --bg:#ffffff;
  --paper:#ffffff;
  --ink:#0a0a0a;
  --muted:rgba(10,10,10,.62);
  --stroke:rgba(10,10,10,.85);
}

*{margin:0;padding:0;box-sizing:border-box;}

.qbg{
  min-height:100vh;
  color:var(--ink);
  font-family:'Sometype Mono', ui-monospace, monospace;
  line-height:1.55;
  display:flex;
  background:var(--bg);
  /* NOTE: removed the red “margin” line that can read pink on some displays */
  background-image:
    linear-gradient(to bottom, rgba(10,10,10,.06) 1px, transparent 1px),
    linear-gradient(to right, rgba(10,10,10,.03) 1px, transparent 1px);
  background-size:100% 28px, 72px 100%;
  background-position:0 0, 0 0;
}

.wrap{
  width:100%;
  max-width:1126px;
  margin:0 auto;
  padding:22px 20px;
  display:flex;
  flex-direction:column;
  flex:1;
}

.main{flex:1;}

.topbar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:12px 0 14px;
  border-bottom:2px solid var(--stroke);
}

.brandRow{display:flex;align-items:center;gap:14px;}

.brandBadge{
  border:2px solid var(--stroke);
  background:var(--ink);
  color:var(--paper);
  padding:8px 12px;
  font-size:12px;
  letter-spacing:.18em;
  text-transform:uppercase;
  font-weight:800;
}

.brandTitle{font-size:18px;font-weight:700;letter-spacing:-.01em;}

.topmeta{font-size:12px;color:rgba(10,10,10,.55);letter-spacing:.02em;white-space:nowrap;}

.muted{color:var(--muted);}
.tiny{font-size:12px;line-height:1.4;}
.small{font-size:13px;line-height:1.55;}
.center{text-align:center;}

.hero{
  padding:18px 0 16px;
  max-width:1040px;
  margin:0 auto;
  text-align:center;
}

.kicker{
  font-size:11px;
  letter-spacing:.24em;
  text-transform:uppercase;
  color:rgba(10,10,10,.55);
  margin-bottom:12px;
  font-weight:800;
}

.h1{
  font-size:clamp(32px,5vw,64px);
  line-height:1.04;
  letter-spacing:-.02em;
  font-weight:900;
}

.h1.leak{
  border:2px solid var(--ink);
  display:inline-block;
  padding:14px 18px;
  margin-top:6px;
  background:var(--ink);
  color:var(--paper);
}

.sub{
  margin-top:14px;
  font-size:15px;
  line-height:1.65;
  color:rgba(10,10,10,.75);
  max-width:820px;
  margin-left:auto;
  margin-right:auto;
}
.sub b{color:var(--ink);font-weight:900;}

.card{
  border:2px solid var(--ink);
  padding:22px;
  background:var(--paper);
  margin-bottom:16px;
}

.card.aha{background:var(--paper);}
.card.symptoms{background:var(--paper);}

.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
@media (max-width:720px){.grid2{grid-template-columns:1fr;}}

.field{margin-bottom:16px;}

.label,
.label2{
  font-size:11px;
  letter-spacing:.2em;
  text-transform:uppercase;
  color:rgba(10,10,10,.55);
  margin-bottom:10px;
  font-weight:900;
}

.input{
  width:100%;
  border:none;
  border-bottom:2px solid var(--ink);
  padding:12px 4px;
  font-size:15px;
  outline:none;
  background:transparent;
  color:var(--ink);
  font-family:'Sometype Mono', ui-monospace, monospace;
}
.input::placeholder{color:rgba(10,10,10,.35);}

.btn{
  border:2px solid var(--ink);
  padding:14px 18px;
  display:inline-flex;
  align-items:center;
  gap:12px;
  text-transform:uppercase;
  letter-spacing:.18em;
  font-size:11px;
  cursor:pointer;
  transition:all .18s cubic-bezier(.4,0,.2,1);
  font-family:'Sometype Mono', ui-monospace, monospace;
  font-weight:900;
}
.btn.primary{background:var(--ink);color:var(--paper);}
.btn.primary:hover{transform:translateY(-2px);}
.btn.secondary{background:var(--paper);color:var(--ink);}
.btn.secondary:hover{transform:translateY(-2px);}
.btn.disabled{opacity:.35;cursor:not-allowed;}

.link{
  background:transparent;
  border:none;
  padding:0;
  color:rgba(10,10,10,.55);
  text-decoration:underline;
  cursor:pointer;
  font-family:'Sometype Mono', ui-monospace, monospace;
  font-size:12px;
}
.link:hover{color:var(--ink);}

.ctaRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  margin-top:8px;
  flex-wrap:wrap;
}

.trust{display:flex;gap:18px;margin-top:18px;flex-wrap:wrap;}
.trustItem{display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(10,10,10,.72);}

.seed{
  border:2px solid rgba(10,10,10,.2);
  padding:12px 14px;
  background:rgba(255,255,255,.92);
  margin:14px 0 4px;
}
.seedTitle{
  font-weight:900;
  letter-spacing:.14em;
  font-size:11px;
  text-transform:uppercase;
  color:rgba(10,10,10,.65);
  margin-bottom:6px;
}
.seedRow{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.seedTag{
  border:2px solid rgba(10,10,10,.35);
  padding:4px 8px;
  font-size:10px;
  letter-spacing:.18em;
  text-transform:uppercase;
  font-weight:900;
}

.scanHead{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px;}
.forceLine{display:flex;gap:12px;align-items:flex-start;}
.forceName{font-weight:900;letter-spacing:.14em;font-size:14px;}

.progress{width:100%;height:3px;background:rgba(10,10,10,.2);margin-bottom:18px;overflow:hidden;}
.progressIn{height:3px;background:var(--ink);transition:width .25s cubic-bezier(.4,0,.2,1);}

.qText{font-size:22px;line-height:1.35;letter-spacing:-.01em;font-weight:800;margin-bottom:18px;color:var(--ink);}

.choices{display:flex;flex-direction:column;gap:12px;}

.choice{
  display:flex;align-items:center;gap:12px;width:100%;
  text-align:left;border:2px solid var(--ink);
  background:var(--paper);padding:16px;
  cursor:pointer;transition:all .18s cubic-bezier(.4,0,.2,1);
  font-family:'Sometype Mono', ui-monospace, monospace;
}
.choice:hover{transform:translateY(-2px);}
.choice.active{background:var(--ink);color:var(--paper);}
.choice.active .muted{color:rgba(255,255,255,.75);}
.choice.mini{padding:14px;}

.choiceDot{
  width:28px;height:28px;display:flex;align-items:center;justify-content:center;
  border:2px solid currentColor;flex-shrink:0;
}
.choiceBlock{flex:1;}
.choiceTitle{font-weight:900;letter-spacing:-.01em;font-size:15px;margin-bottom:4px;}
.chev{opacity:.55;flex-shrink:0;}

.timer{
  display:flex;align-items:center;gap:10px;padding:12px 14px;
  background:rgba(255,255,255,.96);border:2px solid var(--ink);
  margin-bottom:14px;font-size:12px;color:rgba(10,10,10,.72);
}
.timer.expired{background:var(--ink);color:var(--paper);}
.timer strong{color:var(--ink);font-weight:900;}
.timer.expired strong{color:var(--paper);}

.ahaIcon{margin:0 auto 18px;width:64px;height:64px;border:2px solid var(--ink);display:flex;align-items:center;justify-content:center;}
.ahaTitle{font-size:28px;font-weight:900;margin-bottom:14px;text-align:center;}
.ahaText{font-size:15px;line-height:1.65;color:rgba(10,10,10,.75);margin-bottom:18px;max-width:720px;margin-left:auto;margin-right:auto;text-align:center;}
.ahaHint{font-size:14px;line-height:1.55;color:rgba(10,10,10,.68);margin-bottom:14px;max-width:720px;margin-left:auto;margin-right:auto;text-align:center;}

.symptomList{display:flex;flex-direction:column;gap:10px;margin-top:10px;}
.symptomItem{display:flex;align-items:flex-start;gap:12px;font-size:14px;line-height:1.55;color:rgba(10,10,10,.78);}
.symptomItem svg{flex-shrink:0;margin-top:2px;}

.resultGrid{display:grid;grid-template-columns:1.1fr .9fr;gap:18px;}
@media (max-width:900px){.resultGrid{grid-template-columns:1fr;}}

.panel{border:2px solid var(--ink);padding:18px;background:var(--paper);}
.panel.soft{background:rgba(255,255,255,.96);}

.panelTitle{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(10,10,10,.62);font-weight:900;margin-bottom:10px;}
.panelText{font-size:14px;line-height:1.65;color:rgba(10,10,10,.78);}
.panelText.strong{font-weight:900;color:var(--ink);font-size:15px;}
.mt{margin-top:18px;}

.list{padding-left:18px;color:rgba(10,10,10,.78);line-height:1.65;font-size:14px;}
.list li{margin-bottom:8px;}

.assetGrid{display:grid;grid-template-columns:1fr;gap:10px;margin-top:10px;}
.asset{display:flex;align-items:center;gap:10px;padding:10px 12px;border:2px solid rgba(10,10,10,.25);background:rgba(255,255,255,.96);}
.assetDot{width:10px;height:10px;border:2px solid var(--ink);display:inline-block;}

.bars{margin-top:14px;display:flex;flex-direction:column;gap:12px;}
.barLeft{display:flex;align-items:center;justify-content:space-between;gap:12px;}
.barName{font-size:12px;letter-spacing:.14em;font-weight:900;color:var(--ink);}
.tag{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:rgba(10,10,10,.45);font-weight:900;}
.tagHard{color:var(--paper);background:var(--ink);padding:4px 8px;border:2px solid var(--ink);}
.tagWarn{color:var(--ink);background:rgba(10,10,10,.08);padding:4px 8px;border:2px solid rgba(10,10,10,.25);}

.barWrap{position:relative;border:2px solid var(--ink);height:26px;background:rgba(255,255,255,.98);overflow:hidden;}
.barIn{height:100%;background:var(--ink);transition:width .5s cubic-bezier(.4,0,.2,1);}
.barPct{position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--paper);font-weight:900;mix-blend-mode:difference;}

.commitLadder{display:flex;flex-direction:column;gap:12px;margin:16px 0 10px;}
.commitStep{
  display:flex;align-items:center;gap:14px;padding:14px;border:2px solid rgba(10,10,10,.35);
  background:rgba(255,255,255,.96);cursor:pointer;transition:all .18s cubic-bezier(.4,0,.2,1);
  text-align:left;font-family:'Sometype Mono', ui-monospace, monospace;
}
.commitStep:hover{transform:translateY(-2px);border-color:var(--ink);}
.commitStep.primary{border-color:var(--ink);background:var(--ink);color:var(--paper);}
.commitIcon{width:40px;height:40px;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.commitContent{flex:1;}
.commitTitle{font-weight:900;font-size:14px;margin-bottom:4px;}
.commitSub{font-size:11px;color:rgba(10,10,10,.55);}
.commitStep.primary .commitSub{color:rgba(255,255,255,.75);}

.rowBetween{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px;}

.footer{
  margin-top:18px;padding-top:14px;border-top:2px solid var(--stroke);
  display:flex;align-items:center;gap:12px;
}
.footerTag{
  border:2px solid var(--stroke);padding:6px 10px;font-size:10px;letter-spacing:.22em;
  text-transform:uppercase;font-weight:900;background:var(--ink);color:var(--paper);
}

@media (max-width:640px){
  .wrap{padding:18px 16px;}
  .topbar{flex-direction:column;align-items:flex-start;}
  .card{padding:16px;}
  .ctaRow{flex-direction:column;align-items:stretch;}
  .trust{flex-direction:column;gap:10px;}
  .commitStep{padding:12px;}
  .topmeta{width:100%;text-align:left;}
}
`;
