import requests
from bs4 import BeautifulSoup

# Step 1: Fetch the HTML content
url = 'https://www.espn.com'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
response = requests.get(url, headers=headers)
# Step 2: Check if the request was successful
if response.status_code == 200:
    # Step 3: Parse the HTML
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Step 4: Extract specific data (e.g., all <h2> headings)
    headings = soup.find_all('h2')
    for heading in headings:
        print(heading.text.strip())
else:
    print(f"Failed to retrieve page: {response.status_code}")