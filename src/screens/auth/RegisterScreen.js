import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Input, Text } from '@rneui/themed';

export default function RegisterScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text h3 style={styles.title}>Registro</Text>
      <Input placeholder="Email" />
      <Input placeholder="Contraseña" secureTextEntry />
      <Input placeholder="Confirmar Contraseña" secureTextEntry />
      <Button title="Registrarse" containerStyle={styles.button} />
      <Button 
        title="¿Ya tienes cuenta? Inicia sesión" 
        type="clear"
        onPress={() => navigation.navigate('Login')}
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