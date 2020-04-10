import React, { Component, PureComponent } from 'react';
import throttle from 'lodash/throttle';
import * as saturation from './saturationHelper';

export class Saturation extends (PureComponent || Component) {
  constructor(props) {
    super(props);

    this.throttle = throttle((fn, data, e) => {
      fn(data, e);
    }, 50);
  }

  componentWillUnmount() {
    this.throttle.cancel();
    this.unbindEventListeners();
  }

  handleChange = (e) => {
    typeof this.props.onChange === 'function' &&
      this.throttle(
        this.props.onChange,
        saturation.calculateChange(e, this.props.hsl, this.container),
        e
      );
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
    const pointerPosition = {
      top: `${-(this.props.hsv.v * 100) + 100}%`,
      left: `${this.props.hsv.s * 100}%`,
    };
    const backgroundColor = {
      background: `hsl(${this.props.hsl.h},100%, 50%)`,
    };

    return (
      <div className='saturation-selector'>
      <div
        className='saturation-selector__color'
        style={backgroundColor}
        ref={(container) => (this.container = container)}
        onMouseDown={this.handleMouseDown}
        onTouchMove={this.handleChange}
        onTouchStart={this.handleChange}
      >
        <style>{`
          .saturation-selector__white {
            background: -webkit-linear-gradient(to right, #fff, rgba(255,255,255,0));
            background: linear-gradient(to right, #fff, rgba(255,255,255,0));
          }
          .saturation-selector__black {
            background: -webkit-linear-gradient(to top, #000, rgba(0,0,0,0));
            background: linear-gradient(to top, #000, rgba(0,0,0,0));
          }
        `}</style>
        <div className='saturation-selector__white'>
          <div className='saturation-selector__black' />
          <div
            className='saturation-selector__pointer'
            style={pointerPosition}
          />
        </div>
      </div>
      </div>
    );
  }
}

export default Saturation;
