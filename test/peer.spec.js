import expect from 'expect';
import sinon from 'sinon';
import { Local, Remote } from '../src/peer';
import { ChannelBundle } from '../src/bundle';

describe('Peer', () => {

  describe('Local', () => {
    it('should listen to a local event', () => {
      var spy = sinon.spy();

      var local = new Local('local');
      local.on('local', spy);
      local.local();

      expect(spy.calledWith(local)).toBe(true);
    });

    it('should listen to a remote event', () => {
      var spy = sinon.spy();

      var local = new Local();
      local.on('remote', spy);
      var remote = new Remote(0, 'remote');
      local.remote(remote);

      expect(spy.calledWith(remote)).toBe(true);
    });

    it('should listen to a stream event', () => {
      var spy = sinon.spy();

      var local = new Local();
      var stream = {};
      local.on('stream', spy);
      local.stream(stream);

      expect(spy.calledWith(stream)).toBe(true);
    });

    it('should listen to a bundle event', () => {
      var spy = sinon.spy();

      var local = new Local();
      var bundle = new ChannelBundle('chat', local, () => {});
      local.on('chat.channel', spy);
      local.bundle(bundle);

      expect(spy.calledWith(bundle)).toBe(true);
    });

    it('should listen to a close event', () => {
      var spy = sinon.spy();

      var local = new Local();
      local.onclose = spy;
      local.close();

      expect(spy.called).toBe(true);
    });

  });

  describe('Remote', () => {

    it('should listen to a close event', () => {
      var spy = sinon.spy();

      var remote = new Remote(0, 'remote');
      remote.onclose = spy;
      remote.close();

      expect(spy.called).toBe(true);
    });

    it('should listen to a stream event', () => {
      var spy = sinon.spy();

      var remote = new Remote(0, 'remote');
      var stream = {};
      remote.on('stream', spy);
      remote.stream(stream);

      expect(spy.calledWith(stream)).toBe(true);
    });

  });

});
