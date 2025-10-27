import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Music, Play, Pause, Heart, Sparkles, Headphones, ExternalLink } from 'lucide-react';
import { getCanciones, escucharCancion } from '../utils/api';
import toast from 'react-hot-toast';

export default function Cancioncitas({ onBack }) {
  const [canciones, setCanciones] = useState([]);
  const [cancionAleatoria, setCancionAleatoria] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCanciones();
  }, []);

  const cargarCanciones = async () => {
    try {
      const res = await getCanciones();
      const todasCanciones = res.data.data;
      setCanciones(todasCanciones);
      
      // Seleccionar una canción aleatoria
      if (todasCanciones.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * todasCanciones.length);
        setCancionAleatoria(todasCanciones[indiceAleatorio]);
      }
      
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar las canciones');
      setLoading(false);
    }
  };

  const handleCambiarCancion = () => {
    if (canciones.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * canciones.length);
      setCancionAleatoria(canciones[indiceAleatorio]);
      toast.success('¡Nueva canción! 🎵', {
        icon: '💕',
        duration: 2000
      });
    }
  };

  const handleAbrirLink = async (link) => {
    try {
      // Dar estrella por escuchar
      await escucharCancion();
      toast.success('¡+1 estrella por escuchar! ⭐', {
        icon: '🎵',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error al dar estrella:', error);
    }
    
    // Abrir Spotify
    window.open(link, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-pink-300">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl"
        >
          🎵
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-pink-300 relative overflow-hidden">
      {/* Decoración de fondo - Notas musicales flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white opacity-20"
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
              delay: i * 1.5,
              ease: "linear"
            }}
          >
            {i % 3 === 0 ? '🎵' : i % 3 === 1 ? '🎶' : '💕'}
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
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 rounded-full bg-white/90 backdrop-blur shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-purple-600" />
          </motion.button>
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">
              Nuestra Playlist
            </h1>
            <p className="text-white/90 text-sm mt-1">
              Canciones que me recuerdan a ti 🎵💕
            </p>
          </div>
        </motion.div>

        {/* Tarjeta de resumen */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 text-9xl opacity-5">
            🎧
          </div>
          <div className="relative z-10 text-center">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🎵
            </motion.div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Canción del Momento
            </h2>
            <p className="text-sm text-gray-600">
              Una canción especial para ti 💕
            </p>
          </div>
        </motion.div>

        {/* Canción Aleatoria */}
        {cancionAleatoria ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", damping: 15 }}
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl shadow-2xl p-8 mb-6 relative overflow-hidden"
          >
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 text-9xl opacity-5">
              🎵
            </div>
            <div className="absolute bottom-0 left-0 text-9xl opacity-5">
              💕
            </div>

            <div className="relative z-10">
              {/* Icono de música animado */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-rose-500 flex items-center justify-center text-6xl shadow-2xl"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎵
                </motion.div>
              </motion.div>

              {/* Título de la canción */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center mb-6"
              >
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                  {cancionAleatoria.nombre}
                </h2>
                {cancionAleatoria.artista && (
                  <p className="text-xl text-gray-700 font-medium">
                    {cancionAleatoria.artista}
                  </p>
                )}
              </motion.div>

              {/* Motivo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/60 backdrop-blur rounded-2xl p-6 mb-6 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                  <span className="font-bold text-gray-800 text-lg">Por qué:</span>
                </div>
                <p className="text-gray-700 leading-relaxed text-base">
                  {cancionAleatoria.motivo}
                </p>
              </motion.div>

              {/* Botones */}
              <div className="space-y-3">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAbrirLink(cancionAleatoria.link)}
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white font-bold py-5 rounded-2xl shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
                  />
                  <Play className="w-6 h-6 fill-current" />
                  <span className="relative z-10 text-lg">Escuchar en Spotify (+1⭐)</span>
                  <ExternalLink className="w-5 h-5" />
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCambiarCancion}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-400 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Otra canción sorpresa
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  className="w-full bg-white text-gray-700 font-semibold py-4 rounded-2xl shadow-md hover:shadow-lg transition-all border-2 border-gray-200"
                >
                  Volver al inicio
                </motion.button>
              </div>

              {/* Decoración de estrellas */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex justify-center gap-2 mt-6"
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1.1 + i * 0.1, type: "spring" }}
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white/95 backdrop-blur rounded-3xl shadow-xl"
          >
            <div className="text-6xl mb-4">🎵</div>
            <p className="text-gray-700 font-medium text-lg">
              Aún no hay canciones en la playlist
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Pronto agregaré canciones especiales para ti 💕
            </p>
          </motion.div>
        )}
        {/* Mensaje motivacional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white/95 backdrop-blur rounded-3xl shadow-xl p-6 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 text-8xl opacity-5">
            🎼
          </div>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Heart className="w-16 h-16 mx-auto mb-4 text-pink-500 fill-pink-500" />
          </motion.div>
          <p className="text-gray-700 font-medium relative z-10">
            Cada canción cuenta nuestra historia de amor 🎶💕
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Escúchala y piensa en mí, mi amor
          </p>
        </motion.div>
      </div>
    </div>
  );
}

