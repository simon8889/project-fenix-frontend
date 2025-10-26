import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Star, Sparkles, Check, Gift, Crown, Zap } from 'lucide-react';
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
      toast.error('Uy bebé, te faltan estrellitas 😢💫');
      return;
    }

    if (premio.reclamado) {
      toast('Ya disfrutaste este premio, amor 😊✨');
      return;
    }

    setReclamando(premio.id);
    
    try {
      await reclamarPremio(premio.id);
      
      toast.success(`¡${premio.nombre} desbloqueado! Disfrútalo mi vida 🎉💕`, {
        duration: 4000,
        icon: '🎁',
      });

      await cargarDatos();
    } catch (error) {
      toast.error('Error al reclamar premio');
    } finally {
      setReclamando(null);
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
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-8xl"
        >
          🎁
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-pink-300 relative overflow-hidden">
      {/* Decoración de fondo - Regalos y estrellas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-300 opacity-20"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -50,
              rotate: 0
            }}
            animate={{ 
              y: window.innerHeight + 100,
              rotate: 360,
              scale: [1, 1.5, 1]
            }}
            transition={{ 
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "linear"
            }}
          >
            {i % 2 === 0 ? (
              <Star className="w-6 h-6 fill-current" />
            ) : (
              <Gift className="w-6 h-6" />
            )}
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
              <ArrowLeft className="w-6 h-6 text-purple-600" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                Tiendita del Amosh 🥵
              </h1>
              <p className="text-white/90 text-sm mt-1">
                Canjea estrellitas por cositas gonitas 💝
              </p>
            </div>
          </div>

          {/* Balance de Estrellas - Mejorado */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-6 relative overflow-hidden"
          >
            {/* Decoración de fondo */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20"
              animate={{ 
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(250, 204, 21, 0.2), transparent)',
                  'radial-gradient(circle at 80% 50%, rgba(251, 146, 60, 0.2), transparent)',
                  'radial-gradient(circle at 50% 80%, rgba(250, 204, 21, 0.2), transparent)',
                  'radial-gradient(circle at 20% 50%, rgba(250, 204, 21, 0.2), transparent)',
                ]
              }}
              transition={{ duration: 5, repeat: Infinity }}
            />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <p className="text-sm font-semibold text-gray-600">Tienes estas estrellitas, estrellita:</p>
                </div>
                <motion.p 
                  className="text-5xl font-bold flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent"
                  key={estrellas}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <Star className="w-10 h-10 text-yellow-400 fill-yellow-400" />
                  {estrellas}
                </motion.p>
              </div>
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-20 h-20 text-yellow-400 opacity-40" />
              </motion.div>
            </div>

            {/* Indicador de poder adquisitivo */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Poder adquisitivo</span>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1"
                >
                  <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-yellow-600">
                    {estrellas >= 100 ? 'Vas genial 💫' : estrellas >= 50 ? 'Sigue así amor 💪' : 'Tas pobre, wey.'}
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Lista de Premios */}
        <div className="space-y-4 mb-6">
          {premios.map((premio, index) => (
            <motion.div
              key={premio.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: "spring" }}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/95 backdrop-blur rounded-3xl shadow-xl p-6 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 text-8xl opacity-5">
            🛍️
          </div>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          </motion.div>
          <p className="text-gray-700 font-medium relative z-10">
            {estrellas < 25 
              ? '¡Junta más estrellitas para desbloquear recompensas románticas! ⭐💕'
              : '¡Wow! Ya puedes reclamar premios deliciosos, mi amor 🎉😏'
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function PremioCard({ premio, estrellas, onReclamar, reclamando }) {
  const puedeReclamar = estrellas >= premio.costo && !premio.reclamado;
  const yaReclamado = premio.reclamado;
  const porcentajeProgreso = Math.min((estrellas / premio.costo) * 100, 100);

  return (
    <motion.div 
      whileHover={!yaReclamado ? { scale: 1.02, y: -5 } : {}}
      className={`bg-white/95 backdrop-blur rounded-3xl shadow-xl p-6 relative overflow-hidden ${
        yaReclamado ? 'opacity-80' : ''
      }`}
    >
      {/* Efecto de brillo para premios disponibles */}
      {puedeReclamar && !yaReclamado && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
      )}

      {/* Badge de reclamado */}
      {yaReclamado && (
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg"
        >
          <Check className="w-4 h-4" />
          Reclamado
        </motion.div>
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-5 mb-4">
          {/* Emoji del premio */}
          <motion.div 
            className={`w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shadow-xl ${
              puedeReclamar 
                ? 'bg-gradient-to-br from-purple-400 via-pink-400 to-rose-500' 
                : yaReclamado
                ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                : 'bg-gradient-to-br from-gray-200 to-gray-300'
            }`}
            animate={puedeReclamar ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {premio.emoji}
          </motion.div>

          {/* Info del premio */}
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-xl mb-2">
              {premio.nombre}
            </h3>
            
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full shadow-md">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold">
                  {premio.costo}
                </span>
              </div>
              {!yaReclamado && (
                <span className={`text-xs font-medium ${
                  estrellas >= premio.costo ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {estrellas >= premio.costo 
                    ? '¡Ya es tuyo, amor! 💖' 
                    : `Te faltan ${premio.costo - estrellas} ⭐`
                  }
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        {!yaReclamado && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${porcentajeProgreso}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: ['0%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
                />
              </motion.div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{estrellas} estrellas</span>
              <span>{porcentajeProgreso.toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* Botón de reclamar */}
        {!yaReclamado ? (
          <motion.button
            whileHover={puedeReclamar ? { scale: 1.05 } : {}}
            whileTap={puedeReclamar ? { scale: 0.95 } : {}}
            onClick={() => onReclamar(premio)}
            disabled={!puedeReclamar || reclamando}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all shadow-lg relative overflow-hidden ${
              puedeReclamar
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white hover:shadow-2xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            } ${reclamando ? 'opacity-50' : ''}`}
          >
            {puedeReclamar && !reclamando && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {reclamando ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Reclamando...
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5" />
                  {puedeReclamar ? '¡Reclamar ahora! 😍' : 'Necesitas más ⭐'}
                </>
              )}
            </span>
          </motion.button>
        ) : (
          <div className="text-center py-3 bg-green-50 rounded-2xl">
            <p className="text-green-600 font-bold flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              ¡Reclamado con amor! 💚✨
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}