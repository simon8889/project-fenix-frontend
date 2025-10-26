import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Trophy, X, Check, Heart, Sparkles, Target, Zap } from 'lucide-react';
import { completarJuego } from '../utils/api';
import toast from 'react-hot-toast';


const PREGUNTAS = [
  {
    id: 1,
    pregunta: "¿Dónde fue nuestra primera cita?",
    opciones: ["La pista", "¿Jamundí?", "Viva Envigado", "No sabe / no contesta"],
    correcta: 2
  },
  {
    id: 2,
    pregunta: "¿Qué canción te he dedicado?",
    opciones: ["Ella es mi bitch XD", "Stereo Hearts", "La gallina turuleca", "Santa"],
    correcta: 3
  },
  {
    id: 3,
    pregunta: "¿Cuál es tu comida favorita que yo sé preparar?",
    opciones: ["Mondongo", "Vuelve conmigo porfavaaar", "Tacos", "Sushi"],
    correcta: 3
  },
  {
    id: 4,
    pregunta: "¿Cuál fue nuestro primer viaje solos?",
    opciones: ["Marte", "Guatapé", "Envigado", "Sopetrán"],
    correcta: 1
  },
  {
    id: 5,
    pregunta: "¿Cuál fue el primer regalo hecho a mano que te di?",
    opciones: [
      "100 razones por las que te amo",
      "100 razones por las que eres mi hater",
      "Manilla",
      "Una patada"
    ],
    correcta: 0
  },
  {
    id: 6,
    pregunta: "¿Cuál fue mi primera mascota?",
    opciones: [
      "Morgan",
      "Plutón",
      "Tortuga Rex",
      "Un mapache llamado Maiana (es molestando)"
    ],
    correcta: 2
  },
  {
    id: 7,
    pregunta: "¿Fecha exacta en la que empezamos a hablar?",
    opciones: ["29 de febrero", "02 de septiembre", "13 de julio", "14 de febrero"],
    correcta: 1
  },
  {
    id: 8,
    pregunta: "¿Quién dio el primer beso?",
    opciones: ["Yo", "Tú", "Plutón", "No hubo beso"],
    correcta: 0
  },
  {
    id: 9,
    pregunta: "¿Quién dijo 'te amo' primero?",
    opciones: ["Tú ", "Somos nuestros haters", "Yo", "04 de abril"],
    correcta: 0
  },
  {
    id: 10,
    pregunta: "¿Cuál es mi programa de comedia favorito?",
    opciones: [
      "Sin ánimo de ofender",
      "Tus videos",
      "Por la ventana",
      "Con ánimo de ofender"
    ],
    correcta: 3
  },
  {
    id: 11,
    pregunta: "¿Cuál es nuestro lugar de estudio más frecuentado?",
    opciones: [
      "Pergamino",
      "No estudio",
      "Starbucks",
      "Biblioteca"
    ],
    correcta: 0
  },
  {
    id: 12,
    pregunta: "¿Cuál fue nuestro disfraz de Halloween de 2023?",
    opciones: [
      "La Bella y la Bestia",
      "Los dos chiflados",
      "Chernóbil",
      "Van Gogh y La noche estrellada"
    ],
    correcta: 3
  },
  {
    id: 13,
    pregunta: "¿Qué es lo más bonito que tienes físicamente (según yo)?",
    opciones: ["Ojos", "Nariz", "Sonrisa", "Todo"],
    correcta: 3
  },
  {
    id: 14,
    pregunta: "Tú eres...",
    opciones: [
      "Esta no es",
      "Perfecta",
      "Póngase las gafas, que esta tampoco es",
      "Esta es, pero perdida mija"
    ],
    correcta: 1
  },
  {
    id: 15,
    pregunta: "Una palabra rola es...",
    opciones: ["Sumercé", "Piquito", "Ome", "Ninguna de las anteriores"],
    correcta: 0
  },
  {
    id: 16,
    pregunta: "Un piquito es...",
    opciones: [
      "Un besito",
      "La boca de un pajarito",
      "No sé",
      "Un poquito de algo"
    ],
    correcta: 3
  },
  {
    id: 17,
    pregunta: "¿Canción en la que nos besamos?",
    opciones: [
      "Ella es mi bitch XD",
      "Antes de perderte",
      "Salir con vida",
      "Koyo"
    ],
    correcta: 1
  },
  {
    id: 18,
    pregunta: "La programación neurolingüística es...",
    opciones: [
      "Cuando le dices al cerebro que deje de pensar en ti",
      "Un curso de coaching barato",
      "Algo que solo ChatGPT entiende",
      "La excusa para manipularte amorosamente"
    ],
    correcta: 0
  },
  {
    id: 19,
    pregunta: "La solución de un binomio cuadrado perfecto es...",
    opciones: [
      "(a + b)² = a² + 2ab + b²",
      "Una fórmula del amor",
      "Un hechizo de Harry Potter",
      "Lo que uso para impresionarte en matemáticas"
    ],
    correcta: 0
  },
  {
    id: 20,
    pregunta: "Uno de mis sueños es...",
    opciones: [
      "Viajar a los Balcanes",
      "Ir a comer pizza con leche condensada",
      "Volver a besarte ",
      "No hay"
    ],
    correcta: 2
  },
  {
    id: 21,
    pregunta: "Tú eres...",
    opciones: [
      "Hermosa",
      "Perfecta",
      "Bella",
      "Todas las anteriores, bendita diosa"
    ],
    correcta: 3
  },
  // Preguntas nuevas graciosas
  {
    id: 22,
    pregunta: "Si fuera un perro, ¿qué raza sería yo?",
    opciones: [
      "Un Golden cariñoso",
      "Un chihuahua gritón",
      "Un Husky dramático",
      "Un gato disfrazado de perro"
    ],
    correcta: 1
  },
  {
    id: 23,
    pregunta: "¿Qué haría si me ganas en el UNO?",
    opciones: [
      "Aceptarlo con madurez",
      "Pedir revancha hasta las 3 a.m.",
      "Llorar en silencio",
      "Culpar a las cartas"
    ],
    correcta: 1
  },
  {
    id: 24,
    pregunta: "¿Cuál es mi súperpoder secreto?",
    opciones: [
      "Dormirme en cualquier parte",
      "Lavar platos con la mente",
      "Predecir el clima con el codo",
      "Hacerte reír aunque no quieras"
    ],
    correcta: 3
  }
];

export default function MiniJuego({ onBack }) {
  const [juegoActivo, setJuegoActivo] = useState(false);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [juegoCompletado, setJuegoCompletado] = useState(false);
  const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState([]);

  const seleccionarPreguntasAleatorias = () => {
    const preguntasCopia = [...PREGUNTAS];
    const seleccionadas = [];
    
    for (let i = 0; i < 5; i++) {
      const indiceAleatorio = Math.floor(Math.random() * preguntasCopia.length);
      seleccionadas.push(preguntasCopia[indiceAleatorio]);
      preguntasCopia.splice(indiceAleatorio, 1);
    }
    
    return seleccionadas;
  };

  const iniciarJuego = () => {
    setPreguntasSeleccionadas(seleccionarPreguntasAleatorias());
    setJuegoActivo(true);
    setPreguntaActual(0);
    setRespuestas([]);
    setRespuestaSeleccionada(null);
    setMostrarResultado(false);
    setJuegoCompletado(false);
  };

  const seleccionarRespuesta = (indice) => {
    if (respuestaSeleccionada !== null) return;
    
    setRespuestaSeleccionada(indice);
    const esCorrecta = indice === preguntasSeleccionadas[preguntaActual].correcta;
    setRespuestas([...respuestas, esCorrecta]);

    setTimeout(() => {
      if (preguntaActual < preguntasSeleccionadas.length - 1) {
        setPreguntaActual(preguntaActual + 1);
        setRespuestaSeleccionada(null);
      } else {
        finalizarJuego([...respuestas, esCorrecta]);
      }
    }, 1500);
  };

  const finalizarJuego = async (todasRespuestas) => {
    const correctas = todasRespuestas.filter(r => r).length;
    setMostrarResultado(true);

    if (correctas === 5) {
      try {
        await completarJuego();
        toast.success('¡+5 estrellas ganadas! ⭐', {
          icon: '🎉',
          duration: 4000
        });
        setJuegoCompletado(true);
      } catch (error) {
        toast.error('Error al guardar resultado');
      }
    } else {
      toast('Necesitas las 5 correctas para ganar estrellas 😊');
    }
  };

  const resetearJuego = () => {
    setJuegoActivo(false);
    setPreguntaActual(0);
    setRespuestas([]);
    setRespuestaSeleccionada(null);
    setMostrarResultado(false);
    setJuegoCompletado(false);
  };

  // Pantalla de inicio
  if (!juegoActivo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-pink-300 relative overflow-hidden">
        {/* Decoración de fondo - Corazones flotantes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-pink-300 opacity-20"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: -50,
                rotate: 0
              }}
              animate={{ 
                y: window.innerHeight + 100,
                rotate: 360
              }}
              transition={{ 
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                delay: i * 1.5,
                ease: "linear"
              }}
            >
              <Heart className="w-6 h-6 fill-current" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 p-4 pb-20 max-w-md mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8 mt-8"
          >
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/90 backdrop-blur shadow-lg hover:shadow-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-cyan-600" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              </h1>
              <p className="text-white/90 text-sm mt-1">
                Trivia de Nosotros 💕
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden"
          >
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 text-9xl opacity-5">
              🎮
            </div>

            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-6 relative z-10"
            >
              🎯
            </motion.div>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Trivia de Nosotros
            </h2>
            
            <p className="text-gray-700 mb-3 leading-relaxed">
              Responde 5 preguntas sobre nuestra relación.
            </p>
            
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-4 rounded-2xl mb-6 shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-6 h-6 fill-current" />
                <span className="font-bold text-lg">Recompensa</span>
              </div>
              <p className="font-semibold">
                ¡Acierta las 5 preguntas y gana 5 estrellas!
              </p>
            </div>

            <div className="flex items-center justify-center gap-6 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-500" />
                <span>5 preguntas</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>5 para ganar</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={iniciarJuego}
              className="w-full bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 text-white font-bold py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                <Zap className="w-6 h-6" />
                Empezar Juego
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Pantalla de resultados
  if (mostrarResultado) {
    const correctas = respuestas.filter(r => r).length;
    const ganador = correctas === 5;

    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-pink-300 relative overflow-hidden p-4 pb-20 flex items-center justify-center">
        {/* Confetti effect para ganadores */}
        {ganador && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-3xl"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: -50,
                  rotate: 0
                }}
                animate={{ 
                  y: window.innerHeight + 100,
                  rotate: 360,
                  x: Math.random() * window.innerWidth
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              >
                {['🎉', '⭐', '💝', '✨', '🎊'][i % 5]}
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 text-center max-w-md w-full relative z-10 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-8xl mb-6"
          >
            {ganador ? '🎉' : '💪'}
          </motion.div>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
            {ganador ? '¡Increíble!' : '¡Buen intento!'}
          </h2>

          <p className="text-2xl text-gray-700 mb-6">
            Acertaste{' '}
            <motion.span 
              className="font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              {correctas}
            </motion.span>
            {' '}de{' '}
            <span className="font-bold text-gray-800">5</span>
          </p>

          {/* Indicador visual de respuestas */}
          <div className="flex justify-center gap-2 mb-6">
            {respuestas.map((correcta, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                  correcta 
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                    : 'bg-gradient-to-br from-red-400 to-rose-500'
                }`}
              >
                {correcta ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <X className="w-6 h-6 text-white" />
                )}
              </motion.div>
            ))}
          </div>

          {ganador && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-2xl mb-6 shadow-xl relative overflow-hidden"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-2 right-2 opacity-20"
              >
                <Sparkles className="w-16 h-16" />
              </motion.div>
              <Star className="w-14 h-14 mx-auto mb-3 fill-current" />
              <p className="font-bold text-xl">¡+5 Estrellas ganadas!</p>
              <p className="text-sm mt-2 opacity-90">¡Conoces muy bien nuestra historia! 💕</p>
            </motion.div>
          )}

          {!ganador && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-pink-50 p-4 rounded-2xl mb-6"
            >
              <p className="text-gray-700 font-medium">
                Necesitas las 5 correctas para ganar estrellas
              </p>
              <p className="text-sm text-gray-600 mt-2">
                ¡Pero puedes intentarlo de nuevo! 💪
              </p>
            </motion.div>
          )}

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={iniciarJuego}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Jugar de nuevo
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="w-full bg-white text-gray-700 font-semibold py-4 rounded-2xl shadow-md hover:shadow-lg transition-all border-2 border-gray-200"
            >
              Volver al inicio
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Pantalla de juego activo
  const pregunta = preguntasSeleccionadas[preguntaActual];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-pink-300 relative overflow-hidden">
      <div className="relative z-10 p-4 pb-20 max-w-md mx-auto">
        <div className="mt-8 mb-6">
          {/* Header con progreso */}
          <div className="flex justify-between items-center mb-6">
            <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg">
              <span className="text-sm font-bold text-gray-700">
                Pregunta {preguntaActual + 1} de 5
              </span>
            </div>
            <motion.button
              onClick={resetearJuego}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-white/90 backdrop-blur rounded-full text-gray-600 hover:text-red-500 shadow-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-white/50 backdrop-blur rounded-full h-3 mb-8 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((preguntaActual + 1) / 5) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-full relative overflow-hidden"
            >
              <motion.div
                animate={{ x: ['0%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
              />
            </motion.div>
          </div>

          {/* Contador de respuestas correctas */}
          <div className="flex justify-center gap-2 mb-6">
            {respuestas.map((correcta, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                  correcta ? 'bg-green-400' : 'bg-red-400'
                }`}
              >
                {correcta ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <X className="w-4 h-4 text-white" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Pregunta */}
          <AnimatePresence mode="wait">
            <motion.div
              key={preguntaActual}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 mb-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 text-6xl opacity-5">
                ❓
              </div>
              <h2 className="text-xl font-bold text-gray-800 leading-relaxed relative z-10">
                {pregunta.pregunta}
              </h2>
            </motion.div>
          </AnimatePresence>

          {/* Opciones */}
          <div className="space-y-3">
            {pregunta.opciones.map((opcion, indice) => {
              const seleccionada = respuestaSeleccionada === indice;
              const esCorrecta = indice === pregunta.correcta;
              const mostrarEstado = respuestaSeleccionada !== null;

              return (
                <motion.button
                  key={indice}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: indice * 0.1, type: "spring" }}
                  whileHover={respuestaSeleccionada === null ? { scale: 1.03, x: 5 } : {}}
                  whileTap={respuestaSeleccionada === null ? { scale: 0.97 } : {}}
                  onClick={() => seleccionarRespuesta(indice)}
                  disabled={respuestaSeleccionada !== null}
                  className={`w-full p-5 rounded-2xl font-medium text-left transition-all shadow-lg relative overflow-hidden ${
                    mostrarEstado
                      ? seleccionada
                        ? esCorrecta
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                          : 'bg-gradient-to-r from-red-400 to-rose-500 text-white'
                        : esCorrecta
                          ? 'bg-green-50 text-green-800 ring-2 ring-green-400'
                          : 'bg-gray-100 text-gray-500'
                      : 'bg-white/95 backdrop-blur hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <span className="pr-4">{opcion}</span>
                    {mostrarEstado && (seleccionada || esCorrecta) && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring" }}
                        className="flex-shrink-0"
                      >
                        {esCorrecta ? (
                          <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                            <Check className="w-5 h-5" />
                          </div>
                        ) : seleccionada ? (
                          <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                            <X className="w-5 h-5" />
                          </div>
                        ) : null}
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}