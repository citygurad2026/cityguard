"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Axios from "../utilts/Axios";
import SummaryApi from "../common/SummaryApi";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

import {
  Droplet,
  MapPin,
  Hospital,
  Phone,
  FileText,
  Send,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Shield,
  Heart,
  Calendar,
  Clock,
  User,
  Zap,
  Target,
  ArrowRight,
} from "lucide-react";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- Schema validation using Zod ---
const bloodSchema = z.object({
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  units: z.number().min(1).max(10),
  urgency: z.enum(["low", "normal", "high", "critical"]),
  city: z.string().min(1),
  hospital: z.string().min(1),
  contactPhone: z.string()
    .min(9, "رقم الهاتف قصير جدًا")
    .max(10, "رقم الهاتف طويل جدًا")
    .regex(/^0?7\d{8}$/, "رقم الهاتف غير صالح، يجب أن يبدأ بـ 7 ويحتوي على 9 أرقام"),
  notes: z.string().max(500).optional(),
  expiresAt: z.string().optional(),
});

type BloodFormData = z.infer<typeof bloodSchema>;

// --- Constants ---
const steps = ["فصيلة الدم", "تفاصيل المريض", "المراجعة النهائية"];
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
  "صنعاء", "تعز", "ذمار", "الحديدة", 
  "عدن", "عمران", "مارب", "إب", "حجة",
  "المهرة", "المكلا", "شبوة", "البيضاء", "الضالع"
];

const urgencyLevels = [
  { value: "critical", label: "🚨 حرج", description: "حالة طارئة تحتاج تدخل فوري", color: "from-red-600 to-red-700", bg: "bg-gradient-to-r from-red-50 to-red-100" },
  { value: "high", label: "⚠️ عالي", description: "حالة تستدعي اهتماماً سريعاً", color: "from-orange-500 to-orange-600", bg: "bg-gradient-to-r from-orange-50 to-orange-100" },
  { value: "normal", label: "📌 متوسط", description: "حالة منتظمة تحتاج متبرع", color: "from-blue-500 to-blue-600", bg: "bg-gradient-to-r from-blue-50 to-blue-100" },
  { value: "low", label: "📋 منخفض", description: "حالة تخطيط مسبق", color: "from-green-500 to-green-600", bg: "bg-gradient-to-r from-green-50 to-green-100" },
];

export default function BloodRequestCreate() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedUrgency, setSelectedUrgency] = useState("normal");
  const [selectedBloodType, setSelectedBloodType] = useState<string>("");

  const { register, handleSubmit, formState: { errors, isValid }, watch, setValue } = useForm<BloodFormData>({
    resolver: zodResolver(bloodSchema),
    mode: "onChange",
    defaultValues: {
      bloodType: "",
      units: 1,
      urgency: "normal",
      city: "",
      hospital: "",
      contactPhone: "",
      notes: "",
      expiresAt: "",
    },
  });

  const onSubmit: SubmitHandler<BloodFormData> = async (data) => {
    try {
      setLoading(true);
      const requestData = {
        ...data,
        expiresAt: data.expiresAt || undefined,
      };
      
      const response = await Axios({
        ...SummaryApi.blood_req.createBloodRequest,
        data: requestData,
      });

      if (response.data.success) {
        toast.success("🎉 تم إنشاء طلب التبرع بنجاح!");
        setTimeout(() => {
          router.push(`/BloodRequestDetail/${response.data.data.id}`);
        }, 2000);
      } else {
        toast.error("❌ " + (response.data.message || "فشل في إنشاء الطلب"));
      }
    } catch (err: any) {
      toast.error("⚠️ " + (err.response?.data?.message || "حدث خطأ في إنشاء الطلب"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
 
  }, []);

  const handleNext = () => {
    const stepFields: Record<number, (keyof BloodFormData)[]> = {
      0: ["bloodType", "units", "urgency"],
      1: ["city", "hospital", "contactPhone"],
    };
    const fields = stepFields[activeStep] || [];
    const valid = fields.every((f) => !errors[f]);
    if (valid) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const watchedValues = watch();

  const handleBloodTypeSelect = (bloodType: string) => {
    setSelectedBloodType(bloodType);
    setValue("bloodType", bloodType as any);
  };

  const handleUrgencySelect = (urgency: string) => {
    setSelectedUrgency(urgency);
    setValue("urgency", urgency as any);
  };

  // --- Step Content ---
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Blood Type Selection */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplet className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">اختر فصيلة الدم المطلوبة 🩸</h2>
              <p className="text-gray-600">فصيلة دم المريض هي المفتاح للعثور على المتبرع المناسب</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bloodTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleBloodTypeSelect(type.value)}
                  className={`p-6 rounded-2xl border-2 transition-all transform hover:-translate-y-1 ${
                    selectedBloodType === type.value
                      ? `border-red-500 ${type.color} text-white shadow-lg scale-105`
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{type.label}</div>
                    <div className="text-sm opacity-75">
                      {selectedBloodType === type.value ? "✓ تم الاختيار" : "انقر للاختيار"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {errors.bloodType && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">⚠️ {errors.bloodType.message}</p>
              </div>
            )}

            {/* Units Needed */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">عدد وحدات الدم المطلوبة</h3>
                  <p className="text-gray-600 text-sm">كل وحدة دم = 450 مل ≈ كيس دم واحد</p>
                </div>
                <div className="text-3xl font-bold text-blue-600">{watchedValues.units} وحدة</div>
              </div>
              <input
                type="range"
                {...register("units", { valueAsNumber: true })}
                min="1"
                max="10"
                className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-blue-600"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-3">
                <span>1 وحدة</span>
                <span>5 وحدات</span>
                <span>10 وحدات</span>
              </div>
              {errors.units && <p className="mt-2 text-sm text-red-600">{errors.units.message}</p>}
            </div>

            {/* Urgency Level */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">درجة إلحاح الحالة 🚨</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {urgencyLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => handleUrgencySelect(level.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${selectedUrgency === level.value ? `border-red-500 ${level.bg}` : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${level.color} flex items-center justify-center`}>
                        <span className="text-white">{level.value === "critical" ? "🚨" : level.value === "high" ? "⚠️" : level.value === "normal" ? "📌" : "📋"}</span>
                      </div>
                      <div className="text-right flex-1">
                        <div className="font-bold text-gray-800">{level.label}</div>
                        <div className="text-sm text-gray-600">{level.description}</div>
                      </div>
                      {selectedUrgency === level.value && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hospital className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">تفاصيل الحالة 🏥</h2>
              <p className="text-gray-600">معلومات التواصل والموقع تساعد المتبرعين في الوصول إليك</p>
            </div>

            {/* City Selection */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>المدينة</span>
                  <span className="text-red-500">*</span>
                </div>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {cities.slice(0, 9).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setValue("city", city)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      watchedValues.city === city
                        ? "border-blue-500 bg-blue-50 text-blue-700 font-bold"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
              <select
                {...register("city")}
                className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.city ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">اختر مدينة أخرى...</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city && <p className="mt-2 text-sm text-red-600">{errors.city.message}</p>}
            </div>

            {/* Hospital */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4">
                <div className="flex items-center gap-2">
                  <Hospital className="w-5 h-5 text-green-600" />
                  <span>اسم المستشفى أو المركز الصحي</span>
                  <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                {...register("hospital")}
                type="text"
                className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.hospital ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="أدخل اسم المستشفى أو المركز الصحي"
              />
              {errors.hospital && <p className="mt-2 text-sm text-red-600">{errors.hospital.message}</p>}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  <span>رقم الهاتف للتواصل</span>
                  <span className="text-red-500">*</span>
                </div>
              </label>
              <div className="relative">
                <input
                  {...register("contactPhone")}
                  type="tel"
                  dir="ltr"
                  className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 ${
                    errors.contactPhone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="مثال: 771234567"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                
                </div>
              </div>
              {errors.contactPhone && <p className="mt-2 text-sm text-red-600">{errors.contactPhone.message}</p>}
              <p className="text-sm text-gray-500 mt-2">سيتم استخدام هذا الرقم للتواصل معك من قبل المتبرعين</p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-600" />
                  <span>ملاحظات إضافية (اختياري)</span>
                </div>
              </label>
              <textarea
                {...register("notes")}
                rows={4}
                className={`w-full py-3 px-4 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                  errors.notes ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="معلومات إضافية عن حالة المريض، وقت الزيارة المناسب، أي احتياجات خاصة..."
              />
              <div className="flex justify-between mt-2">
                <p className="text-sm text-gray-500">معلومات إضافية تساعد المتبرعين على الفهم</p>
                <span className="text-sm text-gray-500">{watchedValues.notes?.length || 0}/500</span>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        const urgency = urgencyLevels.find(u => u.value === watchedValues.urgency);
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">المراجعة النهائية ✅</h2>
              <p className="text-gray-600">تأكد من صحة المعلومات قبل الإرسال</p>
            </div>

            {/* Request Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
                        bloodTypes.find(b => b.value === watchedValues.bloodType)?.color || "from-gray-500 to-gray-600"
                      } flex items-center justify-center`}>
                        <Droplet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">فصيلة الدم المطلوبة</p>
                        <p className="text-2xl font-bold text-gray-900">{watchedValues.bloodType}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${urgency?.color} flex items-center justify-center`}>
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">درجة الإلحاح</p>
                        <p className="text-xl font-bold text-gray-900">{urgency?.label}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{urgency?.description}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <Hospital className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">المستشفى</p>
                        <p className="text-lg font-bold text-gray-900">{watchedValues.hospital}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <MapPin className="w-4 h-4" />
                      <span>{watchedValues.city}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">الاتصال</p>
                        <p className="text-lg font-bold text-gray-900" dir="ltr">{watchedValues.contactPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800">إجمالي الوحدات المطلوبة</p>
                        <p className="text-sm text-gray-600">لكل وحدة دم كيس 450 مل</p>
                      </div>
                      <div className="text-3xl font-bold text-red-600">{watchedValues.units}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Preview */}
              {watchedValues.notes && (
                <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    الملاحظات الإضافية
                  </h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{watchedValues.notes}</p>
                  </div>
                </div>
              )}

              {/* Estimated Time */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-bold text-gray-800">وقت الاستجابة المتوقع</p>
                    <p className="text-gray-600 text-sm">
                      بناءً على درجة الإلحاح، سيتم الرد على طلبك خلال:
                      <span className="font-bold text-blue-600 mr-2">
                        {watchedValues.urgency === "critical" ? "دقائق" :
                         watchedValues.urgency === "high" ? "ساعات" :
                         watchedValues.urgency === "normal" ? "يوم" : "يومين"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return <p>خطأ غير معروف</p>;
    }
  };

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
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">طلب تبرع بالدم 🚨</h1>
                  <p className="text-red-100 text-lg mt-3">طلبك للتبرع قد يكون الأمل الأخير لمريض</p>
                </div>
              </div>
              
              <p className="text-red-100 mb-6 max-w-2xl">
                كل طلب تبرع ينقذ حياة. املأ النموذج بدقة لنساعدك في العثور على المتبرع المناسب.
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
                    <Target className="w-20 h-20 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
            <div className="flex justify-between items-center mb-8">
              {steps.map((step, index) => {
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                
                return (
                  <div key={step} className="flex flex-col items-center relative">
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
                        <span className="font-bold text-lg">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      isActive ? "text-red-600" : isCompleted ? "text-green-600" : "text-gray-400"
                    }`}>
                      {step}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`absolute top-7 -left-16 w-28 h-0.5 ${
                        index < activeStep ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gray-300"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 right-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-500"
                style={{ width: `${((activeStep) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
              {getStepContent(activeStep)}
            {/* Step Content */}
            <div className="mb-8">
            
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 pt-8 border-t border-gray-200">
              <button 
                type="button"
                onClick={handleBack}
                disabled={activeStep === 0}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition ${
                  activeStep === 0
                    ? "border border-gray-300 text-gray-400 cursor-not-allowed"
                    : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                السابق
              </button>

              {activeStep < steps.length - 1 ? (
                <button 
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
                >
                  التالي
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </button>
              ) : (
                <button 
                  type="submit"
                  disabled={loading || !isValid}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg hover:from-red-600 hover:to-red-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      إرسال الطلب
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Important Information */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-600" />
              معلومات مهمة قبل الإرسال
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-700 mb-3">📝 ملاحظات مهمة:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>تأكد من صحة رقم الهاتف المدخل</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>حدد درجة الإلحاح بدقة لتسريع الاستجابة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>ستتلقى إشعارات بكل متبرع يقبل مساعدتك</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-700 mb-3">⏱️ وقت الاستجابة:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>حالات حرجة: استجابة خلال دقائق</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>حالات عالية: استجابة خلال ساعات</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>حالات متوسطة: استجابة خلال يوم</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}