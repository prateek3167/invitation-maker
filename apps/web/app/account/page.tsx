import type { Metadata } from 'next';
import AccountWorkspace from '../../components/account-workspace';
export const metadata: Metadata = { title: 'Your account studio — Invitation Maker', robots: { index: false, follow: false } };
export default function AccountPage() { return <AccountWorkspace />; }
