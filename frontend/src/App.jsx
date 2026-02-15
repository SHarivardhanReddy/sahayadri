import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [workers, setWorkers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState(null); // Track which worker is being edited
  const [formData, setFormData] = useState({
    name: '', age: '', homeState: '', contactNumber: '', healthHistory: ''
  })

  const fetchWorkers = () => {
    axios.get('http://localhost:5000/api/workers').then(res => setWorkers(res.data))
  }

  useEffect(() => { fetchWorkers() }, [])

  // 1. When Edit is clicked, fill the form with worker's data
  const handleEdit = (worker) => {
    setEditingId(worker._id);
    setFormData({
      name: worker.name,
      age: worker.age,
      homeState: worker.homeState,
      contactNumber: worker.contactNumber,
      healthHistory: worker.healthHistory
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        // 2. If editing, use PUT
        await axios.put(`http://localhost:5000/api/workers/${editingId}`, formData);
        setEditingId(null);
        alert("Record Updated!");
      } else {
        // 3. If new, use POST
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
      <header>
        <h1>Sahayadri: Migrant Health Records</h1>
        <p>Kerala Guest Worker Health Management System</p>
      </header>
      
      <div className="main-container">
        <section className="list-section">
          <div className="list-header">
            <h2>Registered Workers ({filteredWorkers.length})</h2>
            <input type="text" className="search-bar" placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="worker-grid">
            {filteredWorkers.map(worker => (
              <div key={worker._id} className="worker-card">
                <div className="card-content">
                    <h3>{worker.name}</h3>
                    <p><strong>State:</strong> {worker.homeState}</p>
                    <p className="health-box"><strong>Health:</strong> {worker.healthHistory}</p>
                </div>
                {/* UPDATE BUTTON */}
                <button className="edit-btn" onClick={() => handleEdit(worker)}>Update Record</button>
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
              <button type="submit" className={editingId ? "update-submit-btn" : ""}>
                {editingId ? "Save Changes" : "Add Record"}
              </button>
              {editingId && <button type="button" className="cancel-btn" onClick={() => {setEditingId(null); setFormData({name:'', age:'', homeState:'', contactNumber:'', healthHistory:''})}}>Cancel</button>}
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}

export default App