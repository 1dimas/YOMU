import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:3001
        await page.goto("http://localhost:3001", wait_until="commit", timeout=10000)
        
        # -> Click the 'Daftar sebagai Siswa →' link (element index 90) to navigate to the registration page.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[2]/div/div[2]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Navigate to /register (use explicit navigate to http://localhost:3001/register) to reach the registration page, then proceed with the registration assertions and form filling.
        await page.goto("http://localhost:3001/register", wait_until="commit", timeout=10000)
        
        # -> Fill the registration form with the provided valid details and submit: enter email, name, select Class 10 and Science, enter matching password and confirm, then click 'Daftar Sekarang'. After submission verify redirect to /login and success message.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[2]/div/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('test.student.unique.20260308@yomu-example.test')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[2]/div/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Test Student')
        
        # -> Open the Kelas (Class) dropdown to reveal options so 'Class 10' can be selected (click element index 463).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[2]/div/form/div[3]/div/div/div/select').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        
        # -> Select 'Class 10' from the Kelas dropdown (index 463) and then continue to select major, fill passwords and submit the form.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[2]/div/form/div[4]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('P@ssw0rd123!')
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Register').first).to_be_visible(timeout=3000)
        assert '/login' in frame.url
        await expect(frame.locator('text=Registration successful').first).to_be_visible(timeout=3000)
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    