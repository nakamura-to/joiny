import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { Connector } from 'react-redux';
import Entrance from '../components/Entrance';
import Room from '../components/Room';
import * as ChatActions from '../actions/ChatActions';

export default class ChatApp extends Component {

  renderChild({ chat, dispatch }) {
    const actions = bindActionCreators(ChatActions, dispatch);
    return (
      <div>
        <h1><span>WebRTC Chat Room</span></h1>
        { !chat.isConnecting ? <Entrance connect={actions.connect} /> : null }
        { chat.isConnecting ? <Room {...chat} actions={actions} /> : null }
      </div>
    );
  }

  render() {
    return (
      <Connector select={state => ({ chat: state.chat })}>
        {this.renderChild}
      </Connector>
    );
  }
}
