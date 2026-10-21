const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Хранилище сообщений в памяти сервера
let messages = [];

// Раздача статических файлов (index.html)
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('Новое подключение:', socket.id);

  // Отправляем подключившемуся пользователю историю сообщений
  socket.emit('init_messages', messages);

  // Обработка отправки нового сообщения
  socket.on('send_message', (data) => {
    const msg = {
      author: data.author || 'Аноним',
      text: data.text || '',
      ts: Date.now()
    };
    messages.push(msg);

    // Ограничиваем историю 200 сообщениями
    if (messages.length > 200) {
      messages.shift();
    }

    // Рассылаем новое сообщение ВСЕМ подключенным клиентам
    io.emit('new_message', msg);
  });

  // Очистка истории сообщений
  socket.on('clear_messages', () => {
    messages = [];
    io.emit('init_messages', messages);
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});