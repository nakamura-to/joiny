module join {
    'use strict';

    export class Channel {

        private emitter = new EventEmitter();

        constructor(private dataChannel: RTCDataChannel, private _remote: Remote) {
            this.dataChannel.onopen = (event: Event) =>
                this.emitter.emit('open', event);

            this.dataChannel.onmessage = (event: RTCMessageEvent) =>
                this.emitter.emit('message', event);

            this.dataChannel.onclose = (event: Event) =>
                this.emitter.emit('close', event);

            this.dataChannel.onerror = (event: Event) =>
                this.emitter.emit('error', event);
        }

        get label(): string {
            return this.dataChannel.label;
        }

        get remote(): Remote {
            return this._remote;
        }

        set onopen(listener: (event: Event) => void) {
            this.on('open', listener);
        }

        set onmessage(listener: (event: RTCMessageEvent) => void) {
            this.on('message', listener);
        }

        set onclose(listener: (event: Event) => void) {
            this.on('close', listener);
        }

        set onerror(listener: (event: Event) => void) {
            this.on('error', listener);
        }

        set onsending(listener: () => void) {
            this.on('sending', listener);
        }

        private on(type:string, listener: (event: any) => void) {
            this.emitter.on(type, listener);
        }

        emit(type: string, listener: (event: any) => void) {
            this.emitter.emit(type, listener);
        }

        send(data: string): void ;
        send(data: ArrayBuffer): void;
        send(data: ArrayBufferView): void;
        send(data: Blob): void;
        send(data: any) {
            this.emitter.emit('sending');
            this.dataChannel.send(data);
        }

        close() {
            this.dataChannel.close();
        }
    }
}
