const net = require('net');

const client = net.createConnection({ port: 8080 });

client.on('data', (data) => {
  process.stdout.write(data);
});

process.stdin.on('data', (data) => {
  client.write(data);
});
