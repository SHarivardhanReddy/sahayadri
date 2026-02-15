import { useEffect, useState } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'

// Import the components
import Home from './components/Home'
import Login from './components/Login'
import About from './components/About'

function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', age: '', homeState: '', contactNumber: '', healthHistory: ''
  })
  const [aiResult, setAiResult] = useState(null);
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
      // Pre-fill form in case they want to update their own info
      setFormData({
        name: res.data.name,
        age: res.data.age,
        homeState: res.data.homeState,
        contactNumber: res.data.contactNumber || res.data.mobile,
        healthHistory: res.data.healthHistory
      });
    } catch (err) {
      console.error("Profile not found or access denied.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMyProfile() }, [identifier]);

  const handleAIAnalysis = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/evaluate-fitness', {
        age: parseInt(userProfile.age),
        bmi: 24.5,
        respiratory_issue: userProfile.healthHistory?.toLowerCase().includes('asthma') ? 1 : 0,
        health_score: 85
      });
      setAiResult(res.data.fitnessStatus);
    } catch (err) {
      alert("AI Analysis Failed.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`http://localhost:5000/api/workers/${userProfile._id}`, formData);
      setEditing(false);
      alert("Your health record has been updated!");
      fetchMyProfile();
    } catch (err) { alert("Update Failed"); }
  }

  const handleLogout = () => {
    localStorage.removeItem('userIdentifier');
    navigate('/login');
  }

  if (loading) return <div className="loading">Verifying credentials...</div>;

  return (
    <div className="App">
      <header className="dashboard-header">
        <h1>Sahayadri Staff Portal</h1>
        <button onClick={handleLogout} className="logout-btn">Secure Logout</button>
      </header>

      <div className="main-container">
        {userProfile ? (
          <>
            <section className="profile-section">
              <div className="profile-card-large">
                <div className="card-header-flex">
                  <h2>My Health Credentials</h2>
                  {aiResult && (
                    <div className={`ai-badge ${aiResult}`}>
                      AI STATUS: {aiResult.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="details-grid">
                  <div className="detail-item"><strong>Name:</strong> {userProfile.name}</div>
                  <div className="detail-item"><strong>Staff ID:</strong> {userProfile._id.slice(-6).toUpperCase()}</div>
                  <div className="detail-item"><strong>Home State:</strong> {userProfile.homeState}</div>
                  <div className="detail-item"><strong>Contact:</strong> {userProfile.mobile || userProfile.contactNumber}</div>
                </div>

                <div className="health-history-box">
                  <label>Medical History</label>
                  <p>{userProfile.healthHistory || "No history recorded."}</p>
                </div>

                <div className="action-row">
                  <button className="edit-btn" onClick={() => setEditing(!editing)}>
                    {editing ? "Cancel Edit" : "Update My Details"}
                  </button>
                  <button className="ai-scan-btn" onClick={handleAIAnalysis}>✨ Run AI Fitness Scan</button>
                </div>
              </div>
            </section>

            {editing && (
              <section className="form-section">
                <div className="form-card">
                  <h2>Update My Profile</h2>
                  <form onSubmit={handleUpdate}>
                    <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    <input type="number" placeholder="Age" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} required />
                    <input type="text" placeholder="Home State" value={formData.homeState} onChange={(e) => setFormData({...formData, homeState: e.target.value})} required />
                    <textarea placeholder="Medical History" value={formData.healthHistory} onChange={(e) => setFormData({...formData, healthHistory: e.target.value})} rows="4" />
                    <button type="submit" className="submit-btn">Save Changes</button>
                  </form>
                </div>
              </section>
            )}
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
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}