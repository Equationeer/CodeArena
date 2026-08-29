import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Film,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
    Play,
    FileText
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axiosMain from "../utils/axios"
/** 
 * Utility for merging tailwind classes 
 */
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export default function VideoUploader({ problem }) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState('idle'); // idle | uploading | success | error
    const [uploadResult, setUploadResult] = useState(null);
    const [error, setError] = useState(null);

    const { register, handleSubmit, reset, watch } = useForm();
    const titleValue = watch("title");

    // --- File Logic ---
    const handleFile = (selectedFile) => {
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith('video/')) {
            setError("Please select a valid video file (MP4, MOV, etc.)");
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError("File is too large. Max size is 100MB.");
            return;
        }

        setError(null);
        setFile(selectedFile);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    // --- Upload Logic ---
    const onSubmit = async (data) => {
        // console.log(problem);
        if (!file) return;

        try {
            setStatus('uploading');
            setUploadProgress(0);

            // 1. Fetch signature from your backend
            // Note: Replace this URL with your actual API route
            const resp = await axiosMain.get(`/video/create/${problem._id}`);
            console.log(resp);
            // 2. Build FormData for Cloudinary signed upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', resp.data.api_key);
            formData.append('timestamp', resp.data.timestamp);
            formData.append('signature', resp.data.signature);
            formData.append('public_id', resp.data.public_id);

            // 3. Upload to Cloudinary
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${resp.data.cloud_name}/video/upload`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percent);
                    },
                }
            );
            //  Save metadat to backend
            // console.log(response)
            const respon={
                problemId:problem._id,
                cloudinaryPublicId:response.data.public_id,
                secureUrl:response.data.secure_url,
                duration:response.data.duration
            }

            const respo = await axiosMain.post(`/video/save`,respon);
            // console.log(respo);

            setUploadResult(response.data);
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
            setError(err.response?.data?.error?.message || "Upload failed. Please try again.");
        }
    };

    const resetAll = () => {
        setFile(null);
        setStatus('idle');
        setUploadProgress(0);
        setUploadResult(null);
        setError(null);
        reset();
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 selection:bg-indigo-500/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl"
            >
                {/* Card Container */}
                <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-2xl">

                    <div className="p-8">
                        {/* Header */}
                        <header className="mb-8 flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Upload Video</h2>
                                <p className="text-zinc-400 text-sm mt-1">Directly to your cloud storage.</p>
                            </div>
                            {file && status === 'idle' && (
                                <button
                                    onClick={resetAll}
                                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-zinc-500" />
                                </button>
                            )}
                        </header>

                        <AnimatePresence mode="wait">
                            {status === 'success' ? (
                                /* SUCCESS STATE */
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="aspect-video w-full rounded-2xl bg-black border border-zinc-800 flex items-center justify-center overflow-hidden relative group">
                                        <video
                                            src={uploadResult?.secure_url}
                                            className="w-full h-full object-contain"
                                            controls
                                        />
                                    </div>

                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
                                        <div className="bg-emerald-500 p-2 rounded-full">
                                            <CheckCircle2 className="w-5 h-5 text-zinc-950" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-emerald-400">Successfully Uploaded</p>
                                            <p className="text-xs text-zinc-500 truncate max-w-[300px]">{uploadResult?.public_id}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={resetAll}
                                        className="w-full py-4 rounded-xl bg-zinc-100 text-zinc-950 font-bold hover:bg-white transition-all"
                                    >
                                        Upload Another
                                    </button>
                                </motion.div>
                            ) : (
                                /* IDLE & UPLOADING STATE */
                                <motion.form
                                    key="form"
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="space-y-6"
                                >
                                    {/* Title Input */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                            <FileText className="w-3 h-3" /> Video Title
                                        </label>
                                        <input
                                            {...register("title")}
                                            placeholder="e.g. My Summer Trip 2024"
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all shadow-inner"
                                            disabled={status === 'uploading'}
                                        />
                                    </div>

                                    {/* Dropzone */}
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={onDrop}
                                        className={cn(
                                            "relative border-2 border-dashed rounded-3xl transition-all duration-300 group",
                                            isDragging ? "border-indigo-500 bg-indigo-500/5" : "border-zinc-800 bg-zinc-950/20",
                                            file ? "py-8" : "py-16",
                                            status === 'uploading' && "opacity-50 pointer-events-none"
                                        )}
                                    >
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => handleFile(e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />

                                        <div className="flex flex-col items-center text-center px-4">
                                            {file ? (
                                                <div className="flex items-center gap-4 text-left bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 shadow-xl">
                                                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                                                        <Film className="w-6 h-6 text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-zinc-200 max-w-[200px] truncate">{file.name}</p>
                                                        <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                        <Upload className="w-8 h-8 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                                                    </div>
                                                    <p className="font-semibold text-zinc-300">Drag & drop your video</p>
                                                    <p className="text-sm text-zinc-500 mt-1">or click to browse from files</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="flex items-center gap-2 text-red-400 text-sm bg-red-400/5 p-3 rounded-lg border border-red-400/20"
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </motion.div>
                                    )}

                                    {/* Progress & Submit */}
                                    {status === 'uploading' ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-zinc-400">Uploading...</span>
                                                <span className="text-indigo-400">{uploadProgress}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-indigo-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={!file}
                                            className={cn(
                                                "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10",
                                                file
                                                    ? "bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98]"
                                                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                            )}
                                        >
                                            {status === 'uploading' ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4 fill-current" />
                                                    Start Upload
                                                </>
                                            )}
                                        </button>
                                    )}
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer Info */}
                <p className="text-center text-zinc-600 text-xs mt-6 tracking-wide uppercase">
                    Cloudinary Secure Signed Upload Flow
                </p>
            </motion.div>
        </div>
    );
}