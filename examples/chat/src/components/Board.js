import React, { Component, PropTypes } from 'react';
import formatPeerName from '../utils/formatPeerName';

export default class Board extends Component {

  static propTypes = {
    messages: PropTypes.array.isRequired,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      messages: PropTypes.array.isRequired,
    };
  }

  renderMessage({ type, id, peer, text }) {
    if (type === 'system') {
      return (
        <div key={id}>
          <span className="message">{text}</span>
        </div>
      );
    }
    return (
      <div key={id}>
        <span className="name">{formatPeerName(peer)}</span> :
        <span className="message">{text}</span>
      </div>
    );
  }

  render() {
    this.scrollElement();
    const { messages } = this.props;
    return (
      <div id="board" ref="board">
        {messages.map(::this.renderMessage)}
      </div>
    );
  }

  scrollElement() {
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => {
        if (this.refs && this.refs.board) {
          const node = this.refs.board;
          node.scrollTop = node.scrollHeight;
        }
      });
    }
  }
}
