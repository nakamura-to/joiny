module join {
    'use strict';

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

        // default ice servers
        static ICE_SERVERS = [ {'url': 'stun: stun.l.google.com:19302' } ];

        // default media
        static MEDIA = { video: true, audio: true };

        // default channels
        static CHANNELS: any[] = [];

        // default logger
        static LOGGER = function (level: string, message: string) {
            console.log('[join][' + level + ']: ' + message);
        };

        key: string;
        name: string;
        credential: any;
        host: string;
        secure: boolean;
        iceServers: any[];
        media: { video: any; audio: any};
        channels: { [name: string]: any }[];
        logger: (level: string, message: any) => void;
    }

    export class Coordinator {

        private _config: Config;
        private _local: Local;
        private _signalingChannel: SignalingChannel;
        private _session: Session;
        private _localStream: any;

        constructor(options: any) {
            options = options || {};

            this._config = new Config();
            this._config.name = options.name || Config.NAME;
            this._config.key = options.key || Config.KEY;
            this._config.credential = options.credential || Config.CREDENTIAL;
            this._config.host = options.host || Config.HOST;
            this._config.secure = options.secure || false;
            this._config.iceServers = options.iceServers || Config.ICE_SERVERS;
            this._config.media = options.media || Config.MEDIA;
            this._config.channels = options.channels || Config.CHANNELS;
            this._config.logger = options.logger || Config.LOGGER;

            this._local = new Local(this._config.name);
            this._signalingChannel = new SignalingChannel(this._config.host, this._config.secure);
            this._session = new Session(this.local, this._config.logger);
        }

        get local(): Local {
            return this._local;
        }

        on(type: string, listener: (event: any) => void) {
            this.local.on(type, listener);
        }

        start() {
            this._initSignalingChannel();
            this._signalingChannel.start();
        }

        close() {
            this.local.close();
        }

        private _initSignalingChannel() {
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

            this._signalingChannel.onsubscription = (signal: ISubscriptionSignal) => {
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

            this._signalingChannel.onicecandidate = (signal: IIceCandidateSignal) => {
                this._config.logger('debug', 'icecandidate received: [' + this.local.id + '<-' + signal.src.id + ']');
                var connection = this._session.findConnection(signal.src);
                connection.addIceCandidate(signal.candidate);
            };

            this._signalingChannel.onoffer = (signal: IOfferSignal) => {
                this._config.logger('debug', 'offer received: [' + local.id + '<-' + signal.src.id + ']');
                var init = this._initConnection.bind(this);
                var connection = this._session.createConnection(this._createRTCPeerConnection(), signal.channels, signal.src, init);
                connection.setRemoteDescription(signal.offer);
                connection.createAnswer();
            };

            this._signalingChannel.onanswer = (signal: IAnswerSignal) => {
                this._config.logger('debug', 'answer received: [' + local.id + '<-' + signal.src.id + ']');
                var connection = this._session.findConnection(signal.src);
                connection.setRemoteDescription(signal.answer);
            };
        }

        private _initConnection(connection: Connection) {
            var local = connection.local;
            var remote = connection.remote;

            connection.onicecandidate = (event) => {
                if (event.candidate) {
                    this._config.logger('debug', 'icecandidate sending: [' + local.id + '->' + remote.id + ']');
                    this._signalingChannel.send({
                        type: 'icecandidate',
                        candidate: event.candidate,
                        src: local,
                        dest: remote
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
                    dest: remote
                });
            };

            connection.onanswer = (answer) => {
                this._config.logger('debug', 'answer sending: [' + local.id + '->' + remote.id + ']');
                this._signalingChannel.send({
                    type: 'answer',
                    answer: answer,
                    src: local,
                    dest: remote
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

        private _createRTCPeerConnection(): RTCPeerConnection {
            return new RTCPeerConnection({iceServers: this._config.iceServers});
        }

        private _getUserMedia(next: (stream: any) => void) {
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
}
