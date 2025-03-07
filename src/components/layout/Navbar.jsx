import { Link, useLocation } from 'react-router-dom'
import SearchBar from '../ui/SearchBar'
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
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white'
        }`}>
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors"
                            aria-label="Home"
                        >
                            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                Ollama.Net
                            </span>
                        </Link>

                        <div className="hidden md:block">
                            <SearchBar />
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative px-3 py-2 text-sm font-medium transition-all ${
                                    isActive(item.path)
                                        ? 'text-gray-900'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {item.name}
                                {isActive(item.path) && (
                                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-gray-300 rounded-lg" />
                                )}
                            </Link>
                        ))}
                        <button
                            className="ml-4 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                            aria-label="Sign in"
                        >
                            Sign in
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                    <div className="md:hidden py-4 border-t border-gray-100">
                        <div className="mb-4">
                            <SearchBar />
                        </div>
                        <div className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                                        isActive(item.path)
                                            ? 'text-gray-900 bg-gray-50'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <button
                                className="mt-2 w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Sign in
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar