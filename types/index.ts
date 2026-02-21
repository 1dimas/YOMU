// ===========================================
// YOMU Frontend Types
// Matches backend Prisma models
// ===========================================

// ============ ENUMS ============
export enum Role {
    SISWA = 'SISWA',
    ADMIN = 'ADMIN',
}

// Type alias for compatibility
export type UserRole = Role;

export enum LoanStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    BORROWED = 'BORROWED',
    RETURNING = 'RETURNING',
    RETURNED = 'RETURNED',
    REJECTED = 'REJECTED',
    OVERDUE = 'OVERDUE',
}

export enum BookCondition {
    GOOD = 'GOOD',
    DAMAGED = 'DAMAGED',
    LOST = 'LOST',
}

export enum MessageType {
    TEXT = 'TEXT',
    BOOK_CARD = 'BOOK_CARD',
}

// ============ MODELS ============
export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    avatarUrl?: string;
    majorId?: string;
    classId?: string;
    major?: { id: string; name: string };
    class?: { id: string; name: string };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    name: string;
    color?: string;
    description?: string;
    bookCount?: number;
    _count?: { books: number };
    createdAt: string;
}

export interface Book {
    id: string;
    title: string;
    author: string;
    publisher: string;
    year: number;
    isbn: string;
    categoryId?: string;
    category?: Category;
    synopsis?: string;
    coverUrl?: string;
    stock: number;
    totalStock: number;
    availableStock: number;
    averageRating?: number;
    totalReviews?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Loan {
    id: string;
    userId: string;
    user?: Partial<User>;
    bookId: string;
    book?: Partial<Book>;
    loanDate: string;
    dueDate: string;
    returnDate?: string;
    status: LoanStatus;
    bookCondition?: BookCondition;
    returnCondition?: BookCondition;
    adminNotes?: string;
    verifiedBy?: string;
    verifier?: Partial<User>;
    createdAt: string;
    updatedAt: string;
}

export interface Favorite {
    id: string;
    userId: string;
    bookId: string;
    book?: Book;
    createdAt: string;
}

export interface Message {
    id: string;
    senderId: string;
    sender?: Partial<User>;
    receiverId: string;
    receiver?: Partial<User>;
    content: string;
    isRead: boolean;
    isEdited?: boolean;
    messageType: MessageType;
    bookId?: string;
    book?: Partial<Book>;
    createdAt: string;
    updatedAt?: string;
}

export interface Conversation {
    id: string;
    participant1Id?: string;
    participant1?: Partial<User>;
    participant2Id?: string;
    participant2?: Partial<User>;
    // Backend getConversations returns this simplified format:
    otherUser?: Partial<User>;
    lastMessage?: {
        content: string;
        senderId: string;
        createdAt: string;
        messageType?: MessageType;
    };
    unreadCount?: number;
    lastMessageAt: string;
    createdAt?: string;
}

export interface Review {
    id: string;
    rating: number; // 1-5
    comment: string;
    userId: string;
    user?: {
        name: string;
        avatarUrl?: string;
    };
    bookId: string;
    createdAt: string;
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
}

// ============ API RESPONSE ============
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ============ AUTH ============
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    class?: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

// ============ STATS ============
export interface SiswaStats {
    borrowedBooks: number;
    nearestDueDate?: string;
    favoriteCount: number;
    unreadMessages: number;
}

export interface AdminStats {
    books: {
        total: number;
        available: number;
        borrowed: number;
    };
    users: {
        total: number;
        active: number;
        newThisMonth: number;
    };
    loans: {
        pending: number;
        active: number;
        overdue: number;
        returning: number;
        thisMonth: number;
        trend: number;
    };
    recentActivity: Array<{
        id: string;
        userName: string;
        bookTitle: string;
        status: string;
        createdAt: string;
    }>;
}

// ============ QUERY PARAMS ============
export interface QueryBooksParams {
    search?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
}

export interface QueryLoansParams {
    status?: LoanStatus;
    page?: number;
    limit?: number;
}
