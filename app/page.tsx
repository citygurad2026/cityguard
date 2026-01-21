"use client"; // لأنك تستخدم useEffect وhooks

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./store/userSlice";
import { RootState } from "./store/store";
import { motion } from 'framer-motion';
import Head from "next/head";

import HeroSection from "./component/HeroSection";
import Statistics from "./component/Statistics";
import Features from "./component/Features";
import Header from './component/Header';

export default function Home() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.user);

  // إعادة تحميل بيانات المستخدم من localStorage
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        dispatch(setUser(JSON.parse(storedUser)));
      }
    }
  }, [user, dispatch]);

  return (
    <>
      <Head>
        <title>دليل المدينة - دليلك الشامل للمدينة</title>
        <meta
          name="description"
          content="اكتشف أفضل المطاعم، الفعاليات، والأماكن في المدينة"
        />
      </Head>

      <motion.div
        dir="rtl"
        className="min-h-screen text-white relative overflow-hidden"
        animate={{
          background: [
            "linear-gradient(45deg, #009eff 0%, #0366a2 50%, #5bbefa 100%)",
            "linear-gradient(135deg, #5bbefa 0%, #009eff 50%, #0366a2 100%)",
            "linear-gradient(225deg, #0366a2 0%, #5bbefa 50%, #009eff 100%)",
            "linear-gradient(315deg, #009eff 0%, #0366a2 50%, #5bbefa 100%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* الهيدر شفاف */}
        <Header />

        {/* الهيرو سيكشن مع تأثيرات */}
        <HeroSection />

        {/* الإحصائيات */}
        <Statistics />

        {/* المميزات */}
        <Features />
      </motion.div>
    </>
  );
}
