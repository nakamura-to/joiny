module join {
    'use strict';

    export class ChannelBundle {

        private channels: Channel[] = [];
        private emitter = new EventEmitter();

        constructor(private _label: string, private local: Local, private logger: (log: string, message: string) => void) {
        }

        get label(): string {
            return this._label;
        }

        add(channel: Channel) {
            var remote = channel.remote;

            channel.onopen = () => {
                this.logger('debug', 'channel opened: [' + this.label + ': ' + this.local.id + '<->' + remote.id + ']');
                this.emitter.emit('open', {remote: remote});
            };

            channel.onmessage = (event: RTCMessageEvent) => {
                this.logger('debug', 'channel message received: [' + this.label + ': ' + this.local.id + '<-' + remote.id + ']');
                this.emitter.emit('data', {remote: remote, event: event, data: event.data});
            };

            channel.onclose = () => {
                this.logger('debug', 'channel closed: [' + this.label + ': ' + this.local.id + '-x-' + remote.id + ']');
                this.remove(channel);
                this.emitter.emit('close', {remote: channel.remote});
            };

            channel.onerror = (error) => {
                this.logger('debug', 'channel error: [' + this.label + ': ' + this.local.id + '-?-' + remote.id + ']');
                this.remove(channel);
                this.emitter.emit('error', {remote: remote, error: error});
            };

            channel.onsending = () => {
                this.logger('debug', 'channel sending: [' + this.label + ': ' + this.local.id + '->' + remote.id + ']');
            };

            this.channels.push(channel);
        }

        private remove(channel: Channel) {
            var pos = this.channels.indexOf(channel);
            if (pos !== -1) {
                this.channels.splice(pos, 1);
            }
        }

        size() {
            return this.channels.length;
        }

        send(data: string): void ;
        send(data: ArrayBuffer): void;
        send(data: ArrayBufferView): void;
        send(data: Blob): void;
        send(data: any) {
            this.channels.forEach(channel => {
                try {
                    channel.send(data);
                } catch (error) {
                    this.remove(channel);
                    this.emitter.emit('error', {remote: channel.remote, error: error});
                }
            });
        }

        set onclose(listener: () => void) {
            this.on('close', listener);
        }

        on(type: string, listener: () => void) {
            this.emitter.on(type, listener);
        }

        close () {
            this.channels.forEach(channel => channel.close());
            this.channels = [];
            this.emitter.emit('close');
        }
    }
}
