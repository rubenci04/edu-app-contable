import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, ClipboardList, Copy, RotateCcw, Save, SearchCheck, Shuffle, Undo2 } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, Card, PageHeader } from '../components/ui';
import { activities, allActivityFields, getActivity } from '../data/activities';
import type { Activity, ActivityField, Answers, ValidationResult } from '../data/activityTypes';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { SHORT_YEAR_MESSAGE, calculatedCents, formatCents, hasShortYear, validateActivity } from '../lib/activityValidation';
import { patrimonyActivities, patrimonyPath } from '../data/patrimonyActivities';
import { PdfActions } from '../components/PdfActions';
import { activityPdfModel } from '../lib/activityPdf';
import { useVariantProgress } from '../hooks/useVariantProgress';
import { generateVariant, parseSeed, randomSeed, supportsVariants } from '../lib/variants';
import type { GeneratedVariant } from '../lib/variants';

export const activityPath = (id: string) => `/practicar/${id}`;

export function PracticePage() {
  const { progress, storageError } = useLocalProgress();
  return <>
    <PageHeader eyebrow="PRACTICAMOS" title="De la lectura a la práctica." description="Leé cada situación, completá el comprobante y comprobá tus respuestas." />
    <div className="section-heading compact"><h2>Documentos comerciales</h2><span className="muted">{activities.length} actividades</span></div>
    <div className="practice-grid">{activities.map((activity, index) => {
      const record = progress.activities[activity.id];
      const status = record?.completed ? 'Completada' : record?.readyForReview ? 'Revisión docente' : record?.started ? 'En curso' : 'Por empezar';
      return <Link to={activityPath(activity.id)} key={activity.id} className="practice-link"><Card className="practice-tile"><span className="practice-icon"><ClipboardList size={25} /></span><span className="practice-step">ACTIVIDAD {String(index + 1).padStart(2, '0')}</span><h3>{activity.title}</h3><p>{activity.statement[0]}</p><span className="practice-status">{status}</span><span className="practice-open">Abrir actividad <ArrowRight size={17} /></span></Card></Link>;
    })}</div>
    <div className="section-heading compact"><h2>Patrimonio</h2><span className="muted">4 ejercicios</span></div>
    <div className="practice-grid">{patrimonyActivities.map((activity, index) => {
      const record = progress.activities[activity.id];
      return <Link to={patrimonyPath(activity.id)} key={activity.id} className="practice-link"><Card className="practice-tile"><span className="practice-icon"><ClipboardList size={25} /></span><span className="practice-step">PATRIMONIO 0{index + 1}</span><h3>{activity.title}</h3><p>{activity.instruction}</p><span className="practice-status">{record?.completed ? 'Completada' : record?.started ? 'En curso' : 'Por empezar'}</span><span className="practice-open">Abrir ejercicio <ArrowRight size={17} /></span></Card></Link>;
    })}</div>
    <p className="source-note">Los documentos provienen de «DOCUMENTOS COMERCIALES PDF.pdf». Los ejercicios de patrimonio provienen de «Teoria_documentos_comerciales_y_patrimonio.docx».</p>
    {storageError && <p className="storage-warning" role="status">Tu navegador no permite guardar el progreso local. Podés usar las actividades, pero el borrador podría perderse al actualizar.</p>}
  </>;
}

export function FieldControl({ field, value, onChange, result }: { field: ActivityField; value: string; onChange: (value: string) => void; result: ValidationResult | null }) {
  const issue = result?.feedback.find(item => item.fieldId === field.id);
  const inputId = `activity-${field.id.replace(/[^a-z0-9]/gi, '-')}`;
  const baseProps = { id: inputId, name: field.id, value, onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange(event.target.value), 'aria-invalid': issue?.status === 'error' || undefined, 'aria-describedby': issue ? `${inputId}-feedback` : undefined };
  if (field.calculated) return <div className={`document-field calculated-field${issue ? ' has-error' : ''}`}>
    <label htmlFor={inputId}>{field.label}</label>
    <input {...baseProps} type="text" readOnly aria-readonly="true" aria-live="polite" autoComplete="off" placeholder="Se calcula solo" />
    <small>{field.calculated === 'amount' ? 'Se calcula solo: cantidad × precio unitario.' : 'Se calcula solo: suma de los importes.'}</small>
    {issue && <span id={`${inputId}-feedback`} className="field-feedback">{issue.message}</span>}
  </div>;
  const shortYear = field.kind === 'date' && hasShortYear(value);
  return <div className={`document-field${issue || shortYear ? ' has-error' : ''}${field.validation === 'teacher' ? ' teacher-field' : ''}`}>
    <label htmlFor={inputId}>{field.label}</label>
    {field.kind === 'choice' ? <select {...baseProps}><option value="">Seleccioná una opción</option>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select> :
      <input {...baseProps} type="text" inputMode={field.kind === 'money' ? 'decimal' : field.kind === 'quantity' || field.kind === 'identifier' || field.kind === 'date' ? 'numeric' : undefined} autoComplete="off" placeholder={field.placeholder ?? (field.kind === 'money' ? '$ 0' : field.kind === 'date' ? 'DD/MM/AAAA' : '')} />}
    {issue ? <span id={`${inputId}-feedback`} className="field-feedback">{issue.message}</span> : shortYear && <span className="field-feedback" role="status">{SHORT_YEAR_MESSAGE}</span>}
    {field.validation === 'teacher' && <small>Requiere indicación docente; no se corrige automáticamente.</small>}
  </div>;
}

function ActivityDocument({ activity, answers, onAnswer, result }: { activity: Activity; answers: Answers; onAnswer: (id: string, value: string) => void; result: ValidationResult | null }) {
  const calculated = calculatedCents(activity, answers);
  const control = (field: ActivityField) => {
    const cents = field.calculated ? calculated[field.id] : undefined;
    const value = field.calculated ? (cents == null ? '' : formatCents(cents)) : answers[field.id] ?? '';
    return <FieldControl key={field.id} field={field} value={value} onChange={next => onAnswer(field.id, next)} result={result} />;
  };
  const headCount = activity.headFieldCount ?? (activity.id === 'factura-a' ? 3 : 2);
  return <Card className="document-sheet">
    <div className="document-head"><div className="document-issuer"><strong>{activity.issuer.name}</strong>{activity.issuer.address && <span>{activity.issuer.address}</span>}{activity.issuer.taxId && <span>CUIT: {activity.issuer.taxId}</span>}</div><div className="document-type">{activity.documentMark && <span className="document-mark">{activity.documentMark}</span>}<strong>{activity.documentType}</strong></div></div>
    <div className="document-main-fields">{activity.fields.slice(0, headCount).map(control)}</div>
    {activity.fields.length > headCount && <><div className="document-divider" /><h2>{activity.sectionTitle ?? `Datos del ${activity.id === 'orden-de-compra' ? 'proveedor' : 'cliente'}`}</h2><div className="document-field-grid">{activity.fields.slice(headCount).map(control)}</div></>}
    {activity.items.length > 0 && <><div className="document-divider" /><h2>{activity.items.length === 1 ? 'Detalle' : 'Artículos'}</h2><div className="document-items">{activity.items.map((line, index) => <fieldset className="document-item" key={line.id}><legend>{line.label}</legend><div className={`item-fields${line.fields.length < 4 ? ' item-fields-short' : ''}`}>{line.fields.map(control)}</div><span className="item-index">{String(index + 1).padStart(2, '0')}</span></fieldset>)}</div></>}
    {activity.totals.length > 0 && <><div className="document-divider" /><div className="document-totals">{activity.totals.map(control)}</div></>}
  </Card>;
}

export function ActivityPage() {
  const { activityId } = useParams();
  const activity = getActivity(activityId);
  const [params] = useSearchParams();
  const rawSeed = params.get('v');
  const canVary = Boolean(activity && supportsVariants(activity.id));
  const seed = canVary && rawSeed !== null ? parseSeed(rawSeed) : null;
  const variant = useMemo(() => (activity && seed ? generateVariant(activity.id, seed) : undefined), [activity, seed]);
  if (!activity) return <Card className="empty-state"><ClipboardList size={40} /><h1>No encontramos esta actividad</h1><p>Elegí una de las prácticas disponibles.</p><Link className="button" to="/practicar">Volver a Practicamos <ArrowRight size={18} /></Link></Card>;
  return <ActivityForm key={variant?.storageId ?? activity.id} activity={variant?.activity ?? activity} variant={variant} invalidSeed={canVary && rawSeed !== null && seed === null} />;
}

function VariantTools({ activity, variant, invalidSeed }: { activity: Activity; variant?: GeneratedVariant; invalidSeed: boolean }) {
  const [notice, setNotice] = useState('');
  async function copyLink() {
    if (!variant) return;
    const url = new URL(window.location.href);
    url.search = `?v=${variant.seed}`;
    url.hash = '';
    try { await navigator.clipboard.writeText(url.href); setNotice('Enlace copiado.'); }
    catch { setNotice(`No se pudo copiar. Copiá este enlace: ${url.href}`); }
  }
  return <>
    {invalidSeed && <p className="variant-note" role="status">El número de consigna no es válido. Mostramos la consigna original.</p>}
    {variant && <div className="variant-banner" role="region" aria-label="Consigna generada para practicar">
      <strong>Consigna n.º {variant.seed} · generada para practicar</strong>
      <div className="variant-actions"><Button type="button" className="button-quiet" onClick={copyLink}><Copy size={17} /> COPIAR ENLACE</Button><Link className="button button-quiet" to={activityPath(activity.id)}><Undo2 size={17} /> VOLVER A LA CONSIGNA ORIGINAL</Link></div>
      {notice && <p role="status" aria-live="polite">{notice}</p>}
    </div>}
  </>;
}

function ActivityForm({ activity, variant, invalidSeed = false }: { activity: Activity; variant?: GeneratedVariant; invalidSeed?: boolean }) {
  const navigate = useNavigate();
  const original = useLocalProgress();
  const extra = useVariantProgress();
  const recordId = variant?.storageId ?? activity.id;
  const record = variant ? extra.variants[recordId] : original.progress.activities[activity.id];
  const storageError = variant ? extra.storageError : original.storageError;
  const { startActivity, saveAnswers, recordResult } = variant ? extra : original;
  const answers = record?.answers ?? {};
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [continued, setContinued] = useState(false);
  const canDownload = Boolean(record?.completed || record?.readyForReview);
  useEffect(() => { startActivity(recordId); }, [recordId, startActivity]);

  function setAnswer(id: string, value: string) {
    saveAnswers(recordId, { ...answers, [id]: value });
    if (result) setResult(null);
    setContinued(false);
  }
  function check() {
    const next = validateActivity(activity, answers);
    recordResult(recordId, next.correct, next.needsTeacherReview);
    setResult(next);
  }
  function saveAndContinue() {
    setContinued(true);
    if (canDownload) document.getElementById('pdf-actions')?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function retry() {
    const firstError = result?.feedback[0]?.fieldId;
    setResult(null);
    if (firstError) document.getElementById(`activity-${firstError.replace(/[^a-z0-9]/gi, '-')}`)?.focus();
  }
  const fieldCount = allActivityFields(activity).filter(field => field.validation !== 'teacher').length;
  return <div className="activity-page">
    <PageHeader eyebrow={`PRACTICAMOS · ${activity.documentType}`} title={`Actividad: ${activity.title}`} description="Leé la situación y completá el documento. Podés guardar el borrador y volver más tarde." />
    <VariantTools activity={activity} variant={variant} invalidSeed={invalidSeed} />
    <Card className="activity-statement"><span className="eyebrow">SITUACIÓN · {activity.source}{variant ? ` · consigna n.º ${variant.seed}` : ''}</span><h2>Datos de la actividad</h2>{activity.statement.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</Card>
    {supportsVariants(activity.id) && <div className="variant-more"><Button type="button" className="button-secondary" onClick={() => navigate(`${activityPath(activity.id)}?v=${randomSeed()}`)}><Shuffle size={18} /> PRACTICAR CON OTRA CONSIGNA</Button></div>}
    <div className="activity-meta"><span>{record?.completed ? <><CheckCircle2 size={17} /> Completada</> : record?.readyForReview ? 'Campos verificables correctos · revisión docente' : 'Borrador local'}</span><span>{fieldCount} campos verificables · {record?.attempts ?? 0} intentos</span></div>
    <ActivityDocument activity={activity} answers={answers} onAnswer={setAnswer} result={result} />
    {activity.teacherReviewNote && <div className="teacher-review"><strong>{activity.teacherReviewTitle ?? 'Campos pendientes de indicación docente'}</strong><p>{activity.teacherReviewNote.replace(/^TODO_TEACHER_CONFIRMATION:\s*/, '')}</p></div>}
    {result && <div className={`activity-feedback ${result.correct ? 'is-correct' : 'has-errors'}`} role="status" aria-live="polite"><strong>{result.correct ? result.needsTeacherReview ? 'Los campos verificables están correctos.' : '¡Muy bien! Completaste correctamente el documento.' : `Hay ${result.feedback.length} ${result.feedback.length === 1 ? 'campo para revisar' : 'campos para revisar'}.`}</strong><p>{result.correct ? result.needsTeacherReview ? 'Los campos señalados necesitan confirmación docente antes de dar por terminada la actividad.' : 'Tu progreso quedó guardado en este dispositivo.' : 'Encontrarás una pista debajo de cada campo que necesita corrección.'}</p></div>}
    {canDownload && <PdfActions buildModel={() => activityPdfModel(activity, answers, record?.attempts ?? 0, !record?.completed, variant?.seed)} />}
    <div className="activity-actions"><Button type="button" onClick={check}><SearchCheck size={18} /> COMPROBAR</Button><Button type="button" className="button-secondary" onClick={saveAndContinue}><Save size={18} /> GUARDAR Y CONTINUAR</Button>{result && !result.correct && <Button type="button" className="button-quiet" onClick={retry}><RotateCcw size={17} /> REINTENTAR</Button>}<Link className="button button-quiet" to={activity.theoryPath}><BookOpen size={18} /> VOLVER A LA TEORÍA</Link></div>
    {continued && !canDownload && <div className="pdf-hint" role="status"><p>Completá y comprobá el documento para descargar el PDF</p><Link className="button button-quiet" to={activity.nextId ? activityPath(activity.nextId) : '/practicar'}>CONTINUAR IGUAL <ArrowRight size={17} /></Link></div>}
    {(result?.correct || (continued && canDownload)) && activity.nextId && <Link className="next-activity" to={activityPath(activity.nextId)}>SIGUIENTE ACTIVIDAD <ArrowRight size={18} /></Link>}
    {storageError && <p className="storage-warning" role="status">El navegador no permite guardar datos locales. El borrador podría perderse al actualizar.</p>}
  </div>;
}
