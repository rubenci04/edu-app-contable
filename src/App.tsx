import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Compass, FileText, GraduationCap, Heart, Home, Info, Leaf, Menu, RotateCcw, Sparkles, Sprout, Trophy, X } from 'lucide-react';
import { Button, Card, PageHeader, ProgressBar } from './components/ui';
import { sections } from './data/sections';
import { useLocalProgress } from './hooks/useLocalProgress';
import { getLesson } from './data/lessons';
import { LearnPage, LessonPage } from './pages/LearnPages';
import { getActivity } from './data/activities';
import { ActivityPage, PracticePage } from './pages/PracticePages';
import { patrimonyActivities, getPatrimonyActivity, patrimonyPath } from './data/patrimonyActivities';
import { PatrimonyPage } from './pages/PatrimonyPage';
import { PlayPage } from './pages/PlayPage';
import { activities } from './data/activities';
import { StudentProfileForm, WelcomeScreen } from './components/StudentProfileForm';
import { useLocalStudent, type StudentProfile } from './hooks/useLocalStudent';

const menuLinks = [
  { to: '/', label: 'Inicio', icon: Home },
  ...sections.map(({ path, nav, icon }) => ({ to: path, label: nav, icon })),
  { to: '/acerca-de', label: 'Acerca de', icon: Info },
  { to: '/nuestra-historia', label: 'Nuestra historia', icon: Heart },
];

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); } };
    const onPointer = (event: MouseEvent) => { if (!wrapRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onPointer); };
  }, [open]);
  return <div className="mobile-menu" ref={wrapRef} onBlur={event => { if (open && !wrapRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
    <button type="button" ref={buttonRef} className="menu-button" aria-expanded={open} aria-controls="site-menu" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen(value => !value)}>{open ? <X size={21} /> : <Menu size={21} />}<span className="menu-label">Menú</span></button>
    {open && <nav id="site-menu" className="menu-panel" aria-label="Menú principal">{menuLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'}><Icon size={19} />{label}</NavLink>)}</nav>}
  </div>;
}

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

function ProgressPage({ profile, saveProfile, profileStorageError }: { profile: StudentProfile; saveProfile: (profile: StudentProfile) => void; profileStorageError: boolean }) {
  const { progress, storageError, resetProgress } = useLocalProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const completedDocuments = activities.filter(activity => progress.activities[activity.id]?.completed);
  const completedPatrimony = patrimonyActivities.filter(activity => progress.activities[activity.id]?.completed);
  const completed = completedDocuments.length + completedPatrimony.length;
  const total = activities.length + patrimonyActivities.length;
  const percent = Math.round(completed / total * 100);
  const started = [...activities, ...patrimonyActivities].some(activity => progress.activities[activity.id]?.started);
  return <><PageHeader eyebrow="MI PROGRESO" title="Cada avance, en un lugar." description="Acá podrás consultar tu recorrido y las actividades que completes." />
    <Card className="student-profile-card"><div className="student-profile-heading"><div><span className="eyebrow">PERFIL LOCAL</span><h2>Tus datos</h2></div>{!editingProfile && <Button type="button" className="button-quiet" onClick={() => setEditingProfile(true)}>EDITAR DATOS</Button>}</div>
      {editingProfile ? <StudentProfileForm profile={profile} onSave={next => { saveProfile(next); setEditingProfile(false); }} onCancel={() => setEditingProfile(false)} /> : <dl className="student-profile-details"><div><dt>Nombre</dt><dd>{profile.name}</dd></div><div><dt>Edad</dt><dd>{profile.age} años</dd></div><div><dt>Curso</dt><dd>{profile.course}</dd></div></dl>}
      {profileStorageError && <p className="storage-warning" role="status">El navegador no permite guardar el perfil localmente.</p>}
    </Card>
    <div className="stats-grid"><Card className="stat-card"><FileText size={23} /><span>Documentos completados</span><strong>{completedDocuments.length}/{activities.length}</strong><p>{completedDocuments.length ? completedDocuments.map(item => item.title).join(' · ') : 'Todavía no completaste documentos.'}</p></Card><Card className="stat-card"><BookOpen size={23} /><span>Patrimonio completado</span><strong>{completedPatrimony.length}/{patrimonyActivities.length}</strong><p>{completedPatrimony.length ? completedPatrimony.map(item => item.title).join(' · ') : 'Todavía no completaste ejercicios de patrimonio.'}</p></Card><Card className="stat-card"><Trophy size={23} /><span>Mejor puntaje del juego</span><strong>{progress.quiz.bestScore === null ? '—' : `${progress.quiz.bestScore}/10`}</strong><p>Último puntaje: {progress.quiz.lastScore === null ? '—' : `${progress.quiz.lastScore}/10`}. No es una evaluación oficial.</p></Card></div>
    <Card className="progress-card"><div className="section-heading compact"><h2>Tu recorrido</h2><span className="status-pill">{started ? 'En curso' : 'Por empezar'}</span></div><div className="progress-label"><span>Progreso general · {completed} de {total} actividades</span><strong>{percent} %</strong></div><ProgressBar value={percent} label="Progreso general de actividades" /><p>El porcentaje incluye las {activities.length} prácticas de documentos y los {patrimonyActivities.length} ejercicios de patrimonio. Las actividades con datos pendientes de indicación docente permanecen en revisión y no se marcan como completadas.</p></Card>
    <Card className="progress-list"><h2>Ejercicios de patrimonio</h2><div>{patrimonyActivities.map(activity => <Link to={patrimonyPath(activity.id)} key={activity.id}><span>{activity.title}</span><strong>{progress.activities[activity.id]?.completed ? 'Completada' : progress.activities[activity.id]?.started ? 'En curso' : 'Por empezar'}</strong></Link>)}</div></Card>
    <div className="pending-notice"><Sprout size={22} /><div><strong>Tus datos quedan en este dispositivo</strong><p>{storageError ? 'El navegador no permite guardar datos locales. El progreso no podrá conservarse.' : 'Los borradores, avances y puntajes se guardan solo en este navegador.'}</p></div></div>
    <div className="reset-area">{confirmReset ? <Card className="reset-confirm" role="group" aria-label="Confirmar reinicio de progreso"><h2>¿Reiniciar todo el progreso?</h2><p>Se borrarán borradores, actividades completadas, intentos y puntajes guardados en este navegador. Tu nombre, edad y curso se conservarán.</p><div><Button type="button" className="button-quiet" onClick={() => setConfirmReset(false)}>CANCELAR</Button><Button type="button" className="button-danger" onClick={() => { resetProgress(); setConfirmReset(false); }}>SÍ, REINICIAR PROGRESO</Button></div></Card> : <Button type="button" className="button-quiet" onClick={() => setConfirmReset(true)}><RotateCcw size={18} /> Reiniciar progreso</Button>}</div>
  </>;
}

function NotFoundPage() {
  return <Card className="empty-state"><Compass size={42} /><h1>No encontramos esta página</h1><p>Volvé al inicio para elegir tu próximo paso.</p><Link to="/" className="button">Volver al inicio <ArrowRight size={18} /></Link></Card>;
}

function AboutPage() {
  return <><PageHeader eyebrow="ACERCA DE" title="Acerca de Edu App Contable" description="Edu App Contable es una aplicación educativa para aprender, practicar y reforzar contenidos contables mediante teoría, actividades interactivas y juegos." /><Card className="about-card"><BookOpen size={27} aria-hidden="true" /><p>Este prototipo tiene fines educativos.</p><Link to="/" className="button button-quiet">Volver al inicio <ArrowRight size={18} /></Link></Card></>;
}

function StoryPage() {
  return <article className="story-page">
    <div className="page-header"><span className="eyebrow">NUESTRA HISTORIA</span><h1>Nuestra historia</h1></div>
    <Card className="story-card">
      <img className="story-photo" src="/profesora.jpg" alt="Profesora Fabiola Soledad Costilla" width="220" height="220" />
      <div className="story-text">
        <p>Mi nombre es Fabiola Soledad Costilla. Soy Profesora de Economía, Licenciada en Tecnología Educativa, cuento con un Posgrado en Educación y Nuevas Tecnologías y actualmente me encuentro finalizando la Maestría en Tecnología Educativa en la Universidad Abierta Interamericana (UAI).</p>
        <p>A lo largo de mi trayectoria docente he buscado integrar los contenidos propios de Economía y Contabilidad con herramientas tecnológicas que permitan generar experiencias de aprendizaje más dinámicas, accesibles y significativas para los estudiantes.</p>
        <h2>¿Por qué surge la App Contable?</h2>
        <p>La idea de crear esta aplicación surge a partir de la observación de algunas dificultades que presentan los estudiantes al momento de comprender y aplicar ciertos contenidos contables, especialmente los relacionados con documentos comerciales, patrimonio, Activo, Pasivo y Patrimonio Neto.</p>
        <p>Frente a esta necesidad, se pensó en una propuesta que pudiera combinar la explicación teórica con actividades prácticas y recursos interactivos, utilizando la tecnología como un apoyo para complementar la enseñanza en el aula.</p>
        <h2>¿Cómo la utilizan los alumnos?</h2>
        <p>Los estudiantes utilizan la aplicación para consultar contenidos teóricos, resolver actividades prácticas, completar documentos comerciales a partir de distintas situaciones y participar de un juego interactivo con preguntas, retroalimentación y puntaje.</p>
        <p>De esta manera, la App Contable busca que los alumnos puedan aprender, practicar y poner a prueba sus conocimientos de una forma más participativa e interactiva, favoreciendo la relación entre la teoría y la práctica.</p>
      </div>
    </Card>
  </article>;
}

export function App() {
  const location = useLocation();
  const { profile, saveProfile, storageError: profileStorageError } = useLocalStudent();
  const mainRef = useRef<HTMLElement>(null);
  const initialPath = useRef(location.pathname);
  const isLessonRoute = /^\/aprender\/[^/]+\/?$/.test(location.pathname);
  const currentLesson = isLessonRoute ? getLesson(location.pathname.split('/')[2]) : undefined;
  const isActivityRoute = /^\/practicar\/[^/]+\/?$/.test(location.pathname);
  const currentActivity = isActivityRoute ? getActivity(location.pathname.split('/')[2]) : undefined;
  const isPatrimonyRoute = /^\/practicar\/patrimonio\/[^/]+\/?$/.test(location.pathname);
  const currentPatrimony = isPatrimonyRoute ? getPatrimonyActivity(location.pathname.split('/')[3]) : undefined;
  useEffect(() => {
    const section = sections.find(item => item.path === location.pathname);
    document.title = `${currentLesson?.title ?? currentActivity?.title ?? currentPatrimony?.title ?? section?.nav ?? (location.pathname === '/' ? 'Inicio' : location.pathname === '/acerca-de' ? 'Acerca de' : location.pathname === '/nuestra-historia' ? 'Nuestra historia' : 'Página no encontrada')} · Edu App Contable`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (initialPath.current !== location.pathname) mainRef.current?.focus({ preventScroll: true });
    initialPath.current = location.pathname;
  }, [location.pathname, currentLesson, currentActivity, currentPatrimony]);
  if (!profile) return <WelcomeScreen onSave={saveProfile} storageError={profileStorageError} />;
  return <div className="app-shell">
    <a href="#main" className="skip-link">Saltar al contenido</a>
    <header className="site-header"><div className="header-inner"><Link className="brand" to="/" aria-label="Edu App Contable, inicio"><span className="brand-mark"><GraduationCap size={24} /></span><span>Edu App <strong>Contable</strong><small>APRENDER PARA AVANZAR</small></span></Link><nav aria-label="Navegación principal" className="desktop-nav">{menuLinks.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'}><Icon size={17} />{label}</NavLink>)}</nav><span className="header-badge"><span /> Hola, {profile.name}</span><MobileMenu /></div></header>
    <main id="main" ref={mainRef} tabIndex={-1} className="main-container">
      <div className="breadcrumb"><Link to="/">Inicio</Link>{isLessonRoute ? <><ChevronRight size={14} /><Link to="/aprender">Aprender</Link><ChevronRight size={14} /><span aria-current="page">{currentLesson?.title ?? 'Tema no encontrado'}</span></> : isActivityRoute || isPatrimonyRoute ? <><ChevronRight size={14} /><Link to="/practicar">Practicar</Link><ChevronRight size={14} /><span aria-current="page">{currentActivity?.title ?? currentPatrimony?.title ?? 'Actividad no encontrada'}</span></> : location.pathname !== '/' ? <><ChevronRight size={14} /><span>{location.pathname === '/acerca-de' ? 'Acerca de' : location.pathname === '/nuestra-historia' ? 'Nuestra historia' : sections.find(item => item.path === location.pathname)?.nav ?? 'Página no encontrada'}</span></> : <><ChevronRight size={14} /><span>Tu espacio</span></>}</div>
      {location.pathname !== '/' && <Link to={isLessonRoute ? '/aprender' : isActivityRoute || isPatrimonyRoute ? '/practicar' : '/'} className="back-link"><ArrowLeft size={16} />{isLessonRoute ? 'Volver a los temas' : isActivityRoute || isPatrimonyRoute ? 'Volver a Practicamos' : 'Volver al inicio'}</Link>}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/aprender" element={<LearnPage />} />
        <Route path="/aprender/:lessonId" element={<LessonPage />} />
        <Route path="/practicar" element={<PracticePage />} />
        <Route path="/practicar/:activityId" element={<ActivityPage />} />
        <Route path="/practicar/patrimonio/:exerciseId" element={<PatrimonyPage />} />
        <Route path="/jugar" element={<PlayPage />} />
        <Route path="/progreso" element={<ProgressPage profile={profile} saveProfile={saveProfile} profileStorageError={profileStorageError} />} />
        <Route path="/acerca-de" element={<AboutPage />} />
        <Route path="/nuestra-historia" element={<StoryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
    <footer className="site-footer"><span><GraduationCap size={17} /> Edu App Contable</span><p>Un espacio para aprender, a tu ritmo.</p><Link to="/acerca-de">Acerca de</Link><Link to="/nuestra-historia">Nuestra historia</Link><span className="footer-version">Prototipo local · v0.1</span><small className="footer-credit">Developer: Rubén E. Albarracín</small></footer>
    <nav aria-label="Navegación móvil" className="mobile-nav"><NavLink to="/" end><Home size={21} /><span>Inicio</span></NavLink>{sections.map(({ path, nav, icon: Icon }) => <NavLink key={path} to={path}><Icon size={21} /><span>{nav}</span></NavLink>)}</nav>
  </div>;
}
