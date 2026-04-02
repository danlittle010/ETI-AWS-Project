from playwright.sync_api import sync_playwright
import time

leaving_from = input("Enter departure city or airport: ")
going_to = input("Enter destination city or airport: ")
depart_date = input("Enter departure date (YYYY-MM-DD): ")
return_date = input("Enter return date (YYYY-MM-DD): ")

#if not depart_date or not return_date:
#    depart_date = time.strftime("%Y-%m-%d", time.localtime(time.time() + 7 * 24 * 3600))
#    return_date = time.strftime("%Y-%m-%d", time.localtime(time.time() + 14 * 24 * 3600))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    page.goto("https://www.skyscanner.com", wait_until="domcontentloaded")
    page.wait_for_timeout(3000)

    # --- From field ---
    page.locator('[placeholder="Country, city or airport"]').first.click()
    page.wait_for_timeout(500)
    page.keyboard.press("Control+A")
    page.keyboard.press("Backspace")
    page.keyboard.type(leaving_from)
    page.wait_for_timeout(1500)
    # Pick first suggestion from dropdown
    page.locator('[id^="fsc-destination-search"] li').first.click()
    page.wait_for_timeout(500)

    # --- To field ---
    page.locator('[placeholder="Country, city or airport"]').nth(1).click()
    page.wait_for_timeout(500)
    page.keyboard.type(going_to)
    page.wait_for_timeout(1500)
    page.locator('[id^="fsc-destination-search"] li').first.click()
    page.wait_for_timeout(500)

    # --- Depart date ---
    page.locator('[placeholder="Add date"]').first.click()
    page.wait_for_timeout(1000)
    # Click the correct day on the calendar
    page.locator(f'[data-testid="{depart_date}"]').click()
    page.wait_for_timeout(500)

    # --- Return date ---
    page.locator(f'[data-testid="{return_date}"]').click()
    page.wait_for_timeout(500)

    # Confirm date selection if there's a Done button
    done_btn = page.locator('button:has-text("Done")')
    if done_btn.count() > 0:
        done_btn.click()
    page.wait_for_timeout(500)

    # --- Search ---
    page.locator('button:has-text("Search")').click()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(5000)

    # --- Extract results ---
    results = page.locator('[class*="FlightsResults_dayViewItems"]').all()
    if results:
        for r in results:
            print(r.inner_text())
            print("---")
    else:
        print("No results found — selectors may need updating")
        print("Page title:", page.title())

    input("Press Enter to close...")
    browser.close()