import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FiltersBar from '../components/FiltersBar';
import ProblemsTable from '../components/ProblemTable';
import axiosMain from "../utils/axios"
import { useSelector,useDispatch } from "react-redux"
import { problemSlice,getAllProblem } from '../Slice';
// Dummy Data
// const INITIAL_PROBLEMS = [
//   { id: 1, title: "Two Sum", difficulty: "Easy", tags: ["Array", "Hash Table"], isSolved: true },
//   { id: 2, title: "Longest Substring Without Repeating Characters", difficulty: "Medium", tags: ["String", "Sliding Window"], isSolved: false },
//   { id: 3, title: "Median of Two Sorted Arrays", difficulty: "Hard", tags: ["Array", "Binary Search"], isSolved: false },
//   { id: 4, title: "Reverse Integer", difficulty: "Easy", tags: ["Math"], isSolved: true },
//   { id: 5, title: "Container With Most Water", difficulty: "Medium", tags: ["Array", "Two Pointers"], isSolved: true },
//   { id: 6, title: "Merge k Sorted Lists", difficulty: "Hard", tags: ["Linked List", "Heap"], isSolved: false },
//   { id: 7, title: "Climbing Stairs", difficulty: "Easy", tags: ["DP"], isSolved: true },
//   { id: 8, title: "Word Search", difficulty: "Medium", tags: ["Backtracking", "Matrix"], isSolved: false },
//   { id: 9, title: "Binary Tree Level Order Traversal", difficulty: "Medium", tags: ["Tree", "BFS"], isSolved: true },
//   { id: 10, title: "Trapping Rain Water", difficulty: "Hard", tags: ["Stack", "Array"], isSolved: false },
//   { id: 11, title: "Valid Parentheses", difficulty: "Easy", tags: ["Stack", "String"], isSolved: true },
//   { id: 12, title: "Search in Rotated Sorted Array", difficulty: "Medium", tags: ["Array", "Binary Search"], isSolved: false },
//   { id: 13, title: "Rotate Image", difficulty: "Medium", tags: ["Array", "Matrix"], isSolved: false },
//   { id: 14, title: "Group Anagrams", difficulty: "Medium", tags: ["Hash Table", "String"], isSolved: true },
//   { id: 15, title: "Maximum Subarray", difficulty: "Medium", tags: ["Array", "DP"], isSolved: true },
//   { id: 16, title: "N-Queens", difficulty: "Hard", tags: ["Backtracking"], isSolved: false },
//   { id: 17, title: "Jump Game", difficulty: "Medium", tags: ["Greedy", "Array"], isSolved: false },
//   { id: 18, title: "Merge Intervals", difficulty: "Medium", tags: ["Array", "Sorting"], isSolved: true },
//   { id: 19, title: "Unique Paths", difficulty: "Medium", tags: ["DP"], isSolved: false },
//   { id: 20, title: "Edit Distance", difficulty: "Hard", tags: ["String", "DP"], isSolved: false },
// ];
const Problems = () => {

    const [filterStatus, setFilterStatus] = useState("All"); // All, Solved
    const [filterDifficulty, setFilterDifficulty] = useState("All");
    const [selectedTag, setSelectedTag] = useState("All");
    const [solveProblem, setSolveProblem] = useState([]);
    // const getAllProblem = async () => {
    //     try {
    //         const response = await axiosMain.get("problem/getAllproblem");
    //         setINITIAL_PROBLEMS(response.data);
    //         console.log(response.data);
    //     } catch (err) {
    //         console.log(err.message);
    //     }
    // }
    const {problems=[]}=useSelector((state)=>state.problem);
    const dispatch=useDispatch();
    const getsolvedProblem = async () => {
        try {
            const response = await axiosMain.get("problem/problemSolvedByUser");
            const solved=response.data.map((p)=>p._id);          
            setSolveProblem(solved);
        } catch (err) {
            console.log(err.message);
        }
    }
    useEffect(() => {
         if(problems.length==0)dispatch(getAllProblem());
    }, [problems,dispatch])
    useEffect(()=>{
        getsolvedProblem();
    },[])
    const filteredProblems = useMemo(() => {
        return problems
            .map(problem => ({
                ...problem,
                isSolved: solveProblem.includes(problem._id)
            }))
            .filter(problem => {
                const statusMatch =
                    filterStatus === "All" ||
                    (filterStatus === "Solved" && problem.isSolved);

                const difficultyMatch =
                    filterDifficulty === "All" ||
                    problem.difficultyLevel === filterDifficulty;

                const tagMatch =
                    selectedTag === "All" ||
                    problem.tags.includes(selectedTag);

                return statusMatch && difficultyMatch && tagMatch;
            });
    }, [problems, solveProblem, filterStatus, filterDifficulty, selectedTag]);
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 pt-24">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-2"
                >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        Problems
                    </h1>
                    <p className="text-slate-400">Master your coding skills with our curated problem set.</p>
                </motion.div>

                {/* Sticky Filters Bar */}
                <div className="sticky top-4 z-30">
                    <FiltersBar
                        status={filterStatus} setStatus={setFilterStatus}
                        difficulty={filterDifficulty} setDifficulty={setFilterDifficulty}
                        tag={selectedTag} setTag={setSelectedTag}
                    />
                    <button></button>
                </div>

                {/* Table Section */}
                <ProblemsTable problems={filteredProblems} />
            </div>
        </div>
    );
};

export default Problems;