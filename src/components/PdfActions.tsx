import { useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { useLocalStudent } from '../hooks/useLocalStudent';
import { pdfFileName } from '../lib/activityPdf';
import { createPdf } from '../lib/pdf';
import type { PdfModel } from '../lib/pdf';
import { Button } from './ui';

const MAIL_NOTICE = 'Descargá el PDF y adjuntalo en tu correo';

export function PdfActions({ buildModel }: { buildModel: () => PdfModel }) {
  const { profile } = useLocalStudent();
  const [notice, setNotice] = useState('');

  function makeFile() {
    const model = buildModel();
    const bytes = createPdf(model, profile);
    return new File([bytes], pdfFileName(model.title, profile?.name ?? ''), { type: 'application/pdf' });
  }
  function download() {
    const file = makeFile();
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    setNotice(`PDF generado: ${file.name}`);
  }
  async function share() {
    const file = makeFile();
    if (!navigator.canShare?.({ files: [file] })) { setNotice(MAIL_NOTICE); return; }
    try {
      await navigator.share({ files: [file], title: `Edu App Contable · ${buildModel().title}` });
      setNotice('');
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setNotice(`No se pudo compartir. ${MAIL_NOTICE}`);
    }
  }

  return <div className="pdf-actions">
    <div className="pdf-buttons">
      <Button type="button" onClick={download}><Download size={18} /> DESCARGAR PDF</Button>
      <Button type="button" className="button-secondary" onClick={share}><Share2 size={18} /> COMPARTIR</Button>
    </div>
    <p role="status" aria-live="polite">{notice}</p>
  </div>;
}
