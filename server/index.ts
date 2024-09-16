import { Socket, Server } from 'socket.io';

const io = new Server(3000, {
  cors: {
    origin: ['http://localhost:2000']
  }
});

io.on('connection', (socket: Socket) => {
  console.log(socket.id + 'connected');

});

