
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** fe-yomu
- **Date:** 2026-03-08
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Student can log in and reach student dashboard
- **Test Code:** [TC001_Student_can_log_in_and_reach_student_dashboard.py](./TC001_Student_can_log_in_and_reach_student_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/37951731-1ea1-4b27-a3a5-35cd98357ee9
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Admin can log in and reach admin dashboard
- **Test Code:** [TC002_Admin_can_log_in_and_reach_admin_dashboard.py](./TC002_Admin_can_log_in_and_reach_admin_dashboard.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - error message 'Failed to fetch' is displayed on the login page after submitting credentials
- Admin dashboard not reached - current URL remains '/login' and does not contain '/admin'
- No redirect to '/admin' occurred within the observation period after submitting the login form
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/13146e2c-e48f-46e9-9241-5920f7403c33
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Successful student registration redirects to login
- **Test Code:** [TC003_Successful_student_registration_redirects_to_login.py](./TC003_Successful_student_registration_redirects_to_login.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Class dropdown on /register contains only placeholder 'Pilih Kelas' and does not include 'Class 10'
- Major dropdown on /register contains only placeholder 'Pilih Jurusan' and does not include 'Science'
- Registration cannot be completed because required selectable options are missing from the form
- Page title does not contain 'Register' (it shows localized 'Daftar Anggota Baru'), so the expected title check fails
- Registration submission was not performed; confirm-password and submit steps remain unexecuted because of missing fields
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/a07c87c1-ef24-4e27-b51c-017fb4a753f2
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Registration fails when confirm password does not match
- **Test Code:** [TC004_Registration_fails_when_confirm_password_does_not_match.py](./TC004_Registration_fails_when_confirm_password_does_not_match.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Registration link not present as an interactive element on the login page, preventing navigation to the student registration form
- Clicking the registration link did not result in the registration page loading; the page still displays the login form with email and password fields
- Full registration form fields (Full Name, Class dropdown, Major dropdown, Confirm Password, Register button) not found on the page, so form submission cannot be performed
- Validation check for mismatched passwords could not be executed because the registration form was inaccessible
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/0044efdc-2c25-4a7e-858c-cb183a2bfc47
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Forgot Password - request reset with registered email shows success confirmation
- **Test Code:** [TC009_Forgot_Password___request_reset_with_registered_email_shows_success_confirmation.py](./TC009_Forgot_Password___request_reset_with_registered_email_shows_success_confirmation.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- No visible success/confirmation message displayed after submitting the registered email 'admin@yomu.id'.
- Visible page text contains only the forgot-password form and instructional lines; no expected confirmation phrases (e.g., 'telah dikirim', 'periksa email', 'check your email', 'email sent').
- Submit button showed an in-progress state but no final success notification was displayed.
- The email input field remained visible after submit, indicating the page did not present a dedicated confirmation view.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/ac5f8e45-e61c-43aa-bac9-c762a21cef7f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Forgot Password - unknown email shows email-not-found error
- **Test Code:** [TC010_Forgot_Password___unknown_email_shows_email_not_found_error.py](./TC010_Forgot_Password___unknown_email_shows_email_not_found_error.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- No error message displayed after submitting unregistered email 'unknown-user-404@example.com'.
- Expected error text indicating the email was not found is not present on the page.
- Notification area (section aria-label=Notifications) contains no visible error content after submit.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/b7e49d3d-1768-49e9-8cea-5ad9dd3d9027
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Validation: mismatched confirm password blocks submission
- **Test Code:** [TC016_Validation_mismatched_confirm_password_blocks_submission.py](./TC016_Validation_mismatched_confirm_password_blocks_submission.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Password and confirm password input fields not found on /reset-password page
- Submit button not found on /reset-password page
- Reset password page displays 'Link Tidak Valid' indicating the reset link is invalid or expired
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/6512f081-5ebc-427a-9b43-8589535a8890
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Student dashboard loads and shows statistics and recommendations
- **Test Code:** [TC019_Student_dashboard_loads_and_shows_statistics_and_recommendations.py](./TC019_Student_dashboard_loads_and_shows_statistics_and_recommendations.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - error banner 'Failed to fetch' displayed after submitting credentials.
- No redirect to '/siswa' observed; the application remained on the login page.
- Dashboard page did not load; expected 'Dashboard' content is not present.
- Authentication endpoint appears unreachable (network fetch error) preventing login.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/57166237-6802-477c-8a3c-ef15c893f2ef
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC020 Open a recommended book from dashboard to reach the book detail page
- **Test Code:** [TC020_Open_a_recommended_book_from_dashboard_to_reach_the_book_detail_page.py](./TC020_Open_a_recommended_book_from_dashboard_to_reach_the_book_detail_page.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - error message 'Failed to fetch' displayed on the login page preventing access to dashboard
- Dashboard page did not load after submitting valid credentials; current URL remains http://localhost:3001/login
- Recommended books section could not be tested because the dashboard was not reachable
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/18f3e649-21bd-44fd-9b72-4d0983452306
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC021 Quick navigation from dashboard to Catalog page
- **Test Code:** [TC021_Quick_navigation_from_dashboard_to_Catalog_page.py](./TC021_Quick_navigation_from_dashboard_to_Catalog_page.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - 'Failed to fetch' error message is displayed on the login page after submitting credentials.
- Dashboard page did not load after login - the application remains on the login page and the login form is still visible.
- Sidebar navigation (including 'Katalog') is not available because the user is not authenticated (cannot verify catalog navigation).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/79a414c5-0cab-4466-a98a-65f328778a2e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC022 Quick navigation from dashboard to Loans page
- **Test Code:** [TC022_Quick_navigation_from_dashboard_to_Loans_page.py](./TC022_Quick_navigation_from_dashboard_to_Loans_page.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - error message 'Failed to fetch' displayed on the login page
- Dashboard page did not load after submitting login - current URL remains '/login'
- Sidebar item 'Peminjaman' not found because the user is not authenticated and the dashboard is not visible
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/cf0e1465-0fd2-4e3c-8584-66525bc3b048
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC026 Search books by title and open a book detail from catalog
- **Test Code:** [TC026_Search_books_by_title_and_open_a_book_detail_from_catalog.py](./TC026_Search_books_by_title_and_open_a_book_detail_from_catalog.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Submit button did not navigate to the student dashboard; URL remains '/login' and does not contain '/siswa'.
- Error banner 'Failed to fetch' is displayed on the login page indicating a backend or network error preventing successful authentication and redirect.
- Student navigation (e.g., 'Katalog') was not reachable because the dashboard page did not load after login, preventing continuation of the test.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/592c93ad-bdb8-4535-bdb1-445e076e9b6f
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC027 Filter catalog by category and verify results update
- **Test Code:** [TC027_Filter_catalog_by_category_and_verify_results_update.py](./TC027_Filter_catalog_by_category_and_verify_results_update.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - 'Failed to fetch' error message is displayed on the login page, preventing authentication.
- No redirect to '/siswa' occurred after submitting the login form; the application remains on the login page.
- Catalog filtering test cannot proceed because authentication did not complete due to the network/backend error.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/f9edc848-dc1e-4349-8859-06aed68d9a2d
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC029 Search with no matching results shows 'no books found' state
- **Test Code:** [TC029_Search_with_no_matching_results_shows_no_books_found_state.py](./TC029_Search_with_no_matching_results_shows_no_books_found_state.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed - 'Failed to fetch' error toast is displayed on the login page.
- Login page did not redirect to '/siswa' after submitting credentials.
- Unable to access the student area; catalog page cannot be reached to perform the empty-state verification.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/adbb93d1-89b8-4d1c-a716-8fab2a26367e
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC033 Borrow request from book detail shows pending confirmation
- **Test Code:** [TC033_Borrow_request_from_book_detail_shows_pending_confirmation.py](./TC033_Borrow_request_from_book_detail_shows_pending_confirmation.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Login failed: 'Failed to fetch' error message is displayed on the login page, preventing authentication.
- Redirect to '/siswa' did not occur after submitting the login form; current URL remains '/login'.
- Login was attempted twice and both attempts failed.
- The catalog and book-detail pages could not be accessed because the user is not authenticated.
- The 'Submit a borrow request' action could not be tested because the required authenticated state was not reached.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/50c7c53a-f747-4602-b5ca-023f8db36ca3/4c7183b6-6299-4149-82a3-1ae51979de87
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **6.67** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---