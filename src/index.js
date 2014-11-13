/* global window:true */
'use strict';

var React = require('react');
var merge = require('lodash.merge');
var Draggable = React.createFactory(require('react-draggable'));

function getRotationAngle(v, max, angle) {
  return angle * (v / max);
}

function rotate(deg) {
  var v = 'rotate('+deg+'deg)';
  return {
    transform: v,
    webkitTransform: v,
    mozTransform: v,
    oTransform: v,
    msTransform: v
  };
}

var defaultStyle = {
  position: 'relative',
  userSelect: 'none',
  webkitUserSelect: 'none',
  mozUserSelect: 'none',
  oUserSelect: 'none',
  msUserSelect: 'none'
};

// TODO: rotate back if stopped and didnt swipe right or left

var Swipeable = React.createClass({
  displayName: 'Swipeable',
  propTypes: {
    onDragStart: React.PropTypes.func,
    onDragStop: React.PropTypes.func,
    onDrag: React.PropTypes.func,
    onSwipeRight: React.PropTypes.func,
    onSwipeLeft: React.PropTypes.func,
    zIndex: React.PropTypes.number,
    rotationAngle: React.PropTypes.number
  },

  getDefaultProps: function(){
    return {
      rotationAngle: 20
    };
  },

  getInitialState: function(){
    return {
      rotation: 0,
      swiped: null
    };
  },

  componentDidMount: function(){
    this.setBreakPoint();
    window.addEventListener('resize', this.setBreakPoint);
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.setBreakPoint);
  },

  setBreakPoint: function(){
    var el = this.getDOMNode();
    var breakpoint = el.offsetWidth / 2;
    if (this.state.breakpoint !== breakpoint) {
      this.setState({breakpoint: breakpoint});
    }
  },

  componentDidUpdate: function(){
    this.setBreakPoint();
  },

  handleDrag: function(event, ui){
    if (this.state.swiped) {
      return;
    }

    var pos = ui.position.left;
    var rotateAngle = getRotationAngle(pos, this.state.breakpoint, this.props.rotationAngle);
    this.setState({rotation: rotateAngle});

    if (ui.position.left >= this.state.breakpoint) {
      this.setState({swiped: 'right'}, this.props.onSwipeRight);
    } else if (ui.position.left <= -this.state.breakpoint) {
      this.setState({swiped: 'left'}, this.props.onSwipeLeft);
    }

    if (this.props.onDrag) {
      this.props.onDrag(event, ui);
    }
  },

  handleDragStop: function(event, ui){
    if (ui.position.left !== this.state.breakpoint &&
      ui.position.left !== -this.state.breakpoint) {
      this.reset();
    }

    if (this.props.onDragStop) {
      this.props.onDragStop(event, ui);
    }
  },

  reset: function(){
    this.setState({rotation: 0});
    this.refs.draggable.reset();
  },

  render: function(){
    var style = merge(rotate(this.state.rotation), defaultStyle);

    var draggable = Draggable({
      ref: 'draggable',
      axis: 'x',
      onStart: this.props.onDragStart,
      onStop: this.handleDragStop,
      onDrag: this.handleDrag,
      zIndex: this.props.zIndex,
      ranges: {
        x: [-this.state.breakpoint, this.state.breakpoint]
      },
      style: style,
      className: this.props.className
    }, this.props.children);

    return draggable;
  }
});

module.exports = Swipeable;