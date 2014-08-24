describe('Bundle', function () {

    it('should add a channel', function () {
        var bundle = new join.ChannelBundle('bundle', {}, function() {});

        expect(bundle.size()).toBe(0);

        bundle.add(new join.Channel({}, {}));
        expect(bundle.size()).toBe(1);

        bundle.add(new join.Channel({}, {}));
        expect(bundle.size()).toBe(2);
    });

    it('should send a message to all channels', function () {
        var bundle = new join.ChannelBundle('bundle', {}, function() {});
        var ch1 = new join.Channel({}, {});
        var ch2 = new join.Channel({}, {});

        spyOn(ch1, 'send');
        spyOn(ch2, 'send');

        bundle.add(ch1);
        bundle.add(ch2);
        bundle.send('hello');

        expect(ch1.send).toHaveBeenCalledWith('hello');
        expect(ch2.send).toHaveBeenCalledWith('hello');
    });

    it('should close all channels', function () {
        var bundle = new join.ChannelBundle('bundle', {}, function() {});
        var ch1 = new join.Channel({}, {});
        var ch2 = new join.Channel({}, {});

        spyOn(ch1, 'close');
        spyOn(ch2, 'close');

        bundle.add(ch1);
        bundle.add(ch2);
        bundle.close();

        expect(ch1.close).toHaveBeenCalled();
        expect(ch2.close).toHaveBeenCalled();
        expect(bundle.size()).toBe(0);
    });

});
