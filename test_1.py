import requests
from bs4 import BeautifulSoup

# Step 1: Fetch the HTML content
url = 'https://example.com'
response = requests.get(url)
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
