module join {
    'use strict';

    export interface IPeer {
        id: string;
        name: string;
    }

    export class Local implements IPeer {

        name: string;
        id: string;
        signal: ISignal;
        private _emitter = new EventEmitter();

        constructor(name: string) {
            this.name = name;
        }

        set onclose(listener: () => void) {
            this._emitter.on('close', listener);
        }

        on(type: string, listener: (event: any) => void) {
            this._emitter.on(type, listener);
        }

        local() {
            this._emitter.emit('local', this);
        }

        remote(remote: Remote) {
            this._emitter.emit('remote', remote);
        }

        stream(stream: any) {
            this._emitter.emit('stream', stream);
        }

        bundle(bundle: ChannelBundle) {
            this._emitter.emit(bundle.label + '.channel', bundle);
        }

        close() {
            this._emitter.emit("close");
        }
    }

    export class Remote implements IPeer {

        private _emitter = new EventEmitter();

        constructor(public id: string, public name: string) {
        }

        set onclose(listener: () => void) {
            this._emitter.on('close', listener);
        }

        on(type: string, listener: (event: any) => void) {
            this._emitter.on(type, listener);
        }

        stream(stream: any) {
            this._emitter.emit('stream', stream);
        }

        close() {
            this._emitter.emit("close");
        }
    }
}
