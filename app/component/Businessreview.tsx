"use client";

import { useEffect, useState } from "react";
import Axios from "@/app/utilts/Axios";
import SummaryApi from "@/app/common/SummaryApi";
import axiosToastError from "@/app/utilts/AxiosToastError";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Props {
  businessId: number;
}

interface Review {
  id: number;
  userId: number;
  businessId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

interface ReviewStats {
  average: number;
  total: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface RatingStarsProps {
  rating: number;
  setRating?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  hoverRating?: number;
  setHoverRating?: (rating: number) => void;
}

export default function BusinessReview({ businessId }: Props) {
  // التحقق من صحة businessId
  if (!businessId || businessId <= 0) {
    return <div className="text-center text-red-500 p-8">خطأ: معرف النشاط غير صالح</div>;
  }

  // State Management
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  // Edit State
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editReviewContent, setEditReviewContent] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  
  // Stats State
  const [stats, setStats] = useState<ReviewStats>({
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  // Loading States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    edit: false,
    delete: false
  });

  // Get current user from Redux
  const user = useSelector((state: RootState) => state.user.user);
  const isAuthenticated = !!user?.id;

  // Memoized visible reviews
  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  // Fetch reviews function
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await Axios(
        SummaryApi.review.get_business_reviews(businessId)
      );
      
      if (res.data?.ok) {
        setReviews(res.data.data.reviews || []);
        setStats({
          average: res.data.data.stats.averageRating || 0,
          total: res.data.data.stats.totalReviews || 0,
          distribution: res.data.data.stats.distribution || {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
          },
        });
      }
    } catch (error) {
      axiosToastError(error);
      toast.error("فشل في تحميل التقييمات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) fetchReviews();
  }, [businessId]);

  // Validation function
  const validateReview = (rating: number, comment: string): boolean => {
    if (rating < 1 || rating > 5) {
      toast.error("يرجى اختيار تقييم صحيح بين 1 و 5");
      return false;
    }
    if (comment.trim().length < 5) {
      toast.error("يجب أن يكون التعليق 5 أحرف على الأقل");
      return false;
    }
    if (comment.trim().length > 500) {
      toast.error("التعليق طويل جداً (الحد الأقصى 500 حرف)");
      return false;
    }
    return true;
  };

  // Add review handler
  const handleAddReview = async () => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول لإضافة تقييم");
      return;
    }

    if (!validateReview(newRating, newReview)) return;
    
    setSubmitting(true);
    try {
      const res = await Axios({
        ...SummaryApi.review.create_review,
        data: {
          businessId,
          rating: newRating,
          comment: newReview.trim(),
        },
      });

      if (res.data?.ok) {
        toast.success("تم إضافة التقييم بنجاح");
        setNewReview("");
        setNewRating(0);
        fetchReviews();
      }
    } catch (error) {
      axiosToastError(error);
      toast.error("فشل في إضافة التقييم");
    } finally {
      setSubmitting(false);
    }
  };

  // Update review handler
  const handleUpdateReview = async (id: number) => {
    if (!validateReview(editReviewRating, editReviewContent)) return;

    setActionLoading(prev => ({ ...prev, edit: true }));
    try {
      const res = await Axios({
        ...SummaryApi.review.update_review(id),
        data: {
          comment: editReviewContent.trim(),
          rating: editReviewRating,
        },
      });

      if (res.data?.ok) {
        toast.success("تم تحديث التقييم بنجاح");
        setEditingReviewId(null);
        setEditReviewContent("");
        setEditReviewRating(0);
        fetchReviews();
      }
    } catch (error) {
      axiosToastError(error);
      toast.error("فشل في تحديث التقييم");
    } finally {
      setActionLoading(prev => ({ ...prev, edit: false }));
    }
  };

  // Delete review handler
  const handleDeleteReview = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف التقييم؟")) return;

    setActionLoading(prev => ({ ...prev, delete: true }));
    try {
      const res = await Axios(
        SummaryApi.review.delete_review(id)
      );

      if (res.data?.ok) {
        toast.success("تم حذف التقييم بنجاح");
        fetchReviews();
      }
    } catch (error) {
      axiosToastError(error);
      toast.error("فشل في حذف التقييم");
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Cancel edit handler
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditReviewContent("");
    setEditReviewRating(0);
    setEditHoverRating(0);
  };

  // Rating Stars Component
  const RatingStars = ({ 
    rating, 
    setRating, 
    readonly = false, 
    size = "md",
    hoverRating = 0,
    setHoverRating 
  }: RatingStarsProps) => {
    const stars = [1, 2, 3, 4, 5];
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8"
    };

    const handleMouseEnter = (star: number) => {
      if (!readonly && setHoverRating) setHoverRating(star);
    };

    const handleMouseLeave = () => {
      if (!readonly && setHoverRating) setHoverRating(0);
    };

    const handleClick = (star: number) => {
      if (!readonly && setRating) setRating(star);
    };

    return (
      <div className="flex gap-1" dir="ltr">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`${!readonly && 'cursor-pointer hover:scale-110 transition-transform'} focus:outline-none`}
            aria-label={`${star} stars`}
          >
            <svg
              className={`${sizeClasses[size]} ${
                (hoverRating || rating) >= star
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              } transition-colors`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 mt-12 border border-gray-100">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mt-12 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500 rounded-full blur-lg opacity-20"></div>
            <div className="relative bg-gradient-to-br from-yellow-500 to-yellow-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-l from-gray-800 to-gray-600 bg-clip-text text-transparent">
              التقييمات
            </h2>
            <p className="text-sm text-gray-500">
              آراء وتجارب العملاء
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-6 bg-gradient-to-br from-yellow-50 to-orange-50/50 px-6 py-3 rounded-2xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.average.toFixed(1)}</div>
            <div className="text-xs text-gray-500">متوسط التقييم</div>
          </div>
          <div className="w-px h-10 bg-yellow-200"></div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-700">{stats.total}</div>
            <div className="text-xs text-gray-500">عدد المقيمين</div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      {stats.total > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 mb-4">توزيع التقييمات</h3>
          <div className="space-y-3">
            {[5,4,3,2,1].map((star) => {
              const count = stats.distribution[star as keyof typeof stats.distribution];
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">{star} ⭐</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-l from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-left" dir="ltr">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Review Form */}
      {isAuthenticated ? (
        <div className="relative mb-10">
          <div className="absolute -top-2 -right-2 w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full blur-3xl opacity-10"></div>
          <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-1 border border-gray-200/50 shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium text-gray-700">تقييمك:</span>
                <RatingStars 
                  rating={newRating} 
                  setRating={setNewRating} 
                  size="lg"
                  hoverRating={hoverRating}
                  setHoverRating={setHoverRating}
                />
                {newRating > 0 && (
                  <span className="text-sm text-gray-500 mr-auto">
                    {newRating} من 5 نجوم
                  </span>
                )}
              </div>
              
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                className="w-full rounded-xl p-4 bg-white border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none text-gray-700 placeholder:text-gray-400 resize-none"
                placeholder="شاركنا تجربتك مع هذا النشاط..."
                rows={3}
                maxLength={500}
              />
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-xs text-gray-400">
                  {newReview.length}/500
                </div>
                <button
                  onClick={handleAddReview}
                  disabled={submitting || !newReview.trim() || newRating === 0}
                  className={`relative group ${(!newReview.trim() || newRating === 0 || submitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition"></div>
                  <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg">
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>جاري النشر...</span>
                      </>
                    ) : (
                      <>
                        <span>نشر التقييم</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-10 p-6 bg-gray-50 rounded-2xl text-center">
          <p className="text-gray-600">
            يرجى <button className="text-yellow-600 hover:underline font-medium">تسجيل الدخول</button> لإضافة تقييم
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500 text-lg">لا توجد تقييمات بعد</p>
            <p className="text-gray-400 mt-2">كن أول من يقيم هذا النشاط</p>
          </div>
        ) : (
          <>
            {visibleReviews.map((review, index) => {
              const isOwner = user?.id === review.userId;
              
              return (
                <div 
                  key={review.id} 
                  className="group relative animate-fadeIn bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:border-yellow-200 transition-all duration-300 hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {editingReviewId === review.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">تعديل التقييم:</span>
                        <RatingStars 
                          rating={editReviewRating} 
                          setRating={setEditReviewRating} 
                          size="md"
                          hoverRating={editHoverRating}
                          setHoverRating={setEditHoverRating}
                        />
                        {editReviewRating > 0 && (
                          <span className="text-sm text-gray-500 mr-auto">
                            {editReviewRating} من 5 نجوم
                          </span>
                        )}
                      </div>
                      
                      <textarea
                        value={editReviewContent}
                        onChange={(e) => setEditReviewContent(e.target.value)}
                        className="w-full rounded-xl p-4 bg-white border border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none text-gray-700 resize-none"
                        rows={3}
                        maxLength={500}
                      />
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-400">
                          {editReviewContent.length}/500
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleCancelEdit}
                            className="px-6 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={() => handleUpdateReview(review.id)}
                            disabled={actionLoading.edit || !editReviewContent.trim() || editReviewRating === 0}
                            className={`px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg transition ${
                              (actionLoading.edit || !editReviewContent.trim() || editReviewRating === 0) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {actionLoading.edit ? (
                              <div className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>جاري الحفظ...</span>
                              </div>
                            ) : "حفظ التعديلات"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      {/* Review Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {review.user?.name?.charAt(0) || 'م'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">{review.user?.name || 'مستخدم'}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <RatingStars rating={review.rating} readonly size="sm" />
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(review.createdAt), { 
                                  addSuffix: true,
                                  locale: ar 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons - Show only for review owner */}
                        {isOwner && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingReviewId(review.id);
                                setEditReviewContent(review.comment);
                                setEditReviewRating(review.rating);
                              }}
                              className="p-2 text-gray-400 hover:text-yellow-600 transition rounded-lg hover:bg-yellow-50"
                              title="تعديل"
                              disabled={actionLoading.delete}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              disabled={actionLoading.delete}
                              className={`p-2 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50 ${
                                actionLoading.delete ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="حذف"
                            >
                              {actionLoading.delete ? (
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Review Comment */}
                      <p className="text-gray-600 leading-relaxed pr-15 whitespace-pre-wrap">
                        {review.comment}
                      </p>

                      {/* Show if edited */}
                      {review.updatedAt !== review.createdAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          (تم التعديل)
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
            
            {/* Show More Button */}
            {reviews.length > 3 && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="relative group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-yellow-200 transition-all duration-300 hover:shadow-lg"
                >
                  <span className="text-gray-600 font-medium group-hover:text-yellow-600 transition">
                    {showAll ? 'عرض أقل' : `عرض المزيد (${reviews.length - 3})`}
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-all duration-300 ${
                      showAll ? 'rotate-180' : ''
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Animations Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}