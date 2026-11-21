import urllib.request
import json
import urllib.error

data = json.dumps({
    'first_name': 'Samuel',
    'last_name': 'Daniyan',
    'username': 'unique_vendor_555',
    'email': 'unique_vendor_555@gmail.com',
    'password': 'password123',
    'is_vendor': True,
    'shop_name': 'ades kitchen unique',
    'description': 'your one stop to quality meals',
    'phone_number': '08115829421'
}).encode()

req = urllib.request.Request(
    'https://campuseats-cf7d.onrender.com/api/signup/',
    data=data,
    headers={'Content-Type': 'application/json'}
)

try:
    urllib.request.urlopen(req)
    print("Success")
except urllib.error.HTTPError as e:
    print(e.read().decode('utf-8'))
