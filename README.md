# MirrorMind

An advanced AI-powered journaling web app that helps you understand your emotions and thoughts through intelligent analysis combining multiple AI techniques.

## ✨ Features

### Core Capabilities
- **Dual AI Analysis**: Combines keyword detection with advanced machine learning models
- **HuggingFace Integration**: State-of-the-art summarization and sentiment analysis
- **Hybrid Storage**: Switch between local storage and MongoDB cloud database
- **Privacy-First**: Works completely offline or with optional cloud sync
- **Dark Mode**: Comfortable journaling in any lighting
- **Responsive Design**: Perfect experience on any device

### AI Intelligence

**Synergy AI System**:
- **BART Summarization** (`facebook/bart-large-cnn`): Professional-grade text summarization
- **DistilBERT Sentiment** (`distilbert-base-uncased-finetuned-sst-2-english`): Advanced emotion detection
- **Keyword Analysis**: Fast, offline mood detection
- **Smart Combination**: Best of both worlds with intelligent fallbacks

**Mood Detection**:
- Positive (optimistic, joyful states)
- Calm (peaceful, relaxed feelings)
- Anxious (worried, stressed emotions)
- Neutral (balanced or unclear moods)

### Storage Options

**localStorage** (Default):
- Instant access
- Complete privacy
- Works offline
- No setup required

**MongoDB** (Optional):
- Cloud persistence
- Multi-device access
- Scalable storage
- Easy migration

## 🚀 Quick Start

### Basic Setup (No Configuration)

```bash
# Clone the repository
git clone https://github.com/yourusername/mirrormind.git
cd mirrormind

# Install dependencies
npm install

# Run development server
npm run dev
```

The app works immediately with keyword-based AI and localStorage!

### Advanced Setup (With ML Models + Cloud)

1. **Get HuggingFace API Token**:
   - Visit https://huggingface.co/settings/tokens
   - Create a free account and generate a token
   - Free tier: 30,000 characters/month

2. **Set Up MongoDB** (Optional):
   - Visit https://mongodb.com/cloud/atlas
   - Create a free M0 cluster (512 MB storage)
   - Get your connection string

3. **Configure Environment**:
```bash
# Create .env.local file
cp .env.example .env.local

# Add your credentials:
HUGGINGFACE_API_TOKEN=your_token_here
MONGODB_URI=your_mongodb_connection_string
```

4. **Restart Development Server**:
```bash
npm run dev
```

## 📖 Usage

### Writing & Reflecting

1. **Write** your thoughts in the journal editor
2. **Toggle** "Advanced AI (HuggingFace)" for ML-powered analysis
3. **Click** "Reflect" to get insights
4. **Review** your mood, summary, and reflection question
5. **Track** all entries in "My Reflections"

### AI Modes

**Basic Mode** (Checkbox unchecked):
- Uses keyword-based analysis
- Instant results (< 1 second)
- Works offline
- No API required

**Advanced Mode** (Checkbox checked):
- Uses HuggingFace ML models
- More accurate results (2-5 seconds)
- Requires API token
- Better summarization

### Storage Modes

**localStorage** (Default):
- Automatic, no setup
- Data stays in browser
- Perfect for privacy

**MongoDB** (Optional):
```typescript
// In browser console or component:
import { setUseAPI } from "@/lib/storage";

// Enable cloud storage
setUseAPI(true);

// Migrate existing entries
import { syncLocalToAPI } from "@/lib/storage";
await syncLocalToAPI();
```

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS with custom theme system
- **Animations**: Framer Motion
- **AI/ML**: HuggingFace Inference API (BART, DistilBERT)
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Vercel (optimized for Next.js)

## 📁 Project Structure

```
mirrormind/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts      # AI analysis endpoint
│   │   └── entries/route.ts      # CRUD operations
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── reflections/page.tsx      # Timeline view
│   └── globals.css               # Global styles
├── components/
│   ├── JournalEditor.tsx         # Main editor with AI toggle
│   ├── Navbar.tsx                # Navigation
│   └── ThemeProvider.tsx         # Dark mode context
├── lib/
│   ├── ai.ts                     # Synergy AI logic
│   ├── mongodb.ts                # Database connection
│   ├── storage.ts                # Hybrid storage
│   ├── types.ts                  # TypeScript types
│   └── models/
│       └── JournalEntry.ts       # Mongoose schema
└── public/                       # Static assets
```

## 🎯 API Endpoints

### `POST /api/analyze`
Analyze journal text with AI

**Request**:
```json
{
  "text": "Your journal entry...",
  "useHuggingFace": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": "Concise summary of your entry",
    "mood": "positive",
    "reflection": "What brought you joy today?"
  }
}
```

### `GET /api/entries`
Retrieve journal entries

**Query Params**:
- `userId`: string (default: "anonymous")
- `limit`: number (default: 50)

### `POST /api/entries`
Create new journal entry

### `DELETE /api/entries`
Delete entries (single or all)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `HUGGINGFACE_API_TOKEN`
   - `MONGODB_URI`
4. Deploy!

Vercel automatically detects Next.js and configures everything.

### Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
HUGGINGFACE_API_TOKEN=hf_xxxxx
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mirrormind
```

## 📊 Performance

| Metric | Value |
|--------|-------|
| Keyword Analysis | < 1 second |
| HuggingFace Analysis | 2-5 seconds |
| MongoDB Query | < 500ms |
| localStorage | Instant |
| First Load | 1-2 seconds |
| Lighthouse Score | 90+ |

## 🔒 Privacy & Security

- **No Tracking**: Zero analytics or third-party scripts
- **Local-First**: Data can stay entirely in your browser
- **Optional Cloud**: MongoDB only if you enable it
- **Open Source**: Fully auditable code
- **Encrypted**: MongoDB connections use TLS

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)**: Detailed setup instructions
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)**: Technical architecture
- **[IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)**: Feature overview
- **[DEVELOPMENT.md](DEVELOPMENT.md)**: Development notes
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Deployment guide

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🎓 Learning Resources

This project demonstrates:
- Next.js 14 App Router patterns
- TypeScript best practices
- AI/ML API integration
- MongoDB/Mongoose usage
- Hybrid storage strategies
- RESTful API design
- Progressive enhancement
- Error handling and fallbacks

## 🌟 Acknowledgments

- **HuggingFace**: For amazing free ML models
- **MongoDB**: For generous free tier
- **Vercel**: For seamless deployment
- **Next.js Team**: For the incredible framework

## 💡 Use Cases

- Personal journaling and self-reflection
- Mood tracking and emotional awareness
- Mental health support tool
- Writing practice and improvement
- Daily gratitude practice
- Therapy supplement
- Life documentation

## 🔮 Future Roadmap

- [ ] User authentication (NextAuth.js)
- [ ] Data export/import (JSON, PDF, Markdown)
- [ ] Analytics dashboard (mood trends, word clouds)
- [ ] Streak tracking and gamification
- [ ] Tags and categories
- [ ] Voice-to-text journaling
- [ ] Mobile PWA with offline sync
- [ ] Collaborative journaling
- [ ] AI-powered insights and trends

---

**Made with care for those who believe in the power of self-reflection.**

Live Demo: [Coming Soon]

Questions? Open an issue or reach out!

🪞 **MirrorMind** - Reflect, Understand, Grow. ✨