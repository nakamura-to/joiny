module join {
    'use strict';

    export class Session {

        private _connections: { [id: string]: Connection } = {};
        private _bundles: { [label: string]: ChannelBundle } = {};

        constructor(private _local: Local, private _logger: (log: string, message: string) => void) {
        }

        createConnection(peerConnection: RTCPeerConnection, channelsConfig: any, peer: IPeer, init: any): Connection {
            var local = this._local;
            var remote = new Remote(peer.id, peer.name);
            var connection = new Connection(peerConnection, local, remote);

            this._logger('debug', 'peer connection opend: [' + local.id + '<->' + remote.id + ']');

            init(connection);

            connection.onclose = () => {
                this._logger('debug', 'peer connection closed: [' + local.id + '-x-' + remote.id + ']');
                delete this._connections[connection.remote.id];
            };

            this._connections[connection.remote.id] = connection;

            this._local.remote(connection.remote);
            channelsConfig.forEach((config: any, i: number) => {
                var channel = this.createChannel(connection, config, String(i));
                this.addChannel(channel);
            });
            return connection;
        }

        findConnection(peer: IPeer): Connection {
            if (this._connections[peer.id]) {
                return this._connections[peer.id];
            }
            throw new Error('connection [' + peer.id +'] not found');
        }

        private createChannel(connection: Connection, config: any, id: string) {
            var label = Object.keys(config)[0];
            var option = Object.create(config[label]);
            option.id = id;
            option.negotiated = true;
            return connection.createChannel(label, option);
        }

        private addChannel(channel: Channel) {
            var label = channel.label;
            var bundle = this._bundles[label];

            if (!bundle) {
                bundle = new ChannelBundle(label, this._local, this._logger);
                this._bundles[label] = bundle;
                bundle.onclose = () =>
                    delete this._bundles[label];
                this._local.bundle(bundle);
            }

            bundle.add(channel);
        }
    }
}
