"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Axios from "@/app/utilts/Axios";
import { toast } from "react-hot-toast";
import Link from "next/link";
import SummaryApi from "@/app/common/SummaryApi";
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Save,
  X,
  MapPin,
  Calendar,
  AlertCircle
} from "lucide-react";

export default function EditJob() {
  const router = useRouter();

  
   const params = useParams<{ id: string }>();
    const id = params.id;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    region: "",
    type: "عام",
    salary: "",
    expiresAt: "",
    isActive: true
  });

  const jobTypes = [
    "عام","تقنية معلومات","محاسبة","تسويق","مبيعات","هندسة","طب",
    "تعليم","إدارة","خدمة عملاء","موارد بشرية","قانون","إعلام",
    "سياحة","فندقة","أمن","نقل","مقاولات","صيانة","أخرى"
  ];

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        setFetchLoading(true);
        const res = await Axios(SummaryApi.job.getJobById(id));
        
        if (res.data.success) {
          const job = res.data.data;
          
          setFormData({
            title: job.title || "",
            description: job.description || "",
            city: job.city || "",
            region: job.region || "",
            type: job.type || "عام",
            salary: job.salary ? String(job.salary) : "",
            expiresAt: job.expiresAt ? job.expiresAt.split("T")[0] : "",
            isActive: job.isActive ?? true
          });
          
          // تأكيد ظهور البيانات
          console.log("تم تحميل بيانات الوظيفة:", job);
          toast.success("تم تحميل بيانات الوظيفة");
        }
      } catch (err: any) {
        console.error("خطأ في جلب البيانات:", err);
        toast.error(err.response?.data?.message || "فشل في جلب بيانات الوظيفة");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setLoading(true);
      
      // ✅ الطريقة الصحيحة لتحديث الوظيفة
      const res = await Axios({
        ...SummaryApi.job.updateJob(id),
        data: formData
      });
      
      if (res.data.success) {
        toast.success("✅ تم تحديث الوظيفة بنجاح");
        router.push("/OwnerjobAdmin");
        router.refresh(); // تحديث الصفحة الرئيسية
      }
    } catch (err: any) {
      console.error("خطأ في التحديث:", err);
      toast.error(err.response?.data?.message || "فشل في تحديث الوظيفة");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // عرض مؤشر التحميل أثناء جلب البيانات
  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6 font-cairo" dir="rtl">
        <div className="max-w-4xl mx-auto flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات الوظيفة...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6 font-cairo" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">تعديل الوظيفة</h1>
                <p className="text-gray-600 mt-1">تعديل بيانات الوظيفة الموجودة</p>
              </div>
            </div>
            <Link href="/OwnerjobAdmin" className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
              <X className="w-6 h-6" />
            </Link>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          onSubmit={handleSubmit} 
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
        >
          <div className="space-y-6">
            {/* عنوان الوظيفة */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                عنوان الوظيفة <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                placeholder="مثال: موظف مبيعات" 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
                required 
              />
            </div>

            {/* وصف الوظيفة */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                وصف الوظيفة
              </label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows={5} 
                placeholder="اكتب وصفاً مفصلاً للوظيفة والمتطلبات..." 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none" 
              />
            </div>

            {/* المدينة والمنطقة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    المدينة
                  </div>
                </label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  placeholder="مدينة اب" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  المنطقة
                </label>
                <input 
                  type="text" 
                  name="region" 
                  value={formData.region} 
                  onChange={handleChange} 
                  placeholder="القاعدة" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
                />
              </div>
            </div>

            {/* نوع الوظيفة والراتب */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  نوع الوظيفة
                </label>
                <div className="relative">
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 appearance-none bg-white"
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  الراتب
                </label>
                <input 
                  type="text" 
                  name="salary" 
                  value={formData.salary} 
                  onChange={handleChange} 
                  placeholder="مثال: 80000-120000 ريال" 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
                />
              </div>
            </div>

            {/* تاريخ الانتهاء */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  تاريخ انتهاء الوظيفة (اختياري)
                </div>
              </label>
              <input 
                type="date" 
                name="expiresAt" 
                value={formData.expiresAt} 
                onChange={handleChange} 
                className="w-full md:w-auto px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all" 
              />
              <p className="text-sm text-gray-500 mt-2">
                اتركه فارغاً إذا كانت الوظيفة مفتوحة
              </p>
            </div>

            {/* حالة الوظيفة */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input 
                type="checkbox" 
                id="isActive" 
                name="isActive" 
                checked={formData.isActive} 
                onChange={handleChange} 
                className="w-5 h-5 text-green-500 rounded focus:ring-green-400" 
              />
              <label htmlFor="isActive" className="text-gray-700">
                نشر الوظيفة مباشرة (نشطة)
              </label>
            </div>

            {/* ملاحظات */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                سيتم نشر الوظيفة في منشأتك التجارية المسجلة. يمكنك تعديل أو إلغاء الوظيفة في أي وقت من صفحة إدارة الوظائف.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري التحديث...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  تحديث الوظيفة
                </>
              )}
            </button>
            <Link 
              href="/OwnerjobAdmin" 
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
              إلغاء
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}