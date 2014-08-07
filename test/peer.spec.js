describe('Local', function () {

    it('should listen to a local event', function () {
        var local = new join.Local("local");
        var count = 0;
        var data;
        local.on('local', function (d) {
            count++;
            data = d;
        });
        local.local();
        expect(count).toBe(1);
        expect(data).toBe(local);
    });

    it('should listen to a remote event', function () {
        var local = new join.Local();
        var remote = new join.Remote(0, 'remote');
        var count = 0;
        var data;
        local.on('remote', function (remote) {
            count++;
            data = remote;
        });
        local.remote(remote);
        expect(count).toBe(1);
        expect(data).toBe(remote);
    });

    it('should listen to a stream event', function () {
        var local = new join.Local();
        var stream = {};
        var count = 0;
        var data;
        local.on('stream', function (stream) {
            count++;
            data = stream;
        });
        local.stream(stream);
        expect(count).toBe(1);
        expect(data).toBe(stream);
    });

    it('should listen to a bundle event', function () {
        var local = new join.Local();
        var bundle = new join.ChannelBundle('chat', local, function() {});
        var count = 0;
        var data;
        local.on('chat.channel', function (bundle) {
            count++;
            data = bundle;
        });
        local.bundle(bundle);
        expect(count).toBe(1);
        expect(data).toBe(bundle);
    });

    it('should listen to a close event', function () {
        var local = new join.Local();
        var count = 0;
        var data;
        local.on('close', function () {
            count++;
        });
        local.close();
        expect(count).toBe(1);
    });

});
