## StockSenseAI

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### 🚀 Getting Started

To get started, follow these steps:

1. Install the necessary dependencies:

    ```bash
    npm install
    ```

2. Run the development server:

    ```bash
    npm run dev
    ```

Once the server is running, open your browser and navigate to [http://localhost:3000](http://localhost:3000) to see the app in action.

### 🔑 Set Up API Keys

To connect with external services, you'll need to add the following API keys to the project:

1. Create a `.env.local` file in the root directory of the project.
2. Add the following lines to the file, replacing the placeholders with your actual API keys:

    ```env
    ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
    FINNHUB_API_KEY=your-finnhub-key
    PERPLEXITY_API_KEY=your-perplexity-key
    ```

This will enable the application to authenticate and communicate with Alpha Vantage, Finnhub, and Perplexity services.

### ✏️ Start Editing

You can start editing the page by modifying `app/page.js`. The page will automatically update as you save your changes.

This project uses `next/font` to automatically optimize and load **Geist**, a modern font family from Vercel.

### 📚 Learn More

To dive deeper into Next.js, explore the following resources:

- [Next.js Documentation](https://nextjs.org/docs) – Learn about Next.js features and APIs.
- [Learn Next.js](https://nextjs.org/learn) – An interactive tutorial to get started with Next.js.
- [Next.js GitHub Repository](https://github.com/vercel/next.js) – Check out the source code, contribute, and give feedback.

### 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is via the [Vercel Platform](https://vercel.com), the creators of Next.js.

For detailed deployment instructions, check out the [Vercel Documentation](https://vercel.com/docs).
