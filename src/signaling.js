import { EventEmitter } from './emitter';

export class SignalingChannel {

  _url;
  _webSocket;
  _emitter = new EventEmitter();

  constructor(_host, _path, _secure) {
    this._url = (_secure ? 'wss' : 'ws') + '://' + _host + '/' + _path;
  }

  start() {
    this._webSocket = new window.WebSocket(this._url);

    this._webSocket.onopen = (event) =>
      this._emitter.emit('open', event);

    this._webSocket.onmessage = (event) => {
      var signal: any = JSON.parse(event.data);
      this._emitter.emit(signal.type, signal);
    };
  }

  send(signal) {
    this._webSocket.send(JSON.stringify(signal));
  }

  set onopen(listener) {
    this._on('open', listener);
  }

  set onsubscription(listener) {
    this._on('subscription', listener);
  }

  set onicecandidate(listener) {
    this._on('icecandidate', listener);
  }

  set onoffer(listener) {
    this._on('offer', listener);
  }

  set onanswer(listener) {
    this._on('answer', listener);
  }

  _on(type, listener) {
    this._emitter.on(type, listener);
  }
}
