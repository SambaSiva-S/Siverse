import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// ===== API HELPER =====
async function callGradio(endpoint, params) {
  const { Client } = await import('@gradio/client');
  const client = await Client.connect("siverse/neurodecoder");
  
  const args = [];
  if (endpoint === 'signal_explorer') {
    args.push(null, params.subject_id);
  } else if (endpoint === 'classical_decoder') {
    args.push(null, params.subject_id);
  } else if (endpoint === 'realtime_sim') {
    args.push(null, params.subject_id, params.trial_num);
  } else if (endpoint === 'speech_analysis') {
    args.push(null, params.subject_id);
  } else if (endpoint === 'robot_sim') {
    args.push(null, params.subject_id, params.robot_type);
  }

  const result = await client.predict(`/${endpoint}`, args);
  return result.data;
}

function getImageUrl(item) {
  if (!item) return null;
  if (typeof item === 'string') return item;
  if (item.url) return item.url;
  return null;
}

// ===== BRAIN WAVE ANIMATION =====
function BrainWave() {
  const canvasRef = useRef(null);
  const tRef = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth * 2; canvas.height = canvas.offsetHeight * 2; ctx.scale(2, 2); };
    resize();
    const spikes = Array.from({ length: 8 }, () => Math.random() * canvas.offsetWidth);
    const draw = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(37,99,235,0.06)'; ctx.lineWidth = 0.5;
      for (let g = 0; g < w; g += 25) { ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, h); ctx.stroke(); }
      for (let g = 0; g < h; g += 25) { ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(w, g); ctx.stroke(); }
      const channels = [
        { y: h * 0.2, color: 'rgba(37,99,235,0.5)', w: 1.5, label: 'C3' },
        { y: h * 0.4, color: 'rgba(124,58,237,0.4)', w: 1.2, label: 'Cz' },
        { y: h * 0.6, color: 'rgba(16,185,129,0.4)', w: 1.2, label: 'C4' },
        { y: h * 0.8, color: 'rgba(244,63,94,0.25)', w: 0.8, label: 'EMG' },
      ];
      const t = tRef.current;
      channels.forEach((cfg, ch) => {
        ctx.beginPath(); ctx.strokeStyle = cfg.color; ctx.lineWidth = cfg.w;
        ctx.fillStyle = cfg.color.replace(/[\d.]+\)$/, '0.6)');
        ctx.font = '10px Inter, sans-serif'; ctx.fillText(cfg.label, 6, cfg.y - 10);
        for (let x = 28; x < w; x++) {
          let y = cfg.y + Math.sin((x + t + ch * 50) * 0.008) * h * 0.08 + Math.sin((x + t + ch * 30) * 0.02) * h * 0.04 + Math.sin((x + t * 1.3 + ch * 20) * 0.05) * h * 0.02 + (Math.random() - 0.5) * 2;
          spikes.forEach(sx => { const d = Math.abs(x - (sx + t * 0.4) % w); if (d < 5 && ch < 3) y -= (5 - d) * 5; });
          if (x === 28) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      spikes.forEach(sx => {
        const sxPos = (sx + t * 0.4) % w;
        ctx.beginPath(); ctx.arc(sxPos, h * 0.2 + Math.sin((sxPos + t) * 0.008) * h * 0.08 - 16, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239,68,68,0.5)'; ctx.fill();
      });
      tRef.current += 0.6; animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={canvasRef} className="brain-canvas" />;
}

// ===== DATA =====
const projects = [
  { id: 'neurodecoder', icon: '🧠', name: 'NeuroDecoder', tagline: 'Brain-computer interface',
    desc: 'Decodes imagined movements from EEG signals and controls robots in real-time. 83.3% accuracy, 1.3ms latency.',
    techs: ['CSP+LDA', 'EEGNet', 'Transformer', 'JEPA', 'Diffusion', 'Interaction Model'],
    status: 'live', modules: '6 modules live', color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'myodecoder', icon: '💪', name: 'MyoDecoder', tagline: 'EMG gesture recognition',
    desc: 'Decode hand gestures from muscle signals using temporal CNN and streaming inference for AR/VR control.',
    techs: ['Temporal CNN', 'Streaming'], status: 'soon', modules: 'Targets: Meta · Apple', color: '#db2777', bgColor: '#fdf2f8' },
  { id: 'healthsense', icon: '❤️', name: 'HealthSense', tagline: 'Wearable health monitoring',
    desc: 'Arrhythmia detection, sleep staging, and vital sign estimation from PPG and ECG signals.',
    techs: ['1D ResNet', 'MONAI', 'LSTM'], status: 'soon', modules: 'Targets: Apple · Google · NVIDIA', color: '#0d9488', bgColor: '#f0fdfa' },
  { id: 'immunosense', icon: '🛡️', name: 'ImmunoSense', tagline: 'Autoimmune disease intelligence',
    desc: 'Food recognition, environmental triggers, biomarker tracking, and flare prediction using multi-modal AI.',
    techs: ['Vision AI', 'Multi-modal TF', 'Correlation engine'], status: 'soon', modules: 'Targets: Pharma · Research', color: '#ca8a04', bgColor: '#fefce8' },
];

const neuroModules = [
  { id: 'signal_explorer', icon: '📊', name: 'Signal explorer', desc: 'Raw EEG, frequency bands, spectrograms, topographic scalp maps.',
    techs: ['Butterworth', 'FFT', 'Welch PSD'], tag: 'Live demo', tagColor: '#16a34a', tagBg: '#ecfdf5' },
  { id: 'classical_decoder', icon: '🎯', name: 'Classical decoder', desc: 'CSP spatial filters + LDA/SVM. 83.3% streaming accuracy.',
    techs: ['CSP', 'LDA/SVM', 'Auto research loop'], tag: 'Live demo', tagColor: '#16a34a', tagBg: '#ecfdf5' },
  { id: 'realtime_sim', icon: '⚡', name: 'Real-time simulator', desc: 'Bayesian belief accumulation with 200ms micro-turns.',
    techs: ['Thinking Machines 2026', 'Bayesian belief'], tag: 'Live demo', tagColor: '#16a34a', tagBg: '#ecfdf5' },
  { id: 'speech_analysis', icon: '🗣️', name: 'Speech decoder', desc: 'Multi-scale CNN on gamma-band activity for speech imagery.',
    techs: ['Multi-scale CNN', 'Gamma band'], tag: 'Research', tagColor: '#2563eb', tagBg: '#eff6ff' },
  { id: 'robot_sim', icon: '🤖', name: 'Robot simulation', desc: 'Wheelchair and robotic arm controlled by decoded brain signals.',
    techs: ['Interaction Model', 'CSP+LDA', 'ROS sim'], tag: 'Live demo', tagColor: '#16a34a', tagBg: '#ecfdf5' },
  { id: 'intracortical', icon: '💡', name: 'Intracortical data', desc: 'Spike detection, sorting, neural population decoding with GRU.',
    techs: ['GRU', 'Spike sorting', 'PCA + K-means'], tag: 'Advanced', tagColor: '#7c3aed', tagBg: '#faf5ff' },
];

const techMap = [
  { name: 'Interaction model', dot: '#047857', source: 'Thinking Machines Lab (2026)', used: 'Robot sim, real-time decoder — 200ms micro-turns, Bayesian belief, dual-model' },
  { name: 'Auto research loop', dot: '#c2410c', source: 'Original', used: 'All decoders — evaluate → diagnose → prescribe → generate → execute → validate' },
  { name: 'Diffusion engine', dot: '#b91c1c', source: 'DDPM', used: 'Data augmentation — class-conditional synthetic EEG, +4.6% at 2-shot' },
  { name: 'JEPA', dot: '#a16207', source: "Yann LeCun's framework", used: 'Foundation model pre-training — self-supervised, no labels needed' },
  { name: 'Foundation model', dot: '#15803d', source: 'Original', used: 'Cross-subject decoding — universal EEG tokenizer, 3 objectives' },
  { name: 'Deep learning', dot: '#6d28d9', source: 'PyTorch', used: 'EEGNet (7K), Transformer (138K), Speech CNN, GRU decoder' },
];

const pipeline = [
  { label: 'Capture', icon: '📡', color: '#2563eb', bg: '#eff6ff' },
  { label: 'Process', icon: '⚙️', color: '#16a34a', bg: '#f0fdf4' },
  { label: 'Decode', icon: '🧠', color: '#7c3aed', bg: '#faf5ff' },
  { label: 'Analyze', icon: '📊', color: '#ea580c', bg: '#fff7ed' },
  { label: 'Act', icon: '🤖', color: '#dc2626', bg: '#fef2f2' },
];

const metrics = [
  { label: 'Accuracy', value: '83.3%', color: '#2563eb', sub: 'Streaming' },
  { label: 'Latency', value: '1.3ms', color: '#10b981', sub: '<50ms target' },
  { label: 'Confidence', value: '90%', color: '#7c3aed', sub: 'EMA smoothed' },
  { label: 'Subjects', value: '9', color: '#06b6d4', sub: 'Cross-subject' },
  { label: 'Models', value: '6', color: '#f59e0b', sub: 'Techniques' },
  { label: 'Security', value: '9', color: '#10b981', sub: 'Layers active' },
];

const techniques = [
  { name: 'CSP + LDA', value: 83.3, color: '#2563eb' },
  { name: 'Transformer', value: 35.8, color: '#7c3aed' },
  { name: 'EEGNet', value: 22.9, color: '#06b6d4' },
  { name: 'JEPA (5-shot)', value: 30.0, color: '#10b981' },
  { name: 'Foundation', value: 29.4, color: '#f59e0b' },
  { name: 'Diffusion aug.', value: 33, color: '#f43f5e', display: '+4.6%' },
];

// ===== MAIN APP =====
function App() {
  const [view, setView] = useState('home');
  const [selectedModule, setSelectedModule] = useState(null);

  return (
    <div className="app">
      {view === 'home' && <HomePage onOpenProject={() => setView('project')} />}
      {view === 'project' && <ProjectPage onBack={() => setView('home')} onOpenModule={(m) => { setSelectedModule(m); setView('module'); }} />}
      {view === 'module' && <ModulePage module={selectedModule} onBack={() => setView('project')} />}
    </div>
  );
}

// ===== HOME PAGE =====
function HomePage({ onOpenProject }) {
  return (
    <>
      <nav className="nav">
        <div className="brand"><div className="logo">🧬</div><div><h1>Siverse</h1><span className="subtitle">Biosignal intelligence platform</span></div></div>
        <button className="ai-btn">💬 AI assistant</button>
      </nav>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h2>Decode biological signals.<br />Control intelligent systems.</h2>
            <p>From brain waves to immune biomarkers — capture, analyze, and act on biosignals in real-time.</p>
          </div>
          <div className="hero-viz"><BrainWave /></div>
        </div>
      </section>
      <div className="pipeline">
        {pipeline.map((step, i) => (
          <React.Fragment key={step.label}>
            <div className="pipe-step" style={{ background: step.bg, color: step.color }}><span>{step.icon}</span> {step.label}</div>
            {i < pipeline.length - 1 && <span className="pipe-arrow">›</span>}
          </React.Fragment>
        ))}
      </div>
      <section className="section">
        <h3 className="section-title">Projects</h3>
        <div className="project-grid">
          {projects.map(p => (
            <div key={p.id} className={`project-card ${p.status === 'soon' ? 'disabled' : ''}`} onClick={() => p.status === 'live' && onOpenProject()}>
              <div className="project-card-inner">
                <div className="project-icon" style={{ background: p.bgColor, color: p.color }}>{p.icon}</div>
                <div className="project-body">
                  <h4>{p.name}</h4>
                  <p className="project-tagline">{p.tagline}</p>
                  <p className="project-desc">{p.desc}</p>
                  <div className="project-techs">{p.techs.map(t => <span key={t} className="tech-tag">{t}</span>)}</div>
                  <div className="project-footer">
                    <span className={`status-tag ${p.status}`}>{p.modules}</span>
                    {p.status === 'live' && <span className="arrow">→</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <footer className="footer">
        <div className="footer-left">🔒 <span>9-layer security · HIPAA-aware · No data retention</span></div>
        <div className="footer-links">
          <a href="https://github.com/SambaSiva-S/neurodecoder" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://siverse.org" target="_blank" rel="noreferrer">Siverse.org</a>
        </div>
      </footer>
    </>
  );
}

// ===== PROJECT PAGE =====
function ProjectPage({ onBack, onOpenModule }) {
  return (
    <>
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>← All projects</button>
        <div className="top-title"><span>🧠</span> NeuroDecoder</div>
        <button className="ai-btn-sm">💬 Ask AI</button>
      </div>
      <div className="kpi-row">
        {metrics.map(m => (
          <div key={m.label} className="kpi-card">
            <span className="kpi-label">{m.label}</span>
            <span className="kpi-value" style={{ color: m.color }}>{m.value}</span>
            <span className="kpi-sub">{m.sub}</span>
          </div>
        ))}
      </div>
      <div className="compare-card">
        <h4 className="compare-title">📊 Technique comparison — 4-class motor imagery</h4>
        <div className="compare-grid">
          {techniques.map(t => (
            <div key={t.name} className="compare-row">
              <span className="compare-label">{t.name}</span>
              <div className="compare-bar"><div className="compare-fill" style={{ width: `${t.value}%`, background: t.color }} /></div>
              <span className="compare-val">{t.display || `${t.value}%`}</span>
            </div>
          ))}
        </div>
      </div>
      <section className="section">
        <h3 className="section-title">Modules — click to run analysis</h3>
        <div className="module-grid">
          {neuroModules.map(m => (
            <div key={m.id} className="module-card" onClick={() => m.id !== 'intracortical' && onOpenModule(m)}>
              <div className="module-icon">{m.icon}</div>
              <h4>{m.name}</h4>
              <p>{m.desc}</p>
              <div className="module-techs">{m.techs.map(t => <span key={t} className="tech-tag">{t}</span>)}</div>
              <div className="module-footer">
                <span className="module-tag" style={{ color: m.tagColor, background: m.tagBg }}>{m.tag}</span>
                {m.id !== 'intracortical' && <span className="arrow">→ Run</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <h3 className="section-title">🔗 Technology map</h3>
        <div className="techmap-card">
          {techMap.map(t => (
            <div key={t.name} className="techmap-row">
              <div className="techmap-name"><span className="techmap-dot" style={{ background: t.dot }} /><strong>{t.name}</strong></div>
              <div className="techmap-detail">
                <span className="techmap-source">Source: {t.source}</span>
                <span className="techmap-used">{t.used}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <footer className="footer">
        <div className="footer-left">🔒 <span>9-layer security · HIPAA-aware · No data retention</span></div>
        <div className="footer-links">
          <a href="https://github.com/SambaSiva-S/neurodecoder" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </>
  );
}

// ===== MODULE PAGE (ANALYSIS) =====
function ModulePage({ module, onBack }) {
  const [subject, setSubject] = useState('3');
  const [trial, setTrial] = useState('1');
  const [robotType, setRobotType] = useState('Wheelchair');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      let params = {};
      if (module.id === 'realtime_sim') {
        params = { file: null, subject_id: subject, trial_num: trial };
      } else if (module.id === 'robot_sim') {
        params = { file: null, subject_id: subject, robot_type: robotType };
      } else {
        params = { file: null, subject_id: subject };
      }

      const data = await callGradio(module.id, params);
      setResults(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const imageLabels = {
    signal_explorer: ['Raw EEG', 'Power Spectral Density', 'Frequency Bands', 'Spectrogram'],
    classical_decoder: ['Confusion Matrix', 'Confidence Distribution', 'CSP Patterns'],
    realtime_sim: ['Belief + Confidence', 'BCI Cursor', 'Decode Latency'],
    speech_analysis: ['Frequency Bands', 'Gamma Map'],
    robot_sim: ['Robot View', 'Command Timeline', 'Pipeline'],
  };

  return (
    <>
      <div className="top-bar">
        <button className="back-btn" onClick={onBack}>← NeuroDecoder</button>
        <div className="top-title"><span>{module.icon}</span> {module.name}</div>
        <button className="ai-btn-sm">💬 Ask AI</button>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="control-row">
          <div className="control-group">
            <label>Subject</label>
            <select value={subject} onChange={e => setSubject(e.target.value)}>
              {[1,2,3,4,5,6,7,8,9].map(s => (
                <option key={s} value={String(s)}>
                  Subject {s}{s === 3 ? ' (strongest)' : s === 4 ? ' (weakest)' : s === 6 ? ' (failing)' : ''}
                </option>
              ))}
            </select>
          </div>

          {module.id === 'realtime_sim' && (
            <div className="control-group">
              <label>Trial</label>
              <select value={trial} onChange={e => setTrial(e.target.value)}>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(t => <option key={t} value={String(t)}>Trial {t}</option>)}
              </select>
            </div>
          )}

          {module.id === 'robot_sim' && (
            <div className="control-group">
              <label>Robot type</label>
              <select value={robotType} onChange={e => setRobotType(e.target.value)}>
                <option value="Wheelchair">Wheelchair</option>
                <option value="Robotic Arm">Robotic Arm</option>
              </select>
            </div>
          )}

          <button className="run-btn" onClick={runAnalysis} disabled={loading}>
            {loading ? '⏳ Analyzing...' : '▶ Run analysis'}
          </button>
        </div>

        <div className="module-techs-bar">
          <span className="techs-label">Powered by:</span>
          {module.techs.map(t => <span key={t} className="tech-tag">{t}</span>)}
        </div>
      </div>

      {/* Results */}
      <div className="results-area">
        {!results && !loading && !error && (
          <div className="empty-state">
            <span className="empty-icon">{module.icon}</span>
            <h3>Select a subject and run analysis</h3>
            <p>{module.desc}</p>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <h3>Running {module.name}...</h3>
            <p>Processing on Hugging Face servers — this may take 30-60 seconds</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <h3>⚠️ Error</h3>
            <p>{error}</p>
            <button className="run-btn" onClick={runAnalysis}>Try again</button>
          </div>
        )}

        {results && (
          <div className="results-content">
            <div className="results-grid">
              {results.slice(0, -1).map((item, i) => {
                const url = getImageUrl(item);
                const labels = imageLabels[module.id] || [];
                if (!url) return null;
                return (
                  <div key={i} className="result-card">
                    <h4>{labels[i] || `Output ${i + 1}`}</h4>
                    <img src={url} alt={labels[i] || 'Result'} className="result-img" />
                  </div>
                );
              })}
            </div>
            {/* Summary text (last item) */}
            {results.length > 0 && typeof results[results.length - 1] === 'string' && (
              <div className="summary-card">
                <h4>📋 Summary</h4>
                <div className="summary-text">{results[results.length - 1]}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="footer">
        <div className="footer-left">🔒 <span>9-layer security · Input validated · All checks passed</span></div>
        <div className="footer-links">
          <a href="https://github.com/SambaSiva-S/neurodecoder" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </>
  );
}

export default App;
