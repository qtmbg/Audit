import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Copy,
  Download,
  ExternalLink,
  FileText,
  RefreshCw,
  Calendar,
  ShieldAlert,
} from "lucide-react";

/**
 * QTMBG — DEEP SIGNAL AUDIT (Notebook) v2.0 (TSX)
 * Goal:
 * - Benchmark-level freebie depth (Liven-style stepper: fast taps, many steps, real output)
 * - No email gate to see results (email only for export/save)
 * - Primary conversion: BOOK CALL
 * - Accept prefill from Signal via query params
 */

type ForceId = "essence" | "identity" | "offer" | "system" | "growth";
type StageId = "launch" | "reposition" | "scale";
type StepKind = "INTRO" | "ORIENT" | "FLOW" | "PROCESSING" | "REPORT";

type SymptomId =
  | "price_resistance"
  | "ghosting"
  | "wrong_fit"
  | "feast_famine"
  | "invisibility"
  | "low_conversion"
  | "no_demand";

type Scale = 1 | 2 | 3 | 4 | 5;

type FlowStep =
  | { id: "symptom"; kind: "pick"; title: string; sub: string }
  | { id: "stage"; kind: "pick"; title: string; sub: string }
  | { id: "revenue"; kind: "pick"; title: string; sub: string }
  | { id: "channel"; kind: "pick"; title: string; sub: string }
  | { id: "cta"; kind: "pick"; title: string; sub: string }
  | {
      id: string;
      kind: "scale";
      force: ForceId;
      title: string;
      sub: string;
      q: string;
    }
  | {
      id: string;
      kind: "interstitial";
      force: ForceId;
      title: string;
      sub: string;
    };

const STORAGE_KEY = "qtmbg-deep-audit-v2";

/** Optional soft capture endpoint (keep or replace) */
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzaE2j8Udf13HDx14c7-kJIaqTuSGzJoxRRxgKUH7rjMTE47GpT2G-Fl7NfpDL-q9B_dw/exec";

/** Configure your booking link here */
const BOOK_CALL_URL = "https://qtmbg.com/booking"; // replace with your real link
const MRI_URL = "https://www.qtmbg.com/mri";
const KIT_LINKS: Record<ForceId, string> = {
  essence: "https://www.qtmbg.com/kit#module-1",
  identity: "https://www.qtmbg.com/kit#module-2",
  offer: "https://www.qtmbg.com/kit#module-3",
  system: "https://www.qtmbg.com/kit#module-4",
  growth: "https://www.qtmbg.com/kit#module-5",
};

const FORCES: Array<{ id: ForceId; label: string; micro: string }> = [
  { id: "essence", label: "ESSENCE", micro: "Truth, belief, enemy, mechanism" },
  { id: "identity", label: "IDENTITY", micro: "Authority, language, coherence" },
  { id: "offer", label: "OFFER", micro: "Promise, structure, friction, proof" },
  { id: "system", label: "SYSTEM", micro: "Path, capture, nurture, close" },
  { id: "growth", label: "GROWTH", micro: "Throughput, leverage, compounding" },
];

const STAGES: Array<{ id: StageId; label: string; sub: string }> = [
  { id: "launch", label: "Launching", sub: "Building first demand + first offers" },
  { id: "reposition", label: "Repositioning", sub: "Good product, unclear signal or audience" },
  { id: "scale", label: "Scaling", sub: "You need throughput, not more hustle" },
];

const SYMPTOMS: Array<{ id: SymptomId; label: string; desc: string }> = [
  { id: "price_resistance", label: "PRICE RESISTANCE", desc: "People hesitate, negotiate, ask “why so expensive?”" },
  { id: "ghosting", label: "GHOSTING", desc: "Interest → silence. Trust breaks mid-path." },
  { id: "wrong_fit", label: "WRONG FIT", desc: "You attract the wrong buyers and waste time." },
  { id: "feast_famine", label: "FEAST / FAMINE", desc: "Revenue spikes and dips. No control." },
  { id: "invisibility", label: "INVISIBILITY", desc: "Work is good, market response is weak." },
  { id: "low_conversion", label: "LOW CONVERSION", desc: "Traffic exists, but calls/sales don’t happen." },
  { id: "no_demand", label: "NO DEMAND", desc: "You post, you try, market doesn’t react." },
];

const REVENUE_BANDS = [
  { id: "pre", label: "Pre-revenue", sub: "Validating offer + signal" },
  { id: "lt50", label: "< $50k / year", sub: "Early pipeline + positioning" },
  { id: "50_250", label: "$50k–$250k / year", sub: "Stabilize acquisition + close" },
  { id: "250_1m", label: "$250k–$1M / year", sub: "Systemize + scale levers" },
  { id: "gt1m", label: "$1M+ / year", sub: "Compounding, leverage, team" },
] as const;

const CHANNELS = [
  { id: "social", label: "Social", sub: "IG / TikTok / X / LinkedIn" },
  { id: "ads", label: "Paid Ads", sub: "Meta / Google / YouTube" },
  { id: "seo", label: "SEO", sub: "Search + content moat" },
  { id: "partners", label: "Partnerships", sub: "Borrow audiences" },
  { id: "referral", label: "Referrals", sub: "Clients + network" },
] as const;

const PRIMARY_CTA = [
  { id: "book", label: "Book calls", sub: "High-ticket / consultative close" },
  { id: "checkout", label: "Direct checkout", sub: "Productized / ecommerce / paid offer page" },
  { id: "dm", label: "DM close", sub: "Inbound conversations" },
  { id: "email", label: "Email nurture", sub: "List → conversion" },
] as const;

/**
 * Deep audit questions:
 * Keep it “fast taps” but many steps (benchmark feel).
 * 5 forces × 4 questions = 20
 * + 4–5 triage = ~25
 * + 1–2 interstitial = ~27
 */
const FORCE_QUESTIONS: Record<ForceId, Array<{ id: string; q: string; sub: string }>> = {
  essence: [
    { id: "e1", q: "My message attacks a specific status-quo belief.", sub: "Not “tips”. A worldview with an enemy." },
    { id: "e2", q: "I can explain my transformation in one sentence.", sub: "WHO → OUTCOME → MECHANISM → TIME." },
    { id: "e3", q: "People feel what I stand for in 10 seconds.", sub: "Bio + hero + first scroll." },
    { id: "e4", q: "My content creates desire, not just information.", sub: "It makes the buyer want the “after”." },
  ],
  identity: [
    { id: "i1", q: "My website + socials feel like one universe.", sub: "Same tone, same visual authority, same signal." },
    { id: "i2", q: "My proof stack is visible and specific.", sub: "Numbers, constraints, screenshots, examples." },
    { id: "i3", q: "I own words competitors don’t use.", sub: "Distinct language = distinct category position." },
    { id: "i4", q: "My assets look expensive (restraint + focus).", sub: "Not “nice”. Premium." },
  ],
  offer: [
    { id: "o1", q: "My offer is one primary path, not a menu.", sub: "One flagship CTA." },
    { id: "o2", q: "My promise is measurable and believable.", sub: "Clear outcome + mechanism + boundary." },
    { id: "o3", q: "The buyer understands price quickly.", sub: "They see value before they see cost." },
    { id: "o4", q: "Risk is handled (proof / guarantee / constraint).", sub: "They feel safe saying yes." },
  ],
  system: [
    { id: "s1", q: "I have one clear ‘happy path’ from viewer → sale.", sub: "No wandering. No dead ends." },
    { id: "s2", q: "Capture is clean (lead magnet / audit / form).", sub: "You collect intent properly." },
    { id: "s3", q: "Nurture exists (email / retargeting / follow-up).", sub: "Interest doesn’t die." },
    { id: "s4", q: "Sales process is designed, not improvised.", sub: "Filter → frame → close." },
  ],
  growth: [
    { id: "g1", q: "I dominate one channel for 30 days.", sub: "Not mediocre on four." },
    { id: "g2", q: "I publish one compounding asset weekly.", sub: "A signal asset, not random posting." },
    { id: "g3", q: "I borrow audiences (partners / podcasts / hosts).", sub: "Distribution leverage." },
    { id: "g4", q: "Referrals or repeats happen reliably.", sub: "Compounding economics." },
  ],
};

const FORCE_PLANS: Record<
  ForceId,
  {
    leakName: string;
    whyItHurts: string[];
    today: string;
    week: string[];
    month: string[];
    callAngle: string;
  }
> = {
  essence: {
    leakName: "ESSENCE LEAK",
    whyItHurts: [
      "You blend in because nothing ‘sharp’ is being attacked.",
      "Your content informs, but doesn’t create desire.",
      "Buyers can’t repeat your message to others.",
    ],
    today: "Write your one-line thesis: WHO → AFTER → MECHANISM → TIME. Remove jargon.",
    week: [
      "Publish 1 contrarian claim you can defend.",
      "Rewrite bio + hero to sell a belief (not a résumé).",
      "Build one ‘enemy list’: what you refuse in your category.",
    ],
    month: [
      "Create 1 signature signal asset (framework, test, or diagnostic).",
      "Turn the thesis into a 5-part content series.",
      "Install a single CTA that matches the belief.",
    ],
    callAngle: "We confirm your thesis + build a precise message system in 30 minutes.",
  },
  identity: {
    leakName: "IDENTITY LEAK",
    whyItHurts: [
      "People don’t trust what looks generic.",
      "Authority doesn’t carry across touchpoints.",
      "Proof exists, but is not visible.",
    ],
    today: "Add a proof block to the first screen: 3 specifics (numbers / constraints / examples).",
    week: [
      "Unify website + socials: one grid, one font, one tone.",
      "Define 3 words you own and remove the rest.",
      "Replace stock/template visuals with your signature system.",
    ],
    month: [
      "Build a ‘Proof Library’ page or section.",
      "Produce 5 consistent assets (carousel, video style, offer one-pager).",
      "Refactor your homepage to feel premium (restraint + focus).",
    ],
    callAngle: "We turn your current assets into one coherent authority universe.",
  },
  offer: {
    leakName: "OFFER LEAK",
    whyItHurts: [
      "Buyers are confused or skeptical: they don’t see the mechanism.",
      "Price feels arbitrary because value isn’t structured.",
      "Your CTA is competing with itself.",
    ],
    today: "Collapse to one flagship path + one promise + one CTA.",
    week: [
      "Rewrite promise as: Outcome + Mechanism + Boundary.",
      "Add risk reversal: proof + constraint + clear deliverables.",
      "Build a simple pricing logic: transformation, not time.",
    ],
    month: [
      "Create a ‘How it works’ page with a 6-step journey.",
      "Ship one case-style breakdown (before/after + method).",
      "Install one checkout or call funnel with zero confusion.",
    ],
    callAngle: "We rebuild the offer so price feels obvious and clean.",
  },
  system: {
    leakName: "SYSTEM LEAK",
    whyItHurts: [
      "Interest leaks because follow-up doesn’t exist.",
      "The buyer doesn’t know what happens next.",
      "Closing depends on your mood, not a designed path.",
    ],
    today: "Map the 6-step path: Viewer → Lead → Call → Close → Onboard → Referral.",
    week: [
      "Install capture + one nurture email sequence (3 emails).",
      "Add one filter question to repel wrong fits.",
      "Standardize your call close script: frame → diagnose → prescribe → commit.",
    ],
    month: [
      "Build a ‘Revenue Router’ board (weekly ritual).",
      "Set retargeting or reminder loop for non-buyers.",
      "Add referral ask into onboarding.",
    ],
    callAngle: "We stop the leaks and install a predictable conversion path.",
  },
  growth: {
    leakName: "GROWTH LEAK",
    whyItHurts: [
      "You’re not compounding; you’re restarting weekly.",
      "Distribution is fragmented.",
      "Referrals/repeats aren’t engineered.",
    ],
    today: "Pick one channel to dominate for 30 days. Remove the rest temporarily.",
    week: [
      "Ship one compounding asset (test, tool, guide, case).",
      "Borrow an audience: 10 outreach messages to hosts/partners.",
      "Define one metric to win weekly (qualified leads or close rate).",
    ],
    month: [
      "Build a simple referral system (ask + incentive + prompt).",
      "Create a weekly publishing ritual.",
      "Turn your best content into a reusable asset ladder.",
    ],
    callAngle: "We choose the leverage channel + design your compounding loop.",
  },
};

type State = {
  step: StepKind;
  flowIndex: number;
  createdAtISO: string;
  submitted: boolean;

  // Operator
  name: string;
  email: string;
  website: string;

  // Triage
  symptomId: SymptomId | null;
  stage: StageId;
  revenueBand: typeof REVENUE_BANDS[number]["id"] | null;
  channel: typeof CHANNELS[number]["id"] | null;
  primaryCta: typeof PRIMARY_CTA[number]["id"] | null;

  // Answers
  scale: Record<string, Scale>; // questionId -> 1..5
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function isValidEmail(email: string) {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    String(email).toLowerCase()
  );
}

function safeJsonParse<T>(raw: string | null): T | null {
  try {
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function emptyState(): State {
  return {
    step: "INTRO",
    flowIndex: 0,
    createdAtISO: new Date().toISOString(),
    submitted: false,

    name: "",
    email: "",
    website: "",

    symptomId: null,
    stage: "launch",
    revenueBand: null,
    channel: null,
    primaryCta: null,

    scale: {},
  };
}

function loadState(): State | null {
  if (typeof window === "undefined") return null;
  return safeJsonParse<State>(localStorage.getItem(STORAGE_KEY));
}

function saveState(s: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

function readQueryPrefill(): Partial<State> {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);

  const stage = sp.get("stage") as StageId | null;
  const name = sp.get("name");
  const email = sp.get("email");
  const website = sp.get("website");
  const symptom = sp.get("symptom") as SymptomId | null;

  const out: Partial<State> = {};
  if (stage && ["launch", "reposition", "scale"].includes(stage)) out.stage = stage;
  if (name) out.name = name;
  if (email) out.email = email;
  if (website) out.website = website;
  if (symptom) out.symptomId = symptom;

  return out;
}

async function submitData(payload: {
  name: string;
  email: string;
  website: string;
  symptomId: SymptomId | null;
  stage: StageId;
  bottleneck: ForceId;
  pct: number;
}) {
  try {
    const body = new URLSearchParams({
      payload: JSON.stringify({
        app: "QTMBG_DEEP_AUDIT_V2",
        ts: new Date().toISOString(),
        ...payload,
      }),
    });

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    return true;
  } catch {
    return false;
  }
}

function AppShell({
  children,
  rightMeta,
}: {
  children: React.ReactNode;
  rightMeta?: string;
}) {
  return (
    <div className="qbg">
      <style>{CSS}</style>

      <header className="top">
        <div className="brandRow">
          <div className="brandPill">QUANTUM BRANDING</div>
          <div className="brandTitle">Signal Audit</div>
        </div>
        <div className="topMeta">{rightMeta || "~8–10 min • ~27 steps • bottleneck + execution plan"}</div>
      </header>

      <main className="wrap">{children}</main>

      <footer className="foot">
        <div className="footPill">QTMbg</div>
        <div className="footText">Deep free audit. Built to convert insight into execution.</div>
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
  variant?: "primary" | "secondary" | "ghost";
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

function MiniInput({
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
  placeholder: string;
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
        autoComplete="off"
      />
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

function Progress({ idx, total }: { idx: number; total: number }) {
  const pct = clamp((idx / total) * 100, 0, 100);
  return (
    <div className="progress">
      <div className="progressIn" style={{ width: `${pct}%` }} />
    </div>
  );
}

function pillForScore(pct: number) {
  if (pct < 55) return { label: "CRITICAL", cls: "bad" as const };
  if (pct < 70) return { label: "WEAK", cls: "mid" as const };
  return { label: "STABLE", cls: "good" as const };
}

function formatPct(n: number) {
  return `${Math.round(n)}%`;
}

function buildFlow(): FlowStep[] {
  const steps: FlowStep[] = [
    { id: "symptom", kind: "pick", title: "Pick the symptom.", sub: "We’ll find the structural leak behind it." },
    { id: "stage", kind: "pick", title: "Your stage.", sub: "So the plan fits your reality." },
    { id: "revenue", kind: "pick", title: "Revenue band.", sub: "Benchmarks + sequencing depend on this." },
    { id: "channel", kind: "pick", title: "Primary channel.", sub: "Where the signal must carry." },
    { id: "cta", kind: "pick", title: "Primary conversion goal.", sub: "What you want people to do next." },
  ];

  // Force blocks: 4 questions each + interstitial after each force
  (Object.keys(FORCE_QUESTIONS) as ForceId[]).forEach((force) => {
    const list = FORCE_QUESTIONS[force];
    list.forEach((q, i) => {
      steps.push({
        id: `${force}_${q.id}`,
        kind: "scale",
        force,
        title: `FORCE — ${FORCES.find((f) => f.id === force)!.label}`,
        sub: FORCES.find((f) => f.id === force)!.micro,
        q: q.q,
      });
      // sprinkle micro-reassurance like benchmark
      if (i === 1) {
        steps.push({
          id: `${force}_pause_${i}`,
          kind: "interstitial",
          force,
          title: "Quick calibration.",
          sub: "Answer instinctively. This works because it’s directional and behavioral.",
        });
      }
    });
  });

  return steps;
}

export default function App() {
  const [state, setState] = useState<State>(() => {
    const saved = loadState();
    const base = saved || emptyState();
    const prefill = readQueryPrefill();
    return { ...base, ...prefill };
  });

  useEffect(() => saveState(state), [state]);

  const flow = useMemo(() => buildFlow(), []);
  const totalFlow = flow.length;

  const symptom = useMemo(
    () => SYMPTOMS.find((s) => s.id === state.symptomId) || null,
    [state.symptomId]
  );

  const score = useMemo(() => {
    const perForce: Record<ForceId, { raw: number; max: number; pct: number }> = {
      essence: { raw: 0, max: 0, pct: 0 },
      identity: { raw: 0, max: 0, pct: 0 },
      offer: { raw: 0, max: 0, pct: 0 },
      system: { raw: 0, max: 0, pct: 0 },
      growth: { raw: 0, max: 0, pct: 0 },
    };

    (Object.keys(FORCE_QUESTIONS) as ForceId[]).forEach((f) => {
      FORCE_QUESTIONS[f].forEach((q) => {
        const key = `${f}_${q.id}`;
        const v = state.scale[key];
        perForce[f].max += 5;
        perForce[f].raw += v ? v : 0;
      });
      perForce[f].pct = perForce[f].max ? (perForce[f].raw / perForce[f].max) * 100 : 0;
    });

    const bottleneck = (Object.keys(perForce) as ForceId[]).reduce((worst, f) => {
      return perForce[f].pct < perForce[worst].pct ? f : worst;
    }, "essence" as ForceId);

    const overall =
      (perForce.essence.pct +
        perForce.identity.pct +
        perForce.offer.pct +
        perForce.system.pct +
        perForce.growth.pct) /
      5;

    return { perForce, bottleneck, overall };
  }, [state.scale]);

  const reset = () => {
    if (confirm("Reset this audit?")) {
      localStorage.removeItem(STORAGE_KEY);
      setState({ ...emptyState(), ...readQueryPrefill() });
    }
  };

  const start = () => setState((s) => ({ ...s, step: "ORIENT" }));
  const beginFlow = () => setState((s) => ({ ...s, step: "FLOW", flowIndex: 0 }));

  const back = () => {
    setState((s) => ({ ...s, flowIndex: Math.max(0, s.flowIndex - 1) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => {
    if (state.flowIndex < totalFlow - 1) {
      setState((s) => ({ ...s, flowIndex: s.flowIndex + 1 }));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Done
    setState((s) => ({ ...s, step: "PROCESSING" }));
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Soft submit if email is valid (only if they already provided it)
    const hasValidEmail = isValidEmail(state.email.trim());
    if (hasValidEmail && !state.submitted) {
      void submitData({
        name: state.name.trim(),
        email: state.email.trim(),
        website: state.website.trim(),
        symptomId: state.symptomId,
        stage: state.stage,
        bottleneck: score.bottleneck,
        pct: Math.round(score.overall),
      }).then((ok) => {
        if (ok) setState((s) => ({ ...s, submitted: true }));
      });
    }

    setTimeout(() => setState((s) => ({ ...s, step: "REPORT" })), 800);
  };

  const setPick = (id: FlowStep["id"], value: string) => {
    setState((s) => {
      if (id === "symptom") return { ...s, symptomId: value as SymptomId, flowIndex: s.flowIndex + 1 };
      if (id === "stage") return { ...s, stage: value as StageId, flowIndex: s.flowIndex + 1 };
      if (id === "revenue") return { ...s, revenueBand: value as any, flowIndex: s.flowIndex + 1 };
      if (id === "channel") return { ...s, channel: value as any, flowIndex: s.flowIndex + 1 };
      if (id === "cta") return { ...s, primaryCta: value as any, flowIndex: s.flowIndex + 1 };
      return s;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setScale = (qid: string, v: Scale) => {
    setState((s) => ({
      ...s,
      scale: { ...s.scale, [qid]: v },
      flowIndex: s.flowIndex + 1,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requireEmailForExport = () => {
    if (!state.name.trim()) {
      alert("Add your name to label the file.");
      return false;
    }
    if (!isValidEmail(state.email.trim())) {
      alert("Enter a valid email to export/save.");
      return false;
    }
    return true;
  };

  const copySummary = async () => {
    const lines: string[] = [];
    lines.push("QTMBG — DEEP SIGNAL AUDIT SUMMARY");
    lines.push(`Date: ${new Date(state.createdAtISO).toLocaleString()}`);
    if (state.name.trim()) lines.push(`Name: ${state.name.trim()}`);
    if (state.website.trim()) lines.push(`Website: ${state.website.trim()}`);
    if (symptom) lines.push(`Symptom: ${symptom.label}`);
    lines.push(`Stage: ${String(state.stage).toUpperCase()}`);
    lines.push(`Overall score: ${formatPct(score.overall)}`);
    lines.push(`Primary bottleneck: ${String(score.bottleneck).toUpperCase()}`);
    lines.push("");
    lines.push("Force breakdown:");
    (Object.keys(score.perForce) as ForceId[]).forEach((f) => {
      lines.push(`- ${String(f).toUpperCase()}: ${formatPct(score.perForce[f].pct)}`);
    });
    lines.push("");
    lines.push("Next plan:");
    const p = FORCE_PLANS[score.bottleneck];
    lines.push(`Today: ${p.today}`);
    lines.push("7 days:");
    p.week.forEach((w) => lines.push(`- ${w}`));
    lines.push("30 days:");
    p.month.forEach((m) => lines.push(`- ${m}`));
    lines.push("");
    lines.push(`Book call: ${BOOK_CALL_URL}`);

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      alert("Copied.");
    } catch {
      alert("Copy failed (browser permission).");
    }
  };

  const generatePDF = () => {
    if (!requireEmailForExport()) return;

    const doc = new jsPDF();
    const pageW = 210;
    const pageH = 297;
    const margin = 14;
    const contentW = pageW - margin * 2;

    const drawHeader = (title: string) => {
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageW, pageH, "F");

      doc.setDrawColor(20, 20, 20);
      doc.setLineWidth(0.4);
      doc.rect(margin, 12, contentW, 14);

      doc.setFont("courier", "bold");
      doc.setFontSize(10);
      doc.text("QUANTUM BRANDING — DEEP SIGNAL AUDIT", margin + 4, 21);

      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      doc.text(new Date().toLocaleDateString(), pageW - margin - 24, 21);

      doc.setFont("courier", "bold");
      doc.setFontSize(16);
      doc.text(title, margin, 42);

      doc.setLineWidth(0.3);
      doc.line(margin, 48, pageW - margin, 48);
    };

    const bottleneck = score.bottleneck;
    const plan = FORCE_PLANS[bottleneck];
    const symptomLabel = symptom?.label || "—";

    // Page 1
    drawHeader("REPORT");

    doc.setFont("courier", "normal");
    doc.setFontSize(10);

    let y = 60;
    doc.text(`Name: ${state.name.trim()}`, margin, y);
    y += 8;
    doc.text(`Email: ${state.email.trim()}`, margin, y);
    y += 8;
    doc.text(`Website: ${state.website.trim() || "—"}`, margin, y);
    y += 8;
    doc.text(`Symptom: ${symptomLabel}`, margin, y);
    y += 8;
    doc.text(`Stage: ${String(state.stage).toUpperCase()}`, margin, y);
    y += 14;

    doc.setFont("courier", "bold");
    doc.setFontSize(26);
    doc.text(`${Math.round(score.overall)}%`, margin, y);
    y += 14;

    doc.setFont("courier", "bold");
    doc.setFontSize(12);
    doc.text(`Primary bottleneck: ${String(bottleneck).toUpperCase()}`, margin, y);
    y += 10;

    doc.setFont("courier", "normal");
    doc.setFontSize(10);

    // Breakdown box
    doc.setLineWidth(0.35);
    doc.rect(margin, y, contentW, 44);

    let by = y + 10;
    (Object.keys(score.perForce) as ForceId[]).forEach((f) => {
      doc.text(`${String(f).toUpperCase()}: ${Math.round(score.perForce[f].pct)}%`, margin + 4, by);
      by += 8;
    });

    y += 56;

    doc.setFont("courier", "bold");
    doc.text("WHY THIS HURTS", margin, y);
    y += 8;

    doc.setFont("courier", "normal");
    const whyLines = plan.whyItHurts.flatMap((w) => doc.splitTextToSize(`- ${w}`, contentW));
    doc.text(whyLines, margin, y);
    y += whyLines.length * 6 + 6;

    doc.setFont("courier", "bold");
    doc.text("EXECUTION PLAN", margin, y);
    y += 8;

    doc.setFont("courier", "normal");
    const todayLines = doc.splitTextToSize(`Today: ${plan.today}`, contentW);
    doc.text(todayLines, margin, y);
    y += todayLines.length * 6 + 4;

    doc.setFont("courier", "bold");
    doc.text("7 DAYS", margin, y);
    y += 8;

    doc.setFont("courier", "normal");
    plan.week.forEach((w) => {
      const lines = doc.splitTextToSize(`- ${w}`, contentW);
      doc.text(lines, margin, y);
      y += lines.length * 6 + 2;
    });

    doc.setFont("courier", "bold");
    doc.text("30 DAYS", margin, y);
    y += 8;

    doc.setFont("courier", "normal");
    plan.month.forEach((m) => {
      const lines = doc.splitTextToSize(`- ${m}`, contentW);
      doc.text(lines, margin, y);
      y += lines.length * 6 + 2;
    });

    doc.setFont("courier", "bold");
    doc.text("BOOK A LEAK REVIEW", margin, 280);
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.text(BOOK_CALL_URL, margin, 287);

    const file = `QTMBG_DEEP_AUDIT_${state.name.trim().replace(/\s+/g, "_").toUpperCase()}.pdf`;
    doc.save(file);
  };

  const openFixLink = () => {
    const url = KIT_LINKS[score.bottleneck];
    window.open(url, "_blank", "noreferrer");
  };

  const openCall = () => {
    window.open(BOOK_CALL_URL, "_blank", "noreferrer");
  };

  const openMRI = () => {
    window.open(MRI_URL, "_blank", "noreferrer");
  };

  // -------------------- VIEWS --------------------

  if (state.step === "INTRO") {
    return (
      <AppShell rightMeta="~8–10 min • ~27 steps • bottleneck + execution plan">
        <div className="hero">
          <div className="kicker">SIGNAL AUDIT</div>
          <h1 className="h1">Find the structural leak causing your symptom.</h1>
          <p className="sub">
            This is a deeper free audit. Fast taps, real output.
            <br />
            <span className="subStrong">No email required to see results.</span>
          </p>
        </div>

        <Card title="Operator coordinates (optional to start)">
          <div className="grid2">
            <MiniInput
              label="Name"
              value={state.name}
              onChange={(v) => setState((s) => ({ ...s, name: v }))}
              placeholder="Your name"
            />
            <MiniInput
              label="Email (required for export)"
              value={state.email}
              onChange={(v) => setState((s) => ({ ...s, email: v }))}
              placeholder="you@email.com"
              type="email"
              hint="Only required if you export / save."
            />
          </div>

          <MiniInput
            label="Website (optional)"
            value={state.website}
            onChange={(v) => setState((s) => ({ ...s, website: v }))}
            placeholder="https://yoursite.com"
            type="url"
          />

          <div className="actionsRow">
            <Btn variant="primary" onClick={start} icon={<ChevronRight size={16} />}>
              Start Audit
            </Btn>
            <Btn variant="secondary" onClick={openCall} icon={<Calendar size={16} />}>
              Book a 15-min leak review
            </Btn>
          </div>

          <div className="note">
            You can run the audit without giving email. Email only unlocks export.
          </div>
        </Card>
      </AppShell>
    );
  }

  if (state.step === "ORIENT") {
    return (
      <AppShell rightMeta="~8–10 min • ~27 steps • bottleneck + execution plan">
        <Card title="Before you start" right={<div className="pillMini">READ</div>}>
          <div className="bullets">
            <div className="bullet">
              <CheckCircle2 size={16} />
              <div>
                <div className="bTitle">This is a diagnostic, not therapy.</div>
                <div className="bSub">You’ll get an accurate direction + a real execution plan.</div>
              </div>
            </div>
            <div className="bullet">
              <CheckCircle2 size={16} />
              <div>
                <div className="bTitle">Answer instinctively.</div>
                <div className="bSub">The audit works because it measures behaviors, not opinions.</div>
              </div>
            </div>
            <div className="bullet">
              <CheckCircle2 size={16} />
              <div>
                <div className="bTitle">No email required for results.</div>
                <div className="bSub">Email only if you want a PDF export.</div>
              </div>
            </div>
          </div>

          <div className="actionsRow">
            <Btn variant="primary" onClick={beginFlow} icon={<ChevronRight size={16} />}>
              Continue
            </Btn>
            <Btn variant="ghost" onClick={() => setState((s) => ({ ...s, step: "INTRO" }))} icon={<RefreshCw size={16} />}>
              Back
            </Btn>
          </div>
        </Card>
      </AppShell>
    );
  }

  if (state.step === "FLOW") {
    const current = flow[state.flowIndex];
    const stepNum = state.flowIndex + 1;

    const headerRight = (
      <div className="miniMeta">
        <span className="muted">Step</span> <strong>{stepNum}</strong>
        <span className="muted">/</span> <strong>{totalFlow}</strong>
      </div>
    );

    // interstitial
    if (current.kind === "interstitial") {
      const f = current.force;
      const pct = score.perForce[f].pct || 0;
      const pill = pillForScore(pct);

      return (
        <AppShell rightMeta="~8–10 min • ~27 steps • bottleneck + execution plan">
          <div className="auditHead">
            <div className="auditHeadLeft">
              <div className="kicker">CALIBRATION</div>
              <div className="auditTitle">{current.title}</div>
              <div className="auditDesc">{current.sub}</div>
            </div>
            <div className="auditHeadRight">
              <div className={`pillStatus ${pill.cls}`}>{pill.label}</div>
            </div>
          </div>

          <Progress idx={stepNum} total={totalFlow} />

          <Card title="Signal so far" right={headerRight}>
            <div className="scoreLineBig">
              <div className="kv">
                <span className="muted">Force</span>
                <span className="kvStrong">{FORCES.find((x) => x.id === f)!.label}</span>
              </div>
              <div className="kv">
                <span className="muted">Score</span>
                <span className="kvStrong">{formatPct(pct)}</span>
              </div>
            </div>

            <div className="hr" />

            <div className="note">
              Keep going. The report will connect the symptom → root leak → plan.
            </div>

            <div className="navRow">
              <Btn variant="ghost" onClick={back} icon={<ChevronRight size={16} />}>
                Back
              </Btn>
              <Btn variant="primary" onClick={next} icon={<ChevronRight size={16} />}>
                Continue
              </Btn>
            </div>
          </Card>
        </AppShell>
      );
    }

    // pick screens
    if (current.kind === "pick") {
      const renderPick = () => {
        if (current.id === "symptom") {
          return SYMPTOMS.map((s) => (
            <button key={s.id} className={`pickRow ${state.symptomId === s.id ? "on" : ""}`} type="button" onClick={() => setPick("symptom", s.id)}>
              <div className="pickTitle">{s.label}</div>
              <div className="pickSub">{s.desc}</div>
              <div className="pickTag">{state.symptomId === s.id ? "SELECTED" : "PICK"}</div>
            </button>
          ));
        }
        if (current.id === "stage") {
          return STAGES.map((st) => (
            <button key={st.id} className={`pickRow ${state.stage === st.id ? "on" : ""}`} type="button" onClick={() => setPick("stage", st.id)}>
              <div className="pickTitle">{st.label}</div>
              <div className="pickSub">{st.sub}</div>
              <div className="pickTag">{state.stage === st.id ? "SELECTED" : "PICK"}</div>
            </button>
          ));
        }
        if (current.id === "revenue") {
          return REVENUE_BANDS.map((b) => (
            <button key={b.id} className={`pickRow ${state.revenueBand === b.id ? "on" : ""}`} type="button" onClick={() => setPick("revenue", b.id)}>
              <div className="pickTitle">{b.label}</div>
              <div className="pickSub">{b.sub}</div>
              <div className="pickTag">{state.revenueBand === b.id ? "SELECTED" : "PICK"}</div>
            </button>
          ));
        }
        if (current.id === "channel") {
          return CHANNELS.map((c) => (
            <button key={c.id} className={`pickRow ${state.channel === c.id ? "on" : ""}`} type="button" onClick={() => setPick("channel", c.id)}>
              <div className="pickTitle">{c.label}</div>
              <div className="pickSub">{c.sub}</div>
              <div className="pickTag">{state.channel === c.id ? "SELECTED" : "PICK"}</div>
            </button>
          ));
        }
        if (current.id === "cta") {
          return PRIMARY_CTA.map((c) => (
            <button key={c.id} className={`pickRow ${state.primaryCta === c.id ? "on" : ""}`} type="button" onClick={() => setPick("cta", c.id)}>
              <div className="pickTitle">{c.label}</div>
              <div className="pickSub">{c.sub}</div>
              <div className="pickTag">{state.primaryCta === c.id ? "SELECTED" : "PICK"}</div>
            </button>
          ));
        }
        return null;
      };

      return (
        <AppShell rightMeta="~8–10 min • ~27 steps • bottleneck + execution plan">
          <div className="auditHead">
            <div className="auditHeadLeft">
              <div className="kicker">TRIAGE</div>
              <div className="auditTitle">{current.title}</div>
              <div className="auditDesc">{current.sub}</div>
            </div>
            <div className="auditHeadRight">{headerRight}</div>
          </div>

          <Progress idx={stepNum} total={totalFlow} />

          <Card title="Pick one" right={<div className="miniMeta">Fast taps • no overthinking</div>}>
            <div className="picks">{renderPick()}</div>

            <div className="navRow">
              <button className="btn ghost" type="button" onClick={back} disabled={state.flowIndex === 0}>
                <span className="btnText">Back</span>
                <ArrowRight size={16} />
              </button>

              <button className="btn ghost" type="button" onClick={reset}>
                <span className="btnText">Abort / Reset</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </Card>
        </AppShell>
      );
    }

    // scale screens
    if (current.kind === "scale") {
      const v = state.scale[current.id] || null;

      return (
        <AppShell rightMeta="~8–10 min • ~27 steps • bottleneck + execution plan">
          <div className="auditHead">
            <div className="auditHeadLeft">
              <div className="kicker">AUDIT • {current.title}</div>
              <div className="auditTitle">{current.q}</div>
              <div className="auditDesc">{current.sub}</div>
            </div>
            <div className="auditHeadRight">{headerRight}</div>
          </div>

          <Progress idx={stepNum} total={totalFlow} />

          <Card title="Rate truth level" right={<div className="miniMeta">{FORCES.find((f) => f.id === current.force)!.micro}</div>}>
            <div className="scale">
              <button className={`scaleBtn ${v === 1 ? "on" : ""}`} type="button" onClick={() => setScale(current.id, 1)}>
                1<div className="scaleLab">Not true</div>
              </button>
              <button className={`scaleBtn ${v === 2 ? "on" : ""}`} type="button" onClick={() => setScale(current.id, 2)}>
                2<div className="scaleLab">Rare</div>
              </button>
              <button className={`scaleBtn ${v === 3 ? "on" : ""}`} type="button" onClick={() => setScale(current.id, 3)}>
                3<div className="scaleLab">Mixed</div>
              </button>
              <button className={`scaleBtn ${v === 4 ? "on" : ""}`} type="button" onClick={() => setScale(current.id, 4)}>
                4<div className="scaleLab">Often</div>
              </button>
              <button className={`scaleBtn ${v === 5 ? "on" : ""}`} type="button" onClick={() => setScale(current.id, 5)}>
                5<div className="scaleLab">True</div>
              </button>
            </div>

            <div className="note">
              We measure behaviors because they predict conversion. This is why the result is accurate.
            </div>

            <div className="navRow">
              <button className="btn ghost" type="button" onClick={back}>
                <span className="btnText">Back</span>
                <ArrowRight size={16} />
              </button>

              <button className="btn ghost" type="button" onClick={reset}>
                <span className="btnText">Abort / Reset</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </Card>
        </AppShell>
      );
    }
  }

  if (state.step === "PROCESSING") {
    return (
      <AppShell rightMeta="Compiling dossier…">
        <Card title="Compiling dossier">
          <div className="processing">
            <div className="spinner" />
            <div className="processingText">Computing bottleneck + execution plan…</div>
          </div>
        </Card>
      </AppShell>
    );
  }

  // REPORT
  const bottleneck = score.bottleneck;
  const plan = FORCE_PLANS[bottleneck];
  const status = pillForScore(score.overall);

  return (
    <AppShell rightMeta="Report • bottleneck + execution plan + call routing">
      <div className="hero compact">
        <div className="kicker">REPORT</div>
        <h1 className="h1 h1Small">Your bottleneck is {String(bottleneck).toUpperCase()}.</h1>
        <p className="sub">
          This is the first force to fix. Everything else gets easier after this.
        </p>
      </div>

      <div className="reportGrid">
        <Card
          title="Signal summary"
          right={<div className={`pillStatus ${status.cls}`}>{status.label}</div>}
        >
          <div className="scoreRow">
            <div className="scoreBig">{Math.round(score.overall)}%</div>
            <div className="scoreMeta">
              <div className="scoreLine">
                <span>Symptom</span>
                <strong>{symptom?.label || "—"}</strong>
              </div>
              <div className="scoreLine">
                <span>Stage</span>
                <strong>{String(state.stage).toUpperCase()}</strong>
              </div>
              <div className="scoreLine">
                <span>Bottleneck</span>
                <strong>{String(bottleneck).toUpperCase()}</strong>
              </div>
              <div className="scoreLine">
                <span>Fix link</span>
                <button className="miniLink" type="button" onClick={openFixLink}>
                  Open Kit module <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="hr" />

          <div className="whyBox">
            <div className="whyTitle">Why this hurts conversion</div>
            <ul className="whyList">
              {plan.whyItHurts.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>

          <div className="hr" />

          <div className="actionsRow">
            <Btn variant="secondary" onClick={copySummary} icon={<Copy size={16} />}>
              Copy summary
            </Btn>
            <Btn variant="primary" onClick={generatePDF} icon={<Download size={16} />}>
              Export PDF
            </Btn>
          </div>

          <div className="note">Export requires a valid email (to label the asset). Results are free either way.</div>
        </Card>

        <Card title="Execution plan">
          <div className="plan">
            <div className="planItem">
              <div className="planIdx">01</div>
              <div className="planText">
                <div className="planHead">TODAY</div>
                <div>{plan.today}</div>
              </div>
            </div>

            {plan.week.slice(0, 2).map((w, i) => (
              <div key={i} className="planItem">
                <div className="planIdx">{String(i + 2).padStart(2, "0")}</div>
                <div className="planText">
                  <div className="planHead">7 DAYS</div>
                  <div>{w}</div>
                </div>
              </div>
            ))}

            <div className="planItem">
              <div className="planIdx">04</div>
              <div className="planText">
                <div className="planHead">30 DAYS</div>
                <div>{plan.month[0]}</div>
              </div>
            </div>
          </div>

          <div className="hr" />

          <Card className="inner" title="Operator coordinates (for export/save)">
            <div className="grid2">
              <MiniInput
                label="Name"
                value={state.name}
                onChange={(v) => setState((s) => ({ ...s, name: v }))}
                placeholder="Your name"
              />
              <MiniInput
                label="Email"
                value={state.email}
                onChange={(v) => setState((s) => ({ ...s, email: v }))}
                placeholder="you@email.com"
                type="email"
              />
            </div>
            <MiniInput
              label="Website (optional)"
              value={state.website}
              onChange={(v) => setState((s) => ({ ...s, website: v }))}
              placeholder="https://yoursite.com"
              type="url"
            />
          </Card>

          <div className="actionsRow">
            <Btn variant="primary" onClick={openCall} icon={<Calendar size={16} />}>
              Book a 15-min leak review
            </Btn>
            <Btn variant="secondary" onClick={openMRI} icon={<FileText size={16} />}>
              Run MRI
            </Btn>
          </div>

          <div className="note">
            Booking angle: <strong>{plan.callAngle}</strong>
          </div>

          <div className="hr" />

          <div className="actionsRow">
            <Btn variant="ghost" onClick={reset} icon={<RefreshCw size={16} />}>
              New audit
            </Btn>
            <Btn variant="ghost" onClick={openFixLink} icon={<ShieldAlert size={16} />}>
              Fix via Kit module
            </Btn>
          </div>
        </Card>
      </div>

      <Card title="Force breakdown">
        <div className="bars">
          {(Object.keys(score.perForce) as ForceId[]).map((f) => {
            const pct = score.perForce[f].pct;
            const isPrimary = f === bottleneck;
            const pill = pillForScore(pct);
            return (
              <div className="barRow" key={f}>
                <div className="barHead">
                  <div className="barName">{FORCES.find((x) => x.id === f)!.label}</div>
                  <div className={`tag ${isPrimary ? "tagPrimary" : ""} ${pill.cls}`}>
                    {isPrimary ? "PRIMARY BOTTLENECK" : pill.label}
                  </div>
                </div>
                <div className="barTrack">
                  <div className="barFill" style={{ width: `${pct}%` }} />
                  <div className="barVal">{Math.round(pct)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </AppShell>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sometype+Mono:wght@400;500;600;700&display=swap');

:root{
  --paper:#ffffff;
  --ink:#0b0b0f;
  --muted: rgba(11,11,15,.62);
  --line2: rgba(11,11,15,.10);
  --shadow: rgba(0,0,0,.06);
  --red: rgba(200, 52, 52, .38);
}

*{ box-sizing:border-box; }
html,body{ height:100%; }
body{ margin:0; }

.qbg{
  min-height: 100svh;
  background: var(--paper);
  color: var(--ink);
  font-family: "Sometype Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  position: relative;
}

.qbg::before{
  content:"";
  position: fixed;
  inset: 0;
  pointer-events:none;
  background:
    linear-gradient(to right, transparent 0, transparent 52px, var(--red) 52px, var(--red) 54px, transparent 54px),
    linear-gradient(var(--line2) 1px, transparent 1px),
    linear-gradient(90deg, var(--line2) 1px, transparent 1px);
  background-size: 100% 100%, 24px 24px, 24px 24px;
  opacity: 1;
}

.top{
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  padding: 18px 18px 12px;
  border-bottom: 2px solid var(--ink);
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap: 16px;
  position: sticky;
  top: 0;
  background: rgba(255,255,255,.86);
  backdrop-filter: blur(6px);
  z-index: 10;
}

.brandRow{ display:flex; align-items:center; gap: 14px; }
.brandPill{
  background: var(--ink);
  color: var(--paper);
  padding: 9px 12px;
  font-size: 11px;
  letter-spacing: .22em;
  text-transform: uppercase;
  line-height: 1;
}
.brandTitle{ font-size: 16px; letter-spacing: -.02em; font-weight: 600; }
.topMeta{ font-size: 12px; color: var(--muted); letter-spacing: .06em; }

.wrap{
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  padding: 18px 18px 32px;
}

.foot{
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  padding: 14px 18px 28px;
  display:flex;
  gap: 10px;
  align-items:center;
  color: var(--muted);
}
.footPill{
  border: 2px solid var(--ink);
  padding: 6px 10px;
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  font-weight: 700;
  background: rgba(255,255,255,.75);
}
.footText{ font-size: 12px; }

.hero{ padding: 12px 0 14px; }
.hero.compact{ padding: 6px 0 10px; }
.kicker{
  font-size: 11px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 6px;
}
.h1{
  font-size: 56px;
  line-height: 1.03;
  margin: 0 0 8px;
  letter-spacing: -.06em;
}
.h1Small{ font-size: 34px; }
.sub{
  margin: 0;
  font-size: 14px;
  color: var(--muted);
  line-height: 1.7;
}
.subStrong{ color: var(--ink); font-weight: 700; }

.card{
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.78);
  box-shadow: 0 8px 20px rgba(0,0,0,.04);
  padding: 14px;
  margin-top: 14px;
}
.cardTop{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap: 12px;
  margin-bottom: 10px;
}
.cardTitle{
  font-size: 12px;
  letter-spacing: .18em;
  text-transform: uppercase;
  font-weight: 700;
}
.cardRight{ color: var(--muted); font-size: 12px; }

.grid2{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 760px){ .grid2{ grid-template-columns: 1fr; } }

.field{ margin-bottom: 12px; }
.label{
  font-size: 11px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 6px;
}
.input{
  width: 100%;
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.76);
  padding: 12px 12px;
  font-family: inherit;
  font-size: 14px;
  outline: none;
}
.input:focus{ box-shadow: 0 0 0 3px rgba(11,11,15,.10); }
.hint{ font-size: 12px; color: var(--muted); margin-top: 6px; line-height: 1.6; }

.actionsRow{ display:flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
.btn{
  border: 2px solid var(--ink);
  padding: 12px 12px;
  background: var(--ink);
  color: var(--paper);
  cursor: pointer;
  display:inline-flex;
  align-items:center;
  gap: 10px;
  font-family: inherit;
  font-weight: 700;
}
.btn.secondary{ background: rgba(255,255,255,.78); color: var(--ink); }
.btn.ghost{ background: transparent; color: var(--ink); }
.btn.disabled{ opacity: .5; cursor: not-allowed; }
.btnText{ font-size: 14px; }

.note{
  margin-top: 12px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}

.bullets{ display:flex; flex-direction:column; gap: 12px; }
.bullet{ display:flex; gap: 10px; align-items:flex-start; }
.bTitle{ font-weight: 800; }
.bSub{ color: var(--muted); font-size: 13px; line-height: 1.5; }

.auditHead{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap: 12px;
  margin-top: 6px;
}
.auditTitle{ font-size: 26px; font-weight: 800; letter-spacing: -.03em; line-height: 1.15; }
.auditDesc{ color: var(--muted); font-size: 13px; line-height: 1.6; margin-top: 6px; }

.miniMeta{ font-size: 12px; color: var(--muted); letter-spacing: .06em; }
.miniMeta strong{ color: var(--ink); }

.progress{
  border: 2px solid var(--ink);
  height: 10px;
  background: rgba(255,255,255,.7);
  margin-top: 10px;
  overflow:hidden;
}
.progressIn{
  height: 100%;
  background: var(--ink);
  width: 0%;
}

.picks{ display:flex; flex-direction:column; gap: 10px; }
.pickRow{
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.72);
  padding: 12px;
  text-align:left;
  cursor: pointer;
  display:grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items:start;
}
.pickRow.on{ background: rgba(11,11,15,.06); }
.pickTitle{ font-weight: 800; letter-spacing: -.01em; }
.pickSub{ color: var(--muted); font-size: 13px; margin-top: 4px; line-height: 1.5; grid-column: 1 / 2; }
.pickTag{
  border: 2px solid var(--ink);
  padding: 6px 10px;
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  font-weight: 800;
  background: rgba(255,255,255,.75);
}

.navRow{
  display:flex;
  justify-content:space-between;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.scale{
  display:grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
@media (max-width: 760px){
  .scale{ grid-template-columns: 1fr; }
}
.scaleBtn{
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.76);
  padding: 14px 12px;
  cursor: pointer;
  text-align:center;
  font-family: inherit;
  font-weight: 900;
  font-size: 16px;
}
.scaleBtn.on{ background: rgba(11,11,15,.08); }
.scaleLab{ font-size: 12px; color: var(--muted); font-weight: 700; margin-top: 6px; }

.processing{
  display:flex;
  align-items:center;
  gap: 12px;
  padding: 18px 0;
}
.spinner{
  width: 34px;
  height: 34px;
  border: 2px solid var(--ink);
  border-top-color: transparent;
  border-radius: 999px;
  animation: spin 1s linear infinite;
}
@keyframes spin{ to{ transform: rotate(360deg); } }
.processingText{ color: var(--muted); font-size: 13px; }

.reportGrid{
  display:grid;
  grid-template-columns: 1.08fr .92fr;
  gap: 14px;
}
@media (max-width: 980px){ .reportGrid{ grid-template-columns: 1fr; } }

.pillStatus{
  border: 2px solid var(--ink);
  padding: 6px 10px;
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  font-weight: 900;
  background: rgba(255,255,255,.75);
}
.pillStatus.bad{ background: rgba(200,52,52,.12); }
.pillStatus.mid{ background: rgba(240,160,60,.12); }
.pillStatus.good{ background: rgba(20,150,80,.10); }

.pillMini{
  border: 2px solid var(--ink);
  padding: 6px 10px;
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  font-weight: 900;
  background: rgba(255,255,255,.75);
}

.scoreRow{
  display:grid;
  grid-template-columns: 200px 1fr;
  gap: 14px;
  align-items:start;
}
@media (max-width: 520px){ .scoreRow{ grid-template-columns: 1fr; } }
.scoreBig{
  font-size: 64px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -.06em;
}
.scoreMeta{
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.70);
  padding: 12px;
}
.scoreLine{
  display:flex;
  justify-content:space-between;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(11,11,15,.14);
  font-size: 13px;
}
.scoreLine:last-child{ border-bottom: none; }
.scoreLine span{ color: var(--muted); }

.miniLink{
  border: none;
  background: transparent;
  font-family: inherit;
  cursor: pointer;
  color: var(--ink);
  display:inline-flex;
  gap: 8px;
  align-items:center;
  font-weight: 900;
}
.miniLink:hover{ text-decoration: underline; }

.hr{ height: 1px; background: rgba(11,11,15,.18); margin: 12px 0; }

.plan{ display:flex; flex-direction:column; gap: 10px; }
.planItem{
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.72);
  padding: 12px;
  display:grid;
  grid-template-columns: 56px 1fr;
  gap: 12px;
  align-items:start;
}
.planIdx{
  border: 2px solid var(--ink);
  width: 56px;
  height: 44px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight: 900;
  background: rgba(255,255,255,.75);
}
.planHead{ font-weight: 900; letter-spacing: .12em; text-transform: uppercase; font-size: 11px; margin-bottom: 6px; color: var(--muted); }

.inner{ margin-top: 10px; }

.bars{ display:flex; flex-direction:column; gap: 12px; }
.barRow{ border: 2px solid var(--ink); background: rgba(255,255,255,.75); padding: 12px; }
.barHead{ display:flex; justify-content:space-between; align-items:center; gap: 10px; }
.barName{ font-weight: 900; letter-spacing: .06em; }
.tag{
  border: 2px solid var(--ink);
  padding: 6px 10px;
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  font-weight: 900;
  background: rgba(255,255,255,.75);
}
.tagPrimary{ background: rgba(200,52,52,.10); }
.tag.bad{ background: rgba(200,52,52,.12); }
.tag.mid{ background: rgba(240,160,60,.12); }
.tag.good{ background: rgba(20,150,80,.10); }

.barTrack{
  margin-top: 10px;
  border: 2px solid var(--ink);
  height: 16px;
  position: relative;
  background: rgba(255,255,255,.78);
}
.barFill{
  height: 100%;
  background: var(--ink);
  width: 0%;
}
.barVal{
  position:absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: rgba(255,255,255,.92);
  font-weight: 900;
  mix-blend-mode: difference;
}

.whyBox{
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.72);
  padding: 12px;
}
.whyTitle{
  font-weight: 900;
  letter-spacing: .16em;
  text-transform: uppercase;
  font-size: 11px;
  color: var(--muted);
  margin-bottom: 8px;
}
.whyList{
  margin: 0;
  padding-left: 18px;
  color: var(--ink);
}
.whyList li{ margin: 8px 0; line-height: 1.5; }

.scoreLineBig{
  display:flex;
  justify-content:space-between;
  gap: 12px;
  border: 2px solid var(--ink);
  padding: 12px;
  background: rgba(255,255,255,.72);
}
.kv{ display:flex; flex-direction:column; gap: 6px; }
.kvStrong{ font-weight: 900; letter-spacing: .04em; }
` .trim();
