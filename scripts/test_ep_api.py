import requests

url = "http://api.eliteprospects.com/v1/players?q=connor"

response = requests.get(url)

print("STATUS:", response.status_code)

print(response.text[:1000])