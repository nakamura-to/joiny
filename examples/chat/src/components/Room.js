import React, { Component, PropTypes } from 'react';
import VideoList from './VideoList';
import Board from './Board';
import MessageForm from './MessageForm';
import formatPeerName from '../utils/formatPeerName';

export default class Room extends Component {

  static propTypes = {
    roomKey: PropTypes.string.isRequired,
    userName: PropTypes.string.isRequired,
    local: PropTypes.object,
    remotes: PropTypes.object.isRequired,
    messages: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props, context);
  }

  render() {
    const { roomKey, local, remotes, messages, actions } = this.props;
    return (
      <div>
        <h3>Room Key: {roomKey}</h3>
        <h3>Your Name: {local ? formatPeerName(local.peer) : null}</h3>
        <VideoList local={local} remotes={remotes} />
        <Board messages={messages} />
        <MessageForm sendText={actions.sendText} />
        <div id="description">
          <p>Send a message or drop a file to this page.</p>
          <p>The file size must be relatively small.</p>
        </div>
      </div>
    );
  }
}
