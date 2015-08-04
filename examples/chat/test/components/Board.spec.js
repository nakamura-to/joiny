import expect from 'expect';
import createComponent from '../createComponent';
import Board from '../../src/components/Board';

describe('Board', () => {

  it('should render no message', () => {
    const component = createComponent(Board, { messages: [] });
    expect(component.props.children.length).toBe(0);
  });

  it('should render messages', () => {
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
    const component = createComponent(Board, { messages });
    expect(component.props.children.length).toBe(3);
  });

});
