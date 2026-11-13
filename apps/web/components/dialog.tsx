'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export default function Dialog({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    const el = ref.current;
    el?.showModal();
    return () => el?.close();
  }, []);
  return <dialog ref={ref} className={wide ? 'dialog editor-dialog' : 'dialog'} aria-label={title}
    onCancel={e => { e.preventDefault(); closeRef.current(); }}>
    {!wide && <div className="dialog-top"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button></div>}
    {children}
  </dialog>;
}
