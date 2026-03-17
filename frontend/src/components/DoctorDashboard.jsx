import React, { useEffect, useState } from 'react'
import axios from 'axios'

const DoctorDashboard = () => {
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({})
  const [adding, setAdding] = useState(false)
  const [addForm, setAddForm] = useState({ name:'', age:'', homeState:'', contactNumber:'', mobile:'', email:'', healthHistory:'', aadhar:'' })

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const role = localStorage.getItem('userRole')
        const identifier = localStorage.getItem('userIdentifier')
        const res = await axios.get('http://localhost:5000/api/workers', {
          headers: {
            'x-user-role': role || '',
            'x-user-identifier': identifier || ''
          }
        })
        setWorkers(res.data)
      } catch (err) {
        alert('Access denied or failed to fetch workers.')
      } finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const startEdit = (w) => {
    setEditingId(w._id)
    setFormData({
      name: w.name || '',
      age: w.age || '',
      homeState: w.homeState || '',
      contactNumber: w.contactNumber || '',
      mobile: w.mobile || '',
      email: w.email || '',
      healthHistory: w.healthHistory || '',
      aadhar: w.aadhar || ''
    })
  }

  const cancelEdit = () => { setEditingId(null); setFormData({}) }

  const saveEdit = async () => {
    try {
      const role = localStorage.getItem('userRole')
      const identifier = localStorage.getItem('userIdentifier')
      const res = await axios.put(`http://localhost:5000/api/workers/${editingId}`, formData, {
        headers: { 'x-user-role': role || '', 'x-user-identifier': identifier || '' }
      })
      // update local list
      setWorkers(ws => ws.map(w => w._id === res.data._id ? res.data : w))
      setEditingId(null)
      setFormData({})
      alert('Worker updated')
    } catch (err) {
      alert('Update failed')
    }
  }

  const startAdd = () => { setAdding(true); setAddForm({ name:'', age:'', homeState:'', contactNumber:'', mobile:'', email:'', healthHistory:'', aadhar:'' }) }
  const cancelAdd = () => { setAdding(false); setAddForm({}) }
  const submitAdd = async () => {
    try {
      const role = localStorage.getItem('userRole')
      const identifier = localStorage.getItem('userIdentifier')
      const res = await axios.post('http://localhost:5000/api/workers', addForm, { headers: { 'x-user-role': role || '', 'x-user-identifier': identifier || '' } })
      setWorkers(ws => [res.data, ...ws])
      setAdding(false)
      setAddForm({})
      alert('Worker added')
    } catch (err) { alert('Add failed') }
  }

  const handleLogout = () => {
    localStorage.removeItem('userIdentifier')
    localStorage.removeItem('userRole')
    window.location.href = '/login'
  }

  if (loading) return <div className="loading">Loading workers...</div>

  return (
    <div className="App">
      <header className="dashboard-header">
        <h1>Doctor Portal — All Worker Records</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div style={{maxWidth:1100, margin:'28px auto', padding:'0 20px'}}>
        <div className="profile-card-large">
          <h2>Workers ({workers.length})</h2>
          <div style={{overflowX:'auto', marginTop:12}}>
            <div style={{marginBottom:12}}>
              {adding ? (
                <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
                  <input placeholder='Name' value={addForm.name} onChange={e=>setAddForm({...addForm, name:e.target.value})} />
                  <input placeholder='Age' type='number' value={addForm.age} onChange={e=>setAddForm({...addForm, age:e.target.value})} style={{width:80}} />
                  <input placeholder='State' value={addForm.homeState} onChange={e=>setAddForm({...addForm, homeState:e.target.value})} />
                  <input placeholder='Contact' value={addForm.mobile} onChange={e=>setAddForm({...addForm, mobile:e.target.value})} />
                  <button onClick={submitAdd}>Save</button>
                  <button onClick={cancelAdd}>Cancel</button>
                </div>
              ) : (
                <button onClick={startAdd} style={{marginBottom:8}}>+ Add New Worker</button>
              )}
            </div>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{textAlign:'left', borderBottom:'1px solid #e6eef6'}}>
                  <th style={{padding:'8px'}}>Name</th>
                  <th style={{padding:'8px'}}>Age</th>
                  <th style={{padding:'8px'}}>State</th>
                  <th style={{padding:'8px'}}>Contact</th>
                  <th style={{padding:'8px'}}>Health History</th>
                  <th style={{padding:'8px'}}>Aadhar</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(w => (
                  <tr key={w._id} style={{borderBottom:'1px solid #f1f6fa'}}>
                    <td style={{padding:'10px'}}>
                      {editingId === w._id ? (
                        <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                      ) : w.name}
                    </td>
                    <td style={{padding:'10px'}}>
                      {editingId === w._id ? (
                        <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} style={{width:80}} />
                      ) : w.age}
                    </td>
                    <td style={{padding:'10px'}}>
                      {editingId === w._id ? (
                        <input value={formData.homeState} onChange={e => setFormData({...formData, homeState: e.target.value})} />
                      ) : w.homeState}
                    </td>
                    <td style={{padding:'10px'}}>
                      {editingId === w._id ? (
                        <input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
                      ) : (w.mobile || w.contactNumber)}
                    </td>
                    <td style={{padding:'10px'}}>
                      {editingId === w._id ? (
                        <input value={formData.healthHistory} onChange={e => setFormData({...formData, healthHistory: e.target.value})} />
                      ) : w.healthHistory}
                    </td>
                    <td style={{padding:'10px'}}>
                      {editingId === w._id ? (
                        <input value={formData.aadhar} onChange={e => setFormData({...formData, aadhar: e.target.value})} />
                      ) : w.aadhar}
                    </td>
                    <td style={{padding:'10px'}}>
                      {editingId === w._id ? (
                        <>
                          <button onClick={saveEdit} style={{marginRight:8}}>Save</button>
                          <button onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(w)}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard
