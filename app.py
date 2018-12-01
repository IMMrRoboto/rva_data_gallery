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

    return render_template("2018_city_budget.html")

if __name__ == "__main__":
    app.run(port=8989, debug=True)
