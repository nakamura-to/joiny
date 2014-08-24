var join;
(function (join) {
    'use strict';

    var ChannelBundle = (function () {
        function ChannelBundle(_label, _local, _logger) {
            this._label = _label;
            this._local = _local;
            this._logger = _logger;
            this._channels = [];
            this._emitter = new join.EventEmitter();
        }
        Object.defineProperty(ChannelBundle.prototype, "label", {
            get: function () {
                return this._label;
            },
            enumerable: true,
            configurable: true
        });

        ChannelBundle.prototype.add = function (channel) {
            var _this = this;
            var remote = channel.remote;

            channel.onopen = function () {
                _this._logger('debug', 'channel opened: [' + _this.label + ': ' + _this._local.id + '<->' + remote.id + ']');
                _this._emitter.emit('open', { remote: remote });
            };

            channel.onmessage = function (event) {
                _this._logger('debug', 'channel message received: [' + _this.label + ': ' + _this._local.id + '<-' + remote.id + ']');
                _this._emitter.emit('data', { remote: remote, event: event, data: event.data });
            };

            channel.onclose = function () {
                _this._logger('debug', 'channel closed: [' + _this.label + ': ' + _this._local.id + '-x-' + remote.id + ']');
                _this._remove(channel);
                _this._emitter.emit('close', { remote: channel.remote });
            };

            channel.onerror = function (error) {
                _this._logger('debug', 'channel error: [' + _this.label + ': ' + _this._local.id + '-?-' + remote.id + ']');
                _this._remove(channel);
                _this._emitter.emit('error', { remote: remote, error: error });
            };

            channel.onsending = function () {
                _this._logger('debug', 'channel sending: [' + _this.label + ': ' + _this._local.id + '->' + remote.id + ']');
            };

            this._channels.push(channel);
        };

        ChannelBundle.prototype._remove = function (channel) {
            var pos = this._channels.indexOf(channel);
            if (pos !== -1) {
                this._channels.splice(pos, 1);
            }
        };

        ChannelBundle.prototype.size = function () {
            return this._channels.length;
        };

        ChannelBundle.prototype.send = function (data) {
            var _this = this;
            this._channels.forEach(function (channel) {
                try  {
                    channel.send(data);
                } catch (error) {
                    _this._remove(channel);
                    _this._emitter.emit('error', { remote: channel.remote, error: error });
                }
            });
        };

        Object.defineProperty(ChannelBundle.prototype, "onclose", {
            set: function (listener) {
                this.on('close', listener);
            },
            enumerable: true,
            configurable: true
        });

        ChannelBundle.prototype.on = function (type, listener) {
            this._emitter.on(type, listener);
        };

        ChannelBundle.prototype.close = function () {
            this._channels.forEach(function (channel) {
                return channel.close();
            });
            this._channels = [];
            this._emitter.emit('close');
        };
        return ChannelBundle;
    })();
    join.ChannelBundle = ChannelBundle;
})(join || (join = {}));
var join;
(function (join) {
    'use strict';

    var Channel = (function () {
        function Channel(_dataChannel, _remote) {
            var _this = this;
            this._dataChannel = _dataChannel;
            this._remote = _remote;
            this._emitter = new join.EventEmitter();
            this._dataChannel.onopen = function (event) {
                return _this._emitter.emit('open', event);
            };

            this._dataChannel.onmessage = function (event) {
                return _this._emitter.emit('message', event);
            };

            this._dataChannel.onclose = function (event) {
                return _this._emitter.emit('close', event);
            };

            this._dataChannel.onerror = function (event) {
                return _this._emitter.emit('error', event);
            };
        }
        Object.defineProperty(Channel.prototype, "label", {
            get: function () {
                return this._dataChannel.label;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Channel.prototype, "remote", {
            get: function () {
                return this._remote;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Channel.prototype, "onopen", {
            set: function (listener) {
                this._on('open', listener);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Channel.prototype, "onmessage", {
            set: function (listener) {
                this._on('message', listener);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Channel.prototype, "onclose", {
            set: function (listener) {
                this._on('close', listener);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Channel.prototype, "onerror", {
            set: function (listener) {
                this._on('error', listener);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Channel.prototype, "onsending", {
            set: function (listener) {
                this._on('sending', listener);
            },
            enumerable: true,
            configurable: true
        });

        Channel.prototype._on = function (type, listener) {
            this._emitter.on(type, listener);
        };

        Channel.prototype.send = function (data) {
            this._emitter.emit('sending');
            this._dataChannel.send(data);
        };

        Channel.prototype.close = function () {
            this._dataChannel.close();
        };
        return Channel;
    })();
    join.Channel = Channel;
})(join || (join = {}));
var join;
(function (join) {
    'use strict';

    var Connection = (function () {
        function Connection(_peerConnection, _local, _remote) {
            var _this = this;
            this._peerConnection = _peerConnection;
            this._local = _local;
            this._remote = _remote;
            this._emitter = new join.EventEmitter();
            this._peerConnection.onicecandidate = function (event) {
                return _this._emitter.emit('icecandidate', event);
            };

            this._peerConnection.oniceconnectionstatechange = function (event) {
                return _this._emitter.emit('iceconnectionstatechange', event);
            };

            this._peerConnection.onnegotiationneeded = function (event) {
                return _this._emitter.emit('negotiationneeded', event);
            };

            this._peerConnection.onaddstream = function (event) {
                return _this._emitter.emit('addstream', event);
            };

            this._local.onclose = function () {
                return _this.close();
            };
            this._remote.onclose = function () {
                return _this.close();
            };
        }
        Object.defineProperty(Connection.prototype, "local", {
            get: function () {
                return this._local;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Connection.prototype, "remote", {
            get: function () {
                return this._remote;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Connection.prototype, "onicecandidate", {
            set: function (listener) {
                this._emitter.on('icecandidate', listener);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Connection.prototype, "onoffer", {
            set: function (listener) {
                this._emitter.on('offer', listener);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Connection.prototype, "onanswer", {
            set: function (listener) {
                this._emitter.on('answer', listener);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Connection.prototype, "oniceconnectionstatechange", {
            set: function (listener) {
                this._emitter.on('iceconnectionstatechange', listener);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Connection.prototype, "onaddstream", {
            set: function (listener) {
                this._emitter.on('addstream', listener);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Connection.prototype, "onclose", {
            set: function (listener) {
                this._emitter.on('close', listener);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Connection.prototype, "onerror", {
            set: function (listener) {
                this._emitter.on('error', listener);
            },
            enumerable: true,
            configurable: true
        });

        Connection.prototype.createOffer = function () {
            var _this = this;
            this._peerConnection.createOffer(function (offer) {
                _this._peerConnection.setLocalDescription(offer);
                _this._emitter.emit('offer', offer);
            }, function (error) {
                return _this._emitter.emit('error', error);
            });
        };

        Connection.prototype.createAnswer = function () {
            var _this = this;
            this._peerConnection.createAnswer(function (answer) {
                _this._peerConnection.setLocalDescription(answer);
                _this._emitter.emit('answer', answer);
            }, function (error) {
                return _this._emitter.emit('error', error);
            });
        };

        Connection.prototype.addIceCandidate = function (candidate) {
            this._peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        };

        Connection.prototype.setRemoteDescription = function (sdp) {
            var _this = this;
            this._peerConnection.setRemoteDescription(new RTCSessionDescription(sdp), function () {
            }, function (error) {
                return _this._emitter.emit('error', error);
            });
        };

        Connection.prototype.createChannel = function (label, options) {
            var dataChannel = this._peerConnection.createDataChannel(label, options);
            return new join.Channel(dataChannel, this.remote);
        };

        Connection.prototype.addStream = function (stream) {
            this._peerConnection.addStream(stream);
        };

        Connection.prototype.close = function () {
            this._peerConnection.close();
            this._emitter.emit('close');
        };
        return Connection;
    })();
    join.Connection = Connection;
})(join || (join = {}));
var join;
(function (join) {
    'use strict';

    var navigator = window.navigator;
    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (getUserMedia) {
        getUserMedia = getUserMedia.bind(navigator);
    } else {
        throw new Error('navigator._getUserMedia is not supported');
    }

    var Config = (function () {
        function Config() {
        }
        Config.KEY = '';

        Config.NAME = 'unknown';

        Config.CREDENTIAL = {};

        Config.HOST = location.host;

        Config.ICE_SERVERS = [{ 'url': 'stun: stun.l.google.com:19302' }];

        Config.MEDIA = { video: true, audio: true };

        Config.CHANNELS = [];

        Config.LOGGER = function (level, message) {
            console.log('[join][' + level + ']: ' + message);
        };
        return Config;
    })();
    join.Config = Config;

    var Coordinator = (function () {
        function Coordinator(options) {
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

            this._local = new join.Local(this._config.name);
            this._signalingChannel = new join.SignalingChannel(this._config.host, this._config.secure);
            this._session = new join.Session(this.local, this._config.logger);
        }
        Object.defineProperty(Coordinator.prototype, "local", {
            get: function () {
                return this._local;
            },
            enumerable: true,
            configurable: true
        });

        Coordinator.prototype.on = function (type, listener) {
            this.local.on(type, listener);
        };

        Coordinator.prototype.start = function () {
            this._initSignalingChannel();
            this._signalingChannel.start();
        };

        Coordinator.prototype.close = function () {
            this.local.close();
        };

        Coordinator.prototype._initSignalingChannel = function () {
            var _this = this;
            var local = this.local;

            this._signalingChannel.onopen = function () {
                _this._config.logger('debug', 'signalingChannel opened');
                _this._signalingChannel.send({
                    type: 'subscription',
                    key: _this._config.key,
                    credential: _this._config.credential,
                    src: local,
                    dest: null });
            };

            this._signalingChannel.onsubscription = function (signal) {
                _this.local.id = signal.id;
                _this.local.signal = signal;
                _this._config.logger('debug', 'subscription received: [' + local.id + ']');
                _this.local.local();
                _this._getUserMedia(function (stream) {
                    _this._localStream = stream;
                    signal.peers.forEach(function (peer) {
                        var init = _this._initConnection.bind(_this);
                        var connection = _this._session.createConnection(_this._createRTCPeerConnection(), _this._config.channels, peer, init);
                        connection.createOffer();
                    });
                });
            };

            this._signalingChannel.onicecandidate = function (signal) {
                _this._config.logger('debug', 'icecandidate received: [' + _this.local.id + '<-' + signal.src.id + ']');
                var connection = _this._session.findConnection(signal.src);
                connection.addIceCandidate(signal.candidate);
            };

            this._signalingChannel.onoffer = function (signal) {
                _this._config.logger('debug', 'offer received: [' + local.id + '<-' + signal.src.id + ']');
                var init = _this._initConnection.bind(_this);
                var connection = _this._session.createConnection(_this._createRTCPeerConnection(), signal.channels, signal.src, init);
                connection.setRemoteDescription(signal.offer);
                connection.createAnswer();
            };

            this._signalingChannel.onanswer = function (signal) {
                _this._config.logger('debug', 'answer received: [' + local.id + '<-' + signal.src.id + ']');
                var connection = _this._session.findConnection(signal.src);
                connection.setRemoteDescription(signal.answer);
            };
        };

        Coordinator.prototype._initConnection = function (connection) {
            var _this = this;
            var local = connection.local;
            var remote = connection.remote;

            connection.onicecandidate = function (event) {
                if (event.candidate) {
                    _this._config.logger('debug', 'icecandidate sending: [' + local.id + '->' + remote.id + ']');
                    _this._signalingChannel.send({
                        type: 'icecandidate',
                        candidate: event.candidate,
                        src: local,
                        dest: remote
                    });
                }
            };

            connection.onoffer = function (offer) {
                _this._config.logger('debug', 'offer sending: [' + local.id + '->' + remote.id + ']');
                _this._signalingChannel.send({
                    type: 'offer',
                    offer: offer,
                    channels: _this._config.channels,
                    src: local,
                    dest: remote
                });
            };

            connection.onanswer = function (answer) {
                _this._config.logger('debug', 'answer sending: [' + local.id + '->' + remote.id + ']');
                _this._signalingChannel.send({
                    type: 'answer',
                    answer: answer,
                    src: local,
                    dest: remote
                });
            };

            connection.oniceconnectionstatechange = function (event) {
                var state = event.target.iceConnectionState;
                _this._config.logger('debug', 'iceconnectionstatechange: ' + state + ': [' + local.id + '->' + remote.id + ']');
                if (state === 'disconnected' || state === 'failed') {
                    remote.close();
                }
            };

            connection.onaddstream = function (event) {
                _this._config.logger('debug', 'addstream');
                remote.stream(event.stream);
            };

            connection.onerror = function (error) {
                _this._config.logger('error', error);
                remote.close();
            };

            if (this._localStream) {
                connection.addStream(this._localStream);
            }
        };

        Coordinator.prototype._createRTCPeerConnection = function () {
            return new RTCPeerConnection({ iceServers: this._config.iceServers });
        };

        Coordinator.prototype._getUserMedia = function (next) {
            var _this = this;
            if (this._config.media.video || this._config.media.audio) {
                getUserMedia(this._config.media, function (stream) {
                    _this.local.stream(stream);
                    next(stream);
                }, function (error) {
                    _this._config.logger('info', error.name + ': ' + error.message);
                    next(null);
                });
            } else {
                next(null);
            }
        };
        return Coordinator;
    })();
    join.Coordinator = Coordinator;
})(join || (join = {}));
var join;
(function (join) {
    'use strict';

    var EventEmitter = (function () {
        function EventEmitter() {
            this.events = {};
        }
        EventEmitter.prototype.on = function (type, listener) {
            if (this.events[type]) {
                this.events[type].push(listener);
            } else {
                this.events[type] = [listener];
            }
        };

        EventEmitter.prototype.emit = function (type) {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            var listeners = this.events[type] || [];
            listeners.forEach(function (listener) {
                return listener.apply(_this, args);
            });
        };
        return EventEmitter;
    })();
    join.EventEmitter = EventEmitter;
})(join || (join = {}));
window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

var join;
(function (join) {
    'use strict';

    var Local = (function () {
        function Local(name) {
            this._emitter = new join.EventEmitter();
            this.name = name;
        }
        Object.defineProperty(Local.prototype, "onclose", {
            set: function (listener) {
                this._emitter.on('close', listener);
            },
            enumerable: true,
            configurable: true
        });

        Local.prototype.on = function (type, listener) {
            this._emitter.on(type, listener);
        };

        Local.prototype.local = function () {
            this._emitter.emit('local', this);
        };

        Local.prototype.remote = function (remote) {
            this._emitter.emit('remote', remote);
        };

        Local.prototype.stream = function (stream) {
            this._emitter.emit('stream', stream);
        };

        Local.prototype.bundle = function (bundle) {
            this._emitter.emit(bundle.label + '.channel', bundle);
        };

        Local.prototype.close = function () {
            this._emitter.emit("close");
        };
        return Local;
    })();
    join.Local = Local;

    var Remote = (function () {
        function Remote(id, name) {
            this.id = id;
            this.name = name;
            this._emitter = new join.EventEmitter();
        }
        Object.defineProperty(Remote.prototype, "onclose", {
            set: function (listener) {
                this._emitter.on('close', listener);
            },
            enumerable: true,
            configurable: true
        });

        Remote.prototype.on = function (type, listener) {
            this._emitter.on(type, listener);
        };

        Remote.prototype.stream = function (stream) {
            this._emitter.emit('stream', stream);
        };

        Remote.prototype.close = function () {
            this._emitter.emit("close");
        };
        return Remote;
    })();
    join.Remote = Remote;
})(join || (join = {}));
var join;
(function (join) {
    'use strict';

    var Session = (function () {
        function Session(_local, _logger) {
            this._local = _local;
            this._logger = _logger;
            this._connections = {};
            this._bundles = {};
        }
        Session.prototype.createConnection = function (peerConnection, channelsConfig, peer, init) {
            var _this = this;
            var local = this._local;
            var remote = new join.Remote(peer.id, peer.name);
            var connection = new join.Connection(peerConnection, local, remote);

            this._logger('debug', 'peer connection opend: [' + local.id + '<->' + remote.id + ']');

            init(connection);

            connection.onclose = function () {
                _this._logger('debug', 'peer connection closed: [' + local.id + '-x-' + remote.id + ']');
                delete _this._connections[connection.remote.id];
            };

            this._connections[connection.remote.id] = connection;

            this._local.remote(connection.remote);
            channelsConfig.forEach(function (config, i) {
                var channel = _this.createChannel(connection, config, String(i));
                _this.addChannel(channel);
            });
            return connection;
        };

        Session.prototype.findConnection = function (peer) {
            if (this._connections[peer.id]) {
                return this._connections[peer.id];
            }
            throw new Error('connection [' + peer.id + '] not found');
        };

        Session.prototype.createChannel = function (connection, config, id) {
            var label = Object.keys(config)[0];
            var option = Object.create(config[label]);
            option.id = id;
            option.negotiated = true;
            return connection.createChannel(label, option);
        };

        Session.prototype.addChannel = function (channel) {
            var _this = this;
            var label = channel.label;
            var bundle = this._bundles[label];

            if (!bundle) {
                bundle = new join.ChannelBundle(label, this._local, this._logger);
                this._bundles[label] = bundle;
                bundle.onclose = function () {
                    return delete _this._bundles[label];
                };
                this._local.bundle(bundle);
            }

            bundle.add(channel);
        };
        return Session;
    })();
    join.Session = Session;
})(join || (join = {}));
var join;
(function (join) {
    'use strict';

    var SignalingChannel = (function () {
        function SignalingChannel(_host, _secure) {
            this._emitter = new join.EventEmitter();
            this._url = (_secure ? 'wss' : 'ws') + '://' + _host;
        }
        SignalingChannel.prototype.start = function () {
            var _this = this;
            this._webSocket = new WebSocket(this._url);

            this._webSocket.onopen = function (event) {
                return _this._emitter.emit('open', event);
            };

            this._webSocket.onmessage = function (event) {
                var signal = JSON.parse(event.data);
                _this._emitter.emit(signal.type, signal);
            };
        };

        SignalingChannel.prototype.send = function (signal) {
            this._webSocket.send(JSON.stringify(signal));
        };

        Object.defineProperty(SignalingChannel.prototype, "onopen", {
            set: function (listener) {
                this._on('open', listener);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SignalingChannel.prototype, "onsubscription", {
            set: function (listener) {
                this._on('subscription', listener);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SignalingChannel.prototype, "onicecandidate", {
            set: function (listener) {
                this._on('icecandidate', listener);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SignalingChannel.prototype, "onoffer", {
            set: function (listener) {
                this._on('offer', listener);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SignalingChannel.prototype, "onanswer", {
            set: function (listener) {
                this._on('answer', listener);
            },
            enumerable: true,
            configurable: true
        });

        SignalingChannel.prototype._on = function (type, listener) {
            this._emitter.on(type, listener);
        };
        return SignalingChannel;
    })();
    join.SignalingChannel = SignalingChannel;
})(join || (join = {}));
var join;
(function (join) {
    'use strict';

    var WebRTC = (function () {
        function WebRTC(coordinator) {
            this.coordinator = coordinator;
        }
        WebRTC.prototype.on = function (type, listener) {
            this.coordinator.on(type, listener);
        };

        WebRTC.prototype.start = function () {
            this.coordinator.start();
        };

        WebRTC.prototype.close = function () {
            this.coordinator.close();
        };
        return WebRTC;
    })();
    join.WebRTC = WebRTC;

    function createWebRTC(options) {
        var coordinator = new join.Coordinator(options);
        return new WebRTC(coordinator);
    }
    join.createWebRTC = createWebRTC;
})(join || (join = {}));
///<reference path="../typings/tsd.d.ts" />
///<reference path="extension.ts" />
///<reference path="emitter.ts" />
///<reference path="peer.ts" />
///<reference path="bundle.ts" />
///<reference path="channel.ts" />
///<reference path="connection.ts" />
///<reference path="session.ts" />
///<reference path="signaling.ts" />
///<reference path="coordinator.ts" />
///<reference path="webrtc.ts" />
