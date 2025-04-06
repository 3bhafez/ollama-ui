import { BrowserRouter as Router } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AppRoutes from './routes'
import { AuthProvider } from './context/AuthContext'

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </AuthProvider>
    </Router>
  )
}

export default App