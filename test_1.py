from playwright.sync_api import sync_playwright
from datetime import datetime
import random

leaving_from = "New York"
going_to = "San Francisco"
depart_date = "2026-04-12"
return_date = "2026-04-24"

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
    page.wait_for_timeout(300)
    page.keyboard.press("Delete")
    page.wait_for_timeout(300)
    human_type(page, text)

def click_date(page, date_str, date_type="departure"):
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    formatted = date_obj.strftime("%A, %B %-d, %Y")
    aria = f"{formatted}. Select as {date_type} date"
    print(f"Clicking: {aria}")
    page.locator(f'button[aria-label="{aria}"]').click()

STEALTH_SCRIPT = """
    () => {
        // Hide webdriver
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

        // Fake plugins
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
        });

        // Fake languages
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
        });

        // Fake chrome object
        window.chrome = {
            runtime: {},
            loadTimes: function() {},
            csi: function() {},
            app: {}
        };

        // Fake permissions
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );

        // Fake screen dimensions
        Object.defineProperty(screen, 'width', { get: () => 1280 });
        Object.defineProperty(screen, 'height', { get: () => 800 });

        // Remove headless indicators
        Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 1 });
    }
"""

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=False,
        args=[
            "--disable-blink-features=AutomationControlled",
            "--disable-infobars",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
        ]
    )
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        viewport={"width": 1280, "height": 800},
        locale="en-US",
        timezone_id="America/New_York",
        # Fake geolocation to match New York
        geolocation={"longitude": -74.006, "latitude": 40.7128},
        permissions=["geolocation"],
        # Make it look like a real browser
        java_script_enabled=True,
        accept_downloads=True,
        has_touch=False,
        is_mobile=False,
    )

    # Inject stealth scripts on every page load
    context.add_init_script(STEALTH_SCRIPT)

    # Block heavy resources to speed up loading
    def block_resources(route):
        if route.request.resource_type in ["image", "font", "media"]:
            route.abort()
        else:
            route.continue_()

    page = context.new_page()

    # Add extra headers to look more like a real browser
    page.set_extra_http_headers({
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
    })

    page.route("**/*", block_resources)

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
    try:
        page.locator('[data-testid="Depart"]').first.click()
    except:
        page.locator('[data-testid="dates-container"]').first.click()

    page.wait_for_timeout(2000)
    click_date(page, depart_date, "departure")
    random_wait(page)

    # --- Return date ---
    try:
        page.locator('[data-testid="Return"]').first.click()
    except:
        page.locator('[data-testid="dates-container"]').first.click()

    page.wait_for_timeout(2000)
    click_date(page, return_date, "return")
    random_wait(page)

    # Click Apply to confirm
    apply_btn = page.locator('button:has-text("Apply")')
    if apply_btn.count() > 0:
        apply_btn.click()
    random_wait(page)

    # Human-like pause before searching
    page.wait_for_timeout(random.randint(1000, 2000))

    # --- Search ---
    page.locator('button:has-text("Search")').click()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(random.randint(4000, 6000))

    # --- Press and hold button ---
    button = page.locator('button:has-text("Press & hold")')
    box = button.bounding_box()
    page.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2)
    page.mouse.down()
    page.wait_for_timeout(2000)
    page.mouse.up()

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