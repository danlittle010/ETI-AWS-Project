from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

# Setup Chrome options
chrome_options = Options()
chrome_options.add_argument('--headless')  # Run in background
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

# Initialize the driver
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    url = 'https://www.skyscanner.com/transport/flights/ttn/mco/260602/260606/?adultsv2=2&cabinclass=economy&childrenv2=&ref=home&rtn=1&preferdirects=false&outboundaltsenabled=false&inboundaltsenabled=false'
    
    driver.get(url)
    
    # Wait for h1 tags to load (max 10 seconds)
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.TAG_NAME, 'h1'))
    )
    
    # Find all h1 headings
    headings = driver.find_elements(By.TAG_NAME, 'h1')
    
    if headings:
        print(f"Found {len(headings)} heading(s):")
        for heading in headings:
            print(heading.text)
    else:
        print("No headings found on the page")
        
finally:
    driver.quit()