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
        private emitter = new EventEmitter();

        constructor(name: string) {
            this.name = name;
        }

        set onclose(listener: () => void) {
            this.emitter.on('close', listener);
        }

        on(type: string, listener: (event: any) => void) {
            this.emitter.on(type, listener);
        }

        local() {
            this.emitter.emit('local', this);
        }

        remote(remote: Remote) {
            this.emitter.emit('remote', remote);
        }

        stream(stream: any) {
            this.emitter.emit('stream', stream);
        }

        bundle(bundle: ChannelBundle) {
            this.emitter.emit(bundle.label + '.channel', bundle);
        }

        close() {
            this.emitter.emit("close");
        }
    }

    export class Remote implements IPeer {

        private emitter = new EventEmitter();

        constructor(public id: string, public name: string) {
        }

        set onclose(listener: () => void) {
            this.emitter.on('close', listener);
        }

        on(type: string, listener: (event: any) => void) {
            this.emitter.on(type, listener);
        }

        stream(stream: any) {
            this.emitter.emit('stream', stream);
        }

        close() {
            this.emitter.emit("close");
        }
    }
}
