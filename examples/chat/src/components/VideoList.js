import React, { Component, PropTypes } from 'react';
import formatPeerName from '../utils/formatPeerName';

export default class VideoList extends Component {

  static propTypes = {
    local: PropTypes.object,
    remotes: PropTypes.object.isRequired,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
    };
  }

  renderVideo({ peer, streamUrl }) {
    return (
      <div key={peer.id}>
        <video src={streamUrl} muted="true" autoPlay />
        <span>{formatPeerName(peer)}</span>
      </div>
    );
  }

  render() {
    const { local, remotes } = this.props;
    return (
      <div id="video-list">
        {local ? this.renderVideo(local) : null }
        {Object.keys(remotes).map((k) => this.renderVideo(remotes[k]))}
      </div>
    );
  }
}
