"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const rebound = require("rebound");
const classNames = require("classnames");
const array_1 = require("./util/array");
const object_1 = require("./util/object");
const Transition = require("./util/transition");
exports.Transition = Transition;
const { SpringSystem, SpringConfig, OrigamiValueConverter } = rebound;
const { mapValueInRange } = rebound.util;
const isNumber = value => typeof value === 'number';
const isFunction = value => typeof value === 'function';
const isBool = value => value === true || value === false;
const isArray = value => Array.isArray(value);
const validate = validator => (options, key, method) => {
    if (!validator(options[key])) {
        throw new Error(`Option "${key}" of method "${method}" was invalid`);
    }
};
const optionTypes = {
    pushView: {
        view: validate(React.isValidElement),
        transition: validate(x => isFunction(x) || isNumber(x)),
        onComplete: validate(isFunction)
    },
    popView: {
        transition: validate(x => isFunction(x) || isNumber(x)),
        onComplete: validate(isFunction)
    },
    popToRootView: {
        transition: validate(x => isFunction(x) || isNumber(x)),
        onComplete: validate(isFunction)
    },
    setViews: {
        views: validate(x => isArray(x) &&
            x.reduce((valid, e) => {
                return valid === false ? false : React.isValidElement(e);
            }, true) === true),
        preserveState: validate(isBool),
        preserveDom: validate(isBool),
        transition: validate(x => isFunction(x) || isNumber(x)),
        onComplete: validate(isFunction)
    }
};
function checkOptions(method, options) {
    const optionType = optionTypes[method];
    Object.keys(options).forEach(key => {
        if (optionType[key]) {
            const e = optionType[key](options, key, method);
            if (e)
                throw e;
        }
    });
}
class NavigationController extends React.Component {
    constructor(props) {
        super(props);
        this.references = {};
        const { views, preserveState, preserveDom } = this.props;
        this.state = {
            views: array_1.dropRight(views),
            preserveState,
            preserveDom,
            mountedViews: [],
            transitionTension: 10,
            transitionFriction: 6
        };
        const methods = ['__onSpringUpdate', '__onSpringAtRest'];
        methods.forEach(method => {
            this[method] = this[method].bind(this);
        });
    }
    componentWillMount() {
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
    componentWillUnmount() {
        delete this.__springSystem;
        this.__spring.removeAllListeners();
        delete this.__spring;
    }
    componentDidMount() {
        this.pushView(array_1.last(this.props.views), {
            transition: Transition.type.NONE
        });
    }
    __transformViews(prevX, prevY, nextX, nextY) {
        const [prev, next] = this.__viewIndexes;
        const prevView = this.references[`view-wrapper-${prev}`];
        const nextView = this.references[`view-wrapper-${next}`];
        requestAnimationFrame(() => {
            prevView.style.transform = `translate(${prevX}%,${prevY}%)`;
            prevView.style.zIndex = Transition.isReveal(this.state.transition) ? 1 : 0;
            nextView.style.transform = `translate(${nextX}%,${nextY}%)`;
            nextView.style.zIndex = Transition.isReveal(this.state.transition) ? 0 : 1;
        });
    }
    __animateViews(value = 0, transition = Transition.type.NONE) {
        let prevX = 0;
        let prevY = 0;
        let nextX = 0;
        let nextY = 0;
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
    __animateViewsComplete() {
        this.__isTransitioning = false;
        const [prev, next] = this.__viewIndexes;
        const prevViewWrapper = this.references[`view-wrapper-${prev}`];
        prevViewWrapper.style.display = 'none';
        const prevView = this.references[`view-${prev}`];
        if (prevView && typeof prevView.navigationControllerDidHideView === 'function') {
            prevView.navigationControllerDidHideView(this);
        }
        const nextView = this.references[`view-${next}`];
        if (nextView && typeof nextView.navigationControllerDidShowView === 'function') {
            nextView.navigationControllerDidShowView(this);
        }
        if (this.__nextViewList) {
            const topViewIndex = this.__nextViewList.length - 1;
            this.setState({
                transition: null,
                views: this.__nextViewList,
                mountedViews: [topViewIndex]
            });
            this.__nextViewList = null;
        }
        else {
            const topViewIndex = this.state.views.length - 1;
            this.setState({
                transition: null,
                mountedViews: [topViewIndex]
            });
        }
    }
    __displayViews(value) {
        const [prev, next] = this.__viewIndexes;
        this.references[`view-wrapper-${prev}`].style.display = value;
        this.references[`view-wrapper-${next}`].style.display = value;
    }
    __transitionViews(options) {
        options = typeof options === 'object' ? options : {};
        const defaults = {
            transitionTension: this.props.transitionTension,
            transitionFriction: this.props.transitionFriction
        };
        options = object_1.assign({}, defaults, options);
        const { transition, transitionTension, transitionFriction, onComplete } = options;
        this.__transitionViewsComplete = () => {
            delete this.__transitionViewsComplete;
            if (typeof onComplete === 'function') {
                onComplete();
            }
        };
        const [prev, next] = this.__viewIndexes;
        console.log('__transitionViews', prev, next);
        const prevView = this.references[`view-${prev}`];
        const nextView = this.references[`view-${next}`];
        if (prevView && prevView !== nextView && typeof prevView.navigationControllerWillHideView === 'function') {
            prevView.navigationControllerWillHideView(this);
        }
        if (nextView && typeof nextView.navigationControllerWillShowView === 'function') {
            nextView.navigationControllerWillShowView(this);
        }
        if (typeof transition === 'number') {
            if (transition === Transition.type.NONE) {
                this.__transformViews.apply(this, this.__animateViews(1, transition));
                requestAnimationFrame(() => {
                    this.__animateViewsComplete();
                    this.__transitionViewsComplete();
                });
            }
            else {
                this.__spring.setSpringConfig(new SpringConfig(OrigamiValueConverter.tensionFromOrigamiValue(transitionTension), OrigamiValueConverter.frictionFromOrigamiValue(transitionFriction)));
                this.__spring.setEndValue(1);
            }
        }
        if (typeof transition === 'function') {
            const [prev, next] = this.__viewIndexes;
            const prevView = this.references[`view-wrapper-${prev}`];
            const nextView = this.references[`view-wrapper-${next}`];
            transition(prevView, nextView, () => {
                this.__animateViewsComplete();
                this.__transitionViewsComplete();
            });
        }
    }
    __onSpringUpdate(spring) {
        if (!this.__isTransitioning)
            return;
        const value = spring.getCurrentValue();
        this.__transformViews.apply(this, this.__animateViews(value, this.state.transition));
    }
    __onSpringAtRest(spring) {
        this.__animateViewsComplete();
        this.__transitionViewsComplete();
        this.__spring.setCurrentValue(0);
    }
    __pushView(view, options) {
        options = typeof options === 'object' ? options : {};
        const defaults = {
            transition: Transition.type.PUSH_LEFT
        };
        options = object_1.assign({}, defaults, options, { view });
        checkOptions('pushView', options);
        if (this.__isTransitioning)
            return;
        const { transition } = options;
        let views = this.state.views.slice();
        const prev = views.length - 1;
        const next = prev + 1;
        this.__viewIndexes = [prev, next];
        console.log('__viewIndexes', this.__viewIndexes);
        views = views.concat(view);
        this.setState({
            transition,
            views,
            mountedViews: this.__viewIndexes
        }, () => {
            this.__displayViews('block');
            const prevView = this.references[`view-${prev}`];
            if (prevView && this.state.preserveState) {
                this.__viewStates.push(prevView.state);
            }
            this.__transitionViews(options);
        });
        this.__isTransitioning = true;
    }
    __popView(options) {
        options = typeof options === 'object' ? options : {};
        const defaults = {
            transition: Transition.type.PUSH_RIGHT
        };
        options = object_1.assign({}, defaults, options);
        checkOptions('popView', options);
        if (this.state.views.length === 1) {
            throw new Error('popView() can only be called with two or more views in the stack');
        }
        if (this.__isTransitioning)
            return;
        const { transition } = options;
        const prev = this.state.views.length - 1;
        const next = prev - 1;
        this.__viewIndexes = [prev, next];
        this.__nextViewList = array_1.dropRight(this.state.views);
        this.__displayViews('block');
        this.setState({
            transition,
            mountedViews: this.__viewIndexes
        }, () => {
            const nextView = this.references[`view-${next}`];
            if (nextView && this.state.preserveState) {
                const state = this.__viewStates.pop();
                if (state) {
                    nextView.setState(state);
                }
            }
            this.__transitionViews(options);
        });
        this.__isTransitioning = true;
    }
    __setViews(views, options) {
        options = typeof options === 'object' ? options : {};
        checkOptions('setViews', options);
        const { onComplete, preserveState, preserveDom } = options;
        options = object_1.assign({}, options, {
            onComplete: () => {
                this.__viewStates.length = 0;
                this.setState({
                    views,
                    preserveState,
                    preserveDom
                }, () => {
                    if (onComplete) {
                        onComplete();
                    }
                });
            }
        });
        this.__pushView(array_1.last(views), options);
    }
    __popToRootView(options) {
        options = typeof options === 'object' ? options : {};
        const defaults = {
            transition: Transition.type.PUSH_RIGHT
        };
        options = object_1.assign({}, defaults, options);
        checkOptions('popToRootView', options);
        if (this.state.views.length === 1) {
            throw new Error('popToRootView() can only be called with two or more views in the stack');
        }
        if (this.__isTransitioning)
            return;
        const { transition } = options;
        const rootView = this.state.views[0];
        this.__viewIndexes = [this.state.views.length - 1, 0];
        this.__nextViewList = [rootView];
        this.__displayViews('block');
        this.setState({
            transition,
            mountedViews: this.__viewIndexes
        }, () => {
            const rootView = this.references[`view-1`];
            if (rootView && this.state.preserveState) {
                const state = this.__viewStates[0];
                if (state) {
                    rootView.setState(state);
                }
            }
            this.__viewStates.length = 0;
            this.__transitionViews(options);
        });
        this.__isTransitioning = true;
    }
    pushView(view, options) {
        this.__pushView(view, options);
    }
    popView(options) {
        this.__popView(options);
    }
    popToRootView(options) {
        this.__popToRootView(options);
    }
    setViews(views, options) {
        this.__setViews(views, options);
    }
    __renderNode(node, index) {
        if (!node)
            return null;
        if (!this.props.preserveDom && this.state.mountedViews.indexOf(index) === -1) {
            return null;
        }
        return React.cloneElement(node, {
            ref: p => {
                this.references[`view-${index}`] = p;
            },
            navigationController: this
        });
    }
    render() {
        const className = classNames('ReactNavigationController', this.props.className);
        const wrapperClassName = classNames('ReactNavigationControllerView', {
            'ReactNavigationControllerView--transitioning': this.__isTransitioning
        });
        return (React.createElement("div", { className: className, style: this.props.style },
            React.createElement("div", { ref: p => (this.references['view-wrapper--1'] = p) }),
            this.state.views.map((item, index) => {
                return (React.createElement("div", { key: index, ref: p => (this.references[`view-wrapper-${index}`] = p), className: wrapperClassName }, this.__renderNode(item, index)));
            })));
    }
}
NavigationController.Transition = Transition;
exports.default = NavigationController;
