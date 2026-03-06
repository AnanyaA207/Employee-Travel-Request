import { useState, useEffect } from 'react';
import { getAllRequests, submitApproval } from '../services/api';

export default function ManagerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [comments, setComments] = useState({});

  useEffect(() => {
    getAllRequests()
      .then(res => setRequests(res.data))
      .catch(_err => console.error(_err))
      .finally(() => setLoading(false));
  }, []);

  const handleDecision = async (requestId, decision) => {
    const approval = {
      requestId,
      approverId: 3,
      decision,
      comments: comments[requestId] || ''
    };
    try {
      await submitApproval(approval);
      const res = await getAllRequests();
      setRequests(res.data);
      alert(`Request #${requestId} has been ${decision}!`);
    } catch (_err) {
      alert('Something went wrong. Please try again.');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <p style={{ color: '#64748b', fontSize: 16 }}>Loading requests...</p>
    </div>
  );

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={s.pageTitle}>Manager Dashboard</h1>
      <p style={s.pageSubtitle}>Review and action pending travel requests from your team.</p>

      {/* Summary bar */}
      <div style={s.summaryBar}>
        <div style={s.summaryItem}>
          <span style={s.summaryNum}>{requests.length}</span>
          <span style={s.summaryLabel}>Total Requests</span>
        </div>
        <div style={s.summaryItem}>
          <span style={{ ...s.summaryNum, color: '#d97706' }}>{pendingRequests.length}</span>
          <span style={s.summaryLabel}>Pending</span>
        </div>
        <div style={s.summaryItem}>
          <span style={{ ...s.summaryNum, color: '#166534' }}>
            {requests.filter(r => r.status === 'Approved').length}
          </span>
          <span style={s.summaryLabel}>Approved</span>
        </div>
        <div style={s.summaryItem}>
          <span style={{ ...s.summaryNum, color: '#991b1b' }}>
            {requests.filter(r => r.status === 'Rejected').length}
          </span>
          <span style={s.summaryLabel}>Rejected</span>
        </div>
      </div>

      {pendingRequests.length === 0 ? (
        <div style={s.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h3 style={{ color: '#166534', marginBottom: 6 }}>All caught up!</h3>
          <p style={{ color: '#64748b' }}>No pending requests to review.</p>
        </div>
      ) : (
        pendingRequests.map(req => (
          <div key={req.requestId} style={s.card}>
            {/* Card header */}
            <div style={s.cardHeader}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
                  ✈️ {req.destination}
                </h3>
                <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                  Request #{req.requestId} · Employee #{req.employeeId}
                </p>
              </div>
              <span style={s.pendingBadge}>Pending</span>
            </div>

            {/* Details grid */}
            <div style={s.detailsGrid}>
              <div style={s.detailItem}>
                <span style={s.detailLabel}>Purpose</span>
                <span style={s.detailValue}>{req.purpose}</span>
              </div>
              <div style={s.detailItem}>
                <span style={s.detailLabel}>Travel Dates</span>
                <span style={s.detailValue}>
                  {req.travelStartDate?.slice(0,10)} → {req.travelEndDate?.slice(0,10)}
                </span>
              </div>
              <div style={s.detailItem}>
                <span style={s.detailLabel}>Mode / Type</span>
                <span style={s.detailValue}>{req.travelMode} · {req.travelType}</span>
              </div>
              <div style={s.detailItem}>
                <span style={s.detailLabel}>Hotel Required</span>
                <span style={s.detailValue}>{req.hotelRequired ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {/* Cost highlight */}
            <div style={s.costRow}>
              <div style={s.costBox}>
                <span style={s.costLabel}>Estimated Expense</span>
                <span style={s.costValue}>₹{req.estimatedExpense}</span>
              </div>
              <div style={s.costBox}>
                <span style={s.costLabel}>Food Allowance</span>
                <span style={s.costValue}>₹{req.calculatedFoodAllowance}</span>
              </div>
              <div style={{ ...s.costBox, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <span style={s.costLabel}>Total Est. Cost</span>
                <span style={{ ...s.costValue, color: '#1a56db', fontSize: 20 }}>₹{req.calculatedTotalCost}</span>
              </div>
            </div>

            {/* Comments */}
            <textarea
              placeholder="Add comments (optional)..."
              value={comments[req.requestId] || ''}
              onChange={e => setComments(prev => ({ ...prev, [req.requestId]: e.target.value }))}
              style={s.textarea}
            />

            {/* Action buttons */}
            <div style={s.actions}>
              <button onClick={() => handleDecision(req.requestId, 'Approved')}
                style={{ ...s.btn, background: '#16a34a' }}>
                ✅ Approve
              </button>
              <button onClick={() => handleDecision(req.requestId, 'Rejected')}
                style={{ ...s.btn, background: '#dc2626' }}>
                ❌ Reject
              </button>
              <button onClick={() => handleDecision(req.requestId, 'NeedMoreInfo')}
                style={{ ...s.btn, background: '#d97706' }}>
                ❓ Need More Info
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const s = {
  pageTitle:    { fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 6 },
  pageSubtitle: { fontSize: 15, color: '#64748b', marginBottom: 24 },
  summaryBar:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
  summaryItem:  { background: '#fff', borderRadius: 10, padding: '16px 20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: 4 },
  summaryNum:   { fontSize: 28, fontWeight: 700, color: '#1e293b' },
  summaryLabel: { fontSize: 13, color: '#64748b' },
  card:         { background: '#fff', borderRadius: 12, padding: 28,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 },
  cardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pendingBadge: { background: '#fef3c7', color: '#92400e', padding: '4px 12px',
                  borderRadius: 20, fontSize: 13, fontWeight: 600, border: '1px solid #fcd34d' },
  detailsGrid:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 },
  detailItem:   { display: 'flex', flexDirection: 'column', gap: 3 },
  detailLabel:  { fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  detailValue:  { fontSize: 14, color: '#334155', fontWeight: 500 },
  costRow:      { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 },
  costBox:      { background: '#f8fafc', borderRadius: 8, padding: '12px 16px',
                  border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 4 },
  costLabel:    { fontSize: 12, color: '#64748b', fontWeight: 500 },
  costValue:    { fontSize: 18, fontWeight: 700, color: '#1e293b' },
  textarea:     { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                  fontSize: 14, color: '#334155', background: '#f8fafc', resize: 'vertical',
                  minHeight: 70, marginBottom: 16, fontFamily: 'inherit' },
  actions:      { display: 'flex', gap: 10 },
  btn:          { padding: '10px 20px', color: '#fff', border: 'none',
                  borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  emptyState:   { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12,
                  padding: '48px 32px', textAlign: 'center' },
};
