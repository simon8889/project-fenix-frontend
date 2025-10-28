import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Star, Trophy, Zap, Play, RotateCcw, Crown } from 'lucide-react';
import { completarJuego } from '../utils/api';
import toast from 'react-hot-toast';
import gatitoEnojado from '../assets/gatito_enojado.png';
import gatitoFeliz from '../assets/gatito_feliz.png';
import gatitoEstrellas from '../assets/gatito_estrellas.png';
import gatitoIman from '../assets/gatito_iman.png';
import gatitoCohete from '../assets/gatito_cohete.png';
import gatitoPatitaNo from '../assets/gatito_patita_no_tocar.png';

const GAME_DURATION = 30; // segundos
const SPAWN_INTERVAL = 800; // ms inicial
const MIN_SPAWN_INTERVAL = 300; // ms mínimo
const FALL_DURATION = 4; // segundos inicial
const MIN_FALL_DURATION = 2; // segundos mínimo
const POINTS_THRESHOLD = 150; // Puntos necesarios para ganar estrellas

const ITEM_TYPES = {
  HEART_RED: { image: gatitoFeliz, type: 'image', points: 5, probability: 0.5 },
  HEART_BROKEN: { image: gatitoPatitaNo, type: 'image', points: -10, probability: 0.2 },
  STAR: { image: gatitoEstrellas, type: 'image', points: 20, probability: 0.15 },
  BOMB: { image: gatitoEnojado, type: 'image', points: 'GAME_OVER', probability: 0.1 },
  MAGNET: { image: gatitoIman, type: 'image', points: 'POWER_UP_MAGNET', probability: 0.03 },
  CLOCK: { image: gatitoCohete, type: 'image', points: 'POWER_UP_TIME', probability: 0.02 },
};

export default function AtrapaCorazones({ onBack }) {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'playing', 'paused', 'gameOver'
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [fallingItems, setFallingItems] = useState([]);
  const [particles, setParticles] = useState([]);
  const [combo, setCombo] = useState(0);
  const [feverMode, setFeverMode] = useState(false);
  const [powerUps, setPowerUps] = useState({ magnet: 0, timeExtended: false });
  const [highScore, setHighScore] = useState(0);
  const [consecutiveGoodCatches, setConsecutiveGoodCatches] = useState(0);

  const gameAreaRef = useRef(null);
  const itemIdRef = useRef(0);
  const gameStartTimeRef = useRef(0); // Timestamp base para IDs únicos
  const spawnIntervalRef = useRef(null);
  const gameTimerRef = useRef(null);
  const fallSpeedRef = useRef(FALL_DURATION);
  const spawnRateRef = useRef(SPAWN_INTERVAL);
  const finalScoreRef = useRef(0);
  const rewardClaimedRef = useRef(false);
  const processedItemsRef = useRef(new Set());

  // Iniciar juego
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setFallingItems([]);
    setParticles([]);
    setCombo(0);
    setFeverMode(false);
    setPowerUps({ magnet: 0, timeExtended: false });
    setConsecutiveGoodCatches(0);
    fallSpeedRef.current = FALL_DURATION;
    spawnRateRef.current = SPAWN_INTERVAL;
    rewardClaimedRef.current = false;
    processedItemsRef.current.clear();
    itemIdRef.current = 0;
    gameStartTimeRef.current = Date.now(); // Nuevo timestamp base para este juego
  }, []);

  // Timer del juego
  useEffect(() => {
    if (gameState === 'playing') {
      gameTimerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, [gameState]);

  // Spawn de items
  useEffect(() => {
    if (gameState === 'playing') {
      const spawnItem = () => {
        const gameArea = gameAreaRef.current;
        if (!gameArea) return;

        const rect = gameArea.getBoundingClientRect();
        const itemSize = 120; // Tamaño aumentado de la imagen + padding de la burbuja
        const maxX = rect.width - itemSize;

        // Seleccionar tipo de item basado en probabilidades
        const rand = Math.random();
        let accumulatedProb = 0;
        let selectedType = null;

        for (const [key, value] of Object.entries(ITEM_TYPES)) {
          accumulatedProb += value.probability;
          if (rand <= accumulatedProb) {
            selectedType = { type: key, ...value };
            break;
          }
        }

        if (!selectedType) selectedType = { type: 'HEART_RED', ...ITEM_TYPES.HEART_RED };

        const newItem = {
          id: `item-${gameStartTimeRef.current}-${itemIdRef.current++}-${Math.random().toString(36).substr(2, 9)}`,
          x: Math.max(0, Math.random() * maxX),
          ...selectedType,
        };

        setFallingItems((prev) => [...prev, newItem]);

        // Incrementar dificultad gradualmente
        const progressPercent = 1 - timeLeft / GAME_DURATION;
        fallSpeedRef.current = Math.max(
          MIN_FALL_DURATION,
          FALL_DURATION - progressPercent * 2
        );
        const newSpawnRate = Math.max(
          MIN_SPAWN_INTERVAL,
          SPAWN_INTERVAL - progressPercent * 500
        );
        
        // Programar el próximo spawn con el nuevo intervalo
        if (spawnIntervalRef.current) {
          clearTimeout(spawnIntervalRef.current);
        }
        spawnIntervalRef.current = setTimeout(spawnItem, newSpawnRate);
      };

      spawnItem(); // Spawn inicial
    }

    return () => {
      if (spawnIntervalRef.current) {
        clearTimeout(spawnIntervalRef.current);
      }
    };
  }, [gameState, timeLeft]);

  // Limpiar items que salieron de la pantalla
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setFallingItems((prev) => prev.filter((item) => item.id !== -1));
    }, 100);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Efecto imán
  useEffect(() => {
    if (powerUps.magnet > 0 && gameState === 'playing') {
      const magnetInterval = setInterval(() => {
        setFallingItems((prev) =>
          prev.filter((item) => {
            if (item.type === 'HEART_RED' || item.type === 'STAR') {
              handleCatch(item, true);
              return false;
            }
            return true;
          })
        );
      }, 100);

      const magnetTimer = setTimeout(() => {
        setPowerUps((prev) => ({ ...prev, magnet: 0 }));
      }, 3000);

      return () => {
        clearInterval(magnetInterval);
        clearTimeout(magnetTimer);
      };
    }
  }, [powerUps.magnet, gameState]);

  // Fever mode
  useEffect(() => {
    if (consecutiveGoodCatches >= 5 && !feverMode) {
      setFeverMode(true);
      toast.success('🔥 ¡MODO FEVER! Puntos x2', {
        icon: '🔥',
        duration: 2000,
      });
      setTimeout(() => {
        setFeverMode(false);
        setConsecutiveGoodCatches(0);
      }, 5000);
    }
  }, [consecutiveGoodCatches, feverMode]);


  const createParticles = (x, y, color) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: `particle-${timestamp}-${random}-${i}`,
      x,
      y,
      angle: (i * 360) / 8,
      color,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1000);
  };

  const handleCatch = useCallback((item, isAutomatic = false) => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const rect = gameArea.getBoundingClientRect();
    const particleX = item.x + 30;
    const particleY = rect.height / 2;

    // Procesar puntos
    if (item.points === 'GAME_OVER') {
      createParticles(particleX, particleY, '#ef4444');
      toast.error('😾 ¡Plutón está muy enojado! Game Over', { icon: '🙀' });
      endGame();
      return;
    }

    if (item.points === 'POWER_UP_MAGNET') {
      setPowerUps((prev) => ({ ...prev, magnet: prev.magnet + 1 }));
      createParticles(particleX, particleY, '#8b5cf6');
      toast.success('🧲 ¡Plutón activó el imán por 3 segundos!', { icon: '✨', duration: 2000 });
      setConsecutiveGoodCatches((prev) => prev + 1);
      return;
    }

    if (item.points === 'POWER_UP_TIME') {
      if (!powerUps.timeExtended) {
        setTimeLeft((prev) => prev + 5);
        setPowerUps((prev) => ({ ...prev, timeExtended: true }));
        createParticles(particleX, particleY, '#f59e0b');
        toast.success('🚀 ¡Plutón despegó! +5 segundos extra', { icon: '⏱️', duration: 2000 });
        setConsecutiveGoodCatches((prev) => prev + 1);
      }
      return;
    }

    // Puntos normales
    let points = item.points;
    
    if (points > 0) {
      if (feverMode) points *= 2;
      setConsecutiveGoodCatches((prev) => prev + 1);
      setCombo((prev) => prev + 1);
      createParticles(particleX, particleY, points > 10 ? '#fbbf24' : '#ec4899');
    } else {
      setConsecutiveGoodCatches(0);
      setCombo(0);
      createParticles(particleX, particleY, '#6b7280');
    }

    setScore((prev) => Math.max(0, prev + points));

    // Toast feedback
    if (!isAutomatic) {
      if (points > 10) {
        toast.success(`+${points} puntos! ✨`, { duration: 1000 });
      } else if (points > 0) {
        toast.success(`+${points}`, { duration: 800 });
      } else {
        toast.error(`${points}`, { duration: 800 });
      }
    }
  }, [feverMode, powerUps.timeExtended]);

  // Actualizar el ref cuando cambie el score
  useEffect(() => {
    finalScoreRef.current = score;
  }, [score]);

  const endGame = async () => {
    // Capturar el score actual antes de cambiar el estado
    const currentScore = finalScoreRef.current;
    
    setGameState('gameOver');
    
    if (spawnIntervalRef.current) clearTimeout(spawnIntervalRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);

    setFallingItems([]);

    if (currentScore > highScore) {
      setHighScore(currentScore);
      toast.success('🏆 ¡Nuevo récord personal!', { icon: '👑', duration: 3000 });
    }

    // Dar estrellas si alcanzó el objetivo (usando el mismo endpoint que MiniJuego)
    console.log('Puntuación final:', currentScore, 'Umbral:', POINTS_THRESHOLD, 'Cumple objetivo:', currentScore >= POINTS_THRESHOLD);
    
    // Verificar si ya se reclamó la recompensa para evitar duplicados
    if (currentScore >= POINTS_THRESHOLD && !rewardClaimedRef.current) {
      rewardClaimedRef.current = true; // Marcar como reclamado ANTES de hacer la llamada
      
      try {
        console.log('Llamando a completarJuego()...');
        const response = await completarJuego();
        console.log('Respuesta del servidor:', response.data);
        toast.success('¡Ganaste 15⭐ por alcanzar el objetivo!', {
          icon: '🎉',
          duration: 4000,
        });
      } catch (error) {
        console.error('Error completo al dar estrellas:', error);
        console.error('Detalles del error:', error.response?.data || error.message);
        toast.error('Error al otorgar estrellas: ' + (error.response?.data?.detail || error.message));
        rewardClaimedRef.current = false; // Resetear si hubo error para poder reintentar
      }
    } else if (currentScore >= POINTS_THRESHOLD && rewardClaimedRef.current) {
      console.log('Recompensa ya reclamada, evitando duplicado');
    } else {
      console.log('No se alcanzó el umbral. Necesitas', POINTS_THRESHOLD - currentScore, 'puntos más');
    }
  };

  const handleItemClick = (item) => {
    if (gameState !== 'playing') return;
    
    // Evitar procesamiento duplicado
    if (processedItemsRef.current.has(item.id)) return;
    processedItemsRef.current.add(item.id);
    
    // Limpiar items antiguos del Set cada 2 segundos
    setTimeout(() => {
      processedItemsRef.current.delete(item.id);
    }, 2000);
    
    // Crear efecto de partículas inmediatamente
    const gameArea = gameAreaRef.current;
    if (gameArea) {
      const rect = gameArea.getBoundingClientRect();
      const particleX = item.x + 60;
      const particleY = rect.height / 2;
      createParticles(particleX, particleY, '#ec4899');
    }
    
    // Remover INMEDIATAMENTE del array para que desaparezca al instante
    setFallingItems((prev) => prev.filter((i) => i.id !== item.id));
    
    // Procesar la captura inmediatamente
    handleCatch(item);
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-pink-300 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-5xl opacity-20"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: -50,
                rotate: 0,
                scale: 1
              }}
              animate={{ 
                y: window.innerHeight + 100,
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "linear"
              }}
            >
              {['💝', '✨', '💕', '⭐'][i % 4]}
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
                ¡Atrapa a Plutoncito!
              </h1>
              <p className="text-white/90 text-sm mt-1">
                ¡Atrapa a Plutón en sus mejores momentos! 🐱✨
              </p>
            </div>
          </motion.div>

          {/* Título del juego */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 mb-6 text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-4"
            >
              💝
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
              ¡Atrapa a Plutoncito!
            </h2>
            <p className="text-gray-600 mb-2">
              ¡Atrapa a Plutón feliz y evita a Plutón enojado!
            </p>
            {highScore > 0 && (
              <div className="mt-4 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-3">
                <p className="text-sm text-gray-600">Tu mejor puntuación</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  {highScore} puntos
                </p>
              </div>
            )}
          </motion.div>

          {/* Instrucciones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/95 backdrop-blur rounded-3xl shadow-xl p-6 mb-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-pink-500" />
              ¿Cómo Jugar?
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-pink-50 rounded-xl p-3">
                <img src={gatitoFeliz} alt="Plutón feliz" className="w-12 h-12 object-contain" />
                <div className="flex-1">
                  <p className="font-semibold text-pink-700">Plutón Feliz</p>
                  <p className="text-sm text-gray-600">+5 puntos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-yellow-50 rounded-xl p-3">
                <img src={gatitoEstrellas} alt="Plutón con estrellas" className="w-12 h-12 object-contain" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-700">Plutón con Estrellas</p>
                  <p className="text-sm text-gray-600">+20 puntos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-3">
                <img src={gatitoIman} alt="Plutón imán" className="w-12 h-12 object-contain" />
                <div className="flex-1">
                  <p className="font-semibold text-purple-700">Plutón Imán (Power-up)</p>
                  <p className="text-sm text-gray-600">Atrae Plutones felices 3 seg</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-3">
                <img src={gatitoCohete} alt="Plutón cohete" className="w-12 h-12 object-contain" />
                <div className="flex-1">
                  <p className="font-semibold text-orange-700">Plutón Cohete (Power-up)</p>
                  <p className="text-sm text-gray-600">+5 segundos extra</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <img src={gatitoPatitaNo} alt="Plutón patita no" className="w-12 h-12 object-contain" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-700">Plutón Patita "No Tocar"</p>
                  <p className="text-sm text-gray-600">-10 puntos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-red-50 rounded-xl p-3">
                <img src={gatitoEnojado} alt="Plutón enojado" className="w-12 h-12 object-contain" />
                <div className="flex-1">
                  <p className="font-semibold text-red-700">¡Plutón Enojado!</p>
                  <p className="text-sm text-gray-600">¡Game Over inmediato!</p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4">
              <p className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                ¡Modo Fever de Plutón!
              </p>
              <p className="text-sm text-gray-700">
                ¡Atrapa 5 Plutones buenos seguidos para activar el modo fever (puntos x2 por 5 segundos)!
              </p>
            </div>

            <div className="mt-4 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-4">
              <p className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Objetivo
              </p>
              <p className="text-sm text-gray-700">
                ¡Alcanza {POINTS_THRESHOLD} puntos para ganar 15⭐!
              </p>
            </div>
          </motion.div>

          {/* Botón de inicio */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-bold py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center gap-3 text-xl relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
            />
            <Play className="w-8 h-8" />
            <span className="relative z-10">¡Jugar Ahora!</span>
          </motion.button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    const earnedStars = score >= POINTS_THRESHOLD;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-pink-300 relative overflow-hidden flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 10 }}
            className="text-center mb-6"
          >
            <div className="text-8xl mb-4">
              {earnedStars ? '🏆' : '🐱'}
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
              {earnedStars ? '¡Increíble!' : '¡Buen Intento!'}
            </h2>
            <p className="text-gray-600">
              {earnedStars 
                ? '¡Atrapaste a muchos Plutones felices!' 
                : 'Sigue intentando, ¡Plutón confía en ti!'}
            </p>
          </motion.div>

          {/* Puntuación final */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 mb-6"
          >
            <p className="text-sm text-gray-600 text-center mb-2">Puntuación Final</p>
            <p className="text-5xl font-bold text-center bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {score}
            </p>
            {score === highScore && score > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="mt-3 flex items-center justify-center gap-2 bg-yellow-100 rounded-xl px-3 py-2"
              >
                <Crown className="w-5 h-5 text-yellow-600" />
                <p className="text-sm font-bold text-yellow-700">¡Nuevo Récord!</p>
              </motion.div>
            )}
          </motion.div>

          {/* Recompensa */}
          {earnedStars && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-4 mb-6 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                <p className="font-bold text-yellow-700">¡Recompensa Desbloqueada!</p>
                <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">+15 ⭐</p>
            </motion.div>
          )}

          {!earnedStars && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-50 rounded-2xl p-4 mb-6 text-center"
            >
              <p className="text-sm text-gray-600">
                Necesitas {POINTS_THRESHOLD - score} puntos más para ganar estrellas
              </p>
              <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((score / POINTS_THRESHOLD) * 100, 100)}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-full"
                />
              </div>
            </motion.div>
          )}

          {/* Botones */}
          <div className="space-y-3">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Jugar de Nuevo
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="w-full bg-white text-gray-700 font-semibold py-4 rounded-2xl shadow-md hover:shadow-lg transition-all border-2 border-gray-200"
            >
              Volver al Inicio
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Pantalla de juego
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-400 to-pink-300 relative overflow-hidden">
      {/* Área de juego */}
      <div
        ref={gameAreaRef}
        className="relative w-full h-screen overflow-hidden"
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        {/* Header de juego */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4">
          <div className="flex items-center justify-between mb-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 backdrop-blur rounded-2xl shadow-lg px-4 py-2"
            >
              <p className="text-sm text-gray-600">Tiempo</p>
              <p className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-pink-600'}`}>
                {timeLeft}s
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 backdrop-blur rounded-2xl shadow-lg px-4 py-2"
            >
              <p className="text-sm text-gray-600">Puntos</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {score}
              </p>
            </motion.div>
          </div>

          {/* Indicadores de power-ups y combo */}
          <div className="flex gap-2">
            {powerUps.magnet > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"
              >
                <span>🧲</span>
                <span>Imán Activo</span>
              </motion.div>
            )}

            {feverMode && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1"
              >
                <Zap className="w-4 h-4" />
                <span>FEVER x2</span>
              </motion.div>
            )}

            {combo > 1 && !feverMode && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold"
              >
                Combo x{combo}
              </motion.div>
            )}
          </div>
        </div>

        {/* Items cayendo */}
        <AnimatePresence>
          {fallingItems.map((item) => (
            <motion.button
              key={item.id}
              layout={false}
              initial={{ y: -100, opacity: 1, scale: 1 }}
              animate={{ 
                y: window.innerHeight + 100, 
                opacity: 1,
                scale: 1
              }}
              exit={{ 
                opacity: 0, 
                scale: 0,
                rotate: 180
              }}
              transition={{
                duration: fallSpeedRef.current,
                ease: "linear",
                exit: { duration: 0.05, ease: "easeOut" }
              }}
              className="cursor-pointer select-none"
              style={{
                position: 'absolute',
                left: item.x,
                top: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                borderRadius: '50%',
                boxShadow: '0 8px 32px rgba(236, 72, 153, 0.2), inset 0 0 30px rgba(255, 255, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5)',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                WebkitTapHighlightColor: 'transparent',
                willChange: 'transform',
              }}
              onClick={() => handleItemClick(item)}
              onTouchEnd={() => handleItemClick(item)}
              whileTap={{ scale: 0, opacity: 0, rotate: 180, transition: { duration: 0.05 } }}
            >
              <motion.div
                layout={false}
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
                className="flex items-center justify-center p-4"
              >
                {item.type === 'image' ? (
                  <img 
                    src={item.image} 
                    alt="Plutón"
                    className="w-24 h-24 object-contain pointer-events-none"
                    draggable="false"
                  />
                ) : (
                  <span className="text-7xl pointer-events-none">{item.emoji}</span>
                )}
              </motion.div>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Partículas */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: particle.x,
                y: particle.y,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: particle.x + Math.cos((particle.angle * Math.PI) / 180) * 100,
                y: particle.y + Math.sin((particle.angle * Math.PI) / 180) * 100,
                scale: 0,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute w-3 h-3 rounded-full pointer-events-none"
              style={{ backgroundColor: particle.color }}
            />
          ))}
        </AnimatePresence>

        {/* Zona de captura (visual feedback) */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-pink-300/30 to-transparent pointer-events-none flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white/50 text-sm font-bold"
          >
            ⬆️ Toca aquí arriba para atrapar ⬆️
          </motion.div>
        </div>
      </div>
    </div>
  );
}
