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

type AnyObject = { [key: string]: any };

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

export type ModalProperties = {
    render: () => ReactNode
    overlayColor?: string
    showOverlayDuration?: number
    showContentDuration?: number
    hideOverlayDuration?: number
    hideContentDuration?: number
    showComposingType?: ComposingTypes
    hideComposingType?: ComposingTypes
    showAnimationType?: AnimationTypes[]
    hideAnimationType?: AnimationTypes[]
    easingIn?: EasingFunction
    easingOut?: EasingFunction
    onClose?: () => void
    onOpen?: () => void
    onBackButtonPress?: () => void
    onOverlayPress?: () => void
}

type PreparedProperties = {
    render: () => ReactNode
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

export type ModalProps = {
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
    propsAreEqual?: (prevProps: Readonly<ModalProps>, nextProps: Readonly<ModalProps>) => boolean
}

type ModalState = {
    closing: boolean
    visible: boolean
}

const {width, height} = Dimensions.get('window');

export default class Modal extends Component<ModalProps, ModalState> {

    /**
     * Defines the default prop values
     */
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
     * Component state
     */
    state: ModalState = {
        visible: false,
        closing: false,
    };

    /**
     * Overlay animation
     */
    protected overlayAnimation: Animated.AnimatedValue = new Animated.Value(0);

    /**
     * Content animation
     */
    protected contentAnimation: Animated.AnimatedValue = new Animated.Value(0);

    /**
     * Indicates the component is opened
     */
    protected isOpen: boolean = false;

    /**
     * Indicates the component is mounted
     */
    protected mount: boolean = false;

    /**
     * Modal properties
     */
    protected properties: PreparedProperties = {...this.props, render: () => null};

    /**
     *  Returns animation styles for specified types
     *
     * @param types
     * @param inverse
     */
    protected getAnimationStyles = (types: AnimationTypes[], inverse: boolean): AnyObject => {
        return types.reduce((styles: { [key: string]: any }, type: AnimationTypes) => {
            switch (type) {
                case AnimationTypes.FADE:
                    styles.opacity = this.contentAnimation;
                    break;

                case AnimationTypes.SCALE:
                    styles.transform = [{scale: this.contentAnimation}];
                    break;

                case AnimationTypes.SLIDE_UP:
                    styles.top = this.contentAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [inverse ? -height : height, 0],
                    });
                    break;

                case AnimationTypes.SLIDE_DOWN:
                    styles.top = this.contentAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [inverse ? height : -height, 0],
                    });
                    break;

                case AnimationTypes.SLIDE_LEFT:
                    styles.left = this.contentAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [inverse ? -width : width, 0],
                    });
                    break;

                case AnimationTypes.SLIDE_RIGHT:
                    styles.left = this.contentAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [inverse ? width : -width, 0],
                    });
                    break;
            }
            return styles;
        }, {});
    };

    /**
     * Open modal
     */
    public open = (properties: ModalProperties): void => {

        this.isOpen = true;
        this.properties = {
            ...this.props,
            ...properties,
        };

        this.stopAnimations().then(() => {
            if (Platform.OS === 'android') {
                BackHandler.addEventListener('hardwareBackPress', this.backHandler);
            }

            this.setState({
                visible: true,
                closing: false,
            }, () => {
                setImmediate(() => {
                    const animations = [
                        Animated.timing(this.contentAnimation, {
                            toValue: 1,
                            duration: this.properties.showContentDuration,
                            easing: this.properties.easingIn,
                            useNativeDriver: false,
                        }),
                    ];

                    if (this.props.overlayColor !== 'transparent') {
                        animations.unshift(
                            Animated.timing(this.overlayAnimation, {
                                toValue: 1,
                                duration: this.properties.showOverlayDuration,
                                useNativeDriver: false,
                            }),
                        );
                    }

                    Animated[this.properties.showComposingType](animations).start(({finished}) => {
                        if (finished) {
                            this.properties.onOpen && this.properties.onOpen();
                        }
                    });
                });
            });
        });
    };

    /**
     * Close modal
     */
    public close = (): void => {

        this.isOpen = false;

        this.setState({
            closing: true,
        }, () => {
            this.stopAnimations().then(() => {
                if (Platform.OS === 'android') {
                    BackHandler.removeEventListener('hardwareBackPress', this.backHandler);
                }

                const animations = [
                    Animated.timing(this.contentAnimation, {
                        toValue: 0,
                        duration: this.properties.hideContentDuration,
                        easing: this.properties.easingOut,
                        useNativeDriver: false,
                    }),
                ];

                if (this.properties.overlayColor !== 'transparent') {
                    animations.push(
                        Animated.timing(this.overlayAnimation, {
                            toValue: 0,
                            duration: this.properties.hideOverlayDuration,
                            useNativeDriver: false,
                        }),
                    );
                }

                Animated[this.properties.hideComposingType](animations).start(({finished}) => {
                    if (finished) {
                        this.setState({
                            visible: false,
                            closing: false,
                        }, () => {
                            this.properties.onClose && this.properties.onClose();
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
    protected backHandler = (): boolean => {
        if (this.isOpen) {
            this.properties.onBackButtonPress && this.properties.onBackButtonPress();
            return true;
        }
        return false;
    };

    /**
     *  Stop animations
     *
     * @returns {Promise<void>}
     */
    protected stopAnimations = async (): Promise<void> => {
        await Promise.all([
            new Promise((resolve) => this.overlayAnimation.stopAnimation(resolve)),
            new Promise((resolve) => this.contentAnimation.stopAnimation(resolve)),
        ]);
    };

    /**
     * @override
     * @param state
     * @param callback
     */
    public setState = <K extends keyof ModalState>(state: Pick<ModalState, K>, callback?: () => any) => {
        if (this.mount) {
            super.setState(state, callback);
        }
    };

    /**
     * Mount
     */
    componentDidMount() {
        this.mount = true;
    }

    /**
     * Unmount
     */
    componentWillUnmount() {
        this.mount = false;
    }

    /**
     * @param nextProps
     * @param nextState
     */
    shouldComponentUpdate(nextProps: ModalProps, nextState: ModalState): boolean {
        const {propsAreEqual} = this.props;
        const {visible, closing} = this.state;
        return !(
            visible === nextState.visible
            && closing === nextState.closing
            && (propsAreEqual ? propsAreEqual(this.props, nextProps) : true)
        );
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

        const {overlayColor, onOverlayPress, render, showAnimationType, hideAnimationType} = this.properties;
        const animationStyles = this.getAnimationStyles(closing ? hideAnimationType : showAnimationType, closing);

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
                                    opacity: this.overlayAnimation,
                                },
                            ]}
                        /> : <View style={styles.overlayView}/>
                    }

                </TouchableWithoutFeedback>
                <Animated.View
                    pointerEvents={closing ? 'none' : 'box-none'}
                    style={[styles.contentAnimatedView, animationStyles]}
                >
                    {render()}
                </Animated.View>
            </View>
        );
    }
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
