const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Храним сообщения отдельно для каждой комнаты
const roomMessages = {};

io.on('connection', (socket) => {
    let currentRoom = null;

    socket.on('join_room', ({ name, room }) => {
        currentRoom = room || 'general';
        socket.join(currentRoom);

        if (!roomMessages[currentRoom]) {
            roomMessages[currentRoom] = [];
        }

        // Отправляем историю сообщений только этой комнаты
        socket.emit('init_messages', roomMessages[currentRoom]);
    });

    socket.on('send_message', (data) => {
        if (!currentRoom) return;

        const msgData = {
            author: data.author,
            text: data.text,
            ts: Date.now()
        };

        if (!roomMessages[currentRoom]) {
            roomMessages[currentRoom] = [];
        }
        roomMessages[currentRoom].push(msgData);

        // Отправляем сообщение ТОЛЬКО участникам этой комнаты
        io.to(currentRoom).emit('new_message', msgData);
    });

    socket.on('clear_messages', () => {
        if (currentRoom) {
            roomMessages[currentRoom] = [];
            io.to(currentRoom).emit('init_messages', []);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

socket.on('send_message', (data) => {
        if (!currentRoom) return;

        const msgData = {
            author: data.author,
            text: data.text || "",
            image: data.image || null,
            ts: Date.now()
        };

        if (!roomMessages[currentRoom]) {
            roomMessages[currentRoom] = [];
        }
        roomMessages[currentRoom].push(msgData);

        io.to(currentRoom).emit('new_message', msgData);
    });