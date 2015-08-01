import expect from 'expect';
import { Session } from '../src/session';

describe('Session', () => {

  it('should create a connection', () => {
    var session = new Session({ remote: () => {} }, () => {});
    var connection = session.createConnection({}, [], {}, () => {});

    expect(connection).toNotBe(undefined);
  });

  it('should find a connection', () => {
    var session = new Session({ remote: () => {} }, () => {});
    var connection = session.createConnection({}, [], { id: 0, name: 'remote' }, () => {});
    var foundConnection = session.findConnection({ id: 0 });

    expect(connection).toNotBe(undefined);
    expect(connection).toEqual(foundConnection);
  });

  it('should throw an Error when a connection is not found', () => {
    var session = new Session({ remote: () => {} }, () => {});
    expect(() => {
      session.findConnection({ id: 0, name: 'unknown' });
    }).toThrow('connection [0] not found');
  });

});
