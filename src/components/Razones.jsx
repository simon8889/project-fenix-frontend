import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Heart } from 'lucide-react';
import { getRazones, getEstado } from '../utils/api';
import toast from 'react-hot-toast';

export default function Razones({ onBack }) {
  const [razones, setRazones] = useState([]);
  const [razonesDesbloqueadas, setRazonesDesbloqueadas] = useState([]);
  const [puntosActuales, setPuntosActuales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [estadoRes, razonesRes] = await Promise.all([
        getEstado(),
        getRazones()
      ]);
      
      setPuntosActuales(estadoRes.data.data.puntos_consideracion);
      setRazonesDesbloqueadas(razonesRes.data.data);
      
      // Crear array completo de 20 razones (desbloqueadas + bloqueadas)
      const todasRazones = Array.from({ length: 20 }, (_, i) => {
        const razonDesbloqueada = razonesRes.data.data.find(r => r.id === i + 1);
        return razonDesbloqueada || {
          id: i + 1,
          bloqueada: true,
          puntos_requeridos: calcularPuntosRequeridos(i + 1)
        };
      });
      
      setRazones(todasRazones);
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar razones');
    }
  };

  // Distribución de puntos: 1,1,2,2,3,3,4,4,5,5,7,7,9,9,11,11,13,15,17,20
  const calcularPuntosRequeridos = (id) => {
    const distribucion = [1,1,2,2,3,3,4,4,5,5,7,7,9,9,11,11,13,15,17,20];
    return distribucion[id - 1] || id;
  };

  const getCategoriaColor = (categoria) => {
    const colores = {
      divertida: 'from-yellow-400 to-orange-500',
      emocional: 'from-pink-400 to-rose-500',
      profunda: 'from-purple-500 to-indigo-600'
    };
    return colores[categoria] || 'from-gray-400 to-gray-500';
  };

  const getCategoriaIcon = (categoria) => {
    const iconos = {
      divertida: '😂',
      emocional: '💕',
      profunda: '✨'
    };
    return iconos[categoria] || '💝';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-6xl">💝</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6 mt-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            ¿Por qué volver? 💝
          </h1>
        </div>

        {/* Progreso */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tu progreso</span>
            <span className="font-bold text-pink-600">
              {razonesDesbloqueadas.length}/20
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(razonesDesbloqueadas.length / 20) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tienes {puntosActuales} puntos • Sigue dando más para desbloquear 👀
          </p>
        </div>
      </div>

      {/* Grid de Razones */}
      <div className="grid grid-cols-2 gap-4">
        {razones.map((razon, index) => (
          <motion.div
            key={razon.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            {razon.bloqueada ? (
              <RazonBloqueada 
                id={razon.id}
                puntosRequeridos={razon.puntos_requeridos}
                puntosActuales={puntosActuales}
              />
            ) : (
              <RazonDesbloqueada razon={razon} />
            )}
          </motion.div>
        ))}
      </div>

      {/* Mensaje motivacional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card mt-6 text-center"
      >
        <Heart className="w-12 h-12 mx-auto mb-3 text-pink-500 animate-pulse" />
        <p className="text-gray-700 text-sm">
          {razonesDesbloqueadas.length === 20 
            ? '¡Has desbloqueado todas las razones! 💕'
            : `Faltan ${20 - razonesDesbloqueadas.length} razones por descubrir...`
          }
        </p>
      </motion.div>
    </div>
  );
}

function RazonBloqueada({ id, puntosRequeridos, puntosActuales }) {
  const estaCerca = puntosActuales >= puntosRequeridos - 1;
  
  return (
    <div className={`card h-full flex flex-col items-center justify-center p-4 ${
      estaCerca ? 'ring-2 ring-pink-300 animate-pulse' : 'opacity-60'
    }`}>
      <Lock className="w-8 h-8 text-gray-400 mb-2" />
      <div className="text-2xl mb-2">???</div>
      <p className="text-xs text-gray-500 text-center">
        Requiere {puntosRequeridos} {puntosRequeridos === 1 ? 'punto' : 'puntos'}
      </p>
      {estaCerca && (
        <p className="text-xs text-pink-600 font-semibold mt-1">
          ¡Casi! 🔥
        </p>
      )}
    </div>
  );
}

function RazonDesbloqueada({ razon }) {
  const getCategoriaColor = (categoria) => {
    const colores = {
      divertida: 'from-yellow-400 to-orange-500',
      emocional: 'from-pink-400 to-rose-500',
      profunda: 'from-purple-500 to-indigo-600'
    };
    return colores[categoria] || 'from-gray-400 to-gray-500';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="card h-full p-4 cursor-pointer hover:shadow-xl transition-shadow"
    >
      <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br ${getCategoriaColor(razon.categoria)} flex items-center justify-center text-2xl`}>
        {razon.emoji}
      </div>
      <p className="text-sm text-gray-700 text-center leading-snug">
        {razon.texto}
      </p>
    </motion.div>
  );
}