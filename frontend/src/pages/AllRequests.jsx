import { useState, useEffect } from 'react';
import { getAllRequests, deleteRequest } from '../services/api';

const STATUS = {
  Pending:      { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  Approved:     { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  Rejected:     { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  NeedMoreInfo: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
};

export default function AllRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('All');

  useEffect(() => {
    getAllRequests()
      .then(res => setRequests(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Request #${id}?`)) return;
    try {
      await deleteRequest(id);
      setRequests(prev => prev.filter(r => r.requestId !== id));
    } catch (_err) {
      alert('Failed to delete. Please try again.');
    }
  };

  const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <p style={{ color: '#64748b', fontSize: 16 }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      <h1 style={s.pageTitle}>All Travel Requests</h1>
      <p style={s.pageSubtitle}>Overview of all travel requests across the organisation.</p>

      {/* Filter pills */}
      <div style={s.filterRow}>
        {['All', 'Pending', 'Approved', 'Rejected', 'NeedMoreInfo'].map(st => (
          <button key={st} onClick={() => setFilter(st)} style={{
            ...s.pill,
            background: filter === st ? '#1a56db' : '#fff',
            color:      filter === st ? '#fff'    : '#475569',
            border:     filter === st ? '1.5px solid #1a56db' : '1.5px solid #e2e8f0',
          }}>
            {st === 'NeedMoreInfo' ? 'Need More Info' : st}
            <span style={{
              marginLeft: 6, background: filter === st ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
              color: filter === st ? '#fff' : '#64748b',
              borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 600
            }}>
              {st === 'All' ? requests.length : requests.filter(r => r.status === st).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 32px', textAlign: 'center', color: '#94a3b8' }}>
            No requests found for this filter.
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['ID', 'Employee', 'Destination', 'Purpose', 'Dates', 'Mode', 'Total Cost', 'Status', 'Delete'].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((req, i) => {
                const color = STATUS[req.status] || STATUS.Pending;
                return (
                  <tr key={req.requestId}
                    style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={s.td}>
                      <span style={{ fontWeight: 700, color: '#1a56db' }}>#{req.requestId}</span>
                    </td>
                    <td style={s.td}>Emp #{req.employeeId}</td>
                    <td style={{ ...s.td, fontWeight: 600 }}>{req.destination}</td>
                    <td style={{ ...s.td, color: '#64748b', maxWidth: 180, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.purpose}
                    </td>
                    <td style={s.td}>
                      <span style={{ fontSize: 12 }}>
                        {req.travelStartDate?.slice(0,10)}<br/>→ {req.travelEndDate?.slice(0,10)}
                      </span>
                    </td>
                    <td style={s.td}>{req.travelMode}</td>
                    <td style={{ ...s.td, fontWeight: 700, color: '#1e293b' }}>
                      ₹{req.calculatedTotalCost}
                    </td>
                    <td style={s.td}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: color.bg, color: color.text, border: `1px solid ${color.border}`
                      }}>
                        {req.status}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button
                        onClick={() => handleDelete(req.requestId)}
                        style={{
                          padding: '5px 12px',
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: '1px solid #fca5a5',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 13,
                          fontWeight: 600
                        }}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const s = {
  pageTitle:    { fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 6 },
  pageSubtitle: { fontSize: 15, color: '#64748b', marginBottom: 24 },
  filterRow:    { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  pill:         { padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center' },
  tableWrap:    { background: '#fff', borderRadius: 12, overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700,
                  color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
                  borderBottom: '1px solid #e2e8f0' },
  td:           { padding: '14px 16px', fontSize: 14, color: '#334155',
                  borderBottom: '1px solid #f1f5f9' },
};
