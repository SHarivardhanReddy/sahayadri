import React, { useEffect, useMemo, useState } from 'react'
import apiClient from '../api/axiosConfig'

const healthBooleans = ['asthma', 'knee_pain', 'leg_injury', 'appendicitis_history', 'hand_injury', 'headache_issue', 'eyesight_issue', 'chest_pain', 'heart_issue', 'kidney_issue', 'smoking', 'alcohol']

const JOB_TYPES = [
  { id: 'general_labour', label: 'General Labour' },
  { id: 'construction', label: 'Construction' },
  { id: 'assembly', label: 'Assembly' },
  { id: 'heavy_lifting', label: 'Heavy Lifting' },
  { id: 'weight_lifting', label: 'Weight Lifting' }
]

function yn (v) { return v ? 'Yes' : 'No' }

function buildFitnessPayload (worker, workTypes) {
  return {
    age: worker.age,
    gender: worker.gender || 'Male',
    work_types: workTypes,
    asthma: yn(worker.asthma),
    knee_pain: yn(worker.knee_pain),
    leg_injury: yn(worker.leg_injury),
    appendicitis_history: yn(worker.appendicitis_history),
    hand_injury: yn(worker.hand_injury),
    headache_issue: yn(worker.headache_issue),
    eyesight_issue: yn(worker.eyesight_issue),
    chest_pain: yn(worker.chest_pain),
    heart_issue: yn(worker.heart_issue),
    kidney_issue: yn(worker.kidney_issue),
    smoking: yn(worker.smoking),
    alcohol: yn(worker.alcohol)
  }
}

const emptyAddForm = () => {
  const o = { name: '', gender: 'Male', age: '', homeState: '', contactNumber: '', mobile: '', email: '', aadhar: '' }
  healthBooleans.forEach(b => { o[b] = false })
  return o
}

const DoctorDashboard = () => {
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({})
  const [adding, setAdding] = useState(false)
  const [addForm, setAddForm] = useState(emptyAddForm())

  const [searchQuery, setSearchQuery] = useState('')
  const [filterGender, setFilterGender] = useState('all')
  const [filterState, setFilterState] = useState('all')

  const [scanWorker, setScanWorker] = useState(null)
  const [scanJobs, setScanJobs] = useState(['general_labour'])
  const [scanLoading, setScanLoading] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scanResult, setScanResult] = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const role = localStorage.getItem('userRole')
        const identifier = localStorage.getItem('userIdentifier')
        const res = await apiClient.get('/api/workers', {
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

  const stateOptions = useMemo(() => {
    const s = new Set(workers.map(w => w.homeState).filter(Boolean))
    return Array.from(s).sort()
  }, [workers])

  const filteredWorkers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return workers.filter(w => {
      if (q) {
        const hay = [w.name, w.email, w.homeState, w.mobile, w.contactNumber, w.aadhar]
          .filter(Boolean).join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filterGender !== 'all' && (w.gender || 'Male') !== filterGender) return false
      if (filterState !== 'all' && (w.homeState || '') !== filterState) return false
      return true
    })
  }, [workers, searchQuery, filterGender, filterState])

  const startEdit = (w) => {
    setEditingId(w._id)
    const initData = {
      name: w.name || '',
      gender: w.gender || 'Male',
      age: w.age || '',
      homeState: w.homeState || '',
      contactNumber: w.contactNumber || '',
      mobile: w.mobile || '',
      email: w.email || '',
      aadhar: w.aadhar || ''
    }
    healthBooleans.forEach(b => { initData[b] = w[b] || false })
    setFormData(initData)
  }

  const cancelEdit = () => { setEditingId(null); setFormData({}) }

  const saveEdit = async () => {
    try {
      const role = localStorage.getItem('userRole')
      const identifier = localStorage.getItem('userIdentifier')
      const res = await apiClient.put(`/api/workers/${editingId}`, formData, {
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
    setAdding(true)
    setAddForm(emptyAddForm())
  }
  const cancelAdd = () => { setAdding(false); setAddForm(emptyAddForm()) }
  const submitAdd = async () => {
    try {
      const role = localStorage.getItem('userRole')
      const identifier = localStorage.getItem('userIdentifier')
      const res = await apiClient.post('/api/workers', addForm, { headers: { 'x-user-role': role || '', 'x-user-identifier': identifier || '' } })
      setWorkers(ws => [res.data, ...ws])
      setAdding(false)
      setAddForm(emptyAddForm())
      alert('Worker added')
    } catch (err) { alert('Add failed') }
  }

  const openScan = (w) => {
    setScanWorker(w)
    setScanJobs(['general_labour'])
    setScanResult(null)
    setScanError('')
  }
  const closeScan = () => {
    setScanWorker(null)
    setScanResult(null)
    setScanError('')
    setScanLoading(false)
  }

  const toggleScanJob = (id) => {
    setScanJobs(jobs => {
      if (jobs.includes(id)) {
        if (jobs.length <= 1) return jobs
        return jobs.filter(x => x !== id)
      }
      return [...jobs, id]
    })
  }

  const runAiScan = async () => {
    if (!scanWorker) return
    setScanLoading(true)
    setScanError('')
    setScanResult(null)
    try {
      const payload = buildFitnessPayload(scanWorker, scanJobs)
      const res = await apiClient.post('/api/evaluate-fitness', payload)
      if (res.data.success && res.data.results) {
        setScanResult(res.data.results)
      } else {
        setScanError('Unexpected response from AI service.')
      }
    } catch (err) {
      setScanError(err.response?.data?.message || 'AI Analysis failed. Ensure AI server (port 5001) is running.')
    } finally {
      setScanLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userIdentifier')
    localStorage.removeItem('userRole')
    window.location.href = '/login'
  }

  const renderHealthBadges = (w) => {
    const active = healthBooleans.filter(b => w[b])
    if (!active.length) {
      return <span className="badge-fit">fit</span>
    }
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {active.map(b => (
          <span key={b} className="badge-flag-pill">
            {b.replace('_', ' ')}
          </span>
        ))}
      </div>
    )
  }

  const renderCheckboxes = (dataObj, setterFunc) => (
    <div className="health-check-grid">
      <div className="health-check-grid__title">Health parameters (AI)</div>
      {healthBooleans.map(b => (
        <label key={b}>
          <input type="checkbox" checked={!!dataObj[b]} onChange={e => setterFunc({ ...dataObj, [b]: e.target.checked })} />
          {b.replace('_', ' ')}
        </label>
      ))}
    </div>
  )

  if (loading) return <div className="loading portal-page">Loading workers…</div>

  return (
    <div className="App portal-page">
      <header className="portal-header portal-header--doctor">
        <div className="portal-header__brand">
          <h1 className="portal-header__title">Doctor portal</h1>
          <span className="portal-header__subtitle">Worker registry and AI fitness scans</span>
        </div>
        <button type="button" onClick={handleLogout} className="logout-btn">Log out</button>
      </header>

      <div className="portal-main">
        <div className="portal-card">
          <h2 className="portal-card__title">
            Workers
            <span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.95rem' }}>
              {' '}({filteredWorkers.length})
              {filteredWorkers.length !== workers.length ? ` of ${workers.length}` : ''}
            </span>
          </h2>

          <div className="doctor-toolbar">
            <input
              type="search"
              className="doctor-search"
              placeholder="Search name, email, state, phone…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search workers"
            />
            <label className="doctor-filter">
              Gender
              <select value={filterGender} onChange={e => setFilterGender(e.target.value)}>
                <option value="all">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="doctor-filter">
              State
              <select value={filterState} onChange={e => setFilterState(e.target.value)}>
                <option value="all">All states</option>
                {stateOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ marginBottom: 12 }}>
              {adding
                ? (
                  <div className="add-worker-panel">
                    <div className="add-worker-row">
                      <input placeholder="Name" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} />
                      <select value={addForm.gender} onChange={e => setAddForm({ ...addForm, gender: e.target.value })}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <input placeholder="Age" type="number" value={addForm.age} onChange={e => setAddForm({ ...addForm, age: e.target.value })} style={{ width: 80 }} />
                      <input placeholder="State" value={addForm.homeState} onChange={e => setAddForm({ ...addForm, homeState: e.target.value })} />
                      <input placeholder="Email" type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} style={{ minWidth: 180 }} />
                      <input placeholder="Mobile / contact" value={addForm.mobile} onChange={e => setAddForm({ ...addForm, mobile: e.target.value })} />
                    </div>
                    {renderCheckboxes(addForm, setAddForm)}
                    <div style={{ marginTop: 12 }}>
                      <button type="button" className="btn-doctor-primary" onClick={submitAdd} style={{ marginRight: 8 }}>Save worker</button>
                      <button type="button" className="btn-doctor-ghost" onClick={cancelAdd}>Cancel</button>
                    </div>
                  </div>
                  )
                : (
                  <button type="button" className="btn-doctor-primary" onClick={startAdd} style={{ marginBottom: 8 }}>+ Add worker</button>
                  )}
            </div>
            <div className="doctor-table-wrap">
              <table className="doctor-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Gender</th>
                    <th>Age</th>
                    <th>State</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Health flags</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkers.map(w => (
                    <React.Fragment key={w._id}>
                      <tr>
                        <td>
                          {editingId === w._id ? <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /> : w.name}
                        </td>
                        <td>
                          {editingId === w._id
                            ? (
                              <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                              )
                            : (w.gender || '—')}
                        </td>
                        <td>
                          {editingId === w._id ? <input type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} style={{ width: 70 }} /> : w.age}
                        </td>
                        <td>
                          {editingId === w._id ? <input value={formData.homeState} onChange={e => setFormData({ ...formData, homeState: e.target.value })} /> : w.homeState}
                        </td>
                        <td>
                          {editingId === w._id ? <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: 160 }} /> : (w.email || '—')}
                        </td>
                        <td>
                          {editingId === w._id ? <input value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} /> : (w.mobile || w.contactNumber)}
                        </td>
                        <td style={{ maxWidth: 220 }}>{renderHealthBadges(w)}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {editingId === w._id
                            ? null
                            : (
                              <>
                                <button type="button" className="btn-doctor-ghost" onClick={() => startEdit(w)} style={{ marginRight: 6 }}>Edit</button>
                                <button type="button" className="btn-doctor-primary" onClick={() => openScan(w)}>AI scan</button>
                              </>
                              )}
                        </td>
                      </tr>
                      {editingId === w._id && (
                        <tr className="edit-row-bg">
                          <td colSpan={8} style={{ padding: '12px 16px 18px' }}>
                            {renderCheckboxes(formData, setFormData)}
                            <div style={{ marginTop: 12 }}>
                              <button type="button" className="btn-doctor-primary" onClick={saveEdit} style={{ marginRight: 8 }}>Save changes</button>
                              <button type="button" className="btn-doctor-ghost" onClick={cancelEdit}>Cancel</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredWorkers.length === 0 && (
              <p className="empty-state">No records match your search or filters.</p>
            )}
          </div>
        </div>
      </div>

      {scanWorker && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="ai-scan-title">
          <div className="modal-card">
            <h3 id="ai-scan-title">AI fitness scan</h3>
            <p style={{ color: '#475569', marginBottom: 16, fontSize: '0.9rem' }}>
              <strong>{scanWorker.name}</strong>
              {' · '}
              {scanWorker.gender || 'Male'}
              {' · '}
              Age {scanWorker.age}
            </p>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.85rem', color: '#334155' }}>Job types</div>
              <div className="scan-job-grid">
                {JOB_TYPES.map(job => (
                  <label key={job.id} className="scan-job-label">
                    <input
                      type="checkbox"
                      checked={scanJobs.includes(job.id)}
                      onChange={() => toggleScanJob(job.id)}
                    />
                    {job.label}
                  </label>
                ))}
              </div>
            </div>
            {scanError && <p style={{ color: '#b91c1c', fontSize: '0.875rem' }}>{scanError}</p>}
            {scanResult && (
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, marginBottom: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>Result</span>
                  <span style={{ fontWeight: 700, color: scanResult.fitness_status === 'Fit' ? '#15803d' : '#b91c1c' }}>
                    {scanResult.fitness_status} ({scanResult.confidence})
                  </span>
                </div>
                {scanResult.contributions && (
                  <ul style={{ margin: '12px 0 0', paddingLeft: 18, fontSize: '0.85rem', color: '#334155' }}>
                    {scanResult.contributions.map(c => (
                      <li key={c.key}>{c.label}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="btn-doctor-ghost" onClick={closeScan}>Close</button>
              <button type="button" className="ai-scan-btn" onClick={runAiScan} disabled={scanLoading}>
                {scanLoading ? 'Running…' : 'Run scan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard
