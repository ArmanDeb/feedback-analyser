

## Building and Running

### Prerequisites

- Node.js 18+
- npm or pnpm
- Neon account (for the database)
- OpenRouter account (for the AI API)
- Netlify account (for deployment)

### Local Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**

    Create a `.env` file from the `.env.example` file and fill in the required API keys and database URL.

3.  **Initialize the database:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Available Scripts

-   `npm run dev`: Start the development server.
-   `npm run build`: Build the application for production.
-   `npm run preview`: Preview the production build locally.
-   `npm run check`: Run Svelte check and TypeScript compiler.
-   `npx prisma studio`: Open the Prisma Studio to view and edit data in the database.

## Development Conventions

-   **Styling:** The project uses Tailwind CSS for styling. Global styles and theme variables are defined in `src/app.css`.
-   **Authentication:** Authentication is handled by `lucia-auth`. User session data is managed in `src/hooks.server.ts`.
-   **Database:** The database schema is defined in `prisma/schema.prisma`. Prisma Client is used to interact with the database.
-   **Routing:** The application uses SvelteKit's file-based routing system. Routes are defined in the `src/routes` directory.
-   **API:** The backend API is built with SvelteKit's API routes and is located in `src/routes/api`.
