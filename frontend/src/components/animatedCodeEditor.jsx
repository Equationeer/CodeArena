import { TypeAnimation } from 'react-type-animation';
import { motion, useScroll, useTransform } from 'framer-motion';
import FloatingBackground from './floatingParticle';

const HeroCodeEditor = () => {
  const codeString = `function twoSum(nums, target) {
  const map = new Map();
  for(let i = 0; i < nums.length; i++){
    const complement = target - nums[i];
    if(map.has(complement)){
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative group"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
      <div className="relative bg-[#0f172a] border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700 bg-slate-800/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-slate-400 text-xs font-mono ml-4">twoSum.js</span>
        </div>
        <div className="p-6 font-mono text-sm sm:text-base leading-relaxed overflow-x-auto min-h-[300px]">
          <TypeAnimation
            sequence={[codeString, 2000, ""]}
            repeat={Infinity}
            cursor={true}
            className="text-slate-300 whitespace-pre"
            style={{ display: 'block' }}
          />
          {/* Static Syntax Highlight Layer (Optional/Visual) */}
          <div className="absolute top-[68px] left-6 pointer-events-none opacity-20">
            {/* You can overlay a highlighted version here for better aesthetics */}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default HeroCodeEditor;