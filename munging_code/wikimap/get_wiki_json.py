
# coding: utf-8

# In[1]:

import json
import requests


# In[2]:

url = 'http://api.geonames.org/findNearbyWikipediaJSON?'

params = {
    'lat': '37.551441',
    'lng': '-77.436056',
    'radius': '15',
    'maxRows': '500',
    'username': 'immrroboto'
}

response = requests.get(url, params=params)

fixtures = response.json()['geonames']


# In[3]:

data=json.dumps(fixtures)


# In[5]:

with open('wikimap_data.json', 'w') as outfile:
    json.dump(data, outfile)


# In[ ]:



