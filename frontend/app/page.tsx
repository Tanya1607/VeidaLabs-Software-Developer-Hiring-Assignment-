"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { LogOut, Send } from "lucide-react";

interface Resource {
    id: string;
    title: string;
    description: string;
    type: 'ppt' | 'video';
    url: string;
}

interface Message {
    id: string;
    role: 'user' | 'jiji';
    content: string;
    resources?: Resource[];
    timestamp: Date;
}

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'initial',
            role: 'jiji',
            content: "Hi! I'm Jiji. What would you like to learn about today?",
            timestamp: new Date()
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
            } else {
                setUser(user);
            }
        };
        getUser();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const handleAskJiji = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentQuery = query.trim();
        if (!currentQuery) return;

        // Add user message to history immediately
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: currentQuery,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        setLoading(true);
        setError(null);
        setQuery("");

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) throw new Error("No active session");

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ask-jiji`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ query: currentQuery }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Failed to ask Jiji");
            }

            const data = await res.json();

            // Add Jiji's response to history with results
            const jijiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'jiji',
                content: data.answer,
                resources: data.resources,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, jijiMessage]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-jiji flex items-center justify-center text-white font-bold">J</div>
                    <h1 className="text-xl font-bold text-gray-800">Learn with Jiji</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 hidden md:inline">Hello, {user.user_metadata.full_name || user.email}</span>
                    <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col gap-8 pb-32">

                {/* Jiji Chat Area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
                    {messages.map((msg) => (
                        <div key={msg.id} className="flex flex-col gap-4">
                            <div className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'jiji' && (
                                    <div className="w-10 h-10 rounded-full bg-jiji flex-shrink-0 flex items-center justify-center text-white font-bold text-xl">J</div>
                                )}

                                <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-jiji-light/20 text-gray-800 rounded-tl-none'
                                    }`}>
                                    <p>{msg.content}</p>
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-gray-600 font-bold text-xl uppercase">
                                        {user.email?.[0]}
                                    </div>
                                )}
                            </div>

                            {/* Show resources for this specific message if they exist */}
                            {msg.role === 'jiji' && msg.resources && msg.resources.length > 0 && (
                                <div className="ml-14 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    {msg.resources.map((res) => (
                                        <div key={res.id} className="bg-white p-3 rounded-xl shadow-xs border border-gray-100 hover:shadow-sm transition-shadow flex flex-col justify-between">
                                            <div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${res.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {res.type}
                                                </span>
                                                <h4 className="font-semibold text-sm text-gray-900 mt-1 mb-0.5">{res.title}</h4>
                                                <p className="text-xs text-gray-500 mb-3 line-clamp-1">{res.description}</p>
                                            </div>
                                            <a
                                                href={res.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`w-full py-1.5 px-3 rounded-lg text-center text-xs font-medium transition-colors ${res.type === 'video' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}
                                            >
                                                {res.type === 'video' ? 'Watch Video' : 'Open PPT'}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex items-start gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-jiji/50 flex-shrink-0"></div>
                            <div className="bg-gray-100 p-4 rounded-r-2xl rounded-bl-2xl h-12 w-32"></div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                            Oops! {error}
                        </div>
                    )}
                </div>


                {/* Query Input - Sticky at bottom */}
                <form onSubmit={handleAskJiji} className="sticky bottom-6 mt-auto">
                    <div className="relative shadow-lg rounded-full">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask Jiji something..."
                            className="w-full pl-6 pr-14 py-4 rounded-full border border-gray-200 focus:border-jiji focus:ring-2 focus:ring-jiji focus:ring-opacity-20 outline-none transition-all"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-jiji text-white rounded-full flex items-center justify-center hover:bg-jiji-dark disabled:opacity-50 disabled:hover:bg-jiji transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>

            </div>
        </main>
    );
}
