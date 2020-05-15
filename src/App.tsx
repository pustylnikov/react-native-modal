import React, { Component } from 'react';
import { Button, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Modal, { AnimationTypes, ComposingTypes } from '../module';

type Props = {};

type State = {
    visible: boolean;
};

class App extends Component<Props, State> {
    state: State = {
        visible: false,
    };

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView>
                    <Button
                        title="SHOW"
                        onPress={() => {
                            this.setState({ visible: true });
                        }}
                    />
                </SafeAreaView>
                <Modal
                    visible={this.state.visible}
                    showOverlayDuration={500}
                    showContentDuration={500}
                    hideOverlayDuration={500}
                    hideContentDuration={500}
                    showComposingType={ComposingTypes.PARALLEL}
                    showAnimationType={[AnimationTypes.SLIDE_UP]}
                    hideAnimationType={[AnimationTypes.SLIDE_DOWN]}

                >
                    <View style={styles.modalContentView}>
                        <Text style={styles.modalTitleText}>
                            Nulla vulputate orci
                        </Text>
                        <Text style={styles.modalContentText}>
                            Nulla vulputate orci nunc, eu maximus orci dapibus at. Vestibulum sed felis tortor. Donec
                            interdum iaculis pretium. Nunc vulputate rhoncus ligula ut bibendum. Nullam laoreet eget
                            erat non scelerisque.
                        </Text>
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
});

export default App;
