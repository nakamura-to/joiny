import expect from 'expect';
import sinon from 'sinon';
import { ChannelBundle } from '../src/bundle';
import { Channel } from '../src/channel';

describe('Bundle', () => {

  it('should add a channel', () => {
    var bundle = new ChannelBundle('bundle', {}, () => {});

    expect(bundle.size()).toBe(0);

    bundle.add(new Channel({}, {}));
    expect(bundle.size()).toBe(1);

    bundle.add(new Channel({}, {}));
    expect(bundle.size()).toBe(2);
  });

  it('should send a message to all channels', () => {
    var bundle = new ChannelBundle('bundle', {}, () => {});
    var ch1 = { send: () => {} };
    var ch2 = { send: () => {} };
    sinon.spy(ch1, 'send');
    sinon.spy(ch2, 'send');

    bundle.add(ch1);
    bundle.add(ch2);
    bundle.send('hello');

    expect(ch1.send.calledWith('hello')).toBe(true);
    expect(ch2.send.calledWith('hello')).toBe(true);
  });

  it('should close all channels', () => {
    var bundle = new ChannelBundle('bundle', {}, () => {});
    var ch1 = { close: () => {} };
    var ch2 = { close: () => {} };

    sinon.spy(ch1, 'close');
    sinon.spy(ch2, 'close');

    bundle.add(ch1);
    bundle.add(ch2);
    bundle.close();

    expect(ch1.close.called).toBe(true);
    expect(ch2.close.called).toBe(true);
    expect(bundle.size()).toBe(0);
  });

});
