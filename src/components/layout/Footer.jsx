import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-white border-t border-gray-100 py-4 mt-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo */}
          <div className="mb-4 md:mb-0">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors"
              aria-label="Home"
            >
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Ollama.Net
              </span>
            </Link>
          </div>
          
          {/* Copyright */}
          <div className="text-sm text-gray-500">
            © {currentYear} Ollama.Net. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
