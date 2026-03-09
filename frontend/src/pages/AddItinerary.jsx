import { useState, useEffect } from 'react';
import { createItinerary, getItineraryByReq, getAllRequests } from '../services/api';

export default function AddItinerary() {
  const [requests, setRequests]   = useState([]);
  const [selected, setSelected]   = useState(null);  // the chosen request
  const [existing, setExisting]   = useState(null);
  const [saved, setSaved]         = useState(false);
  const [loading, setLoading]     = useState(true);

  const [form, setForm] = useState({
    flightDetails: '', hotelName: '', hotelCheckIn: '',
    hotelCheckOut: '', localTransport: '', meetingSchedule: ''
  });

  // Load all approved requests on page load
  useEffect(() => {
    getAllRequests()
      .then(res => {
        const approved = res.data.filter(r => r.status === 'Approved');
        setRequests(approved);
      })
      .finally(() => setLoading(false));
  }, []);

  // When admin clicks a request, load its existing itinerary if any
  const handleSelect = async (req) => {
    setSelected(req);
    setExisting(null);
    setSaved(false);
    setForm({
      flightDetails: '', hotelName: '', hotelCheckIn: '',
      hotelCheckOut: '', localTransport: '', meetingSchedule: ''
    });
    try {
      const res = await getItineraryByReq(req.requestId);
      setExisting(res.data);
    } catch (_err) {
      setExisting(null); // no itinerary yet, that's fine
    }
  };

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await createItinerary({ ...form, requestId: selected.requestId });
      setSaved(true);
    } catch (_err) {
      alert('Failed to save itinerary.');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <p style={{ color: '#64748b' }}>Loading approved requests...</p>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      <h1 style={s.pageTitle}>Itinerary Management</h1>
      <p style={s.pageSubtitle}>Select an approved request to view or add its itinerary.</p>

      <div style={s.layout}>

        {/* ── LEFT: List of approved requests ── */}
        <div style={s.leftPanel}>
          <h2 style={s.sectionTitle}>✅ Approved Requests</h2>

          {requests.length === 0 ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
              <p style={{ color: '#64748b', fontSize: 14 }}>No approved requests yet.</p>
            </div>
          ) : (
            requests.map(req => (
              <div key={req.requestId}
                onClick={() => handleSelect(req)}
                style={{
                  ...s.reqCard,
                  border: selected?.requestId === req.requestId
                    ? '2px solid #1a56db'
                    : '1.5px solid #e2e8f0',
                  background: selected?.requestId === req.requestId
                    ? '#eff6ff'
                    : '#fff',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#1a56db', fontSize: 13 }}>
                    #{req.requestId}
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    Emp #{req.employeeId}
                  </span>
                </div>
                <p style={{ fontWeight: 600, color: '#1e293b', margin: '4px 0 2px' }}>
                  ✈️ {req.destination}
                </p>
                <p style={{ fontSize: 12, color: '#64748b' }}>
                  {req.travelStartDate?.slice(0,10)} → {req.travelEndDate?.slice(0,10)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* ── RIGHT: Itinerary form ── */}
        <div style={s.rightPanel}>
          {!selected ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>👈</p>
              <p style={{ color: '#64748b' }}>Select a request from the left to manage its itinerary.</p>
            </div>
          ) : saved ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>✅</p>
              <h3 style={{ color: '#166534', marginBottom: 8 }}>Itinerary Saved!</h3>
              <p style={{ color: '#64748b', marginBottom: 24 }}>
                Itinerary for Request #{selected.requestId} — {selected.destination} saved successfully.
              </p>
              <button onClick={() => setSaved(false)} style={s.btnSecondary}>
                Edit Again
              </button>
            </div>
          ) : (
            <>
              {/* Request summary */}
              <div style={s.summaryBox}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                  ✈️ {selected.destination}
                </h2>
                <p style={{ fontSize: 13, color: '#64748b' }}>
                  Request #{selected.requestId} · Employee #{selected.employeeId} ·{' '}
                  {selected.travelStartDate?.slice(0,10)} → {selected.travelEndDate?.slice(0,10)}
                </p>
              </div>

              {/* Existing itinerary preview */}
              {existing && (
                <div style={s.existingBox}>
                  <p style={s.existingTitle}>📋 Existing Itinerary</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      ['Flight',         existing.flightDetails],
                      ['Hotel',          existing.hotelName],
                      ['Check-in',       existing.hotelCheckIn?.slice(0,10)],
                      ['Check-out',      existing.hotelCheckOut?.slice(0,10)],
                      ['Local Transport',existing.localTransport],
                      ['Meetings',       existing.meetingSchedule],
                    ].filter(([, v]) => v).map(([label, value]) => (
                      <div key={label}>
                        <p style={s.detailLabel}>{label}</p>
                        <p style={s.detailValue}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add / update form */}
              <div style={s.card}>
                <h3 style={s.sectionTitle}>
                  {existing ? '✏️ Update Itinerary' : '➕ Add Itinerary'}
                </h3>
                <form onSubmit={handleSave}>
                  <div style={s.formGrid}>
                    <div>
                      <label style={s.label}>Flight Details</label>
                      <input name="flightDetails" value={form.flightDetails}
                        onChange={handleChange} style={s.input} />
                        
                    </div>
                    <div>
                      <label style={s.label}>Hotel Name</label>
                      <input name="hotelName" value={form.hotelName}
                        onChange={handleChange} style={s.input} />
                        
                    </div>
                    <div>
                      <label style={s.label}>Hotel Check-in</label>
                      <input type="date" name="hotelCheckIn" value={form.hotelCheckIn}
                        onChange={handleChange} style={s.input} />
                    </div>
                    <div>
                      <label style={s.label}>Hotel Check-out</label>
                      <input type="date" name="hotelCheckOut" value={form.hotelCheckOut}
                        onChange={handleChange} style={s.input} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={s.label}>Local Transport</label>
                    <input name="localTransport" value={form.localTransport}
                      onChange={handleChange} style={s.input} />
                      
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={s.label}>Meeting Schedule</label>
                    <textarea name="meetingSchedule" value={form.meetingSchedule}
                      onChange={handleChange} rows={3}
                      style={{ ...s.input, resize: 'vertical' }} />
                    
                  </div>
                  <button type="submit" style={{ ...s.btnPrimary, width: '100%' }}>
                    💾 {existing ? 'Update Itinerary' : 'Save Itinerary'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  pageTitle:    { fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 6 },
  pageSubtitle: { fontSize: 15, color: '#64748b', marginBottom: 24 },
  layout:       { display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' },
  leftPanel:    { background: '#fff', borderRadius: 12, padding: 16,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
  rightPanel:   { background: '#fff', borderRadius: 12, padding: 28,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
                  minHeight: 400 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 14 },
  reqCard:      { borderRadius: 8, padding: '12px 14px', marginBottom: 10,
                  cursor: 'pointer', transition: 'all 0.15s ease' },
  summaryBox:   { background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10,
                  padding: '14px 18px', marginBottom: 20 },
  existingBox:  { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10,
                  padding: 16, marginBottom: 20 },
  existingTitle:{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 12 },
  card:         { background: '#f8fafc', borderRadius: 10, padding: 20,
                  border: '1px solid #e2e8f0' },
  formGrid:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 },
  label:        { display: 'block', fontSize: 13, fontWeight: 600,
                  color: '#374151', marginBottom: 6 },
  input:        { width: '100%', padding: '10px 12px', fontSize: 14, borderRadius: 8,
                  border: '1.5px solid #e2e8f0', background: '#fff',
                  color: '#1e293b', fontFamily: 'inherit', colorScheme: 'light' },
  btnPrimary:   { padding: '12px 24px', background: '#1a56db', color: '#fff',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  fontSize: 15, fontWeight: 600 },
  btnSecondary: { padding: '10px 20px', background: '#f1f5f9', color: '#334155',
                  border: '1.5px solid #e2e8f0', borderRadius: 8,
                  cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  detailLabel:  { fontSize: 11, color: '#64748b', fontWeight: 600,
                  textTransform: 'uppercase', marginBottom: 2 },
  detailValue:  { fontSize: 13, color: '#1e293b', fontWeight: 500 },
  emptyState:   { textAlign: 'center', padding: '40px 20px' },
};