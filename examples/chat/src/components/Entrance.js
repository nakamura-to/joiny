import React, { Component, PropTypes } from 'react';

export default class Entrance extends Component {

  static propTypes = {
    connect: PropTypes.func.isRequired,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      roomKey: '',
      userName: '',
    };
  }

  render() {
    return (
      <form onSubmit={::this.handleSubmit}>
        <input type="text"
          maxLength="20"
          placeholder="Room Key (optional)"
          size="30"
          value={this.state.roomKey}
          onChange={::this.handleChangeRoomKey} />
        <input type="text"
          maxLength="20"
          placeholder="Your Name (optional)"
          size="30"
          value={this.state.userName}
          onChange={::this.handleChangeUserName} />
        <input type="submit"
          value="Connect" />
      </form>
    );
  }

  handleChangeRoomKey(e) {
    this.setState({ roomKey: e.target.value });
  }

  handleChangeUserName(e) {
    this.setState({ userName: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { roomKey, userName } = this.state;
    this.props.connect(roomKey, userName);
  }
}
