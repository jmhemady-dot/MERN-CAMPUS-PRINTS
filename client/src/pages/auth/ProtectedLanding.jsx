import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
const logo = '/assets/images/ateneo-logo.png';

export function ProtectedLanding({ admin = false }) {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, user: null });
  useEffect(() => {
    let active = true;
    api.get('/auth/me').then(({data}) => { if (active) setState({loading: false, user: data.user}); })
      .catch(() => { if (active) setState({loading: false, user: null}); });
    return () => { active = false; };
  }, []);
  if (state.loading) return <div className="adnu-status">Checking your session…</div>;
  if (!state.user) return <Navigate to="/login" replace />;
  if (admin && state.user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (!admin && state.user.role === 'admin') return <Navigate to="/admin" replace />;
  async function logout() { try { await api.post('/auth/logout'); navigate('/login', { replace: true }); } catch { alert('Could not log out. Check your connection.'); } }
  return <div className="adnu-placeholder">
    <header className="adnu-header"><Link className="adnu-brand" to="/"><img src={logo} alt="ADNU seal" /><span>ADNU-PRINTS</span></Link><button onClick={logout}>Log Out</button></header>
    <section><p className="adnu-eyebrow">ATENEO DE NAGA UNIVERSITY</p><h1>{admin ? 'Admin' : 'Student'} Dashboard</h1>
      <p>Welcome, <strong>{state.user.fullname}</strong>.</p>
      <p>Your login and registration are connected to MongoDB.</p>
      <p className="adnu-note">Dashboard, printing queue, document uploads and history are the next conversion stage. This screen is not the finished dashboard.</p>
    </section>
  </div>;
}

