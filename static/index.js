document.addEventListener('DOMContentLoaded', function() {
    var socket = io.connect('http://' + document.domain + ':' + location.port);
    var username = '';
    var join = false
    var users

    document.getElementById('name').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            username = document.getElementById('name').value;
            if (username) {
                if (Object.keys(users).includes(username)) {
                    alert("This is a user name that already exists.")
                    var nameInput = document.getElementById('name');
                    nameInput.value = "";
                    nameInput.focus();
                } else {
                    socket.emit('join', {name: username});
                    document.getElementById('name-input-container').style.display = 'none';
                    document.getElementById('chat-container').style.display = 'block';
                    join = true
                    document.getElementById('guide-text').style.display = "none";
                    document.getElementById('message').focus();
                }
            } else {
                alert('Please enter your name.');
            }
        }
    });

    document.getElementById('join-btn').onclick = function() {
        username = document.getElementById('name').value;
            if (username) {
                if (Object.keys(users).includes(username)) {
                    alert("This is a user name that already exists.")
                    var nameInput = document.getElementById('name');
                    nameInput.value = "";
                    nameInput.focus();
                } else {
                    socket.emit('join', {name: username});
                    document.getElementById('name-input-container').style.display = 'none';
                    document.getElementById('chat-container').style.display = 'block';
                    join = true
                    document.getElementById('guide-text').style.display = "none";
                    document.getElementById('message').focus();
                }
            } else {
                alert('Please enter your name.');
            }
    };

    socket.on('message', function(msg) {
        if (msg.startsWith("[STATUS]")) {
            msg = msg.slice(8);
            users = JSON.parse(msg.replace(/'/g, '"'))
            var userCount = Object.keys(users).length
            var extraBox = document.querySelector('.extra-box');
            extraBox.innerHTML = `<h4>Joined user: ${userCount}</h4><div id="users"></div>`;
            var usersDiv = document.getElementById('users');
            if (userCount !== 0) {
                Object.entries(users).forEach(([key, value]) => {
                    var userBox = document.createElement('div');
                    userBox.classList.add('user-box');
                    userBox.innerText = `${key}`;
                    usersDiv.appendChild(userBox);
                });
            } else {
                var noneBox = document.createElement('div');
                noneBox.classList.add('none-box');
                noneBox.innerText = "No user is joined";
                usersDiv.appendChild(noneBox);
            }
            extraBox.appendChild(usersDiv)
        } else if (join) {
            var chatBox = document.getElementById('chat');
            var element = document.createElement('div');
            var other = false
            var otherName = ""
            
            if (msg.startsWith("[MSG]")) {
                element.classList.add('message');
                msg = msg.slice(5); 
                if (msg.startsWith(username + ":")) {
                    element.classList.add('me');
                    msg = msg.slice(`${username}: `.length);
                } else {
                    other = true
                    element.classList.add('other');
                    var parts = msg.split(": ");
                    otherName = parts[0];
                    msg = parts[1];
                }
            } else if (msg.startsWith("[JOIN]")) {
                element.classList.add('notification');
                msg = msg.slice(6);
                element.classList.add('noti');
            } else if (msg.startsWith("[LEAVE]")) {
                element.classList.add('notification');
                msg = msg.slice(7);
                element.classList.add('noti');
            }
            
            element.innerText = msg;
            if (other) {
                var box = document.createElement('div');
                box.setAttribute("id", "other-message-box");
                var image = document.createElement('img');
                image.setAttribute("id", "profile-image");
                image.src = "/static/resources/profile.png"
                var message = document.createElement('div');
                message.setAttribute("id", "other-message");
                var name = document.createElement('label');
                name.setAttribute("id", "other-name");
                name.innerText = otherName;
                message.appendChild(name);
                message.appendChild(element);
                box.appendChild(image);
                box.appendChild(message);
                chatBox.appendChild(box);
            } else {
                chatBox.appendChild(element);
            }
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });

    document.getElementById('message').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            var message = document.getElementById('message').value;
            if (username && message) {
                socket.emit("message", {name: username, message: message});                    
                document.getElementById('message').value = '';
            }
        }
    });

    document.getElementById('send-btn').onclick = function() {
        var message = document.getElementById('message').value;
        if (username && message) {
            socket.emit("message", {name: username, message: message});
            document.getElementById('message').value = '';
        }
    };
});