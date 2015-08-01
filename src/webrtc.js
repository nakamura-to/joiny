import { Coordinator } from './coordinator';

export class WebRTC {

    constructor(coordinator) {
      this.coordinator = coordinator;
    }

    on(type, listener) {
      this.coordinator.on(type, listener);
    }

    start() {
      this.coordinator.start();
    }

    close() {
      this.coordinator.close();
    }
}

export function createWebRTC(options) {
  var coordinator = new Coordinator(options);
  return new WebRTC(coordinator);
}
