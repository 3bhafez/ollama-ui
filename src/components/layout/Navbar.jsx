import { Link, useLocation } from 'react-router-dom'
import { FiMenu, FiX } from 'react-icons/fi'
import { useState, useEffect } from 'react'

const Navbar = () => {
    const location = useLocation()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const navItems = [
        { name: 'Models', path: '/models' },
        { name: 'Chat', path: '/chat' },
    ]

    const isActive = (path) => location.pathname === path

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
            <nav className={`transition-all duration-300 rounded-xl mx-auto max-w-7xl ${
                isScrolled 
                    ? 'bg-white/50 backdrop-blur-md shadow-lg' 
                    : 'bg-white/80 backdrop-blur-sm shadow-md'
            }`}>
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
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

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        isActive(item.path)
                                            ? 'text-indigo-600'
                                            : 'text-gray-600 hover:text-indigo-600'
                                    }`}
                                >
                                    {item.name}
                                    {isActive(item.path) && (
                                        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-indigo-500 rounded-full" />
                                    )}
                                </Link>
                            ))}
                            <button
                                className="ml-4 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md"
                                aria-label="Sign in"
                            >
                                Sign in
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <FiX className="h-6 w-6" />
                            ) : (
                                <FiMenu className="h-6 w-6" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-4 mt-2 border-t border-gray-100">
                            <div className="flex flex-col gap-2">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                            isActive(item.path)
                                                ? 'text-indigo-600 bg-indigo-50'
                                                : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <button
                                    className="mt-2 w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:opacity-90 transition-all"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sign in
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>
        </div>
    )
}

export default Navbar