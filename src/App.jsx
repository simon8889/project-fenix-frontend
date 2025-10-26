import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import Cartas from './components/Cartas';
import Razones from './components/Razones';
import Tienda from './components/Tienda';
import MiniJuego from './components/MiniJuego';

function App() {
  const [vistaActual, setVistaActual] = useState('dashboard');

  const renderVista = () => {
    switch (vistaActual) {
      case 'dashboard':
        return <Dashboard onNavigate={setVistaActual} />;
      case 'cartas':
        return <Cartas onBack={() => setVistaActual('dashboard')} />;
      case 'razones':
        return <Razones onBack={() => setVistaActual('dashboard')} />;
      case 'tienda':
        return <Tienda onBack={() => setVistaActual('dashboard')} />;
      case 'juego':
        return <MiniJuego onBack={() => setVistaActual('dashboard')} />;
      default:
        return <Dashboard onNavigate={setVistaActual} />;
    }
  };

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#ec4899',
              secondary: '#fff',
            },
          },
        }}
      />
      {renderVista()}
    </>
  );
}

export default App;
