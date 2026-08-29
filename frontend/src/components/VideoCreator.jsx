import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Upload, AlertCircle } from 'lucide-react';
import ProblemCard from '../components/ProblemCard';
import { getAllProblem } from '../Slice';
import { useSelector, useDispatch } from 'react-redux';
import DeletePageSkeleton from '../components/DeleteSkeleton';
import VideoUpload from "./VideoUpload"

const UploadVideoPage = () => {
    const dispatch = useDispatch();
    const { problems } = useSelector((state) => state.problem);

    useEffect(() => {
        if (problems.length === 0) dispatch(getAllProblem());
    }, [dispatch]);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterDifficulty, setFilterDifficulty] = useState("All");
    const [loading, setLoading] = useState(false);
    const [popup, setPopup] = useState(false);
    const [problemUpload,setProblemUpload]=useState(null);

    // Filter Logic
    const filteredProblems = useMemo(() => {
        return problems.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterDifficulty === "All" || p.difficultyLevel === filterDifficulty;
            return matchesSearch && matchesFilter;
        });
    }, [problems, searchQuery, filterDifficulty]);

    // Upload Click (UI only)
    const handleUploadClick = (problem) => {
        // console.log("Upload video for:", problem);
        // alert(`Upload video for: ${problem.title}`);
        // <VideoUpload/>
        setProblemUpload(problem);
        setPopup(true);
    };

    return (
        <>
            {popup == true ? (<VideoUpload problem={problemUpload} />) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    {loading ? (<DeletePageSkeleton />) : (
                        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-rose-500/30 font-sans">

                            {/* Background */}
                            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                                <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-rose-500/10 blur-[120px] rounded-full" />
                            </div>

                            <div className="relative max-w-7xl mx-auto px-6 py-12">

                                {/* Header */}
                                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                            Upload Videos
                                        </h1>
                                        <p className="text-slate-400 mt-2 text-lg">
                                            Upload solution videos for problems.
                                        </p>
                                    </motion.div>

                                    {/* Search + Filter */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex flex-wrap items-center gap-4"
                                    >
                                        <div className="relative group">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="text"
                                                placeholder="Search problems..."
                                                className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 w-64"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                                            {['All', 'Easy', 'Medium', 'Hard'].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setFilterDifficulty(level)}
                                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filterDifficulty === level
                                                        ? 'bg-slate-800 text-white'
                                                        : 'text-slate-500 hover:text-slate-300'
                                                        }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </header>

                                {/* Grid */}
                                <motion.div
                                    layout
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                >
                                    <AnimatePresence mode='popLayout'>
                                        {filteredProblems.length > 0 ? (
                                            filteredProblems.map((problem, index) => (
                                                <ProblemCard
                                                    key={problem._id}
                                                    problem={problem}
                                                    index={index}
                                                    onAction={() => handleUploadClick(problem)}
                                                    actionLabel="Upload Video"
                                                    actionIcon={Upload}
                                                    actionColor="from-indigo-600 to-indigo-500"
                                                />
                                            ))
                                        ) : (
                                            <EmptyState />
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </>

    );
};

const EmptyState = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl"
    >
        <div className="bg-slate-900 p-4 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-xl font-medium text-slate-300">No problems found</h3>
        <p className="text-slate-500">Try adjusting your search or filter</p>
    </motion.div>
);

export default UploadVideoPage;