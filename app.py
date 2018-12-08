#!/usr/bin/python
# coding: utf-8

# In[1]:
#import pickle
#import networkx as nx

from flask import Flask, request, render_template, flash

DEBUG = True

app = Flask(__name__)


@app.route("/")
def landing():

    return render_template("index.html")

@app.route("/2018_city_budget")
def CityBudget2018():
    what_this = '''This is an interactive exploration of Richmond City's 2018 budget.  The concentric rings (from inner-most to outer) are agency, cost center, account, then service.'''

    how_to_use = '''Click through the sections of the pie to dive deeper into that particular line item - click the circle in the center to go back up a level. Enjoy! '''

    where_data = '''The data comes from the City of Richmond's <a href="https://data.richmondgov.com/Well-Managed-Government/City-Budget-General-Fund/7nru-hsrx">Data Portal</a> and was converted into a tree structure (of the acyclic fully connected graph nature) in Python before being saved as a JSON object.  You can find the code for preparing this data for web use in the RVA Data Gallery <a href="#">here</a>.'''

    shoutouts = '''D3.js sunbirst derived from Mike Bostock's <a href="https://beta.observablehq.com/@mbostock/d3-zoomable-sunburst">example</a>. '''

    return render_template("2018_city_budget.html",what_this=what_this,how_to_use=how_to_use,where_data=where_data,shoutouts=shoutouts)

@app.route("/wikimap")
def wikimap():

    return render_template("wikimap.html")

if __name__ == "__main__":
    app.run(port=8989, debug=True)
