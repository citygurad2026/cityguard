"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Axios from "../../utilts/Axios";
import SummaryApi from "../../common/SummaryApi";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Calendar,
  Image,
  Smartphone,
  Tablet,
  Globe,
  Type,
  Palette,
  Loader2,
  AlertCircle,

} from "lucide-react";

interface AdminUser {
  id: number;
  name?: string;
  username: string;
  role: "ADMIN" | "OWNER";
  accessToken: string;
}

interface Ad {
  id: number;
  title: string;
  content: string;
  bannerType: string;
  startAt: string;
  endAt: string;
  ctaText?: string;
  ctaUrl?: string;
  url?: string;
  backgroundColor?: string;
  textColor?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  tabletImageUrl?: string;
  status?: string;
  rejectionReason?: string;
}
interface Business {
  id: number;
  name: string;
}

export default function EditAdAdminPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  
  const user = useSelector(
    (state: RootState) => state.user.user
  ) as AdminUser | null;
  const [loading, setLoading] = useState(false);

  const [isClient, setIsClient] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    bannerType: "MAIN_HERO",
    startAt: "",
    endAt: "",
    ctaText: "",
    ctaUrl: "",
    url: "",
    backgroundColor: "#ffffff",
    textColor: "#000000",
      targetType: user?.role === "ADMIN" ? "EXTERNAL" : "BUSINESS",
  targetId: "",
  });

  const [existingImages, setExistingImages] = useState({
    image: "",
    mobileImage: "",
    tabletImage: "",
  });

  const [newImages, setNewImages] = useState({
    image: null as File | null,
    mobileImage: null as File | null,
    tabletImage: null as File | null,
  });

  const [previews, setPreviews] = useState({
    image: "",
    mobileImage: "",
    tabletImage: "",
  });

  const [token, setToken] = useState<string | null>(null);
  const [adData, setAdData] = useState<Ad | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
    useEffect(() => {
    const fetchBusinesses = async () => {
      
      try {
        const res = await Axios({
          ...SummaryApi.owner.get_bus,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
          setBusinesses(res.data.data);
        
      } catch (error: any) {
        console.error("فشل جلب المتاجر", error);
        setBusinesses([]);
      } 
    };

    fetchBusinesses();
  }, [token]);
  useEffect(() => {
    setIsClient(true);
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (isClient && (!user || user.role !== "ADMIN")) {
      router.push("/");
    }
  }, [user, router, isClient]);

  useEffect(() => {
    const fetchAdData = async () => {
      try {
        setLoading(true);
        const res = await Axios({
          ...SummaryApi.ad.get_ad_by_id(id),
          headers: { Authorization: `Bearer ${token}` },
        });
        const ad = res.data.ad;
        setAdData(ad);

        setFormData({
          title: ad.title || "",
          content: ad.content || "",
          bannerType: ad.bannerType || "MAIN_HERO",
          startAt: ad.startAt
            ? new Date(ad.startAt).toISOString().slice(0, 16)
            : "",
          endAt: ad.endAt ? new Date(ad.endAt).toISOString().slice(0, 16) : "",
          ctaText: ad.ctaText || "",
          ctaUrl: ad.ctaUrl || "",
          url: ad.url || "",
          backgroundColor: ad.backgroundColor || "#ffffff",
          textColor: ad.textColor || "#000000",
          targetType: ad.targetType || "EXTERNAL",
          targetId: ad.targetId ? String(ad.targetId) : "",
        });

        setExistingImages({
          image: ad.imageUrl || "",
          mobileImage: ad.mobileImageUrl || "",
          tabletImage: ad.tabletImageUrl || "",
        });

        setPreviews({
          image: ad.imageUrl || "",
          mobileImage: ad.mobileImageUrl || "",
          tabletImage: ad.tabletImageUrl || "",
        });
      } catch (error: any) {
        console.error("Error fetching ad:", error);
        toast.error(
          error.response?.data?.message || "فشل في تحميل بيانات الإعلان"
        );
        router.push("/AdminAds");
      } finally {
        setLoading(false);
      }
    };
    fetchAdData()
  }, [token, id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: keyof typeof newImages
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن لا يتجاوز 5MB");
      return;
    }

    setNewImages((prev) => ({ ...prev, [type]: file }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviews((prev) => ({ ...prev, [type]: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type: keyof typeof newImages) => {
    setNewImages((prev) => ({ ...prev, [type]: null }));
    setPreviews((prev) => ({
      ...prev,
      [type]: existingImages[type as keyof typeof existingImages],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.startAt || !formData.endAt) {
      toast.error("يرجى ملء الحقول الإلزامية (*)");
      return;
    }
    if (new Date(formData.endAt) <= new Date(formData.startAt)) {
      toast.error("تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء");
      return;
    }
    if (!previews.image) {
      toast.error("يرجى تحميل صورة رئيسية للإعلان");
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });
      if (newImages.image) formDataToSend.append("image", newImages.image);
      if (newImages.mobileImage)
        formDataToSend.append("mobileImage", newImages.mobileImage);
      if (newImages.tabletImage)
        formDataToSend.append("tabletImage", newImages.tabletImage);

      const res = await Axios({
        ...SummaryApi.ad.update_ad(id),
        data: formDataToSend,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.ok) {
        toast.success("تم تحديث الإعلان بنجاح");
        router.push("/AdminAds");
      } else {
        toast.error(res.data.message || "حدث خطأ أثناء تحديث الإعلان");
      }
    } catch (err: any) {
      console.error("Update ad error:", err);
      toast.error(err.response?.data?.message || "فشل في تحديث الإعلان");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6 font-cairo"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/AdminAds")}
                className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  تعديل الإعلان
                </h1>
                <p className="text-gray-600 mt-1">
                  تعديل الإعلان وإعادة إرساله للمراجعة
                </p>
              </div>
            </div>

            {adData?.status === "REJECTED" && adData?.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-1">
                      سبب الرفض السابق:
                    </h4>
                    <p className="text-red-700 text-sm">
                      {adData.rejectionReason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* المعلومات الأساسية */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  <Type className="w-5 h-5 inline ml-2" /> المعلومات الأساسية
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان الإعلان *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="أدخل عنوان الإعلان"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع البانر *
                    </label>
                    <select
                      name="bannerType"
                      value={formData.bannerType}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="MAIN_HERO">بانر رئيسي</option>
                      <option value="SIDE_BAR">شريط جانبي</option>
                      <option value="POPUP">نافذة منبثقة</option>
                    </select>
                  </div>

                  {/* نوع الإعلان */}
                  {user?.role === "OWNER" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اختر المتجر *
                      </label>
                      <select
                        name="targetId"
                        value={formData.targetId}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                      >
                        <option value="">اختر المتجر</option>
                        {businesses.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {user?.role === "ADMIN" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع الإعلان *
                      </label>
                      <select
                        name="targetType"
                        value={formData.targetType}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                      >
                        <option value="EXTERNAL">إعلان خارجي عام</option>
                        <option value="BUSINESS">إعلان لمتجر</option>
                        <option value="LISTING">إعلان لقائمة</option>
                        <option value="CATEGORY">إعلان لفئة</option>
                      </select>
                    </div>
                  )}

                  {(formData.targetType === "BUSINESS" ||
                    user?.role === "OWNER") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اختر المتجر *
                      </label>
                      <select
                        name="targetId"
                        value={formData.targetId}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                      >
                        <option value="">اختر المتجر</option>
                        {businesses.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      محتوى الإعلان *
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="أدخل محتوى الإعلان..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* الصور */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                  <Image className="w-5 h-5" /> صور الإعلان
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Desktop */}
                  <div>
                    <label className="block text-sm mb-2">
                      صورة سطح المكتب *
                    </label>
                    {previews.image ? (
                      <div className="relative">
                        <img
                          src={previews.image}
                          className="rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage("image")}
                          className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center border-2 border-dashed rounded-lg h-32 cursor-pointer">
                        <Upload />
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "image")}
                        />
                      </label>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-sm mb-2">صورة الجوال</label>
                    {previews.mobileImage ? (
                      <div className="relative">
                        <img
                          src={previews.mobileImage}
                          className="rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage("mobileImage")}
                          className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center border-2 border-dashed rounded-lg h-32 cursor-pointer">
                        <Smartphone />
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "mobileImage")}
                        />
                      </label>
                    )}
                  </div>

                  {/* Tablet */}
                  <div>
                    <label className="block text-sm mb-2">صورة التابلت</label>
                    {previews.tabletImage ? (
                      <div className="relative">
                        <img
                          src={previews.tabletImage}
                          className="rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage("tabletImage")}
                          className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center border-2 border-dashed rounded-lg h-32 cursor-pointer">
                        <Tablet />
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "tabletImage")}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* التواريخ */}
              <div>
                <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> مدة الإعلان
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">
                      تاريخ البداية *
                    </label>
                    <input
                      type="datetime-local"
                      name="startAt"
                      value={formData.startAt}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">
                      تاريخ النهاية *
                    </label>
                    <input
                      type="datetime-local"
                      name="endAt"
                      value={formData.endAt}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* الألوان */}
              <div>
                <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                  <Palette className="w-5 h-5" /> الألوان
                </h2>

                <div className="flex gap-6">
                  <div>
                    <label className="block text-sm mb-2">لون الخلفية</label>
                    <input
                      type="color"
                      name="backgroundColor"
                      value={formData.backgroundColor}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">لون النص</label>
                    <input
                      type="color"
                      name="textColor"
                      value={formData.textColor}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* الروابط */}
              <div>
                <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                  <Globe className="w-5 h-5" /> الروابط
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="ctaText"
                    value={formData.ctaText}
                    onChange={handleChange}
                    placeholder="نص زر الدعوة (CTA)"
                    className="border rounded-lg px-4 py-2"
                  />
                  <input
                    type="url"
                    name="ctaUrl"
                    value={formData.ctaUrl}
                    onChange={handleChange}
                    placeholder="رابط زر الدعوة"
                    className="border rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              {/* رابط الإعلان */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الإعلان
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url} // 👈 يعرض الرابط المحفوظ
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 border rounded-lg"
                />
              </div>

              {/* أزرار التحكم */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => router.push("/AdminAds")}
                  className="px-6 py-2 border rounded-lg"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  حفظ التعديلات
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
