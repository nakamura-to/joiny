Join : Simple Multicast with WebRTC
===================================

Join simplifies WebRTC API and allows you to communicate with multiple peers transparently.

```js
// get a WebRTC object
var webRTC = join.createWebRTC({
    media: { video: true, audio: true }
    channels: [
        { chat: { reliable: false } },
        { file: { reliable: true } }
    ]
});

// get a local peer with the `onLocal` callback
webRTC.on('local', onLocal);

// get a remote peer with the `onRemote` callback
webRTC.on('remote', onRemote);

// get a chat channel bundle with the `onChatChannel` callback
webRTC.on('chat.channel', onChatChannel);

// get a file channel bundle with the `onChatChannel` callback
webRTC.on('file.channel', onFileChannel);

// start communication
webRTC.start();
```

Description
-----------

- written in TypeScript.
- tested on Chrome 36 and Firefox 31.
- uses WebSocket as a signaling channel.
- operates same kind of channels as a bundled channel for transparent multicast.
- detects entering and leaving of remote peers.


Demo : Chat Room
----------------

```shell
$ cd demo
$ npm install
$ node server.js
```

Access `http://localhost:1234` with some browsers.

Push the "Connect" Button on each browser.

Usage
-----

Include dist/join.js into your html file.

```html
<script src="join.js"></script>
```

API
---

see [api.md](api.md).

Build
-----

```shell
$ npm install
$ gulp
```

License
-------

The MIT License
