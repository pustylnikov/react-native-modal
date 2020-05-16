import React, {Component, ReactNode} from 'react';
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
    onClose?: () => void
    onOpen?: () => void
    onBackButtonPress?: () => void
    onOverlayPress?: () => void
}

type State = {
    visible: boolean
    closing: boolean
}

const {width, height} = Dimensions.get('window');

export default class Modal extends Component<ReactNativeModalProps, State> {

    static defaultProps = {
        visible: false,
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
        closing: false,
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
    shouldComponentUpdate(nextProps: ReactNativeModalProps, nextState: State) {
        if (this.props.visible !== nextProps.visible) {
            nextProps.visible ? this.open() : this.close();
            return false;
        }
        return this.state.visible !== nextState.visible || this.state.closing !== nextState.closing;
    }

    /**
     * Render component
     *
     * @returns {*}
     */
    render() {
        const {visible, closing} = this.state;

        if (!visible) {
            return null;
        }

        const {overlayColor, onOverlayPress, children, showAnimationType, hideAnimationType} = this._options;
        const animationStyles = this.getAnimationStyles(closing ? hideAnimationType : showAnimationType);

        return (
            <View style={styles.containerView}>
                <TouchableWithoutFeedback
                    onPress={() => (!closing && onOverlayPress) && onOverlayPress()}
                >
                    {
                        overlayColor !== 'transparent' ? <Animated.View
                            style={[
                                styles.overlayView,
                                {
                                    backgroundColor: overlayColor,
                                    opacity: this._overlayAnimation,
                                },
                            ]}
                        /> : <View style={styles.overlayView}/>
                    }

                </TouchableWithoutFeedback>
                <Animated.View
                    pointerEvents="box-none"
                    style={[styles.contentAnimatedView, animationStyles]}
                >
                    {children}
                </Animated.View>
            </View>
        );
    }

    /**
     *  Returns animation styles for specified types
     *
     * @param types
     */
    getAnimationStyles = (types: AnimationTypes[]) => {
        return types.reduce((styles: { [key: string]: any }, type: AnimationTypes) => {
            switch (type) {
                case AnimationTypes.FADE:
                    styles.opacity = this._contentAnimation;
                    break;

                case AnimationTypes.SCALE:
                    styles.transform = [{scale: this._contentAnimation}];
                    break;

                case AnimationTypes.SLIDE_UP:
                    styles.top = this._contentAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [height, 0],
                    });
                    break;

                case AnimationTypes.SLIDE_DOWN:
                    styles.top = this._contentAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-height, 0],
                    });
                    break;

                case AnimationTypes.SLIDE_LEFT:
                    styles.left = this._contentAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [width, 0],
                    });
                    break;

                case AnimationTypes.SLIDE_RIGHT:
                    styles.left = this._contentAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-width, 0],
                    });
                    break;
            }
            return styles;
        }, {});
    };

    /**
     * Open modal
     *
     * @param children
     * @param options
     */
    open = async (children?: ReactNode, options: { [key: string]: any } = {}) => {

        this._isOpen = true;

        this._options = {
            ...this.props,
            ...options,
            ...(children ? {children} : {}),
        };

        await this.stopAnimations();

        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.backHandler);
        }

        this.setState({
            visible: true,
            closing: false,
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

                Animated[this._options.showComposingType](animations).start(({finished}) => {
                    if (finished) {
                        this._options.onOpen && this._options.onOpen();
                    }
                });
            });
        });
    };

    /**
     * Close modal
     */
    close = () => {

        this._isOpen = false;

        this.setState({
            closing: true,
        }, () => {
            this.stopAnimations().then(() => {

                if (Platform.OS === 'android') {
                    BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
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

                Animated[this._options.hideComposingType](animations).start(({finished}) => {
                    if (finished) {
                        this.setState({
                            visible: false,
                            closing: false,
                        }, () => {
                            this._options.onClose && this._options.onClose();
                        });
                    }
                });
            });
        });
    };

    /**
     * Android back handler
     *
     * @returns {boolean}
     */
    backHandler = () => {
        if (this._isOpen) {
            this._options.onBackButtonPress && this._options.onBackButtonPress();
            return true;
        }
        return false;
    };

    /**
     *  Stop animations
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
     * @override
     * @param state
     * @param callback
     */
    setState = <K extends keyof State>(state: Pick<State, K>, callback?: () => any) => {
        if (this._mount) {
            super.setState(state, callback);
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
