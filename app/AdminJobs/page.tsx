"use client";

import { useEffect, useState } from "react";
import Axios from "../utilts/Axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import SummaryApi from "../common/SummaryApi";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Search,
  Filter,
  RefreshCw,
  Edit3,
  Trash2,
  Users,
  AlertCircle,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

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
  company?: string;
  business?: {
    id: number;
    name: string;
    owner?: {
      name: string;
      phone?: string;
    };
  };
  _count?: {
    applications: number;
  };
}

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  expiredJobs: number;
  recentJobs: number;
}

export default function AdminJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats>({
    totalJobs: 0,
    activeJobs: 0,
    expiredJobs: 0,
    recentJobs: 0
  });
   const user = useSelector((state: RootState) => state.user.user);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);

  // ✅ ADMIN فقط - getAllJobs
  
 
  // ✅ ADMIN + OWNER - toggleJobStatus
  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await Axios({
        ...SummaryApi.job.toggleJobStatus(id)  // PATCH /api/jobs/${id}/toggle-status
      });

      toast.success(response.data.message || "تم تغيير حالة الوظيفة");
       fetchJobs()
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل في تغيير حالة الوظيفة");
    }
  };
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.job.getAllJobs,
      });

      if (response.data.success) {
        setJobs(response.data.data.jobs || []);
      }
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast.error("فشل في جلب الوظائف");
    } finally {
      setLoading(false);
    }
  };
  const fetchStatistics = async () => {
  try {
    const response = await Axios({
      ...SummaryApi.job.getJobsStatistics
    });

    if (response.data.success) {
      setStats(response.data.data);
    }
  } catch (error: any) {
    toast.error("فشل في جلب الإحصائيات");
  }
};


  useEffect(() => {

      fetchJobs();
    
  }, [user]);

  // ✅ ADMIN + OWNER - renewJob
  const renewJob = async (id: number) => {
    try {
      const response = await Axios({
        ...SummaryApi.job.renewJob(id)  // PATCH /api/jobs/${id}/renew
      });

      toast.success(response.data.message || "تم تجديد الوظيفة");
       fetchJobs();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل في تجديد الوظيفة");
    }
  };

  // ✅ ADMIN + OWNER - deleteJob (واحدة فقط)
  const deleteJob = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الوظيفة؟")) return;

    try {
      await Axios({
        ...SummaryApi.job.deleteJob(id) 
      });

      toast.success("✅ تم حذف الوظيفة بنجاح");
       fetchJobs()
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل في حذف الوظيفة");
    }
  };

  // ✅ حذف مجموعة وظائف
  const bulkDelete = async () => {
    if (selectedJobs.length === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedJobs.length} وظيفة؟`)) return;

    try {
      // Delete one by one
      for (const id of selectedJobs) {
        await Axios({
          ...SummaryApi.job.deleteJob(id)
        });
      }
      
      toast.success(`✅ تم حذف ${selectedJobs.length} وظيفة بنجاح`);
      setSelectedJobs([]);
      fetchJobs()
      fetchStatistics();
    } catch (error: any) {
      toast.error("فشل في حذف الوظائف المحددة");
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(search.toLowerCase()) ||
      job.business?.name?.toLowerCase().includes(search.toLowerCase()) ||
      job.city?.toLowerCase().includes(search.toLowerCase()) ||
      job.type?.toLowerCase().includes(search.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "active") return matchesSearch && job.isActive && !isExpired(job.expiresAt);
    if (filterStatus === "expired") return matchesSearch && isExpired(job.expiresAt);
    if (filterStatus === "inactive") return matchesSearch && !job.isActive;
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-cairo">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6 font-cairo" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-900 to-emerald-700 bg-clip-text text-transparent">
                إدارة الوظائف
              </h1>
              <p className="text-blue-600 mt-2 text-lg mr-2">
                الإشراف على جميع الوظائف في المنصة
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full lg:w-auto">
              {/* أزرار التنقل السريع */}
              <div className="flex gap-3 overflow-x-auto scroll-smooth whitespace-nowrap 
                    w-full max-w-full pb-2 px-1
                    [&::-webkit-scrollbar]:h-2
                    [&::-webkit-scrollbar-track]:bg-gray-100
                    [&::-webkit-scrollbar-thumb]:bg-gray-400
                    [&::-webkit-scrollbar-thumb]:rounded-full">
                <motion.div
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-shrink-0"
                >
                  <Link
                    href="/AdminController"
                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    <Users className="w-5 h-5" />
                    لوحة التحكم
                  </Link>
                </motion.div>
              </div>

           
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { label: "إجمالي الوظائف", value: stats.totalJobs, icon: Briefcase, color: "blue" },
            { label: "وظائف نشطة", value: stats.activeJobs, icon: CheckCircle, color: "green" },
            { label: "وظائف منتهية", value: stats.expiredJobs, icon: Clock, color: "yellow" },
            { label: "وظائف هذا الشهر", value: stats.recentJobs, icon: Calendar, color: "purple" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  placeholder="ابحث عن وظيفة..."
                  className="w-full pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="relative">
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="pl-4 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 bg-gray-50 focus:bg-white appearance-none min-w-[180px]"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشطة</option>
                  <option value="expired">منتهية</option>
                  <option value="inactive">غير نشطة</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              {selectedJobs.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={bulkDelete}
                  className="flex items-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>حذف المحدد ({selectedJobs.length})</span>
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  fetchAllJobs();
                  fetchStatistics();
                }}
                className="flex items-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all duration-300"
              >
                <RefreshCw className="w-5 h-5" />
                <span>تحديث</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="p-4 text-right">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJobs(filteredJobs.map(j => j.id));
                        } else {
                          setSelectedJobs([]);
                        }
                      }}
                      checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                      className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-400"
                    />
                  </th>
                  <th className="p-4 text-right text-gray-700 font-semibold">الوظيفة</th>
                  <th className="p-4 text-right text-gray-700 font-semibold">الشركة</th>
                  <th className="p-4 text-right text-gray-700 font-semibold">المدينة</th>
                  <th className="p-4 text-right text-gray-700 font-semibold">النوع</th>
                  <th className="p-4 text-right text-gray-700 font-semibold">الحالة</th>
                  <th className="p-4 text-right text-gray-700 font-semibold">الإنتهاء</th>
                  <th className="p-4 text-right text-gray-700 font-semibold">متقدمين</th>
                  <th className="p-4 text-right text-gray-700 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredJobs.map((job, index) => (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-300"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedJobs(prev => [...prev, job.id]);
                            } else {
                              setSelectedJobs(prev => prev.filter(id => id !== job.id));
                            }
                          }}
                          className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-400"
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-gray-900">{job.title}</p>
                          <p className="text-xs text-gray-500">ID: {job.id}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {job.business?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{job.business?.name || "غير معروف"}</p>
                            <p className="text-xs text-gray-500">{job.business?.owner?.name || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-900">{job.city || "-"}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {job.type || "عام"}
                        </span>
                      </td>
                      <td className="p-4">
                        {isExpired(job.expiresAt) ? (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" />
                            منتهية
                          </span>
                        ) : job.isActive ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1 w-fit">
                            <CheckCircle className="w-3 h-3" />
                            نشطة
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-1 w-fit">
                            <AlertCircle className="w-3 h-3" />
                            غير نشطة
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {job.expiresAt ? new Date(job.expiresAt).toLocaleDateString("ar-SA") : "-"}
                      </td>
                      <td className="p-4 text-center font-medium text-gray-900">
                        {job._count?.applications || 0}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {/* تعديل - updateJob */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push(`/AdminEditJob/${job.id}`)}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                            title="تعديل"
                          >
                            <Edit3 className="w-4 h-4" />
                          </motion.button>
                          
                          {/* تغيير الحالة - toggleJobStatus */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleStatus(job.id, job.isActive)}
                            className={`p-2 rounded-lg transition-colors duration-300 ${
                              job.isActive 
                                ? "bg-yellow-500 hover:bg-yellow-600" 
                                : "bg-green-500 hover:bg-green-600"
                            } text-white`}
                            title={job.isActive ? "تعطيل" : "تفعيل"}
                          >
                            {job.isActive ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </motion.button>
                          
                          {/* تجديد - renewJob */}
                          {isExpired(job.expiresAt) && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => renewJob(job.id)}
                              className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-300"
                              title="تجديد"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </motion.button>
                          )}
                          
                          {/* حذف - deleteJob */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteJob(job.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredJobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد وظائف</h3>
              <p className="text-gray-600 mb-6">
                {search || filterStatus !== "all" 
                  ? "لا توجد نتائج للبحث" 
                  : "لم يتم إضافة أي وظائف بعد"}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearch("");
                  setFilterStatus("all");
                }}
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors duration-300"
              >
                إعادة تعيين الفلتر
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* إحصائيات إضافية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-sm text-gray-600 bg-white rounded-2xl p-4 shadow-lg border border-gray-100"
        >
          <div className="flex justify-between items-center">
            <span>إجمالي الوظائف المعروضة: {filteredJobs.length}</span>
            <span>آخر تحديث: {new Date().toLocaleString("ar-SA")}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}