"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Axios from "../utilts/Axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Droplet,
  Hospital,
  Phone,
  MapPin,
  Shield,
  Calendar,
  ChevronLeft,
} from "lucide-react";
import SummaryApi from "../common/SummaryApi";

interface BloodRequest {
  id: number;
  bloodType: string;
  units: number;
  urgency: "low" | "normal" | "high" | "critical";
  city: string;
  hospital: string;
  contactPhone: string;
  notes?: string;
  status: "open" | "fulfilled" | "cancelled" | "expired";
  requesterId?: number;
  expiresAt?: string;
  createdAt: string;
  requester?: {
    id: number;
    name: string;
    phone?: string;
  };
}

export default function AdminBloodRequests() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");

  // Mappings للألوان
  const statusColorMap: Record<string, string> = {
    open: "bg-green-100 text-green-800",
    fulfilled: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
  };

  const urgencyColorMap: Record<string, string> = {
    critical: "bg-red-100 text-red-800",
    high: "bg-orange-100 text-orange-800",
    normal: "bg-blue-100 text-blue-800",
    low: "bg-green-100 text-green-800",
  };

  const colorMap: Record<string, string> = {
    red: "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
  };

  // جلب طلبات الدم
  const fetchBloodRequests = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.blood_req.getAllBloodRequests,
      });

      if (response.data.success) {
        setRequests(response.data.data.requests || []);
      }
    } catch (error: any) {
      console.error("Error fetching blood requests:", error);
      toast.error(error.response?.data?.message || "فشل في جلب طلبات الدم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodRequests();
  }, []);

  // حذف طلب
  const deleteRequest = async (id: number) => {
    if (!confirm("تأكيد حذف طلب الدم؟")) return;

    try {
      const response = await Axios({
        ...SummaryApi.blood_req.deleteBloodRequest(id),
      });

      if (response.data.success) {
        toast.success("تم حذف الطلب بنجاح");
        setRequests((prev) => prev.filter((req) => req.id !== id));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل في الحذف");
    }
  };

  // تحديث حالة الطلب
  const updateRequestStatus = async (id: number, status: string) => {
  if (!user?.accessToken) return toast.error("غير مصرح");

  try {
    const response = await Axios({
      ...SummaryApi.blood_req.updateBloodRequestStatus(id),
    /*   headers: { Authorization: `Bearer ${user.accessToken}` }, */
      data: { status }
    });

    if (response.data.success) {
      toast.success(`تم تحديث الحالة إلى ${status}`);
      fetchBloodRequests();
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "فشل في تحديث الحالة");
  }
};


  // فلترة الطلبات
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      search === "" ||
      request.hospital.toLowerCase().includes(search.toLowerCase()) ||
      request.city.toLowerCase().includes(search.toLowerCase()) ||
      request.bloodType.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || request.status === filterStatus;

    const matchesUrgency =
      filterUrgency === "all" || request.urgency === filterUrgency;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  // الإحصائيات
  const stats = {
    total: requests.length,
    open: requests.filter((r) => r.status === "open").length,
    fulfilled: requests.filter((r) => r.status === "fulfilled").length,
    critical: requests.filter((r) => r.urgency === "critical").length,
    today: requests.filter((r) => {
      const today = new Date().toDateString();
      const requestDate = new Date(r.createdAt).toDateString();
      return today === requestDate;
    }).length,
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="text-center p-8">
          <Shield className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح</h1>
          <p className="text-gray-600 mb-6">
            هذه الصفحة مخصصة للمديرين فقط
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6 font-cairo"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div>
              <button
                onClick={() => router.push("/AdminController")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ChevronLeft className="w-5 h-5" />
                رجوع للوحة التحكم
              </button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                إدارة طلبات الدم
              </h1>
              <p className="text-gray-600 mt-2">
                إدارة وعرض جميع طلبات التبرع بالدم في النظام
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.div whileHover={{ y: -2 }}>
                <button
                  onClick={fetchBloodRequests}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  تحديث البيانات
                </button>
              </motion.div>

              <motion.div whileHover={{ y: -2 }}>
                <Link
                  href="/BloodRequestsList"
                  className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  طلبات الدم العاجلة
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: "إجمالي الطلبات", value: stats.total, icon: Droplet, color: "red" },
              { label: "طلبات مفتوحة", value: stats.open, icon: AlertCircle, color: "orange" },
              { label: "طلبات حرجة", value: stats.critical, icon: AlertCircle, color: "red" },
              { label: "طلبات اليوم", value: stats.today, icon: Calendar, color: "blue" },
              { label: "طلبات مكتملة", value: stats.fulfilled, icon: CheckCircle, color: "green" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 shadow border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${colorMap[stat.color]}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  placeholder="ابحث بالمستشفى أو المدينة أو فصيلة الدم..."
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="relative">
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all appearance-none min-w-[180px]"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">جميع الحالات</option>
                  <option value="open">مفتوحة</option>
                  <option value="fulfilled">مكتملة</option>
                  <option value="cancelled">ملغية</option>
                  <option value="expired">منتهية</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all appearance-none min-w-[180px]"
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                >
                  <option value="all">جميع درجات الإلحاح</option>
                  <option value="critical">حرجة</option>
                  <option value="high">عالية</option>
                  <option value="normal">متوسطة</option>
                  <option value="low">منخفضة</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center p-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                لا توجد طلبات
              </h3>
              <p className="text-gray-600">
                لا توجد طلبات دم تطابق معايير البحث
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-right font-semibold text-gray-700">الطلب</th>
                    <th className="p-4 text-right font-semibold text-gray-700">المعلومات</th>
                    <th className="p-4 text-right font-semibold text-gray-700">الحالة</th>
                    <th className="p-4 text-right font-semibold text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorMap.red}`}>
                            <Droplet className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg text-red-700">{request.bloodType}</p>
                            <p className="text-sm text-gray-600">{request.units} وحدة</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Hospital className="w-4 h-4 text-gray-500" />
                            <span>{request.hospital}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{request.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span dir="ltr">{request.contactPhone}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block w-fit ${statusColorMap[request.status]}`}>
                            {request.status === "open"
                              ? "مفتوح"
                              : request.status === "fulfilled"
                              ? "مكتمل"
                              : request.status === "cancelled"
                              ? "ملغى"
                              : "منتهي"}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block w-fit ${urgencyColorMap[request.urgency]}`}>
                            {request.urgency === "critical"
                              ? "حرج"
                              : request.urgency === "high"
                              ? "عالي"
                              : request.urgency === "normal"
                              ? "متوسط"
                              : "منخفض"}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateRequestStatus(request.id, "fulfilled")}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            title="تم الاكتمال"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateRequestStatus(request.id, "cancelled")}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            title="إلغاء الطلب"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteRequest(request.id)}
                            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            title="حذف الطلب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/BloodRequestDetail/${request.id}`}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
