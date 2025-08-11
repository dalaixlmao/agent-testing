import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TodoDetailPage = lazy(() => import('./pages/TodoDetailPage'));
const CreateTodoPage = lazy(() => import('./pages/CreateTodoPage'));
const EditTodoPage = lazy(() => import('./pages/EditTodoPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/todos" replace />} />
            <Route 
              path="/todos" 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/todos/new" 
              element={
                <PrivateRoute>
                  <CreateTodoPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/todos/:id" 
              element={
                <PrivateRoute>
                  <TodoDetailPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/todos/:id/edit" 
              element={
                <PrivateRoute>
                  <EditTodoPage />
                </PrivateRoute>
              } 
            />
          </Route>
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;