import { Routes, Route, Navigate } from 'react-router-dom'
import Models from '../pages/Models'


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/models" replace />} />
      <Route path="/models" element={<Models />} />
    </Routes>
  )
}

export default AppRoutes