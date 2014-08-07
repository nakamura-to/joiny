module join {
    'use strict';

    export interface ISignal {
        type: string;
        src: IPeer;
        dest: IPeer;
    }

    export interface ISubscriptionSignal extends ISignal {
        id: string;
        peers: IPeer[];
    }

    export interface IIceCandidateSignal extends ISignal {
        candidate: RTCIceCandidate;
    }

    export interface IOfferSignal extends ISignal {
        channels: any;
        offer: RTCSessionDescriptionInit;
    }

    export interface IAnswerSignal extends ISignal {
        answer: RTCSessionDescriptionInit;
    }

    export class SignalingChannel {

        private url: string;
        private webSocket: WebSocket;
        private emitter = new EventEmitter();

        constructor(host: string, secure: boolean) {
            this.url = (secure ? 'wss' : 'ws') + '://' + host;
        }

        start() {
            this.webSocket = new WebSocket(this.url);

            this.webSocket.onopen = (event: MessageEvent) =>
                this.emitter.emit('open', event);

            this.webSocket.onmessage = (event: MessageEvent) => {
                var signal: any = JSON.parse(event.data);
                this.emitter.emit(signal.type, signal);
            };
        }

        send(signal: ISignal): void {
            this.webSocket.send(JSON.stringify(signal));
        }

        set onopen(listener: (event: MessageEvent) => void) {
            this.on('open', listener);
        }

        set onsubscription(listener: (signal: ISubscriptionSignal) => void) {
            this.on('subscription', listener);
        }

        set onicecandidate(listener: (signal: IIceCandidateSignal) => void) {
            this.on('icecandidate', listener);
        }

        set onoffer(listener: (signal: IOfferSignal) => void) {
            this.on('offer', listener);
        }

        set onanswer(listener: (signal: IAnswerSignal) => void) {
            this.on('answer', listener);
        }

        private on(type: string, listener: (event: any) => void) {
            this.emitter.on(type, listener);
        }
    }
}
