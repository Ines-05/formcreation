'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Plus, Trash2, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';

interface ConversationSummary {
    conversationId: string;
    title: string;
    lastUpdated: string;
}

interface SidebarProps {
    currentId: string | null;
    onSelect: (id: string) => void;
    onNew: () => void;
}

export function Sidebar({ currentId, onSelect, onNew }: SidebarProps) {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [isOpen, setIsOpen] = useState(true);
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (isLoaded && user) {
            fetchConversations();
        }
    }, [isLoaded, user]);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/user/conversations');
            if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
                const data = await res.json();
                if (data.success) {
                    setConversations(data.conversations);
                }
            }
        } catch (err) {
            console.error('Error fetching conversations:', err);
        }
    };

    return (
        <>
            {/* Mobile Toggle Button (when closed) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed left-4 top-24 z-[140] p-2 bg-white/40 backdrop-blur-md border border-white/20 rounded-full shadow-lg hover:bg-white/60 transition-all md:hidden"
                >
                    <History className="w-5 h-5 text-primary" />
                </button>
            )}

            {/* Backdrop Mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[145] md:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                animate={{
                    width: isOpen ? 280 : 0,
                    opacity: isOpen ? 1 : 0,
                    x: isOpen ? 0 : -20
                }}
                className={`
                    h-screen bg-white/40 backdrop-blur-2xl border-r border-white/20 flex flex-col 
                    fixed md:relative z-[150] overflow-hidden shadow-2xl md:shadow-none
                `}
            >
                <div className="p-4 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-gray-900">Historique</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-white/40 rounded-md transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-4">
                    <Button
                        onClick={() => {
                            onNew();
                            if (window.innerWidth < 768) setIsOpen(false);
                        }}
                        className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 active:scale-95 text-primary border-none rounded-xl h-11 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle discussion
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-hide py-2">
                    {conversations.length === 0 ? (
                        <div className="text-center py-10 px-4">
                            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">Aucune conversation archivée</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <button
                                key={conv.conversationId}
                                onClick={() => {
                                    onSelect(conv.conversationId);
                                    if (window.innerWidth < 768) setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-3 rounded-xl transition-all active:scale-[0.98] group relative flex items-center gap-3 ${currentId === conv.conversationId
                                    ? 'bg-white shadow-sm ring-1 ring-black/5'
                                    : 'hover:bg-white/40'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${currentId === conv.conversationId ? 'bg-primary/10 text-primary' : 'bg-white/50 text-gray-400 group-hover:text-primary transition-colors'}`}>
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">{conv.title}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        {new Date(conv.lastUpdated).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {user && (
                    <div className="p-4 border-t border-white/10 bg-white/20">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs text-white font-bold shadow-sm">
                                {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold truncate text-gray-900">{user.fullName}</p>
                                <p className="text-[10px] text-gray-500 truncate">{user.primaryEmailAddress?.emailAddress}</p>
                            </div>
                        </div>
                    </div>
                )}
            </motion.aside>

            {/* Desktop Toggle Button when closed */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-[140] p-1 bg-white/40 backdrop-blur-md border border-white/20 rounded-r-lg hover:bg-white/60 transition-all group"
                >
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                </button>
            )}
        </>
    );
}
