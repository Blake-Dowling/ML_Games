import React from 'react';

class KeyPress extends React.Component {
  // ****************** Arrow key event handler ******************
  keyPressCallback(key){
    switch(key){
        case 'ArrowUp':
            this.props.gameJumpHandler()
            break
    }
  }
  handleKeyPress = (event) => {
    // console.log('Key pressed:', event.key);
    this.keyPressCallback(event.key)
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
