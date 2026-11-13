'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { KeyRound, LoaderCircle, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { api, ApiError, type AccountInfo } from '../lib/account-api';

export default function AuthForm({ capabilities, onAuthenticated, initialError = '' }: { capabilities?: AccountInfo['capabilities']; onAuthenticated: () => Promise<void>; initialError?: string }) {
  const [mode, setMode] = useState<'login' | 'register' | 'recover' | 'reset' | 'two-factor'>('login');
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [code, setCode] = useState(''), [token, setToken] = useState('');
  const [backupCode, setBackupCode] = useState(false), [busy, setBusy] = useState(false), [notice, setNotice] = useState(''), [error, setError] = useState(initialError);
  useEffect(() => { const value = new URLSearchParams(window.location.search).get('token'); if (value) { setToken(value); setMode('reset'); } }, []);
  const run = async (work: () => Promise<void>) => { setBusy(true); setError(''); setNotice(''); try { await work(); } catch (e) { setError(e instanceof Error ? e.message : 'Please retry.'); if (e instanceof ApiError && e.code === 'EMAIL_NOT_VERIFIED') setNotice('Check your inbox to verify your email before signing in.'); } finally { setBusy(false); } };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      if (mode === 'recover') {
        await api('/api/auth/request-password-reset', 'POST', { email: email.trim().toLowerCase(), redirectTo: '/account/reset-password' });
        setNotice('If an account matches this address, a password-reset link will arrive shortly.'); return;
      }
      if (mode === 'reset') {
        await api('/api/auth/reset-password', 'POST', { token, newPassword: password });
        setPassword(''); setToken(''); setMode('login'); window.history.replaceState(null, '', '/account/reset-password'); setNotice('Password updated. Sign in with your new password.'); return;
      }
      if (mode === 'two-factor') { await api(`/api/auth/two-factor/${backupCode ? 'verify-backup-code' : 'verify-totp'}`, 'POST', { code, trustDevice: false }); setCode(''); await onAuthenticated(); return; }
      if (mode === 'register') {
        await api('/api/auth/sign-up/email', 'POST', { name: name.trim(), email: email.trim().toLowerCase(), password, callbackURL: '/account' });
        setPassword(''); setMode('login'); setNotice('Check your inbox to verify your email. You can sign in after verification.'); return;
      }
      const response = await api<{ twoFactorRedirect?: boolean }>('/api/auth/sign-in/email', 'POST', { email: email.trim().toLowerCase(), password });
      setPassword('');
      if (response.twoFactorRedirect) { setMode('two-factor'); return; }
      await onAuthenticated();
    });
  };
  return <div className="auth-panel"><span className="eyebrow">WELCOME TO YOUR STUDIO</span><h2>{mode === 'register' ? 'Make yourself at home.' : mode === 'recover' ? 'Let’s get you back in.' : mode === 'reset' ? 'A fresh start.' : mode === 'two-factor' ? 'One more security check.' : 'Lovely to see you again.'}</h2>
    <form onSubmit={submit}>
      {mode === 'register' && <label className="field">Your name<input required maxLength={80} autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></label>}
      {!['reset', 'two-factor'].includes(mode) && <label className="field">Email address<input required type="email" maxLength={254} autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>}
      {['login', 'register', 'reset'].includes(mode) && <label className="field">{mode === 'reset' ? 'New password' : 'Password'}<input required type="password" minLength={12} maxLength={128} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} /></label>}
      {mode === 'two-factor' && <label className="field">{backupCode ? 'Backup code' : 'Authenticator code'}<input required inputMode={backupCode ? 'text' : 'numeric'} autoComplete="one-time-code" maxLength={backupCode ? 30 : 6} pattern={backupCode ? undefined : '[0-9]{6}'} value={code} onChange={e => setCode(e.target.value)} /></label>}
      {['register', 'reset'].includes(mode) && <p className="field-help">Use at least 12 characters. A memorable passphrase works well.</p>}
      {error && <p className="error-box" role="alert">{error}</p>}{notice && <p className="notice" role="status">{notice}</p>}
      {capabilities?.emailPassword !== false && <button className="button full" type="submit" disabled={busy}>{busy ? <LoaderCircle size={16} className="spin" /> : mode === 'recover' ? <Mail size={16} /> : mode === 'two-factor' ? <ShieldCheck size={16} /> : <UserRound size={16} />}{mode === 'register' ? 'Create account' : mode === 'recover' ? 'Send reset link' : mode === 'reset' ? 'Set new password' : mode === 'two-factor' ? 'Verify code' : 'Sign in'}</button>}
    </form>
    {mode === 'login' && capabilities?.google && <button className="button secondary full" disabled={busy} onClick={() => { void run(async () => { const result = await api<{ url: string }>('/api/auth/sign-in/social', 'POST', { provider: 'google', callbackURL: '/account' }); window.location.assign(result.url); }); }}>Continue with Google</button>}
    {mode === 'login' && <><button className="auth-switch text-button" disabled={busy} onClick={() => { setMode('register'); setError(''); setNotice(''); }}>New here? Create an account</button><button className="auth-switch text-button" disabled={busy} onClick={() => { setMode('recover'); setError(''); setNotice(''); }}><KeyRound size={14} />Forgot your password?</button><button className="auth-switch text-button" disabled={busy || !email.trim()} onClick={() => { void run(async () => { await api('/api/auth/send-verification-email', 'POST', { email: email.trim().toLowerCase(), callbackURL: '/account' }); setNotice('If this address needs verification, a new link will arrive shortly.'); }); }}>Resend verification email</button></>}
    {mode === 'two-factor' && <button className="auth-switch text-button" onClick={() => { setBackupCode(!backupCode); setCode(''); }}>{backupCode ? 'Use authenticator instead' : 'Use a backup code'}</button>}
    {mode !== 'login' && <button className="auth-switch text-button" disabled={busy} onClick={() => { setMode('login'); setPassword(''); setError(''); setNotice(''); }}>Already have an account? Sign in</button>}
    {capabilities?.emailCapture && <p className="field-help">Local development mailbox: run <code>npm run mail:preview -- your@email.test</code> on this computer to open verification/reset messages. These messages are not sent externally.</p>}
    <p className="field-help">Verification links expire in one hour. Reset links expire in 30 minutes. Password resets revoke existing sessions.</p>
  </div>;
}
