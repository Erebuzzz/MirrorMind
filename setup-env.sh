#!/bin/bash

# MirrorMind MongoDB Setup Script
# This script helps you set up your environment variables

echo "🪞 MirrorMind - MongoDB Setup"
echo "================================"
echo ""

# Check if .env.local already exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

echo "Let's configure your environment variables."
echo ""

# MongoDB URI
echo "📦 MongoDB Configuration"
echo "------------------------"
echo "1. Go to MongoDB Atlas: https://www.mongodb.com/cloud/atlas"
echo "2. Create a free cluster (M0)"
echo "3. Get your connection string"
echo ""
read -p "Enter your MongoDB URI: " mongodb_uri

if [ -z "$mongodb_uri" ]; then
    echo "❌ MongoDB URI is required!"
    exit 1
fi

# Hugging Face Token (optional)
echo ""
echo "🤗 Hugging Face Configuration (Optional)"
echo "----------------------------------------"
echo "1. Go to: https://huggingface.co/settings/tokens"
echo "2. Create a new token with 'Read' permission"
echo "3. Or press Enter to skip (limited rate)"
echo ""
read -p "Enter your Hugging Face API token (or press Enter to skip): " hf_token

# Create .env.local file
cat > .env.local << EOF
# MongoDB Configuration
MONGODB_URI=$mongodb_uri

# Hugging Face API Token (optional but recommended)
HUGGING_FACE_API_TOKEN=$hf_token

# App Configuration
NEXT_PUBLIC_USE_MONGODB=true
EOF

echo ""
echo "✅ .env.local created successfully!"
echo ""
echo "📋 Your configuration:"
echo "  - MongoDB: Configured"
if [ -n "$hf_token" ]; then
    echo "  - Hugging Face: Configured"
else
    echo "  - Hugging Face: Skipped (will use free tier with limits)"
fi
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3000"
echo "3. Write a journal entry to test the connection"
echo ""
echo "📖 For detailed setup instructions, see MONGODB_SETUP.md"
echo ""
echo "Happy journaling! 🪞✨"
