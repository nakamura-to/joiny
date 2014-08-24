module join {
    'use strict';

    export class Connection {

        private _emitter = new EventEmitter();

        constructor(private _peerConnection: RTCPeerConnection, private _local: Local, private _remote: Remote) {
            this._peerConnection.onicecandidate = (event: RTCIceCandidateEvent) =>
                this._emitter.emit('icecandidate', event);
            
            this._peerConnection.oniceconnectionstatechange = (event: Event) =>
                this._emitter.emit('iceconnectionstatechange', event);

            this._peerConnection.onnegotiationneeded = (event: Event) =>
                this._emitter.emit('negotiationneeded', event);

            this._peerConnection.onaddstream = (event: RTCMediaStreamEvent) =>
                this._emitter.emit('addstream', event);

            this._local.onclose = () => this.close();
            this._remote.onclose =  () => this.close();
        }

        get local(): Local {
            return this._local;
        }

        get remote(): Remote {
            return this._remote;
        }

        set onicecandidate(listener: (event: RTCIceCandidateEvent) => void) {
            this._emitter.on('icecandidate', listener);
        }

        set onoffer(listener: (event: Event) => void) {
            this._emitter.on('offer', listener);
        }

        set onanswer(listener: (event: Event) => void) {
            this._emitter.on('answer', listener);
        }

        set oniceconnectionstatechange(listener: (event: any) => void) {
            this._emitter.on('iceconnectionstatechange', listener);
        }

        set onaddstream(listener: (event: RTCMediaStreamEvent) => void) {
            this._emitter.on('addstream', listener);
        }

        set onclose(listener: () => void) {
            this._emitter.on('close', listener);
        }

        set onerror(listener: (event: Event) => void) {
            this._emitter.on('error', listener);
        }

        createOffer() {
            this._peerConnection.createOffer(
                (offer: RTCSessionDescription) => {
                    this._peerConnection.setLocalDescription(offer);
                    this._emitter.emit('offer', offer);
                },
                (error: DOMError) =>
                    this._emitter.emit('error', error)
            );
        }

        createAnswer() {
            this._peerConnection.createAnswer(
                (answer: RTCSessionDescription) => {
                    this._peerConnection.setLocalDescription(answer);
                    this._emitter.emit('answer', answer);
                },
                (error: DOMError) =>
                    this._emitter.emit('error', error)
            );
        }

        addIceCandidate(candidate: RTCIceCandidate) {
            this._peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }

        setRemoteDescription(sdp: RTCSessionDescriptionInit) {
            this._peerConnection.setRemoteDescription(
                new RTCSessionDescription(sdp),
                () => {}, // do nothing
                (error: DOMError) =>
                    this._emitter.emit('error', error)
            );
        }

        createChannel(label: string, options: RTCDataChannelInit) {
            var dataChannel = this._peerConnection.createDataChannel(label, options);
            return new Channel(dataChannel, this.remote);
        }

        addStream(stream: MediaStream) {
            this._peerConnection.addStream(stream);
        }

        close() {
            this._peerConnection.close();
            this._emitter.emit('close');
        }
    }
}
