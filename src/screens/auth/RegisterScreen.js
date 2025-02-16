import React, {useState} from 'react';
import {View, StyleSheet, Animated, ActivityIndicator, Modal} from 'react-native';
import {Button, Icon, Input, Text} from '@rneui/themed';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {auth, db} from '../../config/firebase';
import {doc, setDoc} from "firebase/firestore";
import LoadingModal from '../../components/LoadingModal';
import CustomModal from "../../components/CustomModal";

export default function RegisterScreen({navigation}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [isModalVisible, setIsModalVisible] = useState(false);

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        return passwordRegex.test(password);
    };
    const validateForm = () => {
        let errors = {};
        if (!email) errors.email = 'El email es requerido';
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email inválido';
        if (!password) errors.password = 'La contraseña es requerida';
        else if (!validatePassword(password)) {
            errors.password = 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial';
        }
        if (password !== confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
        }
        return errors;
    };

    const validateRegisterForm = () => {
        const isFirstNameValid = firstName.length > 0;
        const isLastNameValid = lastName.length > 0;
        const isEmailValid = email.length > 0;
        const isPasswordValid = password.length > 0;
        const isConfirmPasswordValid = confirmPassword.length > 0;
        return isEmailValid && isPasswordValid && isFirstNameValid && isLastNameValid && isConfirmPasswordValid;
    };

    const handleRegister = async () => {
        setIsLoading(true);
        setError('')
        try {
            let errors = validateForm();
            console.log(errors)
            if (errors.email) {
                setError('Error, ' + errors.email);
            } else if (errors.password) {
                setError('Error, ' + errors.password);
            } else if (errors.confirmPassword) {
                setError('Error, ' + errors.confirmPassword);
            } else {
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    await setDoc(doc(db, 'users', user.uid), {
                        firstName,
                        lastName,
                        email
                    });
                    console.log('Registered with:', user.email);
                    setIsModalVisible(true);
                } catch (error) {
                    throw error; // Lanza el error para que sea capturado por el catch externo
                }
            }
        } catch (error) {
            console.log('Error al registrarse: ' + error.message);
            console.log('Error al registrarse: ' + error.code);
            console.log('Error al registrarse: ' + error);
            if (error.code === 'auth/email-already-in-use') {
                setError('El EMAIL ya se encuentra en uso.');
            } else {
                setError('Error, no se pudo registrar al usuario.');
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

    const handleModalClose = () => {
        setIsModalVisible(false);
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <Text h3 style={styles.title}>Registro</Text>
            <Input
                placeholder="Nombre"
                value={firstName}
                onChangeText={setFirstName}
                leftIcon={{type: 'material', name: 'person'}}
            />
            <Input
                placeholder="Apellido"
                value={lastName}
                onChangeText={setLastName}
                leftIcon={{type: 'material', name: 'person'}}
            />
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
            <Input
                placeholder="Confirmar Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                leftIcon={{type: 'material', name: 'lock'}}
            />
            {error ? (
                <Animated.View style={styles.animateView}>
                    <Icon name="error-outline" size={20} color="#ff4444"
                          style={{marginRight: 5, marginBottom: 15}}/>
                    <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
            ) : null}
            <Button title="Registrarse"
                    disabled={!validateRegisterForm()}
                    onPress={handleRegister}
                    containerStyle={styles.button}/>
            <Button
                title="¿Ya tienes cuenta? Inicia sesión"
                type="clear"
                onPress={() => navigation.navigate('Login')}
            />
            <LoadingModal isLoading={isLoading}/>
            <CustomModal
                isVisible={isModalVisible}
                onClose={handleModalClose}
                title="Registro de Usuario"
                message="Se registro el usuario de forma correcta."
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
    }
    ,
    title: {
        textAlign: 'center',
        marginBottom:
            30,
    }
    ,
    button: {
        marginVertical: 10,
    }
    ,
    error: {
        color: 'red',
        textAlign:
            'center',
        marginBottom:
            10,
    }
    ,
    errorText: {
        color: '#ff4444',
        fontSize:
            14,
        marginBottom:
            15,
        textAlign:
            'center',
    },
    animateView: {
        flexDirection: 'row',
        alignItems:
            'center',
        paddingHorizontal:
            10,  // Espacio interno
        paddingTop:
            15,
        borderWidth:
            1, // Ancho del borde
        borderColor:
            '#ff4444', // Color del borde
        borderRadius:
            5, // Bordes redondeados
        backgroundColor:
            '#ffebee', // Fondo rojo claro
        justifyContent:
            'center'
    },
});