import React, {useState} from 'react';
import {View, StyleSheet, Animated, ActivityIndicator, Modal} from 'react-native';
import {Button, Icon, Input, Text} from '@rneui/themed';
import {auth} from "../../config/firebase";
import {signInWithEmailAndPassword} from 'firebase/auth';
import LoadingModal from "../../components/LoadingModal";

export default function LoginScreen({navigation}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    const validateLoginForm = () => {
        const isEmailValid = /\S+@\S+\.\S+/.test(email);
        const isPasswordValid = password.length > 0;
        return isEmailValid && isPasswordValid;
    };

    const handleLogin = async () => {
        setIsLoading(true);
        setError('')
        try {
            console.log("Email: " + email)
            console.log("Password: " + password)

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            navigation.replace('TabNavigator');
        } catch (error) {
            console.log('Error al iniciar sesión: ' + error.message);
            console.log('Error al iniciar sesión: ' + error.code);
            console.log('Error al iniciar sesión: ' + error);
            if (error.code === 'auth/invalid-credential') {
                setError('Usuario y/o password invalido.');
            } else {
                setError('Error, no se pudo iniciar sesion.');
            }
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text h3 style={styles.title}>Iniciar Sesión</Text>
            <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                leftIcon={{type: 'material', name: 'email'}}
            />
            <Input
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon={{type: 'material', name: 'lock'}}
            />
            {error ? (
                <Animated.View style={styles.animateView}>
                    <Icon name="error-outline" size={20} color="#ff4444" style={{marginRight: 5, marginBottom: 15}}/>
                    <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
            ) : null}
            <Button title="Iniciar Sesión" containerStyle={styles.button}
                    disabled={!validateLoginForm()}
                    onPress={handleLogin}/>
            <Button
                title="¿No tienes cuenta? Regístrate"
                type="clear"
                onPress={() => navigation.navigate('Register')}
            />
            <Button
                title="¿Olvidaste tu password?"
                type="clear"
                onPress={() => navigation.navigate('ForgotPassword')}
            />
            <LoadingModal isLoading={isLoading}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 30,
    },
    button: {
        marginVertical: 10,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 14,
        marginBottom: 15,
        textAlign: 'center',
    },
    animateView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,  // Espacio interno
        paddingTop: 15,
        borderWidth: 1, // Ancho del borde
        borderColor: '#ff4444', // Color del borde
        borderRadius: 5, // Bordes redondeados
        backgroundColor: '#ffebee', // Fondo rojo claro
        justifyContent: 'center'
    },
});