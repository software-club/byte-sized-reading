import requests

url = 'http://localhost:5002/api/books/cron/notify'

response = requests.get(url)
print(response.json())
