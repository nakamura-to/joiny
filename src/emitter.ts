module join {
    'use strict';

    export class EventEmitter {

        private events: { [type: string] : Array<(arg: any) => void>; } = {};

        on(type: string, listener: (arg: any) => void) {
            if (this.events[type]) {
                this.events[type].push(listener);
            } else {
                this.events[type] = [listener];
            }
        }

        emit(type: string, ...args : any[]) {
            var listeners = this.events[type] || [];
            listeners.forEach(listener => listener.apply(this, args));
        }
    }
}
