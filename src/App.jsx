import { BrowserRouter as Router } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/layout/Layout'
import AppRoutes from './routes'
import { AuthProvider } from './context/AuthContext'
import { ConversationProvider } from './context/ConversationContext'

const App = () => {
  //prevent transition flashes
  useEffect(() => {
    // Remove transitions during initial load
    document.documentElement.classList.add('no-transition');
    
    // Remove the class
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Router>
      <AuthProvider>
        <ConversationProvider>
          <Layout>
            <AppRoutes />
          </Layout>
        </ConversationProvider>
      </AuthProvider>
    </Router>
  )
}

export default App