import requests
from bs4 import BeautifulSoup

url = 'https://www.skyscanner.com/transport/flights/ttn/mco/260602/260606/?adultsv2=2&cabinclass=economy&childrenv2=&ref=home&rtn=1&preferdirects=false&outboundaltsenabled=false&inboundaltsenabled=false'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}
response = requests.get(url, headers=headers)

if response.status_code == 200:
    soup = BeautifulSoup(response.text, 'html.parser')

    headings = soup.find_all('h1')
    for heading in headings:
        print(heading.text.strip())
else:
    print(f'Failed to retrieve the webpage. Status code: {response.status_code}')