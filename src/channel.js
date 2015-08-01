import { EventEmitter } from './emitter';

export class Channel {

  _emitter = new EventEmitter();

  constructor(_dataChannel, _remote) {
    this._dataChannel = _dataChannel;
    this._remote = _remote;

    this._dataChannel.onopen = (event) =>
      this._emitter.emit('open', event);

    this._dataChannel.onmessage = (event) =>
      this._emitter.emit('message', event);

    this._dataChannel.onclose = (event) =>
      this._emitter.emit('close', event);

    this._dataChannel.onerror = (event) =>
      this._emitter.emit('error', event);
  }

  get label() {
    return this._dataChannel.label;
  }

  get remote() {
    return this._remote;
  }

  set onopen(listener) {
    this._on('open', listener);
  }

  set onmessage(listener) {
    this._on('message', listener);
  }

  set onclose(listener) {
    this._on('close', listener);
  }

  set onerror(listener) {
    this._on('error', listener);
  }

  set onsending(listener) {
    this._on('sending', listener);
  }

  _on(type, listener) {
    this._emitter.on(type, listener);
  }

  send(data) {
    this._emitter.emit('sending');
    this._dataChannel.send(data);
  }

  close() {
    this._dataChannel.close();
  }
}
