import { useEffect, useState } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'

// Import the components
import Home from './components/Home'
import Login from './components/Login'
import DoctorDashboard from './components/DoctorDashboard'

function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [chartData, setChartData] = useState(null);
  const navigate = useNavigate();

  // Retrieve the identity used at login
  const identifier = localStorage.getItem('userIdentifier');

  const fetchMyProfile = async () => {
    if (!identifier) {
      navigate('/login');
      return;
    }
    try {
      // Fetch only the matching record for privacy
      const res = await axios.get(`http://localhost:5000/api/workers/me/${identifier}`);
      setUserProfile(res.data);
      // no edit allowed for workers — just load profile
    } catch (err) {
      console.error("Profile not found or access denied.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMyProfile() }, [identifier]);

  const handleAIAnalysis = async () => {
    try {
      const history = userProfile.healthHistory || '';
      const age = parseInt(userProfile.age) || 30;
      const respiratory_issue = history.toLowerCase().includes('asthma') || history.toLowerCase().includes('respir') ? 1 : 0;

      const computeHealthScore = (h) => {
        if (!h) return 70;
        const s = h.toLowerCase();
        if (s.includes('fit') && !s.includes('mild')) return 90;
        if (s.includes('mild')) return 70;
        if (s.includes('recover')) return 65;
        if (s.includes('skin')) return 75;
        if (s.includes('diabet')) return 40;
        if (s.includes('hyper') || s.includes('hypertension')) return 45;
        return 60;
      };

      const health_score = computeHealthScore(history);

      const computeBmi = () => {
        if (userProfile.bmi) return parseFloat(userProfile.bmi);
        if (age >= 55) return 31.0;
        if (respiratory_issue === 1 || health_score <= 50) return 31.0;
        return 24.5;
      };

      const bmi = computeBmi();

      const res = await axios.post('http://localhost:5000/api/evaluate-fitness', {
        age,
        bmi,
        respiratory_issue,
        health_score
      });
      setAiResult(res.data.fitnessStatus);

      // Prepare contribution factors from the worker record for explanation
      const contributions = [];

      // Critical conditions
      if (userProfile.heart_issue) contributions.push({ key: 'heart_issue', label: 'Heart issue', value: 3 });
      if (userProfile.chest_pain) contributions.push({ key: 'chest_pain', label: 'Chest pain', value: 3 });
      if (userProfile.kidney_issue) contributions.push({ key: 'kidney_issue', label: 'Kidney issue', value: 3 });

      // Injuries
      const injuryCount = ['knee_pain','leg_injury','hand_injury'].reduce((s,k)=> s + (userProfile[k] ? 1:0), 0);
      if (injuryCount > 0) contributions.push({ key: 'injuries', label: `${injuryCount} injury(s)`, value: Math.min(3, injuryCount) });

      // Respiratory / asthma
      if (userProfile.asthma || respiratory_issue) contributions.push({ key: 'asthma', label: 'Respiratory issue', value: 2 });

      // Age-related risk
      if (age >= 60) contributions.push({ key: 'age', label: 'Age risk', value: 2 });

      // Lifestyle
      if (userProfile.smoking) contributions.push({ key: 'smoking', label: 'Smoking', value: 1 });
      if (userProfile.alcohol) contributions.push({ key: 'alcohol', label: 'Alcohol use', value: 1 });

      // If no significant flags, show health_score as positive contributor
      if (contributions.length === 0) {
        contributions.push({ key: 'healthy', label: 'No notable risk factors', value: 3 });
      }

      // Normalize contributions to percentages
      const total = contributions.reduce((s,c)=> s + c.value, 0) || 1;
      const contributionsPct = contributions.map(c => ({...c, pct: Math.round((c.value/total)*100)}));

      setChartData({ contributions: contributionsPct, fitnessStatus: res.data.fitnessStatus, health_score: Math.round(health_score) });
      setShowResults(true);
    } catch (err) {
      alert("AI Analysis Failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userIdentifier');
    navigate('/login');
  }

  if (loading) return <div className="loading">Verifying credentials...</div>;

  return (
    <div className="App">
      <header className="dashboard-header">
        <h1>Worker Portal</h1>
        <button onClick={handleLogout} className="logout-btn">Secure Logout</button>
      </header>

      <div className="main-container">
        {userProfile ? (
          <>
            <section className="profile-section">
              <div className={`profile-card-large flip-card ${showResults ? 'is-flipped' : ''}`}>
                <div className="flip-inner">
                  <div className="flip-front">
                    <div className="card-header-flex">
                      <h2>Health Credentials</h2>
                      {aiResult && (
                        <div className={`ai-badge ${aiResult}`}>
                          AI STATUS: {aiResult.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="details-grid">
                      <div className="detail-item"><strong>Name:</strong> {userProfile.name}</div>
                      <div className="detail-item"><strong>Aadhar ID:</strong> {userProfile.aadhar || 'Not Provided'}</div>
                      <div className="detail-item"><strong>Home State:</strong> {userProfile.homeState}</div>
                      <div className="detail-item"><strong>Contact:</strong> {userProfile.mobile || userProfile.contactNumber}</div>
                    </div>

                    <div className="health-history-box">
                      <label>Medical History</label>
                      <p>{userProfile.healthHistory || "No history recorded."}</p>
                    </div>

                    <div className="action-row">
                      <button className="ai-scan-btn" onClick={handleAIAnalysis}>✨ Run AI Fitness Scan</button>
                    </div>
                  </div>

                  <div className="flip-back">
                    <div className="card-header-flex">
                      <h2>AI Fitness Results</h2>
                      {chartData && (
                        <div className={`ai-badge ${chartData.fitnessStatus}`}>
                          {chartData.fitnessStatus.toUpperCase()}
                        </div>
                      )}
                    </div>
                      <div className="chart-wrap">
                        {chartData && (
                          <div style={{display:'flex',gap:18,alignItems:'center'}}>
                            <svg viewBox="0 0 200 200" width="220" height="220">
                              <defs>
                                <filter id="f1" x="-20%" y="-20%" width="140%" height="140%">
                                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0b2230" floodOpacity="0.06"/>
                                </filter>
                              </defs>
                              <g transform="translate(100,100)" filter="url(#f1)">
                                {(() => {
                                  const colors = ['#2563eb','#ffb020','#10b981','#ef4444','#8b5cf6','#f97316'];
                                  let start = 0;
                                  return chartData.contributions.map((c, i) => {
                                    const value = c.pct;
                                    const end = start + (value/100) * Math.PI*2;
                                    const large = value > 50 ? 1 : 0;
                                    const x1 = Math.cos(start) * 60;
                                    const y1 = Math.sin(start) * 60;
                                    const x2 = Math.cos(end) * 60;
                                    const y2 = Math.sin(end) * 60;
                                    const d = `M 0 0 L ${x1} ${y1} A 60 60 0 ${large} 1 ${x2} ${y2} Z`;
                                    start = end;
                                    return <path key={c.key} d={d} fill={colors[i % colors.length]} stroke="#fff" strokeWidth="1" />
                                  })
                                })()}
                              </g>
                            </svg>

                            <div style={{display:'flex',flexDirection:'column',gap:8}}>
                              {chartData.contributions.map((c) => (
                                <div key={c.key} style={{display:'flex',gap:10,alignItems:'center'}}>
                                  <div style={{width:12,height:12,background:'#2563eb',borderRadius:3,flex:'0 0 12px'}}></div>
                                  <div style={{fontSize:14,color:'#213444'}}>{c.label} — {c.pct}%</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div style={{marginTop:16}}>
                        <div style={{color:'#274151', fontWeight:700}}>Result: {chartData ? chartData.fitnessStatus.toUpperCase() : 'N/A'}</div>
                        <div style={{marginTop:8,color:'#3b4b52'}}>Explanation: {chartData && chartData.contributions.length ? chartData.contributions.map(c=>c.label).join(', ') : 'No notable risk factors.'}</div>
                        <div style={{marginTop:12, display:'flex', justifyContent:'flex-end'}}>
                          <button className="submit-btn" onClick={() => { setShowResults(false); setChartData(null); }}>Back</button>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="error-container">
            <h2>Access Restricted</h2>
            <p>No health record found matching <strong>{identifier}</strong>.</p>
            <button onClick={() => navigate('/login')}>Return to Login</button>
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