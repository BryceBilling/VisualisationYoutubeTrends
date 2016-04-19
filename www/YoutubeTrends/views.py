"""
Routes and views for the flask application.
"""

from flask import redirect, url_for
from YoutubeTrends import app


@app.route('/')
@app.route('/home')
def home():
    """Renders the home page."""
    return redirect(url_for('static', filename='index.html'))
