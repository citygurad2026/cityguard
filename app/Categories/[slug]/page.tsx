"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Axios from "@/app/utilts/Axios";
import SummaryApi from "@/app/common/SummaryApi";
import BusinessCard from "@/app/component/BusinessCard";

// ================ TYPES ================

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count?: {
    businesses: number;
    children: number;
  };
  children?: Array<{
    id: number;
    name: string;
    slug: string;
    imageUrl: string | null;
    _count?: {
      businesses: number;
    };
  }>;
  businesses?: Array<{
    id: number;
    name: string;
    slug: string;
    description: string | null;
    images: string[] | null;
    rating: number | null;
    status: string;
    _count?: {
      reviews: number;
      favorites: number;
    };
  }>;
}

// ================ PAGE ================

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await Axios(SummaryApi.category.get_category(slug));
      
      if (response.data?.success) {
        setCategory(response.data.data);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "حدث خطأ أثناء تحميل بيانات الفئة"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================ LOADING ================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
          <h3 className="mt-6 text-xl font-bold text-gray-800">جاري تحميل الفئة</h3>
          <p className="text-gray-600 mt-2">نحضر لك جميع الأعمال في هذه الفئة...</p>
        </div>
      </div>
    );
  }

  // ================ ERROR ================

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">عذراً!</h3>
          <p className="text-gray-600 mb-6">{error || "الفئة غير موجودة"}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // Sort businesses
  const sortedBusinesses = [...(category.businesses || [])].sort((a, b) => {
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "reviews") return (b._count?.reviews || 0) - (a._count?.reviews || 0);
    return 0;
  });

  // ================ UI ================

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      dir="rtl"
    >
      {/* Hero Section - Like Blood Page */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-yellow-300 mb-4">
                <Link href="/" className="hover:text-blue-600 transition">
                  الرئيسية
                </Link>
                <span>/</span>
                <span className="text-white font-medium">
                  {category.name}
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                {category.name}
              </h1>

              {category.description && (
                <p className="text-xl text-yellow-300 mb-8 leading-relaxed">
                  {category.description}
                </p>
              )}

              {/* Stats Badges - Like Blood Page */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg">
                  🏢 {category._count?.businesses || 0} أعمال
                </div>
                {(category._count?.children ?? 0) > 0 && (
                  <div className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg">
                    📂 {category._count?.children ?? 0} فئة فرعية
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-100 rounded-full" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-100 rounded-full" />
                
                <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                  <div className="text-center">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-blue-100"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                          className="w-16 h-16 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                        </svg>
                      </div>
                    )}
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {category._count?.businesses || 0} أعمال
                    </h3>
                    <p className="text-gray-600">
                      {category._count?.children || 0} فئة فرعية
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Subcategories Section - Like Blood Page Cards */}
        {category.children && category.children.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                الفئات الفرعية
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                تصفح الفئات الفرعية للوصول إلى ما تبحث عنه بدقة
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {category.children.map((subCat, index) => (
                <Link
                  key={subCat.id}
                  href={`/category/${subCat.slug}`}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition p-4 text-center"
                >
                  {subCat.imageUrl ? (
                    <img
                      src={subCat.imageUrl}
                      alt={subCat.name}
                      className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-2 border-gray-200 group-hover:border-blue-500 transition"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
                      index % 3 === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      index % 3 === 1 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                      'bg-gradient-to-r from-green-500 to-green-600'
                    }`}>
                      <svg
                        className="w-8 h-8 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                      </svg>
                    </div>
                  )}
                  <h3 className="font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition">
                    {subCat.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {subCat._count?.businesses || 0} أعمال
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Businesses Section - Like Blood Page */}
        <div id="businesses-section" className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                جميع الأعمال
              </h2>
              <p className="text-gray-600">
                {sortedBusinesses.length} عمل في هذه الفئة
              </p>
            </div>

            {/* Sort Dropdown - Like Blood Page */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-blue-200 rounded-xl px-4 py-2 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
            >
              <option value="latest">الأحدث</option>
              <option value="rating">الأعلى تقييماً</option>
              <option value="reviews">الأكثر تقييماً</option>
            </select>
          </div>

          {sortedBusinesses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                لا توجد أعمال بعد
              </h3>
              <p className="text-gray-600 mb-6">
                كن أول من يضيف عملاً في هذه الفئة
              </p>
              <Link
                href="/business/create"
                className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
              >
                أضف عملك الآن
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action - Like Blood Page */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">انضم إلينا اليوم!</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            هل لديك عمل وتريد الوصول لآلاف العملاء؟ سجل عملك الآن في دليل الأعمال
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/business/create"
              className="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-lg"
            >
              أضف عملك
            </Link>
            <Link
              href="/categories"
              className="border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition"
            >
              تصفح جميع الفئات
            </Link>
          </div>
        </div>
      </div>

      {/* Global Styles - Like Blood Page */}
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