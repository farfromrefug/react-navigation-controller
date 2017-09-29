'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _rebound = require('rebound');

var _rebound2 = _interopRequireDefault(_rebound);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _array = require('./util/array');

var _object = require('./util/object');

var _transition = require('./util/transition');

var Transition = _interopRequireWildcard(_transition);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* global requestAnimationFrame */


var SpringSystem = _rebound2.default.SpringSystem,
    SpringConfig = _rebound2.default.SpringConfig,
    OrigamiValueConverter = _rebound2.default.OrigamiValueConverter;
var mapValueInRange = _rebound2.default.MathUtil.mapValueInRange;


var isNumber = function isNumber(value) {
  return typeof value === 'number';
};
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
var isBool = function isBool(value) {
  return value === true || value === false;
};
var isArray = function isArray(value) {
  return Array.isArray(value);
};

var validate = function validate(validator) {
  return function (options, key, method) {
    if (!validator(options[key])) {
      throw new Error('Option "' + key + '" of method "' + method + '" was invalid');
    }
  };
};

var optionTypes = {
  pushView: {
    view: validate(_react2.default.isValidElement),
    transition: validate(function (x) {
      return isFunction(x) || isNumber(x);
    }),
    onComplete: validate(isFunction)
  },
  popView: {
    transition: validate(function (x) {
      return isFunction(x) || isNumber(x);
    }),
    onComplete: validate(isFunction)
  },
  popToRootView: {
    transition: validate(function (x) {
      return isFunction(x) || isNumber(x);
    }),
    onComplete: validate(isFunction)
  },
  setViews: {
    views: validate(function (x) {
      return isArray(x) && x.reduce(function (valid, e) {
        return valid === false ? false : _react2.default.isValidElement(e);
      }, true) === true;
    }),
    preserveState: validate(isBool),
    preserveDom: validate(isBool),
    transition: validate(function (x) {
      return isFunction(x) || isNumber(x);
    }),
    onComplete: validate(isFunction)
  }
};

/**
 * Validate the options passed into a method
 *
 * @param {string} method - The name of the method to validate
 * @param {object} options - The options that were passed to "method"
 */
function checkOptions(method, options) {
  var optionType = optionTypes[method];
  Object.keys(options).forEach(function (key) {
    if (optionType[key]) {
      var e = optionType[key](options, key, method);
      if (e) throw e;
    }
  });
}

var NavigationController = function (_React$Component) {
  _inherits(NavigationController, _React$Component);

  function NavigationController(props) {
    _classCallCheck(this, NavigationController);

    var _this = _possibleConstructorReturn(this, (NavigationController.__proto__ || Object.getPrototypeOf(NavigationController)).call(this, props));

    var _this$props = _this.props,
        views = _this$props.views,
        preserveState = _this$props.preserveState,
        preserveDom = _this$props.preserveDom;

    _this.state = {
      views: (0, _array.dropRight)(views),
      preserveState: preserveState,
      preserveDom: preserveDom,
      mountedViews: []
    };
    // React no longer auto binds
    var methods = ['__onSpringUpdate', '__onSpringAtRest'];
    methods.forEach(function (method) {
      _this[method] = _this[method].bind(_this);
    });
    return _this;
  }

  _createClass(NavigationController, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.__isTransitioning = false;
      this.__viewStates = [];
      this.__viewIndexes = [null, null];
      this.__springSystem = new SpringSystem();
      this.__spring = this.__springSystem.createSpring(this.props.transitionTension, this.props.transitionFriction);
      this.__spring.addListener({
        onSpringUpdate: this.__onSpringUpdate.bind(this),
        onSpringAtRest: this.__onSpringAtRest.bind(this)
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      delete this.__springSystem;
      this.__spring.removeAllListeners();
      delete this.__spring;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      // Push the last view
      this.pushView((0, _array.last)(this.props.views), {
        transition: Transition.type.NONE
      });
    }

    /**
     * Translate the view wrappers by a specified percentage
     *
     * @param {number} prevX
     * @param {number} prevY
     * @param {number} nextX
     * @param {number} nextY
     */

  }, {
    key: '__transformViews',
    value: function __transformViews(prevX, prevY, nextX, nextY) {
      var _this2 = this;

      var _viewIndexes = _slicedToArray(this.__viewIndexes, 2),
          prev = _viewIndexes[0],
          next = _viewIndexes[1];

      var prevView = this.refs['view-wrapper-' + prev];
      var nextView = this.refs['view-wrapper-' + next];
      requestAnimationFrame(function () {
        prevView.style.transform = 'translate(' + prevX + '%,' + prevY + '%)';
        prevView.style.zIndex = Transition.isReveal(_this2.state.transition) ? 1 : 0;
        nextView.style.transform = 'translate(' + nextX + '%,' + nextY + '%)';
        nextView.style.zIndex = Transition.isReveal(_this2.state.transition) ? 0 : 1;
      });
    }

    /**
     * Map a 0-1 value to a percentage for __transformViews()
     *
     * @param {number} value
     * @param {string} [transition] - The transition type
     * @return {array}
     */

  }, {
    key: '__animateViews',
    value: function __animateViews() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var transition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Transition.type.NONE;

      var prevX = 0;
      var prevY = 0;
      var nextX = 0;
      var nextY = 0;
      switch (transition) {
        case Transition.type.NONE:
        case Transition.type.PUSH_LEFT:
          prevX = mapValueInRange(value, 0, 1, 0, -100);
          nextX = mapValueInRange(value, 0, 1, 100, 0);
          break;
        case Transition.type.PUSH_RIGHT:
          prevX = mapValueInRange(value, 0, 1, 0, 100);
          nextX = mapValueInRange(value, 0, 1, -100, 0);
          break;
        case Transition.type.PUSH_UP:
          prevY = mapValueInRange(value, 0, 1, 0, -100);
          nextY = mapValueInRange(value, 0, 1, 100, 0);
          break;
        case Transition.type.PUSH_DOWN:
          prevY = mapValueInRange(value, 0, 1, 0, 100);
          nextY = mapValueInRange(value, 0, 1, -100, 0);
          break;
        case Transition.type.COVER_LEFT:
          nextX = mapValueInRange(value, 0, 1, 100, 0);
          break;
        case Transition.type.COVER_RIGHT:
          nextX = mapValueInRange(value, 0, 1, -100, 0);
          break;
        case Transition.type.COVER_UP:
          nextY = mapValueInRange(value, 0, 1, 100, 0);
          break;
        case Transition.type.COVER_DOWN:
          nextY = mapValueInRange(value, 0, 1, -100, 0);
          break;
        case Transition.type.REVEAL_LEFT:
          prevX = mapValueInRange(value, 0, 1, 0, -100);
          break;
        case Transition.type.REVEAL_RIGHT:
          prevX = mapValueInRange(value, 0, 1, 0, 100);
          break;
        case Transition.type.REVEAL_UP:
          prevY = mapValueInRange(value, 0, 1, 0, -100);
          break;
        case Transition.type.REVEAL_DOWN:
          prevY = mapValueInRange(value, 0, 1, 0, 100);
          break;
      }
      return [prevX, prevY, nextX, nextY];
    }

    /**
     * Called once a view animation has completed
     */

  }, {
    key: '__animateViewsComplete',
    value: function __animateViewsComplete() {
      this.__isTransitioning = false;

      var _viewIndexes2 = _slicedToArray(this.__viewIndexes, 2),
          prev = _viewIndexes2[0],
          next = _viewIndexes2[1];
      // Hide the previous view wrapper


      var prevViewWrapper = this.refs['view-wrapper-' + prev];
      prevViewWrapper.style.display = 'none';
      // Did hide view lifecycle event
      var prevView = this.refs['view-' + prev];
      if (prevView && typeof prevView.navigationControllerDidHideView === 'function') {
        prevView.navigationControllerDidHideView(this);
      }
      // Did show view lifecycle event
      var nextView = this.refs['view-' + next];
      if (nextView && typeof nextView.navigationControllerDidShowView === 'function') {
        nextView.navigationControllerDidShowView(this);
      }

      if (this.__nextViewList) {
        var topViewIndex = this.__nextViewList.length - 1;
        this.setState({
          transition: null,
          views: this.__nextViewList,
          mountedViews: [topViewIndex]
        });
        this.__nextViewList = null;
      } else {
        var _topViewIndex = this.state.views.length - 1;
        this.setState({
          transition: null,
          mountedViews: [_topViewIndex]
        });
      }
    }

    /**
     * Set the display style of the view wrappers
     *
     * @param {string} value
     */

  }, {
    key: '__displayViews',
    value: function __displayViews(value) {
      var _viewIndexes3 = _slicedToArray(this.__viewIndexes, 2),
          prev = _viewIndexes3[0],
          next = _viewIndexes3[1];

      this.refs['view-wrapper-' + prev].style.display = value;
      this.refs['view-wrapper-' + next].style.display = value;
    }

    /**
     * Transtion the view wrappers manually, using a built-in animation, or custom animation
     *
     * @param {string} transition
     * @param {function} [onComplete] - Called once the transition is complete
     */

  }, {
    key: '__transitionViews',
    value: function __transitionViews(options) {
      var _this3 = this;

      options = (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options : {};
      var defaults = {
        transitionTension: this.props.transitionTension,
        transitionFriction: this.props.transitionFriction
      };
      options = (0, _object.assign)({}, defaults, options);
      var _options = options,
          transition = _options.transition,
          transitionTension = _options.transitionTension,
          transitionFriction = _options.transitionFriction,
          onComplete = _options.onComplete;
      // Create a function that will be called once the

      this.__transitionViewsComplete = function () {
        delete _this3.__transitionViewsComplete;
        if (typeof onComplete === 'function') {
          onComplete();
        }
      };
      // Will hide view lifecycle event
      var prevView = this.refs['view-0'];
      if (prevView && typeof prevView.navigationControllerWillHideView === 'function') {
        prevView.navigationControllerWillHideView(this);
      }
      // Will show view lifecycle event
      var nextView = this.refs['view-1'];
      if (nextView && typeof nextView.navigationControllerWillShowView === 'function') {
        nextView.navigationControllerWillShowView(this);
      }
      // Built-in transition
      if (typeof transition === 'number') {
        // Manually transition the views
        if (transition === Transition.type.NONE) {
          this.__transformViews.apply(this, this.__animateViews(1, transition));
          requestAnimationFrame(function () {
            _this3.__animateViewsComplete();
            _this3.__transitionViewsComplete();
          });
        } else {
          // Otherwise use the springs
          this.__spring.setSpringConfig(new SpringConfig(OrigamiValueConverter.tensionFromOrigamiValue(transitionTension), OrigamiValueConverter.frictionFromOrigamiValue(transitionFriction)));
          this.__spring.setEndValue(1);
        }
      }
      // Custom transition
      if (typeof transition === 'function') {
        var _viewIndexes4 = _slicedToArray(this.__viewIndexes, 2),
            prev = _viewIndexes4[0],
            next = _viewIndexes4[1];

        var _prevView = this.refs['view-wrapper-' + prev];
        var _nextView = this.refs['view-wrapper-' + next];
        transition(_prevView, _nextView, function () {
          _this3.__animateViewsComplete();
          _this3.__transitionViewsComplete();
        });
      }
    }
  }, {
    key: '__onSpringUpdate',
    value: function __onSpringUpdate(spring) {
      if (!this.__isTransitioning) return;
      var value = spring.getCurrentValue();
      this.__transformViews.apply(this, this.__animateViews(value, this.state.transition));
    }
  }, {
    key: '__onSpringAtRest',
    value: function __onSpringAtRest(spring) {
      this.__animateViewsComplete();
      this.__transitionViewsComplete();
      this.__spring.setCurrentValue(0);
    }

    /**
     * Push a new view onto the stack
     *
     * @param {ReactElement} view - The view to push onto the stack
     * @param {object} [options]
     * @param {function} options.onComplete - Called once the transition is complete
     * @param {number|function} [options.transition] - The transition type or custom transition
     */

  }, {
    key: '__pushView',
    value: function __pushView(view, options) {
      var _this4 = this;

      options = (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options : {};
      var defaults = {
        transition: Transition.type.PUSH_LEFT
      };
      options = (0, _object.assign)({}, defaults, options, { view: view });
      checkOptions('pushView', options);
      if (this.__isTransitioning) return;
      var _options2 = options,
          transition = _options2.transition;

      var views = this.state.views.slice();
      // It's OK when length is 0, we have a view-wrapper--1.
      var prev = views.length - 1;
      var next = prev + 1;
      this.__viewIndexes = [prev, next];
      // Add the new view
      views = views.concat(view);
      // Push the view
      this.setState({
        transition: transition,
        views: views,
        mountedViews: this.__viewIndexes
      }, function () {
        // Show the wrappers
        _this4.__displayViews('block');
        // The view about to be hidden
        var prevView = _this4.refs['view-' + prev];
        if (prevView && _this4.state.preserveState) {
          // Save the state before it gets unmounted
          _this4.__viewStates.push(prevView.state);
        }
        // Transition
        _this4.__transitionViews(options);
      });
      this.__isTransitioning = true;
    }

    /**
     * Pop the last view off the stack
     *
     * @param {object} [options]
     * @param {function} [options.onComplete] - Called once the transition is complete
     * @param {number|function} [options.transition] - The transition type or custom transition
     */

  }, {
    key: '__popView',
    value: function __popView(options) {
      var _this5 = this;

      options = (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options : {};
      var defaults = {
        transition: Transition.type.PUSH_RIGHT
      };
      options = (0, _object.assign)({}, defaults, options);
      checkOptions('popView', options);
      if (this.state.views.length === 1) {
        throw new Error('popView() can only be called with two or more views in the stack');
      }
      if (this.__isTransitioning) return;
      var _options3 = options,
          transition = _options3.transition;

      var prev = this.state.views.length - 1;
      var next = prev - 1;
      this.__viewIndexes = [prev, next];

      this.__nextViewList = (0, _array.dropRight)(this.state.views);
      // Show the wrappers
      this.__displayViews('block');
      // Pop the view
      this.setState({
        transition: transition,
        mountedViews: this.__viewIndexes
      }, function () {
        // The view about to be shown
        var nextView = _this5.refs['view-' + next];
        if (nextView && _this5.state.preserveState) {
          var state = _this5.__viewStates.pop();
          // Rehydrate the state
          if (state) {
            nextView.setState(state);
          }
        }
        // Transition
        _this5.__transitionViews(options);
      });
      this.__isTransitioning = true;
    }

    /**
     * Replace the views currently managed by the controller
     * with the specified items.
     *
     * @param {array} views
     * @param {object} options
     * @param {function} [options.onComplete] - Called once the transition is complete
     * @param {number|function} [options.transition] - The transition type or custom transition
     * @param {boolean} [options.preserveState] - Wheter or not view states should be rehydrated
     * @param {boolean} [options.preserveDom] - Wheter or not view dom should be kept
     */

  }, {
    key: '__setViews',
    value: function __setViews(views, options) {
      var _this6 = this;

      options = (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options : {};
      checkOptions('setViews', options);
      var _options4 = options,
          _onComplete = _options4.onComplete,
          preserveState = _options4.preserveState,
          preserveDom = _options4.preserveDom;

      options = (0, _object.assign)({}, options, {
        onComplete: function onComplete() {
          _this6.__viewStates.length = 0;
          _this6.setState({
            views: views,
            preserveState: preserveState,
            preserveDom: preserveDom
          }, function () {
            if (_onComplete) {
              _onComplete();
            }
          });
        }
      });
      this.__pushView((0, _array.last)(views), options);
    }
  }, {
    key: '__popToRootView',
    value: function __popToRootView(options) {
      var _this7 = this;

      options = (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? options : {};
      var defaults = {
        transition: Transition.type.PUSH_RIGHT
      };
      options = (0, _object.assign)({}, defaults, options);
      checkOptions('popToRootView', options);
      if (this.state.views.length === 1) {
        throw new Error('popToRootView() can only be called with two or more views in the stack');
      }
      if (this.__isTransitioning) return;
      var _options5 = options,
          transition = _options5.transition;

      var rootView = this.state.views[0];
      this.__viewIndexes = [this.state.views.length - 1, 0];
      // Display only the root view
      this.__nextViewList = [rootView];
      // Show the wrappers
      this.__displayViews('block');
      // Pop from the top view, all the way to the root view
      this.setState({
        transition: transition,
        mountedViews: this.__viewIndexes
      }, function () {
        // The view that will be shown
        var rootView = _this7.refs['view-1'];
        if (rootView && _this7.state.preserveState) {
          var state = _this7.__viewStates[0];
          // Rehydrate the state
          if (state) {
            rootView.setState(state);
          }
        }
        // Clear view states
        _this7.__viewStates.length = 0;
        // Transition
        _this7.__transitionViews(options);
      });
      this.__isTransitioning = true;
    }
  }, {
    key: 'pushView',
    value: function pushView() {
      this.__pushView.apply(this, arguments);
    }
  }, {
    key: 'popView',
    value: function popView() {
      this.__popView.apply(this, arguments);
    }
  }, {
    key: 'popToRootView',
    value: function popToRootView() {
      this.__popToRootView.apply(this, arguments);
    }
  }, {
    key: 'setViews',
    value: function setViews() {
      this.__setViews.apply(this, arguments);
    }
  }, {
    key: '__renderNode',
    value: function __renderNode(node, index) {
      if (!node) return null;
      // If not preserveDom and this view is not visible now, return null.
      if (!this.props.preserveDom && this.state.mountedViews.indexOf(index) === -1) {
        return null;
      }
      return _react2.default.cloneElement(node, {
        ref: 'view-' + index,
        navigationController: this
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this8 = this;

      var className = (0, _classnames2.default)('ReactNavigationController', this.props.className);
      var wrapperClassName = (0, _classnames2.default)('ReactNavigationControllerView', {
        'ReactNavigationControllerView--transitioning': this.__isTransitioning
      });
      return _react2.default.createElement(
        'div',
        { className: className },
        _react2.default.createElement('div', { ref: 'view-wrapper--1' }),
        ' ',
        this.state.views.map(function (item, index) {
          return _react2.default.createElement(
            'div',
            { key: index, ref: 'view-wrapper-' + index, className: wrapperClassName },
            _this8.__renderNode(item, index)
          );
        })
      );
    }
  }]);

  return NavigationController;
}(_react2.default.Component);

NavigationController.propTypes = {
  views: _propTypes2.default.arrayOf(_propTypes2.default.element).isRequired,
  preserveState: _propTypes2.default.bool,
  preserveDom: _propTypes2.default.bool,
  transitionTension: _propTypes2.default.number,
  transitionFriction: _propTypes2.default.number,
  className: _propTypes2.default.oneOf([_propTypes2.default.string, _propTypes2.default.object])
};

NavigationController.defaultProps = {
  preserveState: false,
  preserveDom: false,
  transitionTension: 10,
  transitionFriction: 6
};

NavigationController.Transition = Transition;

exports.default = NavigationController;