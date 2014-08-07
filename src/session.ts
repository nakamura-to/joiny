module join {
    'use strict';

    export class Session {

        private connections: { [id: string]: Connection } = {};
        private bundles: { [label: string]: ChannelBundle } = {};

        constructor(private local: Local, private iceServers: any, private logger: (log: string, message: string) => void) {
        }

        createConnection(channelsConfig: any, peer: IPeer, init: any): Connection {
            var local = this.local;
            var remote = new Remote(peer.id, peer.name);
            var connection = new Connection(new RTCPeerConnection({iceServers: this.iceServers}), local, remote);

            this.logger('debug', 'peer connection opend: [' + local.id + '<->' + remote.id + ']');

            init(connection);

            connection.onclose = () => {
                this.logger('debug', 'peer connection closed: [' + local.id + '-x-' + remote.id + ']');
                delete this.connections[connection.remote.id];
            };

            this.connections[connection.remote.id] = connection;

            this.local.remote(connection.remote);
            channelsConfig.forEach((config: any, i: number) => {
                var channel = this.createChannel(connection, config, String(i));
                this.addChannel(channel);
            });
            return connection;
        }

        findConnection(peer: IPeer): Connection {
            if (this.connections[peer.id]) {
                return this.connections[peer.id];
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
            var bundle = this.bundles[label];

            if (!bundle) {
                bundle = new ChannelBundle(label, this.local, this.logger);
                this.bundles[label] = bundle;
                bundle.onclose = () =>
                    delete this.bundles[label];
                this.local.bundle(bundle);
            }

            bundle.add(channel);
        }
    }
}
