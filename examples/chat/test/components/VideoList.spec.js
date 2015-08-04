import expect from 'expect';
import createComponent from '../createComponent';
import VideoList from '../../src/components/VideoList';

describe('VideoList', () => {

  it('should render empty', () => {
    const component = createComponent(VideoList, { local: null, remotes: {} });
    expect(component.type).toBe('div');
    expect(component.props.children.length).toBe(2);
    expect(component.props.children[0]).toBe(null);
    expect(component.props.children[1]).toEqual([]);
  });

  it('should render local and remotes', () => {
    const local = { peer: { id: 1, name: 'hoge' }, streamUrl: '' };
    const remotes = {
      '2': { peer: { id: 2, name: 'foo' }, streamUrl: '' },
      '3': { peer: { id: 3, name: 'bar' }, streamUrl: '' },
    };
    const component = createComponent(VideoList, { local, remotes });
    expect(component.type).toBe('div');
    expect(component.props.children.length).toBe(2);
    expect(component.props.children[0]).toNotBe(null);
    expect(component.props.children[1]).toNotEqual([]);
  });

});
