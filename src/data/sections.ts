import { BookOpen, PencilLine, Gamepad2, ChartNoAxesCombined } from 'lucide-react';

export const sections = [
  { path: '/aprender', title: 'APRENDEMOS', nav: 'Aprender', description: 'Consultá teoría y ejemplos.', icon: BookOpen, color: 'learn', tag: 'EXPLORÁ', detail: 'Los contenidos de clase, en un solo lugar.' },
  { path: '/practicar', title: 'PRACTICAMOS', nav: 'Practicar', description: 'Completá documentos y resolvé ejercicios.', icon: PencilLine, color: 'practice', tag: 'PASÁ A LA ACCIÓN', detail: 'Un espacio para aplicar lo que aprendés.' },
  { path: '/jugar', title: 'JUGAMOS', nav: 'Jugar', description: 'Poné a prueba tus conocimientos.', icon: Gamepad2, color: 'play', tag: 'DESAFIATE', detail: 'Aprender también puede ser un desafío.' },
  { path: '/progreso', title: 'MI PROGRESO', nav: 'Progreso', description: 'Consultá tus avances.', icon: ChartNoAxesCombined, color: 'progress', tag: 'SEGUÍ TU CAMINO', detail: 'Cada paso que das, cuenta.' },
] as const;
