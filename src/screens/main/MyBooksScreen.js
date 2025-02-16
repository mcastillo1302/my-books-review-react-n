import React, {useCallback, useState} from 'react';
import {FlatList, Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Card, Dialog, Icon, Text, Button, Input} from '@rneui/themed';
import {useFocusEffect} from '@react-navigation/native';
import {auth, db} from '../../config/firebase';
import {collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where, get} from 'firebase/firestore';
import LoadingModal from "../../components/LoadingModal";
import {AirbnbRating} from "@rneui/base";
import {IconButton} from "react-native-paper";

export default function MyBooksScreen() {
  const [loading, setLoading] = useState(true); // Estado para manejar la carga
  const [favorites, setFavorites] = useState([]);
  const userId = auth.currentUser.uid;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [favoriteToDelete, setFavoriteToDelete] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [favoritesBook, setFavoritesBook] = useState([]);
  const [modalReview, setModalReview] = useState(false);
  const [total, setTotal] = useState(0);

  // Función para cargar los favoritos
  const loadFavorites = async () => {
    setFavorites([]);
    setLoading(true);
    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);


      const favoritesData = [];

      for (const favDoc of querySnapshot.docs) {
        const favData = favDoc.data();

        const favoritesRef = collection(db, 'favorites');
        const q = query(favoritesRef, where('bookId', '==', favData.bookId));
        const querySnapshot = await getDocs(q);

        const totalFav = querySnapshot.docs.length
        console.log(querySnapshot.docs.length);

        const totalSum = querySnapshot.docs.reduce((accumulator, doc) => {
          return accumulator + (doc.data().rating||0);
        }, 0);

        console.log(totalSum);


        favoritesData.push({
          id: favDoc.id,
          ...favData,
          total: totalFav,
          promedio: (totalSum/totalFav).toFixed(1),
        });
      }

      // const favoritesData = querySnapshot.docs.map((doc) => ({
      //     id: doc.id,
      //     ...doc.data(),
      // }));

      setFavorites(favoritesData);

    } catch (error) {
      console.error('Error cargando favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Usar useFocusEffect para cargar los favoritos cuando la pantalla obtiene el foco
  useFocusEffect(
      useCallback(() => {
        loadFavorites();
      }, []) // Dependencias vacías para que solo se ejecute al enfocar la pantalla
  );

  const removeFavorite = async (favoriteId) => {
    setLoading(true)
    try {
      await deleteDoc(doc(db, 'favorites', favoriteId));
      setFavorites(favorites.filter((favorite) => favorite.id !== favoriteId)); // Actualizar el estado
      console.log('Favorito eliminado');
    } catch (error) {
      console.error('Error eliminando favorito:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (favorite) => {
    setSelectedFavorite(favorite);
    setRating(favorite.rating || 0);
    setReview(favorite.review || '');
    setModalVisible(true);
  };

  const handleRating = async () => {
    setLoading(true)
    try {
      if (selectedFavorite) {
        const bookRef = doc(db, 'favorites', selectedFavorite.id);
        await setDoc(bookRef, {rating, review}, {merge: true});
        setFavorites(favorites.map(favorite => favorite.id === selectedFavorite.id ? {
          ...favorite,
          rating,
          review
        } : favorite));
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error al grabar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (bookId) => {
    setLoading(true)
    try {

      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('bookId', '==', bookId));
      const querySnapshot = await getDocs(q);
      // const favsSnapshot = await db.collection('favorites').where('bookId', '==', bookId).get();
      const favsData = [];

      for (const favDoc of querySnapshot.docs) {
        const favData = favDoc.data();
        // const userSnapshot = await db.collection('users').doc(favData.userId).get();
        const userRef = doc(db, 'users', favData.userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        favsData.push({
          //...favData,
          id: favData.id,
          rating: favData.rating,
          review: favData.review,
          firstName: userData.firstName,
          lastName: userData.lastName,
        });
      }
      setFavoritesBook(favsData);
      setModalReview(true)
    } catch (error) {
      console.error('Error al cargar:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalReview(false);
  };

  return (
      <View style={styles.container}>
        <ScrollView>
          {favorites.map((favorite) => (
              <Card key={favorite.id} containerStyle={styles.card}>
                <View style={{flexDirection: 'column'}}>
                  <View style={styles.cardContent}>
                    <Image
                        source={{uri: favorite.thumbnail}}
                        style={styles.image}
                    />
                    {/* Datos del libro a la derecha */}
                    <View style={styles.bookInfo}>
                      <Text style={styles.title}>{favorite.title}</Text>
                      <Text style={styles.author}>{favorite.authors.join(', ')}</Text>
                      <Text style={styles.date}>{favorite.publishedDate}</Text>
                    </View>
                  </View>
                  <View style={{marginTop: 10}}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                      <View style={{flexDirection: 'row', alignItems:'center'}}>
                        <Text style={{color: 'black', fontSize: 14,}}>{favorite.promedio}</Text>
                        <AirbnbRating
                            size={15}
                            count={5}
                            defaultRating={favorite.promedio || 0}
                            showRating={false}
                            isDisabled={true}
                            fractions={1}
                        />
                        <TouchableOpacity style={styles.calificarLink}
                                          onPress={() => handleReview(favorite.bookId)}>
                          <Text style={styles.calificaTextLink}>({favorite.total})</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity style={styles.calificarLink}
                                          onPress={() => openModal(favorite)}>
                          <Text style={styles.calificaTextLink}>Calificar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                              setFavoriteToDelete(favorite);
                              setIsModalVisible(true);
                            }}
                        >
                          <Icon name="delete" size={24} color="red"/>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </Card>
          ))}
        </ScrollView>
        <LoadingModal isLoading={loading}/>
        <Dialog
            isVisible={isModalVisible}
            onBackdropPress={() => {
              setIsModalVisible(false);
            }}
        >
          <Dialog.Title title="Confirmación"/>
          <Text>Esta seguro de eliminar el libro de Favoritos?</Text>
          <Dialog.Actions>
            <Dialog.Button
                title="CONFIRM"
                onPress={() => {
                  if (favoriteToDelete) {
                    removeFavorite(favoriteToDelete.id); // Eliminar el favorito
                  }
                  setIsModalVisible(false); // Ocultar el modal
                }}
            />
            <Dialog.Button title="CANCEL" onPress={() => {
              setIsModalVisible(false);
            }}/>
          </Dialog.Actions>
        </Dialog>
        {selectedFavorite && (
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)'
              }}>
                <View style={{width: '90%', padding: 20, backgroundColor: 'white', borderRadius: 10}}>
                  <Text style={{
                    fontSize: 18,
                    marginBottom: 10,
                    fontWeight: 'bold',
                  }}>{selectedFavorite.title}</Text>
                  <AirbnbRating
                      count={5}
                      showRating={false}
                      defaultRating={rating}
                      size={20}
                      onFinishRating={setRating}
                  />
                  <Input
                      placeholder="Escribe una reseña"
                      value={review}
                      onChangeText={setReview}
                      multiline={true}
                      numberOfLines={4}
                      style={{height: 100, textAlignVertical: 'top'}}
                      containerStyle={{borderWidth: 1, borderColor: 'gray', borderRadius: 5}}
                  />
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 20}}>
                    <Button onPress={() => setModalVisible(false)}>Cancelar</Button>
                    <Button onPress={handleRating}>Guardar</Button>
                  </View>
                </View>
              </View>
            </Modal>
        )}
        <Modal
            visible={modalReview}
            animationType="slide"
            transparent={true}
            onRequestClose={closeModal}
        >
          <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={closeModal}
          >
            <View style={styles.modalContentReview} onStartShouldSetResponder={() => true}>
              <Text style={styles.title}>RESEÑAS</Text>
              <ScrollView style={{paddingTop:30}}>
                {favoritesBook.map((favorite) => (
                    <View style={{paddingHorizontal: 10, paddingBottom: 10, paddingTop:10}}>
                      <View style={styles.bookDetails}>
                        <Text style={styles.detailLabel}>Usuario:</Text>
                        <Text style={styles.detailValue}>{favorite.lastName}, {favorite.firstName}</Text>
                      </View>
                      <View style={styles.bookDetails}>
                        <Text style={styles.detailLabel}>Puntuacion:</Text>
                        <Text style={styles.detailValue}>
                          <AirbnbRating
                              size={15}
                              count={5}
                              defaultRating={favorite.rating || 0}
                              showRating={false}
                              isDisabled={true}
                          />
                        </Text>
                      </View>
                      <View style={styles.bookDetails}>
                        <Text style={styles.detailValue}>
                          {favorite.review}
                        </Text>
                      </View>
                      <View style={styles.separator} />
                    </View>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  subContainer: {
    margin: 16,
  },
  cardContent: {
    flexDirection: 'row', // Alinear imagen y datos horizontalmente
    alignItems: 'top', // Centrar verticalmente
  },
  image: {
    width: 80,
    height: 120,
    borderRadius: 5,
    marginRight: 16,
  },
  bookInfo: {
    flex: 1, // Ocupar el espacio restante
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalContentReview: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingHorizontal: 20,
  },
  deleteButtonModal: {
    backgroundColor: 'red',
    paddingHorizontal: 20,
  },
  calificarLink: {
    marginTop: 2,
    marginRight: 10
  },
  calificaText: {
    color: '#007BFF',
    fontSize: 14,
    textAlign: 'center',
  },
  calificaTextLink: {
    color: '#007BFF',
    fontSize: 14,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#CED0CE',
  },
  bookDetails: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  detailValue: {
    flex: 1,
    textAlign: 'justify'
  },
});