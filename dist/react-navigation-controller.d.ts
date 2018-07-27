/// <reference types="react" />
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as Transition from './util/transition';
export interface NavigationControllerProps extends React.HTMLAttributes<{}> {
    views: PropTypes.element[];
    preserveState?: PropTypes.bool;
    preserveDom?: PropTypes.bool;
    transitionTension?: PropTypes.number;
    transitionFriction?: PropTypes.number;
}
export interface NavigationControllerState {
    views?: any[];
    transition?: Transition.type;
    preserveState?: boolean;
    preserveDom?: boolean;
    mountedViews: any[];
    transitionTension: number;
    transitionFriction: number;
}
declare class NavigationController extends React.Component<NavigationControllerProps, NavigationControllerState> {
    static Transition: typeof Transition;
    private __isTransitioning;
    private __viewStates;
    private __viewIndexes;
    private __springSystem;
    private __spring;
    private __nextViewList;
    constructor(props: any);
    componentWillMount(): void;
    componentWillUnmount(): void;
    componentDidMount(): void;
    __transformViews(prevX: any, prevY: any, nextX: any, nextY: any): void;
    __animateViews(value?: number, transition?: Transition.type): number[];
    __animateViewsComplete(): void;
    __displayViews(value: any): void;
    __transitionViewsComplete?: () => void;
    __transitionViews(options: any): void;
    __onSpringUpdate(spring: any): void;
    __onSpringAtRest(spring: any): void;
    __pushView(view: any, options?: any): void;
    __popView(options: any): void;
    __setViews(views: any, options?: any): void;
    __popToRootView(options: any): void;
    pushView(view: any, options?: any): void;
    popView(options?: any): void;
    popToRootView(options?: any): void;
    setViews(views: any, options?: any): void;
    __renderNode(node: React.ReactElement<any>, index: any): React.ReactElement<any>;
    references: {
        [k: string]: any;
    };
    render(): JSX.Element;
}
export { Transition };
export default NavigationController;
