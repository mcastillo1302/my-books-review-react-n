import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import LibraryScreen from '../screens/main/LibraryScreen';
import MyBooksScreen from '../screens/main/MyBooksScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import {Icon} from '@rneui/themed';
import {TouchableOpacity, StyleSheet, Text} from "react-native";

const Tab = createBottomTabNavigator();

export default function TabNavigator({ navigation }) {

  const handleLogout = () => {
    // navigation.navigate('Login')
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };
  return (
      <Tab.Navigator
          screenOptions={{
            headerShown: true,
            headerRight: () => (
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                  <Icon name="logout" size={20} color="#007AFF"/>
                  <Text style={styles.logoutText}>Cerrar sesión</Text>
                </TouchableOpacity>
            ),
          }}

      >
        <Tab.Screen
            name="Library"
            component={LibraryScreen}
            options={{
              title: 'Librería',
              tabBarIcon: ({color}) => <Icon name="book" size={28} color={color}/>,
            }}
        />
        <Tab.Screen
            name="MyBooks"
            component={MyBooksScreen}
            options={{
              title: 'Mis Libros',
              tabBarIcon: ({color}) => <Icon name="bookmark" size={28} color={color}/>,
            }}
        />
        <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: 'Perfil',
              tabBarIcon: ({color}) => <Icon name="person" size={28} color={color}/>,
            }}
        />
      </Tab.Navigator>
  );
}
const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row', // Alinea el ícono y el texto en una sola línea
    alignItems: 'center', // Centra verticalmente los elementos
    borderWidth: 1, // Grosor del borde
    borderColor: '#007AFF', // Color del borde (rojo)
    paddingHorizontal: 5, // Espacio interno horizontal
    paddingVertical: 4, // Espacio interno vertical
    borderRadius: 5, // Bordes redondeados
    backgroundColor: 'transparent', // Fondo transparente
    marginHorizontal: 5,
  },
  logoutText: {
    marginLeft: 8, // Espacio entre el ícono y el texto
    color: '#007AFF', // Color del texto (rojo)
    fontSize: 16, // Tamaño del texto
    fontWeight: 'bold', // Texto en negrita
  },
});