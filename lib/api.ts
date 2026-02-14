// ===========================================
// YOMU API Client
// Centralized fetch wrapper for backend API
// ===========================================

import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// ============ TOKEN MANAGEMENT ============
let accessToken: string | null = null;

export const setToken = (token: string | null) => {
    accessToken = token;
    if (typeof window !== 'undefined') {
        if (token) {
            localStorage.setItem('accessToken', token);
            // Also set in cookie for middleware access
            document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        } else {
            localStorage.removeItem('accessToken');
            // Remove cookie
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    }
};

export const getToken = (): string | null => {
    if (accessToken) return accessToken;
    if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('accessToken');
    }
    return accessToken;
};

// ============ FETCH WRAPPER ============
interface FetchOptions extends RequestInit {
    params?: Record<string, string | number | undefined>;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;

    // Build URL with query params
    let url = `${API_URL}${endpoint}`;
    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                searchParams.append(key, String(value));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
    }

    // Build headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Merge custom headers
    if (fetchOptions.headers) {
        Object.assign(headers, fetchOptions.headers);
    }

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...fetchOptions,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
}

// ============ AUTH API ============
export const authApi = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await fetchApi<ApiResponse<AuthResponse>>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        if (response.data.accessToken) {
            setToken(response.data.accessToken);
        }
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await fetchApi<ApiResponse<AuthResponse>>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (response.data.accessToken) {
            setToken(response.data.accessToken);
        }
        return response.data;
    },

    logout: async () => {
        try {
            await fetchApi('/auth/logout', { method: 'POST' });
        } finally {
            setToken(null);
        }
    },

    getMe: async () => {
        return fetchApi<ApiResponse<import('@/types').User>>('/auth/me');
    },

    updateProfile: async (data: { name?: string; avatarUrl?: string }) => {
        return fetchApi<ApiResponse<import('@/types').User>>('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};

// ============ BOOKS API ============
export const booksApi = {
    getAll: async (params?: import('@/types').QueryBooksParams) => {
        return fetchApi<ApiResponse<import('@/types').Book[]>>('/books', { params: params as Record<string, string | number | undefined> });
    },

    getById: async (id: string) => {
        return fetchApi<ApiResponse<import('@/types').Book>>(`/books/${id}`);
    },

    getPopular: async (limit = 10) => {
        return fetchApi<ApiResponse<import('@/types').Book[]>>('/books/popular', { params: { limit } });
    },

    getRecommendations: async () => {
        return fetchApi<ApiResponse<import('@/types').Book[]>>('/books/recommendations');
    },

    create: async (data: Partial<import('@/types').Book>) => {
        return fetchApi<ApiResponse<import('@/types').Book>>('/books', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: string, data: Partial<import('@/types').Book>) => {
        return fetchApi<ApiResponse<import('@/types').Book>>(`/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: string) => {
        return fetchApi<ApiResponse<null>>(`/books/${id}`, { method: 'DELETE' });
    },
};

// ============ CATEGORIES API ============
export const categoriesApi = {
    getAll: async () => {
        return fetchApi<ApiResponse<import('@/types').Category[]>>('/categories');
    },

    create: async (data: { name: string; description?: string; color?: string }) => {
        return fetchApi<ApiResponse<import('@/types').Category>>('/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: string, data: { name?: string; description?: string; color?: string }) => {
        return fetchApi<ApiResponse<import('@/types').Category>>(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: string) => {
        return fetchApi<ApiResponse<null>>(`/categories/${id}`, { method: 'DELETE' });
    },
};

// ============ LOANS API ============
export const loansApi = {
    getAll: async (params?: import('@/types').QueryLoansParams) => {
        return fetchApi<ApiResponse<import('@/types').Loan[]>>('/loans', { params: params as Record<string, string | number | undefined> });
    },

    getMy: async (params?: import('@/types').QueryLoansParams) => {
        return fetchApi<ApiResponse<import('@/types').Loan[]>>('/loans/my', { params: params as Record<string, string | number | undefined> });
    },

    getById: async (id: string) => {
        return fetchApi<ApiResponse<import('@/types').Loan>>(`/loans/${id}`);
    },

    getPendingVerification: async () => {
        return fetchApi<ApiResponse<import('@/types').Loan[]>>('/loans/pending-verification');
    },

    getOverdue: async () => {
        return fetchApi<ApiResponse<import('@/types').Loan[]>>('/loans/overdue');
    },

    create: async (bookId: string, durationDays = 7) => {
        return fetchApi<ApiResponse<import('@/types').Loan>>('/loans', {
            method: 'POST',
            body: JSON.stringify({ bookId, durationDays }),
        });
    },

    approve: async (id: string, adminNotes?: string) => {
        return fetchApi<ApiResponse<import('@/types').Loan>>(`/loans/${id}/approve`, {
            method: 'PUT',
            body: JSON.stringify({ adminNotes }),
        });
    },

    reject: async (id: string, adminNotes?: string) => {
        return fetchApi<ApiResponse<import('@/types').Loan>>(`/loans/${id}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ adminNotes }),
        });
    },

    requestReturn: async (id: string, bookCondition: import('@/types').BookCondition) => {
        return fetchApi<ApiResponse<import('@/types').Loan>>(`/loans/${id}/return`, {
            method: 'PUT',
            body: JSON.stringify({ bookCondition }),
        });
    },

    verifyReturn: async (id: string, adminNotes?: string) => {
        return fetchApi<ApiResponse<import('@/types').Loan>>(`/loans/${id}/verify-return`, {
            method: 'PUT',
            body: JSON.stringify({ adminNotes }),
        });
    },
};

// ============ FAVORITES API ============
export const favoritesApi = {
    getAll: async () => {
        return fetchApi<ApiResponse<import('@/types').Favorite[]>>('/favorites');
    },

    add: async (bookId: string) => {
        return fetchApi<ApiResponse<import('@/types').Favorite>>(`/favorites/${bookId}`, {
            method: 'POST',
        });
    },

    remove: async (bookId: string) => {
        return fetchApi<ApiResponse<null>>(`/favorites/${bookId}`, {
            method: 'DELETE',
        });
    },

    check: async (bookId: string) => {
        return fetchApi<ApiResponse<{ isFavorite: boolean }>>(`/favorites/${bookId}/check`);
    },
};

// ============ MESSAGES API ============
export const messagesApi = {
    getConversations: async () => {
        return fetchApi<ApiResponse<import('@/types').Conversation[]>>('/conversations');
    },

    getMessages: async (conversationId: string) => {
        return fetchApi<ApiResponse<import('@/types').Message[]>>(`/conversations/${conversationId}/messages`);
    },

    send: async (receiverId: string, content: string, messageType = 'TEXT', bookId?: string) => {
        return fetchApi<ApiResponse<import('@/types').Message>>('/messages', {
            method: 'POST',
            body: JSON.stringify({ receiverId, content, messageType, bookId }),
        });
    },

    markAsRead: async (messageId: string) => {
        return fetchApi<ApiResponse<import('@/types').Message>>(`/messages/${messageId}/read`, {
            method: 'PUT',
        });
    },

    getUnreadCount: async () => {
        return fetchApi<ApiResponse<{ count: number }>>('/messages/unread-count');
    },
};

// ============ USERS API (Admin) ============
export const usersApi = {
    getAll: async (params?: { role?: string; isActive?: boolean; page?: number; limit?: number }) => {
        return fetchApi<ApiResponse<import('@/types').User[]>>('/users', { params: params as Record<string, string | number | undefined> });
    },

    getById: async (id: string) => {
        return fetchApi<ApiResponse<import('@/types').User>>(`/users/${id}`);
    },

    create: async (data: { name: string; email: string; password: string; class?: string; role?: import('@/types').UserRole }) => {
        return fetchApi<ApiResponse<import('@/types').User>>('/users', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: string, data: Partial<import('@/types').User>) => {
        return fetchApi<ApiResponse<import('@/types').User>>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    toggleStatus: async (id: string) => {
        return fetchApi<ApiResponse<import('@/types').User>>(`/users/${id}/status`, {
            method: 'PUT',
        });
    },

    delete: async (id: string) => {
        return fetchApi<ApiResponse<null>>(`/users/${id}`, { method: 'DELETE' });
    },
};

// ============ STATS API ============
export const statsApi = {
    getSiswa: async () => {
        return fetchApi<ApiResponse<import('@/types').SiswaStats>>('/stats/siswa');
    },

    getAdmin: async () => {
        return fetchApi<ApiResponse<import('@/types').AdminStats>>('/stats/admin');
    },
};

// ============ REPORTS API (Admin) ============
export const reportsApi = {
    getSummary: async () => {
        return fetchApi<ApiResponse<Record<string, unknown>>>('/reports/summary');
    },

    getLoans: async (params?: { status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
        return fetchApi<ApiResponse<import('@/types').Loan[]>>('/reports/loans', { params: params as Record<string, string | number | undefined> });
    },

    getPopularBooks: async (limit = 10) => {
        return fetchApi<ApiResponse<Array<{ book: import('@/types').Book; count: number }>>>('/reports/popular-books', { params: { limit } });
    },

    getActiveMembers: async (limit = 10) => {
        return fetchApi<ApiResponse<Array<{ user: import('@/types').User; count: number }>>>('/reports/active-members', { params: { limit } });
    },

    exportLoansPDF: async (params?: { status?: string; startDate?: string; endDate?: string }): Promise<Blob> => {
        const token = getToken();
        let url = `${API_URL}/reports/loans/export`;
        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }
        const response = await fetch(url, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) throw new Error('Failed to export PDF');
        return response.blob();
    },
};

// ============ MAJORS API (JURUSAN) ============
export const majorsApi = {
    getAll: async () => {
        return fetchApi<ApiResponse<Array<{ id: string; name: string; createdAt: string; _count: { users: number } }>>>('/majors');
    },

    create: async (name: string) => {
        return fetchApi<ApiResponse<{ id: string; name: string; createdAt: string }>>('/majors', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    },

    delete: async (id: string) => {
        return fetchApi<ApiResponse<null>>(`/majors/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============ CLASSES API (KELAS) ============
export const classesApi = {
    getAll: async () => {
        return fetchApi<ApiResponse<Array<{ id: string; name: string; createdAt: string; _count: { users: number } }>>>('/classes');
    },

    create: async (name: string) => {
        return fetchApi<ApiResponse<{ id: string; name: string; createdAt: string }>>('/classes', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    },

    delete: async (id: string) => {
        return fetchApi<ApiResponse<null>>(`/classes/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============ REVIEWS API ============
export const reviewsApi = {
    create: async (data: { bookId: string; rating: number; comment: string }) => {
        return fetchApi<ApiResponse<import('@/types').Review>>('/reviews', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    getByBookId: async (bookId: string) => {
        return fetchApi<ApiResponse<{ reviews: import('@/types').Review[]; stats: import('@/types').ReviewStats }>>(`/reviews/book/${bookId}`);
    },
};

