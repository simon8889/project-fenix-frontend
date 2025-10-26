import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, MailOpen, Sparkles, Heart, X } from 'lucide-react';
import { getCartas, leerCarta } from '../utils/api';
import toast from 'react-hot-toast';

export default function Cartas({ onBack }) {
  const [cartas, setCartas] = useState([]);
  const [cartaSeleccionada, setCartaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCartas();
  }, []);

  const cargarCartas = async () => {
    try {
      const res = await getCartas();
      setCartas(res.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar cartas');
    }
  };

  const handleLeerCarta = async (carta) => {
    if (carta.leida) {
      setCartaSeleccionada(carta);
      return;
    }

    try {
      await leerCarta(carta.id);
      toast.success('¡+10 estrellas! ⭐', {
        icon: '✨',
        duration: 3000,
      });
      
      setCartaSeleccionada({ ...carta, leida: true });
      cargarCartas();
    } catch (error) {
      toast.error('Error al leer carta');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-pink-300">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl"
        >
          💌
        </motion.div>
      </div>
    );
  }

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
              rotate: 360,
              x: Math.random() * window.innerWidth
            }}
            transition={{ 
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear"
            }}
          >
            <Heart className="w-8 h-8 fill-current" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 p-4 pb-20 max-w-md mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8 mt-8"
        >
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 rounded-full bg-white/90 backdrop-blur shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-pink-600" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              Cartas para ti
            </h1>
            <p className="text-white/90 text-sm mt-1">
              Palabras escritas con el corazón 💌
            </p>
          </div>
        </motion.div>

        {/* Lista de Cartas */}
        <div className="space-y-4 mb-6">
          {cartas.map((carta, index) => (
            <motion.button
              key={carta.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: "spring" }}
              onClick={() => handleLeerCarta(carta)}
              whileHover={{ scale: 1.03, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white/95 backdrop-blur rounded-2xl shadow-xl p-5 flex items-center gap-4 transition-all text-left relative overflow-hidden group"
            >
              {/* Efecto de brillo */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              />

              {/* Icono */}
              <motion.div 
                className={`p-4 rounded-xl ${
                  carta.leida 
                    ? 'bg-gradient-to-br from-gray-300 to-gray-400' 
                    : 'bg-gradient-to-br from-pink-400 to-rose-500'
                } text-white shadow-lg relative z-10`}
                animate={!carta.leida ? { 
                  rotate: [0, -5, 5, -5, 0],
                  scale: [1, 1.05, 1]
                } : {}}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                {carta.leida ? (
                  <MailOpen className="w-7 h-7" />
                ) : (
                  <Mail className="w-7 h-7" />
                )}
              </motion.div>

              {/* Contenido */}
              <div className="flex-1 relative z-10">
                <h3 className="font-bold text-gray-800 text-lg mb-1">
                  {carta.titulo}
                </h3>
                <p className={`text-sm font-medium ${
                  carta.leida ? 'text-gray-500' : 'text-pink-600'
                }`}>
                  {carta.leida ? '✓ Ya leída' : '¡Nueva carta! +10⭐'}
                </p>
              </div>

              {/* Badge de nueva */}
              {!carta.leida && (
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="relative z-10"
                >
                  <div className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Nuevo
                  </div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Mensaje si no hay cartas */}
        {cartas.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">💌</div>
            <p className="text-white font-medium text-lg">
              Aún no hay cartas disponibles
            </p>
            <p className="text-white/80 text-sm mt-2">
              Pronto habrá nuevas sorpresas para ti
            </p>
          </motion.div>
        )}
      </div>

      {/* Modal de Carta */}
      <AnimatePresence>
        {cartaSeleccionada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setCartaSeleccionada(null)}
          >
            <motion.div
              initial={{ scale: 0.8, rotateY: -90, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              exit={{ scale: 0.8, rotateY: 90, opacity: 0 }}
              transition={{ type: "spring", duration: 0.7 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-amber-50 via-pink-50 to-rose-50 rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden relative"
            >
              {/* Decoración superior - Sobre */}
              <div className="relative h-32 bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 overflow-hidden">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/20 text-9xl"
                >
                  💌
                </motion.div>
                <motion.button
                  onClick={() => setCartaSeleccionada(null)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Contenido scrolleable */}
              <div className="overflow-y-auto max-h-[calc(85vh-8rem)] p-8">
                <div className="relative">
                  {/* Título */}
                  <div className="text-center mb-8 -mt-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="inline-block bg-white rounded-full p-4 shadow-xl mb-4"
                    >
                      <div className="text-6xl">💌</div>
                    </motion.div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
                      {cartaSeleccionada.titulo}
                    </h2>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "5rem" }}
                      transition={{ delay: 0.5 }}
                      className="h-1 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400 mx-auto rounded-full"
                    />
                  </div>

                  {/* Contenido */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/60 backdrop-blur rounded-2xl p-6 mb-6 shadow-lg"
                  >
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                      {cartaSeleccionada.contenido}
                    </p>
                  </motion.div>

                  {/* Firma */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="border-t-2 border-pink-200 pt-6 text-right"
                  >
                    <p className="text-gray-600 italic font-medium mb-2">
                      Con todo mi cariño,
                    </p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center justify-end gap-2">
                      Tu programador favorito
                      <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                    </p>
                  </motion.div>

                  {/* Botón cerrar */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCartaSeleccionada(null)}
                    className="mt-8 w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Cerrar Carta
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}