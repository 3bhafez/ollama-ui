import { Routes, Route, Navigate } from 'react-router-dom'
import Models from '../pages/Models'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Chat from '../pages/Chat'
import ModelInfo from '../pages/ModelInfo'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import { useAuth } from '../context/AuthContext'

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated() ? <Navigate to="/" replace /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated() ? <Navigate to="/" replace /> : <Register />
      } />

      {/* Public access to Models page */}
      <Route path="/models" element={<Models />} />
      <Route path="/model/:modelName" element={<ModelInfo />} />
      <Route path="/" element={<Navigate to="/models" replace />} />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      {/* redirect to models page */}
      <Route path="*" element={<Navigate to="/models" replace />} />
    </Routes>
  )
}

export default AppRoutes