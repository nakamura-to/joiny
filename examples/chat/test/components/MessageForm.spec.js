import expect from 'expect';
import createComponent from '../createComponent';
import MessageForm from '../../src/components/MessageForm';

describe('MessageForm', () => {

  it('should render', () => {
    const component = createComponent(MessageForm, { sendText: () => {} });
    expect(component.type).toBe('form');
  });

});
