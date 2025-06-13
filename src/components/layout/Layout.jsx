import Navbar from './Navbar'
import Footer from './Footer'
import { useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
  const location = useLocation()
  const isChat = location.pathname === '/chat'

  return (
    <div className="min-h-screen bg-white flex flex-col w-full overflow-x-hidden">
      <Navbar />
      <main 
        className={`container mx-auto px-4 flex-grow w-full max-w-full transition-all duration-300 
          ${isChat ? 'pb-0 pt-20' : 'pt-24'}`}
      >
        {children}
      </main>
      {!isChat && <Footer />}
    </div>
  )
}

export default Layout