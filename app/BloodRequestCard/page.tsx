// src/components/BloodRequestCard.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Droplet,         // أيقونة دم (بدل Opacity)
  MapPin,
  Hospital,
  Phone,
  Clock,
  User,
  AlertCircle,     // بدل Warning
  ArrowRight,
  Heart
} from 'lucide-react';
import { useRouter } from 'next/navigation';


interface BloodRequestCardProps {
  request: any;
}

const BloodRequestCard: React.FC<BloodRequestCardProps> = ({ request }) => {
  const router = useRouter();

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'حرج';
      case 'high': return 'عالي';
      case 'normal': return 'متوسط';
      case 'low': return 'منخفض';
      default: return urgency;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`h-full flex flex-col rounded-2xl shadow-lg overflow-hidden border transition-all duration-300 hover:shadow-xl ${
        request.urgency === "critical"
          ? "border-red-300 border-2"
          : "border-gray-200"
      }`}
    >
      {/* شريط العنوان */}
      <div
        className={`p-4 border-b ${
          request.urgency === "critical"
            ? "bg-red-50 border-red-100"
            : "bg-gray-50 border-gray-100"
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${
                request.urgency === "critical" ? "bg-red-100" : "bg-red-50"
              }`}
            >
              <Droplet
                className={`w-6 h-6 ${
                  request.urgency === "critical"
                    ? "text-red-600"
                    : "text-red-500"
                }`}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-600">
                {request.bloodType}
              </h3>
              <p className="text-sm text-gray-600">{request.units} وحدة</p>
            </div>
          </div>

          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}
            >
              {getUrgencyLabel(request.urgency)}
            </span>
            <span className="px-3 py-1 border border-gray-300 text-gray-700 rounded-full text-xs font-medium">
              {request.units} وحدة
            </span>
          </div>
        </div>
      </div>

      {/* محتوى البطاقة */}
      <div className="flex-grow p-5">
        <div className="space-y-4">
          {/* المستشفى */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Hospital className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">المستشفى</p>
              <p className="font-medium text-gray-900">{request.hospital}</p>
            </div>
          </div>

          {/* الموقع */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">الموقع</p>
              <p className="font-medium text-gray-900">{request.city}</p>
            </div>
          </div>

          {/* جهة الاتصال */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Phone className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">جهة الاتصال</p>
              <p className="font-medium text-gray-900" dir="ltr">
                {request.contactPhone}
              </p>
            </div>
          </div>

          {/* التاريخ */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">تاريخ النشر</p>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">
                  {formatDate(request.createdAt)}
                </p>
                <span className="text-xs text-gray-500">
                  ({getTimeAgo(request.createdAt)})
                </span>
              </div>
            </div>
          </div>

          {/* الملاحظات */}
          {request.notes && (
            <div>
              <p className="text-sm text-gray-600 mb-2">ملاحظات</p>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {request.notes}
                </p>
              </div>
            </div>
          )}

          {/* الطالب (إذا كان مسجلاً) */}
          {request.requester && (
            <div className="flex items-center gap-2 pt-3 border-t">
              <User className="w-4 h-4 text-gray-500" />

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">
                    {request.requester.name?.charAt(0)}
                  </span>
                </div>

                <span className="text-sm text-gray-700">
                  {request.requester.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* أزرار الإجراءات */}
      <div className="border-t p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push(`/BloodRequestDetail/${request.id}`)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            التفاصيل
          </button>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${request.contactPhone}`}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="اتصال سريع"
            >
              <Phone className="w-4 h-4" />
            </a>

            <button
              onClick={() =>{
              console.log("requset id",request.id)
                router.push(`/BloodRequestDetail/${request.id}`)}
              }
             
              
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>التبرع الآن</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BloodRequestCard;