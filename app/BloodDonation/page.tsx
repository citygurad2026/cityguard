"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Axios from "../utilts/Axios";
import SummaryApi from "../common/SummaryApi";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

interface BloodRequest {
  id: number;
  bloodType: string;
  hospital?: string;
  city?: string;
  notes?: string;
  urgency: string;
  units: number;
  status: string;
  contactPhone?: string;
  expiresAt?: string;
  createdAt: string;
  requester?: {
    name: string;
  };
}

interface BloodRequestStatistics {
  totalRequests: number;
  openRequests: number;
  fulfilledRequests: number;
  urgentRequests: number;
  requestsByBloodType: Array<{ bloodType: string; _count: { id: number } }>;
  requestsByCity: Array<{ city: string; _count: { id: number } }>;
  fulfillmentRate: number;
}
      


/* ================= PAGE ================= */

export default function BloodDonationPage() {
  const [urgentRequests, setUrgentRequests] = useState<BloodRequest[]>([]);
  const [stats, setStats] = useState<BloodRequestStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const fetchData = async () => {
  try {
    setLoading(true);

    // جلب الطلبات العاجلة
    const urgentRes = await Axios({
      ...SummaryApi.blood_req.searchBloodRequests,
      params: {
        urgency: "critical",
        status: "open",
        limit: 6,
      },
    });
    if (urgentRes.data?.success) {
      setUrgentRequests(urgentRes.data.data || []);
    }

    // جلب إحصائيات الدم
    const statsRes = await Axios({
      ...SummaryApi.blood_req.bloodRequestsStatistics,
    });
    if (statsRes.data?.success) {
      setStats(statsRes.data.data);
    }

  } catch (err: any) {
    setError(
      err?.response?.data?.message ||
        "حدث خطأ أثناء تحميل بيانات التبرع بالدم"
    );
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchData();
}, []);



  /* ================= LOADING & ERROR ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-red-600 rounded-full animate-pulse" />
            </div>
          </div>
          <h3 className="mt-6 text-xl font-bold text-gray-800">جاري تحميل بيانات التبرع</h3>
          <p className="text-gray-600 mt-2">نحضر لك أحدث الطلبات والإحصائيات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">عذراً!</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      dir="rtl"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-800/10" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                كل قطرة <span className="text-red-600">تنقذ</span> حياة
              </h1>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                انضم إلى مجتمع الأبطال الذين يمنحون الأمل ويغيرون مصائر. تبرعك
                بالدم قد يكون الفارق بين الحياة والموت لمحتاج.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/BloodDonorRegister"
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:from-red-700 hover:to-red-800 transition shadow-lg"
                >
                  كن بطلاً وانقذ حياة
                </Link>
                <Link
                  href="/BloodRequestCreate"
                  className="bg-white text-red-600 border-2 border-red-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-50 transition shadow-lg"
                >
                  اطلب تبرع عاجل
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-100 rounded-full" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-red-200 rounded-full" />
                <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg
                        className="w-12 h-12 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      تبرعك ينقذ 3 أرواح
                    </h3>
                    <p className="text-gray-600">
                      كل تبرع واحد يمكن فصله إلى 3 مكونات تنقذ 3 حيوات مختلفة
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8" dir="rtl">
        {/* Statistics Section */}
        {stats && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                أرقام تدعو للفخر
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                إنجازات مجتمع المتبرعين بالدم تنمو كل يوم بفضل أبطال مثلك
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="طلبات نشطة"
                value={stats.openRequests}
                description="طلبات تحتاج متبرعين الآن"
                icon="📋"
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                title="طلبات مكتملة"
                value={stats.fulfilledRequests}
                description="أرواح تم إنقاذها"
                icon="✅"
                color="from-green-500 to-green-600"
              />
              <StatCard
                title="طلبات عاجلة اليوم"
                value={stats.urgentRequests}
                description="حالات طارئة"
                icon="🚨"
                color="from-red-500 to-red-600"
              />
              <StatCard
                title="نسبة الاستجابة"
                value={`${stats.fulfillmentRate}%`}
                description="سرعة الاستجابة"
                icon="⚡"
                color="from-purple-500 to-purple-600"
              />
            </div>
            <div className="flex justify-center mt-6 mb-6">
              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition transform font-bold"
              >
                ⬅ العودة للصفحة الرئيسية
              </button>
            </div>

            {/* Additional Stats */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-right">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {stats.livesSaved || 1247}
                  </div>
                  <div className="text-gray-700 font-medium">
                    حياة تم إنقاذها
                  </div>
                </div>
                <div className="h-16 w-px bg-red-200 hidden md:block" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {stats.totalRequests || 568}
                  </div>
                  <div className="text-gray-700 font-medium">طلب تبرع</div>
                </div>
                <div className="h-16 w-px bg-red-200 hidden md:block" />
                <div className="text-center md:text-left">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    100%
                  </div>
                  <div className="text-gray-700 font-medium">
                    رضا المستفيدين
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Urgent Requests Section - Slide Version */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                طلبات عاجلة 🚨
              </h2>
              <p className="text-gray-600">
                حالات طارئة تحتاج إلى استجابة فورية
              </p>
            </div>
            <Link
              href="/BloodRequestsList"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:shadow-lg hover:from-red-700 hover:to-red-800 transition shadow-lg"
            >
              عرض جميع الطلبات
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>

          {urgentRequests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                لا توجد طلبات عاجلة حالياً
              </h3>
              <p className="text-gray-600 mb-6">
                جميع الحالات الطارئة تلقت استجابة. يمكنك المساعدة في الطلبات
                الأخرى.
              </p>
              <Link
                href="/BloodRequestsList"
                className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:from-green-700 hover:to-green-800 transition shadow-lg"
              >
                تصفح جميع الطلبات
              </Link>
            </div>
          ) : (
            <>
              {/* Slider Container */}
              <div className="relative overflow-hidden">
                <div className="flex overflow-x-auto pb-6 scrollbar-hide space-x-6 snap-x snap-mandatory">
                  {urgentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 snap-center"
                    >
                      <UrgentRequestCardSlide request={request} />
                    </div>
                  ))}
                </div>

                {/* Slider Navigation Buttons */}
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    onClick={() => {
                      const container =
                        document.querySelector(".overflow-x-auto");
                      if (container) {
                        container.scrollBy({ left: -400, behavior: "smooth" });
                      }
                    }}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 text-white flex items-center justify-center hover:shadow-lg transition shadow-lg"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <div className="flex items-center gap-2">
                    {urgentRequests.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const container =
                            document.querySelector(".overflow-x-auto");
                          if (container) {
                            const cardWidth =
                              window.innerWidth < 768
                                ? container.scrollWidth / urgentRequests.length
                                : 400;
                            container.scrollTo({
                              left: index * cardWidth,
                              behavior: "smooth",
                            });
                          }
                        }}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === 0
                            ? "bg-gradient-to-r from-red-600 to-red-700 w-8"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const container =
                        document.querySelector(".overflow-x-auto");
                      if (container) {
                        container.scrollBy({ left: 400, behavior: "smooth" });
                      }
                    }}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 text-white flex items-center justify-center hover:shadow-lg transition shadow-lg"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Auto-scroll notice */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-pulse"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  اسحب للتقل بين الطلبات أو استخدم الأزرار
                </p>
              </div>
            </>
          )}
        </div>

        {/* Actions Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              كيف يمكنك المساعدة؟
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              اختر الطريقة المناسبة لك وساهم في إنقاذ الأرواح
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ActionCard
              title="طلب تبرع"
              description="هل تحتاج إلى متبرع بالدم لنفسك أو لأحد أحبائك؟ قدم طلبك الآن"
              icon="🩸"
              color="from-red-500 to-red-600"
              link="/BloodRequestCreate"
              buttonText="أطلب تبرع"
            />
            <ActionCard
              title="التسجيل كمتبرع"
              description="انضم إلى مجتمع الأبطال وسجل بياناتك لمساعدة المحتاجين"
              icon="❤️"
              color="from-green-500 to-green-600"
              link="/BloodDonorRegister"
              buttonText="سجل الآن"
            />
            <ActionCard
              title="تصفح المتبرعين"
              description="ابحث عن متبرعين بالقرب منك واتصل بهم مباشرة"
              icon="👨‍⚕️"
              color="from-blue-500 to-blue-600"
              link="/BloodDonorsList"
              buttonText="تصفح الآن"
            />
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 mb-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="lg:w-1/2">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                معلومات عن التبرع بالدم
              </h3>
              <ul className="space-y-4">
                <InfoItem text="التبرع بالدم آمن ولا يشكل أي خطر على المتبرع" />
                <InfoItem text="تستغرق عملية التبرع من 5 إلى 10 دقائق فقط" />
                <InfoItem text="يمكن للجسم تعويض الدم المتبرع به خلال 24-48 ساعة" />
                <InfoItem text="يمكن التبرع بالدم كل 3 أشهر للرجال وكل 4 أشهر للنساء" />
                <InfoItem text="يتم فحص كل وحدة دم للتأكد من سلامتها للمستفيد" />
              </ul>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  شروط التبرع
                </h4>
                <div className="space-y-3">
                  <ConditionItem text="العمر من 18 إلى 65 سنة" />
                  <ConditionItem text="الوزن لا يقل عن 50 كجم" />
                  <ConditionItem text="مستوى الهيموجلوبين 12.5 جم/ديسيلتر للنساء و13.5 جم/ديسيلتر للرجال" />
                  <ConditionItem text="عدم الإصابة بأي أمراض معدية" />
                  <ConditionItem text="عدم تناول أي أدوية مؤخراً" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">الوقت ينفد!</h2>
          <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
            كل 3 ثوانٍ، شخص ما في حاجة إلى نقل الدم. تبرعك بالدم قد يكون الأمل
            الأخير لمريض. لا تتردد، سجل كمتبرع الآن.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/BloodDonorRegister"
              className="bg-white text-red-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-red-50 transition shadow-lg"
            >
              سجل كمتبرع
            </Link>
            <Link
              href="/BloodRequestsList"
              className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition"
            >
              تصفح الطلبات العاجلة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  color 
}: { 
  title: string; 
  value: number | string; 
  description: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
      <div className="flex items-center justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        <div className={`w-14 h-14 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center`}>
          <span className="text-white text-2xl">❤️</span>
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-2">{value}</div>
      <div className="text-lg font-medium text-gray-700 mb-1">{title}</div>
      <div className="text-sm text-gray-500">{description}</div>
      <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: '100%' }} />
      </div>
    </div>
  );
}

function UrgentRequestCardSlide({ request }: { request: BloodRequest }) {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "الآن";
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    return `منذ ${Math.floor(diffInHours / 24)} يوم`;
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

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "critical": return "🚨";
      case "high": return "⚠️";
      case "normal": return "📌";
      case "low": return "📋";
      default: return "📌";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Card Header with Pulse Animation */}
      <div className="relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -mr-6 -mt-6" />
        <div className="absolute top-0 left-0 w-16 h-16 bg-red-300/20 rounded-full -ml-4 -mt-4" />
        
        <div className="p-6 relative">
          {/* Blood Type & Urgency Badge */}
          <div className="flex justify-between items-start mb-4">
            <div className={`px-5 py-2.5 rounded-full text-white font-bold text-lg shadow-lg ${getBloodTypeColor(request.bloodType)}`}>
              {request.bloodType}
            </div>
            
            <div className="flex flex-col items-end">
              <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-bold mb-2 shadow-sm">
                {getUrgencyIcon(request.urgency)} {request.urgency === "critical" ? "عاجل" : request.urgency === "high" ? "عالي" : "طبيعي"}
              </span>
              
              {/* Time Badge */}
              <div className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {getTimeAgo(request.createdAt)}
              </div>
            </div>
          </div>

          {/* Hospital & Location */}
          <div className="mb-5">
            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
              {request.hospital || "مستشفى غير محدد"}
            </h3>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{request.city || "غير محدد"}</span>
            </div>
          </div>

          {/* Notes Preview */}
          {request.notes && (
            <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-gray-600 text-sm line-clamp-2">{request.notes}</p>
              </div>
            </div>
          )}

          {/* Units Needed with Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">الوحدات المطلوبة</span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {request.units} وحدة
              </span>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-full animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>{request.units}</span>
            </div>
          </div>

          {/* Action Button */}
          <Link
            href={`/BloodRequestDetail/${request.id}`}
            className="block w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-center hover:shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              تبرع الآن وانقذ حياة
            </div>
            <div className="text-xs text-red-200 mt-1">استجابة سريعة مطلوبة</div>
          </Link>

          {/* Contact Info */}
          {request.contactPhone && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span>الاتصال: </span>
                <span className="font-bold text-gray-800" dir="ltr">{request.contactPhone}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  color,
  link,
  buttonText
}: {
  title: string;
  description: string;
  icon: string;
  color: string;
  link: string;
  buttonText: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition transform hover:-translate-y-1">
      <div className={`w-20 h-20 ${color} rounded-full flex items-center justify-center mx-auto mb-6`}>
        <span className="text-3xl text-white">{icon}</span>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <Link
        href={link}
        className={`inline-block bg-gradient-to-r ${color} text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition`}
      >
        {buttonText}
      </Link>
    </div>
  );
}

function InfoItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="text-gray-700">{text}</span>
    </li>
  );
}

function ConditionItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 bg-red-500 rounded-full" />
      <span className="text-gray-700">{text}</span>
    </div>
  );
}
<style jsx global>{`
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`}</style>