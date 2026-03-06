import { useState, useEffect } from 'react';
import { getRequestsByEmp, getApprovalsByReq, submitApproval } from '../services/api';

const STATUS = {
  Pending:      { bg: '#fef3c7', text: '#92400e', border: '#fcd34d', icon: '⏳' },
  Approved:     { bg: '#dcfce7', text: '#166534', border: '#86efac', icon: '✅' },
  Rejected:     { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', icon: '❌' },
  NeedMoreInfo: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', icon: '❓' },
};

export default function MyRequests() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [reply, setReply]         = useState('');
  const [sending, setSending]     = useState(false);
  const [sent, setSent]           = useState(false);

  useEffect(() => {
    getRequestsByEmp(user.employeeId)
      .then(res => setRequests(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (req) => {
    setSelected(req);
    setApprovals([]);
    setReply('');
    setSent(false);
    try {
      const res = await getApprovalsByReq(req.requestId);
      setApprovals(res.data);
    } catch (_err) {
      setApprovals([]);
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await submitApproval({
        requestId:  selected.requestId,
        approverId: user.employeeId,  // employee is replying
        decision:   'EmployeeReply',
        comments:   reply
      });
      setSent(true);
      setReply('');
      // Reload approvals to show the new reply
      const res = await getApprovalsByReq(selected.requestId);
      setApprovals(res.data);
    } catch (_err) {
      alert('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <p style={{ color: '#64748b' }}>Loading your requests...</p>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      <h1 style={s.pageTitle}>My Travel Requests</h1>
      <p style={s.pageSubtitle}>Track the status of all your travel requests.</p>

      <div style={s.layout}>

        {/* ── LEFT: List of requests ── */}
        <div style={s.leftPanel}>
          <h2 style={s.sectionTitle}>Your Requests</h2>

          {requests.length === 0 ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                You haven't submitted any requests yet.
              </p>
            </div>
          ) : (
            requests.map(req => {
              const st = STATUS[req.status] || STATUS.Pending;
              return (
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
                      background: st.bg, color: st.text, border: `1px solid ${st.border}`
                    }}>
                      {st.icon} {req.status}
                    </span>
                  </div>
                  <p style={{ fontWeight: 600, color: '#1e293b', margin: '4px 0 2px' }}>
                    ✈️ {req.destination}
                  </p>
                  <p style={{ fontSize: 12, color: '#64748b' }}>
                    {req.travelStartDate?.slice(0,10)} → {req.travelEndDate?.slice(0,10)}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* ── RIGHT: Request details + comments ── */}
        <div style={s.rightPanel}>
          {!selected ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>👈</p>
              <p style={{ color: '#64748b' }}>Select a request to view details.</p>
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
                      {selected.travelStartDate?.slice(0,10)} → {selected.travelEndDate?.slice(0,10)}
                      {' · '}{selected.travelMode}{' · '}{selected.travelType}
                    </p>
                  </div>
                  <span style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                    background: STATUS[selected.status]?.bg,
                    color: STATUS[selected.status]?.text,
                    border: `1px solid ${STATUS[selected.status]?.border}`
                  }}>
                    {STATUS[selected.status]?.icon} {selected.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 16 }}>
                  <div>
                    <p style={s.detailLabel}>Purpose</p>
                    <p style={s.detailValue}>{selected.purpose}</p>
                  </div>
                  <div>
                    <p style={s.detailLabel}>Total Est. Cost</p>
                    <p style={{ ...s.detailValue, color: '#1a56db', fontWeight: 700 }}>
                      ₹{selected.calculatedTotalCost}
                    </p>
                  </div>
                  <div>
                    <p style={s.detailLabel}>Hotel Required</p>
                    <p style={s.detailValue}>{selected.hotelRequired ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              {/* Rejected message */}
              {selected.status === 'Rejected' && (
                <div style={s.rejectedBox}>
                  <h3 style={{ color: '#991b1b', marginBottom: 6 }}>❌ Request Rejected</h3>
                  <p style={{ color: '#7f1d1d', fontSize: 14 }}>
                    Your travel request has been rejected. Please see the manager's
                    comments below. You may submit a new request if needed.
                  </p>
                </div>
              )}

              {/* Need More Info message + reply box */}
              {selected.status === 'NeedMoreInfo' && (
                <div style={s.infoBox}>
                  <h3 style={{ color: '#1e40af', marginBottom: 6 }}>❓ More Information Needed</h3>
                  <p style={{ color: '#1e3a8a', fontSize: 14, marginBottom: 16 }}>
                    Your manager needs more information before approving this request.
                    Please read their comments below and send a reply.
                  </p>

                  {sent && (
                    <div style={s.sentBanner}>
                      ✅ Your reply has been sent to the manager!
                    </div>
                  )}

                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={3}
                    style={s.textarea}
                  />
                  <button onClick={handleReply} disabled={sending || !reply.trim()}
                    style={{ ...s.btnPrimary, opacity: !reply.trim() ? 0.5 : 1 }}>
                    {sending ? 'Sending...' : '📨 Send Reply'}
                  </button>
                </div>
              )}

              {/* Comments / conversation thread */}
              {approvals.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3 style={s.sectionTitle}>💬 Comments</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {approvals.map(a => (
                      <div key={a.approvalId} style={{
                        ...s.commentBubble,
                        background: a.decision === 'EmployeeReply' ? '#eff6ff' : '#f8fafc',
                        borderLeft: `3px solid ${a.decision === 'EmployeeReply' ? '#1a56db' : '#94a3b8'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                            {a.decision === 'EmployeeReply' ? '👤 You' : '👨‍💼 Manager'}
                          </span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            {a.approvedAt?.slice(0,10)}
                          </span>
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                          background: STATUS[a.decision]?.bg || '#f1f5f9',
                          color: STATUS[a.decision]?.text || '#475569',
                          marginBottom: 8, display: 'inline-block'
                        }}>
                          {a.decision}
                        </span>
                        {a.comments && (
                          <p style={{ fontSize: 14, color: '#334155', marginTop: 6 }}>
                            {a.comments}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
  rejectedBox:  { background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: 10, padding: '16px 20px', marginBottom: 20 },
  infoBox:      { background: '#eff6ff', border: '1px solid #bfdbfe',
                  borderRadius: 10, padding: '16px 20px', marginBottom: 20 },
  sentBanner:   { background: '#dcfce7', border: '1px solid #86efac', color: '#166534',
                  padding: '10px 14px', borderRadius: 8, fontSize: 14,
                  fontWeight: 600, marginBottom: 12 },
  textarea:     { width: '100%', padding: '10px 12px', borderRadius: 8,
                  border: '1.5px solid #bfdbfe', fontSize: 14, color: '#1e293b',
                  background: '#fff', resize: 'vertical', minHeight: 80,
                  marginBottom: 10, fontFamily: 'inherit' },
  btnPrimary:   { padding: '10px 20px', background: '#1a56db', color: '#fff',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  fontSize: 14, fontWeight: 600 },
  commentBubble:{ borderRadius: 8, padding: '14px 16px' },
  detailLabel:  { fontSize: 11, color: '#94a3b8', fontWeight: 600,
                  textTransform: 'uppercase', marginBottom: 3 },
  detailValue:  { fontSize: 14, color: '#334155', fontWeight: 500 },
  emptyState:   { textAlign: 'center', padding: '60px 20px' },
};