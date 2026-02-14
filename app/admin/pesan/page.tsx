"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { messagesApi, usersApi } from "@/lib/api";
import type { Conversation, Message, User } from "@/types";
import { toast } from "sonner";

export default function PusatKomunikasiPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [activeParticipant, setActiveParticipant] = useState<Partial<User> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const [conversationsRes, studentsRes] = await Promise.all([
                    messagesApi.getConversations(),
                    usersApi.getAll({ role: 'STUDENT' }).catch(() => ({ data: [] })),
                ]);
                setConversations(conversationsRes.data || []);
                setStudents(studentsRes.data || []);

                if (conversationsRes.data?.length > 0) {
                    const firstConv = conversationsRes.data[0];
                    setActiveConversationId(firstConv.id);
                    setActiveParticipant(firstConv.otherUser || null);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && user?.role === 'ADMIN') {
            fetchData();
            const intervalId = setInterval(() => {
                messagesApi.getConversations()
                    .then(res => setConversations(res.data || []))
                    .catch(err => console.error("Failed to refresh conversations:", err));
            }, 5000);
            return () => clearInterval(intervalId);
        }
    }, [isAuthenticated, authLoading, router, user?.id, user?.role]);

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

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        else if (diffDays === 1) return "Kemarin";
        else if (diffDays < 7) return date.toLocaleDateString("id-ID", { weekday: "long" });
        return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    };

    const handleSelectConversation = (conv: Conversation) => {
        setActiveConversationId(conv.id);
        setActiveParticipant(conv.otherUser || null);
    };

    const handleStartNewChat = (student: User) => {
        setActiveParticipant(student);
        setActiveConversationId(null);
        setMessages([]);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeParticipant?.id) return;

        setIsSending(true);
        try {
            const sentMessage = await messagesApi.send(activeParticipant.id, newMessage.trim());
            setMessages(prev => [...prev, sentMessage.data]);
            setNewMessage("");
            const conversationsRes = await messagesApi.getConversations();
            setConversations(conversationsRes.data || []);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Gagal mengirim pesan");
        } finally {
            setIsSending(false);
        }
    };

    const filteredConversations = conversations.filter(conv => {
        return conv.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (authLoading || isLoading) {
        return (
            <div style={{ height: '100vh', display: 'flex', background: '#f8fafc', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
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
        <div style={{ height: '100vh', display: 'flex', background: '#f8fafc', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", overflow: 'hidden' }}>
            {/* Sidebar */}
            <div style={{ width: '360px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', background: 'white', flexShrink: 0 }}>
                {/* Sidebar Header */}
                <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3.938-3.621H7.041V7.483h10.913v1.94z"></path></svg>
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Pesan Admin</span>
                    </div>
                    <button
                        onClick={() => router.push("/admin")}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: '#6b7280', transition: 'all 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Dashboard
                    </button>
                </div>

                {/* Search */}
                <div style={{ padding: '12px 16px', flexShrink: 0 }}>
                    <div style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '8px 14px', gap: '10px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        <input
                            type="text"
                            placeholder="Cari percakapan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', width: '100%', color: '#1f2937', fontFamily: 'inherit' }}
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {filteredConversations.map((conv) => {
                        const otherParticipant = conv.otherUser;
                        const isActive = activeConversationId === conv.id;
                        const isUnread = conv.unreadCount ? conv.unreadCount > 0 : false;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => handleSelectConversation(conv)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', cursor: 'pointer',
                                    background: isActive ? '#eff6ff' : 'transparent',
                                    borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#f9fafb'; }}
                                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '14px',
                                    background: isActive ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#e5e7eb',
                                    color: isActive ? '#fff' : '#6b7280',
                                }}>
                                    {getInitials(otherParticipant?.name || "User")}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: isUnread || isActive ? '600' : '500', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {otherParticipant?.name || "User"}
                                        </span>
                                        <span style={{ fontSize: '11px', color: isUnread ? '#3b82f6' : '#9ca3af', fontWeight: isUnread ? '600' : '400', flexShrink: 0 }}>
                                            {formatTime(conv.lastMessageAt)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', flex: 1 }}>
                                            {conv.lastMessage?.senderId === user?.id && (
                                                <svg viewBox="0 0 16 15" width="14" height="14" style={{ color: '#9ca3af', flexShrink: 0 }}>
                                                    <path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                                                </svg>
                                            )}
                                            <span style={{ fontSize: '12px', color: isUnread ? '#374151' : '#9ca3af', fontWeight: isUnread ? '600' : '400', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {conv.lastMessage?.content || "..."}
                                            </span>
                                        </div>
                                        {isUnread && (
                                            <span style={{ minWidth: '20px', height: '20px', background: '#3b82f6', color: '#fff', fontSize: '11px', fontWeight: '700', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', flexShrink: 0 }}>
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {activeParticipant ? (
                    <>
                        {/* Chat Partner Header */}
                        <div style={{ height: '64px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '14px' }}>
                                        {getInitials(activeParticipant.name || "User")}
                                    </div>
                                    <div style={{ position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', border: '2px solid white' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', lineHeight: '1.3' }}>{activeParticipant.name || "User"}</div>
                                    <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: '500' }}>
                                        {activeParticipant.role === 'ADMIN' ? 'Admin' : (activeParticipant.class?.name || 'Siswa')} • Online
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
                                                            {msg.content}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
                                                            <span style={{ fontSize: '10px', color: isMine ? 'rgba(255,255,255,0.7)' : '#9ca3af' }}>
                                                                {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                                                            </span>
                                                            {isMine && (
                                                                <svg viewBox="0 0 16 15" width="14" height="14" style={{ color: 'rgba(255,255,255,0.7)' }}>
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
                                {["Buku sudah bisa diambil", "Harap segera kembalikan buku", "Peminjaman telah disetujui"].map((text) => (
                                    <button
                                        key={text}
                                        onClick={() => setNewMessage(text)}
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
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Tulis pesan..."
                                        rows={1}
                                        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#1f2937', fontSize: '14px', resize: 'none', maxHeight: '100px', overflowY: 'auto', lineHeight: '1.4', fontFamily: 'inherit', height: newMessage.split('\n').length > 1 ? 'auto' : '20px' }}
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
                                    disabled={!newMessage.trim() || isSending}
                                    style={{
                                        width: '42px', height: '42px', borderRadius: '50%', border: 'none', cursor: newMessage.trim() ? 'pointer' : 'default',
                                        background: newMessage.trim() ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#e5e7eb',
                                        color: newMessage.trim() ? '#fff' : '#9ca3af',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s', transform: newMessage.trim() ? 'scale(1)' : 'scale(0.95)',
                                        boxShadow: newMessage.trim() ? '0 4px 12px rgba(59,130,246,0.3)' : 'none',
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
                        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Pusat Komunikasi Admin</h2>
                        <p style={{ fontSize: '14px', color: '#6b7280', maxWidth: '360px', lineHeight: '1.6', margin: '0 0 32px' }}>
                            Pilih percakapan dari daftar atau mulai chat baru dengan siswa. Semua pesan tersimpan dengan aman.
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
