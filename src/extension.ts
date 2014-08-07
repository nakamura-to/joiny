window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;

interface Window {
    RTCPeerConnection: RTCPeerConnection;
    webkitRTCPeerConnection: webkitRTCPeerConnection;
    mozRTCPeerConnection: mozRTCPeerConnection;
    RTCSessionDescription: RTCSessionDescription;
    mozRTCSessionDescription: RTCSessionDescription;
    RTCIceCandidate: RTCIceCandidate;
    mozRTCIceCandidate: RTCIceCandidate;
}

interface Navigator {
    mozGetUserMedia(constraints: MediaStreamConstraints,
                    successCallback: (stream: any) => void,
                    errorCallback: (error: Error) => void): void;
}

// http://www.w3.org/TR/2013/WD-webrtc-20130910/
interface RTCPeerConnection {
    oniceconnectionstatechange: (event: Event) => void;
}
