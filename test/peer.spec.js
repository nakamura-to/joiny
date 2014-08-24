describe('Peer', function () {

    describe('Local', function () {
        it('should listen to a local event', function () {
            var spy = jasmine.createSpy('spy');

            var local = new join.Local('local');
            local.on('local', spy);
            local.local();

            expect(spy).toHaveBeenCalledWith(local);
        });

        it('should listen to a remote event', function () {
            var spy = jasmine.createSpy('spy');

            var local = new join.Local();
            local.on('remote', spy);
            var remote = new join.Remote(0, 'remote');
            local.remote(remote);

            expect(spy).toHaveBeenCalledWith(remote);
        });

        it('should listen to a stream event', function () {
            var spy = jasmine.createSpy('spy');

            var local = new join.Local();
            var stream = {};
            local.on('stream', spy);
            local.stream(stream);

            expect(spy).toHaveBeenCalledWith(stream);
        });

        it('should listen to a bundle event', function () {
            var spy = jasmine.createSpy('spy');

            var local = new join.Local();
            var bundle = new join.ChannelBundle('chat', local, function() {});
            local.on('chat.channel', spy);
            local.bundle(bundle);

            expect(spy).toHaveBeenCalledWith(bundle);
        });

        it('should listen to a close event', function () {
            var spy = jasmine.createSpy('spy');

            var local = new join.Local();
            local.onclose = spy;
            local.close();

            expect(spy).toHaveBeenCalled();
        });

    });

    describe('Remote', function () {

        it('should listen to a close event', function () {
            var spy = jasmine.createSpy('spy');

            var remote = new join.Remote(0, 'remote');
            remote.onclose = spy;
            remote.close();

            expect(spy).toHaveBeenCalled();
        });

        it('should listen to a stream event', function () {
            var spy = jasmine.createSpy('spy');

            var remote = new join.Remote(0, 'remote');
            var stream = {};
            remote.on('stream', spy);
            remote.stream(stream);

            expect(spy).toHaveBeenCalledWith(stream);
        });

    });

});
