const net = require('net');
const EventEmitter = require('events');
const iconv = require('iconv-lite');

const UserBus = new EventEmitter();
UserBus.count = 0;

class User {
  name = void 0;

  constructor(socket) {
    this.socket = socket;

    UserBus.count++;
    UserBus.on('boardcast', ({ data, target }) => {
      if (!this.name) return;
      if (target === this) return;
      this.socket.write(iconv.encode(data, 'utf-8'));
    });
  }

  close() {
    UserBus.count--;
    this.socket = { write() {} };
  }

  boardcast(data) {
    UserBus.emit('boardcast', { data, target: this });
  }
}

const server = net.createServer((socket) => {
  const user = new User(socket);

  socket.on('data', (data) => {
    const str = iconv.decode(data, 'utf-8');
    const msg = str.replace(/[\r\n|\n]$/, '');

    if (!Boolean(msg)) return;

    if (!user.name) {
      user.name = msg;
      user.boardcast(`> [${msg}] 加入聊天室\n`);
      return;
    }

    user.boardcast(`> [${user.name}]: ${msg}\n`);
  });

  socket.on('end', () => {
    user.boardcast(`> [${user.name}] 离开聊天室\n`);
    user.close();
    console.log(`> [${user.name}] 离开聊天室`);
  });

  socket.write(
    iconv.encode(
      `欢迎加入聊天室, 当前在线人数: ${UserBus.count}!\n请输入你的昵称: `,
      'utf-8'
    )
  );
});

server.listen(8080, () => {
  console.log('listening at http://localhost:8080');
});
