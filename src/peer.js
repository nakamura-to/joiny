import { EventEmitter } from './emitter';

export class Local {

  name;
  id;
  signal;
  _emitter = new EventEmitter();

  constructor(name) {
    this.name = name;
  }

  set onclose(listener) {
    this._emitter.on('close', listener);
  }

  on(type, listener) {
    this._emitter.on(type, listener);
  }

  local() {
    this._emitter.emit('local', this);
  }

  remote(remote) {
    this._emitter.emit('remote', remote);
  }

  stream(stream) {
    this._emitter.emit('stream', stream);
  }

  bundle(bundle) {
    this._emitter.emit(bundle.label + '.channel', bundle);
  }

  close() {
    this._emitter.emit('close');
  }
}

export class Remote {

  _emitter = new EventEmitter();

  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  set onclose(listener) {
    this._emitter.on('close', listener);
  }

  on(type, listener) {
    this._emitter.on(type, listener);
  }

  stream(stream) {
    this._emitter.emit('stream', stream);
  }

  close() {
    this._emitter.emit('close');
  }
}
