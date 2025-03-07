import Navbar from './Navbar'

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        {children}
      </main>
    </div>
  )
}

export default Layout