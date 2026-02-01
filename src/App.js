'use client';

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  RefreshCw,
  Target,
  Clock,
  Zap,
  ShieldAlert,
  Layers,
  Cpu,
  Activity,
} from "lucide-react";

/**
 * QTMBG — SIGNAL AUDIT (DEEP) v2.0
 * Benchmark-driven architecture (Liven-style):
 * 1) Warm Welcome → 2) Pick Symptom → 3) Coordinates (optional; email only for export)
 * 4) Deep Scan (25 Likert items / 5 forces) + Midpoint "Pattern detected"
 * 5) Result that feels "paid" + Book Call CTA + Export
 *
 * DESIGN:
 * - White paper
 * - Notebook grid + margin line
 * - Sometype Mono (head + body)
 *
 * NOTE: Update links below.
 */

type ForceId = "essence" | "identity" | "offer" | "system" | "growth";
type SymptomId =
  | "price_resistance"
  | "ghosting"
  | "wrong_fit"
  | "feast_famine"
  | "invisibility";

type StageId = "launch" | "reposition" | "scale";
type Likert = 1 | 2 | 3 | 4 | 5;

type View =
  | "WELCOME"
  | "SYMPTOM"
  | "COORDS"
  | "SCAN"
  | "MIDPOINT"
  | "RESULT"
  | "EXPORT";

const STORAGE_KEY = "qtmbg-signal-audit-deep-v2";

// ====== UPDATE THESE LINKS ======
const CALL_BOOKING_LINK = "https://audit.qtmbg.com/"; // <-- replace with your real booking URL
const KIT_LINKS: Record<ForceId, string> = {
  essence: "https://www.qtmbg.com/kit#module-1",
  identity: "https://www.qtmbg.com/kit#module-2",
  offer: "https://www.qtmbg.com/kit#module-3",
  system: "https://www.qtmbg.com/kit#module-4",
  growth: "https://www.qtmbg.com/kit#module-5",
};

// ====== META ======
const FORCES: Array<{
  id: ForceId;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  micro: string;
}> = [
  { id: "essence", label: "ESSENCE", icon: Zap, micro: "Truth + mechanism + belief" },
  { id: "identity", label: "IDENTITY", icon: ShieldAlert, micro: "Status + clarity + trust" },
  { id: "offer", label: "OFFER", icon: Layers, micro: "What people buy + why now" },
  { id: "system", label: "SYSTEM", icon: Cpu, micro: "Path from attention → cash" },
  { id: "growth", label: "GROWTH", icon: Activity, micro: "Scaling without chaos" },
];

const STAGES: Array<{ id: StageId; label: string; sub: string }> = [
  { id: "launch", label: "Launching", sub: "First demand + first offers" },
  { id: "reposition", label: "Repositioning", sub: "Good work, unclear signal/audience" },
  { id: "scale", label: "Scaling", sub: "You need throughput, not hustle" },
];

const SYMPTOMS: Array<{ id: SymptomId; label: string; desc: string }> = [
  { id: "price_resistance", label: "PRICE RESISTANCE", desc: "People hesitate, negotiate, or ask “why so expensive?”" },
  { id: "ghosting", label: "GHOSTING", desc: "Interest → silence. Trust breaks mid-path." },
  { id: "wrong_fit", label: "WRONG FIT", desc: "You attract the wrong buyers and waste time." },
  { id: "feast_famine", label: "FEAST / FAMINE", desc: "Revenue spikes and dips. No control." },
  { id: "invisibility", label: "INVISIBILITY", desc: "Work is good, market response is weak." },
];

// ====== DEEP SCAN (25 items = 5 per force) ======
type ScanQ = {
  id: string;
  force: ForceId;
  text: string;
  hint: string;
};

const SCAN: ScanQ[] = [
  // ESSENCE (5)
  { id: "e1", force: "essence", text: "I have a NAMED mechanism (2–4 words) prospects can repeat.", hint: "If you can’t name it, you don’t own it yet." },
  { id: "e2", force: "essence", text: "My content attacks a specific status-quo belief (clear enemy).", hint: "Conviction is conversion." },
  { id: "e3", force: "essence", text: "I can explain my before→after in one sentence (no jargon).", hint: "One sentence should sell the whole system." },
  { id: "e4", force: "essence", text: "My positioning repels wrong-fit buyers (polarization is intentional).", hint: "If everyone likes it, nobody buys fast." },
  { id: "e5", force: "essence", text: "I have proof that my mechanism works (examples, numbers, artifacts).", hint: "Proof > promises." },

  // IDENTITY (5)
  { id: "i1", force: "identity", text: "My website looks premium within 3 seconds on mobile.", hint: "Premium is an instant perception." },
  { id: "i2", force: "identity", text: "My language is precise (no fluff, no generic claims).", hint: "Generic language = generic pricing." },
  { id: "i3", force: "identity", text: "My visuals are consistent across touchpoints (site, socials, decks).", hint: "Consistency signals control." },
  { id: "i4", force: "identity", text: "I have at least 1 strong case study (before/after + specifics).", hint: "A real case study is a selling machine." },
  { id: "i5", force: "identity", text: "Prospects assume I’m premium before price is mentioned.", hint: "Status removes negotiation." },

  // OFFER (5)
  { id: "o1", force: "offer", text: "I have ONE flagship next step (obvious CTA, no confusion).", hint: "Choice kills conversion." },
  { id: "o2", force: "offer", text: "My offer solves one expensive problem with a clear outcome.", hint: "No outcome = no urgency." },
  { id: "o3", force: "offer", text: "Buyers understand exactly what happens after they pay (process).", hint: "Clarity reduces fear." },
  { id: "o4", force: "offer", text: "Pricing is anchored to transformation (not hours) and defended by proof.", hint: "Time-based pricing makes you negotiable." },
  { id: "o5", force: "offer", text: "I have a strong filter or risk reversal that increases trust.", hint: "Constraints create confidence." },

  // SYSTEM (5)
  { id: "s1", force: "system", text: "I have one primary channel producing leads weekly.", hint: "Random leads = random revenue." },
  { id: "s2", force: "system", text: "Capture + follow-up is automated (email/DM sequence exists).", hint: "Manual follow-up leaks money." },
  { id: "s3", force: "system", text: "I use at least one qualification filter to repel bad fits.", hint: "Filtering is how you scale quality." },
  { id: "s4", force: "system", text: "My pipeline is tracked (even a simple sheet).", hint: "If it’s not tracked, it’s not controlled." },
  { id: "s5", force: "system", text: "I can state inputs → outputs (viewers→leads→calls→closes).", hint: "Numbers turn hope into engineering." },

  // GROWTH (5)
  { id: "g1", force: "growth", text: "I track one north-star metric weekly (same day, same time).", hint: "Rhythm creates momentum." },
  { id: "g2", force: "growth", text: "I have a 90-day focus (one lever) and ignore noise.", hint: "Shiny tactics kill compounding." },
  { id: "g3", force: "growth", text: "Delivery is productized enough to delegate or scale.", hint: "If it lives in your head, it can’t scale." },
  { id: "g4", force: "growth", text: "I have a referral trigger and ask at the moment of first win.", hint: "Referrals are a system, not luck." },
  { id: "g5", force: "growth", text: "Adding budget/people would predictably increase output.", hint: "If not, you’re scaling chaos." },
];

// ====== STRUCTURAL LEAK PROTOCOLS ======
type Protocol = {
  leakName: string;
  meaning: string;
  rootCause: string;
  fix24h: string[];
  fix7d: string[];
  fix30d: string[];
  assets: Array<{ label: string; href: string }>;
  callPitch: string;
};

const PROTOCOLS: Record<ForceId, Protocol> = {
  essence: {
    leakName: "BLURRY MECHANISM",
    meaning:
      "The work may be good — but the market can’t name what you do. When your mechanism isn’t named, trust stays slow and price stays fragile.",
    rootCause:
      "You’re selling capability instead of a repeatable worldview + method. That forces prospects to ‘figure you out’ on calls.",
    fix24h: [
      "Write one sentence: WHO → OUTCOME → MECHANISM → TIME.",
      "Name the mechanism (2–4 words). Put it in hero + bio today.",
      "Write one contrarian belief you defend (the enemy).",
    ],
    fix7d: [
      "Publish 3 posts: (1) belief attack, (2) mechanism explanation, (3) proof story.",
      "Rewrite homepage above-the-fold: Outcome + Mechanism + Proof + One CTA.",
      "Create one ‘method’ graphic (simple 5-step or 3-step).",
    ],
    fix30d: [
      "Turn the mechanism into a productized diagnostic: input → scoring → output plan.",
      "Build a proof stack: 5 artifacts (screens, numbers, before/after, teardown).",
      "Refine your ‘repulsion’ language so wrong fits self-exit.",
    ],
    assets: [
      { label: "Open Kit — Essence module", href: KIT_LINKS.essence },
    ],
    callPitch:
      "On the call we’ll extract the hidden IP inside your delivery, name it, and turn it into a mechanism buyers repeat for you.",
  },
  identity: {
    leakName: "STATUS GAP",
    meaning:
      "You might be skilled — but your touchpoints don’t look ‘expensive’. That creates hesitation and negotiation.",
    rootCause:
      "Your identity is optimized for comfort (‘nice’) instead of authority (‘obvious premium’).",
    fix24h: [
      "Remove generic claims. Replace with specifics (outcomes, constraints, numbers).",
      "Choose 1 signature element (rule system / type / motif) and apply everywhere.",
      "Add 1 proof block to the homepage (case, screenshots, receipts).",
    ],
    fix7d: [
      "Upgrade 3 assets: homepage, offer page, one case study.",
      "Publish 2 authority posts: your model + your standards (filters).",
      "Tighten your vocabulary: ban weak words (help, passion, tailor-made).",
    ],
    fix30d: [
      "Build an authority library: 10 posts that explain your worldview and standards.",
      "Shoot / produce 15 high-status visual assets (consistent lighting + framing).",
      "Package 1 case study into multiple formats (post, page, PDF, thread).",
    ],
    assets: [
      { label: "Open Kit — Identity module", href: KIT_LINKS.identity },
    ],
    callPitch:
      "On the call we’ll pinpoint exactly why you don’t look premium yet, and what to change first so price objections collapse.",
  },
  offer: {
    leakName: "VALUE CONFUSION",
    meaning:
      "People like you — but they don’t buy fast. The buyer can’t see the ‘one obvious next step’ with a clean outcome.",
    rootCause:
      "Too many options, too much custom, or a promise that isn’t concrete enough to justify urgency.",
    fix24h: [
      "Pick ONE flagship and write: who it’s for / what you get / how it works / price.",
      "Write 3 filters (who it is NOT for). Put them on the offer page.",
      "Replace feature lists with outcome milestones (Week 1/2/3).",
    ],
    fix7d: [
      "Collapse to 1 path + 1 entry step (if needed).",
      "Build a simple pricing logic: anchors + proof + constraints.",
      "Publish 1 teardown showing how your offer creates the after-state.",
    ],
    fix30d: [
      "Install a consistent sales script: symptom → root cause → plan → close.",
      "Add one risk reversal or guarantee mechanism you can defend.",
      "Build one ‘explain-it-like-I’m-5’ offer diagram.",
    ],
    assets: [
      { label: "Open Kit — Offer module", href: KIT_LINKS.offer },
    ],
    callPitch:
      "On the call we’ll collapse your offer into one obvious path that buyers choose without negotiation.",
  },
  system: {
    leakName: "PIPELINE FRICTION",
    meaning:
      "You’re busy — but revenue isn’t predictable. The path from attention → cash leaks.",
    rootCause:
      "No controlled funnel rhythm: capture, follow-up, qualification, and conversion aren’t engineered.",
    fix24h: [
      "Write your 6-step happy path: Viewer → Lead → Call → Close → Onboard → Referral.",
      "Add one capture point + one automated follow-up (even 1 email).",
      "Add 1 filter question (repel tire-kickers).",
    ],
    fix7d: [
      "Install a weekly nurture rhythm (proof + CTA).",
      "Track pipeline stages in a sheet (lead source, stage, next action).",
      "Define your conversion math (inputs→outputs).",
    ],
    fix30d: [
      "Build one channel playbook (content cadence + lead magnet + follow-up).",
      "Standardize qualification (score / threshold).",
      "Engineer referrals as a step (not a hope).",
    ],
    assets: [
      { label: "Open Kit — System module", href: KIT_LINKS.system },
    ],
    callPitch:
      "On the call we’ll map exactly where your pipeline leaks and give you the smallest fix that creates predictable revenue.",
  },
  growth: {
    leakName: "NO NORTH STAR",
    meaning:
      "You’re moving — but direction changes weekly. Growth becomes emotional and reactive instead of compounding.",
    rootCause:
      "No single metric + no operating rhythm. Without a scoreboard, you chase tactics.",
    fix24h: [
      "Pick ONE metric for 30 days (qualified leads/week OR close rate).",
      "Pick ONE channel to dominate for 30 days (ignore everything else).",
      "Create a weekly review slot: metric → bottleneck → one fix.",
    ],
    fix7d: [
      "Define a 90-day focus: one lever, one constraint, one output target.",
      "Add a referral trigger (ask at first win).",
      "Productize one part of delivery so it’s repeatable.",
    ],
    fix30d: [
      "Build a compounding content library (10 assets, same thesis).",
      "Create one scalable offer ladder step (entry → flagship → ascension).",
      "Systematize delivery (templates, checklists, operators manual).",
    ],
    assets: [
      { label: "Open Kit — Growth module", href: KIT_LINKS.growth },
    ],
    callPitch:
      "On the call we’ll choose the one lever you should pull for 90 days and remove everything else.",
  },
};

// ====== UTIL ======
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function safeJsonParse<T>(raw: string | null): T | null {
  try {
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
function isValidEmail(email: string) {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    String(email).toLowerCase()
  );
}
function pctFromLikert(v: Likert) {
  return v * 20; // 1→20 ... 5→100
}
function forceLabel(id: ForceId) {
  return FORCES.find((f) => f.id === id)?.label ?? id.toUpperCase();
}
function symptomLabel(id: SymptomId) {
  return SYMPTOMS.find((s) => s.id === id)?.label ?? id;
}

// ====== STATE ======
type State = {
  view: View;
  createdAtISO: string;
  stage: StageId;
  symptomId: SymptomId | null;

  // coordinates
  name: string;
  email: string;
  website: string;

  // scan
  qIndex: number;
  answers: Record<string, Likert | undefined>; // keyed by SCAN.id
  midpointShown: boolean;
};

const DEFAULT_STATE: State = {
  view: "WELCOME",
  createdAtISO: new Date().toISOString(),
  stage: "launch",
  symptomId: null,
  name: "",
  email: "",
  website: "",
  qIndex: 0,
  answers: {},
  midpointShown: false,
};

function loadStateSafe(): State | null {
  if (typeof window === "undefined") return null;
  return safeJsonParse<State>(window.localStorage.getItem(STORAGE_KEY));
}
function saveStateSafe(s: State) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="qbg">
      <style>{CSS}</style>

      <header className="top">
        <div className="brandRow">
          <div className="brandPill">QUANTUM BRANDING</div>
          <div className="brandTitle">Signal Audit</div>
        </div>
        <div className="topMeta">~6–9 min • 25 signals • structural leak + fix plan</div>
      </header>

      <main className="wrap">{children}</main>

      <footer className="foot">
        <div className="footPill">QTMBG</div>
        <div className="footText">
          This is a diagnostic — built to create clarity, not trivia.
        </div>
      </footer>
    </div>
  );
}

function Card({
  children,
  title,
  right,
  className = "",
}: {
  children: React.ReactNode;
  title?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {(title || right) && (
        <div className="cardTop">
          <div className="cardTitle">{title}</div>
          <div className="cardRight">{right}</div>
        </div>
      )}
      {children}
    </section>
  );
}

function Btn({
  children,
  onClick,
  variant = "primary",
  disabled,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`btn ${variant} ${disabled ? "disabled" : ""}`}
      onClick={onClick}
      disabled={!!disabled}
    >
      {icon}
      <span className="btnText">{children}</span>
      <ArrowRight size={16} />
    </button>
  );
}

function LinkBtn({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button type="button" className="linkBtn" onClick={onClick}>
      {icon}
      <span>{children}</span>
      <ChevronRight size={16} />
    </button>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = clamp((current / total) * 100, 0, 100);
  return (
    <div className="progress">
      <div className="progressIn" style={{ width: `${pct}%` }} />
    </div>
  );
}

function StagePicker({
  value,
  onChange,
}: {
  value: StageId;
  onChange: (s: StageId) => void;
}) {
  return (
    <div className="field">
      <div className="label">YOUR SITUATION *</div>
      <div className="stageGrid">
        {STAGES.map((s) => {
          const active = value === s.id;
          return (
            <button
              key={s.id}
              type="button"
              className={`stage ${active ? "active" : ""}`}
              onClick={() => onChange(s.id)}
            >
              <div className="stageTitle">{s.label}</div>
              <div className="tiny muted">{s.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <div className="field">
      <div className="label">{label}</div>
      <input
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        autoComplete={type === "email" ? "email" : type === "url" ? "url" : "name"}
      />
      {hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}

function LikertRow({
  value,
  onPick,
}: {
  value?: Likert;
  onPick: (v: Likert) => void;
}) {
  const options: Array<{ v: Likert; label: string }> = [
    { v: 1, label: "Strongly disagree" },
    { v: 2, label: "Disagree" },
    { v: 3, label: "Neutral" },
    { v: 4, label: "Agree" },
    { v: 5, label: "Strongly agree" },
  ];

  return (
    <div className="likert">
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            className={`likertBtn ${active ? "active" : ""}`}
            onClick={() => onPick(o.v)}
          >
            <div className="likertDot" />
            <div className="likertLabel">{o.label}</div>
          </button>
        );
      })}
    </div>
  );
}

// ====== MAIN ======
export default function App() {
  const [state, setState] = useState<State>(DEFAULT_STATE);

  useEffect(() => {
    const loaded = loadStateSafe();
    if (loaded) setState(loaded);
  }, []);

  useEffect(() => {
    saveStateSafe(state);
  }, [state]);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.view]);

  const totalQ = SCAN.length;

  const scores = useMemo(() => {
    const byForce: Record<ForceId, number[]> = {
      essence: [],
      identity: [],
      offer: [],
      system: [],
      growth: [],
    };

    for (const q of SCAN) {
      const v = state.answers[q.id];
      if (v) byForce[q.force].push(pctFromLikert(v));
    }

    const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

    const out: Record<ForceId, number> = {
      essence: avg(byForce.essence),
      identity: avg(byForce.identity),
      offer: avg(byForce.offer),
      system: avg(byForce.system),
      growth: avg(byForce.growth),
    };

    return out;
  }, [state.answers]);

  const diagnosis = useMemo(() => {
    const pairs = (Object.keys(scores) as ForceId[]).map((k) => [k, scores[k]] as const);
    pairs.sort((a, b) => a[1] - b[1]);
    const primary = pairs[0]?.[0] ?? "essence";
    const secondary = pairs[1]?.[0] ?? "identity";
    return { primary, secondary };
  }, [scores]);

  const answeredCount = useMemo(() => {
    return SCAN.filter((q) => !!state.answers[q.id]).length;
  }, [state.answers]);

  const currentQ = SCAN[state.qIndex];

  const restart = () => {
    try {
      if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState({ ...DEFAULT_STATE, createdAtISO: new Date().toISOString() });
  };

  const to = (view: View) => setState((p) => ({ ...p, view }));

  const start = () => {
    setState((p) => ({
      ...p,
      createdAtISO: new Date().toISOString(),
      view: "SYMPTOM",
      symptomId: null,
      qIndex: 0,
      answers: {},
      midpointShown: false,
    }));
  };

  const pickSymptom = (id: SymptomId) => {
    setState((p) => ({ ...p, symptomId: id, view: "COORDS" }));
  };

  const beginScan = () => {
    setState((p) => ({
      ...p,
      view: "SCAN",
      qIndex: 0,
      answers: p.answers ?? {},
      midpointShown: false,
    }));
  };

  const pickLikert = (qId: string, v: Likert) => {
    setState((p) => {
      const nextAnswers = { ...p.answers, [qId]: v };
      const nextIdx = Math.min(p.qIndex + 1, totalQ - 1);

      // Show midpoint screen once, after ~40% completion (10/25)
      const shouldMidpoint = !p.midpointShown && Object.keys(nextAnswers).length >= 10;

      if (shouldMidpoint) {
        return {
          ...p,
          answers: nextAnswers,
          qIndex: nextIdx,
          view: "MIDPOINT",
          midpointShown: true,
        };
      }

      // If finished last question, go result
      const isComplete = Object.keys(nextAnswers).length >= totalQ;
      if (isComplete) {
        return {
          ...p,
          answers: nextAnswers,
          qIndex: totalQ - 1,
          view: "RESULT",
        };
      }

      return { ...p, answers: nextAnswers, qIndex: nextIdx };
    });
  };

  const back = () => {
    setState((p) => ({ ...p, qIndex: Math.max(0, p.qIndex - 1) }));
  };

  const continueAfterMidpoint = () => setState((p) => ({ ...p, view: "SCAN" }));

  const exportText = useMemo(() => {
    const primary = diagnosis.primary;
    const protocol = PROTOCOLS[primary];
    const s = state.symptomId ? symptomLabel(state.symptomId) : "—";

    const lines: string[] = [];
    lines.push("QTMBG — SIGNAL AUDIT (DEEP)");
    lines.push(`Date: ${new Date(state.createdAtISO).toISOString()}`);
    lines.push(`Stage: ${state.stage}`);
    lines.push(`Symptom: ${s}`);
    lines.push("");
    lines.push(`Primary structural leak: ${protocol.leakName} (${forceLabel(primary)})`);
    lines.push("");
    lines.push("Meaning:");
    lines.push(protocol.meaning);
    lines.push("");
    lines.push("Root cause:");
    lines.push(protocol.rootCause);
    lines.push("");
    lines.push("Scores (0–100):");
    (Object.keys(scores) as ForceId[]).forEach((f) => lines.push(`- ${forceLabel(f)}: ${scores[f]}`));
    lines.push("");
    lines.push("24h protocol:");
    protocol.fix24h.forEach((x) => lines.push(`- ${x}`));
    lines.push("");
    lines.push("7-day protocol:");
    protocol.fix7d.forEach((x) => lines.push(`- ${x}`));
    lines.push("");
    lines.push("30-day protocol:");
    protocol.fix30d.forEach((x) => lines.push(`- ${x}`));
    lines.push("");
    lines.push("Assets:");
    protocol.assets.forEach((a) => lines.push(`- ${a.label}: ${a.href}`));
    lines.push("");
    lines.push("Next:");
    lines.push(protocol.callPitch);

    return lines.join("\n");
  }, [diagnosis.primary, scores, state.createdAtISO, state.stage, state.symptomId]);

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      alert("Copied.");
    } catch {
      alert("Copy failed. You can still download the .txt file.");
    }
  };

  const downloadExport = () => {
    const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qtmbg-signal-audit.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ====== VIEWS ======
  if (state.view === "WELCOME") {
    return (
      <AppShell>
        <div className="hero">
          <div className="kicker center">SIGNAL AUDIT</div>
          <div className="h1 center">Find the structural leak causing your symptom.</div>
          <div className="sub center">
            This is designed to feel <b>real</b> — not like a freebie.
            <br />
            You’ll run a deep scan across 5 forces and leave with a fix protocol.
          </div>
        </div>

        <Card title="Before you start">
          <div className="warm">
            <div className="warmIcon">
              <Target size={20} />
            </div>
            <div className="warmText">
              Take this as <b>honest reflection</b>, not performance.
              <div className="tiny muted" style={{ marginTop: 6 }}>
                This is a diagnostic. It does not replace a full strategic engagement.
              </div>
            </div>
          </div>

          <StagePicker value={state.stage} onChange={(s) => setState((p) => ({ ...p, stage: s }))} />

          <div className="ctaRow">
            <Btn onClick={start} icon={<ArrowRight size={16} />}>
              Start audit
            </Btn>
            <button className="link" type="button" onClick={restart}>
              Reset
            </button>
          </div>

          <div className="trust">
            <div className="trustItem">
              <CheckCircle2 size={14} />
              <span>25 signals (satisfying depth)</span>
            </div>
            <div className="trustItem">
              <CheckCircle2 size={14} />
              <span>Primary structural leak</span>
            </div>
            <div className="trustItem">
              <CheckCircle2 size={14} />
              <span>24h / 7d / 30d fix protocol</span>
            </div>
          </div>
        </Card>
      </AppShell>
    );
  }

  if (state.view === "SYMPTOM") {
    return (
      <AppShell>
        <div className="hero">
          <div className="kicker center">STEP 1</div>
          <div className="h2 center">Pick your symptom.</div>
          <div className="sub center">We’ll diagnose the leak that causes it.</div>
        </div>

        <Card title="Symptoms">
          <div className="grid">
            {SYMPTOMS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="tile"
                onClick={() => pickSymptom(s.id)}
              >
                <div className="tileTop">
                  <div className="tileTitle">{s.label}</div>
                  <ChevronRight size={18} />
                </div>
                <div className="tileDesc">{s.desc}</div>
              </button>
            ))}
          </div>

          <div className="ctaRow" style={{ marginTop: 14 }}>
            <button className="link" type="button" onClick={() => to("WELCOME")}>
              Back
            </button>
          </div>
        </Card>
      </AppShell>
    );
  }

  if (state.view === "COORDS") {
    const emailOk = !state.email || isValidEmail(state.email);

    return (
      <AppShell>
        <div className="hero">
          <div className="kicker center">STEP 2</div>
          <div className="h2 center">Operator coordinates.</div>
          <div className="sub center">
            Optional to run the audit.
            <br />
            Email is only needed if you want to export/save.
          </div>
        </div>

        <Card title="Coordinates (optional)">
          <div className="grid2">
            <Input
              label="NAME (OPTIONAL)"
              value={state.name}
              onChange={(v) => setState((p) => ({ ...p, name: v }))}
              placeholder="Your name"
            />
            <Input
              label="EMAIL (REQUIRED FOR EXPORT)"
              value={state.email}
              onChange={(v) => setState((p) => ({ ...p, email: v }))}
              placeholder="you@email.com"
              type="email"
              hint="We only require this when you export / save."
            />
          </div>

          <Input
            label="WEBSITE (OPTIONAL)"
            value={state.website}
            onChange={(v) => setState((p) => ({ ...p, website: v }))}
            placeholder="https://yoursite.com"
            type="url"
          />

          {!emailOk ? (
            <div className="warn">
              <ShieldAlert size={16} />
              <span>Please enter a valid email to use export later (or leave it empty).</span>
            </div>
          ) : null}

          <div className="ctaRow">
            <Btn onClick={beginScan} icon={<Clock size={16} />}>
              Begin deep scan
            </Btn>
            <button className="link" type="button" onClick={() => to("SYMPTOM")}>
              Back
            </button>
          </div>
        </Card>
      </AppShell>
    );
  }

  if (state.view === "MIDPOINT") {
    const sorted = (Object.keys(scores) as ForceId[])
      .map((f) => [f, scores[f]] as const)
      .sort((a, b) => a[1] - b[1]);
    const emerging = sorted[0]?.[0] ?? "essence";
    const meta = FORCES.find((f) => f.id === emerging)!;
    const Icon = meta.icon;

    return (
      <AppShell>
        <Card className="mid">
          <div className="midIcon">
            <Target size={30} />
          </div>

          <div className="midTitle">Pattern detected.</div>

          <div className="midText">
            Early signal points to a leak in <b>{meta.label}</b>.
          </div>

          <div className="midForce">
            <Icon size={18} />
            <div>
              <div className="midForceName">{meta.label}</div>
              <div className="tiny muted">{meta.micro}</div>
            </div>
          </div>

          <div className="midText small">
            Keep going — we’re confirming whether this is truly the structural bottleneck.
          </div>

          <div className="ctaRow" style={{ justifyContent: "center" }}>
            <Btn onClick={continueAfterMidpoint}>
              Continue
            </Btn>
          </div>

          <div className="tiny muted center" style={{ marginTop: 10 }}>
            Progress: {answeredCount} / {totalQ}
          </div>
        </Card>
      </AppShell>
    );
  }

  if (state.view === "SCAN") {
    const q = currentQ;
    const meta = FORCES.find((f) => f.id === q.force)!;
    const Icon = meta.icon;
    const value = state.answers[q.id];

    return (
      <AppShell>
        <div className="scanTop">
          <div className="scanLeft">
            <div className="kicker">
              {state.qIndex + 1} / {totalQ}
            </div>
            <div className="forceLine">
              <Icon size={18} />
              <div>
                <div className="forceName">{meta.label}</div>
                <div className="tiny muted">{meta.micro}</div>
              </div>
            </div>
          </div>
          <div className="scanRight">
            <button
              className="link"
              type="button"
              onClick={back}
              disabled={state.qIndex === 0}
            >
              Back
            </button>
          </div>
        </div>

        <ProgressBar current={answeredCount} total={totalQ} />

        <Card>
          <div className="qText">{q.text}</div>
          <div className="qHint">{q.hint}</div>

          <LikertRow
            value={value}
            onPick={(v) => pickLikert(q.id, v)}
          />

          <div className="tiny muted" style={{ marginTop: 12 }}>
            Tip: answer based on what your market sees today — not what you intend.
          </div>
        </Card>
      </AppShell>
    );
  }

  if (state.view === "EXPORT") {
    const canExport = !!state.email && isValidEmail(state.email);

    return (
      <AppShell>
        <div className="hero">
          <div className="kicker center">EXPORT</div>
          <div className="h2 center">Save the audit.</div>
          <div className="sub center">
            Copy it or download as a .txt file.
            <br />
            (Email required only if you want to store/send it later.)
          </div>
        </div>

        <Card title="Export">
          {!canExport ? (
            <div className="warn" style={{ marginBottom: 14 }}>
              <ShieldAlert size={16} />
              <span>
                Add a valid email in “Coordinates” if you want this stored/sent later. You can still copy/download now.
              </span>
            </div>
          ) : null}

          <div className="exportBox">
            <pre className="exportPre">{exportText}</pre>
          </div>

          <div className="ctaRow">
            <Btn onClick={copyExport} icon={<Copy size={16} />}>
              Copy
            </Btn>
            <Btn variant="secondary" onClick={downloadExport} icon={<Download size={16} />}>
              Download .txt
            </Btn>
          </div>

          <div className="ctaRow" style={{ marginTop: 14 }}>
            <button className="link" type="button" onClick={() => to("RESULT")}>
              Back to result
            </button>
          </div>
        </Card>
      </AppShell>
    );
  }

  // RESULT
  const primary = diagnosis.primary;
  const secondary = diagnosis.secondary;
  const protocol = PROTOCOLS[primary];
  const symptom = state.symptomId ? symptomLabel(state.symptomId) : "—";

  return (
    <AppShell>
      <div className="hero">
        <div className="kicker center">YOUR STRUCTURAL LEAK</div>
        <div className="h1 leak center">{protocol.leakName}</div>
        <div className="sub center">
          Symptom: <b>{symptom}</b> → Structural cause: <b>{forceLabel(primary)}</b>
        </div>
      </div>

      <Card title="What this means" right={<span className="tiny muted">Primary: {forceLabel(primary)} • Secondary: {forceLabel(secondary)}</span>}>
        <div className="panelText">{protocol.meaning}</div>

        <div className="panelTitle mt">Root cause</div>
        <div className="panelText">{protocol.rootCause}</div>
      </Card>

      <Card title="Fix protocol">
        <div className="planGrid">
          <div className="planCol">
            <div className="planTitle">24 hours</div>
            <div className="plan">
              {protocol.fix24h.map((x, i) => (
                <div key={i} className="planItem">
                  <div className="planIdx">{i + 1}</div>
                  <div className="planText">{x}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="planCol">
            <div className="planTitle">7 days</div>
            <div className="plan">
              {protocol.fix7d.map((x, i) => (
                <div key={i} className="planItem">
                  <div className="planIdx">{i + 1}</div>
                  <div className="planText">{x}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="planCol">
            <div className="planTitle">30 days</div>
            <div className="plan">
              {protocol.fix30d.map((x, i) => (
                <div key={i} className="planItem">
                  <div className="planIdx">{i + 1}</div>
                  <div className="planText">{x}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Scores">
        <div className="bars">
          {(Object.keys(scores) as ForceId[]).map((f) => {
            const pct = scores[f];
            const isPrimary = f === primary;
            const isSecondary = f === secondary;
            const tag = isPrimary ? "PRIMARY" : isSecondary ? "SECONDARY" : pct >= 80 ? "STRONG" : pct >= 55 ? "UNSTABLE" : "CRITICAL";

            return (
              <div key={f} className="barRow">
                <div className="barLeft">
                  <div className="barName">{forceLabel(f)}</div>
                  <div className={`tag ${isPrimary ? "tagHard" : isSecondary ? "tagWarn" : ""}`}>
                    {tag}
                  </div>
                </div>
                <div className="barWrap">
                  <div className="barIn" style={{ width: `${pct}%` }} />
                  <div className="barPct">{pct}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Next steps">
        <div className="panelText">{protocol.callPitch}</div>

        <div className="commit">
          <LinkBtn
            onClick={() => window.open(CALL_BOOKING_LINK, "_blank")}
            icon={<ExternalLink size={16} />}
          >
            Book a leak review call
          </LinkBtn>

          <LinkBtn
            onClick={() => window.open(KIT_LINKS[primary], "_blank")}
            icon={<ExternalLink size={16} />}
          >
            Open the Kit module for this leak
          </LinkBtn>

          <LinkBtn onClick={() => to("EXPORT")} icon={<FileIcon />}>
            Export / Save this audit
          </LinkBtn>
        </div>

        <div className="ctaRow" style={{ marginTop: 12 }}>
          <button className="link" type="button" onClick={restart}>
            <RefreshCw size={14} style={{ marginRight: 8 }} />
            New audit
          </button>
        </div>
      </Card>
    </AppShell>
  );
}

// Small inline icon (so we don't add another lucide import)
function FileIcon() {
  return (
    <span
      style={{
        width: 16,
        height: 16,
        display: "inline-block",
        border: "2px solid currentColor",
        borderTopWidth: 6,
      }}
    />
  );
}

// ====== CSS ======
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sometype+Mono:wght@400;500;600;700&display=swap');

:root{
  --bg: #ffffff;
  --paper: #ffffff;
  --ink: #0a0a0a;
  --muted: rgba(10,10,10,.62);
  --rule: rgba(10,10,10,.16);
  --rule2: rgba(10,10,10,.07);
  --margin: rgba(220, 38, 38, .25);
}

*{margin:0;padding:0;box-sizing:border-box;}

.qbg{
  min-height:100vh;
  color: var(--ink);
  font-family: 'Sometype Mono', ui-monospace, monospace;
  line-height: 1.55;
  background: var(--bg);

  /* notebook grid + left margin line */
  background-image:
    linear-gradient(to right, var(--rule2) 1px, transparent 1px),
    linear-gradient(to bottom, var(--rule2) 1px, transparent 1px),
    linear-gradient(to right, var(--margin) 2px, transparent 2px);
  background-size: 52px 52px, 52px 52px, 100% 100%;
  background-position: 0 0, 0 0, 84px 0;
}

.top{
  max-width: 1100px;
  margin: 0 auto;
  padding: 18px 20px 14px;
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap: 16px;
  border-bottom: 2px solid var(--ink);
}

.brandRow{ display:flex; align-items:center; gap: 12px; }
.brandPill{
  border: 2px solid var(--ink);
  background: var(--ink);
  color: var(--bg);
  padding: 8px 12px;
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  font-weight: 700;
}
.brandTitle{
  font-weight: 700;
  font-size: 16px;
  letter-spacing: .02em;
}
.topMeta{
  font-size: 12px;
  color: var(--muted);
}

.wrap{
  max-width: 1100px;
  margin: 0 auto;
  padding: 22px 20px 24px;
}

.foot{
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 20px 18px;
  border-top: 2px solid var(--ink);
  display:flex;
  gap: 12px;
  align-items:center;
}
.footPill{
  border: 2px solid var(--ink);
  background: var(--ink);
  color: var(--bg);
  padding: 6px 10px;
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  font-weight: 700;
}
.footText{ font-size: 12px; color: var(--muted); }

.hero{
  padding: 18px 0 14px;
  text-align:center;
}
.center{ text-align:center; }

.kicker{
  font-size: 11px;
  letter-spacing: .24em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 12px;
  font-weight: 700;
}
.h1{
  font-size: clamp(30px, 4.7vw, 60px);
  line-height: 1.04;
  letter-spacing: -0.02em;
  font-weight: 700;
}
.h2{
  font-size: clamp(24px, 3.4vw, 40px);
  line-height: 1.08;
  letter-spacing: -0.02em;
  font-weight: 700;
}
.h1.leak{
  display:inline-block;
  padding: 14px 18px;
  border: 2px solid var(--ink);
  background: var(--ink);
  color: var(--bg);
}
.sub{
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.65;
  color: rgba(10,10,10,.78);
  max-width: 820px;
  margin-left:auto;
  margin-right:auto;
}
.sub b{ color: var(--ink); font-weight: 700; }

.card{
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.86);
  padding: 18px;
  margin-bottom: 16px;
}
.cardTop{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 14px;
  margin-bottom: 14px;
}
.cardTitle{
  font-size: 11px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: rgba(10,10,10,.70);
  font-weight: 700;
}
.cardRight{ font-size: 12px; color: var(--muted); }

.field{ margin-bottom: 14px; }
.label{
  font-size: 11px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 10px;
  font-weight: 700;
}
.input{
  width: 100%;
  border: none;
  border-bottom: 2px solid var(--ink);
  background: transparent;
  padding: 12px 4px;
  font-size: 14px;
  outline: none;
  font-family: 'Sometype Mono', ui-monospace, monospace;
}
.input::placeholder{ color: rgba(10,10,10,.35); }
.hint{ margin-top: 8px; font-size: 12px; color: var(--muted); }

.grid2{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media(max-width: 820px){
  .grid2{ grid-template-columns: 1fr; }
}

.stageGrid{ display:grid; gap: 12px; }
.stage{
  border: 2px solid var(--ink);
  padding: 16px;
  background: rgba(255,255,255,.92);
  text-align:left;
  cursor:pointer;
  transition: transform .18s cubic-bezier(.4,0,.2,1);
  font-family: 'Sometype Mono', ui-monospace, monospace;
}
.stage:hover{ transform: translateY(-2px); }
.stage.active{
  background: var(--ink);
  color: var(--bg);
}
.stageTitle{ font-weight: 700; font-size: 16px; }
.tiny{ font-size: 12px; line-height: 1.4; }
.small{ font-size: 13px; line-height: 1.6; }
.muted{ color: var(--muted); }

.btn{
  border: 2px solid var(--ink);
  padding: 14px 18px;
  display:inline-flex;
  align-items:center;
  gap: 12px;
  cursor:pointer;
  transition: transform .18s cubic-bezier(.4,0,.2,1);
  text-transform: uppercase;
  letter-spacing: .18em;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Sometype Mono', ui-monospace, monospace;
}
.btn.primary{ background: var(--ink); color: var(--bg); }
.btn.secondary{ background: rgba(255,255,255,.92); color: var(--ink); }
.btn:hover{ transform: translateY(-2px); }
.btn.disabled{ opacity: .35; cursor:not-allowed; transform:none; }
.btnText{ transform: translateY(0.5px); }

.link{
  background: transparent;
  border: none;
  padding: 0;
  color: var(--muted);
  text-decoration: underline;
  cursor: pointer;
  font-family: 'Sometype Mono', ui-monospace, monospace;
  font-size: 12px;
}
.link:disabled{ opacity:.4; cursor:not-allowed; }

.ctaRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 14px;
  flex-wrap:wrap;
}

.trust{
  display:flex;
  gap: 18px;
  margin-top: 14px;
  flex-wrap:wrap;
}
.trustItem{
  display:flex;
  align-items:center;
  gap: 8px;
  font-size: 12px;
  color: rgba(10,10,10,.75);
}

.grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media(max-width: 820px){
  .grid{ grid-template-columns: 1fr; }
}
.tile{
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.92);
  padding: 14px;
  cursor:pointer;
  text-align:left;
  transition: transform .18s cubic-bezier(.4,0,.2,1);
  font-family: 'Sometype Mono', ui-monospace, monospace;
}
.tile:hover{ transform: translateY(-2px); }
.tileTop{ display:flex; align-items:center; justify-content:space-between; gap: 12px; }
.tileTitle{ font-weight: 700; letter-spacing: .06em; }
.tileDesc{ margin-top: 8px; font-size: 13px; color: rgba(10,10,10,.72); line-height: 1.55; }

.warm{
  display:flex;
  gap: 12px;
  align-items:flex-start;
  border: 2px solid rgba(10,10,10,.35);
  background: rgba(255,255,255,.72);
  padding: 12px;
  margin-bottom: 14px;
}
.warmIcon{
  width: 40px;
  height: 40px;
  border: 2px solid var(--ink);
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}
.warmText{ font-size: 13px; line-height: 1.6; color: rgba(10,10,10,.78); }

.warn{
  display:flex;
  align-items:flex-start;
  gap: 10px;
  border: 2px solid rgba(10,10,10,.35);
  background: rgba(255,255,255,.76);
  padding: 12px;
  font-size: 12px;
  color: rgba(10,10,10,.75);
}

.scanTop{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 14px;
  margin-bottom: 10px;
}
.forceLine{
  display:flex;
  gap: 12px;
  align-items:flex-start;
}
.forceName{
  font-weight: 700;
  letter-spacing: .14em;
  font-size: 14px;
}

.progress{
  width:100%;
  height: 3px;
  background: rgba(10,10,10,.18);
  overflow:hidden;
  margin-bottom: 16px;
}
.progressIn{
  height: 3px;
  background: var(--ink);
  transition: width .25s cubic-bezier(.4,0,.2,1);
}

.qText{
  font-size: 22px;
  line-height: 1.35;
  letter-spacing: -0.01em;
  font-weight: 700;
  margin-bottom: 10px;
}
.qHint{
  font-size: 13px;
  color: rgba(10,10,10,.66);
  line-height: 1.55;
  margin-bottom: 14px;
  border-left: 2px solid rgba(10,10,10,.35);
  padding-left: 12px;
}

.likert{
  display:grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 6px;
}
.likertBtn{
  width:100%;
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.92);
  padding: 12px;
  cursor:pointer;
  display:flex;
  align-items:center;
  gap: 12px;
  text-align:left;
  font-family: 'Sometype Mono', ui-monospace, monospace;
  transition: transform .18s cubic-bezier(.4,0,.2,1);
}
.likertBtn:hover{ transform: translateY(-2px); }
.likertBtn.active{
  background: var(--ink);
  color: var(--bg);
}
.likertDot{
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
}
.likertLabel{ font-size: 13px; }

.mid{
  text-align:center;
  padding: 22px;
}
.midIcon{
  width: 64px;
  height: 64px;
  margin: 0 auto 14px;
  border: 2px solid var(--ink);
  display:flex;
  align-items:center;
  justify-content:center;
}
.midTitle{ font-size: 28px; font-weight: 800; margin-bottom: 10px; }
.midText{ font-size: 14px; color: rgba(10,10,10,.78); line-height: 1.65; }
.midForce{
  display:inline-flex;
  gap: 12px;
  align-items:center;
  padding: 12px 14px;
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.92);
  margin: 14px 0 12px;
}
.midForceName{ font-weight: 800; letter-spacing: .12em; }

.panelTitle{
  font-size: 11px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: rgba(10,10,10,.65);
  font-weight: 800;
  margin-bottom: 10px;
}
.panelText{
  font-size: 13px;
  line-height: 1.65;
  color: rgba(10,10,10,.78);
}
.mt{ margin-top: 16px; }

.planGrid{
  display:grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media(min-width: 980px){
  .planGrid{ grid-template-columns: 1fr 1fr 1fr; }
}
.planTitle{
  font-size: 11px;
  letter-spacing: .22em;
  text-transform: uppercase;
  font-weight: 800;
  margin-bottom: 10px;
  color: rgba(10,10,10,.70);
}
.plan{ display:flex; flex-direction:column; gap: 10px; }
.planItem{
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.72);
  padding: 12px;
  display:grid;
  grid-template-columns: 46px 1fr;
  gap: 12px;
  align-items:start;
}
.planIdx{
  border: 2px solid var(--ink);
  width: 46px;
  height: 34px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight: 800;
}
.planText{ font-size: 12px; line-height: 1.6; color: var(--ink); }

.bars{ display:flex; flex-direction:column; gap: 12px; }
.barRow{ display:flex; flex-direction:column; gap: 8px; }
.barLeft{ display:flex; align-items:center; justify-content:space-between; gap: 10px; }
.barName{ font-size: 12px; letter-spacing: .14em; font-weight: 800; }
.tag{
  font-size: 9px;
  letter-spacing: .22em;
  text-transform: uppercase;
  font-weight: 800;
  color: rgba(10,10,10,.45);
}
.tagHard{
  color: var(--bg);
  background: var(--ink);
  padding: 4px 8px;
  border: 2px solid var(--ink);
}
.tagWarn{
  color: var(--ink);
  background: rgba(10,10,10,.06);
  padding: 4px 8px;
  border: 2px solid rgba(10,10,10,.25);
}
.barWrap{
  position:relative;
  border: 2px solid var(--ink);
  height: 26px;
  background: rgba(255,255,255,.92);
  overflow:hidden;
}
.barIn{
  height:100%;
  background: var(--ink);
  transition: width .45s cubic-bezier(.4,0,.2,1);
}
.barPct{
  position:absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 900;
  color: var(--bg);
  mix-blend-mode: difference;
}

.commit{
  display:flex;
  flex-direction:column;
  gap: 10px;
  margin-top: 12px;
}
.linkBtn{
  border: 2px solid rgba(10,10,10,.35);
  background: rgba(255,255,255,.92);
  padding: 12px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
  cursor:pointer;
  text-align:left;
  font-family: 'Sometype Mono', ui-monospace, monospace;
  transition: transform .18s cubic-bezier(.4,0,.2,1);
}
.linkBtn:hover{ transform: translateY(-2px); border-color: var(--ink); }
.linkBtn span{ flex:1; font-size: 13px; font-weight: 800; }

.exportBox{
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.92);
  padding: 12px;
  max-height: 360px;
  overflow:auto;
}
.exportPre{
  white-space: pre-wrap;
  font-size: 12px;
  line-height: 1.6;
}
` as const;
