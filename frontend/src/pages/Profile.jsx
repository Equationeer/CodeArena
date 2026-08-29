import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import {
    Trophy, CheckCircle2, Circle, Activity, Search,
    ChevronLeft, ChevronRight, LayoutDashboard, ExternalLink,
    ShieldCheck, Zap, Database, Clock
} from 'lucide-react';
import axiosMain from '../utils/axios';
import DashboardSkeleton from '../components/DashboardShimmer';
import { useSelector, useDispatch } from 'react-redux';
import { getAllProblem } from '../Slice';
import { useNavigate } from 'react-router';
// --- UTILS ---
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// --- COMPONENTS ---

const Badge = ({ children, variant = "default" }) => {
    const styles = {
        accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        wrong: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        admin: "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
        default: "bg-slate-700/50 text-slate-300 border-slate-600"
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}>
            {children}
        </span>
    );
};

const Card = ({ children, className = "", adminGlow = false }) => (
    <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className={`bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden relative ${adminGlow ? 'shadow-[0_0_20px_rgba(245,158,11,0.05)] border-amber-500/20' : ''} ${className}`}
    >
        {children}
    </motion.div>
);

const StatsCard = ({ title, value, icon: Icon, color, index }) => (
    <Card className="p-6 group">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between"
        >
            <div>
                <p className="text-slate-400 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-opacity-10 ${color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-').replace('/10', '')}`} />
            </div>
        </motion.div>
        <div className={`absolute bottom-0 left-0 h-1 transition-all duration-300 group-hover:w-full w-0 ${color.replace('/10', '')}`} />
    </Card>
);

const Dashboard = () => {
    // const [problemLength,setProblemLength]=useState(0);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate=useNavigate();
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchTerm, setSearchTerm] = useState("");
    const [API_DATA, SetAPI_DATA] = useState({});
    const { user = {}, submissions = [], pagination = {} } = API_DATA;
    const isAdmin = user?.role === "admin";

    const handleAdmin=()=>{
        navigate("/admin");
    }

    const { problems } = useSelector((state) => state.problem);
    useEffect(() => {
        if(problems.length==0)
        dispatch(getAllProblem());
    }, [problems,dispatch])
    const handleClick=(idx)=>{
        navigate(`/problems/${submissions[idx].problemId._id}`)
    }
    // Process data for charts
    const chartData = useMemo(() => {
        if (!submissions || submissions.length === 0) {
            return [
                { name: "No Data", runtime: 0, memory: 0 }
            ];
        }

        return submissions.map(s => ({
            name: formatDate(s.createdAt),
            runtime: s.runtime || 0,
            memory: s.memory || 0
        }));
    }, [submissions]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axiosMain.get(`user/getProfile?page=${page}&limit=${limit}`);
                SetAPI_DATA(response.data);
                setLoading(false);
                console.log(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [page])
    const totalProblems = problems?.length || 0;
    const solvedProblems = user?.totalProblemSolved || 0;
    const pieData = [
        {
            name: 'Solved',
            value: solvedProblems,
            color: '#FFA116'
        },
        {
            name: 'Unsolved',
            value: totalProblems - solvedProblems,
            color: '#6B7280'
        }
    ];
    const acceptanceRate = submissions.length
        ? ((pieData[0].value / totalProblems) * 100).toFixed(1)
        : 0;

    return (
        <>
            {loading == true ? <DashboardSkeleton /> : (<div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30">

                {/* HEADER SECTION */}
                <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg ${isAdmin ? 'ring-2 ring-amber-500/50 ring-offset-4 ring-offset-[#0f172a]' : ''}`}>
                                {user?.firstName?.[0] || "U"}
                            </div>
                            {isAdmin && (
                                <div className="absolute -top-2 -right-2 bg-amber-500 text-black p-1 rounded-lg shadow-xl">
                                    <ShieldCheck size={16} />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-white tracking-tight">{user.firstName}</h1>
                                {isAdmin && <Badge variant="admin">Premium Admin</Badge>}
                            </div>
                            <p className="text-slate-400 text-sm">{user.emailId}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right mr-4 hidden sm:block">
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Total Solved</p>
                            <p className="text-xl font-mono font-bold text-blue-400">{user.totalProblemSolved}</p>
                        </div>
                        {isAdmin && (
                            <motion.button
                                onClick={()=>{
                                    handleAdmin();
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold text-sm shadow-lg shadow-amber-500/20"
                            >
                                <LayoutDashboard size={18} /> Admin Panel
                            </motion.button>
                        )}
                    </div>
                </header>

                <main className="max-w-7xl mx-auto space-y-8">

                    {/* STATS SECTION */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard index={0} title="Total Submissions" value={pagination.total} icon={Activity} color="bg-blue-500/10" />
                        <StatsCard index={1} title="Total Problem Solved" value={user.totalProblemSolved} icon={CheckCircle2} color="bg-emerald-500/10" />
                        <StatsCard index={2} title="Unsolved Problem" value={pieData[1].value} icon={Circle} color="bg-rose-500/10" />
                        <StatsCard index={3} title="Completion Rate" value={`${acceptanceRate}%`} icon={Zap} color="bg-purple-500/10" />
                    </div>

                    {/* CHARTS SECTION */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 p-6" adminGlow={isAdmin}>
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <Activity size={20} className="text-blue-400" /> Performance Over Time
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorRuntime" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#60a5fa' }}
                                        />
                                        <Area type="monotone" dataKey="runtime" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRuntime)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="p-6 flex flex-col items-center justify-center">
                            <h3 className="text-lg font-semibold mb-4 self-start">Problem Distribution</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={70}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    {/* TABLE SECTION */}
                    <Card className="p-0">
                        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-semibold">Recent Submissions</h3>
                                <p className="text-sm text-slate-500">Showing {submissions.length} of {pagination.total} records</p>
                            </div>

                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search problem..."
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-slate-500 text-xs uppercase tracking-wider bg-slate-800/30">
                                        <th className="px-6 py-4 font-semibold">Problem Title</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold">Runtime</th>
                                        <th className="px-6 py-4 font-semibold">Memory</th>
                                        <th className="px-6 py-4 font-semibold">Date</th>
                                        <th className="px-6 py-4 font-semibold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {
                                        submissions.length == 0 ? (<tr>
                                            <td colSpan="6" className="py-10 text-center text-slate-500">
                                                No submissions yet
                                            </td>
                                        </tr>) : <AnimatePresence>

                                            {submissions
                                                .filter(s => s.problemId?.title?.toLowerCase().includes(searchTerm.toLowerCase()))
                                                .map((sub, idx) => (
                                                    <motion.tr
                                                        key={sub._id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="hover:bg-slate-800/30 transition-colors group"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <span className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                                                                {sub.problemId?.title}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant={sub.status === "Accepted" ? "accepted" : "wrong"}>
                                                                {sub.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                                                <Clock size={14} /> {sub.runtime} ms
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                                                <Database size={14} /> {sub.memory} KB
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-500">
                                                            {formatDate(sub.createdAt)}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={()=>{handleClick(idx)}} className="text-slate-500 hover:text-white transition-colors">
                                                                <ExternalLink size={18} />
                                                            </button>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                        </AnimatePresence>
                                    }
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        <div className="p-6 border-t border-slate-800 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Page <span className="text-slate-200 font-medium">{pagination.page}</span> of {pagination.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-50"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                {Array.from({ length: pagination.totalPages || 1 }, (_, i) => i + 1).map(num => (
                                    <button
                                        key={num}
                                        onClick={() => setPage(num)}
                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${pagination.page === num
                                            ? 'bg-blue-600 text-white'
                                            : 'border border-slate-700 hover:bg-slate-800'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(prev => Math.max(prev + 1, pagination.totalPages))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg border border-slate-700 hover:bg-slate-800 disabled:opacity-50"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </Card>

                </main >

                {/* FOOTER BLUR DECORATION */}
                < div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-blue-600/10 blur-[120px] pointer-events-none" />
            </div >)}
        </>

    );
};

export default Dashboard;