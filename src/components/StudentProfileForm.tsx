import { useState, type FormEvent } from 'react';
import { GraduationCap } from 'lucide-react';
import { Button, Card } from './ui';
import type { StudentProfile } from '../hooks/useLocalStudent';

export function StudentProfileForm({ profile, onSave, onCancel }: {
  profile?: StudentProfile;
  onSave: (profile: StudentProfile) => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(profile?.name ?? '');
  const [age, setAge] = useState(profile ? String(profile.age) : '');
  const [course, setCourse] = useState(profile?.course ?? '');
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanCourse = course.trim();
    const numericAge = Number(age);
    if (!cleanName || !cleanCourse) { setError('Completá tu nombre y curso para continuar.'); return; }
    if (!Number.isInteger(numericAge) || numericAge < 10 || numericAge > 99) { setError('Ingresá una edad entre 10 y 99 años.'); return; }
    setError('');
    onSave({ name: cleanName, age: numericAge, course: cleanCourse });
  }

  return <form onSubmit={submit} className="student-form" noValidate>
    <div className="student-fields">
      <label>Nombre<input autoComplete="given-name" autoFocus={!profile} maxLength={60} value={name} onChange={event => setName(event.target.value)} required /></label>
      <label>Edad<input type="number" inputMode="numeric" min={10} max={99} value={age} onChange={event => setAge(event.target.value)} required /></label>
      <label>Curso<input autoComplete="off" maxLength={60} value={course} onChange={event => setCourse(event.target.value)} required placeholder="Ej.: 4.º año" /></label>
    </div>
    {error && <p className="student-error" role="alert">{error}</p>}
    <p className="student-privacy">Estos datos se guardan únicamente en este dispositivo.</p>
    <div className="student-actions"><Button type="submit">{profile ? 'GUARDAR CAMBIOS' : 'COMENZAR'}</Button>{onCancel && <Button type="button" className="button-quiet" onClick={onCancel}>CANCELAR</Button>}</div>
  </form>;
}

export function WelcomeScreen({ onSave, storageError }: { onSave: (profile: StudentProfile) => void; storageError: boolean }) {
  return <div className="welcome-screen"><Card className="welcome-card"><span className="welcome-icon"><GraduationCap size={29} /></span><span className="eyebrow">TU ESPACIO DE APRENDIZAJE</span><h1>¡Bienvenido/a a Edu App Contable!</h1><p>Contanos cómo querés que te llamemos para empezar.</p><StudentProfileForm onSave={onSave} />{storageError && <p className="storage-warning" role="status">El navegador no permite guardar datos locales. El perfil no persistirá al cerrar.</p>}</Card></div>;
}
