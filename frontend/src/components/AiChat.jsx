import React, { useState, useRef, useEffect } from "react";
import { PulseLoader } from "react-spinners";
import axiosMain from "../utils/axios";
import { v4 as uuidv4 } from "uuid";
import { Send, Bot, User, Sun, Moon } from "lucide-react";
import Typewriter from "typewriter-effect";

const uniqueId = uuidv4();
const Chatapp = ({problemData,code}) => {
    console.log(problemData);
    console.log("\n"+code);
    const [messages, setMessages] = useState([
        { sender: "AI", text: "Hii" }
    ]);
    const [input, setInput] = useState("");
    const [load, setLoad] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const scrollRef = useRef(null);
    async function run() {
        if (!input.trim() || load) return;

        const userMessage = input;

        setMessages((prev) => [
            ...prev,
            { sender: "user", text: userMessage }
        ]);

        setInput("");

        try {
            setLoad(true);

            const res = await axiosMain.post("chat/Ai", {
                _id: uniqueId,
                msg: userMessage ,
                problemData:problemData,
                code:code,
            });

            const data = res.data;

            setMessages((prev) => [
                ...prev,
                { sender: "AI", text: data }
            ]);
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Unknown error";

            setMessages((prev) => [
                ...prev,
                { sender: "AI", text: errorMsg }
            ]);
        }

        setLoad(false);
    }

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const themeClasses = darkMode
        ? "bg-gray-900 text-white"
        : "bg-gray-100 text-gray-900";

    const chatBubbleUser = darkMode
        ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
        : "bg-gradient-to-r from-green-300 to-green-500 text-gray-900";

    const chatBubbleAI = darkMode
        ? "bg-gray-700 border border-gray-600 text-white"
        : "bg-white border border-gray-300 text-gray-800";

    return (
        <div
            className={`w-full min-h-screen ${themeClasses} flex justify-center items-center transition-all duration-500`}
        >
            <div
                className={`w-full h-screen md:h-[95vh] md:max-w-5xl 
                ${
                    darkMode
                        ? "bg-gradient-to-br from-green-500 to-blue-600"
                        : "bg-gradient-to-br from-blue-300 to-green-300"
                } 
                rounded-none md:rounded-3xl flex flex-col shadow-2xl overflow-hidden transition-all duration-500`}
            >
                {/* Header */}
                <div
                    className={`flex justify-between items-center p-3 md:p-4 ${
                        darkMode ? "bg-gray-800" : "bg-gray-200"
                    }`}
                >
                    <h1
                        className={`text-xl md:text-3xl font-bold bg-clip-text text-transparent ${
                            darkMode
                                ? "bg-gradient-to-r from-yellow-400 to-pink-500"
                                : "bg-gradient-to-r from-pink-600 to-yellow-500"
                        }`}
                    >
                        AI ChatBot
                    </h1>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setDarkMode((prev) => !prev)}
                        className={`flex items-center gap-2 px-2 md:px-3 py-2 rounded-xl transition-all duration-300 ${
                            darkMode
                                ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                                : "bg-white text-blue-600 hover:bg-gray-100"
                        }`}
                    >
                        {darkMode ? (
                            <Sun className="w-4 h-4 md:w-5 md:h-5" />
                        ) : (
                            <Moon className="w-4 h-4 md:w-5 md:h-5" />
                        )}
                        <span className="text-xs md:text-sm font-medium">
                            {darkMode ? "Light" : "Dark"}
                        </span>
                    </button>
                </div>

                {/* Chat Area */}
                <div
                    className={`flex-1 flex flex-col ${
                        darkMode ? "bg-gray-800" : "bg-gray-50"
                    } overflow-hidden`}
                >
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4"
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${
                                    msg.sender === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[85%] md:max-w-[70%] px-3 py-2 md:px-4 md:py-3 rounded-2xl break-words ${
                                        msg.sender === "user"
                                            ? chatBubbleUser
                                            : chatBubbleAI
                                    }`}
                                >
                                    <div className="flex items-start space-x-2">
                                        {msg.sender === "AI" ? (
                                            <Bot
                                                className={`w-4 h-4 mt-1 flex-shrink-0 ${
                                                    darkMode
                                                        ? "text-green-400"
                                                        : "text-green-700"
                                                }`}
                                            />
                                        ) : (
                                            <User
                                                className={`w-4 h-4 mt-1 flex-shrink-0 ${
                                                    darkMode
                                                        ? "text-white"
                                                        : "text-gray-700"
                                                }`}
                                            />
                                        )}

                                        {msg.sender === "AI" ? (
                                            <Typewriter
                                                options={{
                                                    strings: [msg.text],
                                                    autoStart: true,
                                                    delay: 30,
                                                    deleteSpeed: Infinity,
                                                    cursor: "",
                                                    loop: false,
                                                }}
                                            />
                                        ) : (
                                            <p className="text-sm md:text-base">
                                                {msg.text}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {load && (
                            <div className="flex justify-start">
                                <div
                                    className={`${
                                        darkMode
                                            ? "bg-gray-700 border border-gray-600"
                                            : "bg-gray-200 border border-gray-300"
                                    } rounded-2xl px-4 py-3 max-w-[70%] flex items-center space-x-2`}
                                >
                                    <Bot
                                        className={`w-4 h-4 ${
                                            darkMode
                                                ? "text-green-400"
                                                : "text-green-600"
                                        }`}
                                    />
                                    <PulseLoader
                                        size={6}
                                        color={
                                            darkMode ? "#10B981" : "#22C55E"
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div
                        className={`p-2 md:p-4 flex items-center gap-2 border-t ${
                            darkMode
                                ? "bg-gray-900 border-gray-700"
                                : "bg-gray-100 border-gray-300"
                        }`}
                    >
                        <input
                            type="text"
                            placeholder="Type your message and press Enter..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && run()
                            }
                            className={`flex-1 p-2 md:p-3 text-sm md:text-base rounded-2xl outline-none transition-all ${
                                darkMode
                                    ? "bg-gray-700 text-white placeholder-gray-300"
                                    : "bg-white text-gray-900 placeholder-gray-500 border border-gray-300"
                            }`}
                        />
                        <button
                            onClick={run}
                            disabled={!input.trim() || load}
                            className={`p-2 md:p-3 rounded-2xl hover:scale-105 transition-transform ${
                                darkMode
                                    ? "bg-gradient-to-r from-pink-500 to-yellow-400"
                                    : "bg-gradient-to-r from-yellow-400 to-pink-500"
                            }`}
                        >
                            <Send className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatapp;