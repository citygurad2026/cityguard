// pages/BloodRequestDetail.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Axios from "../../utilts/Axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Droplet,
  Hospital,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  AlertCircle,
  Trash2,
  CheckCircle,
  XCircle,
  Heart,
  MessageCircle,
} from "lucide-react";
import SummaryApi from "@/app/common/SummaryApi";
interface StoreUser {
  id: number;
  name?: string;
  username: string;
  role: string;
  accessToken: string;
}
export default function BloodRequestDetail() {
  const [isDonor, setIsDonor] = useState<boolean>(false);
  const [checkingDonor, setCheckingDonor] = useState<boolean>(true);
  const params = useParams();
  const router = useRouter();
 const user = useSelector((state: RootState) => state.user.user) as StoreUser | null;
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matchedDonors, setMatchedDonors] = useState<any[]>([]);

  const requestId = params.id;
   const fetchRequest = async () => {
    try {
      setLoading(true);
      const res=await Axios({
        ...SummaryApi.blood_req.getBloodRequestById(requestId as string)
      })
    
      
      if (res.data.success) {
        setRequest(res.data.data);
      } else {
        toast.error(res.data.message || "الطلب غير موجود");
        if (user?.role === "ADMIN") {
          router.push("/AdminBloodRequests");
        }
      }
    } catch (error: any) {
  console.error("Error fetching request:", error);
  toast.error(error.response?.data?.message || "حدث خطأ في جلب البيانات");

  // فقط للمسؤول يتم إعادة التوجيه
  if (user?.role === "ADMIN") {
    router.push("/AdminBloodRequests");
  }
  setRequest(null); // لتفعيل شاشة "الطلب غير موجود"
} finally {
      setLoading(false);
    }
  };

  const fetchMatchedDonors = async () => {
    try {
      const response = await Axios.get(`/api/blood-requests/${requestId}/match-donors`);
      if (response.data.success) {
        setMatchedDonors(response.data.data.donors || []);
      }
    } catch (error) {
      console.error("Error fetching matched donors:", error);
    }
  };
 
  useEffect(() => {
    if (requestId) {
      fetchRequest();
      fetchMatchedDonors();
    }
  }, [requestId]);
  useEffect(() => {
  if (user?.id) {
    checkDonorStatus();
  } else {
    setIsDonor(false);
    setCheckingDonor(false);
  }
}, [user]);
const checkDonorStatus = async () => {
  try {
    const res = await Axios({
      ...SummaryApi.bloodDonors.getMyDonorProfile,
    });

    // إذا وصلنا هنا بدون error → متبرع
    if (res.data.success) {
      setIsDonor(true);
    } else {
      setIsDonor(false);
    }
  } catch (error: any) {
    // غالباً 404 = مو متبرع
    setIsDonor(false);
  } finally {
    setCheckingDonor(false);
  }
};
if (checkingDonor) {
  return null; // أو spinner صغير
}




 

  const handleDelete = async () => {
    if (!confirm("تأكيد حذف طلب الدم؟")) return;

    try {
      const res=await Axios({
        ...SummaryApi.blood_req.deleteBloodRequest(requestId as string)
      })

      if (res.data.success) {
        toast.success("تم حذف الطلب بنجاح");
        router.push("/AdminBloodRequests");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل في الحذف");
    }
  };

 const updateStatus = async (status: string) => {
  try {
    const res = await Axios({
      ...SummaryApi.blood_req.updateBloodRequestStatus(requestId as string),
      data: { status },
    });

    if (res.data.success) {
      toast.success(`تم تحديث الحالة إلى ${status}`);
      fetchRequest();
    }
  } catch (error: any) {
    toast.error(error.response?.data?.message || "فشل في تحديث الحالة");
  }
};


  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'حرج';
      case 'high': return 'عالي';
      case 'normal': return 'متوسط';
      case 'low': return 'منخفض';
      default: return urgency;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'fulfilled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'مفتوح';
      case 'fulfilled': return 'مكتمل';
      case 'cancelled': return 'ملغى';
      case 'expired': return 'منتهي';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">الطلب غير موجود</h1>
          <Link href="/BloodDonation" className="text-blue-500 hover:underline">
            العودة للطلبات 
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 font-cairo"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/BloodDonation"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              رجوع للطلبات
            </Link>

            {/* Admin Controls */}
            {user?.role === "ADMIN" && (
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus("fulfilled")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  تم الإكمال
                </button>
                <button
                  onClick={() => updateStatus("cancelled")}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  إلغاء
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  طلب تبرع بالدم - {request.bloodType}
                </h1>
                <div className="flex flex-wrap gap-3 items-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}
                  >
                    {getStatusText(request.status)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(request.urgency)}`}
                  >
                    {getUrgencyText(request.urgency)}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {request.units} وحدة
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={`tel:${request.contactPhone}`}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  اتصل الآن
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">
                معلومات الطلب
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blood Type & Units */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Droplet className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">فصيلة الدم</p>
                      <p className="text-2xl font-bold text-red-600">
                        {request.bloodType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Heart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">الوحدات المطلوبة</p>
                      <p className="text-2xl font-bold">{request.units} وحدة</p>
                    </div>
                  </div>
                </div>

                {/* Hospital & Location */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Hospital className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">المستشفى</p>
                      <p className="text-lg font-semibold">
                        {request.hospital}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">المدينة</p>
                      <p className="text-lg font-semibold">{request.city}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  معلومات الاتصال
                </h3>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">رقم الهاتف</p>
                    <p className="text-lg font-semibold" dir="ltr">
                      {request.contactPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {request.notes && (
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    ملاحظات إضافية
                  </h3>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-gray-700 leading-relaxed">
                      {request.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b">
                المعلومات الزمنية
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
                    <p className="font-semibold">
                      {new Date(request.createdAt).toLocaleDateString("ar-SA", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {request.expiresAt && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">
                        تاريخ انتهاء الصلاحية
                      </p>
                      <p className="font-semibold">
                        {new Date(request.expiresAt).toLocaleDateString(
                          "ar-SA",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requester Info */}
            {request.requester && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  مقدم الطلب
                </h2>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-semibold">{request.requester.name}</p>
                    {request.requester.email && (
                      <p className="text-sm text-gray-600">
                        {request.requester.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Matched Donors */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                متبرعون متطابقون
              </h2>

              {matchedDonors.length === 0 ? (
                <div className="text-center py-6">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">
                    لا يوجد متبرعون متطابقون حالياً
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matchedDonors.slice(0, 3).map((donor) => (
                    <div
                      key={donor.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{donor.user.name}</p>
                        <p className="text-sm text-gray-600">{donor.city}</p>
                      </div>
                      <button className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {matchedDonors.length > 3 && (
                    <button className="w-full mt-3 text-center text-blue-500 hover:text-blue-700 font-medium">
                      عرض جميع المتبرعين ({matchedDonors.length})
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                إجراءات سريعة
              </h2>
              <div className="space-y-3">
                {!checkingDonor &&
                  user &&
                  !isDonor &&
                  user.role !== "ADMIN" && (
                    <button
                      onClick={() => router.push("/BloodDonorRegister")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Heart className="w-5 h-5" />
                      التسجيل كمتبرع
                    </button>
                  )}

                <button
                  onClick={() => {
                    const text = window.location.href;
                    const input = document.createElement("input");
                    input.value = text;
                    document.body.appendChild(input);
                    input.select();
                    try {
                      document.execCommand("copy");
                      toast.success("تم نسخ رابط الطلب!");
                    } catch {
                      toast.error("فشل نسخ الرابط");
                    }
                    document.body.removeChild(input);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  مشاركة الطلب
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}