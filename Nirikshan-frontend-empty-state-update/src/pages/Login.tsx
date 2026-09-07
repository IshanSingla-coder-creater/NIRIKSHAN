import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/Shell';
import { Button } from '../components/ui';
import { useStore } from '../store';
import { useToast } from '../toast';

export function Login() {
  const nav = useNavigate();
  const { setUser, logAction } = useStore();
  const push = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function enter(name: string, path: string) {
    setUser(name);
    logAction('Signed in', name, name);
    push(`Signed in as ${name}`, 'success');
    nav(path);
  }

  return (
    <div className="login">
      <section className="loginBrand">
        <Logo />
        <div>
          <p className="eyebrow">DEPARTMENT OF CONSUMER AFFAIRS</p>
          <h1>Evidence-backed Legal Metrology Inspection &amp; Compliance</h1>
          <p>AI-assisted capture, deterministic rules and traceable evidence for confident inspection workflows.</p>
        </div>
        <footer>Smart India Hackathon 2026 · SIH26034</footer>
      </section>
      <section className="loginForm">
        <div className="loginCard">
          <p className="eyebrow">SECURE ACCESS</p>
          <h2>Sign in to Nirikshan</h2>
          <p>Use your departmental credentials to access the inspection workspace.</p>
          <label>
            Officer ID / Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="officer@consumeraffairs.gov.in" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
          </label>
          <div className="remember">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a>Forgot password?</a>
          </div>
          <Button onClick={() => enter('Priya Sharma', '/dashboard')}>
            Sign in <ArrowRight size={16} />
          </Button>
          <div className="or">or continue as demo</div>
          <div className="demo">
            <Button variant="secondary" onClick={() => enter('Priya Sharma', '/dashboard')}>
              Inspector
            </Button>
            <Button variant="secondary" onClick={() => enter('Meera Nair', '/reviews')}>
              Reviewer
            </Button>
            <Button variant="secondary" onClick={() => enter('Arjun Desai', '/admin/users')}>
              Administrator
            </Button>
          </div>
          <div className="integrity">
            <ShieldCheck size={18} />
            <span>
              <b>AI assists inspection.</b> Deterministic rules make compliance decisions.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
