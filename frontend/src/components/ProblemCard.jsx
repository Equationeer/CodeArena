import React from 'react';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';

const ProblemCard = ({ 
  problem, 
  index, 
  onAction, 
  actionLabel = "Action",
  actionIcon: ActionIcon,
  actionColor = "from-rose-600 to-rose-500"
}) => {

  const difficultyColors = {
    Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Hard: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden transition-colors hover:border-slate-700"
    >
      {/* Glow */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-colors" />

      <div className="relative flex flex-col h-full">

        {/* Top */}
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${difficultyColors[problem.difficultyLevel]}`}>
            {problem.difficultyLevel}
          </span>
          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            ID: {problem._id.slice(-6)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors leading-tight mb-4">
          {problem.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {problem.tags.map(tag => (
            <div key={tag} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/50 text-slate-400 text-xs border border-slate-700/50">
              <Tag className="w-3 h-3" />
              {tag}
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAction}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r ${actionColor} text-white font-semibold shadow-lg transition-all group/btn`}
          >
            {ActionIcon && (
              <ActionIcon className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
            )}
            {actionLabel}
          </motion.button>
        </div>

      </div>
    </motion.div>
  );
};

export default ProblemCard;