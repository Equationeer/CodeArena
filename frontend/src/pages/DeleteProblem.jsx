import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, AlertCircle, Filter, X } from 'lucide-react';
import ProblemCard from '../components/ProblemCard';
import ConfirmModal from '../components/Confirmation';
import axiosMain from '../utils/axios';
import { getAllProblem } from '../Slice';
import { useSelector, useDispatch } from 'react-redux';
import DeletePageSkeleton from '../components/DeleteSkeleton';
const DeleteProblemPage = () => {
    const dispatch = useDispatch();
    const { problems } = useSelector((state) => state.problem);
    useEffect(() => {
        if (problems.length == 0) dispatch(getAllProblem());
    }, [dispatch]);
    console.log(problems);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDifficulty, setFilterDifficulty] = useState("All");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [problemToDelete, setProblemToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    // Filter Logic
    const filteredProblems = useMemo(() => {
        return problems.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterDifficulty === "All" || p.difficultyLevel === filterDifficulty;
            return matchesSearch && matchesFilter;
        });
    }, [problems, searchQuery, filterDifficulty]);

    const handleDeleteTrigger = (problem) => {
        setProblemToDelete(problem);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        console.log(problemToDelete._id);
        try {
            setLoading(true);
            await axiosMain.delete(`problem/delete/${problemToDelete._id}`);
            setLoading(false);
        } catch (err) {
            console.log("Error: " + err.message);
        }
        await dispatch(getAllProblem());
        setIsModalOpen(false);
        setProblemToDelete(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            {loading == true ? (<DeletePageSkeleton />) : (<div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-rose-500/30 font-sans">
                {/* Background Decorative Gradients */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                    <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-rose-500/10 blur-[120px] rounded-full" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-12">
                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                Delete Problems
                            </h1>
                            <p className="text-slate-400 mt-2 text-lg">
                                Manage the repository and remove outdated challenges.
                            </p>
                        </motion.div>

                        {/* Search & Filter Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-wrap items-center gap-4"
                        >
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-rose-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search problems..."
                                    className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all w-64"
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
                                            ? 'bg-slate-800 text-white shadow-lg'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </header>

                    {/* Problem Grid */}
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence mode='popLayout'>
                            {filteredProblems.length > 0 ? (
                                filteredProblems.map((problem, index) => (
                                    <ProblemCard
                                        problem={problem}
                                        index={index}
                                        onAction={() => handleDeleteTrigger(problem)}
                                        actionLabel="Delete Problem"
                                        actionIcon={Trash2}
                                        actionColor="from-rose-600 to-rose-500"
                                    />
                                ))
                            ) : (
                                <EmptyState />
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Confirmation Modal */}
                <ConfirmModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={problemToDelete?.title}
                />
            </div>)}
        </motion.div>

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

export default DeleteProblemPage;