import React, { useEffect, useState } from 'react'
import axios from 'axios'

const healthBooleans = ['asthma', 'knee_pain', 'leg_injury', 'appendicitis_history', 'hand_injury', 'headache_issue', 'eyesight_issue', 'chest_pain', 'heart_issue', 'kidney_issue', 'smoking', 'alcohol'];

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
    const initData = {
      name: w.name || '',
      age: w.age || '',
      homeState: w.homeState || '',
      contactNumber: w.contactNumber || '',
      mobile: w.mobile || '',
      email: w.email || '',
      healthHistory: w.healthHistory || '',
      aadhar: w.aadhar || ''
    }
    healthBooleans.forEach(b => initData[b] = w[b] || false)
    setFormData(initData)
  }

  const cancelEdit = () => { setEditingId(null); setFormData({}) }

  const saveEdit = async () => {
    try {
      const role = localStorage.getItem('userRole')
      const identifier = localStorage.getItem('userIdentifier')
      const res = await axios.put(`http://localhost:5000/api/workers/${editingId}`, formData, {
        headers: { 'x-user-role': role || '', 'x-user-identifier': identifier || '' }
      })
      setWorkers(ws => ws.map(w => w._id === res.data._id ? res.data : w))
      setEditingId(null)
      setFormData({})
      alert('Worker updated')
    } catch (err) {
      alert('Update failed')
    }
  }

  const startAdd = () => { 
    setAdding(true); 
    const initData = { name:'', age:'', homeState:'', contactNumber:'', mobile:'', email:'', healthHistory:'', aadhar:'' }
    healthBooleans.forEach(b => initData[b] = false)
    setAddForm(initData) 
  }
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

  // Helper to render health checkboxes compactly
  const renderCheckboxes = (dataObj, setterFunc) => (
    <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0'}}>
      <div style={{width: '100%', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#475569'}}>Health Parameters for AI Scan:</div>
      {healthBooleans.map(b => (
        <label key={b} style={{fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', width: '23%'}}>
          <input type="checkbox" checked={!!dataObj[b]} onChange={e => setterFunc({...dataObj, [b]: e.target.checked})} />
          {b.replace('_', ' ')}
        </label>
      ))}
      <div style={{width: '100%', marginTop: '6px'}}>
         <label style={{fontSize: '14px', fontWeight: 'bold', color: '#475569', marginRight: '8px'}}>Assigned jobs evaluated dynamically during AI prediction scan.</label>
      </div>
    </div>
  )

  return (
    <div className="App">
      <header className="dashboard-header">
        <h1>Doctor Portal — All Worker Records</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div style={{maxWidth:1200, margin:'28px auto', padding:'0 20px'}}>
        <div className="profile-card-large">
          <h2>Workers ({workers.length})</h2>
          <div style={{overflowX:'auto', marginTop:12}}>
            <div style={{marginBottom:12}}>
              {adding ? (
                <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom: 20, paddingBottom: 20, borderBottom: '2px solid #e2e8f0'}}>
                  <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
                    <input placeholder='Name' value={addForm.name} onChange={e=>setAddForm({...addForm, name:e.target.value})} />
                    <input placeholder='Age' type='number' value={addForm.age} onChange={e=>setAddForm({...addForm, age:e.target.value})} style={{width:80}} />
                    <input placeholder='State' value={addForm.homeState} onChange={e=>setAddForm({...addForm, homeState:e.target.value})} />
                    <input placeholder='Contact' value={addForm.mobile} onChange={e=>setAddForm({...addForm, mobile:e.target.value})} />
                  </div>
                  {renderCheckboxes(addForm, setAddForm)}
                  <div style={{marginTop: 8}}>
                    <button onClick={submitAdd} style={{marginRight: 8}}>Save Worker</button>
                    <button onClick={cancelAdd}>Cancel</button>
                  </div>
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
                  <th style={{padding:'8px'}}>Health Summary</th>
                  <th style={{padding:'8px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(w => (
                  <React.Fragment key={w._id}>
                    <tr style={{borderBottom: editingId === w._id ? 'none' : '1px solid #f1f6fa'}}>
                      <td style={{padding:'10px'}}>
                        {editingId === w._id ? <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /> : w.name}
                      </td>
                      <td style={{padding:'10px'}}>
                        {editingId === w._id ? <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} style={{width:80}} /> : w.age}
                      </td>
                      <td style={{padding:'10px'}}>
                        {editingId === w._id ? <input value={formData.homeState} onChange={e => setFormData({...formData, homeState: e.target.value})} /> : w.homeState}
                      </td>
                      <td style={{padding:'10px'}}>
                        {editingId === w._id ? <input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} /> : (w.mobile || w.contactNumber)}
                      </td>
                      <td style={{padding:'10px', fontSize: '13px', color: '#64748b'}}>
                        {w.healthHistory || 'No text history.'} {healthBooleans.filter(b => w[b]).map(b => b.replace('_', ' ')).join(', ')}
                      </td>
                      <td style={{padding:'10px'}}>
                        {editingId === w._id ? (
                          <>
                          </>
                        ) : (
                          <button onClick={() => startEdit(w)}>Edit</button>
                        )}
                      </td>
                    </tr>
                    {editingId === w._id && (
                      <tr style={{borderBottom:'1px solid #f1f6fa', background: '#fafafa'}}>
                        <td colSpan={6} style={{padding: '10px 20px 20px 20px'}}>
                          {renderCheckboxes(formData, setFormData)}
                          <div style={{marginTop: 12}}>
                            <button onClick={saveEdit} style={{marginRight:8}}>Save Changes</button>
                            <button onClick={cancelEdit}>Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
