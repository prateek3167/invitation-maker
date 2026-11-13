import { useEffect, useState } from 'react';
import { renderSvg } from '../../../packages/template-engine/render';
import type { Invitation } from '../../../packages/editor-core/document';
import { browserArtwork, samplePortraits } from '../lib/royal-art';

export default function InvitationPreview({ document, className = '', thumbnail = false, demo = false }: { document: Invitation; className?: string; thumbnail?: boolean; demo?: boolean }) {
  const [src,setSrc] = useState(''), [error,setError] = useState('');
  useEffect(() => {
    let alive = true, url = '';
    void Promise.all([browserArtwork(document,thumbnail),thumbnail||demo?samplePortraits(document):Promise.resolve(document)]).then(([art,rendered]) => {
      if (!alive) return;
      url = URL.createObjectURL(new Blob([renderSvg(rendered,art)],{type:'image/svg+xml'})); setSrc(url); setError('');
    }).catch(e => { if(alive) setError(e instanceof Error?e.message:'Preview unavailable.'); });
    return () => { alive=false; if(url) URL.revokeObjectURL(url); };
  },[document,thumbnail,demo]);
  if (error) return <div className="preview-error" role="alert">{error}</div>;
  return <img className={`invitation-preview ${className}`} src={src || undefined} alt={`${document.fields.heading}: ${document.fields.host}${document.fields.partner ? ` & ${document.fields.partner}` : ''}`} draggable={false} />;
}
