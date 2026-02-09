"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Axios from "../utilts/Axios";
import SummaryApi from "../common/SummaryApi";

/* ================= TYPES ================= */

interface BloodDonor {
  id: number;
  bloodType: string;
  city: string;
  phone?: string;
  lastDonation?: string;
  isAvailable: boolean;
  user: {
    id: number;
    name: string;
    phone?: string;
  };
}

interface BloodDonorStatistics {
  totalDonors: number;
  activeDonors: number;
  donorsByBloodType: Array<{
    bloodType: string;
    _count: {
      id: number;
    };
  }>;
  donorsByCity: Array<{
    city: string;
    _count: {
      id: number;
    };
  }>;
  recentDonors: number;
  activationRate: number;
}
type BloodType =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "O+"
  | "O-"
  | "AB+"
  | "AB-";


/* ================= PAGE ================= */

export default function BloodDonorsListPage() {
  const router = useRouter();
const [filters, setFilters] = useState({
  bloodType: "",
  city: "",
  availableOnly: true,
  search: "",
});

  /* ===== STATE ===== */

  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [stats, setStats] = useState<BloodDonorStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const donorsPerPage = 12;

  /* ===== DERIVED DATA ===== */

  const bloodGroups = stats
    ? stats.donorsByBloodType.map((b) => ({
        bloodType: b.bloodType,
        count: b._count.id,
        percentage: Math.round((b._count.id / stats.totalDonors) * 100),
      }))
    : [];

  const cities = stats ? stats.donorsByCity.map((c) => c.city) : [];

  /* ================= EFFECTS ================= */

  const fetchDonorsData = async () => {
  try {
    setLoading(true);

    // جلب المتبرعين
    const donorsRes = await Axios({
      ...SummaryApi.bloodDonors.searchDonors,
      params: {
        page: currentPage,
        limit: donorsPerPage,
        ...(filters.bloodType && { bloodType: filters.bloodType }),
        ...(filters.city && { city: filters.city }),
        ...(filters.availableOnly && { available: true }),
        ...(filters.search && { search: filters.search }),
      },
    });

    if (donorsRes.data?.success) {
      setDonors(donorsRes.data.data || []);
      setTotalPages(donorsRes.data.pagination?.totalPages || 1);
    }

    // جلب الإحصائيات
    const statsRes = await Axios({
      ...SummaryApi.bloodDonors.donorStatistics,
    });

    if (statsRes.data?.success) {
      setStats(statsRes.data.data);
    }

  } catch (err: any) {
    setError(
      err?.response?.data?.message || "حدث خطأ أثناء تحميل بيانات المتبرعين"
    );
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchDonorsData();
}, [currentPage, filters]);


  /* ================= HANDLERS ================= */

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);

    const params = new URLSearchParams();
    if (newFilters.bloodType) params.set("bloodType", newFilters.bloodType);
    if (newFilters.city) params.set("city", newFilters.city);
    if (newFilters.search) params.set("search", newFilters.search);
    params.set("available", newFilters.availableOnly.toString());

    router.push(`/blood/donors?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setFilters({
      bloodType: "",
      city: "",
      availableOnly: true,
      search: "",
    });
    setCurrentPage(1);
    router.push("/blood/donors");
  };

  const handleContactClick = (phone?: string) => {
    if (!phone) return;
    window.open(`tel:${phone}`, "_blank");
  };

  const getBloodTypeColor = (bloodType: string) => {
    const colors: Record<string, string> = {
      "A+": "bg-gradient-to-r from-red-500 to-red-600 text-white",
      "A-": "bg-gradient-to-r from-red-400 to-red-500 text-white",
      "B+": "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
      "B-": "bg-gradient-to-r from-blue-400 to-blue-500 text-white",
      "O+": "bg-gradient-to-r from-green-500 to-green-600 text-white",
      "O-": "bg-gradient-to-r from-green-400 to-green-500 text-white",
      "AB+": "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
      "AB-": "bg-gradient-to-r from-purple-400 to-purple-500 text-white",
    };
    return colors[bloodType] || "bg-gray-600 text-white";
  };

 const getCompatibilityChart = (bloodType: BloodType) => {
  const chartData: Record<BloodType, string[]> = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    "AB-": ["A-", "B-", "AB-", "O-"],
  };

  return chartData[bloodType];
};


  const getDonorStatus = (lastDonation?: string) => {
    if (!lastDonation) return { text: "جاهز للتبرع", color: "text-green-600", bg: "bg-green-100" };
    
    const lastDate = new Date(lastDonation);
    const monthsDiff = (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsDiff >= 6) return { text: "جاهز للتبرع", color: "text-green-600", bg: "bg-green-100" };
    if (monthsDiff >= 4) return { text: "قريباً جاهز", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { text: "تم التبرع مؤخراً", color: "text-blue-600", bg: "bg-blue-100" };
  };
  useEffect(() => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    setFilters({
      bloodType: params.get("bloodType") || "",
      city: params.get("city") || "",
      availableOnly: params.get("available") !== "false",
      search: params.get("search") || "",
    });
  }
}, []);

  /* ================= LOADING & ERROR ================= */

  if (loading && donors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-red-100 border-t-red-600 mx-auto mb-6" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-red-600 rounded-full animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">جاري تحميل بيانات المتبرعين</h3>
          <p className="text-gray-600">نبحث عن الأبطال الحقيقين...</p>
        </div>
      </div>
    );
  }

  if (error && donors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">عذراً</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      dir="rtl"
    >
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                أبطال الحياة
              </h1>
              <p className="text-red-100 text-lg mb-6">
                كل قطرة دم تنقذ حياة. تعرف على أبطالنا المتبرعين وكن واحداً منهم
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/BloodDonorRegister"
                  className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-red-50 transition shadow-lg"
                >
                  سجل كمتبرع
                </Link>
                <Link
                  href="/BloodRequestCreate"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition"
                >
                  اطلب تبرع
                </Link>
              </div>
            </div>
            <div className="mt-8 md:mt-0">
              <div className="relative">
                <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
                  <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center">
                      <svg
                        className="w-20 h-20 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 -mt-12">
            <StatCard
              title="الأبطال النشطين"
              value={stats.activeDonors}
              icon="👨‍⚕️"
              color="from-red-500 to-red-600"
            />
            <StatCard
              title="إجمالي الأبطال"
              value={stats.totalDonors}
              icon="❤️"
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              title="متبرعين جدد"
              value={stats.recentDonors}
              icon="⭐"
              color="from-green-500 to-green-600"
            />
            <StatCard
              title="نسبة النشاط"
              value={`${stats.activationRate}%`}
              icon="📈"
              color="from-purple-500 to-purple-600"
            />
          </div>
        )}
        <div className="flex justify-center mt-6">
          <button
             onClick={() => router.push("/BloodDonation")}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition transform font-bold"
          >
            ⬅ العودة للصفحة السابقة
          </button>
        </div>

        {/* Blood Groups Distribution */}
        {bloodGroups.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                توزيع فصائل الدم
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                    clipRule="evenodd"
                  />
                </svg>
                الفلاتر
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      فصيلة الدم
                    </label>
                    <select
                      value={filters.bloodType}
                      onChange={(e) =>
                        handleFilterChange("bloodType", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">جميع الفصائل</option>
                      {bloodGroups.map((group) => (
                        <option key={group.bloodType} value={group.bloodType}>
                          {group.bloodType} ({group.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المدينة
                    </label>
                    <select
                      value={filters.city}
                      onChange={(e) =>
                        handleFilterChange("city", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">جميع المدن</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      بحث
                    </label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      placeholder="ابحث عن متبرع..."
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleResetFilters}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-medium transition"
                    >
                      إعادة تعيين
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    id="availableOnly"
                    checked={filters.availableOnly}
                    onChange={(e) =>
                      handleFilterChange("availableOnly", e.target.checked)
                    }
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <label
                    htmlFor="availableOnly"
                    className="mr-2 text-sm text-gray-700"
                  >
                    عرض المتبرعين المتاحين فقط
                  </label>
                </div>
              </div>
            )}

            {/* Blood Groups Chart */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {bloodGroups.map((group) => (
                <button
                  key={group.bloodType}
                  onClick={() =>
                    handleFilterChange("bloodType", group.bloodType)
                  }
                  className={`${getBloodTypeColor(
                    group.bloodType,
                  )} p-4 rounded-xl text-center transform hover:scale-105 transition shadow-lg hover:shadow-xl`}
                >
                  <div className="font-bold text-xl mb-1">
                    {group.bloodType}
                  </div>
                  <div className="text-sm opacity-90">{group.count} متبرع</div>
                  <div className="text-xs opacity-75">{group.percentage}%</div>
                  {filters.bloodType === group.bloodType && (
                    <div className="mt-2">
                      <div className="w-6 h-1 bg-white/50 rounded-full mx-auto" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Donors Grid */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">قائمة الأبطال</h2>
            <div className="text-gray-600">
              <span className="font-bold text-red-600">{donors.length}</span> من{" "}
              <span className="font-bold">{stats?.totalDonors}</span> متبرع
            </div>
          </div>

          {donors.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                لا توجد نتائج
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                لم نجد متبرعين يطابقون معايير البحث. حاول تغيير الفلاتر أو سجل
                كمتبرع جديد
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition"
              >
                عرض جميع المتبرعين
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {donors.map((donor) => {
                const status = getDonorStatus(donor.lastDonation);
                return (
                  <div
                    key={donor.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Donor Card Header */}
                    <div className="relative">
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${getBloodTypeColor(donor.bloodType)}`}
                        >
                          {donor.bloodType}
                        </span>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center">
                            <span className="text-2xl">❤️</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">
                              {donor.user.name}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>{donor.city}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div
                          className={`inline-flex items-center gap-2 ${status.bg} ${status.color} px-3 py-1 rounded-full text-sm font-medium mb-4`}
                        >
                          <div className="w-2 h-2 rounded-full animate-pulse" />
                          {status.text}
                        </div>

                        {/* Compatibility Chart */}
                        <div className="mb-6">
                          <p className="text-sm text-gray-600 mb-3">
                            يمكنه التبرع لـ:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {getCompatibilityChart(donor.bloodType as BloodType).map(
                              (type) => (
                                <span
                                  key={type}
                                  className={`text-xs font-medium px-3 py-1.5 rounded-full ${getBloodTypeColor(type)} bg-opacity-20`}
                                >
                                  {type}
                                </span>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Last Donation Info */}
                        {donor.lastDonation && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            آخر تبرع:{" "}
                            {new Date(donor.lastDonation).toLocaleDateString(
                              "ar-SA",
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t border-gray-100 p-6">
                      <button
                        onClick={() =>
                          handleContactClick(donor.phone || donor.user.phone)
                        }
                        disabled={!donor.isAvailable}
                        className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
                          donor.isAvailable
                            ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg hover:from-red-700 hover:to-red-800"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {donor.isAvailable
                          ? "📞 اتصل بالبطل"
                          : "⏳ غير متاح حالياً"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-red-300 hover:text-red-600 shadow"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                السابق
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <span className="text-gray-600">
                الصفحة <span className="font-bold">{currentPage}</span> من{" "}
                <span className="font-bold">{totalPages}</span>
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-red-300 hover:text-red-600 shadow"
                }`}
              >
                التالي
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-center text-white mb-12">
          <h2 className="text-3xl font-bold mb-4">كن بطلاً اليوم!</h2>
          <p className="text-red-100 mb-8 max-w-2xl mx-auto text-lg">
            كل قطرة دم تساوي حياة. سجل الآن كمتبرع دم وساهم في إنقاذ الأرواح.
            عملية التبرع آمنة وتستغرق 10 دقائق فقط من وقتك.
          </p>
          <Link
            href="/BloodDonorRegister"
            className="inline-block bg-white text-red-600 px-12 py-4 rounded-xl font-bold text-lg hover:bg-red-50 transition shadow-lg hover:shadow-xl"
          >
            سجل كمتبرع الآن
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, icon, color }: { 
  title: string; 
  value: number | string; 
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:-translate-y-1 transition">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl">{icon}</div>
        </div>
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center`}>
          <span className="text-white text-lg">❤️</span>
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-2">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: '100%' }} />
      </div>
    </div>
  );
}