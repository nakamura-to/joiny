module join {
    'use strict';

    export class ChannelBundle {

        private _channels: Channel[] = [];
        private _emitter = new EventEmitter();

        constructor(private _label: string, private _local: Local, private _logger: (log: string, message: string) => void) {
        }

        get label(): string {
            return this._label;
        }

        add(channel: Channel) {
            var remote = channel.remote;

            channel.onopen = () => {
                this._logger('debug', 'channel opened: [' + this.label + ': ' + this._local.id + '<->' + remote.id + ']');
                this._emitter.emit('open', {remote: remote});
            };

            channel.onmessage = (event: RTCMessageEvent) => {
                this._logger('debug', 'channel message received: [' + this.label + ': ' + this._local.id + '<-' + remote.id + ']');
                this._emitter.emit('data', {remote: remote, event: event, data: event.data});
            };

            channel.onclose = () => {
                this._logger('debug', 'channel closed: [' + this.label + ': ' + this._local.id + '-x-' + remote.id + ']');
                this._remove(channel);
                this._emitter.emit('close', {remote: channel.remote});
            };

            channel.onerror = (error) => {
                this._logger('debug', 'channel error: [' + this.label + ': ' + this._local.id + '-?-' + remote.id + ']');
                this._remove(channel);
                this._emitter.emit('error', {remote: remote, error: error});
            };

            channel.onsending = () => {
                this._logger('debug', 'channel sending: [' + this.label + ': ' + this._local.id + '->' + remote.id + ']');
            };

            this._channels.push(channel);
        }

        private _remove(channel: Channel) {
            var pos = this._channels.indexOf(channel);
            if (pos !== -1) {
                this._channels.splice(pos, 1);
            }
        }

        size() {
            return this._channels.length;
        }

        send(data: string): void ;
        send(data: ArrayBuffer): void;
        send(data: ArrayBufferView): void;
        send(data: Blob): void;
        send(data: any) {
            this._channels.forEach(channel => {
                try {
                    channel.send(data);
                } catch (error) {
                    this._remove(channel);
                    this._emitter.emit('error', {remote: channel.remote, error: error});
                }
            });
        }

        set onclose(listener: () => void) {
            this.on('close', listener);
        }

        on(type: string, listener: () => void) {
            this._emitter.on(type, listener);
        }

        close () {
            this._channels.forEach(channel => channel.close());
            this._channels = [];
            this._emitter.emit('close');
        }
    }
}
