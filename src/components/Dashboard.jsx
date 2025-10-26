import { useState, useEffect } from 'react';
import { Heart, Star, Gift, Mail, Sparkles, Cloud } from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const [estado, setEstado] = useState({
    puntos_consideracion: 47,
    estrellas: 12,
    razones_desbloqueadas: Array(8).fill(null)
  });
  const [animatingPoints, setAnimatingPoints] = useState(false);
  const [hearts, setHearts] = useState([]);

  const handleDarPunto = () => {
    if (animatingPoints) return;
    
    setAnimatingPoints(true);
    setEstado(prev => ({
      ...prev,
      puntos_consideracion: prev.puntos_consideracion + 1
    }));

    // Crear corazones flotantes
    const newHearts = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 80 + 10,
      delay: Math.random() * 0.3
    }));
    setHearts(newHearts);

    setTimeout(() => {
      setAnimatingPoints(false);
      setHearts([]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-pink-300 relative overflow-hidden">
      {/* Nubes decorativas */}
      <div className="absolute top-10 left-5 opacity-20">
        <Cloud className="w-24 h-24 text-white" />
      </div>
      <div className="absolute top-32 right-10 opacity-20">
        <Cloud className="w-32 h-32 text-white" />
      </div>
      <div className="absolute top-64 left-16 opacity-15">
        <Cloud className="w-20 h-20 text-white" />
      </div>

      {/* Corazones flotantes animados */}
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="absolute bottom-0 animate-float-up pointer-events-none"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`
          }}
        >
          <Heart className="w-8 h-8 text-pink-500 fill-pink-500 opacity-80" />
        </div>
      ))}

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-8">
        <div className="w-full max-w-md">
          {/* Header con animación */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-block mb-4 relative">
              <div className="absolute inset-0 bg-pink-400 blur-xl opacity-50 rounded-full animate-pulse"></div>
              <h1 className="text-4xl font-bold text-white relative drop-shadow-lg">
                💕 Reconquista 💕
              </h1>
            </div>
            <p className="text-white text-lg font-medium drop-shadow">
              Cada punto cuenta una historia
            </p>
          </div>

          {/* Botón Principal - Corazón Grande */}
          <div className="mb-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={handleDarPunto}
              disabled={animatingPoints}
              className="w-full bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 rounded-3xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-70 relative overflow-hidden group"
            >
              {/* Brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000"></div>
              
              <div className="relative">
                <div className={`transition-transform duration-500 ${animatingPoints ? 'scale-125' : 'scale-100'}`}>
                  <Heart className="w-20 h-20 mx-auto mb-3 text-white fill-white drop-shadow-lg" />
                </div>
                <p className="text-2xl font-bold text-white drop-shadow-md">
                  Dale un punto
                </p>
                <p className="text-sm text-white/90 mt-2">
                  (Sé que quieres 👀)
                </p>
              </div>
            </button>
          </div>

          {/* Contadores con diseño de tarjetas románticas */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl p-6 text-center transform transition-all hover:scale-105 animate-slide-in-left">
              <div className="text-5xl mb-2 animate-bounce-slow">💝</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                {estado.puntos_consideracion}
              </div>
              <div className="text-sm text-gray-600 font-medium mt-2">
                Puntos de Amor
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur rounded-3xl shadow-xl p-6 text-center transform transition-all hover:scale-105 animate-slide-in-right">
              <div className="text-5xl mb-2 animate-bounce-slow" style={{ animationDelay: '0.2s' }}>⭐</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                {estado.estrellas}
              </div>
              <div className="text-sm text-gray-600 font-medium mt-2">
                Estrellitas
              </div>
            </div>
          </div>

          {/* Menú de Secciones */}
          <div className="space-y-3">
            <MenuCard
              icon={<Mail className="w-6 h-6" />}
              title="Carta del Día"
              badge="Nuevo"
              delay={0.5}
              onClick={() => onNavigate?.('cartas')}
              gradient="from-pink-400 to-rose-400"
              emoji="💌"
            />

            <MenuCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Razones Desbloqueadas"
              badge={`${estado.razones_desbloqueadas.length}/20`}
              delay={0.6}
              onClick={() => onNavigate?.('razones')}
              gradient="from-purple-400 to-indigo-400"
              emoji="✨"
            />

            <MenuCard
              icon={<Gift className="w-6 h-6" />}
              title="Tienda de Premios"
              badge={`${estado.estrellas}⭐`}
              delay={0.7}
              onClick={() => onNavigate?.('tienda')}
              gradient="from-orange-400 to-amber-400"
              emoji="🎁"
            />

            <MenuCard
              icon={<Star className="w-6 h-6" />}
              title="Mini-Juego"
              badge="+15⭐"
              delay={0.8}
              onClick={() => onNavigate?.('juego')}
              gradient="from-cyan-400 to-blue-400"
              emoji="🎮"
            />
          </div>

          {/* Footer motivacional */}
          <div className="text-center mt-8 animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <div className="bg-white/30 backdrop-blur rounded-2xl p-4 shadow-lg">
              <p className="text-white font-medium drop-shadow">
                Cada clic es un paso más cerca 💕
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out 0.3s both;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out 0.4s both;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function MenuCard({ icon, title, badge, delay, onClick, gradient, emoji }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white/95 backdrop-blur rounded-2xl shadow-xl p-4 flex items-center justify-between transform transition-all duration-300 hover:scale-102 hover:shadow-2xl active:scale-98 animate-fade-in-up group"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="text-left">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            {title}
            <span className="text-xl">{emoji}</span>
          </h3>
        </div>
      </div>
      <div className="bg-gradient-to-br from-pink-400 to-rose-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
        {badge}
      </div>
    </button>
  );
}