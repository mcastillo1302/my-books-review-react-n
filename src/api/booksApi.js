const api = "https://reactnd-books-api.udacity.com";

// Generar un token único
let token = 'bolivar21';

const headers = {
    'Accept': 'application/json',
    'Authorization': token
};

export const getAllBooks = () =>
    fetch(`${api}/books`, { headers })
        .then(res => res.json())
        .then(data => data.books);