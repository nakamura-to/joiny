Join API
========

Join API is highly event-based.

join
----

`join` module provides an entry point to create a WebRTC object.

### Events

N/A

### Methods

#### createWebRTC(options?: join.Options): join.WebRTC

Creates a WebRTC object.

```js
var webRTC = join.createWebRTC({
  media: { video: false, audio: false }
  channels: [
      { chat: { reliable: false } },
      { file: { reliable: true } }
  ]
});
```

### Properties

N/A

join.Options
------------

Options class represents options to create a WebRTC object.

### Events

N/A

### Methods

N/A

### Properties

#### key?: string;

A key to identify a multicast group.

default: ''

#### name?: string;

A name for a local peer.

default: ''

#### credential?: any;

A credential for a signaling server.

default: {}

#### host?: string;

A host for a signaling server.

default: same as a web server

#### secure?: boolean;

Whether a signaling channel is secured or not.

default: false

#### iceServers?: any[];

Ice server configurations.

default: [ {'url': 'stun: stun.l.google.com:19302' } ]

#### media?: { video: any; audio: any};

Media stream configurations.

If both video and audio are falsy, any `stream` events are not fired.

default: { video: true, audio: true }

#### channels?: { [name: string]: any }[];

Data channel configuration.

The `name` is very important.  
It is used as a prefix of `xxx.channel` event name in `join.WebRTC`.

default: []

#### logger?: (log: string, message: string) => void;

Logger implementation.

default: console.log

join.WebRTC
-----------

WebRTC class represents simplified WebRTC API.

### Events

#### local

Fired when a local peer is available.

The listener receive a `join.Local` object.

```js
webRTC.on('local', function (local) {
  ...
});
```

#### remote

Fired when a remote peer is available.

The listener receive a `join.Remote` object.

```js
webRTC.on('remote', function (remote) {
  ...
});
```

### xxx.channel

Fired when a specific channel bundle is available.

`xxx` means the channel name.  
The name is specified when a WebRTC object is created with options.

The listener receive a `join.ChannelBundle` object.

```js
webRTC.on('chat.channel', function (channel) {
  ...
});
```

### Methods
#### start(): void

Starts communication.  

```js
webRTC.start();
```

### Properties

N/A

join.Local
----------

Local class represents a local peer.

### Events

#### stream

Fired when a local stream is available.

The listener receive a media stream object.

```js
webRTC.on('local', function (local) {
  local.on('stream', function (stream) {
    ...
  });
});
```

### Methods

#### close(): void

Closes the local peer.

```js
webRTC.on('local', function (local) {
  ...
  local.close();
});
```

### Properties

#### id: string

A peer identifier.  
This is assigned by a signaling server.

#### name: string

A peer name.
This is specified when a WebRTC object is created with options.

join.Remote
-----------

Remote class reprsents a remote peer.

### Events

#### stream

Fired when a remote stream is available.

The listener receive a media stream object.

```js
webRTC.on('remote', function (remote) {
  remote.on('stream', function (stream) {
    ...
  });
});
```

### Methods

#### close(): void

Closes the remote peer.

```js
webRTC.on('remote', function (remote) {
  ...
  remote.close();
});
```

### Properties

#### id: string

A peer identifier.  
This is assigned by a signaling server.

#### name: string

A peer name.  
This is specified when a WebRTC object is created with options.

join.ChannelBundle
------------------

ChannelBundle represents a bundle of same kind of channels.

### Events

#### open

Fired when a channel of bundle is available.  
The listener receive an object which contains a `join.Remote` object.

```js
webRTC.on('chat.channel', function onChatChannel(channel) {
  channel.on('open', function (event) {
    var remote = e.remote; // remote peer
    ...
  });
});
```

#### data

Fired when data are received from a remote peer.  
The listener receive an object which contains
a `join.Remote` object and a data object.

```js
webRTC.on('chat.channel', function onChatChannel(channel) {
  channel.on('data', function (event) {
    var remote = e.remote; // remote peer
    var data = e.data;     // received data
    ...
  });
});
```

#### close

Fired when a channel of bundle is unavailable.  
The listener receive an object which contains a `join.Remote` object.

```js
webRTC.on('chat.channel', function onChatChannel(channel) {
  channel.on('close', function (event) {
    var remote = e.remote; // remote peer
    ...
  });
});
```

#### error

Fired when data sending is failed.  
The listener receive an object which contains
a `join.Remote` object and an error object.


```js
webRTC.on('chat.channel', function onChatChannel(channel) {
  channel.on('error', function (event) {
    var remote = e.remote; // remote peer
    var error = e.error;   // error object throw from RTCDataChannel#send
    ...
  });
});
```

### Methods

#### send(data): void

Sends data to all remote peers through the bundle of channels.

```js
webRTC.on('chat.channel', function onChatChannel(channel) {
  ...
  channel.send('Hello');
});
```

#### close(): void

Close the bundle of channels.

```js
webRTC.on('chat.channel', function onChatChannel(channel) {
  ...
  channel.close();
});
```

### Properties

N/A
