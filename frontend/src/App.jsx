import { useEffect, useState } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Import the components
import Home from './components/Home'
import Login from './components/Login'
import About from './components/About'

function Dashboard() {
  const [workers, setWorkers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', age: '', homeState: '', contactNumber: '', healthHistory: ''
  })
  const [aiResults, setAiResults] = useState({});

  const fetchWorkers = () => {
    axios.get('http://localhost:5000/api/workers').then(res => setWorkers(res.data))
  }

  useEffect(() => { fetchWorkers() }, [])

  const handleAIAnalysis = async (worker) => {
    try {
      const res = await axios.post('http://localhost:5000/api/evaluate-fitness', {
        age: parseInt(worker.age),
        bmi: 24.5,
        respiratory_issue: worker.healthHistory.toLowerCase().includes('asthma') ? 1 : 0,
        health_score: 85
      });
      setAiResults(prev => ({ ...prev, [worker._id]: res.data.fitnessStatus }));
    } catch (err) {
      alert("AI Analysis Failed.");
    }
  };

  const handleEdit = (worker) => {
    setEditingId(worker._id);
    setFormData({
      name: worker.name, age: worker.age, homeState: worker.homeState,
      contactNumber: worker.contactNumber, healthHistory: worker.healthHistory
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/workers/${editingId}`, formData);
        setEditingId(null);
        alert("Record Updated!");
      } else {
        await axios.post('http://localhost:5000/api/workers', formData);
        alert("Worker Registered!");
      }
      setFormData({ name: '', age: '', homeState: '', contactNumber: '', healthHistory: '' });
      fetchWorkers();
    } catch (err) { alert("Action Failed"); }
  }

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.homeState.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="App">
      <header className="dashboard-header">
        <h1>Sahayadri Dashboard</h1>
        <button onClick={() => window.location.href='/'} className="logout-btn">Logout</button>
      </header>
      <div className="main-container">
        <section className="list-section">
          <div className="list-header">
            <h2>Registered Workers ({filteredWorkers.length})</h2>
            <input type="text" className="search-bar" placeholder="Search workers..." onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="worker-grid">
            {filteredWorkers.map(worker => (
              <div key={worker._id} className="worker-card">
                <div className="card-content">
                    <h3>{worker.name}</h3>
                    <p><strong>State:</strong> {worker.homeState}</p>
                    <p className="health-box"><strong>Health:</strong> {worker.healthHistory}</p>
                    {aiResults[worker._id] && (
                      <div className={`ai-badge ${aiResults[worker._id]}`}>
                        {aiResults[worker._id] === 'Fit' ? '✅ FIT' : '⚠️ UNFIT'}
                      </div>
                    )}
                </div>
                <div className="button-group">
                  <button className="edit-btn" onClick={() => handleEdit(worker)}>Update</button>
                  <button className="ai-scan-btn" onClick={() => handleAIAnalysis(worker)}>✨ AI Scan</button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="form-section">
          <div className="form-card">
            <h2>{editingId ? "Update Record" : "New Registration"}</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <input type="number" placeholder="Age" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} required />
              <input type="text" placeholder="Home State" value={formData.homeState} onChange={(e) => setFormData({...formData, homeState: e.target.value})} required />
              <input type="text" placeholder="Contact Number" value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} required />
              <textarea placeholder="Medical History" value={formData.healthHistory} onChange={(e) => setFormData({...formData, healthHistory: e.target.value})} rows="4" />
              <button type="submit" className="submit-btn">{editingId ? "Save Changes" : "Add Record"}</button>
            </form>
          </div>
        </section>
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