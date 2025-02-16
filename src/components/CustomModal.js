import React from 'react';
import { View, Modal, Text, Button, StyleSheet } from 'react-native';

export default function CustomModal({ isVisible, onClose, title, message }) {
    return (
        <Modal
            transparent
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttonContainer}>
                        <Button title="OK" onPress={onClose} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: '90%',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        textAlign: 'justify', // Justificar el texto
        marginVertical: 20,
    },
    buttonContainer: {
        alignSelf: 'flex-end',
    },
});