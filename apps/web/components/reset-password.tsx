'use client';
import AuthForm from './auth-form';
export default function ResetPassword() { return <main className="account-main" style={{ maxWidth: 550 }}><a className="text-button" href="/account">Back to your account</a><AuthForm onAuthenticated={async () => { window.location.assign('/account'); }} /></main>; }
