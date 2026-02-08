"use client";
import { useEffect, useState } from "react";
import Axios from "../utilts/Axios";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import SummaryApi from "../common/SummaryApi";
import { motion } from "framer-motion";
import { 
  User, 
  Phone, 
  Shield, 
  Heart, 
  Bookmark, 
  Bell, 
  Calendar,
  Edit3,
  Star,
  ChevronRight,
  Crown,
  Mail,
  Droplet,
  Target,
  History,
  BarChart,
  Settings,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import Link from "next/link";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Review {
  id: number;
  businessId: number;
  userId: number;
  rating: number;
  title?: string;
  comment?: string;
  status: ReviewStatus;
  isVerified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
  business?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface UserData {
  id: number;
  username: string;
  name?: string;
  phone?: string;
  role: "USER";
  isActive: boolean;
  avatarUrl?: string;
  lastLogin?: string;
  bio?: string;
  createdAt: string;
  city?: string;

  reviews?: Review[]; // ✅ الحل هنا

  _count?: {
    reviews: number;
    favorites: number;
    bookmarks: number;
    sentMessages?: number;
  };

  favorites?: {
    business: {
      id: number;
      name: string;
      slug: string;
      category?: string;
    };
  }[];

  notifications?: {
    id: number;
    title: string;
    message: string;
    isRead: boolean;
    sentAt: string;
  }[];

  isDonor?: boolean;
  donorInfo?: {
    bloodType?: string;
    totalDonations?: number;
    lastDonation?: string;
    isAvailable?: boolean;
  };
}


interface StoreUser {
  id: number;
  name?: string;
  username: string;
  role: "USER" | "ADMIN";
  accessToken: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state: RootState) => state.user.user) as StoreUser | null;
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (!user) {
          toast.error("يرجى تسجيل الدخول أولاً");
          setLoading(false);
          return;
        }
        
        const response = await Axios({
          ...SummaryApi.user.getUserById(user.id),
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });

        const data = response.data.data;
        
        // جلب معلومات المتبرع إذا كان متبرعاً
        let donorInfo = null;
        if (user.role === "USER") {
          try {
            const donorRes = await Axios({
              ...SummaryApi.bloodDonors.getMyDonorProfile,
              headers: { Authorization: `Bearer ${user.accessToken}` },
            });
            
            if (donorRes.data.success) {
              donorInfo = {
                bloodType: donorRes.data.data.bloodType,
                totalDonations: donorRes.data.data.totalDonations || 0,
                lastDonation: donorRes.data.data.lastDonation,
                isAvailable: donorRes.data.data.isAvailable
              };
            }
          } catch (error) {
            // المستخدم ليس متبرعاً بعد
            console.log("User is not a donor yet");
          }
        }

        setUserData({
          ...data,
          isDonor: !!donorInfo,
          donorInfo
        });
        
      } catch (err: any) {
        console.error("Error fetching user data:", err.response?.data || err.message);
        toast.error("حدث خطأ في تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

 const stats = [
  {
    label: "المفضلات",
    value: userData?._count?.favorites || 0,
    icon: Heart,
    gradient: "from-red-500 to-pink-600",
    description: "الأعمال المفضلة لديك",
  },
  {
    label: "المحفوظات",
    value: userData?._count?.bookmarks || 0,
    icon: Bookmark,
    gradient: "from-blue-500 to-cyan-600",
    description: "الأعمال المحفوظة",
  },
  {
    label: "الإشعارات",
    value: userData?.notifications?.filter(n => !n.isRead).length || 0,
    icon: Bell,
    gradient: "from-green-500 to-emerald-600",
    description: "إشعارات غير مقروءة",
  },
  {
    label: "التقييمات",
    value: userData?._count?.reviews || 0,
    icon: Star,
    gradient: "from-yellow-500 to-amber-600",
    description: "التقييمات المقدمة",
  },
];


  const quickActions = [
    {
      title: "تعديل الملف",
      description: "عدل معلوماتك الشخصية",
      icon: Edit3,
      color: "from-blue-500 to-blue-600",
      href: "/UserProfileEdit"
    },
  ];

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
          <h3 className="mt-6 text-xl font-bold text-gray-800">جاري تحميل بياناتك الشخصية</h3>
          <p className="text-gray-600 mt-2">نحضر لك أحدث المعلومات والإحصائيات...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">عذراً!</h3>
          <p className="text-gray-600 mb-6">لم نتمكن من تحميل بيانات حسابك</p>
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
      
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 py-12 relative">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Crown className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">ملفك الشخصي 👑</h1>
                  <p className="text-gray-300 text-lg mt-2">كل معلوماتك في مكان واحد</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button
                  onClick={() => router.push("/")}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition border border-white/30"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" />
                  العودة للرئيسية
                </button>
                
                <Link
                  href="/UserProfileEdit"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition font-bold"
                >
                  <Edit3 className="w-5 h-5" />
                  تعديل الملف
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <div className="w-40 h-40 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center border-4 border-white">
                    {userData.avatarUrl ? (
                      <Image
                        src={userData.avatarUrl}
                        alt={userData.name || userData.username}
                        width={128}
                        height={128}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-28 h-28 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                        {userData.name?.charAt(0) || userData.username?.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 -mt-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl">✨</div>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</div>
                <div className="text-lg font-medium text-gray-700 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.description}</div>
                <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`} style={{ width: '100%' }} />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="space-y-8">

            {/* Profile Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">معلومات الحساب 🪪</h2>
                <p className="text-gray-600">تفاصيل حسابك الشخصية</p>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-6 h-6 text-blue-600" />
                    <p className="font-medium text-gray-800">الاسم</p>
                  </div>
                  <p className="font-bold text-gray-800 text-lg">{userData.name || userData.username}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="w-6 h-6 text-purple-600" />
                    <p className="font-medium text-gray-800">رقم الهاتف</p>
                  </div>
                  <p className="font-bold text-gray-800 text-lg" dir="ltr">
                    {userData.phone || "غير متوفر"}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck className="w-6 h-6 text-orange-600" />
                    <p className="font-medium text-gray-800">حالة الحساب</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-800">{userData.isActive ? "نشط" : "غير نشط"}</p>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      userData.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {userData.isActive ? "🟢" : "⚪"}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-6 h-6 text-gray-600" />
                    <p className="font-medium text-gray-800">تاريخ الانضمام</p>
                  </div>
                  <p className="font-bold text-gray-800">
                    {new Date(userData.createdAt).toLocaleDateString('ar-SA', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Blood Donation Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">التبرع بالدم ❤️</h2>
                <p className="text-gray-600">انضم إلى مجتمع المنقذين</p>
              </div>

              {userData.isDonor ? (
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800">فصيلة الدم</p>
                        <p className="text-sm text-gray-600">فصيلة دمك المنقذة</p>
                      </div>
                      <div className={`px-4 py-2 rounded-lg text-white font-bold ${userData.donorInfo?.bloodType ? 
                        "bg-gradient-to-r from-red-500 to-red-600" : 
                        "bg-gradient-to-r from-gray-500 to-gray-600"}`}>
                        {userData.donorInfo?.bloodType || "غير محدد"}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-800">عدد التبرعات</p>
                        <p className="text-sm text-gray-600">أرواح أنقذتها</p>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {userData.donorInfo?.totalDonations || 0}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/BloodDonorProfile"
                    className="block w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-center hover:shadow-lg hover:from-red-700 hover:to-red-800 transition shadow-lg"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Droplet className="w-5 h-5" />
                      الذهاب لملف المتبرع
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">لم تسجل بعد كمتبرع</h3>
                  <p className="text-gray-600 mb-6">انضم إلى مجتمع الأبطال المنقذين للحياة</p>
                  <Link
                    href="/BloodDonorRegister"
                    className="block w-full py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:shadow-lg hover:from-green-700 hover:to-green-800 transition shadow-lg"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5" />
                      التسجيل كمتبرع
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
           
            {/* Favorites Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">الأعمال المفضلة ⭐</h3>
                  <p className="text-gray-600">الأعمال التي أضفتها إلى المفضلة</p>
                </div>
                <span className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-bold">
                 {userData._count?.favorites || 0} عمل
                </span>
              </div>

              {userData.favorites?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userData.favorites.slice(0, 4).map((favorite, index) => (
                    <motion.div
                      key={favorite.business.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-gray-200 rounded-xl hover:shadow-lg hover:border-gray-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {favorite.business.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{favorite.business.name}</h4>
                            <p className="text-sm text-gray-500">{favorite.business.category || "عام"}</p>
                          </div>
                        </div>
                        <button className="text-red-500 hover:text-red-600">
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">لا توجد أعمال مفضلة</h3>
                  <p className="text-gray-600 mb-8">يمكنك إضافة أعمال إلى المفضلة من خلال تصفح الأعمال</p>
                  <button
                    onClick={() => router.push("/Businesses")}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition"
                  >
                    تصفح الأعمال
                  </button>
                </div>
              )}
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">آخر الإشعارات 🔔</h3>
                  <p className="text-gray-600">آخر نشاطاتك وتحديثات النظام</p>
                </div>
                <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold">
                  {userData.notifications?.filter(n => !n.isRead).length || 0} غير مقروء
                </span>
              </div>

              {userData.notifications?.length ? (
                <div className="space-y-4">
                  {userData.notifications.slice(0, 3).map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border ${
                        notification.isRead
                          ? "bg-gray-50 border-gray-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                            <h4 className="font-bold text-gray-800">{notification.title}</h4>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.sentAt).toLocaleDateString('ar-SA', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            جديد
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">لا توجد إشعارات</h3>
                  <p className="text-gray-600">ستظهر هنا آخر الإشعارات والنشاطات</p>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            {userData.reviews && userData.reviews.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">آخر تقييماتك ⭐</h3>
                    <p className="text-gray-600">التقييمات التي قدمتها للأعمال</p>
                  </div>
                  <span className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full font-bold">
                    {userData.reviews.length} تقييم
                  </span>
                </div>

                <div className="space-y-4">
                  {userData.reviews.slice(0, 2).map((review) => (
                    <div key={review.id} className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-800">{review.business?.name || "عمل غير محدد"}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          review.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          review.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {review.status === 'APPROVED' ? 'معتمد' :
                           review.status === 'REJECTED' ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 text-sm mb-3">{review.comment}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{new Date(review.createdAt).toLocaleDateString('ar-SA')}</span>
                        <span>👍 {review.helpful} مفيد</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}