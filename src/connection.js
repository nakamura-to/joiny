import { EventEmitter } from './emitter';
import { Channel } from './channel';

export class Connection {

  _emitter = new EventEmitter();

  constructor(_peerConnection, _local, _remote) {
    this._peerConnection = _peerConnection;
    this._local = _local;
    this._remote = _remote;
    this._peerConnection.onicecandidate = (event) =>
        this._emitter.emit('icecandidate', event);

    this._peerConnection.oniceconnectionstatechange = (event) =>
        this._emitter.emit('iceconnectionstatechange', event);

    this._peerConnection.onnegotiationneeded = (event) =>
        this._emitter.emit('negotiationneeded', event);

    this._peerConnection.onaddstream = (event) =>
        this._emitter.emit('addstream', event);

    this._local.onclose = () => this.close();
    this._remote.onclose = () => this.close();
  }

  get local() {
    return this._local;
  }

  get remote() {
    return this._remote;
  }

  set onicecandidate(listener) {
    this._emitter.on('icecandidate', listener);
  }

  set onoffer(listener) {
    this._emitter.on('offer', listener);
  }

  set onanswer(listener) {
    this._emitter.on('answer', listener);
  }

  set oniceconnectionstatechange(listener) {
    this._emitter.on('iceconnectionstatechange', listener);
  }

  set onaddstream(listener) {
    this._emitter.on('addstream', listener);
  }

  set onclose(listener) {
    this._emitter.on('close', listener);
  }

  set onerror(listener) {
    this._emitter.on('error', listener);
  }

  createOffer() {
    this._peerConnection.createOffer(
      (offer: RTCSessionDescription) => {
        this._peerConnection.setLocalDescription(offer);
        this._emitter.emit('offer', offer);
      },
      (error: DOMError) =>
        this._emitter.emit('error', error)
    );
  }

  createAnswer() {
    this._peerConnection.createAnswer(
      (answer) => {
        this._peerConnection.setLocalDescription(answer);
        this._emitter.emit('answer', answer);
      },
      (error) =>
        this._emitter.emit('error', error)
    );
  }

  addIceCandidate(candidate) {
    this._peerConnection.addIceCandidate(new window.RTCIceCandidate(candidate));
  }

  setRemoteDescription(sdp) {
    this._peerConnection.setRemoteDescription(
      new window.RTCSessionDescription(sdp),
      () => {}, // do nothing
      (error: DOMError) =>
        this._emitter.emit('error', error)
    );
  }

  createChannel(label, options) {
    var dataChannel = this._peerConnection.createDataChannel(label, options);
    return new Channel(dataChannel, this.remote);
  }

  addStream(stream) {
    this._peerConnection.addStream(stream);
  }

  close() {
    this._peerConnection.close();
    this._emitter.emit('close');
  }
}
