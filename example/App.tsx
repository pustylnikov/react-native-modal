import React, {Component, RefObject} from 'react';
import {Button, SafeAreaView, StatusBar, StyleSheet, View} from 'react-native';
import Modal, {AnimationTypes, ComposingTypes} from '../src';
import Alert from './Alert';

type Props = {};

type State = {
    visible: boolean
    message: string | null
    title: string | null
};

class App extends Component<Props, State> {

    modalRef: RefObject<Modal> | null = React.createRef();

    showFirstModal = (): void => {
        if (this.modalRef && this.modalRef.current) {
            this.modalRef.current.open({
                render: () => {
                    return <Alert title="Alert title" text="Alert text"/>;
                },
                overlayColor: 'rgba(0,0,0, 0.3)',
                showAnimationType: [AnimationTypes.SLIDE_UP],
                hideAnimationType: [AnimationTypes.SLIDE_UP],
            });
        }
    }

    showSecondModal = (): void => {
        if (this.modalRef && this.modalRef.current) {
            this.modalRef.current.open({
                render: () => {
                    return <Alert title="Alert title 2" text="Alert text 2"/>;
                },
                overlayColor: 'rgba(255,255,0, 0.3)',
                showAnimationType: [AnimationTypes.SLIDE_RIGHT],
                hideAnimationType: [AnimationTypes.SLIDE_LEFT],
            });
        }
    }

    closeModal = (): void => {
        if (this.modalRef && this.modalRef.current) {
            this.modalRef.current.close();
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content"/>

                <SafeAreaView style={styles.content}>
                    <View style={styles.button}>
                        <Button
                            title="SHOW MODAL 1"
                            onPress={this.showFirstModal}
                        />
                    </View>
                    <View style={styles.button}>
                        <Button
                            title="SHOW MODAL 2"
                            onPress={this.showSecondModal}
                        />
                    </View>
                </SafeAreaView>

                <Modal
                    ref={this.modalRef}
                    overlayColor="#fff"
                    showOverlayDuration={150}
                    showContentDuration={150}
                    hideOverlayDuration={150}
                    hideContentDuration={150}
                    showComposingType={ComposingTypes.PARALLEL}
                    showAnimationType={[AnimationTypes.SLIDE_UP]}
                    hideAnimationType={[AnimationTypes.SLIDE_UP]}
                    onOverlayPress={this.closeModal}
                    onBackButtonPress={this.closeModal}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    button: {
        marginVertical: 10,
    },
});

export default App;
