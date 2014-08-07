module join {
    'use strict';

    export interface Options {
        key?: string;
        name?: string;
        credential?: any;
        host?: string;
        secure?: boolean;
        iceServers?: any[];
        media?: { video: any; audio: any};
        channels?: { [name: string]: any }[];
        logger?: (log: string, message: string) => void;
    }

    export class WebRTC {

        constructor(private coordinator: Coordinator) {
        }

        on(type: string, listener: (event: any) => void) {
            this.coordinator.on(type, listener);
        }

        start() {
            this.coordinator.start();
        }

        close() {
            this.coordinator.close();
        }
    }

    export function createWebRTC(options?: Options) : WebRTC {
        var coordinator = new Coordinator(options);
        return new WebRTC(coordinator);
    }
}
