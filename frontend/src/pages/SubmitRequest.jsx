import { useState } from 'react';
import { submitRequest } from '../services/api';

export default function SubmitRequest() {
  // This MUST be the first line inside the component
  const user = JSON.parse(localStorage.getItem('user'));

  const [form, setForm] = useState({
    employeeId: user?.employeeId || 1,
    destination: '',
    purpose: '',
    travelStartDate: '',
    travelEndDate: '',
    travelMode: 'Flight',
    travelType: 'Domestic',
    hotelRequired: false,
    advanceRequired: 0,
    estimatedExpense: 0
  });

  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await submitRequest({
        ...form,
        estimatedExpense: parseFloat(form.estimatedExpense),
        advanceRequired:  parseFloat(form.advanceRequired)
      });
      setResult(response.data);
    } catch (_err) {
      setError('Failed to submit. Please check the backend is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
          <h2 style={{ color: '#166534', fontSize: 24, marginBottom: 8 }}>Request Submitted!</h2>
          <p style={{ color: '#374151', marginBottom: 20 }}>Your travel request has been sent for approval.</p>

          <div style={s.infoGrid}>
            <div style={s.infoBox}>
              <span style={s.infoLabel}>Request ID</span>
              <span style={s.infoValue}>#{result.requestId}</span>
            </div>
            <div style={s.infoBox}>
              <span style={s.infoLabel}>Status</span>
              <span style={{ ...s.infoValue, color: '#d97706' }}>{result.status}</span>
            </div>
            <div style={s.infoBox}>
              <span style={s.infoLabel}>Food Allowance</span>
              <span style={s.infoValue}>₹{result.calculatedFoodAllowance}</span>
            </div>
            <div style={s.infoBox}>
              <span style={s.infoLabel}>Total Est. Cost</span>
              <span style={{ ...s.infoValue, color: '#1a56db', fontSize: 20 }}>₹{result.calculatedTotalCost}</span>
            </div>
          </div>

          <button onClick={() => setResult(null)} style={s.btnPrimary}>
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h1 style={s.pageTitle}>Submit Travel Request</h1>
        <p style={s.pageSubtitle}>Fill in the details below and your manager will be notified for approval.</p>

        {error && (
          <div style={s.errorBanner}>⚠️ {error}</div>
        )}

        <div style={s.card}>
          <form onSubmit={handleSubmit}>

            {/* Row 1 */}
            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>Destination *</label>
                <input name="destination" value={form.destination} onChange={handleChange}
                  required style={s.input} placeholder="e.g. Mumbai" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Mode of Travel</label>
                <select name="travelMode" value={form.travelMode} onChange={handleChange} style={s.input}>
                  <option>Flight</option>
                  <option>Train</option>
                  <option>Car</option>
                </select>
              </div>
            </div>

            {/* Purpose */}
            <div style={s.fieldFull}>
              <label style={s.label}>Purpose of Travel *</label>
              <textarea name="purpose" value={form.purpose} onChange={handleChange}
                required style={{ ...s.input, height: 80, resize: 'vertical' }}
                placeholder="e.g. Client meeting with XYZ Corp" />
            </div>

            {/* Row 2 */}
            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>Travel Start Date *</label>
                <input type="date" name="travelStartDate" value={form.travelStartDate}
                  onChange={handleChange} required style={s.input} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Travel End Date *</label>
                <input type="date" name="travelEndDate" value={form.travelEndDate}
                  onChange={handleChange} required style={s.input} />
              </div>
            </div>

            {/* Row 3 */}
            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>Travel Type</label>
                <select name="travelType" value={form.travelType} onChange={handleChange} style={s.input}>
                  <option>Domestic</option>
                  <option>International</option>
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Estimated Expense (₹)</label>
                <input type="number" name="estimatedExpense" value={form.estimatedExpense}
                  onChange={handleChange} style={s.input} min="0" />
              </div>
            </div>

            {/* Row 4 */}
            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>Advance Required (₹)</label>
                <input type="number" name="advanceRequired" value={form.advanceRequired}
                  onChange={handleChange} style={s.input} min="0" />
              </div>
              <div style={{ ...s.field, justifyContent: 'center' }}>
                <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 24 }}>
                  <input type="checkbox" name="hotelRequired" checked={form.hotelRequired}
                    onChange={handleChange} style={{ width: 18, height: 18, accentColor: '#1a56db' }} />
                  <span>Hotel Required?</span>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...s.btnPrimary, width: '100%', marginTop: 8 }}>
              {loading ? 'Submitting...' : '🚀 Submit Travel Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:        { width: '100%' },
  pageTitle:   { fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 6 },
  pageSubtitle:{ fontSize: 15, color: '#64748b', marginBottom: 24 },
  card:        { background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 24 },
  row:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  field:       { display: 'flex', flexDirection: 'column' },
  fieldFull:   { display: 'flex', flexDirection: 'column', marginBottom: 16 },
  label:       { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  input:  { padding: '10px 12px', fontSize: 14, borderRadius: 8, border: '1.5px solid #e2e8f0',
           background: '#f8fafc', outline: 'none', width: '100%', color: '#1e293b', colorScheme: 'light' },
  btnPrimary:  { padding: '12px 24px', background: '#1a56db', color: '#fff', border: 'none',
                 borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600 },
  errorBanner: { background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b',
                 padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 },
  infoGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 },
  infoBox:     { background: '#f8fafc', borderRadius: 8, padding: '14px 16px',
                 display: 'flex', flexDirection: 'column', gap: 4, border: '1px solid #e2e8f0' },
  infoLabel:   { fontSize: 12, color: '#64748b', fontWeight: 500 },
  infoValue:   { fontSize: 18, fontWeight: 700, color: '#1e293b' },
};
