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

        private _url: string;
        private _webSocket: WebSocket;
        private _emitter = new EventEmitter();

        constructor(_host: string, _secure: boolean) {
            this._url = (_secure ? 'wss' : 'ws') + '://' + _host;
        }

        start() {
            this._webSocket = new WebSocket(this._url);

            this._webSocket.onopen = (event: MessageEvent) =>
                this._emitter.emit('open', event);

            this._webSocket.onmessage = (event: MessageEvent) => {
                var signal: any = JSON.parse(event.data);
                this._emitter.emit(signal.type, signal);
            };
        }

        send(signal: ISignal): void {
            this._webSocket.send(JSON.stringify(signal));
        }

        set onopen(listener: (event: MessageEvent) => void) {
            this._on('open', listener);
        }

        set onsubscription(listener: (signal: ISubscriptionSignal) => void) {
            this._on('subscription', listener);
        }

        set onicecandidate(listener: (signal: IIceCandidateSignal) => void) {
            this._on('icecandidate', listener);
        }

        set onoffer(listener: (signal: IOfferSignal) => void) {
            this._on('offer', listener);
        }

        set onanswer(listener: (signal: IAnswerSignal) => void) {
            this._on('answer', listener);
        }

        private _on(type: string, listener: (event: any) => void) {
            this._emitter.on(type, listener);
        }
    }
}
