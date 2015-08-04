import expect from 'expect';
import chat from '../../src/reducers/chat';

describe('chat', () => {

  it('todo', () => {
    const state = chat(undefined, {});
    expect(state).toNotBe(undefined);
  });

});
