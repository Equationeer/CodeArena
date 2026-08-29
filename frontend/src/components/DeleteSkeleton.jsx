import React from "react";
import { motion } from "framer-motion";

const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-slate-700/30 before:to-transparent";

// Container animation
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// Item animation
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const DeletePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Header Skeleton */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <motion.div variants={itemVariants} className="space-y-3">
            <div className={`h-8 w-64 bg-slate-800 rounded-lg ${shimmer}`} />
            <div className={`h-4 w-96 bg-slate-800 rounded-lg ${shimmer}`} />
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-4">
            <div className={`h-10 w-64 bg-slate-800 rounded-xl ${shimmer}`} />
            <div className={`h-10 w-40 bg-slate-800 rounded-xl ${shimmer}`} />
          </motion.div>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4"
            >
              {/* Title */}
              <div className={`h-5 w-3/4 bg-slate-800 rounded ${shimmer}`} />

              {/* Difficulty */}
              <div className={`h-4 w-20 bg-slate-800 rounded-full ${shimmer}`} />

              {/* Tags */}
              <div className="flex gap-2">
                <div className={`h-4 w-16 bg-slate-800 rounded-full ${shimmer}`} />
                <div className={`h-4 w-14 bg-slate-800 rounded-full ${shimmer}`} />
              </div>

              {/* Footer */}
              <div className="flex justify-between pt-2">
                <div className={`h-8 w-20 bg-slate-800 rounded-lg ${shimmer}`} />
                <div className={`h-8 w-8 bg-slate-800 rounded-lg ${shimmer}`} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default DeletePageSkeleton;