import { Link, Navigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { Shield, Lock, Key, User, Moon, Sun, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Home = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  // Si el usuario ya está autenticado, redirigir a /profile
  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const features = [
    {
      icon: <Shield size={32} className="text-primary-600 dark:text-primary-400" />,
      title: 'Autenticación Segura',
      description: 'Sistema de autenticación robusto con JWT, cookies httpOnly y protección CSRF.'
    },
    {
      icon: <Lock size={32} className="text-primary-600 dark:text-primary-400" />,
      title: 'Encriptación',
      description: 'Contraseñas hasheadas con bcrypt (salt 12) y tokens seguros en producción.'
    },
    {
      icon: <Key size={32} className="text-primary-600 dark:text-primary-400" />,
      title: 'Validación Completa',
      description: 'Validación en cliente y servidor con express-validator y zod.'
    },
    {
      icon: <User size={32} className="text-primary-600 dark:text-primary-400" />,
      title: 'Gestión de Usuario',
      description: 'Sistema completo de registro, login, logout y rutas protegidas.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">MERN Auth</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? (
                  <Sun size={20} className="text-gray-700 dark:text-gray-200" />
                ) : (
                  <Moon size={20} className="text-gray-700" />
                )}
              </button>
              <Link to="/login">
                <Button variant="secondary">Iniciar Sesión</Button>
              </Link>
              <Link to="/register">
                <Button>Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 dark:bg-primary-500 rounded-full mb-6">
            <Shield className="text-white" size={40} />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            MERN Authentication
            <span className="block text-primary-600 dark:text-primary-400">Boilerplate</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Sistema de autenticación completo y seguro con las mejores prácticas de la industria.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button className="text-lg px-8 py-3">
                Comenzar Gratis
                <ArrowRight size={20} className="ml-2 inline" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="text-lg px-8 py-3">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            Características principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card hover:shadow-xl transition-shadow duration-300"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Prueba el sistema de autenticación y comienza a construir tu aplicación.
          </p>
          <Link to="/register">
            <Button className="text-lg px-8 py-3">
              Crear una cuenta
              <ArrowRight size={20} className="ml-2 inline" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>&copy; 2024 MERN Auth Boilerplate. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
