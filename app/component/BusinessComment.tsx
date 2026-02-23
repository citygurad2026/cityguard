"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Axios from "@/app/utilts/Axios";
import SummaryApi from "@/app/common/SummaryApi";
import axiosToastError from "@/app/utilts/AxiosToastError";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Props {
  businessId: number;
}

export default function BusinessComment({ businessId }: Props) {
  const user = useSelector((state: RootState) => state.user.user);
  const [showAll, setShowAll] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  const fetchComments = async () => {
    try {
      const response = await Axios(
        SummaryApi.commit.get_business_comments(businessId)
      );
      if (response.data?.ok) {
        setComments(response.data.data);
      }
    } catch (error) {
      axiosToastError(error);
    }
  };

  

  useEffect(() => {
    if (businessId) fetchComments();
  }, [businessId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const response = await Axios({
        ...SummaryApi.commit.create_comment,
        data: { businessId, content: newComment },
      });
      if (response.data?.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (error) {
      axiosToastError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    try {
      const response = await Axios({
        ...SummaryApi.commit.update_comment(commentId),
        data: { content: editCommentContent },
      });
      if (response.data?.ok) {
        setEditingCommentId(null);
        fetchComments();
      }
    } catch (error) {
      axiosToastError(error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("هل أنت متأكد من حذف التعليق؟")) return;
    try {
      const response = await Axios(
        SummaryApi.commit.delete_comment(commentId)
      );
      if (response.data?.ok) {
        fetchComments();
      }
    } catch (error) {
      axiosToastError(error);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mt-12 border border-gray-100">
      {/* Header مع تصميم احترافي */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-lg opacity-20"></div>
            <div className="relative bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-l from-gray-800 to-gray-600 bg-clip-text text-transparent">
              التعليقات
            </h2>
            <p className="text-sm text-gray-500">شارك الآخرين بتجربتك</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 px-4 py-2 rounded-2xl">
          <span className="font-bold text-green-700 text-lg">
            {comments.length}
          </span>
          <span className="text-green-600 mr-1">تعليق</span>
        </div>
      </div>

      {/* Add Comment - تصميم احترافي */}
      <div className="relative mb-10">
        <div className="absolute -top-2 -right-2 w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full blur-3xl opacity-10"></div>
        <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-1 border border-gray-200/50 shadow-sm">
          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full rounded-xl p-5 bg-transparent border-none focus:ring-2 focus:ring-green-500/20 outline-none text-gray-700 placeholder:text-gray-400 resize-none"
            placeholder="اكتب تعليقك... شاركنا رأيك 👍"
          />
          <div className="flex justify-between items-center p-3 border-t border-gray-200/50">
            <div className="text-xs text-gray-400">{newComment.length}/500</div>
            <button
              onClick={handleAddComment}
              disabled={submitting || !newComment.trim()}
              className={`relative group ${!newComment.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition"></div>
              <div className="relative bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg">
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>جاري النشر...</span>
                  </>
                ) : (
                  <>
                    <span>نشر التعليق</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Comments List - تصميم متطور */}
      <div className="space-y-6">
        {(showAll ? comments : comments.slice(0, 2)).map((comment, index) => (
          <div
            key={comment.id}
            className="group relative animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* خط زمني */}
            {index !==
              (showAll ? comments.length : Math.min(2, comments.length)) -
                1 && (
              <div className="absolute right-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-green-200 to-transparent"></div>
            )}

            <div className="relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-green-200 transition-all duration-300 hover:shadow-xl">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-full blur-sm opacity-0 group-hover:opacity-50 transition"></div>

                    <div className="relative w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden">
                      {comment.user?.avatarUrl ? (
                        <Image
                          src={comment.user.avatarUrl}
                          alt={comment.user.name || "User"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 text-white text-xl font-bold">
                          {comment.user?.name?.[0]?.toUpperCase() || "م"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">
                      {comment.user?.name || "مستخدم"}
                    </h4>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </span>

                      {comment.updatedAt !== comment.createdAt && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-400 text-xs">(معدل)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions - تظهر فقط للمالك */}
                {comment.userId === user?.id && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditCommentContent(comment.content);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              {/* Content or Edit Mode */}
              {editingCommentId === comment.id ? (
                <div className="mt-4">
                  <textarea
                    value={editCommentContent}
                    onChange={(e) => setEditCommentContent(e.target.value)}
                    className="w-full rounded-xl p-4 border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                    rows={3}
                  />

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleUpdateComment(comment.id)}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition"
                    >
                      حفظ التعديلات
                    </button>

                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <p className="text-gray-700 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* زر عرض المزيد */}
        {comments.length > 2 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition"
            >
              {showAll ? "عرض أقل" : "عرض المزيد من التعليقات"}
            </button>
          </div>
        )}

        {/* Empty State */}
        {comments.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              لا توجد تعليقات بعد
            </h3>
            <p className="text-gray-500">
              كن أول من يشاركنا رأيه في هذا النشاط
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

{/* إضافة الـ Animations في الـ global styles */}
<style jsx global>{`
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