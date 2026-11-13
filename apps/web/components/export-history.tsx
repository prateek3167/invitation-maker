'use client';
import { useEffect, useState } from 'react';
import { api } from '../lib/account-api';
import Dialog from './dialog';
type Job = { id: string; invitationId: string; revision: number; format: string; status: string; attempts: number; errorCode: string | null; createdAt: string; expiresAt: string };
export default function ExportHistory({ onClose }: { onClose: () => void }) {
  const [jobs, setJobs] = useState<Job[]>([]), [error, setError] = useState('');
  useEffect(() => {
    let alive = true, timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try { const data = await api<{ exports: Job[] }>('/api/v1/exports'); if (alive) { setJobs(data.exports); setError(''); } }
      catch (e) { if (alive) setError(e instanceof Error ? e.message : 'Could not load exports.'); }
      if (alive) timer = setTimeout(() => { void load(); }, 3000);
    };
    void load(); return () => { alive = false; clearTimeout(timer); };
  }, []);
  return <Dialog title="Export history" onClose={onClose}><p>Background exports capture a saved revision. Downloads stay private and expire after seven days.</p>{error && <p className="error-box" role="alert">{error}</p>}{jobs.length === 0 ? <p>No background exports yet. Open an account invitation and choose Queue background export in Download.</p> : <ul>{jobs.map(job => <li key={job.id}><p><strong>{job.format.toUpperCase()} · revision {job.revision}</strong><br /><span role="status">{job.status}</span> · attempt {job.attempts}/3<br /><small>{new Date(job.createdAt).toLocaleString()}</small></p>{job.status === 'completed' && <a className="button secondary" href={`/api/v1/exports/${job.id}/download`} download>Download {job.format.toUpperCase()}</a>}{job.status === 'failed' && <p className="field-help">Rendering failed after retries. Your invitation is safe; try a browser download or create a new export.</p>}</li>)}</ul>}</Dialog>;
}
