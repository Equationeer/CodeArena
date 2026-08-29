import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { User } from 'lucide-react';
import { loginUser, logoutUser } from "../Slice";
import { useNavigate } from "react-router";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth)
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handlelogout = () => {
    dispatch(logoutUser());
    console.log("User Logout Successfully");
  }

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-2xl relative z-50">
      {/* Left Section: Logo */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="text-2xl font-bold text-yellow-400 cursor-pointer tracking-tight"
      >
        <button onClick={()=>{navigate("/")}}> LeetCode</button>
      </motion.div>

      {/* Right Section: Auth UI */}
      <div className="flex items-center gap-4">
        {!isAuthenticated ? (
          <button onClick={() => { navigate("/login") }} className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-md transition duration-200 font-medium">
            Login
          </button>
        ) : (
          <div className="relative" ref={dropdownRef}>
            {/* Username Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md transition duration-200 border border-gray-700"
            >
              <span className="font-medium">{user.firstName}</span>
              <User size={14} />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 overflow-hidden"
                >
                  <div className="px-4 py-2 text-xs text-gray-400 uppercase font-bold tracking-wider">
                    User Settings
                  </div>
                  <button onClick={()=>{navigate("/profile")}} className="w-full text-left px-4 py-2.5 hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2">
                    <span className="text-sm">Profile</span>
                  </button>
                  <button onClick={()=>{navigate('/problems')}} className="w-full text-left px-4 py-2.5 hover:bg-gray-700 transition-colors duration-150 flex items-center gap-2">
                    <span className="text-sm">
                      All Problems</span>
                  </button>
                  <hr className="border-gray-700 my-1" />
                  <button
                    className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-red-400 transition-colors duration-150 flex items-center gap-2"
                    onClick={handlelogout}
                  >
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;