import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet} from 'react-native';
import {auth, db} from '../../config/firebase';
import {sendPasswordResetEmail} from 'firebase/auth';
import {Input, Text, ThemeProvider} from '@rneui/themed';
import LoadingModal from "../../components/LoadingModal";
import {useNavigation} from "@react-navigation/native";
import CustomModal from "../../components/CustomModal";

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const navigation = useNavigation();

    const handlePasswordReset = () => {
        setIsLoading(true);
        sendPasswordResetEmail(auth, email)
            .then(() => {
                setIsModalVisible(true);
            })
            .catch(error => {
                console.error(error);
            }).finally(() => {
            setIsLoading(false);
        });
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            {/*<View>*/}
            {/*    <TextInput placeholder="Email" value={email} onChangeText={setEmail} />*/}
            {/*    <Button title="Reset Password" onPress={handlePasswordReset} />*/}
            {/*</View>*/}

            <Text h3 style={styles.title}>Recuperacion de Contraseña</Text>
            <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                leftIcon={{type: 'material', name: 'email'}}
            />
            <Button title="Recuperar Contraseña"
                    onPress={handlePasswordReset}
                    containerStyle={styles.button}/>
            <LoadingModal isLoading={isLoading}/>
            <CustomModal
                isVisible={isModalVisible}
                onClose={handleModalClose}
                title="Recuperación de Contraseña"
                message="Se envió un correo para resetear su contraseña."
            />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding:
            20,
        justifyContent:
            'center',
    },
    title: {
        textAlign: 'center',
        marginBottom:
            30,
    },
});