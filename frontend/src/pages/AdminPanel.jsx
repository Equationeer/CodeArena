import React from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  LayoutDashboard,
  Settings,
  Bell,
  Search,
  Video
} from 'lucide-react';
import { useNavigate } from 'react-router';

// --- Animation Variants ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
  },
};

// --- Components ---

const ActionCard = ({ title, description, icon: Icon, colorClass, shadowColor,index }) => {
    const navigate=useNavigate();
    const handleAction=(index)=>{
        if(index==0) navigate("registerAdmin")
        if(index==1) navigate("createProblem");
        if(index==3) navigate("deleteProblem");
        if(index==4) navigate("uploadVideo");
    }
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ 
        y: -8, 
        transition: { duration: 0.2 } 
      }}
      className="relative group"
    >
      {/* Decorative Gradient Glow */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClass} rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500`} />
      
      {/* Main Card */}
      <div className="relative flex flex-col h-full p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors duration-300">
        
        {/* Icon Header */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center mb-6 shadow-lg ${shadowColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Text Content */}
        <div className="flex-grow">
          <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
            {title}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            {description}
          </p>
        </div>
        {/* Action Button */}
        <motion.button
            onClick={()=>{handleAction(index)}}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-all duration-200 group/btn"
        >
          <span>Manage Platform</span>
          <ChevronRight className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const actions = [
    {
      title: "Register Admin",
      description: "Provision new administrative accounts with specific role-based access control and permissions.",
      icon: UserPlus,
      colorClass: "from-blue-500 to-indigo-600",
      shadowColor: "shadow-blue-500/20",
    },
    {
      title: "Create Problem",
      description: "Draft and publish new algorithmic challenges with test cases, constraints, and custom solutions.",
      icon: PlusCircle,
      colorClass: "from-emerald-500 to-teal-600",
      shadowColor: "shadow-emerald-500/20",
    },
    {
      title: "Update Problem",
      description: "Modify existing challenge metadata, adjust difficulty levels, or update standard test parameters.",
      icon: Edit3,
      colorClass: "from-amber-400 to-orange-600",
      shadowColor: "shadow-amber-500/20",
    },
    {
      title: "Delete Problem",
      description: "Permanently remove challenges from the public directory or archive them for internal review.",
      icon: Trash2,
      colorClass: "from-rose-500 to-red-600",
      shadowColor: "shadow-rose-500/20",
    },
    {
      title: "Upload Editorial Video",
      description: "Upload solution video for problems",
      icon: Video,
      colorClass: "from-emerald-500 to-teal-600",
      shadowColor: "shadow-emerald-500/20",
    },
  ];

  return (
    <div className=" bg-slate-950 text-slate-200 selection:bg-indigo-500/30 font-sans">
      
      {/* Background Decorative Element */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-4">
            Admin Console
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Welcome back, Administrator. Control your platform's core functions, 
            manage problem sets, and oversee system users from a centralized interface.
          </p>
        </motion.div>

        {/* Action Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {actions.map((action, index) => (
            <ActionCard key={index} {...action} index={index} />
          ))}
        </motion.div>

        {/* Footer Subtle Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-20 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm"
        >
          <p>© 2024 Solver Platform Inc. All system actions are logged.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">System Status</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Support</a>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;