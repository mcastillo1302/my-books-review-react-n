import React, {useEffect, useState} from 'react';
import {Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View,} from 'react-native';
import axios from 'axios';
import {IconButton, Searchbar, Text} from 'react-native-paper';
import {Button, Card, CheckBox} from '@rneui/themed';
import {auth, db} from '../../config/firebase';
import {deleteDoc, doc, getDoc, setDoc} from 'firebase/firestore';
import LoadingModal from "../../components/LoadingModal";
import {getAllBooks} from "../../api/booksApi";

export default function LibraryScreen() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null); // Libro seleccionado
  const [modalVisible, setModalVisible] = useState(false); // Estado del modal
  const [isBookFavorite, setIsBookFavorite] = useState(false); // Estado de favorito
  const userId = auth.currentUser.uid; // Reemplaza con el ID del usuario actual
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [filters, setFilters] = useState({
    all: true, // Filtro "all" seleccionado por defecto
    computers: false,
    fiction: false,
    education: false,
  });

  const toggleFavorite = async (book) => {
    setLoading(true);
    if (await isFavorite(userId, book.id)) {
      await removeFavorite(userId, book.id);
      setIsBookFavorite(false);
    } else {
      await addFavorite(userId, book);
      setIsBookFavorite(true);
    }
    setLoading(false);
  };

  const addFavorite = async (userId, book) => {
    try {
      const favoriteRef = doc(db, 'favorites', `${userId}_${book.id}`); // ID único para el favorito
      await setDoc(favoriteRef, {
        userId,
        bookId: book.id,
        title: book.title,
        authors: book.authors,
        publishedDate: book.publishedDate,
        description: book.description,
        thumbnail: book.imageLinks.thumbnail,
      });
      console.log('Libro agregado a favoritos');
    } catch (error) {
      console.error('Error al agregar a favoritos:', error);
    }
  };

  const removeFavorite = async (userId, bookId) => {
    try {
      const favoriteRef = doc(db, 'favorites', `${userId}_${bookId}`);
      await deleteDoc(favoriteRef);
      console.log('Libro eliminado de favoritos');
    } catch (error) {
      console.error('Error al eliminar de favoritos:', error);
    }
  };

  const isFavorite = async (userId, bookId) => {
    try {
      const favoriteRef = doc(db, 'favorites', `${userId}_${bookId}`);
      const favoriteDoc = await getDoc(favoriteRef);
      return favoriteDoc.exists(); // Devuelve true si el documento existe
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      return false;
    }
  };

  const searchBooks = async () => {
    if (!searchQuery.trim()) {
      setBooks([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
          'https://reactnd-books-api.udacity.com/search',
          {query: searchQuery.trim(), maxResults: 6},
          {
            headers: {
              Authorization: '123456',
              'Content-Type': 'application/json',
            },
          }
      );
      // for (const book of response.data.books) {
      //     console.log(`Title: ${book.title} -- Authors: ${book.authors} -- Published: ${book.publishedDate} -- Imagen: ${book.imageLinks?.thumbnail}`);
      // }

      if (response.data.books.error) {
        setBooks([]);
      } else {
        setBooks(response.data.books); // Guardar los resultados de la búsqueda
        applyFilters(filters, response.data.books)
      }
    } catch (error) {
      console.error('Error searching books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksData = await getAllBooks();
        setBooks(booksData);
        applyFilters(filters, booksData)
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const onChangeSearch = (query) => {
    setSearchQuery(query);
    if (query === '') {
      setBooks([]); // Limpiar resultados si el campo está vacío
    }
  };

  const openModal = async (book) => {
    setLoading(true);
    setSelectedBook(book); // Guardar el libro seleccionado
    setIsBookFavorite(await isFavorite(userId, book.id));
    setModalVisible(true); // Mostrar el modal
    setLoading(false);
  };

  const closeModal = () => {
    setModalVisible(false); // Ocultar el modal
    setSelectedBook(null); // Limpiar el libro seleccionado
  };

  // Función para manejar cambios en los filtros
  const handleFilterChange = (filter) => {
    let updatedFilters = {...filters};

    if (filter === 'all') {
      // Si se selecciona "all", desmarcar los demás filtros
      updatedFilters = {
        all: true,
        computer: false,
        fiction: false,
        education: false,
      };
    } else {
      // Si se selecciona otro filtro, desmarcar "all"
      updatedFilters.all = false;
      updatedFilters[filter] = !filters[filter];
    }

    setFilters(updatedFilters);
    applyFilters(updatedFilters, books); // Aplicar los nuevos filtros a los libros actuales
  };

  // Función para aplicar los filtros
  const applyFilters = (filters, booksToFilter) => {
    let filtered = booksToFilter;

    if (!filters.all) {
      // Si no está seleccionado "all", aplicar los filtros seleccionados
      const activeFilters = Object.keys(filters).filter(
          (key) => key !== 'all' && filters[key]
      );

      if (activeFilters.length > 0) {
        filtered = booksToFilter.filter((book) => {
          // Verificar si alguna categoría del libro coincide con los filtros activos
          return book.categories?.some((category) => {
            const lowerCaseCategory = category.toLowerCase();
            return activeFilters.some(
                (filter) => lowerCaseCategory === filter.toLowerCase()
            );
          });
        });
      }
    }

    setFilteredBooks(filtered); // Actualizar la lista de libros filtrados
  };

  return (
      <View style={styles.container}>
        <View style={styles.subContainer}>
          <Searchbar
              placeholder="Buscar libros..."
              onChangeText={onChangeSearch}
              value={searchQuery}
              onIconPress={searchBooks}
              onSubmitEditing={searchBooks}
          />
        </View>
        <View style={styles.filterContainer}>
          <View style={styles.checkboxRow}>
            {/* Columna 1 */}
            <View style={styles.checkboxColumn}>
              <CheckBox
                  title="Todos"
                  checked={filters.all}
                  onPress={() => handleFilterChange('all')}
                  textStyle={styles.checkboxText}
                  containerStyle={styles.checkboxItem}
              />
              <CheckBox
                  title="Computación"
                  checked={filters.computers}
                  onPress={() => handleFilterChange('computers')}
                  textStyle={styles.checkboxText}
                  containerStyle={styles.checkboxItem}
              />
            </View>

            {/* Columna 2 */}
            <View style={styles.checkboxColumn}>
              <CheckBox
                  title="Ficción"
                  checked={filters.fiction}
                  onPress={() => handleFilterChange('fiction')}
                  textStyle={styles.checkboxText}
                  containerStyle={styles.checkboxItem}
              />
              <CheckBox
                  title="Educación"
                  checked={filters.education}
                  onPress={() => handleFilterChange('education')}
                  textStyle={styles.checkboxText}
                  containerStyle={styles.checkboxItem}
              />
            </View>
          </View>
        </View>
        <ScrollView>
          {filteredBooks.map((book) => (
              <TouchableOpacity key={book.id} onPress={() => openModal(book)}>
                <Card key={book.id} containerStyle={styles.card}>
                  <View style={styles.cardContent}>
                    <Image
                        source={book.imageLinks ? {uri: book.imageLinks.thumbnail} : require('../../../assets/no-image-available.webp')}
                        style={styles.image}
                    />
                    <View style={styles.bookInfo}>
                      <Text style={styles.title}>{book.title}</Text>
                      <Text
                          style={styles.author}>{book.authors ? book.authors.join(', ') : 'No disponible'}</Text>
                      <Text
                          style={styles.categorie}>{book.categories ? book.categories.join(' | ') : 'No disponible'}</Text>
                      <Text
                          style={styles.date}>{book.publishedDate ? book.publishedDate : 'No disponible'}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
          ))}
        </ScrollView>
        <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={closeModal}
        >
          <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={closeModal}
          >
            <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
              {selectedBook && (
                  <>
                    <IconButton
                        icon={isBookFavorite ? "heart" : "heart-outline"}
                        iconColor={isBookFavorite ? "red" : "black"}
                        size={24}
                        onPress={() => toggleFavorite(selectedBook)}
                        style={styles.favoriteButton}
                    />
                    <View style={{paddingHorizontal: 20, paddingBottom: 20}}>
                      <Text style={styles.modalTitle}>{selectedBook.title}</Text>
                      <View style={styles.bookDetails}>
                        <Text style={styles.detailLabel}>Autor(es):</Text>
                        <Text
                            style={styles.detailValue}>{selectedBook.authors ? selectedBook.authors.join(', ') : 'No disponible'}</Text>
                      </View>
                      <View style={styles.bookDetails}>
                        <Text style={styles.detailLabel}>Fecha de publicación:</Text>
                        <Text
                            style={styles.detailValue}>{selectedBook.publishedDate ? selectedBook.publishedDate : 'No disponible'}</Text>
                      </View>
                      <View style={styles.bookDetails}>
                        <Text style={styles.detailLabel}>Categorias:</Text>
                        <Text
                            style={styles.detailValue}>{selectedBook.categories ? selectedBook.categories.join(' | ') : 'No disponible'}</Text>
                      </View>
                      <View style={styles.bookDetails}>
                        <Text style={styles.detailLabel}>Descripción:</Text>
                        <Text style={styles.detailValue}>{selectedBook.description
                            ? selectedBook.description.slice(0, 200) + (selectedBook.description.length > 200 ? '...' : '')
                            : 'No disponible'}</Text>
                      </View>
                      <Button title="Cerrar" onPress={closeModal}/>
                    </View>
                  </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
        <LoadingModal isLoading={loading}/>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  subContainer: {
    marginHorizontal: 16,
    marginTop: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  modalAuthor: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 10,
  },
  favoriteButton: {
    alignSelf: 'flex-end', // Alinea el botón a la derecha
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
    marginBottom: 10,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  categorie: {
    fontSize: 12,
    color: '#999',
  },
  date: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    justifyContent: 'buttom',
    width: '100%',
  },
  bookDetails: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  detailValue: {
    flex: 1,
    textAlign: 'justify'
  },
  filterContainer: {
    marginTop: 10,
    width: '93%',
    alignSelf: "center",
    borderWidth: 1, // Grosor del borde
    borderColor: '#ccc', // Color del borde
    borderRadius: 5, // Bordes redondeados (opcional)
    paddingVertical:10
  },
  checkboxRow: {
    flexDirection: 'row', // Organizar en fila
    justifyContent: 'space-between', // Espacio entre columnas
  },
  checkboxColumn: {
    width: '48%', // Ancho de cada columna
  },
  checkboxItem: {
    marginVertical: 2, // Reducir margen vertical
    paddingVertical: 0, // Eliminar padding vertical
  },
  checkboxText: {
    fontSize: 14, // Ajusta el tamaño de la letra
  },
});