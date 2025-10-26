import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Star, Sparkles, Check } from 'lucide-react';
import { getPremios, getEstado, reclamarPremio } from '../utils/api';
import toast from 'react-hot-toast';

export default function Tienda({ onBack }) {
  const [premios, setPremios] = useState([]);
  const [estrellas, setEstrellas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reclamando, setReclamando] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [premiosRes, estadoRes] = await Promise.all([
        getPremios(),
        getEstado()
      ]);
      
      setPremios(premiosRes.data.data);
      setEstrellas(estadoRes.data.data.estrellas);
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar premios');
    }
  };

  const handleReclamar = async (premio) => {
    if (estrellas < premio.costo) {
      toast.error('No tienes suficientes estrellas 😢');
      return;
    }

    if (premio.reclamado) {
      toast('Ya reclamaste este premio 😊');
      return;
    }

    setReclamando(premio.id);
    
    try {
      await reclamarPremio(premio.id);
      
      // Efecto de confetti
      toast.success(`¡${premio.nombre} reclamado! 🎉`, {
        duration: 4000,
        icon: '🎁',
      });

      // Recargar datos
      await cargarDatos();
    } catch (error) {
      toast.error('Error al reclamar premio');
    } finally {
      setReclamando(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-6xl">🎁</div>
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
            Tienda de Premios 🎁
          </h1>
        </div>

        {/* Balance de Estrellas */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="card bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Tus estrellas</p>
              <p className="text-4xl font-bold flex items-center gap-2">
                <Star className="w-8 h-8" fill="currentColor" />
                {estrellas}
              </p>
            </div>
            <Sparkles className="w-16 h-16 opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Lista de Premios */}
      <div className="space-y-4">
        {premios.map((premio, index) => (
          <motion.div
            key={premio.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PremioCard
              premio={premio}
              estrellas={estrellas}
              onReclamar={handleReclamar}
              reclamando={reclamando === premio.id}
            />
          </motion.div>
        ))}
      </div>

      {/* Mensaje motivacional */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="card mt-6 text-center"
      >
        <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-purple-500" />
        <p className="text-sm text-gray-600">
          {estrellas < 25 
            ? '¡Sigue ganando estrellas para desbloquear premios! ⭐'
            : '¡Tienes suficientes estrellas! Reclama tu premio 🎉'
          }
        </p>
      </motion.div>
    </div>
  );
}

function PremioCard({ premio, estrellas, onReclamar, reclamando }) {
  const puedeReclamar = estrellas >= premio.costo && !premio.reclamado;
  const yaReclamado = premio.reclamado;

  return (
    <div className={`card relative overflow-hidden ${
      yaReclamado ? 'opacity-75' : ''
    }`}>
      {/* Badge de reclamado */}
      {yaReclamado && (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <Check className="w-3 h-3" />
          Reclamado
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Emoji del premio */}
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${
          puedeReclamar 
            ? 'bg-gradient-to-br from-purple-400 to-pink-500 animate-pulse' 
            : 'bg-gray-200'
        }`}>
          {premio.emoji}
        </div>

        {/* Info del premio */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-1">
            {premio.nombre}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
            <span className="text-lg font-bold text-yellow-600">
              {premio.costo}
            </span>
            <span className="text-sm text-gray-500">
              {estrellas >= premio.costo 
                ? '¡Puedes reclamarlo!' 
                : `Te faltan ${premio.costo - estrellas}`
              }
            </span>
          </div>

          {/* Botón de reclamar */}
          {!yaReclamado && (
            <motion.button
              whileHover={puedeReclamar ? { scale: 1.05 } : {}}
              whileTap={puedeReclamar ? { scale: 0.95 } : {}}
              onClick={() => onReclamar(premio)}
              disabled={!puedeReclamar || reclamando}
              className={`w-full py-2 px-4 rounded-full font-semibold text-sm transition-all ${
                puedeReclamar
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              } ${reclamando ? 'opacity-50' : ''}`}
            >
              {reclamando ? 'Reclamando...' : 'Reclamar premio'}
            </motion.button>
          )}

          {yaReclamado && (
            <p className="text-sm text-green-600 font-medium">
              ¡Ya es tuyo! 💚
            </p>
          )}
        </div>
      </div>

      {/* Barra de progreso */}
      {!yaReclamado && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((estrellas / premio.costo) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}