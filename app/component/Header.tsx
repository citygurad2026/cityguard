import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  Tag, 
  LogOut,
  ChevronDown,
  Building2,
  Calendar,
  Briefcase,
  Users,
  Droplet,
  Trophy,
  MapPin,
  Home,
  Settings2,
  UserRoundSearch,
  BookUser,
  UserStarIcon,
  BriefcaseBusiness,
  SettingsIcon
} from 'lucide-react';

import logo from '@/public/logo.png';
import Axios from '../utilts/Axios';
import SummaryApi from '../common/SummaryApi';
import { RootState } from '../store/store';
import { setCredentials, clearSession } from '../store/userSlice';

// الأنواع
interface Category {
  id: number;
  name: string;
  slug: string;
  businessCount?: number;
}

interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  dropdown?: Array<{
    name: string;
    href: string;
    count?: number;
  }>;
}

interface UserRole {
  isAdmin: boolean;
  isOwner: boolean;
  isUser: boolean;
  hasSpecialAccess: boolean;
}

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  const user = useSelector((state: RootState) => state.user.user);
  
  // تحديد أدوار المستخدم
  const getUserRole = useCallback((): UserRole => {
    const role = user?.role?.toLowerCase() || '';
    return {
      isAdmin: role === 'admin',
      isOwner: role === 'owner',
      isUser: role === 'user',
      hasSpecialAccess: role === 'admin' || role === 'owner' || role === 'moderator'
    };
  }, [user]);

  const userRole = getUserRole();

  // عناصر التنقل
  const navItems: NavItem[] = [
    { name: 'الرئيسية', href: '/',  },
    { 
      name: 'الفئات', 
      href: '#', 
      dropdown: categories.slice(0, 8).map(cat => ({
        name: cat.name,
        href: `/category/${cat.slug}`,
        count: cat.businessCount || 0
      }))
    },
    { name: 'الأحداث', href: '/events'},
    { name: 'الوظائف', href: '/jobs' },
    { name: 'المحترفين', href: '/professionals' },
    { name: 'التبرع بالدم', href: '/blood-requests'},
    { name: 'المسابقات', href: '/competitions'},
  
  ];

  // جلب الفئات
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await Axios({
        ...SummaryApi.category.get_categories
      });

      if (response.data?.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // تسجيل الخروج
  const handleLogout = async () => {
    try {
      await Axios({ ...SummaryApi.user.logout });
      
      dispatch(clearSession());
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        sessionStorage.clear();
      }
      
      router.replace('/');
      setIsOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // التعامل مع الأحداث
  const handleDropdownEnter = (itemName: string) => {
    setActiveDropdown(itemName);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  // التأثيرات
  useEffect(() => {
    fetchCategories();
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      dispatch(setCredentials({ user: JSON.parse(storedUser) }));
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dispatch, fetchCategories, isOpen]);

  // إغلاق القائمة عند تغيير المسار
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [router]);

  // مكونات فرعية
  const renderLogo = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center space-x-2"
    >
      <Link href="/" className="inline-flex ml-15 items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg">
        <Image
          src={logo}
          alt="شعار دليل المدينة"
          width={40}
          height={32}
          className="w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 hover:scale-110"
          priority
        />
        <span className="text-lg md:text-xl font-medium  bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-gradient">
          دليل المدينة
        </span>
      </Link>
    </motion.div>
  );

  const renderDesktopNav = () => (
    <nav className="hidden md:flex items-center  lg:space-x-1">
      {navItems.map((item) => (
        <div
          key={item.name}
          className="relative"
          onMouseEnter={() => item.dropdown && handleDropdownEnter(item.name)}
          onMouseLeave={handleDropdownLeave}
          ref={item.dropdown ? dropdownRef : undefined}
        >
          {item.dropdown ? (
            <button
              className="flex items-center space-x-1 text-white/80 hover:text-white transition-all duration-200 font-medium text-sm lg:text-base  py-2 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-expanded={activeDropdown === item.name}
              aria-haspopup="true"
            >
              <span>{item.name}</span>
              <ChevronDown 
                className={`w-4 h-4 transition-transform duration-200 ${
                  activeDropdown === item.name ? 'rotate-180' : ''
                }`} 
              />
            </button>
          ) : (
            <Link
              href={item.href}
              className="flex items-center space-x-1 text-white/80 hover:text-white transition-all duration-200 font-medium text-sm lg:text-base px-3 py-2 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {item.icon && <span className="hidden lg:inline">{item.icon}</span>}
              <span>{item.name}</span>
            </Link>
          )}

          {item.dropdown && activeDropdown === item.name && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-2">
                {item.dropdown.map((subItem) => (
                  <Link
                    key={subItem.name}
                    href={subItem.href}
                    className="flex items-center justify-between px-4 py-3 text-sm text-white/90 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 group"
                  >
                    <span className="truncate">{subItem.name}</span>
                    {subItem.count !== undefined && (
                      <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                        {subItem.count}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </nav>
  );

  const renderUserActions = () => {
    if (user) {
      return (
        <div className="hidden md:flex items-center space-x-3">
          {userRole.hasSpecialAccess && (
            <Link
              href={userRole.isAdmin ? '/AdminController' : '/Owner'}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl px-4 py-2.5 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <span className="text-sm font-medium text-white">
                < SettingsIcon className='w-4 h-4'/>
              </span>
            </Link>
          )}

          

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200 border border-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
           
          </motion.button>
        </div>
      );
    }

    return (
      <Link
        href="/Login"
        className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl px-2 py-2 transition-all duration-200 shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <span className=" text-white"><User className="w-5 h-5" size={30}/></span>
      </Link>
    );
  };

  const renderMobileMenu = () => (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black z-40 lg:hidden"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            ref={mobileMenuRef}
            className="fixed top-0 right-0 w-80 h-full z-50 md:hidden bg-gradient-to-b from-slate-900 to-slate-800 backdrop-blur-xl border-l border-white/10 p-6 flex flex-col"
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-label="القائمة الجوالية"
          >
            <div className="flex items-center justify-between mb-8 pt-2 border-b border-white/10 pb-6">
              <div className="flex items-center space-x-3">
                <Image src={logo} alt="شعار دليل المدينة" width={32} height={26} />
                <span className="text-lg font-bold text-white">دليل المدينة</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-red-500/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="إغلاق القائمة"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <nav className="space-y-1 mb-6 flex-1 overflow-y-auto">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {item.dropdown ? (
                    <details className="group">
                      <summary className="flex items-center justify-between px-4 py-3 text-white/90 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-all duration-200 list-none">
                        <div className="flex items-center space-x-2">
                          {item.icon}
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <div className="mt-1 ml-4 space-y-1">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                          >
                            <span>{subItem.name}</span>
                            {subItem.count !== undefined && (
                              <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                                {subItem.count}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-white/90 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 text-right focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      {item.icon}
                      <span className="font-medium flex-1 text-right">{item.name}</span>
                    </button>
                  )}
                </motion.div>
              ))}
            </nav>

            <div className="border-t border-white/10 pt-6 space-y-3">
              {user ? (
                <>
                  <button
                    onClick={() => handleNavigation('/Profile')}
                    className="flex items-center space-x-2 w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium text-white">الملف الشخصي</span>
                  </button>
                  
                  {userRole.hasSpecialAccess && (
                    <button
                      onClick={() => handleNavigation(userRole.isAdmin ? '/AdminController' : '/Owner')}
                      className="flex items-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium text-white">
                        {userRole.isAdmin ? 'إدارة النظام' : 'إدارة الحساب'}
                      </span>
                    </button>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200 border border-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">تسجيل الخروج</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleNavigation('/Login')}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <span className="font-medium text-white">تسجيل الدخول</span>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300  ${
        isScrolled
          ? "bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
          : "bg-gradient-to-b from-black/50 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20 min-h-[64px] md:min-h-[80px]">
          {renderLogo()}

          {renderDesktopNav()}

          <div className="flex items-center gap-4">
            {renderUserActions()}

            <div className="md:hidden flex items-center gap-2">
             

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen((v) => !v)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-yellow-500"
                aria-expanded={isOpen}
                aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {renderMobileMenu()}
    </header>
  );
}

// إضافة الأنماط للـ gradient المتحرك
const styles = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
  }
`;

// إضافة الأنماط إلى head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}