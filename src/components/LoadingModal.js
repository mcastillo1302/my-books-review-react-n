import React from 'react';
import { Modal, View, ActivityIndicator, Text, StyleSheet } from 'react-native';

export default function LoadingModal({ isLoading }) {
    return (
        <Modal transparent visible={isLoading}>
            <View style={styles.modalBackground}>
                <View style={styles.activityIndicatorWrapper}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loadingText}>Cargando...</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
    },
    activityIndicatorWrapper: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        elevation: 5, // Sombra en Android
        shadowColor: '#000', // Sombra en iOS
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
});