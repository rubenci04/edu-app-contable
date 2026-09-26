import { ArrowLeft, ArrowRight, BookOpen, Lightbulb, PencilLine } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Card, PageHeader } from '../components/ui';
import { getLesson, invoiceComparison, lessonGroups, lessonPath, lessons, theorySource } from '../data/lessons';
import type { LessonBlock } from '../data/lessonTypes';

function BlockContent({ block }: { block: LessonBlock }) {
  return <>
    {block.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
    {block.items && <ul>{block.items.map(item => <li key={item}>{item}</li>)}</ul>}
  </>;
}

export function LearnPage() {
  return <>
    <PageHeader eyebrow="APRENDEMOS" title="Un lugar para entender." description="Elegí un tema para consultar la teoría y los ejemplos del material de clase." />
    {lessonGroups.map((group, groupIndex) => {
      const groupLessons = lessons.filter(lesson => lesson.group === group.id);
      return <section className="lesson-group" key={group.id} aria-labelledby={`group-${group.id}`}>
        <div className="section-heading compact"><div><span className="eyebrow">GRUPO 0{groupIndex + 1} · {groupLessons.length} TEMAS</span><h2 id={`group-${group.id}`}>{group.title}</h2><p className="group-description">{group.description}</p></div></div>
        <div className="topic-grid">{groupLessons.map((lesson, index) =>
          <Link className="lesson-topic-link" key={lesson.id} to={lessonPath(lesson.id)}>
            <Card className="topic-card"><span className="topic-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{lesson.title}</h3><p>{lesson.summary}</p><span className="lesson-read">Leer tema <ArrowRight size={15} aria-hidden="true" /></span></div></Card>
          </Link>)}</div>
      </section>;
    })}
    <p className="source-note">Teoría basada en el material de clase «Teoría: documentos comerciales y patrimonio».</p>
  </>;
}

export function LessonPage() {
  const { lessonId } = useParams();
  const lesson = getLesson(lessonId);
  if (!lesson) return <Card className="empty-state"><BookOpen size={40} /><h1>No encontramos este tema</h1><p>Elegí una lección del listado de Aprendemos.</p><Link className="button" to="/aprender">Volver a los temas <ArrowRight size={18} /></Link></Card>;

  const group = lessonGroups.find(item => item.id === lesson.group)!;
  const siblings = lessons.filter(item => item.group === lesson.group);
  const index = siblings.findIndex(item => item.id === lesson.id);
  const previous = siblings[index - 1];
  const next = siblings[index + 1];

  return <article className="lesson-page">
    <PageHeader eyebrow={`${group.title} · TEMA ${index + 1} DE ${siblings.length}`} title={lesson.title} description={lesson.summary} />
    <Card className="lesson-block lesson-concept"><h2>¿Qué es?</h2><p>{lesson.concept}</p></Card>
    {lesson.purpose && <Card className="lesson-block"><h2>¿Para qué sirve?</h2><BlockContent block={{ title: 'Funciones', items: lesson.purpose }} /></Card>}
    {lesson.explanation?.map(block => <Card className="lesson-block" key={block.title}><h2>{block.title}</h2><BlockContent block={block} /></Card>)}
    <aside className="lesson-remember" aria-labelledby="remember-title"><Lightbulb size={24} aria-hidden="true" /><div><h2 id="remember-title">Para recordar</h2><p>{lesson.remember}</p></div></aside>
    {lesson.formulas && <Card className="lesson-block"><h2>Fórmulas derivadas</h2><ul className="lesson-formulas">{lesson.formulas.map(formula => <li key={formula}>{formula}</li>)}</ul></Card>}
    {lesson.example && <Card className="lesson-block lesson-example"><span className="eyebrow">EJEMPLO</span><h2>{lesson.example.title}</h2><BlockContent block={lesson.example} /><p className="lesson-citation">Fuente: {lesson.example.source}.</p></Card>}
    {lesson.comparison === 'invoices' && <section className="lesson-comparison" aria-labelledby="comparison-title"><h2 id="comparison-title">Compará las facturas A, B y C</h2><p>Quién las emite, a quiénes se destinan y cómo presentan el IVA, según el material de clase.</p><div className="invoice-grid">{invoiceComparison.map(invoice => <Card className="invoice-card" key={invoice.lessonId}><h3>{invoice.title}</h3><dl><dt>Quién lo emite</dt><dd>{invoice.issuer}</dd><dt>Destinatario habitual</dt><dd>{invoice.recipient}</dd><dt>IVA</dt><dd>{invoice.vat}</dd></dl><Link to={lessonPath(invoice.lessonId)}>Leer {invoice.title} <ArrowRight size={16} aria-hidden="true" /></Link></Card>)}</div></section>}
    <section className="lesson-relations" aria-labelledby="related-title"><h2 id="related-title">Relacioná los conceptos</h2><div>{lesson.related.map(id => {
      const related = getLesson(id)!;
      return <Link key={id} to={lessonPath(id)}>{related.title}<ArrowRight size={15} aria-hidden="true" /></Link>;
    })}</div></section>
    <p className="source-note">Fuente de teoría: {theorySource} · {lesson.sourceSection}.</p>
    <div className="lesson-practice"><Link className="button" to={lesson.practicePath}><PencilLine size={18} aria-hidden="true" /> PRACTICAR ESTE TEMA</Link>{lesson.practicePath === '/practicar' && <p>Las actividades interactivas de este tema estarán disponibles próximamente.</p>}</div>
    <nav className="lesson-pagination" aria-label="Recorrido de lecciones">
      {previous && <Link to={lessonPath(previous.id)}><ArrowLeft size={16} aria-hidden="true" /><span><small>TEMA ANTERIOR</small>{previous.title}</span></Link>}
      {next && <Link className="lesson-next" to={lessonPath(next.id)}><span><small>SIGUIENTE TEMA</small>{next.title}</span><ArrowRight size={16} aria-hidden="true" /></Link>}
    </nav>
  </article>;
}
