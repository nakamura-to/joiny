JoinyJS - Simple Multicast with WebRTC
=======================================

JoinyJS simplifies WebRTC API and allows you to communicate with multiple peers transparently.

```js
import { createWebRTC } from 'joiny';

// get a WebRTC object
const webRTC = createWebRTC({
    media: { video: true, audio: true }
    channels: [
        { chat: { reliable: false } },
        { file: { reliable: true } }
    ]
});

// get a local peer with a callback
webRTC.on('local', (peer) => { ... });

// get a remote peer with a callback
webRTC.on('remote', (peer) => { ... });

// get a chat channel bundle with a callback
webRTC.on('chat.channel', (channel) => { ... });

// get a file channel bundle with a callback
webRTC.on('file.channel', (channel) => { ... });

// start communication
webRTC.start();
```

Description
-----------

- written in ES6.
- tested on Chrome 44.0.2403.125.
- uses WebSocket as a signaling channel.
- operates same kind of channels as a bundled channel for transparent multicast.
- detects entering and leaving of remote peers.

Example : Chat Room
--------------------

```shell
$ cd examples/chat
$ npm install
$ npm start
```

Access `http://localhost:3000` with some browsers.

Push the "Connect" Button on each browser.

Build
-----

```shell
$ npm install
$ npm run build
```

License
-------

The MIT License
