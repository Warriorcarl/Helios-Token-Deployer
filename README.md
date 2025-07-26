# Helios Chain Token Deployer with Precompile Contract Address

This is a refactored version of the Helios Chain Token Deployer that uses [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [wagmi](https://wagmi.sh/), and [RainbowKit](https://www.rainbowkit.com/) for a modern development experience and an improved wallet connection UI.

## Key Changes

- **Project Structure**: The project has been converted from a single HTML file into a standard React project structure managed by Vite.
- **Wallet Connection**: The manual wallet connection logic has been replaced with the `ConnectButton` component from RainbowKit, which provides a seamless UI for connecting various wallets.
- **State Management**: Blockchain interactions are now managed using hooks from `wagmi` (e.g., `useAccount`, `useBalance`, `useContractWrite`), simplifying state management and contract interactions.
- **Styling**: The CSS has been moved from an inline `<style>` tag to a separate `src/style.css` file.

## How to Run

1.  **Install dependencies**:
    You will need [Node.js](https://nodejs.org/) installed.

    ```bash
    npm install
    ```

2.  **Run the development server**:

    ```bash
    npm run dev
    ```

3.  Open your browser and navigate to `http://localhost:5173`.