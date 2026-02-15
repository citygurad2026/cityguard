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
  ArrowRight
} from "lucide-react";

export default function AdminEditJob() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
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

  // جلب بيانات الوظيفة
  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        setFetchLoading(true);
        // getJobById مسار عام - مايحتاج صلاحيات
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
          
          toast.success("تم تحميل بيانات الوظيفة");
        }
      } catch (err: any) {
        console.error("خطأ في جلب البيانات:", err);
        toast.error(err.response?.data?.message || "فشل في جلب بيانات الوظيفة");
        
        // إذا فشل التحميل - رجوع للصفحة السابقة
        setTimeout(() => router.push("/AdminJobs"), 2000);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchJob();
  }, [id, router]);

  // تحديث الوظيفة - ADMIN + OWNER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setLoading(true);
      
      const res = await Axios({
        ...SummaryApi.job.updateJob(id),
        data: formData
      });
      
      if (res.data.success) {
        toast.success("✅ تم تحديث الوظيفة بنجاح");
        router.push("/AdminJobs"); // الرجوع لصفحة إدارة الوظائف
        router.refresh();
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

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6 font-cairo" dir="rtl">
        <div className="max-w-4xl mx-auto flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات الوظيفة...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6 font-cairo" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header - نفس تنسيق AdminController */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Briefcase className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">تعديل الوظيفة</h1>
                <p className="text-gray-600 mt-1">تعديل بيانات الوظيفة - صلاحية المدير</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link 
                href="/AdminJobs" 
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                عودة
              </Link>
            </div>
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all" 
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none" 
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all" 
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all" 
                />
              </div>
            </div>

            {/* نوع الوظيفة والراتب */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  نوع الوظيفة
                </label>
                <select 
                  name="type" 
                  value={formData.type} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 appearance-none bg-white"
                >
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all" 
                />
              </div>
            </div>

            {/* تاريخ الانتهاء */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  تاريخ انتهاء الوظيفة
                </div>
              </label>
              <input 
                type="date" 
                name="expiresAt" 
                value={formData.expiresAt} 
                onChange={handleChange} 
                className="w-full md:w-auto px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all" 
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
                className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-400" 
              />
              <label htmlFor="isActive" className="text-gray-700">
                الوظيفة نشطة (ظاهرة للباحثين)
              </label>
            </div>

           
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              href="/AdminJobs" 
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