module join {
    'use strict';

    var navigator: Navigator = window.navigator;
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (getUserMedia) {
        getUserMedia = getUserMedia.bind(navigator);
    } else {
        throw new Error('navigator.getUserMedia is not supported');
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

        private config: Config;
        private _local: Local;
        private signalingChannel: SignalingChannel;
        private session: Session;
        private localStream: any;

        constructor(options: any) {
            options = options || {};

            this.config = new Config();
            this.config.name = options.name || Config.NAME;
            this.config.key = options.key || Config.KEY;
            this.config.credential = options.credential || Config.CREDENTIAL;
            this.config.host = options.host || Config.HOST;
            this.config.secure = options.secure || false;
            this.config.iceServers = options.iceServers || Config.ICE_SERVERS;
            this.config.media = options.media || Config.MEDIA;
            this.config.channels = options.channels || Config.CHANNELS;
            this.config.logger = options.logger || Config.LOGGER;

            this._local = new Local(this.config.name);
            this.signalingChannel = new SignalingChannel(this.config.host, this.config.secure);
            this.session = new Session(this.local, this.config.iceServers, this.config.logger);
        }

        get local(): Local {
            return this._local;
        }

        on(type: string, listener: (event: any) => void) {
            this.local.on(type, listener);
        }

        start() {
            this.initSignalingChannel();
            this.signalingChannel.start();
        }

        close() {
            this.local.close();
        }

        initSignalingChannel() {
            var local = this.local;

            this.signalingChannel.onopen = () => {
                this.config.logger('debug', 'signalingChannel opened');
                this.signalingChannel.send({
                    type: 'subscription',
                    key: this.config.key,
                    credential: this.config.credential,
                    src: local,
                    dest: null});
            };

            this.signalingChannel.onsubscription = (signal: ISubscriptionSignal) => {
                this.local.id = signal.id;
                this.local.signal = signal;
                this.config.logger('debug', 'subscription received: [' + local.id + ']');
                this.local.local();
                this.getUserMedia((stream: any) => {
                    this.localStream = stream;
                    signal.peers.forEach((peer) => {
                        var init = this.initConnection.bind(this);
                        var connection = this.session.createConnection(this.config.channels, peer, init);
                        connection.createOffer();
                    });
                });
            };

            this.signalingChannel.onicecandidate = (signal: IIceCandidateSignal) => {
                this.config.logger('debug', 'icecandidate received: [' + this.local.id + '<-' + signal.src.id + ']');
                var connection = this.session.findConnection(signal.src);
                connection.addIceCandidate(signal.candidate);
            };

            this.signalingChannel.onoffer = (signal: IOfferSignal) => {
                this.config.logger('debug', 'offer received: [' + local.id + '<-' + signal.src.id + ']');
                var init = this.initConnection.bind(this);
                var connection = this.session.createConnection(signal.channels, signal.src, init);
                connection.setRemoteDescription(signal.offer);
                connection.createAnswer();
            };

            this.signalingChannel.onanswer = (signal: IAnswerSignal) => {
                this.config.logger('debug', 'answer received: [' + local.id + '<-' + signal.src.id + ']');
                var connection = this.session.findConnection(signal.src);
                connection.setRemoteDescription(signal.answer);
            };
        }

        initConnection(connection: Connection) {
            var local = connection.local;
            var remote = connection.remote;

            connection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.config.logger('debug', 'icecandidate seding: [' + local.id + '->' + remote.id + ']');
                    this.signalingChannel.send({
                        type: 'icecandidate',
                        candidate: event.candidate,
                        src: local,
                        dest: remote
                    });
                }
            };

            connection.onoffer = (offer) => {
                this.config.logger('debug', 'offer sending: [' + local.id + '->' + remote.id + ']');
                this.signalingChannel.send({
                    type: 'offer',
                    offer: offer,
                    channels: this.config.channels,
                    src: local,
                    dest: remote
                });
            };

            connection.onanswer = (answer) => {
                this.config.logger('debug', 'answer sending: [' + local.id + '->' + remote.id + ']');
                this.signalingChannel.send({
                    type: 'answer',
                    answer: answer,
                    src: local,
                    dest: remote
                });
            };

            connection.oniceconnectionstatechange = (event) => {
                var state = event.target.iceConnectionState;
                this.config.logger('debug', 'iceconnectionstatechange: ' + state + ': [' + local.id + '->' + remote.id + ']');
                if (state === 'disconnected' || state === 'failed') {
                    remote.close();
                }
            };

            connection.onaddstream = (event) => {
                this.config.logger('debug', 'addstream');
                remote.stream(event.stream);
            };

            connection.onerror = (error) => {
                this.config.logger('error', error);
                remote.close();
            };

            if (this.localStream) {
                connection.addStream(this.localStream);
            }
        }

        getUserMedia(next: (stream: any) => void) {
            if (this.config.media.video || this.config.media.audio) {
                getUserMedia(
                    this.config.media,
                    (stream: any) => {
                        this.local.stream(stream);
                        next(stream);
                    },
                    (error: Error) => {
                        this.config.logger('info', error.name + ': ' + error.message);
                        next(null);
                    }
                );
            } else {
                next(null);
            }
        }
    }
}
