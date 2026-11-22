import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Shell, ErrorText } from '../../components/auth/AuthShell';
import { errorMessage } from '../../utils/authError';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }
  return <Shell mode="login"><div className="adnu-card">
    <h2>Welcome Back!</h2><p className="adnu-subtitle">Log in to your Campus Prints account.</p>
    <ErrorText message={error} />
    <form onSubmit={submit}>
      <label htmlFor="login-email">Email Address</label>
      <input id="login-email" type="email" placeholder="Enter your school email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} />
      <label htmlFor="login-password">Password</label>
      <input id="login-password" type="password" placeholder="Enter your password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
      <button className="adnu-submit" disabled={busy}>{busy ? 'Logging in…' : 'Log In'}</button>
    </form>
    <div className="adnu-divider"><span>OR</span></div>
    <p className="adnu-switch">Don't have an account? <Link to="/register">Register here</Link></p>
    <div className="adnu-note">For students and authorized printing staff.</div>
  </div></Shell>;
}


