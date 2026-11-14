// Datos de arranque: catálogo de ejercicios y rutinas (rutina actual + versiones A y B del plan).
// `inicio` es el punto de partida que dio el usuario: solo alimenta la primera meta de hoy.

export const MUSCULOS = {
  pecho: 'Pecho', espalda: 'Espalda', 'deltoides-anterior': 'Deltoides anterior',
  'deltoides-lateral': 'Deltoides lateral', 'deltoides-posterior': 'Deltoides posterior',
  biceps: 'Bíceps', triceps: 'Tríceps', cuadriceps: 'Cuádriceps', isquiotibiales: 'Isquiotibiales',
  gluteo: 'Glúteo', pantorrilla: 'Pantorrilla', abdomen: 'Abdomen', trapecio: 'Trapecio', antebrazo: 'Antebrazo',
};

export const TIPOS = { barra: 'Barra', mancuerna: 'Mancuerna', maquina: 'Máquina', polea: 'Polea', corporal: 'Peso corporal' };

const ej = (id, nombre, musculo, secundarios, tipo, unidad, compuesto, inicio = null) =>
  ({ id, nombre, musculo, secundarios, tipo, unidad, compuesto, incremento: null, inicio });

export const EJERCICIOS = [
  // Rutina actual
  ej('press-militar', 'Press militar con mancuernas', 'deltoides-anterior', ['triceps', 'deltoides-lateral'], 'mancuerna', 'kg', true, { series: 5, reps: 5, peso: 18 }),
  ej('press-mancuernas-banco', 'Press de mancuernas en banco', 'pecho', ['triceps', 'deltoides-anterior'], 'mancuerna', 'kg', true, { series: 3, reps: 10, peso: 22 }),
  ej('fondos', 'Fondos', 'pecho', ['triceps', 'deltoides-anterior'], 'corporal', 'kg', true, { series: 3, reps: 5, peso: 0 }),
  ej('elevaciones-laterales', 'Elevaciones laterales', 'deltoides-lateral', ['trapecio'], 'mancuerna', 'kg', false),
  ej('extension-triceps-acostado', 'Extensión de tríceps acostado', 'triceps', [], 'mancuerna', 'kg', false),
  ej('jalon-triceps', 'Jalón de tríceps en polea', 'triceps', [], 'polea', 'lb', false),
  ej('dominadas', 'Dominadas', 'espalda', ['biceps', 'deltoides-posterior', 'antebrazo'], 'corporal', 'kg', true, { series: 5, reps: 6, peso: 0 }),
  ej('remo-maquina', 'Remo en máquina', 'espalda', ['biceps', 'deltoides-posterior', 'trapecio'], 'maquina', 'lb', true, { series: 3, reps: 10, peso: 120 }),
  ej('remo-tbar', 'Remo T-bar', 'espalda', ['biceps', 'deltoides-posterior', 'trapecio'], 'barra', 'kg', true, { series: 3, reps: 10, peso: 32.5 }),
  ej('encogimientos', 'Encogimientos con mancuerna', 'trapecio', ['antebrazo'], 'mancuerna', 'kg', false, { series: 3, reps: 10, peso: 28 }),
  ej('curl-predicador', 'Curl predicador', 'biceps', ['antebrazo'], 'barra', 'kg', false, { series: 3, reps: 10, peso: 17.5 }),
  ej('curl-martillo', 'Curl martillo', 'biceps', ['antebrazo'], 'mancuerna', 'kg', false, { series: 3, reps: 11, peso: 10 }),
  ej('sentadilla', 'Sentadilla con barra', 'cuadriceps', ['gluteo'], 'barra', 'kg', true, { series: 5, reps: 5, peso: 60 }),
  ej('rumano', 'Peso muerto rumano', 'isquiotibiales', ['gluteo'], 'barra', 'kg', true, { series: 3, reps: 8, peso: 60 }),
  ej('hack-squat', 'Hack squat', 'cuadriceps', ['gluteo'], 'maquina', 'kg', true, { series: 3, reps: 8, peso: 87.6 }),
  ej('curl-femoral-acostado', 'Curl femoral acostado', 'isquiotibiales', [], 'maquina', 'lb', false, { series: 3, reps: 8, peso: 90 }),
  ej('extension-cuadriceps', 'Extensión de cuádriceps', 'cuadriceps', [], 'maquina', 'lb', false, { series: 3, reps: 8, peso: 100 }),
  ej('pantorrilla-sentado', 'Elevación de pantorrilla sentado', 'pantorrilla', [], 'maquina', 'lb', false),
  // Programa propuesto (plan, sección 5)
  ej('curl-femoral-sentado', 'Curl femoral sentado', 'isquiotibiales', [], 'maquina', 'lb', false),
  ej('pantorrilla-pie', 'Elevación de pantorrilla de pie o en prensa', 'pantorrilla', [], 'maquina', 'lb', false),
  ej('crunch-polea', 'Crunch en polea', 'abdomen', [], 'polea', 'lb', false),
  ej('press-banca', 'Press de banca', 'pecho', ['triceps', 'deltoides-anterior'], 'barra', 'kg', true),
  ej('press-inclinado', 'Press inclinado con mancuernas', 'pecho', ['deltoides-anterior', 'triceps'], 'mancuerna', 'kg', true),
  ej('extension-triceps-cabeza', 'Extensión de tríceps sobre la cabeza en polea', 'triceps', [], 'polea', 'lb', false),
  ej('curl-inclinado', 'Curl inclinado con mancuernas', 'biceps', ['antebrazo'], 'mancuerna', 'kg', false),
  ej('hiperextension', 'Hiperextensión 45° o hip thrust', 'gluteo', ['isquiotibiales'], 'barra', 'kg', true),
  ej('elevacion-piernas', 'Elevación de piernas colgado', 'abdomen', [], 'corporal', 'kg', false),
  ej('jalon-pecho', 'Jalón al pecho (agarre neutro)', 'espalda', ['biceps', 'deltoides-posterior'], 'polea', 'lb', true),
  ej('remo-polea', 'Remo en polea sentado', 'espalda', ['biceps', 'deltoides-posterior', 'trapecio'], 'polea', 'lb', true),
  ej('pajaros-maquina', 'Pájaros en máquina o face pull', 'deltoides-posterior', ['trapecio'], 'maquina', 'lb', false),
  ej('laterales-polea', 'Elevaciones laterales en polea', 'deltoides-lateral', ['trapecio'], 'polea', 'lb', false),
];

// [ejercicioId, series, min, max, descanso en segundos]
const dia = (id, nombre, diaSemana, filas) => ({
  id, nombre, diaSemana,
  ejercicios: filas.map(([ejercicioId, series, min, max, descanso]) => ({ ejercicioId, series, min, max, descanso })),
});

export const RUTINAS = [
  {
    id: 'actual', nombre: 'Rutina actual (Push/Pull/Legs)',
    dias: [
      dia('push', 'Lunes · Push', 1, [
        ['press-militar', 5, 5, 8, 180], ['press-mancuernas-banco', 3, 8, 12, 120], ['fondos', 3, 6, 12, 120],
        ['elevaciones-laterales', 3, 8, 12, 90], ['extension-triceps-acostado', 3, 8, 12, 90], ['jalon-triceps', 3, 8, 12, 90],
      ]),
      dia('pull', 'Martes · Pull', 2, [
        ['dominadas', 5, 5, 8, 180], ['remo-maquina', 3, 8, 12, 120], ['remo-tbar', 3, 8, 12, 120],
        ['encogimientos', 3, 8, 12, 90], ['curl-predicador', 3, 8, 12, 90], ['curl-martillo', 3, 8, 12, 90],
      ]),
      dia('legs', 'Jueves · Legs', 4, [
        ['sentadilla', 5, 5, 8, 180], ['rumano', 3, 8, 12, 150], ['hack-squat', 3, 8, 12, 150],
        ['curl-femoral-acostado', 3, 8, 12, 90], ['extension-cuadriceps', 3, 8, 12, 90], ['pantorrilla-sentado', 3, 8, 12, 90],
      ]),
    ],
  },
  {
    id: 'plan-a', nombre: 'Plan versión A (4 días)',
    dias: [
      dia('a-pierna-a', 'Lunes · Pierna A', 1, [
        ['sentadilla', 3, 5, 8, 180], ['rumano', 3, 6, 10, 150], ['extension-cuadriceps', 3, 10, 15, 90],
        ['curl-femoral-sentado', 3, 8, 12, 90], ['pantorrilla-pie', 3, 8, 12, 90], ['crunch-polea', 3, 10, 15, 75],
      ]),
      dia('a-torso-a', 'Martes · Torso A', 2, [
        ['press-banca', 3, 6, 10, 150], ['dominadas', 3, 6, 10, 150], ['press-inclinado', 3, 8, 12, 120],
        ['remo-maquina', 3, 8, 12, 120], ['elevaciones-laterales', 3, 10, 20, 75], ['extension-triceps-cabeza', 3, 10, 15, 90],
        ['curl-inclinado', 2, 8, 12, 90],
      ]),
      dia('a-pierna-b', 'Jueves · Pierna B', 4, [
        ['hack-squat', 3, 8, 12, 150], ['curl-femoral-acostado', 3, 10, 15, 90], ['hiperextension', 3, 8, 12, 120],
        ['extension-cuadriceps', 2, 12, 15, 90], ['pantorrilla-sentado', 3, 10, 15, 75], ['elevacion-piernas', 3, 8, 15, 75],
      ]),
      dia('a-torso-b', 'Viernes · Torso B', 5, [
        ['press-militar', 3, 6, 10, 150], ['jalon-pecho', 3, 8, 12, 120], ['fondos', 3, 6, 12, 120],
        ['remo-polea', 3, 8, 12, 120], ['pajaros-maquina', 3, 12, 20, 75], ['laterales-polea', 3, 12, 20, 75],
        ['curl-predicador', 2, 8, 12, 90], ['extension-triceps-acostado', 2, 8, 12, 90],
      ]),
    ],
  },
  {
    id: 'plan-b', nombre: 'Plan versión B (3 días)',
    dias: [
      dia('b-completo-a', 'Lunes · Cuerpo completo A', 1, [
        ['sentadilla', 3, 5, 8, 180], ['press-banca', 3, 6, 10, 150], ['curl-femoral-sentado', 3, 8, 12, 90],
        ['jalon-pecho', 3, 8, 12, 120], ['elevaciones-laterales', 3, 10, 20, 75], ['extension-triceps-cabeza', 2, 10, 15, 90],
        ['pantorrilla-pie', 3, 8, 12, 90],
      ]),
      dia('b-torso', 'Martes · Torso', 2, [
        ['dominadas', 3, 6, 10, 150], ['press-militar', 3, 6, 10, 150], ['remo-maquina', 3, 8, 12, 120],
        ['press-inclinado', 3, 8, 12, 120], ['pajaros-maquina', 3, 12, 20, 75], ['curl-predicador', 3, 8, 12, 90],
        ['crunch-polea', 3, 10, 15, 75],
      ]),
      dia('b-completo-b', 'Jueves · Cuerpo completo B', 4, [
        ['rumano', 3, 6, 10, 150], ['hack-squat', 3, 8, 12, 150], ['extension-cuadriceps', 2, 10, 15, 90],
        ['remo-maquina', 3, 8, 12, 120], ['fondos', 3, 6, 12, 120], ['curl-martillo', 2, 8, 12, 90],
        ['elevaciones-laterales', 2, 12, 20, 75], ['pantorrilla-sentado', 2, 10, 15, 75], ['elevacion-piernas', 2, 8, 15, 75],
      ]),
    ],
  },
];
