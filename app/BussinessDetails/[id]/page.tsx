"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Axios from "@/app/utilts/Axios";
import SummaryApi from "@/app/common/SummaryApi";
import axiosToastError from "@/app/utilts/AxiosToastError";

import BusinessComment from "@/app/component/BusinessComment";
import BusinessReview from "@/app/component/Businessreview";

type OpeningHour =
  | string
  | {
      open: string;
      close: string;
      closed?: boolean;
    }
  | null;
// ===== Interface مطابق للمودل =====
interface Business {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  tags: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  phone: string | null;
  mobile: string | null;
  website: string | null;
  status: string;
  featured: boolean;
  lat: number | null;
  lng: number | null;
  openingHours: any | null;
  isVerified: boolean;
  verificationDate: string | null;
  createdAt: string;
  updatedAt: string;
  rating: number;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  
  media: {
    id: number;
    url: string;
    type: string | null;
    altText: string | null;
    title: string | null;
    order: number | null;
  }[];
  
  owner: {
    id: number;
    name: string | null;
    username: string;
  };
  
  _count?: {
    reviews: number;
    favorites: number;
    jobs: number;
    events: number;
  };
}

export default function BusinessPage() {
  const params = useParams();
  const id = params.id as string | number;
  const businessId = Number(id);
  if (isNaN(businessId)) {
  
  }
  

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
      
        const response = await Axios({
          ...SummaryApi.owner.get_public_bus(id)
        })
        
       if (response.data?.ok) {
         setBusiness(response.data.data);
         setFavCount(response.data.data._count?.favorites || 0);
       }

      } catch (error) {
        console.error("Error fetching business:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBusiness();
    }
  }, [id]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!business) return;
      
      try {
        const response = await Axios(
          SummaryApi.favorites.checkFavoriteStatus(business.id)
        );
        if (response.data?.success) {
          setIsFavorited(response.data.isFavorited);
        }
      } catch (err: any) {
       axiosToastError(err)
      }
    };

    checkFavorite();
  }, [business]);

  const handleToggleFavorite = async () => {
    if (!business) return;
    
    try {
      const response = await Axios(
        SummaryApi.favorites.toggleFavorite(business.id)
      );

      if (response.data?.success) {
        const newState = response.data.isFavorited;
        setIsFavorited(newState);
        setFavCount(prev => newState ? prev + 1 : prev - 1);
      }
    } catch (err: any) {
      axiosToastError(err)
    }
  };
  const openingHours = business?.openingHours || null;
  
  useEffect(() => {
    if (!business?.media || business.media.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % business.media.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [business?.media]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-green-100 border-t-green-500 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
          <h3 className="mt-6 text-xl font-bold text-gray-800">جاري تحميل بيانات النشاط</h3>
          <p className="text-gray-600 mt-2">نحضر لك معلومات النشاط التجاري...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">عذراً!</h3>
          <p className="text-gray-600 mb-6">النشاط التجاري غير موجود</p>
          <Link
            href="/"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      dir="rtl"
    >
      {/* Hero Section - Like Blood Page with Green Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opaci" />

        {/* الصورة الرئيسية مع overlay */}
        <div className="relative h-[70vh]">
          {business.media && business.media.length > 0 ? (
            <Image
              src={business.media[currentImageIndex].url}
              alt={business.media[currentImageIndex].altText || business.name}
              fill
              className="object-cover mix-blend-overlay"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-32 h-32 text-white/30"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
            </div>
          )}

          {/* Content Overlay - Like Blood Page */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-16">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
              <Link href="/" className="hover:text-white transition">
                الرئيسية
              </Link>
              <span>/</span>
              {business.category && (
                <>
                  <Link
                    href={`/category/${business.category.slug}`}
                    className="hover:text-white transition"
                  >
                    {business.category.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-white font-medium">{business.name}</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {business.name}
            </h1>

            {/* Stats Badges - Like Blood Page */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold">
                ⭐ {business.rating || "جديد"}
              </div>
              <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold">
                💬 {business._count?.reviews || 0} مراجعة
              </div>
              <button
                onClick={handleToggleFavorite}
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white/30 transition"
              >
                ❤️ {favCount}
              </button>
              {business.isVerified && (
                <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                  ✓ موثّق
                </div>
              )}
            </div>
          </div>

          {/* Image Navigation - Like Blood Page Slider */}
          {business.media && business.media.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? business.media!.length - 1 : prev - 1,
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition z-20"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() =>
                  setCurrentImageIndex(
                    (prev) => (prev + 1) % business.media!.length,
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition z-20"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-20">
                {currentImageIndex + 1} / {business.media.length}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Right Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Card - Like Blood Page */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                عن النشاط
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {business.description || "لا يوجد وصف"}
              </p>
              {/* Progress Bar - Like Blood Page */}
              <div className="mt-6 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            {/* Location Card */}
            {(business.city || business.region || business.address) && (
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  الموقع
                </h2>
                <p className="text-gray-700">
                  {[business.address, business.city, business.region]
                    .filter(Boolean)
                    .join("، ")}
                </p>
              </div>
            )}

            {/* Jobs Section */}
            {business._count?.jobs
              ? business._count.jobs > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      الوظائف المتاحة
                    </h2>
                    <p className="text-gray-600">جاري تحميل الوظائف...</p>
                  </div>
                )
              : null}

            {/* Events Section */}
            {business._count?.events
              ? business._count.events > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      الأحداث القادمة
                    </h2>
                    <p className="text-gray-600">جاري تحميل الأحداث...</p>
                  </div>
                )
              : null}
          </div>

          {/* Left Column - Contact Info - Like Blood Page Cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-6 hover:shadow-xl transition">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                معلومات الاتصال
              </h2>

              <div className="space-y-4">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition p-4 bg-gray-50 rounded-xl"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span dir="ltr">{business.phone}</span>
                  </a>
                )}

                {business.mobile && (
                  <a
                    href={`tel:${business.mobile}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition p-4 bg-gray-50 rounded-xl"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span dir="ltr">{business.mobile}</span>
                  </a>
                )}

                {business.website && (
                  <a
                    href={
                      business.website.startsWith("http")
                        ? business.website
                        : `https://${business.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition p-4 bg-gray-50 rounded-xl"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="truncate">{business.website}</span>
                  </a>
                )}
              </div>

              {/* Opening Hours */}
              {Object.entries(openingHours as Record<string, OpeningHour>).map(
                ([day, hours]) => {
                  let displayHours: string = "";

                  if (!hours) {
                    displayHours = "";
                  } else if (typeof hours === "string") {
                    displayHours = hours;
                  } else {
                    displayHours = hours.closed
                      ? "مغلق"
                      : `${hours.open} - ${hours.close}`;
                  }

                  return (
                    <div key={day} className="flex justify-between text-sm">
                      <span className="text-gray-600">{day}</span>
                      <span className="text-gray-800 font-medium">
                        {displayHours}
                      </span>
                    </div>
                  );
                },
              )}

              {/* Share Button */}
              <button
                onClick={() => {
                  navigator
                    .share?.({
                      title: business.name,
                      text: business.description || "",
                      url: window.location.href,
                    })
                    .catch(console.error);
                }}
                className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition shadow-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span>مشاركة</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {business && <BusinessComment businessId={business.id} />}

      {/* Reviews Section */}
      {business && <BusinessReview businessId={business.id} />}

      {/* Global Styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}