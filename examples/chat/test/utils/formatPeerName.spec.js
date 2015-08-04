import expect from 'expect';
import formatPeerName from '../../src/utils/formatPeerName';

describe('formatPeerName', () => {

  it('should format peer name', () => {
    const name = formatPeerName({ name: 'hoge', id: 99 });
    expect(name).toBe('hoge (id=99)');
  });

});
