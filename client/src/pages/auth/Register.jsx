import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Shell, ErrorText } from '../../components/auth/AuthShell';
import { errorMessage } from '../../utils/authError';

export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullname: '', student_id: '', email: '', role: 'student', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  function update(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }
  return <Shell mode="register"><div className="adnu-card">
    <h2>Create Account</h2><p className="adnu-subtitle">Join ADNU-PRINTS and start printing smarter.</p>
    <ErrorText message={error} />
    <form onSubmit={submit}>
      <label htmlFor="reg-fullname">Full Name</label>
      <input id="reg-fullname" name="fullname" placeholder="Enter your full name" autoComplete="name" minLength={2} maxLength={150} required value={form.fullname} onChange={update} />
      <label htmlFor="reg-id">Student / Employee ID</label>
      <input id="reg-id" name="student_id" placeholder="Enter your ID number" maxLength={100} required value={form.student_id} onChange={update} />
      <label htmlFor="reg-email">Email Address</label>
      <input id="reg-email" type="email" name="email" placeholder="Enter your school email" autoComplete="email" required value={form.email} onChange={update} />
      <label htmlFor="reg-role">Account Type</label>
      <select id="reg-role" name="role" value={form.role} onChange={update}><option value="student">Student</option><option value="faculty">Faculty</option></select>
      <label htmlFor="reg-password">Password</label>
      <input id="reg-password" type="password" name="password" placeholder="Create your password (8+ characters)" minLength={8} maxLength={72} autoComplete="new-password" required value={form.password} onChange={update} />
      <button className="adnu-submit" disabled={busy}>{busy ? 'Creating account…' : 'Create Account'}</button>
    </form>
    <p className="adnu-switch">Already have an account? <Link to="/login">Log in here</Link></p>
    <div className="adnu-note">Registration is available for students and faculty.</div>
  </div></Shell>;
}


