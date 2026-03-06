import { useState, useEffect } from 'react';
import { getRequestsByEmp, getItineraryByReq } from '../services/api';

export default function MyItinerary() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [requests, setRequests]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [itiLoading, setItiLoading] = useState(false);
  const [noItinerary, setNoItinerary] = useState(false);

  // Load employee's approved trips
  useEffect(() => {
    getRequestsByEmp(user.employeeId)
      .then(res => {
        const approved = res.data.filter(r => r.status === 'Approved');
        setRequests(approved);
      })
      .finally(() => setLoading(false));
  }, []);

  // When employee clicks a trip, load its itinerary
  const handleSelect = async (req) => {
    setSelected(req);
    setItinerary(null);
    setNoItinerary(false);
    setItiLoading(true);
    try {
      const res = await getItineraryByReq(req.requestId);
      setItinerary(res.data);
    } catch (_err) {
      setNoItinerary(true);
    } finally {
      setItiLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
      <p style={{ color: '#64748b' }}>Loading your trips...</p>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      <h1 style={s.pageTitle}>My Itineraries</h1>
      <p style={s.pageSubtitle}>View travel details for your approved trips.</p>

      <div style={s.layout}>

        {/* ── LEFT: Employee's approved trips ── */}
        <div style={s.leftPanel}>
          <h2 style={s.sectionTitle}>✈️ Your Approved Trips</h2>

          {requests.length === 0 ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                No approved trips yet.
              </p>
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
                    ? '#eff6ff' : '#fff',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#1a56db', fontSize: 13 }}>
                    #{req.requestId}
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    {req.travelMode}
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

        {/* ── RIGHT: Itinerary details ── */}
        <div style={s.rightPanel}>
          {!selected ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>👈</p>
              <p style={{ color: '#64748b' }}>
                Select a trip from the left to view its itinerary.
              </p>
            </div>
          ) : itiLoading ? (
            <div style={s.emptyState}>
              <p style={{ color: '#64748b' }}>Loading itinerary...</p>
            </div>
          ) : noItinerary ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>⏳</p>
              <h3 style={{ color: '#92400e', marginBottom: 8 }}>
                Itinerary Not Ready Yet
              </h3>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                Your trip to <strong>{selected.destination}</strong> has been
                approved but the admin hasn't added the itinerary details yet.
                Please check back later.
              </p>
            </div>
          ) : (
            <>
              {/* Trip summary */}
              <div style={s.summaryBox}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                  ✈️ {selected.destination}
                </h2>
                <p style={{ fontSize: 13, color: '#64748b' }}>
                  {selected.travelStartDate?.slice(0,10)} → {selected.travelEndDate?.slice(0,10)}
                  {' · '}{selected.travelMode}{' · '}{selected.travelType}
                </p>
              </div>

              {/* Itinerary details */}
              <div style={s.detailsGrid}>

                {itinerary.flightDetails && (
                  <div style={s.detailCard}>
                    <p style={s.detailIcon}>✈️</p>
                    <p style={s.detailLabel}>Flight</p>
                    <p style={s.detailValue}>{itinerary.flightDetails}</p>
                  </div>
                )}

                {itinerary.hotelName && (
                  <div style={s.detailCard}>
                    <p style={s.detailIcon}>🏨</p>
                    <p style={s.detailLabel}>Hotel</p>
                    <p style={s.detailValue}>{itinerary.hotelName}</p>
                  </div>
                )}

                {itinerary.hotelCheckIn && (
                  <div style={s.detailCard}>
                    <p style={s.detailIcon}>📅</p>
                    <p style={s.detailLabel}>Check-in</p>
                    <p style={s.detailValue}>{itinerary.hotelCheckIn?.slice(0,10)}</p>
                  </div>
                )}

                {itinerary.hotelCheckOut && (
                  <div style={s.detailCard}>
                    <p style={s.detailIcon}>📅</p>
                    <p style={s.detailLabel}>Check-out</p>
                    <p style={s.detailValue}>{itinerary.hotelCheckOut?.slice(0,10)}</p>
                  </div>
                )}

                {itinerary.localTransport && (
                  <div style={s.detailCard}>
                    <p style={s.detailIcon}>🚗</p>
                    <p style={s.detailLabel}>Local Transport</p>
                    <p style={s.detailValue}>{itinerary.localTransport}</p>
                  </div>
                )}

              </div>

              {/* Meeting schedule — full width */}
              {itinerary.meetingSchedule && (
                <div style={s.meetingBox}>
                  <p style={s.detailLabel}>📋 Meeting Schedule</p>
                  <p style={{ color: '#1e293b', fontSize: 14, lineHeight: 1.6, marginTop: 6 }}>
                    {itinerary.meetingSchedule}
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
  summaryBox:   { background: '#eff6ff', border: '1px solid #bfdbfe',
                  borderRadius: 10, padding: '16px 20px', marginBottom: 24 },
  detailsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 },
  detailCard:   { background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 10, padding: '16px', textAlign: 'center' },
  detailIcon:   { fontSize: 28, marginBottom: 8 },
  detailLabel:  { fontSize: 11, color: '#64748b', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 },
  detailValue:  { fontSize: 14, color: '#1e293b', fontWeight: 600 },
  meetingBox:   { background: '#fefce8', border: '1px solid #fde68a',
                  borderRadius: 10, padding: '16px 20px' },
  emptyState:   { textAlign: 'center', padding: '60px 20px' },
};