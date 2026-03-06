import { useState, useEffect } from 'react';
import { getAllRequests, submitApproval, getApprovalsByReq } from '../services/api';

export default function ManagerDashboard() {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [comments, setComments]   = useState('');
  const [sending, setSending]     = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    getAllRequests()
      .then(res => setRequests(res.data))
      .catch(_err => console.error(_err))
      .finally(() => setLoading(false));
  };

  const handleSelect = async (req) => {
    setSelected(req);
    setComments('');
    try {
      const res = await getApprovalsByReq(req.requestId);
      setApprovals(res.data);
    } catch (_err) {
      setApprovals([]);
    }
  };

  const handleDecision = async (decision) => {
    if (!selected) return;
    setSending(true);
    try {
      await submitApproval({
        requestId:  selected.requestId,
        approverId: 3,
        decision,
        comments
      });
      setComments('');
      // Reload approvals thread
      const res = await getApprovalsByReq(selected.requestId);
      setApprovals(res.data);
      // Reload requests list and update selected
      const reqRes = await getAllRequests();
      setRequests(reqRes.data);
      const updated = reqRes.data.find(r => r.requestId === selected.requestId);
      if (updated) setSelected(updated);
    } catch (_err) {
      alert('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!comments.trim()) return;
    setSending(true);
    try {
      await submitApproval({
        requestId:  selected.requestId,
        approverId: 3,
        decision:   'NeedMoreInfo',
        comments
      });
      setComments('');
      const res = await getApprovalsByReq(selected.requestId);
      setApprovals(res.data);
    } catch (_err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <p style={{ color: '#64748b', fontSize: 16 }}>Loading requests...</p>
    </div>
  );

  const pending  = requests.filter(r => r.status === 'Pending');
  const needInfo = requests.filter(r => r.status === 'NeedMoreInfo');
  const allActive = [...pending, ...needInfo];

  return (
    <div style={{ width: '100%' }}>
      <h1 style={s.pageTitle}>Manager Dashboard</h1>
      <p style={s.pageSubtitle}>Review and respond to travel requests from your team.</p>

      {/* Summary bar */}
      <div style={s.summaryBar}>
        {[
          { label: 'Total',       count: requests.length,                             color: '#1e293b' },
          { label: 'Pending',     count: pending.length,                              color: '#d97706' },
          { label: 'Need Info',   count: needInfo.length,                             color: '#1e40af' },
          { label: 'Approved',    count: requests.filter(r=>r.status==='Approved').length,  color: '#166534' },
          { label: 'Rejected',    count: requests.filter(r=>r.status==='Rejected').length,  color: '#991b1b' },
        ].map(item => (
          <div key={item.label} style={s.summaryItem}>
            <span style={{ ...s.summaryNum, color: item.color }}>{item.count}</span>
            <span style={s.summaryLabel}>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={s.layout}>

        {/* ── LEFT: Request list ── */}
        <div style={s.leftPanel}>
          <h2 style={s.sectionTitle}>Active Requests</h2>

          {allActive.length === 0 ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🎉</p>
              <p style={{ color: '#64748b', fontSize: 14 }}>All caught up!</p>
            </div>
          ) : (
            allActive.map(req => (
              <div key={req.requestId}
                onClick={() => handleSelect(req)}
                style={{
                  ...s.reqCard,
                  border: selected?.requestId === req.requestId
                    ? '2px solid #1a56db' : '1.5px solid #e2e8f0',
                  background: selected?.requestId === req.requestId
                    ? '#eff6ff' : '#fff',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#1a56db', fontSize: 13 }}>
                    #{req.requestId}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
                    background: req.status === 'NeedMoreInfo' ? '#dbeafe' : '#fef3c7',
                    color:      req.status === 'NeedMoreInfo' ? '#1e40af' : '#92400e',
                  }}>
                    {req.status === 'NeedMoreInfo' ? '❓ Need Info' : '⏳ Pending'}
                  </span>
                </div>
                <p style={{ fontWeight: 600, color: '#1e293b', margin: '4px 0 2px' }}>
                  ✈️ {req.destination}
                </p>
                <p style={{ fontSize: 12, color: '#64748b' }}>
                  Emp #{req.employeeId} · {req.travelStartDate?.slice(0,10)}
                </p>
              </div>
            ))
          )}

          {/* Divider for resolved */}
          {requests.filter(r => r.status === 'Approved' || r.status === 'Rejected').length > 0 && (
            <>
              <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600,
                textTransform: 'uppercase', margin: '16px 0 8px' }}>
                Resolved
              </p>
              {requests
                .filter(r => r.status === 'Approved' || r.status === 'Rejected')
                .map(req => (
                  <div key={req.requestId}
                    onClick={() => handleSelect(req)}
                    style={{
                      ...s.reqCard,
                      border: selected?.requestId === req.requestId
                        ? '2px solid #1a56db' : '1.5px solid #e2e8f0',
                      background: selected?.requestId === req.requestId
                        ? '#eff6ff' : '#fafafa',
                      opacity: 0.8
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: '#64748b', fontSize: 13 }}>
                        #{req.requestId}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
                        background: req.status === 'Approved' ? '#dcfce7' : '#fee2e2',
                        color:      req.status === 'Approved' ? '#166534' : '#991b1b',
                      }}>
                        {req.status === 'Approved' ? '✅' : '❌'} {req.status}
                      </span>
                    </div>
                    <p style={{ fontWeight: 500, color: '#475569', margin: '4px 0 2px', fontSize: 14 }}>
                      {req.destination}
                    </p>
                  </div>
                ))}
            </>
          )}
        </div>

        {/* ── RIGHT: Request detail + conversation ── */}
        <div style={s.rightPanel}>
          {!selected ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>👈</p>
              <p style={{ color: '#64748b' }}>Select a request from the left to review it.</p>
            </div>
          ) : (
            <>
              {/* Request summary */}
              <div style={s.summaryBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                      ✈️ {selected.destination}
                    </h2>
                    <p style={{ fontSize: 13, color: '#64748b' }}>
                      Request #{selected.requestId} · Emp #{selected.employeeId} ·{' '}
                      {selected.travelStartDate?.slice(0,10)} → {selected.travelEndDate?.slice(0,10)}
                    </p>
                  </div>
                  <span style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                    background: statusStyle(selected.status).bg,
                    color: statusStyle(selected.status).text,
                    border: `1px solid ${statusStyle(selected.status).border}`
                  }}>
                    {selected.status}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 16 }}>
                  {[
                    ['Purpose',      selected.purpose],
                    ['Mode',         selected.travelMode],
                    ['Type',         selected.travelType],
                    ['Total Cost',   `₹${selected.calculatedTotalCost}`],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p style={s.detailLabel}>{label}</p>
                      <p style={s.detailValue}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversation thread */}
              {approvals.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={s.sectionTitle}>💬 Conversation</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {approvals.map(a => (
                      <div key={a.approvalId} style={{
                        ...s.bubble,
                        background:   a.decision === 'EmployeeReply' ? '#f0fdf4' : '#eff6ff',
                        borderLeft:   `3px solid ${a.decision === 'EmployeeReply' ? '#16a34a' : '#1a56db'}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                            {a.decision === 'EmployeeReply' ? '👤 Employee' : '👨‍💼 You (Manager)'}
                          </span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            {a.approvedAt?.slice(0,10)}
                          </span>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                          background: statusStyle(a.decision).bg || '#f1f5f9',
                          color: statusStyle(a.decision).text || '#475569',
                          display: 'inline-block', marginBottom: 6
                        }}>
                          {a.decision}
                        </span>
                        {a.comments && (
                          <p style={{ fontSize: 14, color: '#334155' }}>{a.comments}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reply / action box — only show if not yet resolved */}
              {(selected.status === 'Pending' || selected.status === 'NeedMoreInfo') && (
                <div style={s.actionBox}>
                  <h3 style={s.sectionTitle}>📝 Respond</h3>
                  <textarea
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    placeholder="Add a comment or message to the employee..."
                    rows={3}
                    style={s.textarea}
                  />
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button onClick={() => handleDecision('Approved')} disabled={sending}
                      style={{ ...s.btn, background: '#16a34a' }}>
                      ✅ Approve
                    </button>
                    <button onClick={() => handleDecision('Rejected')} disabled={sending}
                      style={{ ...s.btn, background: '#dc2626' }}>
                      ❌ Reject
                    </button>
                    <button onClick={handleSendMessage} disabled={sending || !comments.trim()}
                      style={{ ...s.btn, background: '#1a56db', opacity: !comments.trim() ? 0.5 : 1 }}>
                      💬 Send Message
                    </button>
                  </div>
                </div>
              )}

              {/* Already resolved message */}
              {(selected.status === 'Approved' || selected.status === 'Rejected') && (
                <div style={{
                  background: selected.status === 'Approved' ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${selected.status === 'Approved' ? '#86efac' : '#fecaca'}`,
                  borderRadius: 10, padding: '16px 20px', textAlign: 'center'
                }}>
                  <p style={{ fontWeight: 600, color: selected.status === 'Approved' ? '#166534' : '#991b1b' }}>
                    {selected.status === 'Approved'
                      ? '✅ This request has been approved.'
                      : '❌ This request has been rejected.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function statusStyle(status) {
  const map = {
    Pending:       { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
    Approved:      { bg: '#dcfce7', text: '#166534', border: '#86efac' },
    Rejected:      { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
    NeedMoreInfo:  { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
    EmployeeReply: { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
  };
  return map[status] || { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
}

const s = {
  pageTitle:    { fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 6 },
  pageSubtitle: { fontSize: 15, color: '#64748b', marginBottom: 24 },
  summaryBar:   { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 28 },
  summaryItem:  { background: '#fff', borderRadius: 10, padding: '16px 20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex',
                  flexDirection: 'column', gap: 4 },
  summaryNum:   { fontSize: 26, fontWeight: 700 },
  summaryLabel: { fontSize: 13, color: '#64748b' },
  layout:       { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' },
  leftPanel:    { background: '#fff', borderRadius: 12, padding: 16,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
  rightPanel:   { background: '#fff', borderRadius: 12, padding: 28,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
                  minHeight: 400 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 14 },
  reqCard:      { borderRadius: 8, padding: '12px 14px', marginBottom: 10,
                  cursor: 'pointer', transition: 'all 0.15s' },
  summaryBox:   { background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 10, padding: '18px 20px', marginBottom: 20 },
  bubble:       { borderRadius: 8, padding: '12px 16px' },
  actionBox:    { background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 10, padding: '20px' },
  textarea:     { width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1e293b',
                  background: '#fff', resize: 'vertical', minHeight: 80,
                  marginBottom: 12, fontFamily: 'inherit' },
  btn:          { padding: '10px 18px', color: '#fff', border: 'none',
                  borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  detailLabel:  { fontSize: 11, color: '#94a3b8', fontWeight: 600,
                  textTransform: 'uppercase', marginBottom: 3 },
  detailValue:  { fontSize: 14, color: '#334155', fontWeight: 500 },
  emptyState:   { textAlign: 'center', padding: '60px 20px' },
};