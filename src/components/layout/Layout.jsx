import Navbar from './Navbar'
import Footer from './Footer'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col w-full overflow-x-hidden">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 flex-grow w-full max-w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout