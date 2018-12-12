
# coding: utf-8

import json
import pickle
import networkx as nx

from flask import Flask, request, render_template, flash

DEBUG = True

app = Flask(__name__)


@app.route("/")
def landing():
    update_nodes()

    return render_template("index.html", json=json)

if __name__ == "__main__":
    app.run(port=8989, debug=True)
