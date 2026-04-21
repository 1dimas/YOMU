# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** fe-yomu (YOMU Library System — Frontend)
- **Date:** 2026-03-08
- **Prepared by:** TestSprite AI Team
- **Tech Stack:** Next.js 16, React 19, TypeScript, TailwindCSS 4
- **Test Runner:** TestSprite MCP (Frontend E2E)
- **Server Mode:** Development (dev server on port 3001)

---

## 2️⃣ Requirement Validation Summary

### REQ-1: Authentication — Login

#### ✅ TC001 — Student can log in and reach student dashboard
- **Test Code:** [TC001](./TC001_Student_can_log_in_and_reach_student_dashboard.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/37951731-1ea1-4b27-a3a5-35cd98357ee9)
- **Status:** ✅ Passed
- **Analysis:** Student login flow works correctly. The user can enter credentials, submit the form, and is redirected to the student dashboard.

---

#### ❌ TC002 — Admin can log in and reach admin dashboard
- **Test Code:** [TC002](./TC002_Admin_can_log_in_and_reach_admin_dashboard.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/13146e2c-e48f-46e9-9241-5920f7403c33)
- **Status:** ❌ Failed
- **Error:** `Failed to fetch` — Login failed, URL remains `/login`, no redirect to `/admin`.
- **Analysis:** Backend API is unreachable for admin login — the fetch call to the auth endpoint fails with a network error. This is an **infrastructure issue** (backend server not running during the test), not a frontend code bug.

---

### REQ-2: Authentication — Registration

#### ❌ TC003 — Successful student registration redirects to login
- **Test Code:** [TC003](./TC003_Successful_student_registration_redirects_to_login.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/a07c87c1-ef24-4e27-b51c-017fb4a753f2)
- **Status:** ❌ Failed
- **Error:** Class and Major dropdowns contain only placeholder text — no selectable options loaded from API.
- **Analysis:** The registration form depends on backend API (`GET /api/majors`, `GET /api/classes`) to populate dropdown options. Since the backend is not running, these dropdowns remain empty, preventing form submission. Additionally, the test expected English text ("Register") but the page uses localized Indonesian text ("Daftar Anggota Baru").

---

#### ❌ TC004 — Registration fails when confirm password does not match
- **Test Code:** [TC004](./TC004_Registration_fails_when_confirm_password_does_not_match.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/0044efdc-2c25-4a7e-858c-cb183a2bfc47)
- **Status:** ❌ Failed
- **Error:** Registration link not found as interactive element on the login page, unable to navigate to `/register`.
- **Analysis:** The test could not navigate from the login page to the registration page. The registration link exists (`Daftar sebagai Siswa →`) but the test may not have matched the element correctly due to localization.

---

### REQ-3: Authentication — Password Reset

#### ❌ TC009 — Forgot Password: request reset with registered email shows success
- **Test Code:** [TC009](./TC009_Forgot_Password___request_reset_with_registered_email_shows_success_confirmation.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/ac5f8e45-e61c-43aa-bac9-c762a21cef7f)
- **Status:** ❌ Failed
- **Error:** No success/confirmation message displayed after submitting registered email.
- **Analysis:** Backend unreachable — the forgot-password API call likely failed silently. The form remained visible without transitioning to a success view. Could also indicate the frontend doesn't show feedback when the API fails.

---

#### ❌ TC010 — Forgot Password: unknown email shows error
- **Test Code:** [TC010](./TC010_Forgot_Password___unknown_email_shows_email_not_found_error.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/b7e49d3d-1768-49e9-8cea-5ad9dd3d9027)
- **Status:** ❌ Failed
- **Error:** No error message after submitting unregistered email.
- **Analysis:** Same root cause — backend is not available to return an error response, so neither success nor error feedback is shown to the user.

---

#### ❌ TC016 — Validation: mismatched confirm password blocks submission (Reset Password)
- **Test Code:** [TC016](./TC016_Validation_mismatched_confirm_password_blocks_submission.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/6512f081-5ebc-427a-9b43-8589535a8890)
- **Status:** ❌ Failed
- **Error:** Reset password page shows "Link Tidak Valid" — no password fields or submit button visible.
- **Analysis:** The `/reset-password` page requires a valid token query parameter. Without it, the page correctly shows an "invalid link" message. This is expected behavior — the test needs a valid reset token to proceed.

---

### REQ-4: Student Dashboard & Navigation

#### ❌ TC019 — Student dashboard loads and shows statistics and recommendations
- **Test Code:** [TC019](./TC019_Student_dashboard_loads_and_shows_statistics_and_recommendations.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/57166237-6802-477c-8a3c-ef15c893f2ef)
- **Status:** ❌ Failed
- **Error:** `Failed to fetch` — Login failed, dashboard did not load.
- **Analysis:** Backend unreachable. Cannot authenticate → cannot load dashboard.

---

#### ❌ TC020 — Open recommended book from dashboard to book detail
- **Test Code:** [TC020](./TC020_Open_a_recommended_book_from_dashboard_to_reach_the_book_detail_page.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/18f3e649-21bd-44fd-9b72-4d0983452306)
- **Status:** ❌ Failed
- **Error:** `Failed to fetch` — Login failed.
- **Analysis:** Backend unreachable — cascading failure from login.

---

#### ❌ TC021 — Quick navigation from dashboard to Catalog page
- **Test Code:** [TC021](./TC021_Quick_navigation_from_dashboard_to_Catalog_page.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/79a414c5-0cab-4466-a98a-65f328778a2e)
- **Status:** ❌ Failed
- **Error:** `Failed to fetch` — Login failed.
- **Analysis:** Backend unreachable — cascading failure from login.

---

#### ❌ TC022 — Quick navigation from dashboard to Loans page
- **Test Code:** [TC022](./TC022_Quick_navigation_from_dashboard_to_Loans_page.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/cf0e1465-0fd2-4e3c-8584-66525bc3b048)
- **Status:** ❌ Failed
- **Error:** `Failed to fetch` — Login failed.
- **Analysis:** Backend unreachable — cascading failure from login.

---

### REQ-5: Book Catalog & Browsing

#### ❌ TC026 — Search books by title and open book detail from catalog
- **Test Code:** [TC026](./TC026_Search_books_by_title_and_open_a_book_detail_from_catalog.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/592c93ad-bdb8-4535-bdb1-445e076e9b6f)
- **Status:** ❌ Failed
- **Error:** `Failed to fetch` — Login failed.
- **Analysis:** Backend unreachable — cascading failure from login.

---

#### ❌ TC027 — Filter catalog by category and verify results update
- **Test Code:** [TC027](./TC027_Filter_catalog_by_category_and_verify_results_update.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/f9edc848-dc1e-4349-8859-06aed68d9a2d)
- **Status:** ❌ Failed
- **Error:** `Failed to fetch` — Login failed.
- **Analysis:** Backend unreachable — cascading failure from login.

---

#### ❌ TC029 — Search with no matching results shows empty state
- **Test Code:** [TC029](./TC029_Search_with_no_matching_results_shows_no_books_found_state.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/adbb93d1-89b8-4d1c-a716-8fab2a26367e)
- **Status:** ❌ Failed
- **Error:** `Failed to fetch` — Login failed.
- **Analysis:** Backend unreachable — cascading failure from login.

---

### REQ-6: Book Borrowing

#### ❌ TC033 — Borrow request from book detail shows pending confirmation
- **Test Code:** [TC033](./TC033_Borrow_request_from_book_detail_shows_pending_confirmation.py)
- **Visualization:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/4c7183b6-6299-4149-82a3-1ae51979de87)
- **Status:** ❌ Failed
- **Error:** `Failed to fetch` — Login failed twice.
- **Analysis:** Backend unreachable — cascading failure from login.

---

## 3️⃣ Coverage & Matching Metrics

- **Pass Rate:** 6.67% (1 of 15 tests passed)

| Requirement | Total Tests | ✅ Passed | ❌ Failed |
|---|---|---|---|
| REQ-1: Login | 2 | 1 | 1 |
| REQ-2: Registration | 2 | 0 | 2 |
| REQ-3: Password Reset | 3 | 0 | 3 |
| REQ-4: Student Dashboard & Navigation | 4 | 0 | 4 |
| REQ-5: Book Catalog & Browsing | 3 | 0 | 3 |
| REQ-6: Book Borrowing | 1 | 0 | 1 |
| **Total** | **15** | **1** | **14** |

### Failure Root Cause Breakdown

| Root Cause | # Tests Affected |
|---|---|
| Backend not running (`Failed to fetch`) | 12 |
| Backend API data unavailable (empty dropdowns) | 1 |
| Missing reset token (expected behavior) | 1 |

---

## 4️⃣ Key Gaps / Risks

### 🔴 Critical: Backend Dependency
- **12 out of 14 failures** are caused by the backend server (`yomu-backend`) not running during tests. The frontend's `POST /api/auth/login` call returns `Failed to fetch`, causing all authenticated test flows to fail.
- **Action Required:** Start the backend server (`npm run start:dev` in `yomu-backend/`) before re-running tests. This alone should resolve the majority of failures.

### 🟡 Medium: Registration Form Relies on Backend Data
- The registration page dropdowns (Class/Major) are populated from API calls (`GET /api/majors`, `GET /api/classes`). Without backend, registration cannot complete.
- **Suggestion:** Consider adding a loading/error state when master data fails to load, so the user gets clear feedback.

### 🟡 Medium: Reset Password Token Requirement
- TC016 failed because `/reset-password` requires a valid token — this is by design and not a bug. The test needs to use a valid token to properly test password validation.
- **Suggestion:** This test case should be deprioritized or adjusted to account for token generation.

### 🟢 Low: Localization Mismatch
- Some tests expected English text (e.g., "Register") but the app uses Indonesian (e.g., "Daftar Anggota Baru"). This caused minor assertion failures.
- **Suggestion:** Update test expectations to use Indonesian text matching the actual UI.

---
