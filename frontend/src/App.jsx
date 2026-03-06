import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import SubmitRequest    from './pages/SubmitRequest';
import ManagerDashboard from './pages/ManagerDashboard';
import AllRequests      from './pages/AllRequests';
import AddItinerary     from './pages/AddItinerary';
import Login            from './pages/Login';
import MyItinerary      from './pages/MyItinerary';
import MyRequests       from './pages/MyRequests';

// Returns the logged-in user from localStorage, or null
function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); }
  catch { return null; }
}

// Protects a route — redirects to login if not logged in
function ProtectedRoute({ children, allowedRoles }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;
  return children;
}

function NavBar() {
  const location = useLocation();
  const user = getUser();

  if (!user || location.pathname === '/login') return null;

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Each role sees only their relevant links
  const allLinks = [
    { to: '/',           label: '📋 Submit Request', roles: ['Employee'] },
    { to: '/manager',    label: '👨‍💼 Manager',        roles: ['Manager'] },
    { to: '/all',        label: '📄 All Requests',   roles: ['Manager', 'Admin'] },
    { to: '/itinerary',  label: '📅 Itinerary',      roles: ['Admin'] },
    { to: '/my-itinerary', label: '📅 My Itinerary', roles: ['Employee'] },
    { to: '/my-requests', label: '📋 My Requests', roles: ['Employee'] },
  ];

  const visibleLinks = allLinks.filter(l => l.roles.includes(user.role));

  return (
    <nav style={nav.bar}>
      <span style={nav.brand}>✈️ Travel Portal</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {visibleLinks.map(l => (
          <Link key={l.to} to={l.to} style={{
            ...nav.link,
            background: location.pathname === l.to ? '#fff' : 'transparent',
            color:      location.pathname === l.to ? '#1a56db' : '#fff',
          }}>
            {l.label}
          </Link>
        ))}
        <div style={nav.divider} />
        <span style={nav.userName}>👤 {user.name}</span>
        <button onClick={logout} style={nav.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root {
          width: 100%;
          min-height: 100vh;
          background: #f0f4f8;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #1e293b;
        }
        a { text-decoration: none; }
        input, select, textarea, button { font-family: inherit; }
      `}</style>

      <BrowserRouter>
        <NavBar />
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Employee only */}
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <SubmitRequest />
              </ProtectedRoute>
            } />

            {/* Manager only */}
            <Route path="/manager" element={
              <ProtectedRoute allowedRoles={['Manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            } />

            {/* Manager and Admin */}
            <Route path="/all" element={
              <ProtectedRoute allowedRoles={['Manager', 'Admin']}>
                <AllRequests />
              </ProtectedRoute>
            } />

            <Route path="/my-itinerary" element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <MyItinerary />
              </ProtectedRoute>
            } />

            {/* Admin only */}
            <Route path="/itinerary" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AddItinerary />
              </ProtectedRoute>
            } />

            <Route path="/my-requests" element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <MyRequests />
              </ProtectedRoute>
            } />

            {/* Catch all — redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}

const nav = {
  bar:       { width: '100%', display: 'flex', justifyContent: 'space-between',
               alignItems: 'center', padding: '0 32px', height: 60,
               background: 'linear-gradient(90deg, #1a56db 0%, #1e40af 100%)',
               boxShadow: '0 2px 8px rgba(26,86,219,0.3)',
               position: 'sticky', top: 0, zIndex: 100 },
  brand:     { color: '#fff', fontWeight: 700, fontSize: 20 },
  link:      { padding: '6px 14px', borderRadius: 6, fontSize: 14,
               fontWeight: 500, transition: 'all 0.15s ease' },
  divider:   { width: 1, height: 24, background: 'rgba(255,255,255,0.3)', margin: '0 8px' },
  userName:  { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  logoutBtn: { padding: '6px 14px', background: 'rgba(255,255,255,0.15)',
               color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
               borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
};