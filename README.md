# Rick and Morty API

This is a NestJS-based proxy API for the public [Rick and Morty API](https://rickandmortyapi.com/). It provides endpoints to fetch information about characters and episodes, with added features like in-memory caching and rate limiting.

## Features

-   **NestJS Framework:** A progressive Node.js framework for building efficient and scalable server-side applications.
-   **Rick and Morty API Integration:** Fetches data directly from the official Rick and Morty API.
-   **In-Memory Caching:** Caches responses from the external API to improve performance and reduce redundant requests.
-   **Rate Limiting:** Limits the number of requests a client can make in a given time frame.
-   **Swagger Documentation:** Provides interactive API documentation using Swagger UI.

## Project Structure

The project follows a standard NestJS structure:

```
.
├── src
│   ├── core
│   │   ├── common/service/cacheInMemory  # In-memory cache implementation
│   │   └── config                      # Application configuration
│   ├── modules
│   │   └── rick-and-morty              # Main module with controllers and services
│   ├── app.module.ts                   # Root module of the application
│   └── main.ts                         # Application entry point
├── test
│   └── app.e2e-spec.ts                 # End-to-end tests
├── .env.example                        # Example environment variables file
└── package.json
```

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   [npm](https://www.npmjs.com/)

### Installation and Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the `.env.example` file.
    ```bash
    cp .env.example .env
    ```
    The `.env` file should contain the following variables:
    ```
    APP_PORT=3000
    RICK_API_BASE_URL=https://rickandmortyapi.com/api
    ```

4.  **Run the application in development mode:**
    ```bash
    npm run start:dev
    ```
    The server will start on the port defined in your `.env` file (default is `3000`).

## Running with Docker

You can also run the application using Docker.

1.  **Build the Docker image:**
    ```bash
    docker build -t rick-and-morty-api .
    ```

2.  **Run the Docker container:**
    ```bash
    docker run -d -p 3000:3000 \
      --name rick-and-morty-container \
      -e "APP_PORT=3000" \
      -e "RICK_API_BASE_URL=https://rickandmortyapi.com/api" \
      rick-and-morty-api
    ```
    The application will be available at `http://localhost:3000`.

## API Endpoints


Once the application is running, you can access the interactive API documentation (Swagger UI) at `http://localhost:3000/api`.

Here are the available endpoints:

### Episodes

-   **GET `/rick-and-morty/all-episodes`**
    -   **Description:** Retrieves a list of all episodes.
    -   **Response:** An array of episode objects.

-   **GET `/rick-and-morty/episode/:idEpisode`**
    -   **Description:** Retrieves details for a specific episode by its ID.
    -   **Parameters:** `idEpisode` (number) - The ID of the episode.
    -   **Response:** An episode object.

-   **GET `/rick-and-morty/episode/with-characters/:id`**
    -   **Description:** Retrieves details for a specific episode, including a full list of all characters that appeared in it.
    -   **Parameters:** `id` (number) - The ID of the episode.
    -   **Response:** An object containing episode details and an array of character objects.

### Characters

-   **GET `/rick-and-morty/all-characters`**
    -   **Description:** Retrieves a list of all characters.
    -   **Response:** An array of character objects.

-   **GET `/rick-and-morty/character/details/:id`**
    -   **Description:** Retrieves details for a specific character by their ID.
    -   **Parameters:** `id` (number) - The ID of the character.
    -   **Response:** A character object with detailed information.

## Running Tests

To run the test suite, use the following command:

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e
```