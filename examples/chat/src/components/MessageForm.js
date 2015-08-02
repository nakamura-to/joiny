import React, { Component, PropTypes } from 'react';

export default class Room extends Component {

  static propTypes = {
    sendText: PropTypes.func.isRequired,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      text: '',
    };
  }

  render() {
    return (
      <form onSubmit={::this.handleSubmit}>
        <input id="message" type="text" ref="input"
          size="100"
          maxLength="80"
          placeholder="Message (required)"
          autoFocus
          value={this.state.text}
          onChange={::this.handleChangeMessage} />
        <input type="submit" value="Send" />
      </form>
    );
  }

  handleChangeMessage(e) {
    this.setState({
      text: e.target.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const { text } = this.state;
    if (text) {
      this.props.sendText(text);
    }
    this.setState({
      text: '',
    });
    this.refs.input.focus();
  }
}
