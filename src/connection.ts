module join {
    'use strict';

    export class Connection {

        private emitter = new EventEmitter();

        constructor(private peerConnection: RTCPeerConnection, private _local: Local, private _remote: Remote) {
            this.peerConnection.onicecandidate = (event: RTCIceCandidateEvent) =>
                this.emitter.emit('icecandidate', event);
            
            this.peerConnection.oniceconnectionstatechange = (event: Event) =>
                this.emitter.emit('iceconnectionstatechange', event);

            this.peerConnection.onnegotiationneeded = (event: Event) =>
                this.emitter.emit('negotiationneeded', event);

            this.peerConnection.onaddstream = (event: RTCMediaStreamEvent) =>
                this.emitter.emit('addstream', event);

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
            this.emitter.on('icecandidate', listener);
        }

        set onoffer(listener: (event: Event) => void) {
            this.emitter.on('offer', listener);
        }

        set onanswer(listener: (event: Event) => void) {
            this.emitter.on('answer', listener);
        }

        set oniceconnectionstatechange(listener: (event: any) => void) {
            this.emitter.on('iceconnectionstatechange', listener);
        }

        set onaddstream(listener: (event: RTCMediaStreamEvent) => void) {
            this.emitter.on('addstream', listener);
        }

        set onclose(listener: () => void) {
            this.emitter.on('close', listener);
        }

        set onerror(listener: (event: Event) => void) {
            this.emitter.on('error', listener);
        }

        createOffer() {
            this.peerConnection.createOffer(
                (offer: RTCSessionDescription) => {
                    this.peerConnection.setLocalDescription(offer);
                    this.emitter.emit('offer', offer);
                },
                (error: DOMError) =>
                    this.emitter.emit('error', error)
            );
        }

        createAnswer() {
            this.peerConnection.createAnswer(
                (answer: RTCSessionDescription) => {
                    this.peerConnection.setLocalDescription(answer);
                    this.emitter.emit('answer', answer);
                },
                (error: DOMError) =>
                    this.emitter.emit('error', error)
            );
        }

        addIceCandidate(candidate: RTCIceCandidate) {
            this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }

        setRemoteDescription(sdp: RTCSessionDescriptionInit) {
            this.peerConnection.setRemoteDescription(
                new RTCSessionDescription(sdp),
                () => {}, // do nothing
                (error: DOMError) =>
                    this.emitter.emit('error', error)
            );
        }

        createChannel(label: string, options: RTCDataChannelInit) {
            var dataChannel = this.peerConnection.createDataChannel(label, options);
            return new Channel(dataChannel, this.remote);
        }

        addStream(stream: MediaStream) {
            this.peerConnection.addStream(stream);
        }

        close() {
            this.peerConnection.close();
            this.emitter.emit('close');
        }
    }
}
