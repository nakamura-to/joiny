describe('Session', function () {

    it('should create a connection', function () {
        var session = new join.Session({ remote: function () {} }, function() {});
        var connection = session.createConnection({}, [], {}, function () {});

        expect(connection).toBeDefined();
    });

    it('should find a connection', function () {
        var session = new join.Session({ remote: function () {} }, function() {});
        var connection = session.createConnection({}, [], { id: 0, name: 'remote' }, function () {});
        var foundConnection = session.findConnection({ id: 0 });

        expect(connection).toBeDefined();
        expect(connection).toEqual(foundConnection);
    });

    it('should throw an Error when a connection is not found', function () {
        var session = new join.Session({ remote: function () {} }, function() {});
        expect(function () {
            session.findConnection({ id: 0, name: 'unknown' });
        }).toThrowError('connection [0] not found');
    });

});
