 Library API — Books Resource

A RESTful API design for a library's **books** resource. All requests and
responses use JSON.

Base URL: `https://api.example-library.com`

---

Endpoints

1. List all books
- **Method:** `GET`
- **Path:** `/books`
- **Description:** Returns a list of all books.
- **Request body:** none
- **Success status:** `200 OK`

2. Get one book
- **Method:** `GET`
- **Path:** `/books/42`
- **Description:** Returns a single book by id.
- **Request body:** none
- **Success status:** `200 OK`
 3. Create a book
- **Method:** `POST`
- **Path:** `/books`
- **Description:** Creates a new book.
- **Request body:**
```json
{ "title": "Dune", "author": "Herbert", "year": 1965 }