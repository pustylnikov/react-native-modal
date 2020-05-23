import React, {Component} from 'react';
import {Button, SafeAreaView, StatusBar, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import Modal, {AnimationTypes, ComposingTypes} from '../src';

type Props = {};

type State = {
    visible: boolean
    message: string | null
    title: string | null
};

class App extends Component<Props, State> {
    state: State = {
        visible: false,
        message: null,
        title: null,
    };

    showModal = (): void => {
        this.setState({
            visible: true,
            message: 'Nulla vulputate orci nunc, eu maximus orci dapibus at. Vestibulum sed felis tortor. Donec' +
                ' interdum iaculis pretium. Nunc vulputate rhoncus ligula ut bibendum. Nullam laoreet eget' +
                ' erat non scelerisque.',
            title: 'Nunc vulputate rhoncus',
        });
    }

    closeModal = (): void => {
        this.setState({
            visible: false,
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content"/>
                <SafeAreaView>
                    <Button
                        title="SHOW MODAL"
                        onPress={this.showModal}
                    />
                </SafeAreaView>
                <Modal
                    visible={this.state.visible}
                    showOverlayDuration={150}
                    showContentDuration={150}
                    hideOverlayDuration={150}
                    hideContentDuration={150}
                    showComposingType={ComposingTypes.PARALLEL}
                    showAnimationType={[AnimationTypes.SLIDE_UP]}
                    hideAnimationType={[AnimationTypes.SLIDE_UP]}
                    onOverlayPress={this.closeModal}
                    onBackButtonPress={this.closeModal}

                >
                    <View style={styles.modalContentView}>
                        <Text style={styles.modalTitleText}>{this.state.title}</Text>
                        <Text style={styles.modalContentText}>{this.state.message}</Text>
                        <View style={styles.buttonView}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={this.closeModal}
                            >
                                <Text style={styles.buttonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalContentView: {
        marginHorizontal: 30,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#999',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    modalTitleText: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 10,
    },
    modalContentText: {
        fontSize: 16,
        textAlign: 'center',
    },
    buttonView: {
        alignItems: 'center',
    },
    button: {
        marginTop: 10,
    },
    buttonText: {
        fontSize: 18,
        color: '#1b73a0',
        fontWeight: 'bold',
    },
});

export default App;
