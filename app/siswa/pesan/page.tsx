"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { messagesApi, usersApi } from "@/lib/api";
import type { Conversation, Message, User } from "@/types";
import { toast } from "sonner";

export default function PesanPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [activeParticipant, setActiveParticipant] = useState<Partial<User> | null>(null);
    const [admins, setAdmins] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const [conversationsRes, adminsRes] = await Promise.all([
                    messagesApi.getConversations(),
                    usersApi.getAll({ role: 'ADMIN' }).catch(() => ({ data: [] })),
                ]);
                setConversations(conversationsRes.data || []);
                setAdmins(adminsRes.data || []);

                if (conversationsRes.data?.length > 0) {
                    const firstConv = conversationsRes.data[0];
                    setActiveConversationId(firstConv.id);
                    setActiveParticipant(firstConv.otherUser || null);
                }
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchData();
            const intervalId = setInterval(() => {
                messagesApi.getConversations()
                    .then(res => setConversations(res.data || []))
                    .catch(err => console.error("Failed to refresh conversations:", err));
            }, 5000);
            return () => clearInterval(intervalId);
        }
    }, [isAuthenticated, authLoading, router, user?.id]);

    useEffect(() => {
        if (!activeConversationId) return;

        const fetchMessages = async () => {
            try {
                const response = await messagesApi.getMessages(activeConversationId);
                setMessages(response.data || []);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            }
        };

        fetchMessages();
        const intervalId = setInterval(fetchMessages, 3000);
        return () => clearInterval(intervalId);
    }, [activeConversationId]);

    const getInitials = (name: string) => {
        return (name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const handleSelectConversation = (conv: Conversation) => {
        setActiveConversationId(conv.id);
        setActiveParticipant(conv.otherUser || null);
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || !activeParticipant?.id) return;

        setIsSending(true);
        try {
            const newMessage = await messagesApi.send(activeParticipant.id, inputText.trim());
            setMessages(prev => [...prev, newMessage.data]);
            setInputText("");
            const conversationsRes = await messagesApi.getConversations();
            setConversations(conversationsRes.data || []);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal mengirim pesan");
        } finally {
            setIsSending(false);
        }
    };

    const handleStartNewChat = async (admin: User) => {
        setActiveParticipant(admin);
        setActiveConversationId(null);
        setMessages([]);
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        else if (diffDays === 1) return "Kemarin";
        else if (diffDays < 7) return date.toLocaleDateString("id-ID", { weekday: "long" });
        return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    };

    const filteredConversations = conversations.filter(conv => {
        return conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (authLoading || isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
                <div style={{ height: '64px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px' }}>
                    <button
                        onClick={() => router.push("/siswa")}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#6b7280', transition: 'all 0.2s' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Kembali
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>Pesan</span>
                    </div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '44px', height: '44px', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500', margin: 0 }}>Memuat percakapan...</p>
                    </div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ height: '64px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => router.push("/siswa")}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#6b7280', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Kembali
                    </button>
                    <div style={{ height: '28px', width: '1px', background: '#e5e7eb' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>Pesan</span>
                    </div>
                </div>
            </div>

            {/* Chat Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {activeParticipant ? (
                    <>
                        {/* Chat Partner Header */}
                        <div style={{ height: '60px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '14px' }}>
                                        {getInitials(activeParticipant?.name || "User")}
                                    </div>
                                    <div style={{ position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', border: '2px solid white' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', lineHeight: '1.3' }}>{activeParticipant?.name || "User"}</div>
                                    <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: '500' }}>
                                        {activeParticipant?.role === 'ADMIN' ? 'Admin Perpustakaan • Online' : 'Online'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: '#f0f4f8' }}>
                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                                {messages.length === 0 ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
                                        <div style={{ background: 'white', border: '1px solid #e5e7eb', color: '#6b7280', padding: '12px 24px', borderRadius: '16px', fontSize: '13px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                                            Belum ada pesan. Mulai percakapan sekarang 💬
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMine = msg.senderId === user?.id;
                                        const showDate = idx === 0 || new Date(messages[idx - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                                        return (
                                            <div key={msg.id}>
                                                {showDate && (
                                                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                                                        <span style={{ background: 'white', border: '1px solid #e5e7eb', color: '#6b7280', padding: '4px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                                                            {new Date(msg.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                                        </span>
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '4px' }}>
                                                    <div style={{
                                                        maxWidth: '70%',
                                                        minWidth: '80px',
                                                        padding: '10px 14px',
                                                        borderRadius: isMine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                                                        background: isMine ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white',
                                                        border: isMine ? 'none' : '1px solid #e5e7eb',
                                                        color: isMine ? '#fff' : '#1f2937',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                                                    }}>
                                                        <div style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                            {msg.messageType === 'BOOK_CARD' && msg.book ? (
                                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px' }}>
                                                                    <div style={{ width: '40px', height: '52px', borderRadius: '6px', background: isMine ? 'rgba(255,255,255,0.2)' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style={{ opacity: 0.5 }}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{msg.book.title}</div>
                                                                        <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{msg.book.author}</div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                msg.content
                                                            )}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
                                                            <span style={{ fontSize: '10px', color: isMine ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>
                                                                {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                                            </span>
                                                            {isMine && (
                                                                <svg viewBox="0 0 16 15" width="14" height="14" style={{ color: isMine ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>
                                                                    <path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '12px 24px 16px', flexShrink: 0 }}>
                            {/* Quick Replies */}
                            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', maxWidth: '800px', margin: '0 auto' }}>
                                {["Mohon perpanjang buku", "Saya akan kembalikan besok", "Buku sudah siap diambil?"].map((text) => (
                                    <button
                                        key={text}
                                        onClick={() => setInputText(text)}
                                        disabled={isSending}
                                        style={{ whiteSpace: 'nowrap', background: 'white', border: '1px solid #dbeafe', color: '#3b82f6', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.borderColor = '#dbeafe'; }}
                                    >
                                        {text}
                                    </button>
                                ))}
                            </div>
                            {/* Input Row */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', maxWidth: '800px', margin: '0 auto' }}>
                                <div style={{ flex: 1, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '10px 18px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
                                    <textarea
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder="Tulis pesan..."
                                        rows={1}
                                        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#1f2937', fontSize: '14px', resize: 'none', maxHeight: '100px', overflowY: 'auto', lineHeight: '1.4', fontFamily: 'inherit', height: inputText.split('\n').length > 1 ? 'auto' : '20px' }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputText.trim() || isSending}
                                    style={{
                                        width: '42px', height: '42px', borderRadius: '50%', border: 'none', cursor: inputText.trim() ? 'pointer' : 'default',
                                        background: inputText.trim() ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#e5e7eb',
                                        color: inputText.trim() ? '#fff' : '#9ca3af',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s', transform: inputText.trim() ? 'scale(1)' : 'scale(0.95)',
                                        boxShadow: inputText.trim() ? '0 4px 12px rgba(59,130,246,0.3)' : 'none',
                                        flexShrink: 0,
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', textAlign: 'center', padding: '40px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1px solid #dbeafe' }}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>YOMU Messenger</h2>
                        <p style={{ fontSize: '14px', color: '#6b7280', maxWidth: '360px', lineHeight: '1.6', margin: '0 0 32px' }}>
                            Hubungi admin perpustakaan untuk bantuan, informasi peminjaman, dan lainnya.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '12px' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <span>Pesan terenkripsi</span>
                        </div>
                    </div>
                )}
        </div>
        </div>
    );
}
