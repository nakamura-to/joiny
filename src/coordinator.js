import { SignalingChannel } from './signaling';
import { Session } from './session';
import { Local } from './peer';

var navigator: Navigator = window.navigator;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
if (getUserMedia) {
  getUserMedia = getUserMedia.bind(navigator);
} else {
  throw new Error('navigator._getUserMedia is not supported');
}

export class Config {
  // default key
  static KEY = '';

  // default user name
  static NAME = 'unknown';

  // default credential
  static CREDENTIAL = {};

  // default signaling server host
  static HOST = location.host;

  // default path
  static PATH = '';

  // default ice servers
  static ICE_SERVERS = [ {'url': 'stun: stun.l.google.com:19302' } ];

  // default media
  static MEDIA = { video: true, audio: true };

  // default channels
  static CHANNELS: any[] = [];

  // default logger
  static LOGGER = function logger(level, message) {
    console.log('[join][' + level + ']: ' + message); // eslint-disable-line no-console
  };

  key;
  name;
  credential = {};
  host;
  secure = false;
  iceServers = [];
  media = {};
  channels = [];
  logger = null;
}

export class Coordinator {

  _config = null;
  _local = null;
  _signalingChannel = null;
  _session = null;
  _localStream = null;

  constructor(options) {
    var opts = options || {};

    this._config = new Config();
    this._config.name = opts.name || Config.NAME;
    this._config.key = opts.key || Config.KEY;
    this._config.credential = opts.credential || Config.CREDENTIAL;
    this._config.host = opts.host || Config.HOST;
    this._config.path = opts.path || Config.PATH;
    this._config.secure = opts.secure || false;
    this._config.iceServers = opts.iceServers || Config.ICE_SERVERS;
    this._config.media = opts.media || Config.MEDIA;
    this._config.channels = opts.channels || Config.CHANNELS;
    this._config.logger = opts.logger || Config.LOGGER;

    this._local = new Local(this._config.name);
    this._signalingChannel = new SignalingChannel(this._config.host, this._config.path, this._config.secure);
    this._session = new Session(this.local, this._config.logger);
  }

  get local() {
    return this._local;
  }

  on(type, listener) {
    this.local.on(type, listener);
  }

  start() {
    this._initSignalingChannel();
    this._signalingChannel.start();
  }

  close() {
    this.local.close();
  }

  _initSignalingChannel() {
    var local = this.local;

    this._signalingChannel.onopen = () => {
      this._config.logger('debug', 'signalingChannel opened');
      this._signalingChannel.send({
        type: 'subscription',
        key: this._config.key,
        credential: this._config.credential,
        src: local,
        dest: null});
    };

    this._signalingChannel.onsubscription = (signal) => {
      this.local.id = signal.id;
      this.local.signal = signal;
      this._config.logger('debug', 'subscription received: [' + local.id + ']');
      this.local.local();
      this._getUserMedia((stream: any) => {
        this._localStream = stream;
        signal.peers.forEach((peer) => {
          var init = this._initConnection.bind(this);
          var connection = this._session.createConnection(this._createRTCPeerConnection(), this._config.channels, peer, init);
          connection.createOffer();
        });
      });
    };

    this._signalingChannel.onicecandidate = (signal) => {
      this._config.logger('debug', 'icecandidate received: [' + this.local.id + '<-' + signal.src.id + ']');
      var connection = this._session.findConnection(signal.src);
      connection.addIceCandidate(signal.candidate);
    };

    this._signalingChannel.onoffer = (signal) => {
      this._config.logger('debug', 'offer received: [' + local.id + '<-' + signal.src.id + ']');
      var init = this._initConnection.bind(this);
      var connection = this._session.createConnection(this._createRTCPeerConnection(), signal.channels, signal.src, init);
      connection.setRemoteDescription(signal.offer);
      connection.createAnswer();
    };

    this._signalingChannel.onanswer = (signal) => {
      this._config.logger('debug', 'answer received: [' + local.id + '<-' + signal.src.id + ']');
      var connection = this._session.findConnection(signal.src);
      connection.setRemoteDescription(signal.answer);
    };
  }

  _initConnection(connection) {
    var local = connection.local;
    var remote = connection.remote;

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        this._config.logger('debug', 'icecandidate sending: [' + local.id + '->' + remote.id + ']');
        this._signalingChannel.send({
          type: 'icecandidate',
          candidate: event.candidate,
          src: local,
          dest: remote,
        });
      }
    };

    connection.onoffer = (offer) => {
      this._config.logger('debug', 'offer sending: [' + local.id + '->' + remote.id + ']');
      this._signalingChannel.send({
        type: 'offer',
        offer: offer,
        channels: this._config.channels,
        src: local,
        dest: remote,
      });
    };

    connection.onanswer = (answer) => {
      this._config.logger('debug', 'answer sending: [' + local.id + '->' + remote.id + ']');
      this._signalingChannel.send({
        type: 'answer',
        answer: answer,
        src: local,
        dest: remote,
      });
    };

    connection.oniceconnectionstatechange = (event) => {
      var state = event.target.iceConnectionState;
      this._config.logger('debug', 'iceconnectionstatechange: ' + state + ': [' + local.id + '->' + remote.id + ']');
      if (state === 'disconnected' || state === 'failed') {
        remote.close();
      }
    };

    connection.onaddstream = (event) => {
      this._config.logger('debug', 'addstream');
      remote.stream(event.stream);
    };

    connection.onerror = (error) => {
      this._config.logger('error', error);
      remote.close();
    };

    if (this._localStream) {
      connection.addStream(this._localStream);
    }
  }

  _createRTCPeerConnection() {
    return new window.RTCPeerConnection({iceServers: this._config.iceServers});
  }

  _getUserMedia(next) {
    if (this._config.media.video || this._config.media.audio) {
      getUserMedia(
        this._config.media,
        (stream: any) => {
          this.local.stream(stream);
          next(stream);
        },
        (error: Error) => {
          this._config.logger('info', error.name + ': ' + error.message);
          next(null);
        }
      );
    } else {
      next(null);
    }
  }
}
