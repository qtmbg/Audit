import React, { useEffect, useMemo, useState } from 'react';
import { jsPDF } from "jspdf";
import {
  Shield, Activity, Zap, Target, Cpu, BarChart,
  ChevronRight, FileText, Send, Lock, AlertCircle,
  Check, X, Terminal, ArrowRight, RefreshCw, LayoutTemplate
} from 'lucide-react';

/**
 * ⚡ QUANTUM BRANDING OS v6.3 | THE GATEKEEPER
 * --------------------------------------------
 * Update: Strict Email Validation Logic.
 * Protocol: User cannot enter the system without valid coordinates.
 */

// --- CONFIGURATION ---
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzaE2j8Udf13HDx14c7-kJIaqTuSGzJoxRRxgKUH7rjMTE47GpT2G-Fl7NfpDL-q9B_dw/exec';
const STORAGE_KEY = 'qtm_signal_v6';

const KIT_LINKS = {
  essence: "https://www.qtmbg.com/kit#module-1",
  identity: "https://www.qtmbg.com/kit#module-2",
  offer: "https://www.qtmbg.com/kit#module-3",
  system: "https://www.qtmbg.com/kit#module-4",
  growth: "https://www.qtmbg.com/kit#module-5",
  mri: "https://www.qtmbg.com/mri"
};

const QUICK_WINS = {
  essence: [
    "AUDIT: Remove 'I help' statements. Replace with belief.",
    "ACTION: Delete 3 posts that do not attack a status quo.",
    "STRATEGY: Define your 'Enemy' in 1 sentence."
  ],
  identity: [
    "AUDIT: Unfollow 5 competitors to kill copying.",
    "ACTION: Select 1 'Signature Color'. Use it everywhere.",
    "STRATEGY: Sell a 'Protocol', not coaching."
  ],
  offer: [
    "AUDIT: Double your guarantee. If comfortable, it is weak.",
    "ACTION: Add a 'Fast Action Bonus' (24h deadline).",
    "STRATEGY: Rename price to 'Tuition' or 'Investment'."
  ],
  system: [
    "AUDIT: If you typed it twice, template it.",
    "ACTION: Set auto-reply sending Lead Magnet immediately.",
    "STRATEGY: Create an application form to filter leads."
  ],
  growth: [
    "AUDIT: Repost your best content from 90 days ago.",
    "ACTION: DM 5 people who liked your last post.",
    "STRATEGY: Pick ONE platform. Ignore the rest."
  ]
};

const SYMPTOMS = [
  { id: 'price_resistance', label: 'PRICE RESISTANCE', desc: 'Clients haggle. "Too expensive." Low perceived value.' },
  { id: 'ghosting', label: 'GHOSTING', desc: 'Leads engage then vanish. Trust fracture.' },
  { id: 'wrong_fit', label: 'WRONG FIT', desc: 'Attracting energy vampires. Positioning failure.' },
  { id: 'feast_famine', label: 'FEAST & FAMINE', desc: 'Unpredictable revenue. No system.' },
  { id: 'invisibility', label: 'INVISIBILITY', desc: 'High effort, zero noise. Signal resonance failure.' }
];

const PHASES = [
  {
    id: 'essence', label: 'FORCE 1: ESSENCE',
    desc: 'THE TRUTH. THE SOUL. THE ENEMY.',
    items: [
      { id: 'e1', label: 'I attack a specific status-quo belief in my content.' },
      { id: 'e2', label: 'My bio sells a philosophy, not just a resume.' },
      { id: 'e3', label: 'I can state my transformation in 1 sentence without jargon.' },
      { id: 'e4', label: 'I share personal convictions, not just generic tips.' },
      { id: 'e5', label: 'People buy WHO I am, not just WHAT I do.' }
    ]
  },
  {
    id: 'identity', label: 'FORCE 2: IDENTITY',
    desc: 'THE VISUALS. THE VOICE. THE CODE.',
    items: [
      { id: 'i1', label: 'No stock photos. No generic Canva templates.' },
      { id: 'i2', label: 'I own 3 specific words competitors don’t use.' },
      { id: 'i3', label: 'My website and LinkedIn look like the same universe.' },
      { id: 'i4', label: 'High status design (lots of negative space).' },
      { id: 'i5', label: 'I have a signature proprietary visual framework.' }
    ]
  },
  {
    id: 'offer', label: 'FORCE 3: OFFER',
    desc: 'THE MECHANICS. THE PRICE. THE LADDER.',
    items: [
      { id: 'o1', label: 'I sell a specific outcome (e.g. "$10k"), not "coaching".' },
      { id: 'o2', label: 'I have a clear risk-reversal (guarantee).' },
      { id: 'o3', label: 'I have a Free -> Entry -> High Ticket ladder.' },
      { id: 'o4', label: 'Price is based on value, not hours.' },
      { id: 'o5', label: 'My offer has a unique name.' }
    ]
  },
  {
    id: 'system', label: 'FORCE 4: SYSTEM',
    desc: 'THE MACHINE. THE FUNNEL. THE NURTURE.',
    items: [
      { id: 's1', label: 'My lead magnet filters out bad clients automatically.' },
      { id: 's2', label: 'New leads get 3+ value emails before a pitch.' },
      { id: 's3', label: 'Strangers can buy my entry offer without a call.' },
      { id: 's4', label: 'I know my Cost Per Lead (CPL) exactly.' },
      { id: 's5', label: 'I have an automated follow-up for non-buyers.' }
    ]
  },
  {
    id: 'growth', label: 'FORCE 5: GROWTH',
    desc: 'THE VELOCITY. THE PROOF. THE RITUAL.',
    items: [
      { id: 'g1', label: 'Every claim is backed by a screenshot/story.' },
      { id: 'g2', label: 'I publish "Signal" content weekly without fail.' },
      { id: 'g3', label: 'I dominate ONE channel (vs mediocre on 4).' },
      { id: 'g4', label: 'I leverage other audiences (podcasts/partners).' },
      { id: 'g5', label: 'Clients buy from me a second time (Retention).' }
    ]
  }
];

function emptyState() {
  return {
    step: 'INTRO',
    symptom: null,
    phaseIndex: 0,
    client: { name: '', url: '', email: '' },
    checks: {},
    submission: false
  };
}

export default function App() {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : emptyState();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const scoreData = useMemo(() => {
    let total = 0, earned = 0;
    const breakdown = {};
    PHASES.forEach(p => {
      const items = p.items;
      const pEarned = items.filter(i => state.checks[p.id]?.[i.id]).length;
      breakdown[p.id] = pEarned;
      total += items.length;
      earned += pEarned;
    });
    const pct = total === 0 ? 0 : Math.round((earned / total) * 100);
    const scores = PHASES.map(p => ({ id: p.id, val: breakdown[p.id], label: p.label })).sort((a,b) => a.val - b.val);
    return { pct, breakdown, bottleneck: scores[0] };
  }, [state.checks]);

  // --- VALIDATION LOGIC ---
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleStart = () => {
    // 1. Check Name
    if (!state.client.name.trim()) {
      alert("ACCESS DENIED: OPERATOR IDENTITY REQUIRED.");
      return;
    }
    // 2. Check Email (Strict)
    if (!state.client.email.trim() || !validateEmail(state.client.email)) {
      alert("ACCESS DENIED: INVALID COORDINATES. PLEASE ENTER A VALID EMAIL.");
      return;
    }
    // 3. Grant Access
    setState(s => ({ ...s, step: 'TRIAGE' }));
  };

  const handleSymptom = (id) => {
    setState(s => ({ ...s, symptom: id, step: 'AUDIT' }));
  };

  const toggleCheck = (phaseId, itemId) => {
    setState(s => ({ ...s, checks: { ...s.checks, [phaseId]: { ...(s.checks[phaseId] || {}), [itemId]: !(s.checks[phaseId]?.[itemId]) } } }));
  };

  const nextPhase = () => {
    if (state.phaseIndex < PHASES.length - 1) {
      setState(s => ({ ...s, phaseIndex: s.phaseIndex + 1 }));
      window.scrollTo(0,0);
    } else {
      setState(s => ({ ...s, step: 'PROCESSING' }));
      setTimeout(() => setState(s => ({ ...s, step: 'REPORT' })), 2500);
      submitData(); 
    }
  };

  const submitData = async () => {
    const payload = {
      app: 'SIGNAL_AUDIT_V6.3',
      client: state.client,
      symptom: state.symptom,
      score: scoreData.pct,
      bottleneck: scoreData.bottleneck.id
    };
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ payload: JSON.stringify(payload) })
      });
      setState(s => ({ ...s, submission: true }));
    } catch(e) { console.error(e); }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let y = 15;

    const drawBg = () => {
      doc.setFillColor(0,0,0); 
      doc.rect(0,0,210,297,'F');
      doc.setTextColor(255,255,255); 
      doc.setFont("courier", "bold");
    };

    const drawLine = (yPos) => {
      doc.setDrawColor(50, 50, 50); 
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
    };

    // PAGE 1
    drawBg();

    doc.setFontSize(7);
    doc.text("QUANTUM BRANDING // INTELLIGENCE UNIT", margin, y);
    doc.text(`REF: ${Date.now().toString().slice(-6)}`, pageWidth - margin - 20, y);
    y += 15;

    doc.setFontSize(10);
    doc.text("TARGET DIAGNOSTIC REPORT", margin, y);
    y += 8;
    doc.setFontSize(18);
    doc.text(state.client.name.toUpperCase(), margin, y);
    y += 8;
    doc.setFontSize(9); 
    doc.setTextColor(150, 150, 150);
    doc.text(state.client.url.toUpperCase(), margin, y);
    doc.setTextColor(255, 255, 255);
    
    y += 10;
    drawLine(y);
    y += 15;

    doc.setFontSize(10);
    doc.text("AGGREGATE SIGNAL STRENGTH", margin, y);
    y += 25;
    doc.setFontSize(60); 
    doc.text(`${scoreData.pct}%`, margin - 3, y);
    
    doc.setFontSize(9);
    const status = scoreData.pct < 60 ? "CRITICAL FRACTURE DETECTED" : "SIGNAL INTEGRITY STABLE";
    doc.rect(margin, y + 8, 4, 4, 'F'); 
    doc.text(status, margin + 8, y + 11);

    y += 25;
    drawLine(y);
    y += 15;

    doc.setFontSize(14);
    doc.text("/// ROOT CAUSE ANALYSIS", margin, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont("courier", "normal");
    const bLabel = scoreData.bottleneck.label.split(': ')[1];
    
    const diagLines = doc.splitTextToSize(
      `Forensic analysis identifies a structural failure in [ ${bLabel} ]. This leak is the primary cause of '${state.symptom?.replace('_',' ')}'. Remediation is required immediately.`, 
      contentWidth
    );
    doc.text(diagLines, margin, y);
    y += (diagLines.length * 6) + 10;

    // PRESCRIPTION LOGIC
    const tactics = QUICK_WINS[scoreData.bottleneck.id] || QUICK_WINS['essence'];
    const boxHeight = 15 + (tactics.length * 8) + 20;

    if (y + boxHeight > pageHeight - margin) {
        doc.addPage();
        drawBg();
        y = 20;
    }

    doc.setDrawColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, boxHeight);

    let inBoxY = y + 10;
    doc.setFont("courier", "bold");
    doc.setFontSize(11);
    doc.text("TACTICAL DIRECTIVES:", margin + 5, inBoxY);
    inBoxY += 8;

    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    tactics.forEach(t => {
      doc.text(`> ${t}`, margin + 5, inBoxY);
      inBoxY += 8;
    });

    inBoxY += 4;
    doc.setFont("courier", "bold");
    doc.text("DEPLOY PROTOCOL:", margin + 5, inBoxY);
    doc.setFontSize(8);
    doc.text(KIT_LINKS[scoreData.bottleneck.id], margin + 45, inBoxY);

    // Footer
    doc.setFontSize(6);
    doc.text("CONFIDENTIAL ASSET // DO NOT DISTRIBUTE", margin, 290);

    // PAGE 2
    doc.addPage();
    drawBg();
    
    y = 20;
    doc.setFontSize(12);
    doc.text("FULL FORCE ANALYSIS LOG", margin, y);
    y += 15;
    drawLine(y);
    y += 10;
    doc.setFontSize(8);

    PHASES.forEach(p => {
      if (y > 270) { doc.addPage(); drawBg(); y = 20; }
      
      const pScore = scoreData.breakdown[p.id];
      const pTotal = p.items.length;
      
      doc.setFont("courier", "bold");
      doc.text(`[ ${p.label} ]`, margin, y);
      doc.text(`SIGNAL: ${pScore}/${pTotal}`, pageWidth - margin - 30, y);
      y += 6;
      
      doc.setFont("courier", "normal");
      p.items.forEach(item => {
        const checked = state.checks[p.id]?.[item.id];
        const boxX = margin;
        const boxY = y - 2;
        
        doc.setDrawColor(100, 100, 100);
        doc.rect(boxX, boxY, 3, 3);
        if (checked) {
          doc.setFillColor(255, 255, 255);
          doc.rect(boxX, boxY, 3, 3, 'F');
        }

        doc.setTextColor(checked ? 255 : 100);
        const lines = doc.splitTextToSize(item.label, contentWidth - 10);
        doc.text(lines, margin + 6, y);
        y += (lines.length * 4) + 2;
      });
      doc.setTextColor(255, 255, 255);
      y += 6;
    });

    doc.save(`SIGNAL_DOSSIER_${state.client.name.replace(/\s/g,'_').toUpperCase()}.pdf`);
  };

  const reset = () => {
    if(confirm("TERMINATE SESSION?")) {
      localStorage.removeItem(STORAGE_KEY);
      setState(emptyState());
    }
  };

  if (state.step === 'INTRO') return (
    <div className="min-h-screen bg-black text-white font-mono p-6 flex flex-col items-center justify-center selection:bg-white selection:text-black">
      <div className="w-full max-w-lg border border-white/20 p-8 relative">
        <div className="absolute top-0 left-0 bg-white text-black text-xs px-2 py-1 font-bold">V6.3</div>
        <div className="mb-8 mt-4">
          <Terminal size={48} className="mb-4 text-white/80" />
          <h1 className="text-4xl font-bold tracking-tighter mb-2">SIGNAL AUDIT</h1>
          <p className="text-gray-400 text-sm leading-relaxed">Detect hidden leaks in your brand architecture.</p>
        </div>
        <div className="space-y-4">
          <input value={state.client.name} onChange={e => setState(s => ({...s, client: {...s.client, name: e.target.value}}))} placeholder="OPERATOR NAME" className="w-full bg-black border border-white/30 p-3 text-white placeholder:text-gray-600 focus:border-white outline-none transition-colors" />
          <input value={state.client.email} onChange={e => setState(s => ({...s, client: {...s.client, email: e.target.value}}))} placeholder="EMAIL COORDINATES (REQUIRED)" className="w-full bg-black border border-white/30 p-3 text-white placeholder:text-gray-600 focus:border-white outline-none transition-colors" />
          <input value={state.client.url} onChange={e => setState(s => ({...s, client: {...s.client, url: e.target.value}}))} placeholder="URL TARGET" className="w-full bg-black border border-white/30 p-3 text-white placeholder:text-gray-600 focus:border-white outline-none transition-colors" />
        </div>
        <button onClick={handleStart} className="w-full mt-8 bg-white text-black font-bold p-4 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">INITIALIZE SCAN <ChevronRight size={16} /></button>
      </div>
    </div>
  );

  if (state.step === 'TRIAGE') return (
    <div className="min-h-screen bg-black text-white font-mono p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-8 text-center uppercase border-b border-white/20 pb-4">Identify Primary Symptom</h2>
        <div className="grid gap-4">
          {SYMPTOMS.map(s => (
            <button key={s.id} onClick={() => handleSymptom(s.id)} className="text-left border border-white/20 p-6 hover:bg-white hover:text-black transition-all group relative">
              <div className="font-bold text-lg mb-1">{s.label}</div>
              <div className="text-sm text-gray-400 group-hover:text-black/70">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (state.step === 'AUDIT') {
    const phase = PHASES[state.phaseIndex];
    const progress = Math.round(((state.phaseIndex) / PHASES.length) * 100);
    return (
      <div className="min-h-screen bg-white text-black font-mono flex flex-col">
        <div className="h-2 bg-gray-100 w-full"><div className="h-full bg-black transition-all duration-500" style={{width: `${progress}%`}} /></div>
        <div className="flex-1 p-6 md:p-12 flex flex-col max-w-3xl mx-auto w-full">
          <div className="mb-12">
            <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Force {state.phaseIndex + 1} / 5</div>
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-4 tracking-tighter">{phase.label.split(': ')[1]}</h2>
            <p className="text-lg text-gray-600 font-sans border-l-4 border-black pl-4">{phase.desc}</p>
          </div>
          <div className="space-y-4 mb-12 flex-1">
            {phase.items.map(item => {
              const checked = state.checks[phase.id]?.[item.id];
              return (
                <button key={item.id} onClick={() => toggleCheck(phase.id, item.id)} className={`w-full text-left p-6 border-2 transition-all flex items-start gap-4 ${checked ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-200 hover:border-black'}`}>
                  <div className={`mt-1 flex-shrink-0 ${checked ? 'text-green-400' : 'text-gray-300'}`}>{checked ? <Check size={20} /> : <div className="w-5 h-5 border border-current" />}</div>
                  <span className="text-lg font-medium leading-snug">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between items-center pt-8 border-t border-gray-100">
             <button onClick={reset} className="text-xs text-gray-400 hover:text-red-500 uppercase tracking-widest">Abort</button>
             <button onClick={nextPhase} className="bg-black text-white px-8 py-4 font-bold text-lg hover:bg-gray-800 transition-all flex items-center gap-2">{state.phaseIndex === PHASES.length - 1 ? 'RUN DIAGNOSTICS' : 'NEXT SECTOR'} <ArrowRight /></button>
          </div>
        </div>
      </div>
    );
  }

  if (state.step === 'PROCESSING') return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-8" />
      <div className="text-2xl font-bold animate-pulse">COMPILING DOSSIER...</div>
    </div>
  );

  if (state.step === 'REPORT') {
    const isCritical = scoreData.pct < 60;
    const bottleneckId = scoreData.bottleneck.id;
    const bottleneckLabel = scoreData.bottleneck.label.split(': ')[1];
    
    return (
      <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
        <div className="max-w-4xl mx-auto p-6 md:p-12">
          <div className="border-b border-white/20 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div><div className="text-xs text-gray-500 mb-2">SIGNAL AUDIT REPORT // FINAL</div><h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{state.client.name}</h1></div>
            <div className="text-right"><div className="text-xs text-gray-500 mb-1">DATE</div><div>{new Date().toLocaleDateString()}</div></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="border border-white/20 p-8 relative">
              <div className="absolute top-4 right-4 text-xs font-bold text-gray-500">OVERALL SIGNAL</div>
              <div className="text-8xl font-black tracking-tighter mb-2">{scoreData.pct}%</div>
              <div className={`inline-block px-3 py-1 text-xs font-bold border border-white`}>{isCritical ? 'CRITICAL FRACTURE' : 'SIGNAL STABLE'}</div>
            </div>
            <div className="border border-white/20 p-8 flex flex-col justify-center bg-white/5">
              <div className="flex items-center gap-3 mb-4 text-white"><AlertCircle size={24} /><div className="font-bold">PRIMARY BOTTLENECK</div></div>
              <h3 className="text-3xl font-bold uppercase mb-2">{bottleneckLabel}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">Your lowest score is in {bottleneckLabel}. This is causing your {state.symptom?.replace('_',' ')}.</p>
              <a href={KIT_LINKS[bottleneckId]} target="_blank" rel="noreferrer" className="bg-white text-black text-center py-3 font-bold hover:bg-gray-200 transition-colors">FIX THE {bottleneckLabel} LEAK &rarr;</a>
            </div>
          </div>
          
          <div className="bg-white/5 p-8 mb-16 border-l-4 border-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><LayoutTemplate size={20}/> IMMEDIATE ACTIONS FOR {bottleneckLabel}</h3>
            <ul className="space-y-3">
              {QUICK_WINS[bottleneckId].map((win, i) => (
                <li key={i} className="text-sm text-gray-300 font-mono border-b border-white/10 pb-2 last:border-0">{win}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-white/20">
            <button onClick={generatePDF} className="flex-1 border border-white py-4 font-bold hover:bg-white hover:text-black transition-colors flex justify-center items-center gap-2"><FileText size={18} /> DOWNLOAD DOSSIER</button>
            <button onClick={reset} className="px-6 py-4 text-gray-500 hover:text-white transition-colors flex items-center gap-2"><RefreshCw size={18} /> RESET</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}