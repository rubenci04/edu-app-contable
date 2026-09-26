import { useState } from 'react';
import { ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card, PageHeader, ProgressBar } from '../components/ui';
import { newQuiz } from '../data/quizQuestions';
import type { QuizQuestion } from '../data/quizQuestions';
import { useLocalProgress } from '../hooks/useLocalProgress';

export function PlayPage() {
  const { progress, storageError, saveQuizScore } = useLocalProgress();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [stage, setStage] = useState<'intro' | 'playing' | 'finished'>('intro');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [points, setPoints] = useState(0);

  function start() {
    setQuestions(newQuiz());
    setIndex(0);
    setSelected(null);
    setPoints(0);
    setStage('playing');
  }
  function choose(option: string) {
    if (selected !== null) return;
    setSelected(option);
    if (option === questions[index].answer) setPoints(current => current + 1);
  }
  function advance() {
    if (index === 9) { saveQuizScore(points); setStage('finished'); }
    else { setIndex(current => current + 1); setSelected(null); }
  }

  const question = questions[index];
  return <div className="quiz-page"><PageHeader eyebrow="JUGAMOS" title="Poné a prueba lo que sabés." description="Diez preguntas del material de clase. Es un juego de práctica, no una evaluación oficial." />
    {stage === 'intro' && <Card className="quiz-intro"><span className="quiz-hero-icon"><Trophy size={34} /></span><h2>Una partida, diez desafíos</h2><p>Vas a encontrar preguntas de selección múltiple, verdadero o falso, clasificación y cálculos del material. Cada respuesta correcta suma un punto.</p><div className="quiz-scores"><span>Último puntaje: <strong>{progress.quiz.lastScore === null ? '—' : `${progress.quiz.lastScore}/10`}</strong></span><span>Mejor puntaje: <strong>{progress.quiz.bestScore === null ? '—' : `${progress.quiz.bestScore}/10`}</strong></span></div><Button type="button" onClick={start}>EMPEZAR PARTIDA <ArrowRight size={18} /></Button></Card>}
    {stage === 'playing' && question && <>
      <div className="quiz-meta"><strong>Pregunta {index + 1} de 10</strong><span>{points} {points === 1 ? 'punto' : 'puntos'}</span></div>
      <ProgressBar value={(index + 1) * 10} label="Avance de la partida" />
      <Card className="quiz-card"><span className="eyebrow">{question.kind === 'true-false' ? 'VERDADERO O FALSO' : question.kind === 'classification' ? 'ACTIVO O PASIVO' : question.kind === 'calculation' ? 'CÁLCULO' : 'SELECCIÓN MÚLTIPLE'}</span><h2>{question.prompt}</h2><div className="quiz-options">{question.options.map(option => <button type="button" key={option} onClick={() => choose(option)} disabled={selected !== null} className={`quiz-option${selected !== null && option === question.answer ? ' is-answer' : ''}${selected === option && selected !== question.answer ? ' is-wrong' : ''}`} aria-pressed={selected === option}>{option}</button>)}</div>
        {selected !== null && <div className={`quiz-feedback ${selected === question.answer ? 'is-correct' : 'has-errors'}`} role="status" aria-live="polite"><strong>{selected === question.answer ? '¡Correcto! Sumaste un punto.' : `Todavía no. La respuesta es: ${question.answer}.`}</strong><p>{question.explanation}</p><small>Fuente: {question.source}</small></div>}
      </Card>
      {selected !== null && <Button type="button" onClick={advance} className="quiz-advance">{index === 9 ? 'VER RESULTADO' : 'SIGUIENTE PREGUNTA'} <ArrowRight size={18} /></Button>}
    </>}
    {stage === 'finished' && <Card className="quiz-final"><Trophy size={45} /><span className="eyebrow">PARTIDA TERMINADA</span><h2>{points} de 10 puntos</h2><p>Seguí practicando a tu ritmo. Este resultado no es una evaluación oficial.</p><div className="quiz-scores"><span>Último puntaje: <strong>{progress.quiz.lastScore}/10</strong></span><span>Mejor puntaje: <strong>{progress.quiz.bestScore}/10</strong></span></div><div className="quiz-end-actions"><Button type="button" onClick={start}><RotateCcw size={18} /> JUGAR DE NUEVO</Button><Link className="button button-quiet" to="/progreso">VER MI PROGRESO</Link></div></Card>}
    {storageError && <p className="storage-warning" role="status">El navegador no permite guardar el puntaje localmente.</p>}
  </div>;
}
