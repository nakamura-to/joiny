import * as types from '../constants/ActionTypes';
import { createWebRTC } from 'joiny';

function onLocal(dispatch, peer) {
  peer.on('stream', (stream) => {
    dispatch({
      type: types.ON_STREAM_LOCAL,
      peer,
      streamUrl: URL.createObjectURL(stream),
    });
  });
}

function onRemote(dispatch, peer) {
  peer.on('stream', (stream) => {
    dispatch({
      type: types.ON_STREAM_REMOTE,
      peer,
      streamUrl: URL.createObjectURL(stream),
    });
  });
}

function onChatChannel(dispatch, channel) {
  channel.on('open', (e) => {
    dispatch({
      type: types.ON_OPEN_CHAT_CHANNEL,
      peer: e.remote,
      channel,
    });
  });

  channel.on('data', (e) => {
    dispatch({
      type: types.ON_DATA_CHAT_CHANNEL,
      data: e.data,
      peer: e.remote,
    });
  });

  channel.on('close', (e) => {
    dispatch({
      type: types.ON_CLOSE_CHAT_CHANNEL,
      peer: e.remote,
    });
  });

  channel.on('error', (error) => {
    console.log(JSON.stringify(error)); // eslint-disable-line no-console
  });
}

function onFileChannel() {
  // not implemented
}

export function connect(roomKey, userName, makeWebRTC = createWebRTC) {
  const webRTC = makeWebRTC({
    key: roomKey,
    name: userName,
    path: 'chat',
    secure: location.protocol === 'https:',
    media: { video: true, audio: true },
    channels: [
      { chat: { reliable: false } },
      { file: { reliable: true } },
    ],
  });

  return (dispatch) => {
    webRTC.on('local', onLocal.bind(null, dispatch));
    webRTC.on('remote', onRemote.bind(null, dispatch));
    webRTC.on('chat.channel', onChatChannel.bind(null, dispatch));
    webRTC.on('file.channel', onFileChannel.bind(null, dispatch));
    webRTC.start();

    dispatch({
      type: types.CONNECT,
      roomKey,
      userName,
    });
  };
}

export function sendText(text) {
  return (dispatch, getState) => {
    const { chat: { channel } } = getState();
    if (channel) {
      channel.send(text);
    }
    dispatch({
      type: types.SEND_TEXT,
      text,
    });
  };
}
