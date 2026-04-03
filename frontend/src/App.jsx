import { useEffect, useState } from 'react'
import apiClient from './api/axiosConfig'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'

// Import the components
import Home from './components/Home'
import Login from './components/Login'
import DoctorDashboard from './components/DoctorDashboard'

const JOB_TYPES = [
  { id: 'general_labour', label: 'General Labour' },
  { id: 'construction', label: 'Construction' },
  { id: 'assembly', label: 'Assembly' },
  { id: 'heavy_lifting', label: 'Heavy Lifting' },
  { id: 'weight_lifting', label: 'Weight Lifting' }
];

function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJobs, setSelectedJobs] = useState(['general_labour']);
  const [aiResults, setAiResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const identifier = localStorage.getItem('userIdentifier');

  const fetchMyProfile = async () => {
    if (!identifier) {
      navigate('/login');
      return;
    }
    try {
      const res = await apiClient.get(`/api/workers/me/${identifier}`);
      setUserProfile(res.data);
    } catch (err) {
      console.error("Profile not found or access denied.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMyProfile() }, [identifier]);

  const toggleJob = (jobId) => {
    if (selectedJobs.includes(jobId)) {
      if (selectedJobs.length > 1) setSelectedJobs(selectedJobs.filter(j => j !== jobId));
    } else {
      setSelectedJobs([...selectedJobs, jobId]);
    }
  }

  const handleAIAnalysis = async () => {
    try {
      // Send the REAL database profile plus the requested jobs to the backend
      const payload = {
        ...userProfile,
        work_types: selectedJobs
      };

      const res = await apiClient.post('/api/evaluate-fitness', payload);
      
      // The updated backend returns the consolidated Python result
      // Format: { fitness_status: "Fit", contributions: [...] }
      if (res.data.success && res.data.results) {
        const resultData = res.data.results;
        const confPercent = Math.round(parseFloat(resultData.confidence) * 100);
        
        const total = resultData.contributions.reduce((sum, c) => sum + c.value, 0) || 1;
        
        let normalized = [];
        let runningSum = 0;
        
        resultData.contributions.forEach((c, i) => {
            let slicePct = Math.round((c.value / total) * confPercent);
            if (slicePct < 1) slicePct = 1;
            
            // Prevent rounding errors from exceeding confPercent
            if (runningSum + slicePct > confPercent && i === resultData.contributions.length - 1) {
                slicePct = confPercent - runningSum;
            }
            
            runningSum += slicePct;
            normalized.push({ ...c, pct: slicePct });
        });
        
        // Fix any rounding gap to exactly match confPercent
        if (runningSum < confPercent && normalized.length > 0) {
            normalized[0].pct += (confPercent - runningSum);
        }
        
        // Add the opposite slice for the remaining uncertainty
        const remaining = 100 - confPercent;
        if (remaining > 0) {
            if (resultData.fitness_status === 'Unfit') {
                normalized.push({ key: 'fit_chance', label: 'Cleared Medical Metrics', pct: remaining });
            } else {
                normalized.push({ key: 'unfit_risk', label: 'Inherent Occupational Risk', pct: remaining });
            }
        }
        
        setAiResults({
            status: resultData.fitness_status,
            confidence: resultData.confidence,
            contributions: normalized
        });
        setShowResults(true);
      } else {
        alert("AI Server returned an unexpected format.");
      }
    } catch (err) {
      console.error(err);
      alert("AI Analysis Failed. Ensure the AI and Node servers are running.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userIdentifier');
    navigate('/login');
  }

  // Active health flags
  const healthBooleans = ['asthma', 'knee_pain', 'leg_injury', 'appendicitis_history', 'hand_injury', 'headache_issue', 'eyesight_issue', 'chest_pain', 'heart_issue', 'kidney_issue', 'smoking', 'alcohol'];
  const activeFlags = userProfile ? healthBooleans.filter(b => userProfile[b]) : [];

  if (loading) return <div className="loading portal-page">Verifying credentials…</div>;

  return (
    <div className="App portal-page">
      <header className="portal-header portal-header--worker">
        <div className="portal-header__brand">
          <h1 className="portal-header__title">Worker portal</h1>
          <span className="portal-header__subtitle">Your health record and AI fitness scan</span>
        </div>
        <button type="button" onClick={handleLogout} className="logout-btn">Log out</button>
      </header>

      <div className="portal-main">
        {userProfile ? (
          <>
            <section className="profile-section">
              <div className={`profile-card-large flip-card ${showResults ? 'is-flipped' : ''}`} style={{ minHeight: showResults ? 'auto' : 520 }}>
                <div className="flip-inner">
                  
                  {/* ---- FRONT ENTRY PAGE ---- */}
                  <div className="flip-front">
                    <div className="card-header-flex">
                      <h2>Health credentials</h2>
                    </div>

                    <div className="details-grid">
                      <div className="detail-item"><strong>Name</strong> {userProfile.name}</div>
                      <div className="detail-item"><strong>Age</strong> {userProfile.age}</div>
                      <div className="detail-item"><strong>Home state</strong> {userProfile.homeState}</div>
                      <div className="detail-item"><strong>Contact</strong> {userProfile.mobile || userProfile.contactNumber}</div>
                    </div>

                    <div className="flags-panel">
                      <label className="flags-panel__label">Registered medical flags</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {activeFlags.length > 0 ? (
                           activeFlags.map(f => (
                             <span key={f} className="flag-chip flag-chip--risk">
                               {f.replace('_', ' ')}
                             </span>
                           ))
                        ) : (
                           <span className="flag-chip flag-chip--ok">fit — no flags recorded</span>
                        )}
                      </div>
                    </div>

                    <div className="job-picker">
                      <h4>Select jobs to analyze</h4>
                      <div className="job-picker__grid">
                        {JOB_TYPES.map(job => (
                          <label key={job.id} className="job-chip">
                            <input 
                              type="checkbox" 
                              checked={selectedJobs.includes(job.id)} 
                              onChange={() => toggleJob(job.id)} 
                            />
                            {job.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="action-row" style={{ marginTop: 20 }}>
                      <button type="button" className="ai-scan-btn" onClick={handleAIAnalysis}>Run AI fitness scan</button>
                    </div>
                  </div>

                  {/* ---- BACK RESULTS PAGE ---- */}
                  <div className="flip-back" style={{overflowY: 'auto'}}>
                    <div className="card-header-flex">
                      <h2>Explainable AI Results</h2>
                    </div>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: 30, marginTop: 15}}>
                      {aiResults && (
                           <div style={{background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0'}}>
                              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
                                 <h3 style={{margin: 0, color: '#1e293b'}}>Combined Scenario Analysis</h3>
                                 <div className={`ai-badge ${aiResults.status}`}>
                                   {aiResults.status.toUpperCase()} ({Math.round(aiResults.confidence * 100)}%)
                                 </div>
                              </div>
                              
                              <div className="chart-wrap" style={{background: '#fff', padding: 15, borderRadius: 8}}>
                                <div style={{display:'flex', gap:20, alignItems:'center', flexWrap: 'wrap'}}>
                                  <svg viewBox="0 0 200 200" width="160" height="160">
                                    <defs>
                                      <filter id="f1" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0b2230" floodOpacity="0.05"/>
                                      </filter>
                                    </defs>
                                    <g transform="translate(100,100)" filter="url(#f1)">
                                      {(() => {
                                        let start = 0;
                                        return aiResults.contributions.map((c, i) => {
                                          const value = c.pct;
                                          const end = start + (value/100) * Math.PI*2;
                                          const large = value > 50 ? 1 : 0;
                                          const x1 = Math.cos(start) * 70;
                                          const y1 = Math.sin(start) * 70;
                                          const x2 = Math.cos(end) * 70;
                                          const y2 = Math.sin(end) * 70;
                                          
                                          // Safe = green, Unsafe (illnesses/demands) = red
                                          const isSafe = aiResults.status === 'Fit' ? (c.key !== 'unfit_risk') : (c.key === 'fit_chance');
                                          const sliceColor = isSafe ? '#10b981' : '#ef4444';
                                          
                                          const midAngle = start + ((value/100) * Math.PI)/2;
                                          const textX = Math.cos(midAngle) * 45;
                                          const textY = Math.sin(midAngle) * 45 + 5; // +5 to vertically center dominantBaseline fallback
                                          
                                          let sliceEl;
                                          if (value >= 99) {
                                            sliceEl = <circle key={c.key} cx="0" cy="0" r="70" fill={sliceColor} stroke="#fff" strokeWidth="2" />;
                                          } else {
                                            const d = `M 0 0 L ${x1} ${y1} A 70 70 0 ${large} 1 ${x2} ${y2} Z`;
                                            sliceEl = <path key={c.key} d={d} fill={sliceColor} stroke="#fff" strokeWidth="2" />;
                                          }
                                          
                                          start = end;
                                          return (
                                            <g key={c.key}>
                                               {sliceEl}
                                               {value > 4 && (
                                                 <text x={textX} y={textY} fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">
                                                   {i + 1}
                                                 </text>
                                               )}
                                            </g>
                                          );
                                        })
                                      })()}
                                    </g>
                                  </svg>

                                  <div style={{display:'flex', flexDirection:'column', gap:8, flex: 1}}>
                                    <h4 style={{margin: '0 0 5px 0', fontSize: 13, color: '#64748b', textTransform:'uppercase'}}>Combined Feature Impact</h4>
                                    {aiResults.contributions.map((c, idx) => {
                                      const isSafe = aiResults.status === 'Fit' ? (c.key !== 'unfit_risk') : (c.key === 'fit_chance');
                                      const sliceColor = isSafe ? '#10b981' : '#ef4444';
                                      return (
                                        <div key={c.key} style={{display:'flex', gap:10, alignItems:'center'}}>
                                          <div style={{width:20, height:20, background: sliceColor, borderRadius:'4px', flex:'0 0 20px', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize: 12, fontWeight: 'bold'}}>
                                            {idx + 1}
                                          </div>
                                          <div style={{fontSize:14, color:'#334155', fontWeight: 500}}>{c.label}</div>
                                          <div style={{marginLeft: 'auto', fontSize:13, color:'#94a3b8', fontWeight: 'bold'}}>{c.pct}%</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                           </div>
                      )}
                    </div>

                    <div style={{marginTop:25, display:'flex', justifyContent:'center'}}>
                      <button className="submit-btn" style={{padding: '12px 30px', fontSize: 16}} onClick={() => { setShowResults(false); setAiResults(null); }}>← Run Another Scan</button>
                    </div>
                  </div>

                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="error-container">
            <h2>Access restricted</h2>
            <p>No health record found for <strong>{identifier}</strong>.</p>
            <button type="button" onClick={() => navigate('/login')}>Return to login</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}