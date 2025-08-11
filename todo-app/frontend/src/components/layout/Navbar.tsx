import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-primary-700 text-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">Todo App</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {isAuthenticated && (
              <>
                <Link
                  to="/todos"
                  className="text-gray-100 hover:text-white px-3 py-2"
                >
                  My Todos
                </Link>
                <Link
                  to="/todos/new"
                  className="bg-primary-600 hover:bg-primary-800 text-white px-4 py-2 rounded-md"
                >
                  Add Todo
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex md:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span>Hello, {user?.name}</span>
                <button
                  onClick={logout}
                  className="text-gray-100 hover:text-white px-3 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-gray-100 hover:text-white px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-800 text-white px-4 py-2 rounded-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-100 hover:text-white hover:bg-primary-600"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-primary-600">
            {isAuthenticated && (
              <>
                <Link
                  to="/todos"
                  className="block px-3 py-2 text-white hover:bg-primary-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Todos
                </Link>
                <Link
                  to="/todos/new"
                  className="block px-3 py-2 text-white hover:bg-primary-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Add Todo
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-gray-100">
                  Hello, {user?.name}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-white hover:bg-primary-600 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-white hover:bg-primary-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-white hover:bg-primary-600 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;