"use client";

import { useState } from "react";
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
  Shield,
  Heart,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  Target,
  Zap,
  Bell,
  Navigation,
} from "lucide-react";

const BloodDonorRegister = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    bloodType: "",
    city: "",
    phone: "",
    notes: "",
    isAvailable: true,
    receiveAlerts: true,
    maxDistance: 50,
  });

  const bloodTypes = [
    { value: "A+", label: "A+", color: "from-red-500 to-red-600" },
    { value: "A-", label: "A-", color: "from-red-400 to-red-500" },
    { value: "B+", label: "B+", color: "from-blue-500 to-blue-600" },
    { value: "B-", label: "B-", color: "from-blue-400 to-blue-500" },
    { value: "O+", label: "O+", color: "from-green-500 to-green-600" },
    { value: "O-", label: "O-", color: "from-green-400 to-green-500" },
    { value: "AB+", label: "AB+", color: "from-purple-500 to-purple-600" },
    { value: "AB-", label: "AB-", color: "from-purple-400 to-purple-500" },
  ];

  const cities = [
    "صنعاء",  "تعز", "ذمار", "الحديدة", 
    "عدن", "عمران", "مارب", "إب", "حجة",
    "المهرة", "المكلا", "شبوة", "البيضاء", "الضالع"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (type === "range") {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBloodTypeSelect = (bloodType: string) => {
    setFormData(prev => ({ ...prev, bloodType }));
  };

  const handleCitySelect = (city: string) => {
    setFormData(prev => ({ ...prev, city }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.bloodType) {
          toast.error("⚠️ يرجى اختيار فصيلة الدم");
          return false;
        }
        return true;
      case 2:
        if (!formData.city) {
          toast.error("⚠️ يرجى اختيار المدينة");
          return false;
        }
        if (!formData.phone || formData.phone.length < 9) {
          toast.error("⚠️ يرجى إدخال رقم هاتف صحيح");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      if (!user) {
        toast.error("⚠️ يرجى تسجيل الدخول أولاً");
        router.push("/Login");
        return;
      }

      if (!validateStep(1) || !validateStep(2)) {
        toast.error("⚠️ يرجى إكمال جميع الحقول المطلوبة");
        return;
      }

      setLoading(true);

      const response = await Axios({
        ...SummaryApi.bloodDonors.registerDonor,
        data: {
          ...formData,
        },
      });

      if (response.data.success) {
        toast.success("🎉 تم تسجيلك كمتبرع بالدم بنجاح!");
        setTimeout(() => {
          router.push("/BloodDonorProfile");
        }, 2000);
      } else {
        toast.error(response.data.message || "❌ فشل في التسجيل");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "⚠️ حدث خطأ في التسجيل");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">عذراً!</h1>
          <p className="text-gray-600 mb-6">يجب عليك تسجيل الدخول أولاً للتسجيل كمتبرع بالدم</p>
          <button
            onClick={() => router.push("/Login")}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:from-red-700 hover:to-red-800 transition shadow-lg"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      {/* Hero Section */}
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
                  <h1 className="text-4xl md:text-5xl font-bold">كن بطلاً 🛡️</h1>
                  <p className="text-red-100 text-lg mt-2">سجل كمتبرع دم وانقذ حياة الآخرين</p>
                </div>
              </div>
              
              <p className="text-red-100 mb-6 max-w-2xl">
                كل تبرع بالدم يمكن أن ينقذ 3 أرواح. انضم إلى مجتمع الأبطال وساهم في صنع الفرق.
              </p>
              
              <button
                onClick={() => router.push("/BloodDonation")}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition border border-white/30"
              >
                <ChevronLeft className="w-5 h-5" />
                رجوع للقائمة الرئيسية
              </button>
            </div>

            <div className="relative">
              <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center">
                <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center">
                    <Heart className="w-20 h-20 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl">
            <div className="flex items-center justify-between mb-8 mt-7">
              {[
                { number: 1, label: "فصيلة الدم", icon: Droplet },
                { number: 2, label: "المعلومات الشخصية", icon: User },
                { number: 3, label: "الإعدادات", icon: Bell },
              ].map((step) => {
                const StepIcon = step.icon;
                const isActive = step.number === currentStep;
                const isCompleted = step.number < currentStep;
                
                return (
                  <div key={step.number} className="flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${
                      isActive 
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg" 
                        : isCompleted
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      isActive ? "text-red-600" : isCompleted ? "text-green-600" : "text-gray-400"
                    }`}>
                      {step.label}
                    </span>
                    <div className="mt-2 text-lg font-bold">{step.number}</div>
                  </div>
                );
              })}
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 right-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Blood Type Selection */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8 animate-fadeIn">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Droplet className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">اختر فصيلة دمك 🩸</h2>
                <p className="text-gray-600">فصيلة دمك ستحدد من يمكنك إنقاذ حياته</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {bloodTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleBloodTypeSelect(type.value)}
                    className={`p-6 rounded-2xl border-2 transition-all transform hover:-translate-y-1 ${
                      formData.bloodType === type.value
                        ? `border-red-500 ${type.color} text-white shadow-lg scale-105`
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">{type.label}</div>
                      <div className="text-sm opacity-75">
                        {formData.bloodType === type.value ? "✓ تم الاختيار" : "انقر للاختيار"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Compatibility Info */}
              <div className="mt-10 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">💡 معلومة مهمة</h3>
                <p className="text-gray-600 mb-3">
                  كل فصيلة دم يمكنها التبرع لفصائل محددة. اختر فصيلتك لمعرفة لمن يمكنك التبرع:
                </p>
                
                {formData.bloodType && (
                  <div className="mt-4 p-4 bg-white rounded-lg shadow-inner">
                    <p className="font-medium text-gray-800 mb-2">
                      فصيلة <span className="font-bold text-red-600">{formData.bloodType}</span> يمكنها التبرع لـ:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const compatibility: Record<string, string[]> = {
                          "A+": ["A+", "AB+"],
                          "A-": ["A+", "A-", "AB+", "AB-"],
                          "B+": ["B+", "AB+"],
                          "B-": ["B+", "B-", "AB+", "AB-"],
                          "O+": ["A+", "B+", "O+", "AB+"],
                          "O-": ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
                          "AB+": ["AB+"],
                          "AB-": ["AB+", "AB-"],
                        };
                        return compatibility[formData.bloodType]?.map((type) => (
                          <span
                            key={type}
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                          >
                            {type}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8 animate-fadeIn">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">معلومات التواصل 📞</h2>
                <p className="text-gray-600">سنستخدم هذه المعلومات للتواصل معك في الحالات الطارئة</p>
              </div>

              <div className="space-y-6">
                {/* City Selection */}
                <div className="space-y-4">
                  <label className="block">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-gray-800">المدينة</span>
                      <span className="text-red-500 mr-2">*</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {cities.slice(0, 9).map((city) => (
                        <button
                          key={city}
                          onClick={() => handleCitySelect(city)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.city === city
                              ? "border-blue-500 bg-blue-50 text-blue-700 font-bold"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                    {formData.city === "" && (
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full mt-3 py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">اختر مدينة أخرى...</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    )}
                  </label>
                </div>

                {/* Phone Number */}
                <div className="space-y-3">
                  <label className="block">
                    <div className="flex items-center gap-2 mb-3">
                      <Phone className="w-5 h-5 text-green-600" />
                      <span className="font-bold text-gray-800">رقم الهاتف</span>
                      <span className="text-red-500 mr-2">*</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="مثال: 771234567"
                      dir="ltr"
                    />
                    <p className="text-sm text-gray-500 mt-2">سيتم استخدام هذا الرقم للتواصل معك في الحالات الطارئة</p>
                  </label>
                </div>

                {/* Additional Notes */}
                <div className="space-y-3">
                  <label className="block">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-yellow-600" />
                      <span className="font-bold text-gray-800">ملاحظات إضافية (اختياري)</span>
                    </div>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="أي معلومات إضافية تود إضافتها..."
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Settings */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8 animate-fadeIn">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">إعدادات التبرع ⚙️</h2>
                <p className="text-gray-600">حدد كيف تود أن نتواصل معك ونبلغك بالطلبات</p>
              </div>

              <div className="space-y-8">
                {/* Availability */}
                <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Zap className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-bold text-gray-800 text-lg">أريد أن أكون متاحاً للتبرع</p>
                          <p className="text-sm text-gray-600">
                            عندما تكون متاحاً، سنقوم بإعلامك بالطلبات القريبة منك
                          </p>
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleInputChange}
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
                          <p className="font-bold text-gray-800 text-lg">استقبال تنبيهات الطلبات الجديدة</p>
                          <p className="text-sm text-gray-600">
                            سنرسل لك إشعارات عند وجود طلبات تتوافق مع فصيلة دمك
                          </p>
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="receiveAlerts"
                        checked={formData.receiveAlerts}
                        onChange={handleInputChange}
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
                      <Navigation className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="font-bold text-gray-800 text-lg">
                          نصف قطر استقبال التنبيهات: {formData.maxDistance} كم
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
                      value={formData.maxDistance}
                      onChange={handleInputChange}
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
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4 mt-8">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition ${
                currentStep === 1
                  ? "border border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              السابق
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
              >
                التالي
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg hover:from-red-600 hover:to-red-700 transition shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    التسجيل كمتبرع
                  </>
                )}
              </button>
            )}
          </div>

          {/* Registration Info */}
          <div className="mt-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6">📋 معلومات مهمة قبل التسجيل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-700 mb-3">شروط التبرع:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>العمر من 18 إلى 65 سنة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>الوزن لا يقل عن 50 كجم</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>عدم الإصابة بأمراض معدية</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-700 mb-3">مميزات التسجيل:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>إشعارات فورية بالطلبات العاجلة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>إحصاءات شخصية عن تبرعاتك</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>شهادة تقدير إلكترونية</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-6">أنت على بعد خطوة من إنقاذ حياة! 🚀</h2>
          <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
            كل 3 ثوانٍ، شخص ما في حاجة إلى نقل الدم. تبرعك بالدم قد يكون الأمل الأخير لمريض.
            لا تتردد، سجل كمتبرع الآن.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-white text-red-600 px-12 py-4 rounded-xl font-bold text-lg hover:bg-red-50 transition shadow-lg disabled:opacity-50"
            >
              {loading ? "جاري التسجيل..." : "✅ سجل كمتبرع الآن"}
            </button>
            <button
              onClick={() => router.push("/BloodDonation")}
              className="border-2 border-white text-white px-12 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition"
            >
              ↩ العودة للقائمة الرئيسية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodDonorRegister;