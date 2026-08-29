import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { FaCode, FaTrophy, FaBriefcase, FaArrowRight, FaQuoteLeft } from 'react-icons/fa';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import FloatingBackground from "../components/floatingParticle"
import HeroCodeEditor from "../components/animatedCodeEditor"
import {useNavigate} from "react-router"

export default function HomePage() {

    const { scrollYProgress } = useScroll()
    const navigate =useNavigate();
    // raw scroll movement
    const rawX = useTransform(scrollYProgress, [0, 1], [0, -1200])

    // smooth spring animation
    const testimonialX = useSpring(rawX, {
        stiffness: 120,
        damping: 30,
        mass: 0.5
    })

    return (
        <div className="bg-[#0f172a] text-white selection:bg-blue-500/30 overflow-x-hidden">
            <FloatingBackground />

            {/* HERO SECTION */}
            <section className="relative min-h-[calc(100vh-80px)] flex items-center px-6 lg:px-20 py-20 z-10">
                <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">

                    <motion.div
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >

                        <h1 className="text-5xl lg:text-7xl py-3 font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
                            Master Coding Through Practice
                        </h1>

                        <p className="text-slate-400 text-lg lg:text-xl mb-8 leading-relaxed max-w-xl">
                            The ultimate platform to level up your algorithms, data structures, and system design skills.
                            Join millions of developers preparing for technical interviews.
                        </p>

                        <div className="flex flex-wrap gap-4">

                            <button onClick={()=>{navigate('/problems')}}  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20">
                                Start Solving
                            </button>

                            <button onClick={()=>{navigate('/problems')}} className="px-8 py-4 border border-slate-700 hover:bg-slate-800 rounded-full font-bold transition-all">
                                Explore Problems
                            </button>

                        </div>

                    </motion.div>

                    <HeroCodeEditor />

                </div>
            </section>


            {/* FEATURES */}
            <section className="py-24 px-6 relative z-10 bg-slate-900/50 backdrop-blur-3xl">

                <div className="container mx-auto">

                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-center mb-16"
                    >
                        Everything you need to <span className="text-blue-400">Cracker the Code</span>
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-8">

                        <FeatureCard icon={<FaCode />} title="Practice Problems" desc="Over 2,000+ hand-picked problems with detailed solutions." />
                        <FeatureCard icon={<FaTrophy />} title="Coding Contests" desc="Compete globally and win exciting prizes every week." />
                        <FeatureCard icon={<FaBriefcase />} title="Interview Prep" desc="Curated lists for Google, Amazon, and Meta interviews." />

                    </div>

                </div>

            </section>


            {/* HOW IT WORKS */}
            <section className="py-24 px-6 relative z-10">

                <div className="container mx-auto max-w-4xl">

                    <h2 className="text-4xl font-bold text-center mb-20">
                        How It Works
                    </h2>

                    <div className="space-y-16">

                        <Step number="1" title="Pick a Problem" desc="Select from various categories: Arrays, Linked Lists, Graphs, and more." />
                        <Step number="2" title="Write Your Code" desc="Use our integrated editor with real-time feedback and hints." />
                        <Step number="3" title="Submit and Improve" desc="Run your code against test cases and optimize for performance." />

                    </div>

                </div>

            </section>


            {/* STATISTICS */}
            <section className="py-24 px-6 bg-blue-600/10 border-y border-blue-500/10">

                <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">

                    <Stat value={1000000} label="Users" suffix="+" />
                    <Stat value={2000} label="Problems" suffix="+" />
                    <Stat value={500} label="Companies" suffix="+" />

                </div>

            </section>


            {/* TESTIMONIALS */}
            <section className="py-24 overflow-hidden relative z-10">

                <div className="container mx-auto mb-12 px-6">
                    <h2 className="text-4xl font-bold">Trusted by Thousands</h2>
                </div>

                <motion.div
                    style={{ x: testimonialX }}
                    className="flex gap-8 px-6 whitespace-nowrap"
                >

                    {[...Array(6), ...Array(6)].map((_, i) => (
                        <TestimonialCard key={i} />
                    ))}

                </motion.div>

            </section>


            {/* CTA */}
            <section className="py-32 px-6 relative">

                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>

                <div className="container mx-auto text-center relative z-10">

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                    >

                        <h2 className="text-5xl font-bold mb-8">
                            Start Your Coding Journey Today
                        </h2>

                        <button onClick={()=>{navigate('/problems')}}   className="px-12 py-5 bg-white text-blue-600 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-white/20 transition-all flex items-center gap-3 mx-auto">
                            Get Started Free <FaArrowRight />
                        </button>

                    </motion.div>

                </div>

            </section>


            {/* FOOTER */}
            <footer className="py-12 px-6 border-t border-slate-800 text-slate-500">

                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">

                    <span className="text-xl font-bold text-white">DevPractice.</span>

                    <div className="flex gap-8">
                        <a href="#" className="hover:text-blue-400 transition">About</a>
                        <a href="#" className="hover:text-blue-400 transition">Blog</a>
                        <a href="#" className="hover:text-blue-400 transition">Privacy</a>
                        <a href="#" className="hover:text-blue-400 transition">Contact</a>
                    </div>

                    <span>© 2026 Leetcode Inc.</span>

                </div>

            </footer>

        </div>
    );
}


/* Feature Card */

function FeatureCard({ icon, title, desc }) {
    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700 backdrop-blur-md hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-default"
        >
            <div className="text-4xl text-blue-500 mb-6">{icon}</div>
            <h3 className="text-2xl font-bold mb-4">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{desc}</p>
        </motion.div>
    );
}


/* Steps */

function Step({ number, title, desc }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-8 items-start"
        >
            <div className="w-12 h-12 shrink-0 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
                {number}
            </div>

            <div>
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{desc}</p>
            </div>
        </motion.div>
    );
}


/* Stats */

function Stat({ value, label, suffix }) {

    const [ref, inView] = useInView({ triggerOnce: true })

    return (
        <div ref={ref}>
            <h3 className="text-5xl font-bold text-blue-400 mb-2">
                {inView && <CountUp end={value} duration={3} separator="," />}
                {suffix}
            </h3>

            <p className="text-slate-400 uppercase tracking-widest font-semibold">
                {label}
            </p>
        </div>
    );
}


/* Testimonial Card */

function TestimonialCard() {
    return (
        <div className="min-w-[400px] p-8 rounded-2xl bg-slate-800/40 border border-slate-700 backdrop-blur-sm">

            <FaQuoteLeft className="text-blue-500/30 text-4xl mb-4" />

            <p className="text-slate-300 mb-6 italic whitespace-normal">
                "This platform helped me land my dream job at Google. The interface is intuitive and the problem set is incredible."
            </p>

            <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>

                <div>
                    <h4 className="font-bold">Software Engineer</h4>
                    <p className="text-slate-500 text-sm">FAANG Candidate</p>
                </div>

            </div>

        </div>
    );
}