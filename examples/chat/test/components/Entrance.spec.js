import expect from 'expect';
import createComponent from '../createComponent';
import Entrance from '../../src/components/Entrance';

describe('Entrance', () => {

  it('should render', () => {
    const component = createComponent(Entrance, { connect: () => {} });
    expect(component.type).toBe('form');
  });

});
