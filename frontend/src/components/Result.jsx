import React from "react";
import { motion } from "framer-motion";
import {
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiChip,
  HiCode
} from "react-icons/hi";

const SubmissionResult = ({ result }) => {
  if (!result) return null;

  const {
    status,
    runtime,
    memory,
    language,
    code,
    testCasePassed,
    testCasesTotal,
    errorMessage,
  } = result;

  const isAccepted = status === "Accepted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-6"
    >
      {/* HEADER */}
      <div className="flex items-center gap-4">
        {isAccepted ? (
          <HiCheckCircle className="text-emerald-400 text-3xl" />
        ) : (
          <HiXCircle className="text-rose-400 text-3xl" />
        )}

        <div>
          <h2 className="text-xl font-bold text-white">{status}</h2>
          <p className="text-slate-400 text-sm">
            {testCasePassed}/{testCasesTotal} Testcases Passed
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-slate-400 text-xs flex items-center gap-2">
            <HiClock /> Runtime
          </p>
          <p className="text-white font-semibold mt-1">
            {runtime} sec
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <p className="text-slate-400 text-xs flex items-center gap-2">
            <HiChip /> Memory
          </p>
          <p className="text-white font-semibold mt-1">
            {memory} KB
          </p>
        </div>
      </div>

      {/* LANGUAGE */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <p className="text-slate-400 text-xs">Language</p>
        <p className="text-white font-semibold mt-1 uppercase">
          {language}
        </p>
      </div>

      {/* ERROR */}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
          <p className="text-rose-400 text-sm font-semibold">Error</p>
          <pre className="text-rose-300 text-xs mt-2 whitespace-pre-wrap">
            {errorMessage}
          </pre>
        </div>
      )}

      {/* CODE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800">
          <HiCode className="text-blue-400" />
          <span className="text-sm text-slate-400">Submitted Code</span>
        </div>

        <pre className="p-4 text-sm text-slate-300 overflow-x-auto font-mono bg-[#0a0f1d]">
          {code}
        </pre>
      </div>
    </motion.div>
  );
};

export default SubmissionResult;