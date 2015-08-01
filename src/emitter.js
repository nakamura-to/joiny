export class EventEmitter {

  events = {};

  on(type, listener) {
    if (this.events[type]) {
      this.events[type].push(listener);
    } else {
      this.events[type] = [listener];
    }
  }

  emit(type, ...args) {
    var listeners = this.events[type] || [];
    listeners.forEach(listener => listener.apply(this, args));
  }
}
