module join {
    'use strict';

    export class Channel {

        private _emitter = new EventEmitter();

        constructor(private _dataChannel: RTCDataChannel, private _remote: Remote) {
            this._dataChannel.onopen = (event: Event) =>
                this._emitter.emit('open', event);

            this._dataChannel.onmessage = (event: RTCMessageEvent) =>
                this._emitter.emit('message', event);

            this._dataChannel.onclose = (event: Event) =>
                this._emitter.emit('close', event);

            this._dataChannel.onerror = (event: Event) =>
                this._emitter.emit('error', event);
        }

        get label(): string {
            return this._dataChannel.label;
        }

        get remote(): Remote {
            return this._remote;
        }

        set onopen(listener: (event: Event) => void) {
            this._on('open', listener);
        }

        set onmessage(listener: (event: RTCMessageEvent) => void) {
            this._on('message', listener);
        }

        set onclose(listener: (event: Event) => void) {
            this._on('close', listener);
        }

        set onerror(listener: (event: Event) => void) {
            this._on('error', listener);
        }

        set onsending(listener: () => void) {
            this._on('sending', listener);
        }

        private _on(type:string, listener: (event: any) => void) {
            this._emitter.on(type, listener);
        }

        send(data: string): void ;
        send(data: ArrayBuffer): void;
        send(data: ArrayBufferView): void;
        send(data: Blob): void;
        send(data: any) {
            this._emitter.emit('sending');
            this._dataChannel.send(data);
        }

        close() {
            this._dataChannel.close();
        }
    }
}
