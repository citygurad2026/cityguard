"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Axios from "../utilts/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "react-hot-toast";

import {
  Droplet,
  MapPin,
  Phone,
  User,
  Bell,
  Clock,
  Edit,
  History,
  Heart,
  Hospital,
  AlertCircle,
  CheckCircle,
  Calendar,
  ChevronLeft,
  Sliders,
  Save,
  X,
  Shield,
  Trophy,
  Target,
  Zap,
} from "lucide-react";

const BloodDonorProfile = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);
  const [donor, setDonor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [matchingRequests, setMatchingRequests] = useState<any[]>([]);
  const [lastDonationDialog, setLastDonationDialog] = useState(false);
  const [lastDonationDate, setLastDonationDate] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [donorForm, setDonorForm] = useState({
    bloodType: "",
    city: "",
    phone: "",
    notes: "",
    isAvailable: true,
    receiveAlerts: true,
    maxDistance: 50,
  });

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const cities = ["صنعاء", "اب", "تعز", "ذمار", "الحديدة", "عدن", "عمران", "مارب"];

  useEffect(() => {
    if (user) {
      fetchDonorProfile();
    }
  }, [user]);

  const fetchDonorProfile = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.bloodDonors.getMyDonorProfile,
      });

      if (response.data.success) {
        const donorData = response.data.data;
        setDonor(donorData);
        
        setDonorForm({
          bloodType: donorData.bloodType || "",
          city: donorData.city || "",
          phone: donorData.phone || "",
          notes: donorData.notes || "",
          isAvailable: donorData.isAvailable ?? true,
          receiveAlerts: donorData.receiveAlerts ?? true,
          maxDistance: donorData.maxDistance || 50,
        });

        if (donorData.bloodType && donorData.city) {
          fetchMatchingRequests(donorData.bloodType, donorData.city);
        }
      } else {
        toast.error(response.data.message || "فشل في جلب بيانات المتبرع");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchingRequests = async (bloodType: string, city: string) => {
    try {
      const response = await Axios({
        ...SummaryApi.blood_req.getAllBloodRequests,
        params: {
          status: "open",
          limit: 5,
          bloodType: bloodType,
          city: city,
        }
      });

      if (response.data.success) {
        setMatchingRequests(response.data.data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching matching requests:", error);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      setDonorForm(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (type === "range") {
      setDonorForm(prev => ({
        ...prev,
        [name]: parseInt(value)
      }));
    } else {
      setDonorForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDonorUpdate = async () => {
    try {
      setUpdating(true);
      
      const response = await Axios({
        ...SummaryApi.bloodDonors.updateDonorProfile,
        data: donorForm
      });

      if (response.data.success) {
        toast.success("✅ تم تحديث بيانات المتبرع بنجاح");
        setDonor(response.data.data);
        setEditMode(false);
        
        if (donorForm.bloodType && donorForm.city) {
          fetchMatchingRequests(donorForm.bloodType, donorForm.city);
        }
      } else {
        toast.error(response.data.message || "❌ فشل في تحديث البيانات");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "⚠️ حدث خطأ في تحديث البيانات");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      const response = await Axios({
        ...SummaryApi.bloodDonors.updateDonorStatus,
        data: {
          isAvailable: donorForm.isAvailable,
          receiveAlerts: donorForm.receiveAlerts,
          maxDistance: donorForm.maxDistance,
        }
      });

      if (response.data.success) {
        toast.success("✅ تم تحديث حالتك بنجاح");
        setDonor((prev: any) => ({ 
          ...prev, 
          ...response.data.data 
        }));
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "⚠️ حدث خطأ في تحديث الحالة");
    } finally {
      setUpdating(false);
    }
  };

  const handleLastDonationSubmit = async () => {
    try {
      if (!lastDonationDate) {
        toast.error("⚠️ يرجى تحديد تاريخ آخر تبرع");
        return;
      }

      const canDonateAfter = new Date(new Date(lastDonationDate).getTime() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      await Axios({
        ...SummaryApi.bloodDonors.updateLastDonation,
        data: {
          lastDonation: lastDonationDate,
          canDonateAfter,
        }
      });

      toast.success("✅ تم تحديث تاريخ آخر تبرع بنجاح");
      setLastDonationDialog(false);
      fetchDonorProfile();
    } catch (error) {
      toast.error("⚠️ حدث خطأ في تحديث تاريخ التبرع");
    }
  };

 

  const getBloodTypeColor = (bloodType: string) => {
    const colors: Record<string, string> = {
      "A+": "bg-gradient-to-r from-red-500 to-red-600",
      "A-": "bg-gradient-to-r from-red-400 to-red-500",
      "B+": "bg-gradient-to-r from-blue-500 to-blue-600",
      "B-": "bg-gradient-to-r from-blue-400 to-blue-500",
      "O+": "bg-gradient-to-r from-green-500 to-green-600",
      "O-": "bg-gradient-to-r from-green-400 to-green-500",
      "AB+": "bg-gradient-to-r from-purple-500 to-purple-600",
      "AB-": "bg-gradient-to-r from-purple-400 to-purple-500",
    };
    return colors[bloodType] || "bg-gradient-to-r from-gray-500 to-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-red-600 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!donor || !donor.user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">لم يتم العثور على بيانات المتبرع</h1>
          <button
            onClick={() => router.push("/BloodDonorRegister")}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:from-red-700 hover:to-red-800 transition shadow-lg"
          >
            سجل كمتبرع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 py-12 relative">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">ملف البطل 🛡️</h1>
                  <p className="text-red-100 text-lg mt-1">إدارة بياناتك وتبرعاتك في مكان واحد</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button
                  onClick={() => router.push("/BloodDonation")}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition border border-white/30"
                >
                  <ChevronLeft className="w-5 h-5" />
                  رجوع للقائمة
                </button>
                
                {editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition border border-white/30"
                    >
                      <X className="w-5 h-5" />
                      إلغاء التعديل
                    </button>
                    <button
                      onClick={handleDonorUpdate}
                      disabled={updating}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-xl hover:bg-red-50 transition font-bold hover:shadow-lg"
                    >
                      <Save className="w-5 h-5" />
                      {updating ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-xl hover:bg-red-50 transition font-bold hover:shadow-lg"
                  >
                    <Edit className="w-5 h-5" />
                    تعديل بيانات التبرع
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center">
                   
                      <User className="w-20 h-20 text-white" />
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 -mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-red-100 transform hover:-translate-y-1 transition">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl">🛡️</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Droplet className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-2">{donor.bloodType}</div>
            <div className="text-sm text-gray-600">فصيلة الدم</div>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 transform hover:-translate-y-1 transition">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl">📍</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-2">{donor.city}</div>
            <div className="text-sm text-gray-600">المدينة</div>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-green-100 transform hover:-translate-y-1 transition">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl">🎯</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {
              donor.lastDonation ?
              (
                <>{new Date(donor.lastDonation).toLocaleDateString('ar-SA')}</>
              ) : (
                "لم يتبرع من قبل"
              )
              }
            </div>
            <div className="text-sm text-gray-600">آخر تبرع</div>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="space-y-8">
            {/* Donor Info */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">معلومات البطل</h2>
                <p className="text-gray-600">{donor.user.name}</p>
                <p className="text-sm text-gray-500">{donor.user.email || donor.user.username}</p>
              </div>

              <div className="space-y-6">
                {/* Blood Type */}
                <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Droplet className="w-6 h-6 text-red-600" />
                    <p className="font-medium text-gray-800">فصيلة الدم</p>
                  </div>
                  {editMode ? (
                    <select
                      name="bloodType"
                      value={donorForm.bloodType}
                      onChange={handleFormChange}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">اختر فصيلة الدم</option>
                      {bloodTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <div className={`px-4 py-2 rounded-lg text-white font-bold text-center ${getBloodTypeColor(donor.bloodType)}`}>
                      {donor.bloodType}
                    </div>
                  )}
                </div>

                {/* City */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    <p className="font-medium text-gray-800">المدينة</p>
                  </div>
                  {editMode ? (
                    <select
                      name="city"
                      value={donorForm.city}
                      onChange={handleFormChange}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">اختر المدينة</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-bold text-gray-800 text-lg">{donor.city}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="w-6 h-6 text-green-600" />
                    <p className="font-medium text-gray-800">رقم الهاتف</p>
                  </div>
                  {editMode ? (
                    <input
                      type="tel"
                      name="phone"
                      value={donorForm.phone}
                      onChange={handleFormChange}
                      className="w-full py-3 px-4 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="مثال: 771234567"
                    />
                  ) : (
                    <p className="font-bold text-gray-800 text-lg" dir="ltr">
                      {donor.phone || donor.user?.phone || "غير متوفر"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition">
              <h3 className="text-xl font-bold text-gray-800 mb-6">إجراءات سريعة ⚡</h3>
              <div className="space-y-4">
                <button
                  onClick={() => setLastDonationDialog(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition shadow"
                >
                  <Calendar className="w-5 h-5" />
                  تحديث آخر تبرع
                </button>

                <button
                  onClick={() => router.push("/donor/history")}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition"
                >
                  <History className="w-5 h-5" />
                  سجل التبرعات
                </button>

                <button
                  onClick={() => router.push("/BloodDonation")}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:from-red-600 hover:to-red-700 transition shadow"
                >
                  <Heart className="w-5 h-5" />
                  تصفح الطلبات العاجلة
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Settings Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-800">إعدادات البطل ⚙️</h2>
                <div className={`px-4 py-2 rounded-full font-medium ${
                  donorForm.isAvailable 
                    ? "bg-green-100 text-green-800" 
                    : "bg-orange-100 text-orange-800"
                }`}>
                  {donorForm.isAvailable ? "🟢 متاح" : "🟠 غير متاح"}
                </div>
              </div>

              <div className="space-y-8">
                {/* Availability */}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-bold text-gray-800 text-lg">الحالة</p>
                          <p className="text-sm text-gray-600">
                            عندما تكون متاحاً، سيتم إعلامك بالطلبات القريبة
                          </p>
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={donorForm.isAvailable}
                        onChange={handleFormChange}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-green-600"></div>
                    </label>
                  </div>
                </div>

                {/* Alerts */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Bell className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-bold text-gray-800 text-lg">التنبيهات</p>
                          <p className="text-sm text-gray-600">
                            استقبال إشعارات عند وجود طلبات تتوافق مع فصيلة دمك
                          </p>
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="receiveAlerts"
                        checked={donorForm.receiveAlerts}
                        onChange={handleFormChange}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Distance */}
                <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Sliders className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="font-bold text-gray-800 text-lg">
                          نصف قطر التنبيهات: {donorForm.maxDistance} كم
                        </p>
                        <p className="text-sm text-gray-600">
                          سيتم إعلامك بالطلبات التي تبعد عنك ضمن هذا النطاق
                        </p>
                      </div>
                    </div>
                    <input
                      type="range"
                      name="maxDistance"
                      min="10"
                      max="200"
                      step="10"
                      value={donorForm.maxDistance}
                      onChange={handleFormChange}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-purple-600"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-3">
                      <span>10 كم</span>
                      <span>50 كم</span>
                      <span>100 كم</span>
                      <span>200 كم</span>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:shadow-lg hover:from-red-700 hover:to-red-800 transition shadow-lg disabled:opacity-50"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        جاري التحديث...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        حفظ التغييرات
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Matching Requests */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">طلبات تحتاج لبطلك 🎯</h2>
                  <p className="text-gray-600">طلبات تتطابق مع فصيلة دمك في منطقتك</p>
                </div>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold">
                  {matchingRequests.length} طلب
                </span>
              </div>

              {matchingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">لا توجد طلبات حالية</h3>
                  <p className="text-gray-600 mb-8">
                    جميع الحالات الطارئة تلقت استجابة. يمكنك المساعدة في الطلبات العامة.
                  </p>
                  <button
                    onClick={() => router.push("/BloodRequestsList")}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition"
                  >
                    تصفح جميع الطلبات
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {matchingRequests.map((request) => (
                    <div key={request.id} className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition hover:border-red-200">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`px-4 py-2 rounded-lg text-white font-bold ${getBloodTypeColor(request.bloodType)}`}>
                              {request.bloodType}
                            </div>
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                              {request.units} وحدة مطلوبة
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Hospital className="w-4 h-4" />
                              <span className="font-medium">{request.hospital}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{request.city}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/BloodRequestDetail/${request.id}`)}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold hover:shadow-lg hover:from-red-600 hover:to-red-700 transition"
                        >
                          تبرع الآن
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Last Donation Dialog */}
      {lastDonationDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform hover:scale-[1.02] transition">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">تحديث تاريخ آخر تبرع 📅</h3>
                  <p className="text-gray-600 text-sm">يساعدنا في تحديد موعد تبرعك القادم</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  تاريخ آخر تبرع لك
                </label>
                <input
                  type="date"
                  value={lastDonationDate}
                  onChange={(e) => setLastDonationDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>

              {lastDonationDate && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800">
                      يمكنك التبرع مرة أخرى في:{" "}
                      <span className="font-bold">
                        {new Date(new Date(lastDonationDate).getTime() + 90 * 24 * 60 * 60 * 1000)
                          .toLocaleDateString("ar-SA", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setLastDonationDialog(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleLastDonationSubmit}
                  disabled={!lastDonationDate}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  تأكيد التحديث
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodDonorProfile;