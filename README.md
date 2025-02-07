# Manga Reader

A modern, feature-rich manga reader web application built with Next.js 14, TypeScript, and Tailwind CSS. This application uses the MangaDex API to provide a seamless manga reading experience with a clean, responsive interface.

## Features

### Reading Experience
- 📖 Multiple reading modes (Single page / Continuous scroll)
- 🔄 Customizable reading direction (Left-to-right / Right-to-left)
- 🔍 Image zoom and pan functionality
- 🖼️ High-quality image loading with data saver option
- ⚡ Image preloading for smooth page transitions
- 📱 Responsive design for all devices

### Browse & Discover
- 🔥 Different manga lists (Popular, Trending, Hot, Latest)
- 🔍 Search functionality with debounced input
- ∞ Infinite scrolling for seamless browsing
- 🏷️ Manga tags and filtering
- 📊 Detailed manga information and chapter list

### User Experience
- 🌓 Dark/Light mode support
- 💾 Reading progress tracking
- ⚙️ Customizable reader settings
- 📱 Mobile-friendly interface
- 🎨 Modern, clean UI with Tailwind CSS

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **API**: [MangaDex API](https://api.mangadex.org/docs/)
- **Font**: [Geist](https://vercel.com/font)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/manga-reader.git
cd manga-reader
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
manga-reader/
├── app/                    # Next.js 14 app directory
│   ├── (routes)/          # Route groups
│   ├── components/        # React components
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utility functions and hooks
│   ├── api/              # API client and types
│   ├── hooks/            # Custom React hooks
│   └── store/            # Zustand store
├── public/               # Static files
└── ...config files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [MangaDex](https://mangadex.org/) for providing the API
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Vercel](https://vercel.com/) for the hosting platform and Geist font

## Support

If you find any bugs or have feature requests, please create an issue in the GitHub repository.
