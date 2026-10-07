import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, RotateCcw, SearchCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, PageHeader } from '../components/ui';
import { getPatrimonyActivity, patrimonyActivities, patrimonyPath } from '../data/patrimonyActivities';
import type { ValidationResult } from '../data/activityTypes';
import { useLocalProgress } from '../hooks/useLocalProgress';
import { validateFields } from '../lib/activityValidation';
import { FieldControl } from './PracticePages';
import { PdfActions } from '../components/PdfActions';
import { patrimonyPdfModel } from '../lib/activityPdf';

export function PatrimonyPage() {
  const { exerciseId } = useParams();
  const activity = getPatrimonyActivity(exerciseId);
  if (!activity) return <Card className="empty-state"><h1>No encontramos este ejercicio</h1><Link className="button" to="/practicar">Volver a Practicamos <ArrowRight size={18} /></Link></Card>;
  return <PatrimonyForm key={activity.id} activity={activity} />;
}

function PatrimonyForm({ activity }: { activity: NonNullable<ReturnType<typeof getPatrimonyActivity>> }) {
  const { progress, storageError, startActivity, saveAnswers, recordResult } = useLocalProgress();
  const record = progress.activities[activity.id];
  const answers = record?.answers ?? {};
  const [result, setResult] = useState<ValidationResult | null>(null);
  useEffect(() => { startActivity(activity.id); }, [activity.id, startActivity]);
  const index = patrimonyActivities.findIndex(item => item.id === activity.id);
  const next = patrimonyActivities[index + 1];

  function answer(id: string, value: string) {
    saveAnswers(activity.id, { ...answers, [id]: value });
    setResult(null);
  }
  function check() {
    const checked = validateFields(activity.fields, answers);
    recordResult(activity.id, checked.correct, false);
    setResult(checked);
  }
  function retry() {
    const firstError = result?.feedback[0]?.fieldId;
    setResult(null);
    if (firstError) document.getElementById(`activity-${firstError.replace(/[^a-z0-9]/gi, '-')}`)?.focus();
  }

  return <div className="activity-page">
    <PageHeader eyebrow={`PATRIMONIO · EJERCICIO ${index + 1} DE ${patrimonyActivities.length}`} title={activity.title} description={activity.instruction} />
    <Card className="activity-statement"><span className="eyebrow">FUENTE · PRÁCTICA CONTABLE DEL DOCUMENTO TEÓRICO</span><h2>Datos del ejercicio</h2><ul className="patrimony-given">{activity.given.map(line => <li key={line}>{line}</li>)}</ul></Card>
    <div className="activity-meta"><span>{record?.completed ? <><CheckCircle2 size={17} /> Completada</> : 'Borrador local'}</span><span>{record?.attempts ?? 0} intentos</span></div>
    <Card className="patrimony-form"><h2>{activity.id === 'sofia-medina' ? 'Clasificá y calculá' : 'Completá el valor faltante'}</h2><div className="patrimony-fields">{activity.fields.map(field => <FieldControl key={field.id} field={field} value={answers[field.id] ?? ''} onChange={value => answer(field.id, value)} result={result} />)}</div>{activity.id !== 'sofia-medina' && <p className="formula-note">ACTIVO = PASIVO + PATRIMONIO NETO</p>}</Card>
    {result && <div className={`activity-feedback ${result.correct ? 'is-correct' : 'has-errors'}`} role="status" aria-live="polite"><strong>{result.correct ? '¡Muy bien! Completaste correctamente el ejercicio.' : `Hay ${result.feedback.length} ${result.feedback.length === 1 ? 'campo para revisar' : 'campos para revisar'}.`}</strong><p>{result.correct ? 'El avance quedó guardado en este dispositivo.' : 'Leé la pista junto a cada respuesta para volver a intentarlo.'}</p></div>}
    {record?.completed && <PdfActions buildModel={() => patrimonyPdfModel(activity, answers, record.attempts)} />}
    <div className="activity-actions"><Button type="button" onClick={check}><SearchCheck size={18} /> COMPROBAR</Button>{result && !result.correct && <Button type="button" className="button-secondary" onClick={retry}><RotateCcw size={18} /> REINTENTAR</Button>}<Link className="button button-quiet" to={activity.theoryPath}><BookOpen size={18} /> VOLVER A LA TEORÍA</Link><Link className="button button-quiet" to="/practicar">VOLVER A PRACTICAMOS</Link></div>
    {result?.correct && next && <Link className="next-activity" to={patrimonyPath(next.id)}>SIGUIENTE EJERCICIO <ArrowRight size={18} /></Link>}
    {storageError && <p className="storage-warning" role="status">El navegador no permite guardar datos locales. El borrador podría perderse al actualizar.</p>}
  </div>;
}
