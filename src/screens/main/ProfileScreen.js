import React, {useCallback, useEffect, useState} from 'react';
import {Animated, Image, StyleSheet, View} from 'react-native';
import {Button, Input, Text} from '@rneui/themed';
import {auth, db} from '../../config/firebase';
import {updatePassword, updateProfile} from 'firebase/auth';
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import LoadingModal from "../../components/LoadingModal";
import {useFocusEffect} from "@react-navigation/native";
import CustomModal from "../../components/CustomModal";

export default function ProfileScreen() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, []) // Dependencias vacías para que solo se ejecute al enfocar la pantalla
    );

    const loadProfile = async () => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFirstName(userData.firstName);
                    setLastName(userData.lastName);
                    setImage(userData.photoURL);
                }
            }
            setIsLoading(false);
        };
        fetchUserData();
    };

    const handleUpdateProfile = async () => {
        setIsLoading(true); // Abrir el modal de carga
        const user = auth.currentUser;

        try {
            if (password) {
                await updatePassword(user, password);
            }

            await updateProfile(user, {
                displayName: `${firstName} ${lastName}`,
                photoURL: image
            });

            await updateDoc(doc(db, 'users', user.uid), {
                firstName,
                lastName,
                photoURL: image
            });

            setIsModalVisible(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false); // Cerrar el modal de carga
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImage(result.assets[0].uri);
        }
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <Image
                source={image ? { uri: image } : require('../../../assets/default-profile.png')}
                style={styles.image}
            />
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
                placeholder="Nuevo Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon={{type: 'material', name: 'lock'}}
            />
            <View style={{flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button title="Abrir la Galeria" onPress={pickImage}/>
                <Button title="Abrir la Camara" onPress={takePhoto}/>
            </View>
            <Button title="Update Profile" onPress={handleUpdateProfile} buttonStyle={styles.button}/>
            <LoadingModal isLoading={isLoading}/>
            <CustomModal
                isVisible={isModalVisible}
                onClose={handleModalClose}
                title="Actualizacion de Datos"
                message="Se actualizo los datos de forma correcta."
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        marginTop: 20,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 100,
        alignSelf: 'center',
        marginBottom: 20,
    },
});