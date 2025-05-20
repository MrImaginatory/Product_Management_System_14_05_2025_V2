# Project 1 - Server

A Node.js/Express server for managing categories and products, with image upload support via Multer and Cloudinary, and MongoDB for data persistence.

## Features

- RESTful API for categories and products
- Image upload (local memory and Cloudinary integration)
- Input validation with Joi
- Centralized error handling
- Environment variable support via dotenv
- Modular route and middleware structure

## Tech Stack

- Node.js
- Express
- MongoDB (via Mongoose)
- Multer (file uploads)
- Cloudinary (image hosting)
- Joi (validation)
- dotenv

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB instance (local or remote)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the root directory with the following variables:

   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

   The server will run on the port specified in your `.env` file.

## API Endpoints

All endpoints are prefixed with `/api/v2`.

### Categories

- `POST /api/v2/categories` - Create a category (with image upload)
- `GET /api/v2/categories` - List all categories
- `GET /api/v2/categories/:id` - Get category by ID
- `PATCH /api/v2/categories/:id` - Update a category
- `DELETE /api/v2/categories/:id` - Delete a category

### Products

- `POST /api/v2/products` - Create a product (with images)
- `GET /api/v2/products` - List all products
- `GET /api/v2/products/:id` - Get product by ID
- `PATCH /api/v2/products/:id` - Update a product
- `DELETE /api/v2/products/:id` - Delete a product

## Project Structure

```
server/
   │   .env
   │   app.js
   │   index.js
   │   package-lock.json        
   │   package.json
   │   README.md
   ├───constants
   │       cloudinary.constant.js
   ├───controllers
   │       category.controller.js
   │       product.controller.js
   ├───database
   │       db.js
   ├───middlewares
   │       errorHandler.middleware.js
   │       multer.middleware.js
   ├───models
   │       category.model.js
   │       product.model.js
   ├───routes
   │       category.route.js
   │       product.route.js
   ├───services
   │       cloudinary.service.js
   ├───uploads
   ├───utils
   │       apiError.utils.js
   │       asyncWrapper.utils.js
   │       deleteCloudinary.utils.js
   │       extractCloudinaryPublic.util.js
   └───validators
         category.validator.js
         product.validator.js
```

## Development

- Uses `nodemon` for auto-reloading during development (`npm start`).
- Error handling is centralized.
- Image uploads are validated and stored in Cloudinary.

## License

ISC

## Author

MrImaginatory