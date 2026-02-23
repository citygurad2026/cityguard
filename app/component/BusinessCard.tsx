"use client";
import { Heart, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Axios from "../utilts/Axios";
import SummaryApi from "../common/SummaryApi";
import Image from "next/image";

interface Media {
  url: string;
  publicId?: string;
  type?: string;
  altText?: string;
  title?: string;
  order?: number;
}

interface Business {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  media?: Media[] | null;
  rating?: number | null;
  _count?: {
    reviews?: number;
    favorites?: number;
  };
}

export default function BusinessCard({ business }: { business: Business }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favCount, setFavCount] = useState(business._count?.favorites || 0);
  const [loadingFav, setLoadingFav] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ===============================
  // Auto-play slideshow
  // ===============================
  useEffect(() => {
    if (!business.media || business.media.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        prev === business.media!.length - 1 ? 0 : prev + 1
      );
    }, 3000); // تغيير كل 3 ثواني

    return () => clearInterval(interval);
  }, [business.media]);

  // ===============================
  // Check favorite status
  // ===============================
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const response = await Axios(
          SummaryApi.favorites.checkFavoriteStatus(business.id)
        );

        if (response.data?.success) {
          setIsFavorited(response.data.isFavorited);
        }
      } catch (err: any) {
        if (err?.response?.status !== 401) {
          console.error(err);
        }
      }
    };

    checkFavorite();
  }, [business.id]);

  // ===============================
  // Toggle favorite
  // ===============================
  const handleToggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (loadingFav) return;

    try {
      setLoadingFav(true);

      const response = await Axios(
        SummaryApi.favorites.toggleFavorite(business.id)
      );

      if (response.data?.success) {
        const newState = response.data.isFavorited;
        setIsFavorited(newState);
        setFavCount((prev) => (newState ? prev + 1 : prev - 1));
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        router.push("/Login");
      } else {
        console.error(err);
      }
    } finally {
      setLoadingFav(false);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (business.media && business.media.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % business.media!.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (business.media && business.media.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? business.media!.length - 1 : prev - 1
      );
    }
  };

  return (
    <Link href={`/BussinessDetails/${business.id}`}>
      <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer">
        {/* ================= IMAGE SLIDESHOW SECTION ================= */}
        <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
          {/* Slideshow Container */}
          {business.media && business.media.length > 0 ? (
            <div className="relative w-full h-full">
              {/* Current Image */}
              <Image
                key={currentImageIndex} // مهم لإعادة التشغيل عند تغيير الصورة
                src={business.media[currentImageIndex].url}
                alt={business.media[currentImageIndex].altText || business.name}
                fill
                className="object-cover transition-opacity duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
                onError={() => setImageError(true)}
              />

              {/* Navigation Arrows - تظهر عند hover فقط */}
              {business.media.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/70 z-20"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-black/70 z-20"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {business.media.length > 1 && (
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-20">
                  {currentImageIndex + 1} / {business.media.length}
                </div>
              )}

              {/* Dots Indicator */}
              {business.media.length > 1 && (
                <div className="absolute bottom-2 right-2 flex gap-1 z-20">
                  {business.media.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex(idx);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentImageIndex
                          ? "w-3 bg-white"
                          : "w-1.5 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              لا توجد صورة
            </div>
          )}

          {/* Favorite Button (Overlay) */}
          <button
            onClick={handleToggleFavorite}
            disabled={loadingFav}
            className={`absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow-md transition hover:scale-110 z-30 ${
              isFavorited ? "text-red-600" : "text-gray-400"
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-4">
          <h3 className="font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition line-clamp-1">
            {business.name}
          </h3>

          {business.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {business.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            {/* Rating + Reviews */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                <span className="text-yellow-500">★</span>
                <span className="font-bold text-gray-700">
                  {business.rating || "جديد"}
                </span>
              </div>

              <div className="flex items-center gap-1 text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span>{business._count?.reviews || 0}</span>
              </div>
            </div>

            {/* Favorites Count */}
            <div className="flex items-center gap-1 text-red-500">
              <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
              <span>{favCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}