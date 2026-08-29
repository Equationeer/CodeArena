import React from "react";
import { motion } from "framer-motion";

// Shimmer animation
const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent";

// Reusable skeleton block
const Skeleton = ({ className }) => (
  <div className={`bg-slate-800 rounded-lg ${shimmer} ${className}`} />
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#111827] border border-slate-800 rounded-2xl p-6 ${className}`}>
    {children}
  </div>
);

const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8">

      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="w-32 h-5" />
            <Skeleton className="w-48 h-4" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block space-y-2">
            <Skeleton className="w-24 h-3 ml-auto" />
            <Skeleton className="w-16 h-5 ml-auto" />
          </div>
          <Skeleton className="w-36 h-10 rounded-xl" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-16 h-6" />
                </div>
                <Skeleton className="w-10 h-10 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <Skeleton className="w-48 h-5 mb-6" />
            <Skeleton className="w-full h-[300px] rounded-xl" />
          </Card>

          <Card>
            <Skeleton className="w-40 h-5 mb-4" />
            <Skeleton className="w-full h-[250px] rounded-xl" />
          </Card>
        </div>

        {/* TABLE */}
        <Card className="p-0">
          <div className="p-6 border-b border-slate-800 flex justify-between">
            <div className="space-y-2">
              <Skeleton className="w-40 h-5" />
              <Skeleton className="w-52 h-4" />
            </div>
            <Skeleton className="w-72 h-10 rounded-xl" />
          </div>

          <div className="p-6 space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 items-center">
                <Skeleton className="col-span-2 h-4" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-slate-800 flex justify-between">
            <Skeleton className="w-32 h-4" />
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-10 h-10 rounded-lg" />
              ))}
            </div>
          </div>
        </Card>
      </main>

      {/* Tailwind custom animation */}
      <style>
        {`
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
    </div>
  );
};

export default DashboardSkeleton;