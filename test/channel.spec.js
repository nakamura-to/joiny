describe('Channel', function () {

    it('should listen to an open event', function () {
        var spy = jasmine.createSpy('spy');
        var event = {};

        var channel = new join.Channel({}, {});
        channel.onopen = spy;
        channel._emitter.emit('open', event);

        expect(spy).toHaveBeenCalledWith(event);
    });

    it('should listen to a message event', function () {
        var spy = jasmine.createSpy('spy');
        var event = {};

        var channel = new join.Channel({}, {});
        channel.onmessage = spy;
        channel._emitter.emit('message', event);

        expect(spy).toHaveBeenCalledWith(event);
    });

    it('should listen to an error event', function () {
        var spy = jasmine.createSpy('spy');
        var event = {};

        var channel = new join.Channel({}, {});
        channel.onerror = spy;
        channel._emitter.emit('error', event);

        expect(spy).toHaveBeenCalledWith(event);
    });

    it('should listen to a close event', function () {
        var spy = jasmine.createSpy('spy');
        var event = {};

        var channel = new join.Channel({}, {});
        channel.onclose = spy;
        channel._emitter.emit('close', event);

        expect(spy).toHaveBeenCalledWith(event);
    });

    it('should listen to a sending event', function () {
        var spy = jasmine.createSpy('spy');
        var event = {};

        var channel = new join.Channel({}, {});
        channel.onsending = spy;
        channel._emitter.emit('sending', event);

        expect(spy).toHaveBeenCalledWith(event);
    });

    it('should send a message to a rtc data channel', function () {
        var send = jasmine.createSpy('send');
        var sending = jasmine.createSpy('sending');

        var channel = new join.Channel({ send: send }, {});
        channel.onsending = sending;
        channel.send('hello');

        expect(sending).toHaveBeenCalled();
        expect(send).toHaveBeenCalledWith('hello');
    });

    it('should close a rtc data channel', function () {
        var close = jasmine.createSpy('close');

        var channel = new join.Channel({ close: close }, {});
        channel.close();

        expect(close).toHaveBeenCalled();
    });

});
