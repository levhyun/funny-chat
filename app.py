from flask import Flask, render_template, request
from flask_socketio import SocketIO, send
from flask_cors import CORS
from dotenv import load_dotenv
import os

app = Flask(__name__, static_folder="static")
CORS(app)
socketio = SocketIO(app)

users = {}

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    send(f"[STATUS]{users}", broadcast=True)
    print("A user connected")

@socketio.on('disconnect')
def handle_disconnect():
    for name, sid in users.items():
        if sid == request.sid:
            send(f"[STATUS]{users}", broadcast=True)
            send(f"[LEAVE]{name} has left the chat.", broadcast=True)
            del users[name]
            break
    print("A user disconnected")

@socketio.on('join')
def handle_join(data):
    users[data['name']] = request.sid
    send(f"[STATUS]{users}", broadcast=True)
    send(f"[JOIN]{data['name']} has joined the chat.", broadcast=True)

@socketio.on('message')
def handle_message(data):
    name = data['name']
    message = data['message']
    print(f"Message from {name}: {message}")
    send(f"[MSG]{name}: {message}", broadcast=True)

if __name__ == '__main__':
    load_dotenv()
    socketio.run(app, host=os.getenv('IP'), port=os.getenv('PORT'), debug=True)
