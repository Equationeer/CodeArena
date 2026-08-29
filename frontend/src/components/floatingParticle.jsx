import { motion, useScroll, useTransform } from 'framer-motion';

const FloatingBackground = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  const symbols = [
    { char: '{ }', top: '10%', left: '15%', color: 'text-blue-500/20', y: y1 },
    { char: '< />', top: '40%', left: '80%', color: 'text-purple-500/20', y: y2 },
    { char: '( )', top: '70%', left: '10%', color: 'text-emerald-500/20', y: y1 },
    { char: '[ ]', top: '85%', left: '75%', color: 'text-yellow-500/20', y: y2 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {symbols.map((s, i) => (
        <motion.div
          key={i}
          style={{ top: s.top, left: s.left, y: s.y, rotate }}
          className={`absolute text-6xl font-mono font-bold ${s.color}`}
        >
          {s.char}
        </motion.div>
      ))}
    </div>
  );
};
export default FloatingBackground;