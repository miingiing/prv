require('dotenv').config();
const net = require('net');

process.on('uncaughtException', (err) => {
  console.error(err);
});

const remotehost = process.env.REMOTE_HOST;
const remoteport = process.env.REMOTE_PORT;
const password = process.env.REMOTE_PASSWORD;
const localhost = process.env.LOCAL_HOST || '0.0.0.0';
const localport = process.env.local_PORT || 4052;

if (!localhost || !localport || !remotehost || 
    !remoteport || !password) {
  console.error('Error: periksa argumen Anda dan coba lagi!');
  process.exit(1);
}

const server = net.createServer((localsocket) => {
  const remotesocket = new net.Socket();

  remotesocket.connect(remoteport, remotehost, () => {
    console.log('Terhubung ke server remote di %s:%d', remotehost, remoteport);
  });

  localsocket.on('connect', () => {
    console.log('Klien terhubung dari %s:%d', localsocket.remoteAddress, localsocket.remotePort);
  });

  localsocket.pipe(remotesocket).pipe(localsocket);

  localsocket.on('error', (err) => {
    console.error('Kesalahan pada soket lokal: ', err.message);
    remotesocket.destroy();
  });

  remotesocket.on('error', (err) => {
    console.error('Kesalahan pada soket remote: ', err.message);
    localsocket.destroy();
  });

  localsocket.on('close', (hadError) => {
    console.log('Soket lokal ditutup. Kesalahan: ', hadError);
    remotesocket.end();
  });

  remotesocket.on('close', (hadError) => {
    console.log('Soket remote ditutup. Kesalahan: ', hadError);
    localsocket.end();
  });
});

server.listen(localport, localhost, () => {
  console.log('Server mendengarkan di %s:%d', localhost, localport);
  console.log('Mengarahkan ulang koneksi dari %s:%d ke %s:%d', localhost, localport, remotehost, remoteport);
});

