import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  HiCheckCircle, HiXCircle, HiClock, 
  HiCode, HiChevronDown, HiChevronUp, 
  HiTerminal, HiChip, HiFilter, HiSortDescending 
} from 'react-icons/hi';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for Tailwind class merging
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to "X mins ago" style
 */
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
};

/**
 * SUBMISSION CARD COMPONENT
 */
const SubmissionCard = ({ submission, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isAccepted = submission.status === "Accepted";
  const isWrong = submission.status === "Wrong Answer";

  const statusColor = isAccepted 
    ? "text-emerald-400" 
    : isWrong 
    ? "text-rose-400" 
    : "text-amber-400";

  const statusBg = isAccepted 
    ? "bg-emerald-500/10 border-emerald-500/20" 
    : isWrong 
    ? "bg-rose-500/10 border-rose-500/20" 
    : "bg-amber-500/10 border-amber-500/20";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.005 }}
      className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md transition-all hover:border-slate-700 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]"
    >
      <div className="p-5">
        {/* Top Row: Status & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={isAccepted ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {isAccepted && <HiCheckCircle className="h-6 w-6 text-emerald-400" />}
              {isWrong && <HiXCircle className="h-6 w-6 text-rose-400" />}
              {!isAccepted && !isWrong && <HiClock className="h-6 w-6 text-amber-400" />}
            </motion.div>
            
            <div>
              <h3 className={cn("text-lg font-bold tracking-tight", statusColor)}>
                {submission.status}
              </h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                {submission.language} • {formatTimeAgo(submission.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <HiCode className="h-4 w-4" />
              {isExpanded ? "Hide Code" : "View Code"}
              {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
            </button>
          </div>
        </div>

        {/* Middle Row: Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-800/50 pt-4">
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-xs text-slate-500 uppercase">
              <HiClock className="h-3 w-3" /> Runtime
            </span>
            <span className="text-sm font-mono font-medium text-slate-200">
              {submission.runtime} ms
            </span>
          </div>
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-xs text-slate-500 uppercase">
              <HiChip className="h-3 w-3" /> Memory
            </span>
            <span className="text-sm font-mono font-medium text-slate-200">
              {submission.memory} KB
            </span>
          </div>
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-xs text-slate-500 uppercase">
              <HiTerminal className="h-3 w-3" /> Test Cases
            </span>
            <span className="text-sm font-mono font-medium text-slate-200">
              {submission.testCasePassed} / {submission.testCasesTotal}
            </span>
          </div>
        </div>

        {/* Error Message Section */}
        {submission.errorMessage && (
          <div className="mt-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3">
            <p className="text-xs font-mono text-rose-400 break-all leading-relaxed">
              {submission.errorMessage}
            </p>
          </div>
        )}

        {/* Expandable Section: Monaco Editor */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6 overflow-hidden rounded-xl border border-slate-700 bg-[#1e1e1e]">
                <div className="flex items-center justify-between bg-slate-800/50 px-4 py-2 text-xs text-slate-400">
                  <span>Source Code</span>
                  <span>{submission.language}</span>
                </div>
                <Editor
                  height="300px"
                  language={submission.language.toLowerCase()}
                  value={submission.code}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                    domReadOnly: true,
                    automaticLayout: true,
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/**
 * MAIN SUBMISSION HISTORY COMPONENT
 */
const SubmissionHistory = ({ submissions = [] }) => {
  const [filter, setFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('latest');

  // Filter & Sort Logic
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];
    
    if (filter !== 'All') {
      result = result.filter(s => s.status === filter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [submissions, filter, sortOrder]);

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 text-slate-200 md:p-8">
      <div className="mx-auto max-w-4xl">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Submissions</h1>
            <p className="text-slate-400">Review your past performance and code.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-900/60 p-1 border border-slate-800">
              {['All', 'Accepted', 'Wrong Answer'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-all rounded-md",
                    filter === type 
                      ? "bg-blue-600 text-white shadow-lg" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <button 
              onClick={() => setSortOrder(sortOrder === 'latest' ? 'oldest' : 'latest')}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <HiSortDescending className={cn("h-4 w-4 transition-transform", sortOrder === 'oldest' && "rotate-180")} />
              {sortOrder === 'latest' ? "Latest First" : "Oldest First"}
            </button>
          </div>
        </div>

        {/* Submissions List */}
        <motion.div layout className="flex flex-col gap-4">
          <AnimatePresence mode='popLayout'>
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((sub, idx) => (
                <SubmissionCard key={sub._id} submission={sub} index={idx} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl"
              >
                <div className="rounded-full bg-slate-900 p-4 mb-4">
                    <HiCode className="h-10 w-10 opacity-20" />
                </div>
                <p className="text-lg">No submissions found</p>
                <p className="text-sm">Try changing your filters or submit a solution.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default SubmissionHistory;