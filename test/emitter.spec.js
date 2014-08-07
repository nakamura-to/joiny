describe('EventEmitter', function () {

    it('should listen to events', function () {
        var emitter = new join.EventEmitter();
        var count = 0;
        emitter.on('increment', function () {
            count++;
        });
        emitter.on('decrement', function () {
            count--;
        });
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
