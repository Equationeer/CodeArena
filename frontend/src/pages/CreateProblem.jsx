import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import axiosMain from "../utils/axios"
import {useSelector} from "react-redux"
import {
  Plus,
  Trash2,
  Code2,
  Beaker,
  Eye,
  EyeOff,
  Tag,
  Send,
  ChevronDown,
  Info
} from 'lucide-react';

// --- ZOD SCHEMA ---
const testCaseSchema = z.object({
  input: z.string().min(1, "Input is required"),
  output: z.string().min(1, "Output is required"),
  explanation: z.string().optional(),
});

const codeBlockSchema = z.object({
  language: z.string().min(1, "Language is required"),
  code: z.string().min(1, "Code is required"),
});

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be detailed"),
  difficultyLevel: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.array(z.string()).min(1, "Add at least one tag"),
  visibleTestCases: z.array(testCaseSchema).min(1, "Add at least one visible test case"),
  invisibleTestCases: z.array(testCaseSchema.omit({ explanation: true })).min(1, "Add at least one hidden test case"),
  startCode: z.array(codeBlockSchema).min(1, "Add at least one starter code"),
  referenceSolution: z.array(codeBlockSchema).min(1, "Add at least one reference solution"),
});

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

// --- HELPER COMPONENTS ---

const FormSection = ({ title, children, icon: Icon }) => (
  <motion.section
    variants={sectionVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    className="mb-12"
  >
    <div className="flex items-center gap-3 mb-6">
      {Icon && <Icon className="text-indigo-400 w-6 h-6" />}
      <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
      <div className="h-[1px] flex-1 bg-slate-700/50 ml-4"></div>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </motion.section>
);

const GlassCard = ({ children, className = "" }) => (
  <div className={`bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-xl ${className}`}>
    {children}
  </div>
);

const InputWrapper = ({ label, error, children }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-medium text-slate-400 ml-1">{label}</label>
    {children}
    {error && <span className="text-red-400 text-xs mt-1 ml-1">{error.message}</span>}
  </div>
);

// --- MAIN PAGE COMPONENT ---

const CreateProblemPage = () => {
  const [tagInput, setTagInput] = useState("");
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      difficultyLevel: "Medium",
      tags: [],
      visibleTestCases: [{ input: "", output: "", explanation: "" }],
      invisibleTestCases: [{ input: "", output: "" }],
      startCode: [{ language: "javascript", code: "" }],
      referenceSolution: [{ language: "javascript", code: "" }],
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: "visibleTestCases" });
  const { fields: invisibleFields, append: appendInvisible, remove: removeInvisible } = useFieldArray({ control, name: "invisibleTestCases" });
  const { fields: startCodeFields, append: appendStartCode, remove: removeStartCode } = useFieldArray({ control, name: "startCode" });
  const { fields: refSolFields, append: appendRefSol, remove: removeRefSol } = useFieldArray({ control, name: "referenceSolution" });

  const tags = watch("tags");
  const difficulty = watch("difficultyLevel");

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setValue("tags", [...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setValue("tags", tags.filter(t => t !== tagToRemove));
  };

  const onSubmit = async (data) => {
    console.log("Original Form Data:", data);
    const payload = {
      ...data,

      visibleTestCases: data.visibleTestCases.map((t) => ({
        input: t.input,
        output: t.output,
        explaination: t.explanation || ""
      })),

      invisibleTestCases: data.invisibleTestCases,

      startCode: data.startCode.map((c) => ({
        language: c.language,
        initialCode: c.code
      })),

      referenceSolution: data.referenceSolution.map((c) => ({
        language: c.language,
        completeCode: c.code
      }))
    };

    // console.log("Payload Sent To Backend:", payload);

    try {
      const submit = await axiosMain.post("problem/create", payload);
      console.log(submit.data);
      alert(submit.data);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };


  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4">
            Create New Coding Problem
          </h1>
          <p className="text-slate-400 text-lg">
            Design high-quality challenges with test cases and multi-language support.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Section 1: Basic Info */}
          <FormSection title="Basic Information" icon={Info}>
            <GlassCard>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InputWrapper label="Problem Title" error={errors.title}>
                    <input
                      {...register("title")}
                      placeholder="e.g. Two Sum"
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </InputWrapper>
                </div>

                <div className="md:col-span-2">
                  <InputWrapper label="Description" error={errors.description}>
                    <textarea
                      {...register("description")}
                      rows={6}
                      placeholder="Describe the problem, constraints, and examples..."
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
                    />
                  </InputWrapper>
                </div>

                <InputWrapper label="Difficulty Level" error={errors.difficultyLevel}>
                  <div className="relative">
                    <select
                      {...register("difficultyLevel")}
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg py-2.5 px-4 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                    <div className={`absolute right-10 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-xs font-bold uppercase ${difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                        difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                      {difficulty}
                    </div>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </InputWrapper>

                <InputWrapper label="Tags" error={errors.tags}>
                  <div className="flex flex-wrap gap-2 p-2 min-h-[48px] bg-slate-800/50 border border-slate-600 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <AnimatePresence>
                      {tags.map((tag) => (
                        <motion.span
                          key={tag}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                        >
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)}>
                            <Trash2 size={12} className="hover:text-red-400" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add tag and press Enter..."
                      className="bg-transparent border-none outline-none flex-1 min-w-[120px] text-sm"
                    />
                  </div>
                </InputWrapper>
              </div>
            </GlassCard>
          </FormSection>

          {/* Section 2: Visible Test Cases */}
          <FormSection title="Visible Test Cases" icon={Eye}>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {visibleFields.map((field, index) => (
                  <motion.div key={field.id} variants={cardVariants} initial="hidden" animate="visible" exit="exit" layout>
                    <GlassCard className="relative group">
                      <button
                        type="button"
                        onClick={() => removeVisible(index)}
                        className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputWrapper label={`Input #${index + 1}`}>
                          <textarea {...register(`visibleTestCases.${index}.input`)} className="bg-slate-900 border border-slate-700 rounded p-2 font-mono text-xs" />
                        </InputWrapper>
                        <InputWrapper label={`Output #${index + 1}`}>
                          <textarea {...register(`visibleTestCases.${index}.output`)} className="bg-slate-900 border border-slate-700 rounded p-2 font-mono text-xs" />
                        </InputWrapper>
                        <div className="md:col-span-2">
                          <InputWrapper label="Explanation (Markdown supported)">
                            <input {...register(`visibleTestCases.${index}.explanation`)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm" />
                          </InputWrapper>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => appendVisible({ input: "", output: "", explanation: "" })}
                className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add Visible Test Case
              </button>
            </div>
          </FormSection>

          {/* Section 3: Hidden Test Cases */}
          <FormSection title="Hidden Test Cases" icon={EyeOff}>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {invisibleFields.map((field, index) => (
                  <motion.div key={field.id} variants={cardVariants} initial="hidden" animate="visible" exit="exit" layout>
                    <GlassCard>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Secret Judge Case #{index + 1}</span>
                        <button type="button" onClick={() => removeInvisible(index)} className="text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <textarea {...register(`invisibleTestCases.${index}.input`)} placeholder="Input" className="bg-slate-900 border border-slate-700 rounded p-2 font-mono text-xs h-24" />
                        <textarea {...register(`invisibleTestCases.${index}.output`)} placeholder="Output" className="bg-slate-900 border border-slate-700 rounded p-2 font-mono text-xs h-24" />
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => appendInvisible({ input: "", output: "" })}
                className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-purple-500 hover:text-purple-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add Hidden Test Case
              </button>
            </div>
          </FormSection>

          {/* Section 4: Starter Code */}
          <FormSection title="Starter Code" icon={Code2}>
            <div className="space-y-6">
              {startCodeFields.map((field, index) => (
                <GlassCard key={field.id}>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <select {...register(`startCode.${index}.language`)} className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-500">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                      </select>
                      <button type="button" onClick={() => removeStartCode(index)} className="text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>
                    </div>
                    <textarea
                      {...register(`startCode.${index}.code`)}
                      placeholder="// Write starter function here..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm min-h-[200px] text-emerald-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </GlassCard>
              ))}
              <button
                type="button"
                onClick={() => appendStartCode({ language: "javascript", code: "" })}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                <Plus size={16} /> Add Language Template
              </button>
            </div>
          </FormSection>

          {/* Section 5: Reference Solution */}
          <FormSection title="Reference Solution" icon={Beaker}>
            <div className="space-y-6">
              {refSolFields.map((field, index) => (
                <GlassCard key={field.id} className="border-emerald-500/20">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <select {...register(`referenceSolution.${index}.language`)} className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-sm">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                      </select>
                      <button type="button" onClick={() => removeRefSol(index)} className="text-slate-500 hover:text-red-400"><Trash2 size={18} /></button>
                    </div>
                    <textarea
                      {...register(`referenceSolution.${index}.code`)}
                      placeholder="// Write the complete optimal solution..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm min-h-[200px] text-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </GlassCard>
              ))}
              <button
                type="button"
                onClick={() => appendRefSol({ language: "javascript", code: "" })}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
              >
                <Plus size={16} /> Add Solution Language
              </button>
            </div>
          </FormSection>

          {/* Section 6: Creator
          <FormSection title="Problem Creator" icon={Tag}>
            <GlassCard>
              <InputWrapper label="Creator User ID (ObjectId)" error={errors.problemCreator}>
                <input
                  {...register("problemCreator")}
                  placeholder="64f1a2b3c4d5e6f7a8b9c0d1"
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-xs"
                />
              </InputWrapper>
            </GlassCard>
          </FormSection> */}

          {/* Submit Button */}
          <motion.div
            className="pt-10 pb-20"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  Create Problem
                </>
              )}
            </button>
            <p className="text-center text-slate-500 text-xs mt-4 uppercase tracking-widest font-medium">
              Ensure all test cases and solutions are verified before publishing
            </p>
          </motion.div>

        </form>
      </div>
    </div>
  );
};

export default CreateProblemPage;