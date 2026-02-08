"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  Users,
  AlertCircle,
  Heart,
  MapPin,
  Hospital,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import BloodRequestCard from "../BloodRequestCard/page";
import Axios from "../utilts/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "react-hot-toast";

const BloodRequestsList = () => {
  const router = useRouter();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    status: "open",
    bloodType: "",
    city: "",
    urgency: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    limit: 12,
  });

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const cities = ["عمران", "حضرموت", "عدن", "الحديدة", "صنعاء", "ذمار", "اب", "تعز"];
  const urgencyLevels = [
    { value: "critical", label: "حرج", color: "bg-red-100 text-red-800" },
    { value: "high", label: "عالي", color: "bg-orange-100 text-orange-800" },
    { value: "normal", label: "متوسط", color: "bg-blue-100 text-blue-800" },
    { value: "low", label: "منخفض", color: "bg-green-100 text-green-800" },
  ];

  // ✅ FIX: لمنع fetch الزائد عند الكتابة
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ FIX: إرسال الفلاتر للـ API
      const response = await Axios({
        ...SummaryApi.blood_req.getAllBloodRequests,
        params: {
          page: filters.page,
          limit: filters.limit,
          status: filters.status,
          bloodType: filters.bloodType || undefined,
          city: filters.city || undefined,
          urgency: filters.urgency || undefined,
          search: filters.search || undefined,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        },
      });

      if (response.data?.success) {
        setRequests(response.data.data.requests || []);
        setPagination(
          response.data.data.pagination || {
            total: 0,
            pages: 1,
            limit: filters.limit,
          }
        );
      } else {
        throw new Error(response.data?.message || "فشل في جلب الطلبات");
      }
    } catch (err: any) {
      const msg = err.message || "حدث خطأ في الاتصال";
      setError(msg);
      toast.error(msg);
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: fetch عادي عند تغيير أي فلتر ما عدا search
  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page,
    filters.limit,
    filters.status,
    filters.bloodType,
    filters.city,
    filters.urgency,
    filters.sortBy,
    filters.sortOrder,
  ]);

  // ✅ FIX: debounce للبحث فقط
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      fetchRequests();
    }, 400);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.pages) return;
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateRequest = () => {
    router.push("/BloodRequestCreate");
  };

  // الإحصائيات (كما منطقك – صفحة حالية)
  const stats = {
    total: pagination.total,
    critical: requests.filter((r) => r.urgency === "critical").length,
    open: requests.filter((r) => r.status === "open").length,
    Ibb: requests.filter((r) => r.city === "اب").length,
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 font-cairo" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                طلبات الدم العاجلة
              </h1>
              <p className="text-gray-600 text-lg">
                ساعد في إنقاذ حياة شخص يحتاج إلى تبرع بالدم
              </p>
            </div>
            
             <div className="flex flex-col  justify-between items-center lg:items-center gap-3 mb-6">
               <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateRequest}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
                 إضافة طلب تبرع
               </motion.button>
                 <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/BloodDonation")}
                  className=" text-gray-700 hover:text-gray-600 transition-colors duration-300 flex "
                >
                  العودة لصفحة التبرعات
               </motion.button>
             </div>
            
            
          </div>
         

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">إجمالي الطلبات</p>
                  <p className="text-2xl md:text-3xl font-bold text-red-600 mt-1">{stats.total}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">طلبات حرجة</p>
                  <p className="text-2xl md:text-3xl font-bold text-orange-600 mt-1">{stats.critical}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">طلبات مفتوحة</p>
                  <p className="text-2xl md:text-3xl font-bold text-green-600 mt-1">{stats.open}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">طلبات مدينة اب</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-1">{stats.Ibb}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث بالمستشفى أو المدينة..."
                  className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all bg-gray-50 focus:bg-white"
                  value={filters.search}
                  onChange={handleSearch}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <select
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all bg-gray-50 focus:bg-white min-w-[150px]"
                  value={filters.bloodType}
                  onChange={(e) => handleFilterChange('bloodType', e.target.value)}
                >
                  <option value="">فصيلة الدم</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all bg-gray-50 focus:bg-white min-w-[150px]"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                >
                  <option value="">المدينة</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>

                <select
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all bg-gray-50 focus:bg-white min-w-[150px]"
                  value={filters.urgency}
                  onChange={(e) => handleFilterChange('urgency', e.target.value)}
                >
                  <option value="">درجة الإلحاح</option>
                  {urgencyLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFilters({
                    page: 1,
                    limit: 12,
                    status: 'open',
                    bloodType: '',
                    city: '',
                    urgency: '',
                    search: '',
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                  });
                }}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                إعادة الضبط
              </button>

              <button
                onClick={fetchRequests}
                className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                تحديث
              </button>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <p>عرض {requests.length} من أصل {pagination.total} طلب</p>
            <div className="flex items-center gap-2">
              <span>الترتيب:</span>
              <select
                className="border-none bg-transparent focus:outline-none"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="createdAt">الأحدث</option>
                <option value="urgency">الأكثر إلحاحاً</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <Hospital className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد طلبات دم حالية</h3>
            <p className="text-gray-600 mb-6">كن أول من ينشر طلباً للتبرع بالدم</p>
            <button
              onClick={handleCreateRequest}
              className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
            >
              إنشاء طلب جديد
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <BloodRequestCard key={request.id} request={request} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-10 mb-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className={`p-2 rounded-lg ${filters.page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (filters.page <= 3) {
                      pageNum = i + 1;
                    } else if (filters.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = filters.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg ${filters.page === pageNum
                            ? 'bg-red-500 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page === pagination.pages}
                    className={`p-2 rounded-lg ${filters.page === pagination.pages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slideIn">
          {error}
        </div>
      )}
    </div>
  );
};

export default BloodRequestsList;