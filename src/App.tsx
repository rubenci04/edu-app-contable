import { useEffect, useRef } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Compass, FileText, GraduationCap, Home, Leaf, LockKeyhole, Sparkles, Sprout, Trophy } from 'lucide-react';
import { Button, Card, PageHeader, ProgressBar } from './components/ui';
import { sections } from './data/sections';
import { useLocalProgress } from './hooks/useLocalProgress';
import { getLesson } from './data/lessons';
import { LearnPage, LessonPage } from './pages/LearnPages';

const activities = ['Orden de compra', 'Remito', 'Factura A', 'Factura B', 'Factura C', 'Nota de débito', 'Nota de crédito', 'Recibo', 'Pagaré', 'Cheque'];

function HomePage() {
  const cardsRef = useRef<HTMLElement>(null);
  return <>
    <section className="hero">
      <div className="hero-copy">
        <span className="hero-label"><span /> TU ESPACIO DE APRENDIZAJE</span>
        <h1>La contabilidad,<br />paso a <span>paso.</span></h1>
        <p>Aprendé, practicá y poné a prueba lo que sabés.<br className="desktop-break" /> A tu ritmo, desde donde estés.</p>
        <Button onClick={() => cardsRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })}>Explorá tu espacio <ArrowDown size={18} /></Button>
        <div className="hero-footnote"><Check size={15} /> Documentos comerciales y patrimonio</div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="art-orbit" />
        <div className="art-spark"><Sparkles size={26} /></div>
        <div className="art-note"><span className="note-badge"><BookOpen size={20} /></span><span className="note-title">Un paso a la vez</span><span className="note-line" /><span className="note-line short" /><div className="note-grid"><span /><span /><span /><span /></div><div className="note-check"><Check size={15} /> Aprender es avanzar</div></div>
        <div className="art-calculator"><span className="calc-display">123</span><div className="calc-keys">{Array.from({ length: 12 }, (_, i) => <span key={i} className={i === 11 ? 'last-key' : ''}>{i === 11 ? '=' : ''}</span>)}</div></div>
        <div className="art-leaf"><Sprout size={37} /></div>
        <span className="art-dot one" /><span className="art-dot two" />
      </div>
    </section>
    <section ref={cardsRef} className="choices" aria-labelledby="choices-heading">
      <div className="section-heading"><div><span className="eyebrow">ELEGÍ TU PRÓXIMO PASO</span><h2 id="choices-heading">¿Qué querés hacer hoy?</h2></div><span className="section-aside">Tu recorrido empieza acá <Compass size={18} /></span></div>
      <div className="choice-grid">{sections.map(({ path, title, description, icon: Icon, color, tag, detail }, i) =>
        <Link to={path} key={path} className={`choice-link ${color}`}>
          <Card className="choice-card"><div className="choice-top"><span className="choice-icon"><Icon size={26} strokeWidth={1.7} /></span><span className="choice-number">0{i + 1}</span></div><span className="choice-tag">{tag}</span><h3>{title}</h3><p>{description}</p><div className="choice-bottom"><span>{detail}</span><span className="choice-arrow"><ArrowRight size={19} /></span></div></Card>
        </Link>)}</div>
    </section>
    <Card className="small-note"><span className="small-note-icon"><Leaf size={22} /></span><div><h3>Cada paso cuenta.</h3><p>No hace falta saberlo todo para empezar. Este es tu espacio para aprender.</p></div><span className="note-signature">A TU RITMO</span></Card>
  </>;
}

function PendingNotice({ text }: { text: string }) {
  return <div className="pending-notice"><Sparkles size={20} /><div><strong>Estamos preparando este espacio</strong><p>{text}</p></div></div>;
}

function PracticePage() {
  return <><PageHeader eyebrow="PRACTICAMOS" title="De la lectura a la práctica." description="Un espacio para completar documentos y resolver las situaciones del material de clase." />
    <PendingNotice text="Las actividades interactivas todavía no están habilitadas. Este es el recorrido que estamos preparando." />
    <div className="section-heading compact"><h2>Documentos comerciales</h2><span className="muted">10 actividades</span></div>
    <Card className="activity-list">{activities.map((title, i) => <div className="activity-row" key={title}><span className="activity-number">{String(i + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>Actividad del material de clase</p></div><span className="status-pill"><LockKeyhole size={12} /> Próximamente</span></div>)}</Card>
    <div className="section-heading compact"><h2>Patrimonio</h2></div><Card className="topic-card"><span className="choice-icon practice"><FileText size={24} /></span><div><h3>Ecuación patrimonial y clasificación</h3><p>Valores desconocidos y patrimonio de Sofía Medina.</p><span className="status-pill">Próximamente</span></div></Card>
    <p className="source-note">Actividades de «Documentos comerciales» y «Teoría: documentos comerciales y patrimonio».</p>
  </>;
}

function PlayPage() {
  return <><PageHeader eyebrow="JUGAMOS" title="Tu próximo desafío." description="Un espacio para poner a prueba tus conocimientos sobre los temas de clase." />
    <Card className="empty-state"><span className="empty-icon play"><Trophy size={40} strokeWidth={1.5} /></span><span className="status-pill">Próximamente</span><h2>El juego se está preparando</h2><p>En una próxima etapa podrás responder preguntas sobre documentos comerciales y patrimonio. Todavía no hay partidas ni puntajes disponibles.</p><Link className="button" to="/aprender">Explorá los temas <ArrowRight size={18} /></Link></Card>
  </>;
}

function ProgressPage() {
  const { storageError } = useLocalProgress();
  return <><PageHeader eyebrow="MI PROGRESO" title="Cada avance, en un lugar." description="Acá podrás consultar tu recorrido y las actividades que completes." />
    <div className="stats-grid"><Card className="stat-card"><BookOpen size={23} /><span>Temas completados</span><strong>—</strong><p>Los temas ya se pueden leer. El registro de lectura todavía no está habilitado.</p></Card><Card className="stat-card"><FileText size={23} /><span>Actividades completadas</span><strong>0</strong><p>Las actividades estarán disponibles próximamente.</p></Card><Card className="stat-card"><Trophy size={23} /><span>Mejor puntaje</span><strong>—</strong><p>Todavía no hay partidas registradas.</p></Card></div>
    <Card className="progress-card"><div className="section-heading compact"><h2>Tu recorrido</h2><span className="status-pill">Por empezar</span></div><div className="progress-label"><span>Actividades completadas</span><strong>0 %</strong></div><ProgressBar value={0} label="Progreso de actividades" /><p>El progreso comenzará a registrarse cuando se habiliten las actividades.</p></Card>
    <div className="pending-notice"><Sprout size={22} /><div><strong>Este es tu punto de partida</strong><p>{storageError ? 'El navegador no permite guardar datos locales. El progreso no podrá conservarse en este dispositivo.' : 'Tus avances se guardarán en este navegador y dispositivo. Si borrás los datos del sitio, se perderán.'}</p></div></div>
  </>;
}

function NotFoundPage() {
  return <Card className="empty-state"><Compass size={42} /><h1>No encontramos esta página</h1><p>Volvé al inicio para elegir tu próximo paso.</p><Link to="/" className="button">Volver al inicio <ArrowRight size={18} /></Link></Card>;
}

export function App() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const initialPath = useRef(location.pathname);
  const isLessonRoute = /^\/aprender\/[^/]+\/?$/.test(location.pathname);
  const currentLesson = isLessonRoute ? getLesson(location.pathname.split('/')[2]) : undefined;
  useLocalProgress();
  useEffect(() => {
    const section = sections.find(item => item.path === location.pathname);
    document.title = `${currentLesson?.title ?? section?.nav ?? (location.pathname === '/' ? 'Inicio' : 'Página no encontrada')} · Edu App Contable`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (initialPath.current !== location.pathname) mainRef.current?.focus({ preventScroll: true });
    initialPath.current = location.pathname;
  }, [location.pathname, currentLesson]);
  return <div className="app-shell">
    <a href="#main" className="skip-link">Saltar al contenido</a>
    <header className="site-header"><div className="header-inner"><Link className="brand" to="/" aria-label="Edu App Contable, inicio"><span className="brand-mark"><GraduationCap size={24} /></span><span>Edu App <strong>Contable</strong><small>APRENDER PARA AVANZAR</small></span></Link><nav aria-label="Navegación principal" className="desktop-nav"><NavLink to="/" end><Home size={17} /> Inicio</NavLink>{sections.map(({ path, nav, icon: Icon }) => <NavLink key={path} to={path}><Icon size={17} />{nav}</NavLink>)}</nav><span className="header-badge"><span /> Tu aula, a mano</span></div></header>
    <main id="main" ref={mainRef} tabIndex={-1} className="main-container">
      <div className="breadcrumb"><Link to="/">Inicio</Link>{isLessonRoute ? <><ChevronRight size={14} /><Link to="/aprender">Aprender</Link><ChevronRight size={14} /><span aria-current="page">{currentLesson?.title ?? 'Tema no encontrado'}</span></> : location.pathname !== '/' ? <><ChevronRight size={14} /><span>{sections.find(item => item.path === location.pathname)?.nav ?? 'Página no encontrada'}</span></> : <><ChevronRight size={14} /><span>Tu espacio</span></>}</div>
      {location.pathname !== '/' && <Link to={isLessonRoute ? '/aprender' : '/'} className="back-link"><ArrowLeft size={16} />{isLessonRoute ? 'Volver a los temas' : 'Volver al inicio'}</Link>}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/aprender" element={<LearnPage />} />
        <Route path="/aprender/:lessonId" element={<LessonPage />} />
        <Route path="/practicar" element={<PracticePage />} />
        <Route path="/jugar" element={<PlayPage />} />
        <Route path="/progreso" element={<ProgressPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
    <footer className="site-footer"><span><GraduationCap size={17} /> Edu App Contable</span><p>Un espacio para aprender, a tu ritmo.</p><span className="footer-version">Prototipo local · v0.1</span></footer>
    <nav aria-label="Navegación móvil" className="mobile-nav"><NavLink to="/" end><Home size={21} /><span>Inicio</span></NavLink>{sections.map(({ path, nav, icon: Icon }) => <NavLink key={path} to={path}><Icon size={21} /><span>{nav}</span></NavLink>)}</nav>
  </div>;
}
