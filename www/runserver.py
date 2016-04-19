"""
This script runs the YoutubeTrends application using a development server.
"""

from os import environ
from YoutubeTrends import app
import argparse

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run local http server')
    parser.add_argument('--server-host', '-sh', type=str, help='Server host')
    parser.add_argument('--server-port', '-sp', type=int, help='Server port')
    args = parser.parse_args()

    print(args.server_port)
    HOST = args.server_host
    PORT = args.server_port
    if HOST is None:
        HOST = environ.get('SERVER_HOST', 'localhost')
    try:
        if PORT is None:
            PORT = int(environ.get('SERVER_PORT', '5555'))
    except ValueError:
        PORT = 5555
    app.debug = True
    app.run(HOST, PORT)
