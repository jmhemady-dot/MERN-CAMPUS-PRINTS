import { Link } from 'react-router-dom';
const logo = '/assets/images/ateneo-logo.png';

function Shell({ mode, children }) {
  const isRegister = mode === 'register';
  const features = isRegister
    ? ['Register your account', 'Submit your documents', 'Track your printing requests']
    : ['Upload documents easily', 'Customize your printing preferences', 'Track your printing requests'];

  return <div className="adnu-auth">
    <header className="adnu-header">
      <Link to="/login" className="adnu-brand"><img src={logo} alt="Ateneo de Naga University seal" /><span>ADNU-PRINTS</span></Link>
      <span className="adnu-caption">Campus printing made simple</span>
    </header>
    <main className="adnu-layout">
      <section className="adnu-welcome">
        <div className="adnu-welcome-content">
          <p className="adnu-eyebrow">ATENEO DE NAGA UNIVERSITY</p>
          <h1>{isRegister ? <>PRINT SMARTER,<br />START HERE.</> : <>PRINT SMARTER,<br />STUDY BETTER.</>}</h1>
          <p className="adnu-intro">Your campus printing companion. Submit print requests, customize your prints, and track your orders in one convenient place.</p>
          <div className="adnu-features">{features.map((f, i) => <div className="adnu-feature" key={f}><span>{String(i + 1).padStart(2, '0')}</span>{f}</div>)}</div>
        </div>
      </section>
      <section className="adnu-form-panel">{children}</section>
    </main>
  </div>;
}


function ErrorText({ message }) {
  return message ? <div className="adnu-error" role="alert">{message}</div> : null;
}


export { Shell, ErrorText };
