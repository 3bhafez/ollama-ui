import { Link, useLocation } from 'react-router-dom'
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const Navbar = () => {
    const location = useLocation()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const { user, logout, isAuthenticated } = useAuth()

    // Always visible navigation items
    const publicNavItems = [
        { name: 'Models', path: '/models' },
    ];

    // Navigation items only for authenticated users
    const authenticatedNavItems = [
        { name: 'Chat', path: '/chat' },
    ];

    // which nav items to show
    const navItems = isAuthenticated() 
        ? [...publicNavItems, ...authenticatedNavItems] 
        : publicNavItems;

    const isActive = (path) => location.pathname === path

    // Get user initials
    const getUserInitials = () => {
        if (!user || !user.username) return '';
        
        return user.username.substring(0, 2);
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        await logout();
        setShowUserMenu(false);
    }

    // Close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserMenu && !event.target.closest('.user-menu-container')) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

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
                            
                            {isAuthenticated() ? (
                                <div className="relative ml-4 user-menu-container">
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-indigo-600 border border-gray-200 hover:border-indigo-400 transition-colors"
                                        aria-label="User menu"
                                        aria-expanded={showUserMenu}
                                        aria-haspopup="true"
                                    >
                                        {getUserInitials()}
                                    </button>
                                    
                                    {/* User dropdown menu */}
                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
                                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                aria-label="Sign out"
                                            >
                                                <FiLogOut className="h-4 w-4" />
                                                Sign out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="ml-4 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md"
                                    aria-label="Sign in"
                                >
                                    Sign in
                                </Link>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                type="button"
                                className="p-2 rounded-lg text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={isMobileMenuOpen}
                            >
                                {isMobileMenuOpen ? (
                                    <FiX className="h-6 w-6" />
                                ) : (
                                    <FiMenu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden px-6 py-4 border-t border-gray-100">
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
                            
                            {isAuthenticated() ? (
                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <div className="px-4 py-2 flex items-center gap-3">
                                        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-indigo-600 border border-gray-200 shadow-sm">
                                            {getUserInitials()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full mt-2 flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                                        aria-label="Sign out"
                                    >
                                        <FiLogOut className="h-4 w-4" />
                                        Sign out
                                    </button>
                                </div>
                            ) : (
                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <Link
                                        to="/login"
                                        className="w-full px-4 py-2 text-sm font-medium text-center text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:opacity-90 transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Sign in
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </div>
    )
}

export default Navbar