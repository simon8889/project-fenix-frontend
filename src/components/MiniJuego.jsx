import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Trophy, X, Check } from 'lucide-react';
import { completarJuego } from '../utils/api';
import toast from 'react-hot-toast';

const PREGUNTAS = [
  {
    id: 1,
    pregunta: "¿Cuál fue nuestra primera película juntos?",
    opciones: ["Inception", "La La Land", "Interestelar", "Avatar"],
    correcta: 1
  },
  {
    id: 2,
    pregunta: "¿Qué canción te dedicé?",
    opciones: ["Perfect - Ed Sheeran", "Thinking Out Loud", "All of Me", "Stay With Me"],
    correcta: 0
  },
  {
    id: 3,
    pregunta: "¿Cuál es tu comida favorita que yo sé preparar?",
    opciones: ["Pizza casera", "Pasta carbonara", "Tacos", "Sushi"],
    correcta: 1
  },
  {
    id: 4,
    pregunta: "¿En qué lugar tuvimos nuestra primera cita?",
    opciones: ["Café del centro", "Parque Lleras", "Cine", "Restaurante italiano"],
    correcta: 2
  },
  {
    id: 5,
    pregunta: "¿Qué regalo te di en tu cumpleaños?",
    opciones: ["Libro", "Peluche", "Collar", "Chocolates"],
    correcta: 2
  }
];

export default function MiniJuego({ onBack }) {
  const [juegoActivo, setJuegoActivo] = useState(false);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [juegoCompletado, setJuegoCompletado] = useState(false);

  const iniciarJuego = () => {
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
    const esCorrecta = indice === PREGUNTAS[preguntaActual].correcta;
    setRespuestas([...respuestas, esCorrecta]);

    // Mostrar si es correcta o incorrecta
    setTimeout(() => {
      if (preguntaActual < PREGUNTAS.length - 1) {
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

    if (correctas >= 3) {
      try {
        await completarJuego();
        toast.success('¡+15 estrellas ganadas! ⭐', {
          icon: '🎉',
          duration: 4000
        });
        setJuegoCompletado(true);
      } catch (error) {
        toast.error('Error al guardar resultado');
      }
    } else {
      toast('Necesitas al menos 3 correctas para ganar estrellas 😊');
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

  if (!juegoActivo) {
    return (
      <div className="min-h-screen p-4 pb-20 max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6 mt-8">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Mini-Juego 🎮
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center"
        >
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Trivia de Nosotros
          </h2>
          <p className="text-gray-600 mb-6">
            Responde 5 preguntas sobre nuestra relación. 
            <br />
            <span className="font-semibold text-purple-600">
              ¡Acierta 3 o más y gana 15 estrellas! ⭐
            </span>
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={iniciarJuego}
            className="btn-primary"
          >
            Empezar Juego 🚀
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (mostrarResultado) {
    const correctas = respuestas.filter(r => r).length;
    const ganador = correctas >= 3;

    return (
      <div className="min-h-screen p-4 pb-20 max-w-md mx-auto flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card text-center"
        >
          <div className="text-7xl mb-4">
            {ganador ? '🎉' : '😊'}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            {ganador ? '¡Felicidades!' : '¡Buen intento!'}
          </h2>
          <p className="text-xl text-gray-700 mb-6">
            Acertaste <span className="font-bold text-purple-600">{correctas}</span> de <span className="font-bold">{PREGUNTAS.length}</span> preguntas
          </p>

          {ganador && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-xl mb-6">
              <Star className="w-12 h-12 mx-auto mb-2" fill="currentColor" />
              <p className="font-bold text-lg">¡+15 Estrellas ganadas!</p>
            </div>
          )}

          {!ganador && (
            <p className="text-gray-600 mb-6">
              Necesitas al menos 3 correctas para ganar estrellas
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={iniciarJuego}
              className="w-full btn-secondary"
            >
              Jugar de nuevo
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 px-6 rounded-full bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const pregunta = PREGUNTAS[preguntaActual];

  return (
    <div className="min-h-screen p-4 pb-20 max-w-md mx-auto">
      <div className="mb-6 mt-8">
        {/* Progreso */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            Pregunta {preguntaActual + 1} de {PREGUNTAS.length}
          </span>
          <button
            onClick={resetearJuego}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((preguntaActual + 1) / PREGUNTAS.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          />
        </div>

        {/* Pregunta */}
        <AnimatePresence mode="wait">
          <motion.div
            key={preguntaActual}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="card mb-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: indice * 0.1 }}
                whileHover={respuestaSeleccionada === null ? { scale: 1.02 } : {}}
                whileTap={respuestaSeleccionada === null ? { scale: 0.98 } : {}}
                onClick={() => seleccionarRespuesta(indice)}
                disabled={respuestaSeleccionada !== null}
                className={`w-full p-4 rounded-xl font-medium text-left transition-all ${
                  mostrarEstado
                    ? seleccionada
                      ? esCorrecta
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : esCorrecta
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    : 'bg-white hover:bg-purple-50 text-gray-800 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{opcion}</span>
                  {mostrarEstado && seleccionada && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {esCorrecta ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <X className="w-6 h-6" />
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}