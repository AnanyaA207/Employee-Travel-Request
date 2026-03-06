import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [tab, setTab]         = useState('login');   // 'login' or 'register'
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');

  // Register form state
  const [regForm, setRegForm] = useState({
    name: '', email: '', department: '', role: 'Employee'
  });

  const handleRegChange = e =>
    setRegForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5093/api/auth/login', {
        email: loginEmail
      });
      const user = res.data;
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'Manager')      navigate('/manager');
      else if (user.role === 'Admin')   navigate('/all');
      else                              navigate('/');

    } catch (_err) {
      setError('No account found with that email. Please register first.');
    } finally {
      setLoading(false);
    }
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5093/api/auth/register', regForm);
      const user = res.data;
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'Manager')      navigate('/manager');
      else if (user.role === 'Admin')   navigate('/all');
      else                              navigate('/');

    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>✈️</div>
          <h1 style={s.title}>Travel Portal</h1>
          <p style={s.subtitle}>Employee Travel Management System</p>
        </div>

        {/* Tabs */}
        <div style={s.tabRow}>
          <button onClick={() => { setTab('login');    setError(''); }}
            style={{ ...s.tab, ...(tab === 'login'    ? s.tabActive : {}) }}>
            Sign In
          </button>
          <button onClick={() => { setTab('register'); setError(''); }}
            style={{ ...s.tab, ...(tab === 'register' ? s.tabActive : {}) }}>
            Register
          </button>
        </div>

        {/* Error */}
        {error && <div style={s.errorBanner}>⚠️ {error}</div>}

        {/* ── LOGIN FORM ── */}
        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <label style={s.label}>Work Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              placeholder="e.g. rahul@company.com"
              required
              style={s.input}
            />
            <button type="submit" disabled={loading} style={s.btn}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <label style={s.label}>Full Name *</label>
            <input
              name="name"
              value={regForm.name}
              onChange={handleRegChange}
              placeholder="e.g. Rahul Sharma"
              required
              style={s.input}
            />

            <label style={s.label}>Work Email *</label>
            <input
              type="email"
              name="email"
              value={regForm.email}
              onChange={handleRegChange}
              placeholder="e.g. rahul@company.com"
              required
              style={s.input}
            />

            <label style={s.label}>Department</label>
            <input
              name="department"
              value={regForm.department}
              onChange={handleRegChange}
              placeholder="e.g. Engineering, Sales, HR"
              style={s.input}
            />

            <label style={s.label}>Role *</label>
            <select
              name="role"
              value={regForm.role}
              onChange={handleRegChange}
              style={s.input}
            >
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>

            <button type="submit" disabled={loading} style={s.btn}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

const s = {
  page:       { minHeight: '100vh', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: '#f0f4f8', padding: 24 },
  card:       { background: '#fff', borderRadius: 16, padding: 40, width: '100%',
                maxWidth: 440, boxShadow: '0 4px 24px rgba(0,0,0,0.10)' },
  title:      { fontSize: 26, fontWeight: 700, color: '#1e293b', margin: 0 },
  subtitle:   { fontSize: 14, color: '#64748b', marginTop: 6 },
  tabRow:     { display: 'flex', background: '#f1f5f9', borderRadius: 8,
                padding: 4, marginBottom: 24, gap: 4 },
  tab:        { flex: 1, padding: '8px 0', border: 'none', background: 'transparent',
                borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500,
                color: '#64748b' },
  tabActive:  { background: '#fff', color: '#1a56db', fontWeight: 700,
                boxShadow: '0 1px 4px rgba(0,0,0,0.10)' },
  label:      { display: 'block', fontSize: 13, fontWeight: 600,
                color: '#374151', marginBottom: 6 },
  input:      { width: '100%', padding: '11px 14px', fontSize: 14, borderRadius: 8,
                border: '1.5px solid #e2e8f0', background: '#f8fafc',
                color: '#1e293b', marginBottom: 16, colorScheme: 'light' },
  btn:        { width: '100%', padding: '12px', background: '#1a56db', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
                cursor: 'pointer', marginTop: 4 },
  errorBanner:{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b',
                padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 },
};