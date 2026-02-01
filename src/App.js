import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Circle,
  Copy,
  Download,
  ExternalLink,
  FileText,
  RefreshCw,
  Send,
} from "lucide-react";

/**
 * QTMBG — SIGNAL AUDIT (Notebook Edition) v1.0
 * - One coherent visual system (qtmbg notebook)
 * - Sometype Mono for headings + body
 * - No hard gate at intro (email required only for Export/Save)
 * - Strict TS-safe state, Vercel-safe
 */

// -------------------- CONFIG --------------------

type ForceId = "essence" | "identity" | "offer" | "system" | "growth";

const STORAGE_KEY = "qtmbg-signal-audit-notebook-v1";

// Your existing links (kept)
const KIT_LINKS: Record<ForceId | "mri", string> = {
  essence: "https://www.qtmbg.com/kit#module-1",
  identity: "https://www.qtmbg.com/kit#module-2",
  offer: "https://www.qtmbg.com/kit#module-3",
  system: "https://www.qtmbg.com/kit#module-4",
  growth: "https://www.qtmbg.com/kit#module-5",
  mri: "https://www.qtmbg.com/mri",
};

// You can keep your script URL if you want capture
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzaE2j8Udf13HDx14c7-kJIaqTuSGzJoxRRxgKUH7rjMTE47GpT2G-Fl7NfpDL-q9B_dw/exec";

// Symptoms (tightened language; still strong but not cringe)
const SYMPTOMS: Array<{ id: string; label: string; desc: string }> = [
  {
    id: "price_resistance",
    label: "PRICE RESISTANCE",
    desc: "People hesitate, negotiate, or ask “why so expensive?”",
  },
  { id: "ghosting", label: "GHOSTING", desc: "Interest → silence. Trust breaks mid-path." },
  { id: "wrong_fit", label: "WRONG FIT", desc: "You attract the wrong buyers and waste time." },
  { id: "feast_famine", label: "FEAST / FAMINE", desc: "Revenue spikes and dips. No control." },
  { id: "invisibility", label: "INVISIBILITY", desc: "Work is good, market response is weak." },
];

const QUICK_WINS: Record<ForceId, string[]> = {
  essence: [
    "AUDIT: Remove generic positioning. Replace with one belief you attack.",
    "ACTION: Publish one contrarian claim you can defend (1 post).",
    "STRUCTURE: Write one sentence: WHO → OUTCOME → MECHANISM → TIME.",
  ],
  identity: [
    "AUDIT: Kill template visuals. Keep one signature element everywhere.",
    "ACTION: Tighten your proof stack: numbers, screenshots, constraints.",
    "STRUCTURE: Rewrite hero + offer page to look expensive (not “nice”).",
  ],
  offer: [
    "AUDIT: Collapse to 1 flagship path (one CTA, one promise).",
    "ACTION: Add a clear risk reversal (guarantee or constraint).",
    "STRUCTURE: Price the transformation, not the time.",
  ],
  system: [
    "AUDIT: Map the 6-step happy path (Viewer → Lead → Call → Close → Onboard → Referral).",
    "ACTION: Install one capture + one nurture email (today).",
    "STRUCTURE: Add one filter question to repel bad fits.",
  ],
  growth: [
    "AUDIT: Pick one metric for 30 days (qualified leads/week or close rate).",
    "ACTION: One weekly execution ritual (same day, same time).",
    "STRUCTURE: Choose ONE channel to dominate for 30 days.",
  ],
};

// Force checklist (kept + slightly tightened)
const PHASES: Array<{
  id: ForceId;
  label: string;
  desc: string;
  items: Array<{ id: string; label: string }>;
}> = [
  {
    id: "essence",
    label: "FORCE 1 — ESSENCE",
    desc: "Truth, belief, enemy, mechanism.",
    items: [
      { id: "e1", label: "My content attacks a specific status-quo belief." },
      { id: "e2", label: "My bio sells a philosophy, not a résumé." },
      { id: "e3", label: "I can explain my transformation in one sentence (no jargon)." },
      { id: "e4", label: "I publish convictions, not only tips." },
      { id: "e5", label: "People buy my worldview, not just my service." },
    ],
  },
  {
    id: "identity",
    label: "FORCE 2 — IDENTITY",
    desc: "Visual authority and language precision.",
    items: [
      { id: "i1", label: "No stock visuals. No generic templates." },
      { id: "i2", label: "I own 3 distinct words competitors don’t use." },
      { id: "i3", label: "Website + socials feel like one universe." },
      { id: "i4", label: "My assets look premium (restraint, whitespace, focus)." },
      { id: "i5", label: "I have a signature framework I can show in one graphic." },
    ],
  },
  {
    id: "offer",
    label: "FORCE 3 — OFFER",
    desc: "One path, one promise, one price logic.",
    items: [
      { id: "o1", label: "I sell a specific outcome, not a vague service." },
      { id: "o2", label: "I have clear risk reversal (guarantee/constraint)." },
      { id: "o3", label: "My ladder is clear (Free → Entry → High Ticket)." },
      { id: "o4", label: "Price is value-based, not hourly." },
      { id: "o5", label: "My offer has a unique name." },
    ],
  },
  {
    id: "system",
    label: "FORCE 4 — SYSTEM",
    desc: "Pipeline control and conversion flow.",
    items: [
      { id: "s1", label: "My lead magnet filters out bad-fit leads." },
      { id: "s2", label: "Leads receive value before a pitch (3+ emails)." },
      { id: "s3", label: "A stranger can buy an entry offer without a call." },
      { id: "s4", label: "I know my CPL (or have a plan to measure it)." },
      { id: "s5", label: "Non-buyers have automated follow-up." },
    ],
  },
  {
    id: "growth",
    label: "FORCE 5 — GROWTH",
    desc: "Proof, velocity, and repeatable output.",
    items: [
      { id: "g1", label: "Claims are backed by proof (numbers/screenshots/stories)." },
      { id: "g2", label: "I publish one signal asset weekly." },
      { id: "g3", label: "I dominate one channel (not mediocre on four)." },
      { id: "g4", label: "I borrow other audiences (partners/podcasts/hosts)." },
      { id: "g5", label: "Clients buy again or refer reliably." },
    ],
  },
];

// -------------------- UTILS --------------------

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function forceName(id: ForceId) {
  return id.toUpperCase();
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

// -------------------- STATE --------------------

type Step = "INTRO" | "TRIAGE" | "AUDIT" | "PROCESSING" | "REPORT";

type State = {
  step: Step;
  symptomId: string | null;
  phaseIndex: number;
  client: { name: string; url: string; email: string };
  checks: Partial<Record<ForceId, Record<string, boolean>>>;
  createdAtISO: string;
  submitted: boolean;
};

function emptyState(): State {
  return {
    step: "INTRO",
    symptomId: null,
    phaseIndex: 0,
    client: { name: "", url: "", email: "" },
    checks: {},
    createdAtISO: new Date().toISOString(),
    submitted: false,
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

// -------------------- UI PRIMITIVES --------------------

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="qbg">
      <style>{CSS}</style>

      <header className="top">
        <div className="brandRow">
          <div className="brandPill">QUANTUM BRANDING</div>
          <div className="brandTitle">Signal Audit</div>
        </div>
        <div className="topMeta">~3 min • 5 forces • bottleneck + fix plan</div>
      </header>

      <main className="wrap">{children}</main>

      <footer className="foot">
        <div className="footPill">QTMbg</div>
        <div className="footText">
          Signal Audit is a diagnostic. Use it to convert insight into execution.
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

// -------------------- MAIN APP --------------------

export default function App() {
  const hydrated = useMemo(() => loadState(), []);
  const [state, setState] = useState<State>(() => hydrated || emptyState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const symptom = useMemo(
    () => SYMPTOMS.find((s) => s.id === state.symptomId) || null,
    [state.symptomId]
  );

  const scoreData = useMemo(() => {
    let total = 0;
    let earned = 0;

    const breakdown: Record<ForceId, number> = {
      essence: 0,
      identity: 0,
      offer: 0,
      system: 0,
      growth: 0,
    };

    for (const p of PHASES) {
      total += p.items.length;
      const checkedCount = p.items.filter((i) => state.checks[p.id]?.[i.id]).length;
      breakdown[p.id] = checkedCount;
      earned += checkedCount;
    }

    const pct = total === 0 ? 0 : Math.round((earned / total) * 100);

    const sorted = (Object.keys(breakdown) as ForceId[])
      .map((k) => ({ id: k, val: breakdown[k] }))
      .sort((a, b) => a.val - b.val);

    const bottleneck = sorted[0]?.id ?? "essence";
    return { pct, breakdown, bottleneck };
  }, [state.checks]);

  const totalPhases = PHASES.length;
  const phase = PHASES[state.phaseIndex];

  const start = () => {
    setState((s) => ({ ...s, step: "TRIAGE" }));
  };

  const chooseSymptom = (id: string) => {
    setState((s) => ({ ...s, symptomId: id, step: "AUDIT", phaseIndex: 0 }));
  };

  const toggleCheck = (phaseId: ForceId, itemId: string) => {
    setState((s) => {
      const currentPhase = s.checks[phaseId] || {};
      return {
        ...s,
        checks: {
          ...s.checks,
          [phaseId]: { ...currentPhase, [itemId]: !currentPhase[itemId] },
        },
      };
    });
  };

  const nextPhase = () => {
    if (state.phaseIndex < totalPhases - 1) {
      setState((s) => ({ ...s, phaseIndex: s.phaseIndex + 1 }));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Done → processing → report
    setState((s) => ({ ...s, step: "PROCESSING" }));
    window.scrollTo({ top: 0 });

    // Submit only if email is valid (soft capture)
    const hasValidEmail = isValidEmail(state.client.email.trim());

    if (hasValidEmail && !state.submitted) {
      void submitData({
        client: state.client,
        symptomId: state.symptomId,
        pct: scoreData.pct,
        bottleneck: scoreData.bottleneck,
      }).then((ok) => {
        if (ok) setState((s) => ({ ...s, submitted: true }));
      });
    }

    setTimeout(() => {
      setState((s) => ({ ...s, step: "REPORT" }));
    }, 900);
  };

  const goBackPhase = () => {
    setState((s) => ({ ...s, phaseIndex: Math.max(0, s.phaseIndex - 1) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    if (confirm("Reset this audit?")) {
      localStorage.removeItem(STORAGE_KEY);
      setState(emptyState());
    }
  };

  const copySummary = async () => {
    const lines: string[] = [];
    lines.push("QTMBG — SIGNAL AUDIT SUMMARY");
    lines.push(`Date: ${new Date(state.createdAtISO).toLocaleString()}`);
    if (state.client.name.trim()) lines.push(`Name: ${state.client.name.trim()}`);
    if (state.client.url.trim()) lines.push(`Website: ${state.client.url.trim()}`);
    if (symptom) lines.push(`Symptom: ${symptom.label}`);
    lines.push(`Overall score: ${scoreData.pct}%`);
    lines.push(`Bottleneck: ${forceName(scoreData.bottleneck)}`);
    lines.push("");
    lines.push("Breakdown:");
    (Object.keys(scoreData.breakdown) as ForceId[]).forEach((f) => {
      const max = PHASES.find((p) => p.id === f)!.items.length;
      lines.push(`- ${forceName(f)}: ${scoreData.breakdown[f]}/${max}`);
    });
    lines.push("");
    lines.push("Next actions (7-day micro-plan):");
    QUICK_WINS[scoreData.bottleneck].forEach((w) => lines.push(`- ${w}`));

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      alert("Copied.");
    } catch {
      alert("Copy failed (browser permission).");
    }
  };

  const requireEmailForExport = () => {
    if (!state.client.name.trim()) {
      alert("Add your name to label the file.");
      return false;
    }
    if (!isValidEmail(state.client.email.trim())) {
      alert("Enter a valid email to export/save.");
      return false;
    }
    return true;
  };

  const generatePDF = () => {
    if (!requireEmailForExport()) return;

    const doc = new jsPDF();
    const pageW = 210;
    const margin = 14;
    const contentW = pageW - margin * 2;

    const drawHeader = (title: string) => {
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, "F");

      doc.setDrawColor(20, 20, 20);
      doc.setLineWidth(0.4);
      doc.rect(margin, 12, contentW, 14);

      doc.setFont("courier", "bold");
      doc.setFontSize(10);
      doc.text("QUANTUM BRANDING — SIGNAL AUDIT", margin + 4, 21);

      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      doc.text(new Date().toLocaleDateString(), pageW - margin - 24, 21);

      doc.setFont("courier", "bold");
      doc.setFontSize(16);
      doc.text(title, margin, 42);

      doc.setLineWidth(0.3);
      doc.line(margin, 48, pageW - margin, 48);
    };

    const symptomLabel = symptom?.label ?? "—";
    const bottleneck = scoreData.bottleneck;
    const bottleneckLabel = forceName(bottleneck);

    // Page 1
    drawHeader("REPORT");
    doc.setFont("courier", "normal");
    doc.setFontSize(10);

    const y0 = 60;
    doc.text(`Name: ${state.client.name.trim()}`, margin, y0);
    doc.text(`Email: ${state.client.email.trim()}`, margin, y0 + 8);
    doc.text(`Website: ${state.client.url.trim() || "—"}`, margin, y0 + 16);
    doc.text(`Symptom: ${symptomLabel}`, margin, y0 + 24);

    doc.setFont("courier", "bold");
    doc.setFontSize(26);
    doc.text(`${scoreData.pct}%`, margin, y0 + 44);

    doc.setFont("courier", "bold");
    doc.setFontSize(12);
    doc.text(`Primary bottleneck: ${bottleneckLabel}`, margin, y0 + 58);

    doc.setFont("courier", "normal");
    doc.setFontSize(10);

    // Breakdown box
    doc.setLineWidth(0.35);
    doc.rect(margin, y0 + 66, contentW, 46);

    let yy = y0 + 76;
    (Object.keys(scoreData.breakdown) as ForceId[]).forEach((f) => {
      const max = PHASES.find((p) => p.id === f)!.items.length;
      doc.text(`${forceName(f)}: ${scoreData.breakdown[f]}/${max}`, margin + 4, yy);
      yy += 8;
    });

    // 7-day plan box
    doc.setFont("courier", "bold");
    doc.text("7-DAY MICRO-PLAN", margin, y0 + 128);

    doc.setFont("courier", "normal");
    doc.rect(margin, y0 + 134, contentW, 56);
    let planY = y0 + 144;
    QUICK_WINS[bottleneck].forEach((w) => {
      const lines = doc.splitTextToSize(`- ${w}`, contentW - 8);
      doc.text(lines, margin + 4, planY);
      planY += lines.length * 6 + 2;
    });

    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.text("QTMBG — internal diagnostic. Use to execute, not to overthink.", margin, 290);

    // Page 2 — Checklist log
    doc.addPage();
    drawHeader("CHECKLIST LOG");
    doc.setFont("courier", "normal");
    doc.setFontSize(9);

    let y = 60;
    for (const p of PHASES) {
      doc.setFont("courier", "bold");
      doc.text(p.label, margin, y);
      y += 8;

      doc.setFont("courier", "normal");
      for (const item of p.items) {
        const checked = !!state.checks[p.id]?.[item.id];
        const prefix = checked ? "[x]" : "[ ]";
        const lines = doc.splitTextToSize(`${prefix} ${item.label}`, contentW);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 2;

        if (y > 280) {
          doc.addPage();
          drawHeader("CHECKLIST LOG");
          doc.setFont("courier", "normal");
          doc.setFontSize(9);
          y = 60;
        }
      }

      y += 6;
    }

    const file = `QTMBG_SIGNAL_AUDIT_${state.client.name.trim().replace(/\s+/g, "_").toUpperCase()}.pdf`;
    doc.save(file);
  };

  const openFixLink = () => {
    const url = KIT_LINKS[scoreData.bottleneck];
    window.open(url, "_blank", "noreferrer");
  };

  // -------------------- RENDER --------------------

  if (state.step === "INTRO") {
    return (
      <AppShell>
        <div className="hero">
          <div className="kicker">SIGNAL AUDIT</div>
          <h1 className="h1">Find the structural leak causing your symptom.</h1>
          <p className="sub">
            This is the deeper instrument (after Signal). You’ll pick a symptom, run the
            5-force checklist, and get a bottleneck + 7-day plan.
          </p>
        </div>

        <Card title="Operator coordinates (optional to start)">
          <div className="grid2">
            <MiniInput
              label="Name"
              value={state.client.name}
              onChange={(v) => setState((s) => ({ ...s, client: { ...s.client, name: v } }))}
              placeholder="Your name"
            />
            <MiniInput
              label="Email (required for export)"
              value={state.client.email}
              onChange={(v) => setState((s) => ({ ...s, client: { ...s.client, email: v } }))}
              placeholder="you@email.com"
              type="email"
              hint="We only require this when you export / save."
            />
          </div>

          <MiniInput
            label="Website (optional)"
            value={state.client.url}
            onChange={(v) => setState((s) => ({ ...s, client: { ...s.client, url: v } }))}
            placeholder="https://yoursite.com"
            type="url"
          />

          <div className="ctaRow">
            <Btn variant="primary" onClick={start} icon={<ChevronRight size={16} />}>
              Start Audit
            </Btn>
            <button className="link" type="button" onClick={reset}>
              Reset
            </button>
          </div>

          <div className="trustRow">
            <div className="trustItem">
              <CheckCircle2 size={14} />
              <span>One system, not random tips</span>
            </div>
            <div className="trustItem">
              <CheckCircle2 size={14} />
              <span>Find bottleneck + fix path</span>
            </div>
            <div className="trustItem">
              <CheckCircle2 size={14} />
              <span>Exportable plan</span>
            </div>
          </div>
        </Card>
      </AppShell>
    );
  }

  if (state.step === "TRIAGE") {
    return (
      <AppShell>
        <div className="hero compact">
          <div className="kicker">STEP 1</div>
          <h1 className="h1 h1Small">Pick your symptom.</h1>
          <p className="sub">Don’t overthink. Choose the one that costs you money right now.</p>
        </div>

        <Card title="Primary symptom">
          <div className="listGrid">
            {SYMPTOMS.map((s) => (
              <button key={s.id} type="button" className="pick" onClick={() => chooseSymptom(s.id)}>
                <div className="pickLeft">
                  <div className="pickLabel">{s.label}</div>
                  <div className="pickDesc">{s.desc}</div>
                </div>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>

          <div className="ctaRow">
            <button className="link" type="button" onClick={() => setState((x) => ({ ...x, step: "INTRO" }))}>
              Back
            </button>
          </div>
        </Card>
      </AppShell>
    );
  }

  if (state.step === "AUDIT") {
    const progressPct = Math.round(((state.phaseIndex + 1) / totalPhases) * 100);
    return (
      <AppShell>
        <div className="auditHead">
          <div className="auditHeadLeft">
            <div className="kicker">
              STEP 2 • FORCE {state.phaseIndex + 1}/{totalPhases}
            </div>
            <div className="auditTitle">{phase.label}</div>
            <div className="auditDesc">{phase.desc}</div>
          </div>
          <div className="auditHeadRight">
            <div className="chip">
              <span>Progress</span>
              <strong>{progressPct}%</strong>
            </div>
          </div>
        </div>

        <Progress idx={state.phaseIndex + 1} total={totalPhases} />

        <Card
          title="Checklist"
          right={
            <div className="miniMeta">
              Symptom: <strong>{symptom?.label ?? "—"}</strong>
            </div>
          }
        >
          <div className="checks">
            {phase.items.map((item) => {
              const checked = !!state.checks[phase.id]?.[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`checkRow ${checked ? "on" : ""}`}
                  onClick={() => toggleCheck(phase.id, item.id)}
                >
                  <div className="checkIcon">
                    {checked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>
                  <div className="checkText">{item.label}</div>
                  <div className="checkTag">{checked ? "YES" : "NO"}</div>
                </button>
              );
            })}
          </div>

          <div className="navRow">
            <button className="btn ghost" type="button" onClick={goBackPhase} disabled={state.phaseIndex === 0}>
              <span className="btnText">Back</span>
              <ArrowRight size={16} />
            </button>

            <Btn variant="primary" onClick={nextPhase} icon={<ChevronRight size={16} />}>
              {state.phaseIndex === totalPhases - 1 ? "Run Diagnostics" : "Next Force"}
            </Btn>
          </div>

          <div className="hr" />

          <div className="ctaRow">
            <button className="link danger" type="button" onClick={reset}>
              Abort / Reset
            </button>
          </div>
        </Card>
      </AppShell>
    );
  }

  if (state.step === "PROCESSING") {
    return (
      <AppShell>
        <Card title="Compiling dossier">
          <div className="processing">
            <div className="spinner" />
            <div className="processingText">Computing bottleneck + fix plan…</div>
          </div>
        </Card>
      </AppShell>
    );
  }

  // REPORT
  const bottleneck = scoreData.bottleneck;
  const bottleneckPlan = QUICK_WINS[bottleneck];
  const isCritical = scoreData.pct < 60;

  return (
    <AppShell>
      <div className="hero compact">
        <div className="kicker">REPORT</div>
        <h1 className="h1 h1Small">Your bottleneck is {forceName(bottleneck)}.</h1>
        <p className="sub">
          This is the first force to fix. Everything else gets easier after this.
        </p>
      </div>

      <div className="reportGrid">
        <Card
          title="Signal summary"
          right={
            <div className={`pillStatus ${isCritical ? "bad" : "good"}`}>
              {isCritical ? "CRITICAL" : "STABLE"}
            </div>
          }
        >
          <div className="scoreRow">
            <div className="scoreBig">{scoreData.pct}%</div>
            <div className="scoreMeta">
              <div className="scoreLine">
                <span>Symptom</span>
                <strong>{symptom?.label ?? "—"}</strong>
              </div>
              <div className="scoreLine">
                <span>Bottleneck</span>
                <strong>{forceName(bottleneck)}</strong>
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

          <div className="breakdown">
            {(Object.keys(scoreData.breakdown) as ForceId[]).map((f) => {
              const max = PHASES.find((p) => p.id === f)!.items.length;
              const val = scoreData.breakdown[f];
              const pct = Math.round((val / max) * 100);
              const isB = f === bottleneck;

              return (
                <div key={f} className="barRow">
                  <div className="barTop">
                    <div className="barName">{forceName(f)}</div>
                    <div className={`barTag ${isB ? "tagHard" : ""}`}>{isB ? "BOTTLENECK" : `${val}/${max}`}</div>
                  </div>
                  <div className="bar">
                    <div className="barIn" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
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

          <div className="note">
            Export requires a valid email (to prevent anonymous spam exports and to label the asset).
          </div>
        </Card>

        <Card title="7-day micro-plan">
          <div className="plan">
            {bottleneckPlan.map((w, i) => (
              <div key={i} className="planItem">
                <div className="planIdx">{String(i + 1).padStart(2, "0")}</div>
                <div className="planText">{w}</div>
              </div>
            ))}
          </div>

          <div className="hr" />

          <Card className="inner" title="Operator coordinates (for export/save)">
            <div className="grid2">
              <MiniInput
                label="Name"
                value={state.client.name}
                onChange={(v) => setState((s) => ({ ...s, client: { ...s.client, name: v } }))}
                placeholder="Your name"
              />
              <MiniInput
                label="Email"
                value={state.client.email}
                onChange={(v) => setState((s) => ({ ...s, client: { ...s.client, email: v } }))}
                placeholder="you@email.com"
                type="email"
              />
            </div>
            <MiniInput
              label="Website (optional)"
              value={state.client.url}
              onChange={(v) => setState((s) => ({ ...s, client: { ...s.client, url: v } }))}
              placeholder="https://yoursite.com"
              type="url"
            />
          </Card>

          <div className="actionsRow">
            <Btn variant="secondary" onClick={() => window.open(KIT_LINKS.mri, "_blank", "noreferrer")} icon={<FileText size={16} />}>
              Run MRI
            </Btn>
            <Btn variant="primary" onClick={reset} icon={<RefreshCw size={16} />}>
              New audit
            </Btn>
          </div>

          <div className="note">
            This is designed to be consistent with the qtmbg “notebook” system: same page, same boxes,
            same rhythm — no cheap layout jumps.
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

// -------------------- SUBMIT (soft capture) --------------------

async function submitData(payload: {
  client: { name: string; url: string; email: string };
  symptomId: string | null;
  pct: number;
  bottleneck: ForceId;
}) {
  try {
    const body = new URLSearchParams({
      payload: JSON.stringify({
        app: "QTMBG_SIGNAL_AUDIT_NOTEBOOK_V1",
        ts: new Date().toISOString(),
        client: payload.client,
        symptom: payload.symptomId,
        score: payload.pct,
        bottleneck: payload.bottleneck,
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

// -------------------- CSS (Notebook System) --------------------

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sometype+Mono:wght@400;500;600;700&display=swap');

:root{
  --paper:#ffffff;
  --ink:#0b0b0f;
  --muted: rgba(11,11,15,.62);
  --line: rgba(11,11,15,.14);
  --line2: rgba(11,11,15,.10);
  --shadow: rgba(0,0,0,.06);
  --red: rgba(200, 52, 52, .38);
}

*{ box-sizing:border-box; }
.qbg{
  min-height: 100svh;
  background: var(--paper);
  color: var(--ink);
  font-family: "Sometype Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  position: relative;
}

/* notebook grid */
.qbg::before{
  content:"";
  position: fixed;
  inset: 0;
  pointer-events:none;
  background:
    linear-gradient(to right, transparent 0, transparent 52px, var(--red) 52px, var(--red) 54px, transparent 54px) ,
    linear-gradient(var(--line2) 1px, transparent 1px),
    linear-gradient(90deg, var(--line2) 1px, transparent 1px);
  background-size:
    100% 100%,
    24px 24px,
    24px 24px;
  opacity: 1;
}

/* layout matches your root width style (centered page) */
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

.brandRow{
  display:flex;
  align-items:center;
  gap: 14px;
}
.brandPill{
  background: var(--ink);
  color: var(--paper);
  padding: 9px 12px;
  font-size: 11px;
  letter-spacing: .22em;
  text-transform: uppercase;
  line-height: 1;
}
.brandTitle{
  font-size: 16px;
  letter-spacing: -.02em;
  font-weight: 600;
}
.topMeta{
  font-size: 12px;
  color: var(--muted);
  letter-spacing: .06em;
}

.wrap{
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  padding: 18px 18px 42px;
  position: relative;
}

.foot{
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  padding: 14px 18px 18px;
  border-top: 2px solid var(--ink);
  display:flex;
  align-items:center;
  gap: 12px;
  color: var(--muted);
  position: relative;
}
.footPill{
  border: 2px solid var(--ink);
  padding: 6px 10px;
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--ink);
  background: rgba(255,255,255,.75);
}
.footText{
  font-size: 12px;
}

.hero{
  text-align:center;
  padding: 26px 0 18px;
  max-width: 900px;
  margin: 0 auto;
}
.hero.compact{ padding-top: 14px; }
.kicker{
  font-size: 11px;
  letter-spacing: .26em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 10px;
}
.h1{
  font-size: 52px;
  line-height: 1.04;
  letter-spacing: -0.06em;
  font-weight: 700;
  margin: 0;
}
.h1Small{
  font-size: 40px;
}
.sub{
  margin: 12px auto 0;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.65;
  max-width: 820px;
}

.card{
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.86);
  box-shadow: 0 10px 22px var(--shadow);
  padding: 18px;
  margin: 14px 0;
}
.card.inner{
  box-shadow: none;
  background: rgba(255,255,255,.70);
  margin: 0;
}

.cardTop{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.cardTitle{
  font-size: 11px;
  letter-spacing: .24em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 700;
}
.cardRight{ font-size: 12px; color: var(--muted); }

.grid2{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 860px){
  .grid2{ grid-template-columns: 1fr; }
}

.field{ text-align:left; }
.label{
  font-size: 11px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 8px;
  font-weight: 700;
}
.input{
  width: 100%;
  background: transparent;
  border: 2px solid var(--ink);
  padding: 12px 12px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
}
.input:focus{
  box-shadow: 0 0 0 3px rgba(170,59,255,.10);
}
.hint{
  font-size: 12px;
  color: var(--muted);
  margin-top: 6px;
}

.btn{
  border: 2px solid var(--ink);
  padding: 12px 14px;
  display:inline-flex;
  align-items:center;
  gap: 10px;
  cursor:pointer;
  background: var(--paper);
  color: var(--ink);
  font-family: inherit;
  letter-spacing: .18em;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 700;
  transition: transform .12s ease, background .12s ease, opacity .12s ease;
}
.btn:hover{ transform: translateY(-1px); }
.btn.primary{
  background: var(--ink);
  color: var(--paper);
}
.btn.secondary{
  background: var(--paper);
  color: var(--ink);
}
.btn.ghost{
  background: transparent;
  opacity: .78;
}
.btn.disabled{
  opacity: .35;
  cursor:not-allowed;
  transform:none !important;
}
.btnText{ letter-spacing: .18em; }

.link{
  border: none;
  background: transparent;
  font-family: inherit;
  color: var(--muted);
  text-decoration: underline;
  cursor: pointer;
  font-size: 12px;
}
.link:hover{ color: var(--ink); }
.link.danger:hover{ color: rgba(200,52,52,1); }

.ctaRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.trustRow{
  display:flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 14px;
  color: var(--muted);
  font-size: 12px;
}
.trustItem{
  display:flex;
  align-items:center;
  gap: 8px;
}

.listGrid{
  display:flex;
  flex-direction:column;
  gap: 10px;
}
.pick{
  width: 100%;
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.75);
  padding: 14px 14px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
  cursor:pointer;
  text-align:left;
  transition: transform .12s ease;
  font-family: inherit;
}
.pick:hover{ transform: translateX(3px); }
.pickLabel{
  font-size: 14px;
  letter-spacing: .14em;
  font-weight: 700;
}
.pickDesc{
  margin-top: 4px;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}

.auditHead{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 14px;
  margin: 8px 0 10px;
}
.auditTitle{
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -.02em;
}
.auditDesc{
  margin-top: 6px;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}
.chip{
  border: 2px solid var(--ink);
  padding: 10px 12px;
  background: rgba(255,255,255,.86);
  display:flex;
  gap: 10px;
  align-items:center;
  color: var(--muted);
  font-size: 12px;
}
.chip strong{ color: var(--ink); }

.progress{
  width: 100%;
  height: 4px;
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.70);
  overflow:hidden;
  margin: 8px 0 14px;
}
.progressIn{
  height: 100%;
  background: var(--ink);
  transition: width .3s ease;
}

.miniMeta{
  font-size: 12px;
  color: var(--muted);
}

.checks{
  display:flex;
  flex-direction:column;
  gap: 10px;
}
.checkRow{
  border: 2px solid var(--ink);
  background: rgba(255,255,255,.72);
  display:grid;
  grid-template-columns: 28px 1fr auto;
  align-items:center;
  gap: 12px;
  padding: 12px 12px;
  cursor:pointer;
  text-align:left;
  font-family: inherit;
  transition: transform .12s ease, background .12s ease;
}
.checkRow:hover{ transform: translateX(3px); }
.checkRow.on{
  background: rgba(11,11,15,.92);
  color: var(--paper);
}
.checkIcon{ display:flex; align-items:center; justify-content:center; }
.checkText{ font-size: 14px; line-height: 1.5; }
.checkTag{
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  opacity: .72;
}

.navRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.hr{
  height: 2px;
  background: var(--ink);
  opacity: .18;
  margin: 16px 0;
}

.processing{
  display:flex;
  align-items:center;
  justify-content:center;
  flex-direction:column;
  padding: 18px 0;
  gap: 12px;
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
.processingText{
  color: var(--muted);
  font-size: 13px;
}

.reportGrid{
  display:grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 14px;
}
@media (max-width: 980px){
  .reportGrid{ grid-template-columns: 1fr; }
}

.pillStatus{
  border: 2px solid var(--ink);
  padding: 6px 10px;
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  font-weight: 700;
  background: rgba(255,255,255,.75);
}
.pillStatus.bad{
  background: rgba(200,52,52,.12);
}
.pillStatus.good{
  background: rgba(20,150,80,.10);
}

.scoreRow{
  display:grid;
  grid-template-columns: 200px 1fr;
  gap: 14px;
  align-items:start;
}
@media (max-width: 520px){
  .scoreRow{ grid-template-columns: 1fr; }
}

.scoreBig{
  font-size: 64px;
  line-height: 1;
  font-weight: 700;
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
  font-weight: 700;
}
.miniLink:hover{ text-decoration: underline; }

.breakdown{
  display:flex;
  flex-direction:column;
  gap: 12px;
}
.barRow{ display:flex; flex-direction:column; gap: 8px; }
.barTop{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
}
.barName{
  font-size: 12px;
  letter-spacing: .18em;
  font-weight: 700;
}
.barTag{
  font-size: 10px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--muted);
}
.barTag.tagHard{
  color: var(--ink);
  font-weight: 700;
}
.bar{
  border: 2px solid var(--ink);
  height: 22px;
  background: rgba(255,255,255,.65);
  overflow:hidden;
}
.barIn{
  height: 100%;
  background: var(--ink);
  transition: width .4s ease;
}

.actionsRow{
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}

.note{
  margin-top: 12px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}

.plan{
  display:flex;
  flex-direction:column;
  gap: 10px;
}
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
  font-weight: 700;
}
.planText{
  font-size: 13px;
  line-height: 1.6;
  color: var(--ink);
}
`;
