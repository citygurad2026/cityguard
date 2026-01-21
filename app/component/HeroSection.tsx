import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Axios from "../utilts/Axios";
import SummaryApi from "../common/SummaryApi";

interface Banner {
  id: number;
  title: string;
  content?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  tabletImageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  priority?: number;
}

export default function HeroWithBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // جلب البيانات من API
  useEffect(() => {
    const fetchBanners = async () => {
      setIsLoading(true);
      try {
        const response = await Axios({
          ...SummaryApi.ad.get_ads_by_type("MAIN_HERO")
        });
        setBanners(response.data.ads || []);
      } catch (error) {
        console.error('Error fetching banners:', error);
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // تحميل الصور مسبقًا
  useEffect(() => {
    if (banners.length === 0) return;

    const preloadImages = () => {
      banners.forEach(banner => {
        const img = new Image();
        img.src = banner.imageUrl;
        img.onload = () => setImageLoaded(true);
      });
    };

    preloadImages();
  }, [banners]);

  // التبديل التلقائي مع إيقاف عند التمرير
  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [banners.length, isHovered]);

  const nextBanner = useCallback(() => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevBanner = useCallback(() => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const handleCtaClick = async (bannerId: number) => {
    try {
      await Axios({
        ...SummaryApi.ad.increment_clicks(bannerId)
      });
    } catch (error) {
      console.error("Error incrementing clicks:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="relative h-[500px] md:h-[600px] overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="relative h-[500px] md:h-[600px] overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
          <Sparkles className="w-16 h-16 mb-6 opacity-80" />
          <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
            اكتشف عالمًا من <span className="text-yellow-300">الإمكانيات</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-xl opacity-90">
            انضم إلينا في رحلة مليئة بالعروض والفرص الاستثنائية
          </p>
          <button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105">
            ابدأ الآن
          </button>
        </div>
      </div>
    );
  }

  const current = banners[currentBanner];

  return (
    <section 
      className="relative h-[500px] md:h-[600px] overflow-hidden rounded-2xl shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="relative w-full h-full"
        >
          {/* الصورة الخلفية */}
          <div className="absolute inset-0">
            <picture>
              <source 
                media="(max-width: 768px)" 
                srcSet={current.mobileImageUrl || current.imageUrl} 
              />
              <source 
                media="(min-width: 769px) and (max-width: 1024px)" 
                srcSet={current.tabletImageUrl || current.imageUrl} 
              />
              <img
                src={current.imageUrl}
                alt={current.title}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  imageLoaded ? 'scale-100' : 'scale-105'
                }`}
                loading="lazy"
              />
            </picture>
            
            {/* Overlay متدرج */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* المحتوى */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-6 md:px-12">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="max-w-2xl"
              >
                {/* العنوان */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight text-white">
                  {current.title}
                </h1>
                
                {/* الوصف */}
                {current.content && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg md:text-xl mb-6 md:mb-8 text-white/90 max-w-xl leading-relaxed"
                  >
                    {current.content}
                  </motion.p>
                )}
                
                {/* CTA */}
                {current.ctaText && current.ctaUrl && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <a
                      href={current.ctaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleCtaClick(current.id)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-7 py-3.5 md:px-8 md:py-4 rounded-full text-lg md:text-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: current.backgroundColor || '#F59E0B',
                        color: current.textColor || '#FFFFFF',
                      }}
                    >
                      {current.ctaText}
                      <ChevronRight className="w-5 h-5" />
                    </a>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>

          {/* أزرار التنقل */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-white/15 hover:bg-white/25 p-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/25 hover:border-white/40"
                aria-label="السابق"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
              
              <button
                onClick={nextBanner}
                className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-white/15 hover:bg-white/25 p-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/25 hover:border-white/40"
                aria-label="التالي"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            </>
          )}

          {/* النقاط التوضيحية */}
          {banners.length > 1 && (
            <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className="relative group"
                >
                  <div 
                    className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                      index === currentBanner 
                        ? 'bg-yellow-400' 
                        : 'bg-white/50 group-hover:bg-white/70'
                    }`}
                  />
                  {index === currentBanner && (
                    <div className="absolute -inset-1.5 border border-yellow-400/50 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Progress Bar (اختياري) */}
          {banners.length > 1 && !isHovered && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400/80 via-orange-500/80 to-transparent">
              <motion.div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "linear" }}
                key={currentBanner}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}