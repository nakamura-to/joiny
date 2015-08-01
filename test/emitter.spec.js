import expect from 'expect';
import { EventEmitter } from '../src/emitter';

describe('EventEmitter', () => {

  it('should listen to events', () => {
    var emitter = new EventEmitter();
    var count = 0;
    emitter.on('increment', () => count++);
    emitter.on('decrement', () => count--);
    expect(count).toBe(0);
    emitter.emit('increment');
    expect(count).toBe(1);
    emitter.emit('decrement');
    expect(count).toBe(0);
    emitter.emit('increment');
    expect(count).toBe(1);
    emitter.emit('decrement');
    expect(count).toBe(0);
  });

});
