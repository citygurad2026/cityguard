"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Axios from "../utilts/Axios";
import { toast } from "react-hot-toast";

import SummaryApi from "../common/SummaryApi";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  MapPin, 
  DollarSign,
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  Sparkles,
  TrendingUp,
  Users,
  MessageCircle,
  Phone,
  Heart,
  Share2,
  Clock3,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Job {
  id: number;
  title: string;
  description?: string;
  city?: string;
  region?: string;
  type?: string;
  salary?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  business: {
    id: number;
    name: string;
    phone?: string;
    city?: string;
  };
}

interface Filters {
  categories: string[];
  cities: string[];
  regions: string[];
}

interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function JobsPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filters, setFilters] = useState<Filters>({ 
    categories: [], 
    cities: [], 
    regions: []
  });
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pages: 1,
    limit: 12,
    hasNext: false,
    hasPrev: false
  });
  const [openJob, setOpenJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);
  const [savedJobs, setSavedJobs] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load saved jobs from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
  }, []);

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      
      const params: any = {
        page,
        limit: pagination.limit,
        sortBy,
        sortOrder
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCity) params.city = selectedCity;
      if (selectedType) params.type = selectedType;
      if (selectedRegion) params.region = selectedRegion;

      const response = await Axios({
        ...SummaryApi.job.getAllJobs,
        params
      });

      if (response.data.success) {
        setJobs(response.data.data.jobs || []);
        setFilters(response.data.data.filters || { 
          categories: [], 
          cities: [], 
          regions: []
        });
        setPagination(response.data.data.pagination || pagination);
      }
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast.error("فشل في جلب الوظائف");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, [searchTerm, selectedCity, selectedType, selectedRegion, sortBy, sortOrder]);

  const handleApply = (job: Job) => {
  if (!user) {
    toast.error("يجب تسجيل الدخول أولاً");
    router.push("/Login");
    return;
  }

  setApplyingJobId(job.id);

  // التواصل المباشر مع صاحب العمل حسب التعليمات في الباك إند
  if (job.business.phone) {
    // تنظيف الرقم من أي حروف غير أرقام
    const phone = job.business.phone.replace(/[^0-9]/g, '');

    let whatsappUrl;

    // التحقق من صيغ الأرقام اليمنية
    if (phone.startsWith('967')) {
      // الرقم بالفعل به رمز الدولة
      whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
        `السلام عليكم، أنا ${user.name} أود التقديم على وظيفة ${job.title}`
      )}`;
    }
    else if (phone.startsWith('0')) {
      // رقم يمني يبدأ بصفر
      whatsappUrl = `https://wa.me/967${phone.substring(1)}?text=${encodeURIComponent(
        `السلام عليكم، أنا ${user.name} أود التقديم على وظيفة ${job.title}`
      )}`;
    }
    else if (phone.startsWith('7')) {
      // رقم يمني يبدأ بـ 7
      whatsappUrl = `https://wa.me/967${phone}?text=${encodeURIComponent(
        `السلام عليكم، أنا ${user.name} أود التقديم على وظيفة ${job.title}`
      )}`;
    }
    else {
      // أي رقم آخر
      whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
        `السلام عليكم، أنا ${user.name} أود التقديم على وظيفة ${job.title}`
      )}`;
    }

    window.open(whatsappUrl, "_blank");
    toast.success("تم تحويلك إلى واتساب للتواصل مع صاحب العمل");
  } else {
    toast.error("رقم التواصل غير متاح لهذه الوظيفة");
  }

  setApplyingJobId(null);
};

  const toggleSaveJob = (jobId: number) => {
    if (!user) {
      toast.error("سجل دخول لحفظ الوظائف");
      router.push("/Login");
      return;
    }
    
    const newSavedJobs = savedJobs.includes(jobId)
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId];
    
    setSavedJobs(newSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(newSavedJobs));
    
    toast.success(
      savedJobs.includes(jobId) 
        ? "تم إزالة الوظيفة من المفضلة" 
        : "تم حفظ الوظيفة في المفضلة"
    );
  };


 
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const jobDate = new Date(date);
    const diffHours = Math.floor((now.getTime() - jobDate.getTime()) / (1000 * 60 * 60));
     
    if (diffHours < 1) return "منذ لحظات";
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffHours < 48) return "منذ يوم";
    return `منذ ${Math.floor(diffHours / 24)} يوم`;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCity("");
    setSelectedType("");
    setSelectedRegion("");
  };

  const hasActiveFilters = searchTerm || selectedCity || selectedType || selectedRegion;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    switch(value) {
      case 'newest':
        setSortBy('createdAt');
        setSortOrder('desc');
        break;
      case 'oldest':
        setSortBy('createdAt');
        setSortOrder('asc');
        break;
      case 'title-asc':
        setSortBy('title');
        setSortOrder('asc');
        break;
      case 'title-desc':
        setSortBy('title');
        setSortOrder('desc');
        break;
      case 'expires-asc':
        setSortBy('expiresAt');
        setSortOrder('asc');
        break;
      case 'expires-desc':
        setSortBy('expiresAt');
        setSortOrder('desc');
        break;
      default:
        setSortBy('createdAt');
        setSortOrder('desc');
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      dir="rtl"
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">أكثر من 5000+ وظيفة متاحة</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              ابحث عن <span className="text-yellow-300">وظيفة أحلامك</span>
            </h1>

            <p className="text-xl text-blue-100 mb-8">
              آلاف الفرص الوظيفية في مختلف المجالات تنتظرك
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="ابحث عن وظيفة (مسمى وظيفي، شركة، مهارة...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-14 pl-4 py-4 bg-white text-gray-900 rounded-2xl shadow-xl focus:ring-4 focus:ring-blue-300 outline-none text-lg"
                />
                
                <Search className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                )}
              </div>
            </div>
           
           
            {/* Quick Filters */}
            <div className="relative z-20">
              <div className="flex flex-wrap justify-center gap-3">
                {["مطور", "محاسب", "مهندس", "مسوق", "مصمم"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchTerm(term)}
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm hover:bg-white/20 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
        
      </div>
      

      {/* Stats Section - إحصائيات ثابتة لأن الباك إند ما يرجع إحصائيات عامة */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Briefcase,
              label: "وظيفة متاحة",
              value: pagination.total || "0",
            },
            { icon: Building2, label: "شركة", value: "1,200+" },
            { icon: Users, label: "باحث عن عمل", value: "15,000+" },
            { icon: TrendingUp, label: "توظيف ناجح", value: "3,500+" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100"
            >
              <div className="inline-flex p-3 bg-blue-50 rounded-xl mb-3">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                showFilters
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>فلتر متقدم</span>
              {hasActiveFilters && (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {
                    Object.values({
                      selectedCity,
                      selectedType,
                      selectedRegion,
                    }).filter(Boolean).length
                  }
                </span>
              )}
            </button>

            {/* Active Filters */}
            <div className="flex-1 flex flex-wrap gap-2">
              {selectedCity && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  <MapPin className="w-3 h-3" />
                  {selectedCity}
                  <button onClick={() => setSelectedCity("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedType && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  <Briefcase className="w-3 h-3" />
                  {selectedType}
                  <button onClick={() => setSelectedType("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedRegion && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  <MapPin className="w-3 h-3" />
                  {selectedRegion}
                  <button onClick={() => setSelectedRegion("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm"
                    : "hover:bg-gray-200"
                }`}
              >
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-1.5 h-1.5 bg-current rounded-sm" />
                  <div className="w-1.5 h-1.5 bg-current rounded-sm" />
                  <div className="w-1.5 h-1.5 bg-current rounded-sm" />
                  <div className="w-1.5 h-1.5 bg-current rounded-sm" />
                </div>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-sm"
                    : "hover:bg-gray-200"
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="w-3 h-1 bg-current rounded-sm" />
                  <div className="w-3 h-1 bg-current rounded-sm" />
                  <div className="w-3 h-1 bg-current rounded-sm" />
                </div>
              </button>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                مسح الكل
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المدينة
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    >
                      <option value="">كل المدن</option>
                      {filters.cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المجال
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    >
                      <option value="">كل المجالات</option>
                      {filters.categories.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المنطقة
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
                    >
                      <option value="">كل المناطق</option>
                      {filters.regions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {loading
                ? "جاري التحميل..."
                : `الوظائف المتاحة (${pagination.total})`}
            </h2>
            {!loading && (
              <span className="px-2 sm:px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm whitespace-nowrap">
                آخر تحديث: الآن
              </span>
            )}
          </div>

          <select
            onChange={handleSortChange}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-200"
          >
            <option value="newest">📅 الأحدث أولاً</option>
            <option value="oldest">📅 الأقدم أولاً</option>
            <option value="title-asc">🔤 العنوان (أ - ي)</option>
            <option value="title-desc">🔤 العنوان (ي - أ)</option>
            <option value="expires-asc">⏰ أقرب انتهاء</option>
            <option value="expires-desc">⏰ أبعد انتهاء</option>
          </select>
        </div>

        {/* Jobs Grid/List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-gray-600">جاري تحميل الوظائف...</p>
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-3xl shadow-sm"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              لا توجد نتائج
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              لم نتمكن من العثور على وظائف تطابق معايير البحث. جرب كلمات بحث
              مختلفة أو أزل بعض الفلاتر.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold"
            >
              مسح جميع الفلاتر
            </button>
          </motion.div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group ${viewMode === "grid" ? "" : "w-full"}`}
              >
                <div
                  className={`relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden ${
                    viewMode === "list"
                      ? "flex flex-col md:flex-row items-start"
                      : "flex flex-col"
                  }`}
                >
                  {/* Company Logo - Container */}
                  <div
                    className={`
            ${
              viewMode === "list"
                ? "w-full md:w-32 p-4 flex items-center justify-center md:self-center"
                : "p-6 pb-0"
            }
          `}
                  >
                    <div
                      className={`
              bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl 
              flex items-center justify-center
              ${
                viewMode === "list"
                  ? "w-20 h-20 md:w-16 md:h-16"
                  : "w-16 h-16 mb-4"
              }
            `}
                    >
                      <Building2
                        className={`
                ${
                  viewMode === "list" ? "w-8 h-8 md:w-6 md:h-6" : "w-8 h-8"
                } text-gray-400
              `}
                      />
                    </div>
                  </div>

                  {/* Content - يأخذ المساحة المتبقية */}
                  <div className="flex-1 flex flex-col p-4 w-full md:w-auto">
                    {/* Title & Company */}
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-600">
                          {job.business.name}
                        </span>
                      </div>
                    </div>

                    {/* Details - تحسين للشاشات الصغيرة */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.city && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs whitespace-nowrap">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[100px] md:max-w-none">
                            {job.city} {job.region ? `(${job.region})` : ""}
                          </span>
                        </span>
                      )}
                      {job.type && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs whitespace-nowrap">
                          <Briefcase className="w-3 h-3 flex-shrink-0" />
                          {job.type}
                        </span>
                      )}
                      {job.salary && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold whitespace-nowrap">
                          <DollarSign className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[120px] md:max-w-none">
                            {job.salary}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Description - إخفاء في الشاشات الصغيرة جداً لتحسين المساحة */}
                    {job.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 hidden sm:block">
                        {job.description}
                      </p>
                    )}

                    {/* Footer - تحسين للشاشات الصغيرة */}
                    <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mt-4 pt-4 border-t border-gray-100 gap-3">
                      <div className="flex items-center gap-2">
                        <Clock3 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {getTimeAgo(job.createdAt)}
                        </span>
                      </div>

                      {/* الأزرار - تحسين للشاشات الصغيرة */}
                      <div className="flex flex-wrap items-center gap-2 w-full xs:w-auto">
                        <button
                          onClick={() => toggleSaveJob(job.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="حفظ الوظيفة"
                        >
                          <Heart
                            className={`w-4 h-4 ${savedJobs.includes(job.id) ? "fill-red-500 text-red-500" : ""}`}
                          />
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/jobs/${job.id}`,
                            );
                            toast.success("تم نسخ الرابط");
                          }}
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                          aria-label="مشاركة"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setOpenJob(job)}
                          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-xs md:text-sm font-semibold"
                        >
                          عرض
                        </button>

                        <button
                          onClick={() => handleApply(job)}
                          disabled={applyingJobId === job.id}
                          className="px-3 py-1.5 md:px-4 md:py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors text-xs md:text-sm font-semibold flex items-center gap-1 disabled:opacity-50"
                        >
                          {applyingJobId === job.id ? (
                            "جاري..."
                          ) : (
                            <>
                             
                              <span className=" sm:inline">واتساب</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Contact Info - تحسين للشاشات الصغيرة */}
                    {job.business.phone && (
                      <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span dir="ltr" className="truncate">
                          {job.business.phone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => fetchJobs(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === pagination.pages ||
                  Math.abs(page - pagination.page) <= 2,
              )
              .map((page, index, array) => (
                <>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-3 py-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => fetchJobs(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pagination.page === page
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                </>
              ))}

            <button
              onClick={() => fetchJobs(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* show job window */}
        {openJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-2 lg:px-0">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 relative"
            >
              {/* زر إغلاق */}
              <button
                onClick={() => setOpenJob(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>

              {/* محتوى الوظيفة */}
              <h3 className="text-xl font-bold mb-2">{openJob.title}</h3>
              <p className="text-gray-700 mb-2">{openJob.business.name}</p>
              {openJob.city && (
                <p className="text-gray-500 text-sm">
                  {openJob.city} {openJob.region ? `(${openJob.region})` : ""}
                </p>
              )}
              {openJob.type && (
                <p className="text-gray-500 text-sm">{openJob.type}</p>
              )}
              {openJob.salary && (
                <p className="text-green-600 font-semibold">{openJob.salary}</p>
              )}
              {openJob.description && (
                <p className="mt-4 text-gray-600">{openJob.description}</p>
              )}

              {/* أزرار الاتصال والحفظ */}
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => handleApply(openJob)}
                  className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  واتساب
                </button>
                <button
                  onClick={() => toggleSaveJob(openJob.id)}
                  className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
                >
                  حفظ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}