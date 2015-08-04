import expect from 'expect';
import createComponent from '../createComponent';
import Room from '../../src/components/Room';

describe('Room', () => {

  it('should render', () => {
    const roomKey = 'KEY';
    const userName = 'hoge';
    const local = { peer: { id: 1, name: 'hoge' }, streamUrl: '' };
    const remotes = {
      '2': { peer: { id: 2, name: 'foo' }, streamUrl: '' },
      '3': { peer: { id: 3, name: 'bar' }, streamUrl: '' },
    };
    const messages = [
      {
        type: 'local',
        id: 1,
        peer: { id: 1, name: 'hoge' },
        text: 'hello',
      },
      {
        type: 'remote',
        id: 2,
        peer: { id: 2, name: 'foo' },
        text: 'hi',
      },
      {
        type: 'system',
        id: 3,
        peer: { id: 2, name: 'foo' },
        text: 'here',
      },
    ];
    const actions = {
      sendText: () => {},
    };
    const component = createComponent(Room, { roomKey, userName, local, remotes, messages, actions });
    expect(component.type).toBe('div');
  });
});
