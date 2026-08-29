import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiFilter, FiCheckCircle } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import {useNavigate} from "react-router"
const Dropdown = ({ label, options, current, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
 
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-500 transition-colors min-w-[140px] justify-between"
      >
        <span className="text-sm font-medium">{current}</span>
        <FiChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full mt-2 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden"
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-700 transition-colors ${current === opt ? 'text-blue-400 bg-slate-700/50' : 'text-slate-300'}`}
                  onClick={() => {
                    onSelect(opt);
                    setIsOpen(false);
                  }}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const FiltersBar = ({ status, setStatus, difficulty, setDifficulty, tag, setTag }) => {
const tags = [
  "All",
  "Array",
  "String",
  "DP",
  "Hash Table",
  "Binary Search",
  "Tree",
  "Graph",
  "Greedy",
  "Backtracking",
  "Math",
  "Basic",
  "Two Pointer",
  "Stack",
  "Prefix",
  "DFS",
  "BFS"
];
  const difficulties = ["All", "Easy", "Medium", "Hard"];
 const role=useSelector((state)=>state.auth.user.role);
 const navigate =useNavigate();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl flex flex-wrap items-center gap-4 shadow-xl shadow-black/20"
    >
      {/* Status Toggle */}
      <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
        {["All", "Solved"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              status === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="h-8 w-[1px] bg-slate-700 hidden md:block" />

      {/* Tag Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</span>
        <Dropdown options={tags} current={tag} onSelect={setTag} />
      </div>

      {/* Difficulty Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Level</span>
        <Dropdown options={difficulties} current={difficulty} onSelect={setDifficulty} />
      </div>

      {role==="admin"&&(<div className="ml-auto hidden lg:block">
        <button onClick={()=>{navigate('/admin/createProblem')}} className='px-4 py-1.5 rounded-lg text-sm font-medium  bg-blue-600 text-white shadow-lg shadow-blue-900/20'>Create Problem</button>
      </div>)}
      {/* Results Count */}
      <div className="ml-auto hidden lg:block">
        <span className="text-slate-500 text-sm italic">Showing dynamic results...</span>
      </div>
    </motion.div>
  );
};

export default FiltersBar;