import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosMain from '../utils/axios';
import { useParams } from 'react-router';
import {
  HiChevronDown,
  HiPlay,
  HiCloudUpload,
  HiRefresh,
  HiClipboardCopy,
  HiTerminal,
  HiChevronRight,
  HiCode,
  HiCheckCircle,
  HiXCircle,
} from 'react-icons/hi';
import SubmissionHistory from '../components/SubmissionHistory';
import SubmissionResult from '../components/Result';
import AiChat from "../components/AiChat";
import Editorial from "../components/Editorial"

const ProblemDetailPage = () => {

  const { id } = useParams();

  const [problemData, setProblemData] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null);
  const [allSubmissions, setAllSubmission] = useState([]);
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axiosMain.get(`problem/problemById/${id}`);
        setProblemData(res.data);
        // console.log(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchProblem();
  }, [id]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res=await axiosMain.get(`problem/submittedProblem/${id}`);
        // console.log(res.data);
        setAllSubmission(res.data);
      } catch (error) {
        console.log("Error: " + error.message);
      }
    }
    fetchSubmissions();
  },[id,submissionResult])

  const {
    title,
    description,
    difficultyLevel,
    tags = [],
    visibleTestCases = [],
    startCode = [],
    referenceSolution = []
  } = problemData || {};

  const [selectedLang, setSelectedLang] = useState("");
  const [editorCode, setEditorCode] = useState("");

  const [resultTest, setResultTest] = useState([]);
  const [loading, setLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);

  const [activeNav, setActiveNav] = useState('description');

  const [activeTab, setActiveTab] = useState('testcase');
  const [showRefSolution, setShowRefSolution] = useState(false);

  const [activeTest, setActiveTest] = useState(0);

  const [refLang, setRefLang] = useState("");

  const [Video,setVideo]=useState({});

  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const runCode = async () => {
    if (!editorRef.current) return;
    setRunLoading(true);
    const code = editorRef.current.getValue();
    const runReq = {
      code: code,
      language: selectedLang
    }
    const result = await axiosMain.post(`submission/run/${id}`, runReq);
    setRunLoading(false);
    // console.log(result.data);
    setResultTest(result.data);
  };
  const handleTest = (i) => {
    setActiveTest(i);
  }
  const submitCode = async () => {
    if (!editorRef.current) return;
    setLoading(true);
    runCode();
    const code = editorRef.current.getValue();
    const runReq = {
      code: code,
      language: selectedLang
    }
    setActiveNav('result');
    setActiveTab('result');
    const result = await axiosMain.post(`submission/submit/${id}`, runReq);
    // console.log(result);
    setLoading(false);
    setSubmissionResult(result.data);
  };

  useEffect(() => {
    if (startCode.length > 0) {
      setSelectedLang(startCode[0].language);
      setEditorCode(startCode[0].initialCode);
    }
  }, [startCode]);

  useEffect(() => {
    const langData = startCode.find(c => c.language === selectedLang);
    if (langData && editorRef.current) {
      editorRef.current.setValue(langData.initialCode || " ");
    }
  }, [selectedLang, startCode]);
  
  useEffect(()=>{
    const fetchVideo = async () => {
      try {
        const res=await axiosMain.get(`video/getVideo/${id}`);
        setVideo(res.data);
        // console.log(res.data);
      } catch (error) {
        console.log("Error: " + error.message);
      }
    }
    fetchVideo();
  },[id])


  useEffect(() => {
    if (referenceSolution.length > 0) {
      setRefLang(referenceSolution[0].language);
    }
  }, [referenceSolution]);

  const difficultyStyles = {
    Easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    Hard: 'text-rose-400 bg-rose-400/10 border-rose-400/20'
  };
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-[#0f172a] text-slate-200">

      {/* LEFT PANEL */}
      <div className="w-full lg:w-[45%] h-full lg:h-screen overflow-y-auto border-r border-slate-800 custom-scrollbar">
        <div className="relative flex items-center gap-6 px-6 py-2 border-b border-slate-800 text-sm">

          {["description", "result", "solution","editorial", "submissions","aiChat"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveNav(tab)}
              className={`relative pb-2 capitalize transition-colors ${activeNav === tab ? "text-blue-400" : "text-slate-500"
                }`}
            >
              {tab}

              {/* 🔥 Magic underline */}
              {activeNav === tab && (
                <motion.div
                  layoutId="underline"
                  className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-blue-400"
                />
              )}
            </button>
          ))}

        </div>
        {loading == true ? (

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6 space-y-6"
          >

            {/* HEADER */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 relative overflow-hidden">
                <div className="shimmer" />
              </div>

              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-800 rounded relative overflow-hidden">
                  <div className="shimmer" />
                </div>
                <div className="h-3 w-40 bg-slate-800 rounded relative overflow-hidden">
                  <div className="shimmer" />
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4">
              {[1, 2].map((_, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="h-3 w-20 bg-slate-800 rounded relative overflow-hidden">
                    <div className="shimmer" />
                  </div>
                  <div className="h-4 w-16 bg-slate-800 rounded relative overflow-hidden">
                    <div className="shimmer" />
                  </div>
                </div>
              ))}
            </div>

            {/* LANGUAGE */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="h-3 w-20 bg-slate-800 rounded relative overflow-hidden">
                <div className="shimmer" />
              </div>
              <div className="h-4 w-24 bg-slate-800 rounded relative overflow-hidden">
                <div className="shimmer" />
              </div>
            </div>

            {/* ERROR (optional block placeholder) */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="h-3 w-16 bg-slate-800 rounded relative overflow-hidden">
                <div className="shimmer" />
              </div>
              <div className="h-3 w-full bg-slate-800 rounded relative overflow-hidden">
                <div className="shimmer" />
              </div>
              <div className="h-3 w-3/4 bg-slate-800 rounded relative overflow-hidden">
                <div className="shimmer" />
              </div>
            </div>

            {/* CODE BLOCK */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800">
                <div className="h-3 w-24 bg-slate-800 rounded relative overflow-hidden">
                  <div className="shimmer" />
                </div>
              </div>

              <div className="p-4 space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-3 w-full bg-slate-800 rounded relative overflow-hidden">
                    <div className="shimmer" />
                  </div>
                ))}
              </div>
            </div>

            {/* 🔄 CENTER OVERLAY */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center gap-3 bg-slate-900/60 backdrop-blur-md px-6 py-5 rounded-xl border border-slate-700 shadow-xl">

                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />

                <p className="text-slate-300 text-sm animate-pulse">
                  Executing your code...
                </p>

              </div>
            </div>

          </motion.div>

        ) :
          <AnimatePresence mode='wait' >
            {/* Description */}
            {
              activeNav === "description" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="p-6 space-y-8"
                >

                  <section className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyStyles[difficultyLevel]}`}>
                        {difficultyLevel}
                      </span>

                      {tags.map((tag, idx) => (
                        <motion.span
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-full border border-slate-700"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </section>

                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6"
                  >
                    <div className="prose prose-invert max-w-none font-mono text-sm leading-relaxed text-slate-300">
                      {description}
                    </div>
                  </motion.section>

                  {/* TEST CASES */}
                  <section className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <HiTerminal className="text-blue-400" /> Visible Test Cases
                    </h3>

                    <div className="space-y-4">
                      {visibleTestCases.map((tc, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="group bg-slate-900/40 border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-colors"
                        >

                          <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Case {index + 1}
                            </span>

                            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-all">
                              <HiClipboardCopy className="text-slate-400" />
                            </button>
                          </div>

                          <div className="space-y-3 font-mono text-sm">

                            <div>
                              <p className="text-slate-500 text-xs mb-1">Input:</p>
                              <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-blue-300">
                                {tc.input}
                              </pre>
                            </div>

                            <div>
                              <p className="text-slate-500 text-xs mb-1">Output:</p>
                              <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-emerald-400">
                                {tc.output}
                              </pre>
                            </div>

                            {tc.explaination && (
                              <div>
                                <p className="text-slate-500 text-xs mb-1">Explanation:</p>
                                <p className="text-slate-400 italic text-xs">
                                  {tc.explaination}
                                </p>
                              </div>
                            )}

                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>



                </motion.div>
              )
            }
            {/* Result */}
            {activeNav === "result" && (

              submissionResult ? (
                <SubmissionResult result={submissionResult} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600 italic">
                  Submit your code to see result
                </div>
              )
            )}

            {/* Soltuion */}

            {
              activeNav === "solution" && (
                <motion.div initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="p-6 space-y-8">
                  {/* REFERENCE SOLUTION */}
                  <section className="pb-10">

                    <button
                      onClick={() => setShowRefSolution(!showRefSolution)}
                      className="flex items-center gap-2 w-full p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 hover:bg-indigo-500/20 transition-all"
                    >
                      <HiCode className="text-xl" />
                      <span className="font-semibold">View Reference Solution</span>

                      <motion.div animate={{ rotate: showRefSolution ? 180 : 0 }} className="ml-auto">
                        <HiChevronDown />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {showRefSolution && referenceSolution.length > 0 && (

                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-4 rounded-xl border border-slate-800"
                        >

                          {/* LANGUAGE DROPDOWN */}
                          <div className="flex items-center gap-4 px-4 py-2 border-b border-slate-800 bg-[#0f172a]">
                            <div className="relative">
                              <select
                                value={refLang}
                                onChange={(e) => setRefLang(e.target.value)}
                                className="appearance-none bg-slate-800 border border-slate-700 text-sm rounded-md px-4 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                              >
                                {referenceSolution.map((lang, idx) => (
                                  <option key={idx} value={lang.language}>
                                    {lang.language.charAt(0).toUpperCase() + lang.language.slice(1)}
                                  </option>
                                ))}
                              </select>
                              <HiChevronDown className="absolute right-2 top-2.5 text-slate-400" />
                            </div>
                          </div>

                          <Editor
                            height="300px"
                            theme="vs-dark"
                            language={refLang || "cpp"}
                            value={referenceSolution.find(c => c.language === refLang)?.completeCode || ""}
                            options={{
                              readOnly: true,
                              minimap: { enabled: false },
                              fontSize: 13,
                              padding: { top: 16 }
                            }}
                          />

                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>
                </motion.div>
              )
            }
            {/* Editorial */}
            {
              activeNav==='editorial'&&(
                <Editorial secureUrl={Video.secureUrl} thumbnailUrl={Video.thumbnailUrl} duration={Video.duration}/>
              )
            }

            {/* Submissions  */}
            {
              activeNav=="submissions" && (
                <>
                 <SubmissionHistory submissions={allSubmissions} />
                </>
              )
            }
            {/* ChatBot */}
            {
              activeNav=="aiChat"&&(
                <>
                <AiChat problemData={problemData} code={editorRef.current.getValue()}/>
                </>
              )
            }
          </AnimatePresence>
        }
      </div>
      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[55%] flex flex-col h-screen bg-[#0e1525]  custom-scrollbar">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#0f172a]">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="appearance-none bg-slate-800 border border-slate-700 text-sm rounded-md px-4 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {startCode.map(lang => (
                  <option key={lang.language} value={lang.language}>
                    {lang.language.charAt(0).toUpperCase() + lang.language.slice(1)}
                  </option>
                ))}
              </select>
              <HiChevronDown className="absolute right-2 top-2.5 pointer-events-none text-slate-400" />
            </div>
            <button
              onClick={() => {
                const original = startCode.find(c => c.language === selectedLang);
                if (editorRef.current && original) {
                  editorRef.current.setValue(original.code);
                }
              }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-all"
            >
              <HiRefresh />
            </button>

          </div>
        </div>
        {/* Editor */}
        <div className="flex-grow relative">

          <Editor
            height="100%"
            theme="vs-dark"
            language={selectedLang}
            value={editorCode || ""}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 20 },
              fontFamily: 'Fira Code, monospace',
              cursorSmoothCaretAnimation: "on",
            }}
          />

        </div>

        <div className="h-1/3 border-t border-slate-800 flex flex-col bg-[#0f172a]">

          <div className="flex items-center gap-6 px-6 py-2 border-b border-slate-800 text-sm">

            <button
              onClick={() => setActiveTab('testcase')}
              className={`pb-2 transition-colors ${activeTab === 'testcase' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}
            >
              Testcase
            </button>

            <button
              onClick={() => setActiveTab('result')}
              className={`pb-2 transition-colors ${activeTab === 'result' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}
            >
              Result
            </button>

          </div>

          {/* Test cases */}
          <div className="flex-grow p-4 font-mono text-sm overflow-y-auto bg-[#0a0f1d]">

            {activeTab === 'testcase' ? (

              <div className="space-y-4">

                <div className="flex flex-wrap gap-2">

                  {visibleTestCases.map((_, i) => (
                    <button
                      onClick={() => { handleTest(i) }}
                      key={i}
                      className="px-3 py-1 bg-slate-800 rounded-md hover:bg-slate-700 transition-colors"
                    >
                      Case {i + 1}
                      {resultTest.length > 0 && resultTest[i].status_id == 3 && (
                        <HiCheckCircle />
                      )}
                      {resultTest.length > 0 && resultTest[i].status_id != 3 && (
                        <HiXCircle />
                      )}
                    </button>
                  ))}

                </div>

                <div className="text-slate-400">

                  <p className="mb-2 text-xs uppercase">Input</p>

                  <pre className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    {visibleTestCases.length > 0 ? visibleTestCases[activeTest].input : ""}
                  </pre>

                </div>
                {
                  resultTest.length > 0 && (
                    <>
                      <div className="text-slate-400">

                        <p className="mb-2 text-xs uppercase">Output</p>

                        <pre className={`${resultTest[activeTest].stdout == resultTest[activeTest].expected_output ? "border-green-500" : "border-red-500"} bg-slate-900/50 p-3 rounded-lg border `}>
                          {resultTest.length > 0 ? resultTest[activeTest].stdout
                            : ""}
                        </pre>

                      </div>
                      <div className="text-slate-400">

                        <p className="mb-2 text-xs uppercase">Expected Output</p>

                        <pre className={`${resultTest[activeTest].stdout == resultTest[activeTest].expected_output ? "border-green-500" : "border-red-500"} bg-slate-900/50 p-3 rounded-lg border `}>
                          {resultTest.length > 0 ? resultTest[activeTest].expected_output : ""}
                        </pre>

                      </div>
                    </>
                  )
                }


              </div>

            ) : activeTab === "result" ? (

              submissionResult ? (
                <SubmissionResult result={submissionResult} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600 italic">
                  Submit your code to see result
                </div>
              )

            ) : null}

          </div>
          {
            loading == true || runLoading == true ? (
              <div className="sticky bottom-0 p-4 border-t border-slate-800 bg-[#0f172a] flex justify-end gap-3 z-10">

                <div
                  className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700"
                >
                  <HiPlay /> Running
                </div>

                <div
                  className="flex items-center gap-2 px-8 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg"
                >
                  <HiCloudUpload /> Running
                </div>

              </div>
            ) : (
              <div className="sticky bottom-0 p-4 border-t border-slate-800 bg-[#0f172a] flex justify-end gap-3 z-10">

                <motion.button
                  onClick={runCode}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700"
                >
                  <HiPlay /> Run Code
                </motion.button>

                <motion.button
                  onClick={submitCode}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-8 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg"
                >
                  <HiCloudUpload /> Submit
                </motion.button>

              </div>
            )
          }
        </div>

      </div>

    </div>
  );
};

export default ProblemDetailPage;