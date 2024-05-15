import React from 'react';

class KeyPress extends React.Component {
  handleKeyPress = (event) => {
    // console.log('Key pressed:', event.key);
    this.props.keyPressCallback(event.key)
  };

  componentDidMount() {
    this.divElement.focus();
  }
  handleBlur = () => {
    // Prevent the div from losing focus
    this.divElement.focus();
  };
  render() {
    return (
      <div
        ref={(div) => { this.divElement = div; }}
        onKeyDown={(event) => this.handleKeyPress(event)}
        onBlur={this.handleBlur}
        tabIndex="0"
      >

      </div>
    );
  }
}


export default KeyPress;
