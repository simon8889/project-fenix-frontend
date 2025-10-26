import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Estado general
export const getEstado = () => api.get('/estado');

// Puntos de consideración
export const darPunto = () => api.post('/dar-punto');

// Cartas
export const getCartas = () => api.get('/cartas');
export const leerCarta = (cartaId) => api.post(`/leer-carta/${cartaId}`);

// Razones
export const getRazones = () => api.get('/razones');

// Premios
export const getPremios = () => api.get('/premios');
export const reclamarPremio = (premioId) => 
  api.post('/reclamar-premio', { premio_id: premioId });

// Juego
export const completarJuego = () => api.post('/completar-juego');

// Canciones
export const getCanciones = () => api.get('/canciones');
export const escucharCancion = () => api.post('/escuchar-cancion');

// Frases
export const getFraseAleatoria = () => api.get('/frases/aleatoria');

export default api;