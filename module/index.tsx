import React, { Component, ReactNode, RefObject } from 'react';
import {
    Animated,
    BackHandler,
    Dimensions,
    Easing,
    EasingFunction,
    Platform,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    ViewComponent,
} from 'react-native';

export enum ComposingTypes {
    PARALLEL = 'parallel',
    SEQUENCE = 'sequence',
}

export enum AnimationTypes {
    FADE = 'fade',
    SCALE = 'scale',
    SLIDE_UP = 'slide-up',
    SLIDE_DOWN = 'slide-down',
    SLIDE_LEFT = 'slide-left',
    SLIDE_RIGHT = 'slide-right',
}

export type ReactNativeModalProps = {
    visible: boolean
    allowClose: boolean
    children: ReactNode
    overlayColor: string
    showOverlayDuration: number
    showContentDuration: number
    hideOverlayDuration: number
    hideContentDuration: number
    showComposingType: ComposingTypes
    hideComposingType: ComposingTypes
    showAnimationType: AnimationTypes[]
    hideAnimationType: AnimationTypes[]
    easingIn: EasingFunction
    easingOut: EasingFunction
    onClose?: () => any
    onOpen?: () => any
}

type State = {
    visible: boolean
}

type AnimatedComponent = ViewComponent & {
    _attachProps: (params?: { [key: string]: any }) => void
}

const { width, height } = Dimensions.get('window');

export default class Modal extends Component<ReactNativeModalProps, State> {

    static defaultProps = {
        visible: false,
        allowClose: true,
        overlayColor: 'rgba(0, 0, 0, 0.3)',
        showOverlayDuration: 150,
        showContentDuration: 150,
        hideOverlayDuration: 150,
        hideContentDuration: 150,
        showComposingType: ComposingTypes.PARALLEL,
        hideComposingType: ComposingTypes.PARALLEL,
        showAnimationType: [AnimationTypes.FADE],
        hideAnimationType: [AnimationTypes.FADE],
        easingIn: Easing.ease,
        easingOut: Easing.ease,
    };

    /**
     *
     * @type {object}
     */
    state = {
        visible: this.props.visible,
    };

    /**
     *
     * @type {Animated.AnimatedValue}
     * @private
     */
    _overlayAnimation: Animated.AnimatedValue = new Animated.Value(+this.props.visible);

    /**
     *
     * @type {Animated.AnimatedValue}
     * @private
     */
    _contentAnimation: Animated.AnimatedValue = new Animated.Value(+this.props.visible);

    /**
     *
     * @type {Boolean}
     * @private
     */
    _isOpen: boolean = this.props.visible;

    /**
     *
     * @type {object|null}
     * @private
     */
    _options: ReactNativeModalProps = this.props;

    /**
     *
     * @type {boolean}
     * @private
     */
    _mount: boolean = false;

    /**
     *
     * @type {React.RefObject<any>}
     * @private
     */
    _contentAnimatedViewRef: RefObject<AnimatedComponent> = React.createRef();

    /**
     * Mount
     */
    componentDidMount() {
        this._mount = true;
    }

    /**
     * Unmount
     */
    componentWillUnmount() {
        this._mount = false;
    }

    /**
     *
     * @param {object} nextProps
     * @param {object} nextState
     * @returns {boolean}
     */
    shouldComponentUpdate(nextProps: ReactNativeModalProps, nextState: ReactNativeModalProps) {
        if (this.props.visible !== nextProps.visible
            || (this.state.visible !== nextProps.visible && this.state.visible === nextState.visible)
        ) {
            nextProps.visible ? this.open() : this.close();
            return false;
        }
        return !(this.state.visible === nextProps.visible && this.state.visible === nextState.visible);
    }

    /**
     * Render component
     *
     * @returns {*}
     */
    render() {
        const { visible } = this.state;

        if (!visible) {
            return null;
        }

        const { overlayColor, allowClose, children, showAnimationType } = this._options;
        const animationStyles = this.getAnimationStyles(showAnimationType, false);

        return (
            <View style={styles.containerView}>
                <TouchableWithoutFeedback onPress={() => allowClose && this.close()}>
                    {
                        overlayColor !== 'transparent' ? <Animated.View
                            style={[
                                styles.overlayView,
                                {
                                    backgroundColor: overlayColor,
                                    opacity: this._overlayAnimation,
                                },
                            ]}
                        /> : <View style={styles.overlayView} />
                    }

                </TouchableWithoutFeedback>
                <Animated.View
                    // @ts-ignore
                    ref={this._contentAnimatedViewRef}
                    pointerEvents="box-none"
                    style={[styles.contentAnimatedView, animationStyles]}
                >
                    {children}
                </Animated.View>
            </View>
        );
    }

    /**
     *
     * @param types
     * @param inverse
     */
    getAnimationStyles = (types: AnimationTypes[], inverse: boolean) => {
        return types.reduce((styles: { [key: string]: any }, type: AnimationTypes) => {
            switch (type) {
            case AnimationTypes.FADE:
                styles.opacity = this._contentAnimation;
                break;

            case AnimationTypes.SCALE:
                styles.transform = [{ scale: this._contentAnimation }];
                break;

            case AnimationTypes.SLIDE_UP:
                styles.top = this._contentAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [inverse ? -height : height, 0],
                });
                break;

            case AnimationTypes.SLIDE_DOWN:
                styles.top = this._contentAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [inverse ? height : -height, 0],
                });
                break;

            case AnimationTypes.SLIDE_LEFT:
                styles.left = this._contentAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [inverse ? -width : width, 0],
                });
                break;

            case AnimationTypes.SLIDE_RIGHT:
                styles.left = this._contentAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [inverse ? width : -width, 0],
                });
                break;
            }
            return styles;
        }, {});
    };

    /**
     *
     * Open modal
     *
     * @param {node} children
     * @param {object} options
     */
    open = (children?: ReactNode, options: { [key: string]: any } = {}) => {

        return new Promise(async (resolve) => {

            await this.close();

            this._isOpen = true;

            this._options = {
                ...this.props,
                ...options,
                ...(children ? { children } : {}),
            };

            await this.stopAnimations();

            if (Platform.OS === 'android') {
                BackHandler.addEventListener('hardwareBackPress', this.backHandler);
            }

            this._setState({
                visible: true,
            }, () => {
                setImmediate(() => {
                    const animations = [
                        Animated.timing(this._contentAnimation, {
                            toValue: 1,
                            duration: this._options.showContentDuration,
                            easing: this._options.easingIn,
                            useNativeDriver: false,
                        }),
                    ];

                    if (this._options.overlayColor !== 'transparent') {
                        animations.unshift(
                            Animated.timing(this._overlayAnimation, {
                                toValue: 1,
                                duration: this._options.showOverlayDuration,
                                useNativeDriver: false,
                            }),
                        );
                    }

                    Animated[this._options.showComposingType](animations).start(({ finished }) => {
                        if (finished) {
                            this._options.onOpen && this._options.onOpen();
                        }
                        return resolve();
                    });
                });
            });
        });
    };

    /**
     * Close modal
     *
     * @returns {Promise<any>}
     */
    close = () => {
        return new Promise((resolve) => {
            if (!this._isOpen) {
                return resolve();
            }

            this._isOpen = false;

            this.stopAnimations().then(() => {

                if (Platform.OS === 'android') {
                    BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
                }

                if (this._contentAnimatedViewRef.current) {
                    this._contentAnimatedViewRef.current._attachProps({
                        style: [
                            styles.contentAnimatedView,
                            this.getAnimationStyles(this._options.hideAnimationType, true),
                        ],
                    });
                }

                const animations = [
                    Animated.timing(this._contentAnimation, {
                        toValue: 0,
                        duration: this._options.hideContentDuration,
                        easing: this._options.easingOut,
                        useNativeDriver: false,
                    }),
                ];

                if (this._options.overlayColor !== 'transparent') {
                    animations.push(
                        Animated.timing(this._overlayAnimation, {
                            toValue: 0,
                            duration: this._options.hideOverlayDuration,
                            useNativeDriver: false,
                        }),
                    );
                }

                Animated[this._options.hideComposingType](animations).start(({ finished }) => {
                    if (finished) {
                        this._setState({
                            visible: false,
                        }, () => {
                            resolve();
                            this._options.onClose && this._options.onClose();
                            return;
                        });
                    }
                    return resolve();
                });
            });
        });
    };

    /**
     *
     * @returns {boolean}
     */
    backHandler = () => {
        if (this._isOpen) {
            this._options.allowClose && this.close();
            return true;
        }
        return false;
    };

    /**
     *
     * @returns {Promise<void>}
     */
    stopAnimations = async (): Promise<void> => {
        await Promise.all([
            new Promise((resolve) => this._overlayAnimation.stopAnimation(resolve)),
            new Promise((resolve) => this._contentAnimation.stopAnimation(resolve)),
        ]);
    };

    /**
     *
     * @param state
     * @param callback
     * @private
     */
    _setState = (state: State, callback?: () => any) => {
        if (this._mount) {
            this.setState(state, callback);
        }
    };

}

const styles = StyleSheet.create({
    containerView: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        elevation: 999,
        zIndex: 10000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayView: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    contentAnimatedView: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
