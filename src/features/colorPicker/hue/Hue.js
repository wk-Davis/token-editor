import React, { Component, PureComponent } from 'react';
import * as hue from './hueHelper';

export class Hue extends (PureComponent || Component) {
  componentWillUnmount() {
    this.unbindEventListeners();
  }

  handleChange = (e) => {
    const change = hue.calculateChange(
      e,
      this.props.direction,
      this.props.hsl,
      this.container
    );
    change &&
      typeof this.props.onChange === 'function' &&
      this.props.onChange(change, e);
  };

  handleMouseDown = (e) => {
    this.handleChange(e);
    window.addEventListener('mousemove', this.handleChange);
    window.addEventListener('mouseup', this.handleMouseUp);
  };

  handleMouseUp = () => {
    this.unbindEventListeners();
  };

  unbindEventListeners() {
    window.removeEventListener('mousemove', this.handleChange);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  render() {
    const pointerPosition = { left: `${(this.props.hsl.h * 100) / 360}%` };
    return (
      <div className='hue-selector'>
        <div
          className={`hue-selector__bar`}
          ref={(container) => (this.container = container)}
          onMouseDown={this.handleMouseDown}
          onTouchMove={this.handleChange}
          onTouchStart={this.handleChange}
        >
          <style>{`
            .hue-selector__bar {
              background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0
                33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
              background: -webkit-linear-gradient(to right, #f00 0%, #ff0
                17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
            }
          `}</style>
          <div className='hue-selector__pointer' style={pointerPosition} />
        </div>
      </div>
    );
  }
}

export default Hue;
