from playwright.sync_api import sync_playwright
import random

leaving_from = "New York"
going_to = "San Francisco"
depart_date = "2026-04-04"
return_date = "2026-04-12"

#leaving_from = input("Enter departure city or airport: ")
#going_to = input("Enter destination city or airport: ")
#depart_date = input("Enter departure date (YYYY-MM-DD): ")
#return_date = input("Enter return date (YYYY-MM-DD): ")

def human_type(page, text):
    for char in text:
        page.keyboard.type(char)
        page.wait_for_timeout(random.randint(50, 150))

def random_wait(page):
    page.wait_for_timeout(random.randint(800, 2000))

def clear_and_type(page, locator, text):
    locator.click()
    random_wait(page)
    page.keyboard.press("Meta+A")
    page.wait_for_timeout(300)  # Select all text
    page.keyboard.press("Delete")     # Delete selected text
    page.wait_for_timeout(300)
    human_type(page, text)    # then type naturally

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=False,
        args=[
            "--disable-blink-features=AutomationControlled",
            "--disable-infobars",
            "--no-sandbox",
            "--disable-dev-shm-usage",
        ]
    )
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        viewport={"width": 1280, "height": 800},
        locale="en-US",
        timezone_id="America/New_York",
    )

    page = context.new_page()
    page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

 

    # Navigate with longer timeout
    try:
        page.goto("https://www.skyscanner.com", wait_until="load", timeout=60000)
    except Exception as e:
        print(f"Page load warning: {e}")
        print("Continuing anyway...")

    page.screenshot(path="debug.png")
    page.wait_for_timeout(random.randint(2000, 4000))

    # --- From field ---
    from_field = page.locator('[placeholder="Country, city or airport"]').first
    clear_and_type(page, from_field, leaving_from)
    page.wait_for_selector('ul[role="listbox"] li', state="visible", timeout=5000)
    page.locator('ul[role="listbox"] li').first.click()
    random_wait(page)

    # --- To field ---
    to_field = page.locator('[placeholder="Country, city or airport"]').nth(1)
    clear_and_type(page, to_field, going_to)
    page.wait_for_selector('ul[role="listbox"] li', state="visible", timeout=5000)
    page.locator('ul[role="listbox"] li').first.click()
    random_wait(page)

    # --- Depart date ---
    page.locator('[placeholder="Depart"]').first.click()
    page.wait_for_timeout(1000)
    page.locator(f'[data-testid="{depart_date}"]').click()
    random_wait(page)

    # --- Return date ---
    page.locator('[placeholder="Return"]').first.click()
    page.wait_for_timeout(1000)
    page.locator(f'[data-testid="{return_date}"]').click()
    random_wait(page)

    # Confirm date selection if there's a Done button
    done_btn = page.locator('button:has-text("Done")')
    if done_btn.count() > 0:
        done_btn.click()
    random_wait(page)

    # --- Search ---
    page.locator('button:has-text("Search")').click()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(random.randint(4000, 6000))

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