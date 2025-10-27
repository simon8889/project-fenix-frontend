import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Heart, Sparkles, Star, Crown } from 'lucide-react';
import { getRazones, getEstado } from '../utils/api';
import toast from 'react-hot-toast';

export default function Razones({ onBack }) {
  const [razones, setRazones] = useState([]);
  const [razonesDesbloqueadas, setRazonesDesbloqueadas] = useState([]);
  const [puntosActuales, setPuntosActuales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [razonSeleccionada, setRazonSeleccionada] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [estadoRes, razonesRes] = await Promise.all([
        getEstado(),
        getRazones()
      ]);
      
      const puntosSanacion = estadoRes.data.data.puntos_consideracion;
      setPuntosActuales(puntosSanacion);
      setRazonesDesbloqueadas(razonesRes.data.data);
      
      // Crear array completo de 20 razones (desbloqueadas + bloqueadas)
      const todasRazones = Array.from({ length: 20 }, (_, i) => {
        const razonDesbloqueada = razonesRes.data.data.find(r => r.id === i + 1);
        return razonDesbloqueada || {
          id: i + 1,
          bloqueada: true,
          puntos_requeridos: (i + 1) * 5  // Cada razón requiere múltiplos de 5
        };
      });
      
      setRazones(todasRazones);
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar razones');
    }
  };

  // Función para obtener el emoji del corazón según los puntos
  const getCorazonEmoji = (puntos) => {
    if (puntos < 30) {
      return '💔'; // Corazón roto
    } else if (puntos >= 30 && puntos < 60) {
      return '❤️‍🩹'; // Corazón sanando
    } else {
      return '💝'; // Corazón bonito/sano
    }
  };

  // Función para obtener el mensaje según los puntos
  const getCorazonMensaje = (puntos) => {
    if (puntos < 30) {
      return 'Corazón Roto - Necesita Sanación';
    } else if (puntos >= 30 && puntos < 60) {
      return 'Corazón Sanando - En Proceso';
    } else {
      return 'Corazón Sano - Lleno de Amor';
    }
  };

  // Función para obtener el color del gradiente según los puntos
  const getCorazonColor = (puntos) => {
    if (puntos < 30) {
      return 'from-gray-400 to-gray-600';
    } else if (puntos >= 30 && puntos < 60) {
      return 'from-orange-400 to-pink-500';
    } else {
      return 'from-pink-500 to-rose-500';
    }
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
          💝
        </motion.div>
      </div>
    );
  }

  const porcentajeProgreso = (razonesDesbloqueadas.length / 20) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-pink-300 relative overflow-hidden">
      {/* Decoración de fondo - Estrellas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-300 opacity-30"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{ 
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 p-4 pb-20 max-w-md mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 mt-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/90 backdrop-blur shadow-lg hover:shadow-xl transition-all"
            >
              <ArrowLeft className="w-6 h-6 text-pink-600" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                ¿Por qué volver?
              </h1>
              <p className="text-white/90 text-sm mt-1">
                Descubre todas las razones 💝
              </p>
            </div>
          </div>

          {/* Tarjeta de Progreso Mejorada */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 relative overflow-hidden"
          >
            {/* Decoración de fondo - Corazón dinámico */}
            <div className="absolute top-0 right-0 text-9xl opacity-5">
              {getCorazonEmoji(puntosActuales)}
            </div>

            <div className="relative z-10">
              {/* Estado del Corazón */}
              <div className="text-center mb-4">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: puntosActuales < 30 ? [0, -5, 5, -5, 0] : [0, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-2"
                >
                  {getCorazonEmoji(puntosActuales)}
                </motion.div>
                <p className={`font-bold text-lg bg-gradient-to-r ${getCorazonColor(puntosActuales)} bg-clip-text text-transparent`}>
                  {getCorazonMensaje(puntosActuales)}
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    Razones Desbloqueadas
                  </span>
                </div>
                <motion.span 
                  className="font-bold text-2xl bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent"
                  key={razonesDesbloqueadas.length}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {razonesDesbloqueadas.length}/20
                </motion.span>
              </div>

              {/* Barra de progreso con estilo */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${porcentajeProgreso}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-500 rounded-full relative overflow-hidden"
                  >
                    <motion.div
                      animate={{ x: ['0%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                    />
                  </motion.div>
                </div>
                <div className="absolute -top-1 -right-1">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow" />
                  </motion.div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                  <span className="text-sm text-gray-600">
                    {puntosActuales}/100 Puntos de Sanación
                  </span>
                </div>
                <span className="text-xs font-semibold text-pink-600">
                  {((puntosActuales / 100) * 100).toFixed(0)}%
                </span>
              </div>

              {razonesDesbloqueadas.length < 20 && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xs text-gray-500 mt-3 text-center bg-pink-50 rounded-full py-2 px-4"
                >
                  Cada 5 puntos desbloqueas una nueva razón 💝
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Grid de Razones */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {razones.map((razon, index) => (
            <motion.div
              key={razon.id}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ 
                delay: index * 0.05,
                type: "spring",
                stiffness: 200
              }}
            >
              {razon.bloqueada ? (
                <RazonBloqueada 
                  id={razon.id}
                  puntosRequeridos={razon.puntos_requeridos}
                  puntosActuales={puntosActuales}
                />
              ) : (
                <RazonDesbloqueada 
                  razon={razon}
                  onClick={() => setRazonSeleccionada(razon)}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Mensaje motivacional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/95 backdrop-blur rounded-3xl shadow-xl p-6 text-center relative overflow-hidden"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-16 h-16 mx-auto mb-4 text-pink-500 fill-pink-500" />
          </motion.div>
          <p className="text-gray-700 font-medium">
            {razonesDesbloqueadas.length === 20 
              ? '¡Has desbloqueado todas las razones! 💕'
              : `Faltan ${20 - razonesDesbloqueadas.length} razones por descubrir...`
            }
          </p>
          {razonesDesbloqueadas.length === 20 && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-pink-600 mt-2 font-semibold"
            >
              ¡Eres increíble! 🎉
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Modal de Razón Detallada */}
      <AnimatePresence>
        {razonSeleccionada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setRazonSeleccionada(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-white via-pink-50 to-rose-50 rounded-3xl shadow-2xl max-w-sm w-full p-8 relative overflow-hidden"
            >
              {/* Decoración */}
              <div className="absolute top-0 right-0 text-9xl opacity-5">
                {razonSeleccionada.emoji}
              </div>

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${getCategoriaColor(razonSeleccionada.categoria)} flex items-center justify-center text-5xl shadow-2xl`}
                >
                  {razonSeleccionada.emoji}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 text-white text-xs font-bold mb-4">
                    Razón #{razonSeleccionada.id}
                  </div>
                  
                  <p className="text-gray-800 text-lg leading-relaxed text-center mb-6">
                    {razonSeleccionada.texto}
                  </p>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="capitalize font-medium">
                      {razonSeleccionada.categoria}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRazonSeleccionada(null)}
                    className="w-full bg-gradient-to-r from-pink-400 to-rose-400 text-white font-bold py-4 rounded-2xl shadow-lg"
                  >
                    Cerrar
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RazonBloqueada({ id, puntosRequeridos, puntosActuales }) {
  const estaCerca = puntosActuales >= puntosRequeridos - 1;
  const faltanPuntos = puntosRequeridos - puntosActuales;
  
  return (
    <motion.div 
      whileHover={{ scale: estaCerca ? 1.05 : 1.02 }}
      className={`bg-white/80 backdrop-blur rounded-2xl shadow-lg h-full flex flex-col items-center justify-center p-5 relative overflow-hidden ${
        estaCerca ? 'ring-2 ring-pink-400 shadow-pink-200' : 'opacity-70'
      }`}
    >
      {estaCerca && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-rose-400/20"
        />
      )}

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={estaCerca ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        >
          <Lock className={`w-10 h-10 mb-3 ${
            estaCerca ? 'text-pink-500' : 'text-gray-400'
          }`} />
        </motion.div>
        
        <div className="text-4xl mb-3">
          {estaCerca ? '🔓' : '🔒'}
        </div>
        
        <p className="text-xs text-gray-600 text-center font-medium mb-1">
          {puntosRequeridos} {puntosRequeridos === 1 ? 'punto' : 'puntos'}
        </p>
        
        {estaCerca ? (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex items-center gap-1 text-xs text-pink-600 font-bold bg-pink-100 px-3 py-1 rounded-full"
          >
            <span>¡Casi!</span>
            <span>🔥</span>
          </motion.div>
        ) : (
          <p className="text-xs text-gray-500">
            Faltan {faltanPuntos}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function RazonDesbloqueada({ razon, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.08, rotate: 2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="bg-white/95 backdrop-blur rounded-2xl shadow-xl h-full p-5 cursor-pointer relative overflow-hidden group"
    >
      {/* Efecto de brillo en hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
      />

      <div className="relative z-10">
        <motion.div 
          className={`w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br ${getCategoriaColor(razon.categoria)} flex items-center justify-center text-3xl shadow-lg`}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          {razon.emoji}
        </motion.div>
        
        <p className="text-sm text-gray-700 text-center leading-tight font-medium min-h-[3rem] flex items-center justify-center">
          {razon.texto}
        </p>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500 capitalize">
            {razon.categoria}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function getCategoriaColor(categoria) {
  const colores = {
    divertida: 'from-yellow-400 to-orange-500',
    emocional: 'from-pink-400 to-rose-500',
    profunda: 'from-purple-500 to-indigo-600'
  };
  return colores[categoria] || 'from-gray-400 to-gray-500';
}