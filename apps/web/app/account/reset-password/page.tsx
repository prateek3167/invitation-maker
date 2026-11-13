import type { Metadata } from 'next';
import ResetPassword from '../../../components/reset-password';
export const metadata: Metadata = { title: 'Reset password — Invitation Maker', robots: { index: false, follow: false } };
export default function Page() { return <ResetPassword />; }
