import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Input, Text } from '@rneui/themed';

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>Iniciar Sesión</Text>
      <Input placeholder="Email" />
      <Input placeholder="Contraseña" secureTextEntry />
      <Button title="Iniciar Sesión" containerStyle={styles.button} />
      <Button 
        title="¿No tienes cuenta? Regístrate" 
        type="clear"
        onPress={() => navigation.navigate('Register')}
      />
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
});