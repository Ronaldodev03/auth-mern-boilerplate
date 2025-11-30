import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Calendar, Shield, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '../components/common/Button';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
      navigate('/');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">MERN Auth</h1>
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="text-primary-600 dark:text-primary-400 font-medium"
              >
                Perfil
              </Link>
              <Link
                to="/settings"
                className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Configuración
              </Link>
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
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut size={18} />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 dark:bg-primary-500 rounded-full mb-4">
            <User className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            ¡Bienvenido, {user?.username}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Has iniciado sesión exitosamente
          </p>
        </div>

        {/* Profile Card */}
        <div className="card max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Información de tu cuenta
          </h2>

          <div className="space-y-4">
            {/* Username */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <User size={24} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre de usuario</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {user?.username}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <Mail size={24} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Correo electrónico</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <Calendar size={24} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Miembro desde</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30">
                <Shield size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">Estado de la cuenta</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Activa
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="card max-w-2xl mx-auto mt-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Siguiente paso
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Este es un boilerplate de autenticación. Ahora puedes empezar a construir tu aplicación sobre esta base segura.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>Tip:</strong> Agrega tus propias rutas y páginas protegidas usando el componente {' '}
              <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded text-xs">
                &lt;ProtectedRoute&gt;
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
