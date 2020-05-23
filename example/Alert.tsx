import React, {FC} from 'react';
import {StyleSheet, Text, View} from 'react-native';

export type AlertProps = {
    title: string
    text: string
}

const Alert: FC<AlertProps> = ({title, text}) => (
    <View style={styles.modalContentView}>
        <Text style={styles.modalTitleText}>{title}</Text>
        <Text style={styles.modalContentText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    modalContentView: {
        marginHorizontal: 30,
        width: 320,
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

export default React.memo(Alert);
