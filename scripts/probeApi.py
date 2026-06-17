import requests

API_KEY = "5650a6d6fe33e35bc0c06599f46a7cd9"

url = "https://api.eliteprospects.com/v1/search"

params = {
    "q": "Connor McDavid",
    "apiKey": API_KEY
}

response = requests.get(url, params=params)

print(response.status_code)
print(response.text[:2000])