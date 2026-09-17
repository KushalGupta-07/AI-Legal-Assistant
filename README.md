# LexiGuard AI

LexiGuard AI is a legal-document analysis assistant built with React, TypeScript, and Vite. It helps users review contracts and agreements by turning dense legal language into a clearer, more actionable summary with risk detection, clause analysis, and AI-driven legal Q&A.

## Overview

The application is designed for users who need to quickly understand:

- risk exposure in legal contracts
- key obligations and deadlines
- plain-English explanations of difficult clauses
- comparison between multiple documents
- action checklists for negotiation or compliance follow-up
- a lawyer-style preparation brief

## Features

- Upload and analyze legal documents
- Extract clause summaries and risk levels
- Show overall contract risk profile
- Split-view contract reading with highlighted risky clauses
- Compare multiple contracts side by side
- AI legal chat for document-specific questions
- Action checklist for next steps
- Lawyer consultation brief generation
- Gemini AI integration with local fallback legal parsing
- Dark mode interface and legal disclaimer banner

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google Gemini API via `@google/genai`
- `pdfjs-dist` and `mammoth` for document ingestion support
- Lucide icons for UI elements

## Project Structure

```bash
AI-Legal-Assistant/
├── public/
├── src/
│   ├── components/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── README.md
└── .gitignore
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app locally

```bash
npm run dev
```

This starts the Vite development server and serves the app in the browser.

### 3. Build for production

```bash
npm run build
```

### 4. Preview the production build

```bash
npm run preview
```

## Gemini API Configuration

The app supports Gemini-powered analysis. You can add your API key through the in-app modal or by setting an environment variable:

```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

If no API key is supplied, the app falls back to an intelligent local parser for demo/demo-style contract analysis.

## Important Legal Disclaimer

This tool is intended for legal information and document analysis support only. It is not a substitute for legal advice, and it does not constitute attorney-client representation.

## Notes

The app includes sample legal documents to demonstrate the full workflow without requiring a real uploaded contract.

## License

This project is for educational/demo purposes unless otherwise specified by the repository owner.
