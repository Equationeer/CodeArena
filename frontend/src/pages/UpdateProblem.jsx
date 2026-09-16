import React, { useState, useMemo, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import axiosMain from '../utils/axios';
import { getAllProblem } from '../Slice';
import { useSelector, useDispatch } from 'react-redux';
import DeletePageSkeleton from '../components/DeleteSkeleton';
import ProblemCard from '../components/ProblemCard';
import {
  Search,
  Edit3,
  AlertCircle,
  Plus,
  Trash2,
  Code2,
  Beaker,
  Eye,
  EyeOff,
  Send,
  ChevronDown,
  Info,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

// --- ZOD SCHEMA (relaxed for update — fields are optional/partial) ---
const testCaseSchema = z.object({
  input: z.string().min(1, "Input is required"),
  output: z.string().min(1, "Output is required"),
  explanation: z.string().optional(),
});

const hiddenTestCaseSchema = z.object({
  input: z.string().min(1, "Input is required"),
  output: z.string().min(1, "Output is required"),
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
  // Allow 0 hidden test cases on update (some problems may not have them)
  invisibleTestCases: z.array(hiddenTestCaseSchema),
  startCode: z.array(codeBlockSchema).min(1, "Add at least one starter code"),
  referenceSolution: z.array(codeBlockSchema).min(1, "Add at least one reference solution"),
});

// --- ANIMATION VARIANTS ---
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
      {Icon && <Icon className="text-amber-400 w-6 h-6" />}
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

// --- EDIT PROBLEM FORM COMPONENT ---
const EditProblemForm = ({ problemId, onBack, onUpdated }) => {
  const [tagInput, setTagInput] = useState("");
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [serverSuccess, setServerSuccess] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      difficultyLevel: "Medium",
      tags: [],
      visibleTestCases: [{ input: "", output: "", explanation: "" }],
      invisibleTestCases: [],
      startCode: [{ language: "javascript", code: "" }],
      referenceSolution: [{ language: "javascript", code: "" }],
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: "visibleTestCases" });
  const { fields: invisibleFields, append: appendInvisible, remove: removeInvisible } = useFieldArray({ control, name: "invisibleTestCases" });
  const { fields: startCodeFields, append: appendStartCode, remove: removeStartCode } = useFieldArray({ control, name: "startCode" });
  const { fields: refSolFields, append: appendRefSol, remove: removeRefSol } = useFieldArray({ control, name: "referenceSolution" });

  const tags = watch("tags") || [];
  const difficulty = watch("difficultyLevel");

  useEffect(() => {
    const fetchProblemDetails = async () => {
      try {
        setLoadingProblem(true);
        const res = await axiosMain.get(`problem/getProblemForAdmin/${problemId}`);
        const data = res.data;

        reset({
          title: data.title || "",
          description: data.description || "",
          difficultyLevel: data.difficultyLevel || "Medium",
          tags: data.tags || [],
          visibleTestCases: (data.visibleTestCases || []).map((tc) => ({
            input: tc.input || "",
            output: tc.output || "",
            explanation: tc.explanation || tc.explaination || "",
          })),
          invisibleTestCases: (data.invisibleTestCases || []).map((tc) => ({
            input: tc.input || "",
            output: tc.output || "",
          })),
          startCode: (data.startCode || []).map((sc) => ({
            language: sc.language || "javascript",
            code: sc.initialCode || sc.code || "",
          })),
          referenceSolution: (data.referenceSolution || []).map((rs) => ({
            language: rs.language || "javascript",
            code: rs.completeCode || rs.code || "",
          })),
        });
      } catch (err) {
        console.error("Error loading problem:", err);
        setServerError(err.response?.data?.error || err.message || "Failed to load problem data");
      } finally {
        setLoadingProblem(false);
      }
    };

    if (problemId) {
      fetchProblemDetails();
    }
  }, [problemId, reset]);

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
    setServerError("");
    setServerSuccess("");

    const payload = {
      title: data.title,
      description: data.description,
      difficultyLevel: data.difficultyLevel,
      tags: data.tags,
      visibleTestCases: data.visibleTestCases.map((t) => ({
        input: t.input,
        output: t.output,
        explaination: t.explanation || "",
      })),
      invisibleTestCases: data.invisibleTestCases.map((t) => ({
        input: t.input,
        output: t.output,
      })),
      startCode: data.startCode.map((c) => ({
        language: c.language,
        initialCode: c.code,
      })),
      referenceSolution: data.referenceSolution.map((c) => ({
        language: c.language,
        completeCode: c.code,
      })),
    };

    console.log("Submitting update payload:", JSON.stringify(payload, null, 2));

    try {
      const res = await axiosMain.put(`problem/update/${problemId}`, payload);
      console.log("Update response:", res.data);
      setServerSuccess("Problem updated successfully!");
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error("Failed to update problem:", err);
      const errMsg =
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response.data : null) ||
        err.message ||
        "Unknown error";
      setServerError(errMsg);
    }
  };

  const onValidationError = (errors) => {
    console.error("Zod form validation errors:", errors);
    // Build a human-readable summary of all validation failures
    const messages = [];
    const collect = (obj, prefix = "") => {
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (val?.message) {
          messages.push(`${prefix}${key}: ${val.message}`);
        } else if (typeof val === "object") {
          collect(val, `${prefix}${key}.`);
        }
      }
    };
    collect(errors);
    setServerError("Validation failed — " + messages.join(" | "));
  };

  if (loadingProblem) {
    return <DeletePageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-all"
          >
            <ArrowLeft size={18} />
            <span>Back to Problems</span>
          </button>
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
            Problem ID: {problemId}
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 mb-4">
            Update Coding Problem
          </h1>
          <p className="text-slate-400 text-lg">
            Modify challenge metadata, adjust difficulty levels, and update test parameters.
          </p>
        </motion.div>

        {serverSuccess && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={20} />
            <span>{serverSuccess}</span>
          </div>
        )}

        {serverError && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="space-y-8">
          {/* Section 1: Basic Info */}
          <FormSection title="Basic Information" icon={Info}>
            <GlassCard>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InputWrapper label="Problem Title" error={errors.title}>
                    <input
                      {...register("title")}
                      placeholder="e.g. Two Sum"
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    />
                  </InputWrapper>
                </div>

                <div className="md:col-span-2">
                  <InputWrapper label="Description" error={errors.description}>
                    <textarea
                      {...register("description")}
                      rows={6}
                      placeholder="Describe the problem, constraints, and examples..."
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-amber-500 outline-none transition-all font-mono text-sm"
                    />
                  </InputWrapper>
                </div>

                <InputWrapper label="Difficulty Level" error={errors.difficultyLevel}>
                  <div className="relative">
                    <select
                      {...register("difficultyLevel")}
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-lg py-2.5 px-4 appearance-none focus:ring-2 focus:ring-amber-500 outline-none"
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
                  <div className="flex flex-wrap gap-2 p-2 min-h-[48px] bg-slate-800/50 border border-slate-600 rounded-lg focus-within:ring-2 focus-within:ring-amber-500 transition-all">
                    <AnimatePresence>
                      {tags.map((tag) => (
                        <motion.span
                          key={tag}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs flex items-center gap-2"
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
                className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-amber-500 hover:text-amber-400 transition-all flex items-center justify-center gap-2"
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
                className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-orange-500 hover:text-orange-400 transition-all flex items-center justify-center gap-2"
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
                      <select {...register(`startCode.${index}.language`)} className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-amber-500">
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm min-h-[200px] text-emerald-400 focus:ring-2 focus:ring-amber-500 outline-none"
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
                <GlassCard key={field.id} className="border-amber-500/20">
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm min-h-[200px] text-amber-300 focus:ring-2 focus:ring-amber-500 outline-none"
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

          {/* Submit Button */}
          <motion.div
            className="pt-6 pb-20"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/25 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
            >
              {isSubmitting ? (
                <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} />
                  Update Problem
                </>
              )}
            </button>
            <p className="text-center text-slate-500 text-xs mt-4 uppercase tracking-widest font-medium">
              Reference solutions will be verified with visible test cases during update
            </p>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

// --- MAIN UPDATE PROBLEM PAGE ---
const UpdateProblemPage = () => {
  const dispatch = useDispatch();
  const { problems } = useSelector((state) => state.problem);
  const [selectedProblemId, setSelectedProblemId] = useState(null);

  useEffect(() => {
    if (problems.length === 0) {
      dispatch(getAllProblem());
    }
  }, [dispatch]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterDifficulty === "All" || p.difficultyLevel === filterDifficulty;
      return matchesSearch && matchesFilter;
    });
  }, [problems, searchQuery, filterDifficulty]);

  const handleSelectProblem = (problem) => {
    setSelectedProblemId(problem._id);
  };

  const handleBackToList = () => {
    setSelectedProblemId(null);
  };

  const handleProblemUpdated = () => {
    dispatch(getAllProblem());
  };

  if (selectedProblemId) {
    return (
      <EditProblemForm
        problemId={selectedProblemId}
        onBack={handleBackToList}
        onUpdated={handleProblemUpdated}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-slate-950 text-slate-200 selection:bg-amber-500/30 font-sans"
    >
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-orange-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-amber-300 bg-clip-text text-transparent">
              Update Problems
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Select any challenge below to edit its details, test cases, and solutions.
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-4"
          >
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Search problems..."
                className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
              {['All', 'Easy', 'Medium', 'Hard'].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilterDifficulty(level)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filterDifficulty === level
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
          <AnimatePresence mode="popLayout">
            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem, index) => (
                <ProblemCard
                  key={problem._id}
                  problem={problem}
                  index={index}
                  onAction={() => handleSelectProblem(problem)}
                  actionLabel="Update Problem"
                  actionIcon={Edit3}
                  actionColor="from-amber-500 to-orange-600"
                />
              ))
            ) : (
              <EmptyState />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UpdateProblemPage;
