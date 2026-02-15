"use client";

import { useEffect, useState } from "react";
import {  useSelector } from "react-redux";
import { RootState } from "../store/store";
import Axios from "../utilts/Axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import SummaryApi from "../common/SummaryApi";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw,
  CheckCircle, 
  Clock, 
  Search,
  Filter,
  AlertCircle
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
  _count?: {
    applications: number;
  };
}

export default function OwnerJobs() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const deleteJob = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الوظيفة؟")) return;

    try {
      await Axios({
        ...SummaryApi.job.deleteJob(id),
      });

      toast.success("✅ تم حذف الوظيفة بنجاح");
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل في حذف الوظيفة");
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await Axios({
        ...SummaryApi.job.toggleJobStatus(id)
      });

      toast.success(response.data.message);
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل في تغيير حالة الوظيفة");
    }
  };

  const renewJob = async (id: number) => {
    try {
      const response = await Axios({
        ...SummaryApi.job.renewJob(id),
      });

      toast.success(response.data.message);
      fetchJobs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل في تجديد الوظيفة");
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
                         job.city?.toLowerCase().includes(search.toLowerCase()) ||
                         job.type?.toLowerCase().includes(search.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "active") return matchesSearch && job.isActive;
    if (filterStatus === "expired") return matchesSearch && job.expiresAt && new Date(job.expiresAt) < new Date();
    if (filterStatus === "inactive") return matchesSearch && !job.isActive;
    
    return matchesSearch;
  });

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل الوظائف...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6 font-cairo" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إدارة الوظائف</h1>
                <p className="text-gray-600 mt-1">عرض وتعديل وحذف الوظائف المنشورة</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/OwnerCreateJob"
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                إضافة وظيفة
              </Link>
              
              <button
                onClick={() => router.push("/Owner")}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                العودة
              </button>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن وظيفة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none bg-white min-w-[180px]"
              >
                <option value="all">جميع الوظائف</option>
                <option value="active">نشطة</option>
                <option value="expired">منتهية</option>
                <option value="inactive">غير نشطة</option>
              </select>
            </div>

            <button
              onClick={fetchJobs}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              تحديث
            </button>
          </div>
        </motion.div>

        {/* Jobs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد وظائف</h3>
              <p className="text-gray-600 mb-6">
                {search || filterStatus !== "all" 
                  ? "لا توجد نتائج للبحث" 
                  : "لم تقم بإضافة أي وظائف بعد"}
              </p>
              <Link
                href="/OwnerCreateJob"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                إضافة وظيفة جديدة
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-right text-gray-700 font-semibold">عنوان الوظيفة</th>
                    <th className="p-4 text-right text-gray-700 font-semibold">المدينة</th>
                    <th className="p-4 text-right text-gray-700 font-semibold">النوع</th>
                    <th className="p-4 text-right text-gray-700 font-semibold">الراتب</th>
                    <th className="p-4 text-right text-gray-700 font-semibold">الحالة</th>
                    <th className="p-4 text-right text-gray-700 font-semibold">تاريخ الإنتهاء</th>
                    <th className="p-4 text-right text-gray-700 font-semibold">المتقدمين</th>
                    <th className="p-4 text-right text-gray-700 font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job, index) => (
                    <motion.tr
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-gray-900">{job.title}</p>
                          <p className="text-sm text-gray-500">{job.description?.slice(0, 50)}...</p>
                        </div>
                      </td>
                      <td className="p-4 text-gray-900">{job.city || "-"}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {job.type || "عام"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-900">{job.salary || "غير محدد"}</td>
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
                      <td className="p-4">
                        {job.expiresAt 
                          ? new Date(job.expiresAt).toLocaleDateString("ar-SA")
                          : "بدون إنتهاء"}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-900">{job._count?.applications || 0}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            href={`OwnerEditJob/${job.id}`}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          
                          <button
                            onClick={() => toggleStatus(job.id, job.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              job.isActive 
                                ? "bg-yellow-500 hover:bg-yellow-600" 
                                : "bg-green-500 hover:bg-green-600"
                            } text-white`}
                          >
                            {job.isActive ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          
                          {isExpired(job.expiresAt) && (
                            <button
                              onClick={() => renewJob(job.id)}
                              className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteJob(job.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}