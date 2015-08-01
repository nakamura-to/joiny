import expect from 'expect';
import sinon from 'sinon';
import { Channel } from '../src/channel';

describe('Channel', () => {

  it('should listen to an open event', () => {
    var spy = sinon.spy();
    var event = {};

    var channel = new Channel({}, {});
    channel.onopen = spy;
    channel._emitter.emit('open', event);

    expect(spy.calledWith(event)).toBe(true);
  });

  it('should listen to a message event', () => {
    var spy = sinon.spy();
    var event = {};

    var channel = new Channel({}, {});
    channel.onmessage = spy;
    channel._emitter.emit('message', event);

    expect(spy.calledWith(event)).toBe(true);
  });

  it('should listen to an error event', () => {
    var spy = sinon.spy();
    var event = {};

    var channel = new Channel({}, {});
    channel.onerror = spy;
    channel._emitter.emit('error', event);

    expect(spy.calledWith(event)).toBe(true);
  });

  it('should listen to a close event', () => {
    var spy = sinon.spy();
    var event = {};

    var channel = new Channel({}, {});
    channel.onclose = spy;
    channel._emitter.emit('close', event);

    expect(spy.calledWith(event)).toBe(true);
  });

  it('should listen to a sending event', () => {
    var spy = sinon.spy();
    var event = {};

    var channel = new Channel({}, {});
    channel.onsending = spy;
    channel._emitter.emit('sending', event);

    expect(spy.calledWith(event)).toBe(true);
  });

  it('should send a message to a rtc data channel', () => {
    var send = sinon.spy();
    var sending = sinon.spy();

    var channel = new Channel({ send: send }, {});
    channel.onsending = sending;
    channel.send('hello');

    expect(sending.called).toBe(true);
    expect(send.calledWith('hello')).toBe(true);
  });

  it('should close a rtc data channel', () => {
    var close = sinon.spy();

    var channel = new Channel({ close: close }, {});
    channel.close();

    expect(close.called).toBe(true);
  });

});
