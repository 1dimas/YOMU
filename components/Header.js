"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Header;
var react_1 = require("react");
var auth_context_1 = require("@/lib/auth-context");
var api_1 = require("@/lib/api");
var sonner_1 = require("sonner");
var navigation_1 = require("next/navigation");
function Header(_a) {
    var _this = this;
    var _b, _c, _d, _e;
    var userName = _a.userName, userClass = _a.userClass;
    var _f = (0, auth_context_1.useAuth)(), user = _f.user, refreshUser = _f.refreshUser;
    var router = (0, navigation_1.useRouter)();
    var _g = (0, react_1.useState)(false), isProfileOpen = _g[0], setIsProfileOpen = _g[1];
    var _h = (0, react_1.useState)(false), isEditing = _h[0], setIsEditing = _h[1];
    var _j = (0, react_1.useState)(false), isSaving = _j[0], setIsSaving = _j[1];
    var _k = (0, react_1.useState)({
        name: "",
        email: "",
    }), editForm = _k[0], setEditForm = _k[1];
    // Notification Bell State
    var _l = (0, react_1.useState)(false), isNotificationOpen = _l[0], setIsNotificationOpen = _l[1];
    var _m = (0, react_1.useState)([]), conversations = _m[0], setConversations = _m[1];
    var _o = (0, react_1.useState)(0), unreadCount = _o[0], setUnreadCount = _o[1];
    var _p = (0, react_1.useState)(false), isLoadingNotifications = _p[0], setIsLoadingNotifications = _p[1];
    var notificationRef = (0, react_1.useRef)(null);
    // Use auth context user data if available, fallback to props
    var displayName = (user === null || user === void 0 ? void 0 : user.name) || userName || "User";
    var displayClass = ((_b = user === null || user === void 0 ? void 0 : user.class) === null || _b === void 0 ? void 0 : _b.name) || ((_c = user === null || user === void 0 ? void 0 : user.major) === null || _c === void 0 ? void 0 : _c.name) || userClass || "Siswa";
    var initials = displayName
        .split(" ")
        .map(function (n) { return n[0]; })
        .join("")
        .toUpperCase()
        .slice(0, 2);
    var handleOpenProfile = function () {
        if (user) {
            setEditForm({
                name: user.name || "",
                email: user.email || "",
            });
        }
        setIsProfileOpen(true);
        setIsEditing(false);
    };
    var handleSaveProfile = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    setIsSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, api_1.authApi.updateProfile({
                            name: editForm.name,
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, refreshUser()];
                case 3:
                    _a.sent();
                    setIsEditing(false);
                    sonner_1.toast.success("Profil berhasil diperbarui!");
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error("Failed to update profile:", error_1);
                    sonner_1.toast.error("Gagal memperbarui profil. Silakan coba lagi.");
                    return [3 /*break*/, 6];
                case 5:
                    setIsSaving(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var formatDate = function (dateString) {
        if (!dateString)
            return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };
    // Notification helpers
    var getInitials = function (name) {
        return name
            .split(" ")
            .map(function (n) { return n[0]; })
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };
    var formatTimeAgo = function (dateString) {
        var date = new Date(dateString);
        var now = new Date();
        var diffMs = now.getTime() - date.getTime();
        var diffMins = Math.floor(diffMs / 60000);
        var diffHours = Math.floor(diffMins / 60);
        var diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1)
            return "Baru saja";
        if (diffMins < 60)
            return "".concat(diffMins, "m");
        if (diffHours < 24)
            return "".concat(diffHours, "h");
        if (diffDays < 7)
            return "".concat(diffDays, "d");
        return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    };
    // Fetch conversations for notifications
    (0, react_1.useEffect)(function () {
        var fetchConversations = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, allConversations, sortedConversations, totalUnread, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!user || user.role !== Role.SISWA)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        setIsLoadingNotifications(true);
                        return [4 /*yield*/, api_1.messagesApi.getConversations()];
                    case 2:
                        response = _a.sent();
                        allConversations = response.data || [];
                        sortedConversations = allConversations.sort(function (a, b) {
                            var dateA = new Date(a.lastMessageAt || 0).getTime();
                            var dateB = new Date(b.lastMessageAt || 0).getTime();
                            return dateB - dateA;
                        });
                        setConversations(sortedConversations.slice(0, 3));
                        totalUnread = allConversations.reduce(function (sum, conv) { return sum + (conv.unreadCount || 0); }, 0);
                        setUnreadCount(totalUnread);
                        return [3 /*break*/, 5];
                    case 3:
                        error_2 = _a.sent();
                        console.error("Failed to fetch conversations:", error_2);
                        return [3 /*break*/, 5];
                    case 4:
                        setIsLoadingNotifications(false);
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        fetchConversations();
        // Refresh every 30 seconds
        var interval = setInterval(fetchConversations, 30000);
        return function () { return clearInterval(interval); };
    }, [user]);
    // Click outside handler for notification popover
    (0, react_1.useEffect)(function () {
        var handleClickOutside = function (event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };
        if (isNotificationOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return function () {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isNotificationOpen]);
    return (<>
            <header className="top-header">
                {/* Notification Bell - Only for SISWA role */}
                {(user === null || user === void 0 ? void 0 : user.role) === Role.SISWA && (<div ref={notificationRef} style={{ position: "relative", marginRight: "1.5rem" }}>
                        <button onClick={function () { return setIsNotificationOpen(!isNotificationOpen); }} style={{
                position: "relative",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s",
            }} onMouseEnter={function (e) { return (e.currentTarget.style.backgroundColor = "#f3f4f6"); }} onMouseLeave={function (e) { return (e.currentTarget.style.backgroundColor = "transparent"); }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            {unreadCount > 0 && (<span style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    background: "#0084ff",
                    color: "white",
                    borderRadius: "50%",
                    width: unreadCount > 9 ? "20px" : "18px",
                    height: unreadCount > 9 ? "20px" : "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: "700",
                    border: "2px solid white",
                }}>
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>)}
                        </button>

                        {/* Notification Popover */}
                        {isNotificationOpen && (<div style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    width: "360px",
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                    zIndex: 1000,
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                }}>
                                {/* Popover Header */}
                                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#111827" }}>Pesan</h3>
                                    {unreadCount > 0 && (<span style={{
                        background: "#e7f3ff",
                        color: "#0084ff",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                    }}>
                                            {unreadCount} baru
                                        </span>)}
                                </div>

                                {/* Popover Content */}
                                <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                                    {isLoadingNotifications ? (<div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
                                            <div style={{ marginBottom: "0.5rem" }}>⏳</div>
                                            <div style={{ fontSize: "14px" }}>Memuat pesan...</div>
                                        </div>) : conversations.length === 0 ? (<div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>
                                            <div style={{ fontSize: "40px", marginBottom: "0.5rem" }}>💬</div>
                                            <div style={{ fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>Belum ada pesan</div>
                                            <div style={{ fontSize: "12px", marginTop: "0.25rem" }}>Pesan dari admin akan muncul di sini</div>
                                        </div>) : (conversations.map(function (conv) {
                    var _a;
                    var otherUser = conv.otherUser;
                    var isUnread = (conv.unreadCount || 0) > 0;
                    return (<div key={conv.id} style={{
                            padding: "0.75rem 1.25rem",
                            borderBottom: "1px solid #f3f4f6",
                            cursor: "pointer",
                            transition: "background-color 0.15s",
                            backgroundColor: isUnread ? "#f8fbff" : "white",
                        }} onMouseEnter={function (e) { return (e.currentTarget.style.backgroundColor = "#f9fafb"); }} onMouseLeave={function (e) { return (e.currentTarget.style.backgroundColor = isUnread ? "#f8fbff" : "white"); }} onClick={function () {
                            setIsNotificationOpen(false);
                            router.push("/siswa/pesan");
                        }}>
                                                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                                                        <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #e4e6eb 0%, #d0d3d9 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#65676b",
                            flexShrink: 0,
                        }}>
                                                            {getInitials((otherUser === null || otherUser === void 0 ? void 0 : otherUser.name) || "Admin")}
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.25rem" }}>
                                                                <span style={{ fontSize: "14px", fontWeight: isUnread ? "600" : "500", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                    {(otherUser === null || otherUser === void 0 ? void 0 : otherUser.name) || "User"}
                                                                </span>
                                                                <span style={{ fontSize: "11px", color: "#9ca3af", marginLeft: "0.5rem", flexShrink: 0 }}>
                                                                    {formatTimeAgo(conv.lastMessageAt || conv.createdAt)}
                                                                </span>
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                                <p style={{
                            margin: 0,
                            fontSize: "13px",
                            color: isUnread ? "#374151" : "#6b7280",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontWeight: isUnread ? "500" : "400",
                        }}>
                                                                    {((_a = conv.lastMessage) === null || _a === void 0 ? void 0 : _a.content) || "Belum ada pesan"}
                                                                </p>
                                                                {isUnread && (<div style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#0084ff",
                                flexShrink: 0,
                            }}/>)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>);
                }))}
                                </div>

                                {/* Popover Footer */}
                                {conversations.length > 0 && (<div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #e5e7eb", background: "#fafafa" }}>
                                        <button onClick={function () {
                        setIsNotificationOpen(false);
                        router.push("/siswa/pesan");
                    }} style={{
                        width: "100%",
                        padding: "0.625rem",
                        background: "#0084ff",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                    }} onMouseEnter={function (e) { return (e.currentTarget.style.backgroundColor = "#0073e6"); }} onMouseLeave={function (e) { return (e.currentTarget.style.backgroundColor = "#0084ff"); }}>
                                            Buka Semua Pesan
                                        </button>
                                    </div>)}
                            </div>)}
                    </div>)}

                <div className="user-profile" onClick={handleOpenProfile} style={{ cursor: "pointer" }}>
                    <div className="user-info">
                        <div className="user-name">{displayName}</div>
                        <div className="user-role">{displayClass}</div>
                    </div>
                    <div className="user-avatar">
                        {(user === null || user === void 0 ? void 0 : user.avatarUrl) ? (<img src={user.avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}/>) : (initials)}
                    </div>
                </div>
            </header>

            {/* Profile Popup Modal */}
            {isProfileOpen && (<div className="modal-overlay" onClick={function () { return setIsProfileOpen(false); }}>
                    <div className="modal-content" style={{ maxWidth: "500px", borderRadius: "1rem", overflow: "hidden" }} onClick={function (e) { return e.stopPropagation(); }}>
                        {/* Modal Header with Gradient */}
                        <div style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                padding: "2rem",
                textAlign: "center",
                color: "white",
            }}>
                            <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                fontSize: "1.75rem",
                fontWeight: "700",
                border: "3px solid rgba(255,255,255,0.3)",
            }}>
                                {(user === null || user === void 0 ? void 0 : user.avatarUrl) ? (<img src={user.avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}/>) : (initials)}
                            </div>
                            <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: "700" }}>{displayName}</h2>
                            <p style={{ margin: "0.25rem 0 0", opacity: 0.9, fontSize: "0.95rem" }}>
                                {(user === null || user === void 0 ? void 0 : user.role) === "ADMIN" ? "Administrator" : "Siswa"}
                            </p>
                            <button onClick={function () { return setIsProfileOpen(false); }} style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
            }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>

                        {/* Profile Content */}
                        <div style={{ padding: "1.5rem" }}>
                            {isEditing ? (
            /* Edit Mode */
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>
                                            Nama Lengkap
                                        </label>
                                        <input type="text" value={editForm.name} onChange={function (e) { return setEditForm(__assign(__assign({}, editForm), { name: e.target.value })); }} style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 0.2s",
                }} onFocus={function (e) { return (e.target.style.borderColor = "#10b981"); }} onBlur={function (e) { return (e.target.style.borderColor = "#e5e7eb"); }}/>
                                    </div>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: "600", color: "#374151" }}>
                                            Email
                                        </label>
                                        <input type="email" value={editForm.email} disabled style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    background: "#f9fafb",
                    color: "#6b7280",
                    cursor: "not-allowed",
                }}/>
                                        <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#9ca3af" }}>
                                            Email tidak dapat diubah
                                        </p>
                                    </div>
                                </div>) : (
            /* View Mode */
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", background: "#f9fafb", borderRadius: "0.75rem" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "0.5rem", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" width="20" height="20">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                                <polyline points="22,6 12,13 2,6"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>Email</p>
                                            <p style={{ margin: 0, fontWeight: "600", color: "#111827" }}>{(user === null || user === void 0 ? void 0 : user.email) || "-"}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", background: "#f9fafb", borderRadius: "0.75rem" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "0.5rem", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" width="20" height="20">
                                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>Jurusan</p>
                                            <p style={{ margin: 0, fontWeight: "600", color: "#111827" }}>{((_d = user === null || user === void 0 ? void 0 : user.major) === null || _d === void 0 ? void 0 : _d.name) || "-"}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", background: "#f9fafb", borderRadius: "0.75rem" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "0.5rem", background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2" width="20" height="20">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                                <circle cx="9" cy="7" r="4"/>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>Kelas</p>
                                            <p style={{ margin: 0, fontWeight: "600", color: "#111827" }}>{((_e = user === null || user === void 0 ? void 0 : user.class) === null || _e === void 0 ? void 0 : _e.name) || "-"}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", background: "#f9fafb", borderRadius: "0.75rem" }}>
                                        <div style={{ width: "40px", height: "40px", borderRadius: "0.5rem", background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2" width="20" height="20">
                                                <circle cx="12" cy="12" r="10"/>
                                                <polyline points="12 6 12 12 16 14"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>Bergabung Sejak</p>
                                            <p style={{ margin: 0, fontWeight: "600", color: "#111827" }}>{formatDate(user === null || user === void 0 ? void 0 : user.createdAt)}</p>
                                        </div>
                                    </div>
                                </div>)}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e5e7eb", display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                            {isEditing ? (<>
                                    <button onClick={function () { return setIsEditing(false); }} style={{
                    padding: "0.75rem 1.25rem",
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    color: "#64748b",
                }}>
                                        Batal
                                    </button>
                                    <button onClick={handleSaveProfile} disabled={isSaving} style={{
                    padding: "0.75rem 1.25rem",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    opacity: isSaving ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}>
                                        {isSaving ? ("Menyimpan...") : (<>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                                    <polyline points="17 21 17 13 7 13 7 21"/>
                                                    <polyline points="7 3 7 8 15 8"/>
                                                </svg>
                                                Simpan Perubahan
                                            </>)}
                                    </button>
                                </>) : (<button onClick={function () { return setIsEditing(true); }} style={{
                    padding: "0.75rem 1.25rem",
                    background: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    Edit Profil
                                </button>)}
                        </div>
                    </div>
                </div>)}
        </>);
}
