# API Configuration Guide

This document provides comprehensive information about all APIs used in MirrorMind and how to set them up.

## Overview

MirrorMind integrates with three external APIs to provide intelligent journaling features:

1. **MongoDB Atlas** - Cloud database for storing journal entries
2. **Hugging Face Inference API** - Machine learning models for sentiment analysis and summarization
3. **Google AI Studio (Gemini)** - Advanced language model for generating personalized responses

## Prerequisites

Before setting up the APIs, ensure you have:
- A code editor
- Terminal access
- Internet connection
- Valid email address for account creation

## 1. MongoDB Atlas Setup

MongoDB Atlas provides the cloud database for storing your journal entries.

### Account Creation

1. Visit https://www.mongodb.com/cloud/atlas/register
2. Sign up using email or OAuth (Google/GitHub)
3. Verify your email address

### Cluster Configuration

1. After login, click "Build a Database"
2. Select the M0 tier (Free forever, 512 MB storage)
3. Choose your preferred cloud provider:
   - AWS
   - Google Cloud
   - Azure
4. Select the region closest to your location
5. Name your cluster (default is fine, or use "mirrormind-cluster")
6. Click "Create" and wait 3-5 minutes for deployment

### Database User Setup

1. Navigate to "Database Access" in the left sidebar under Security
2. Click "Add New Database User"
3. Select "Password" authentication method
4. Create credentials:
   - Username: Choose any username (e.g., "mirrormind_user")
   - Password: Generate a secure password or create your own
   - Save these credentials securely
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Network Access Configuration

1. Go to "Network Access" in the left sidebar under Security
2. Click "Add IP Address"
3. For development: Select "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add specific IP addresses or CIDR blocks
5. Click "Confirm"

### Connection String

1. Return to "Database" in the sidebar
2. Click "Connect" on your cluster
3. Select "Drivers"
4. Choose Node.js as the driver with version 5.5 or later
5. Copy the connection string provided

The string format looks like:
```
mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Modify it to:
```
mongodb+srv://username:YOUR_ACTUAL_PASSWORD@cluster0.xxxxx.mongodb.net/mirrormind?retryWrites=true&w=majority&appName=Cluster0
```

Key changes:
- Replace `<password>` with your actual password (remove angle brackets)
- Add `/mirrormind` before the `?` to specify the database name
- Keep `&appName=Cluster0` at the end

## 2. Hugging Face API Setup

Hugging Face provides machine learning models for text analysis.

### Account Creation

1. Visit https://huggingface.co/join
2. Sign up with email or OAuth
3. Verify your email address

### API Token Generation

1. Log in to your account
2. Click on your profile picture in the top-right corner
3. Select "Settings"
4. Navigate to "Access Tokens" in the left menu
5. Click "New token"
6. Configure the token:
   - Name: "MirrorMind" or any descriptive name
   - Role: Select "Read"
7. Click "Generate token"
8. Copy the token immediately (it won't be shown again)

The token format: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### API Endpoint

MirrorMind uses the Hugging Face Inference Providers API:
- Base URL: `https://router.huggingface.co/hf-inference/`
- Models used:
  - `facebook/bart-large-cnn` for text summarization
  - `distilbert-base-uncased-finetuned-sst-2-english` for sentiment analysis

### Rate Limits

Free tier limitations:
- Approximately 30,000 characters per month
- Around 1,000 requests per day
- Models may need warm-up time (20-30 seconds on first use)
- Suitable for personal projects and testing

## 3. Google AI Studio (Gemini) Setup

Google's Gemini AI provides advanced natural language understanding for personalized responses.

### API Key Generation

1. Visit https://makersuite.google.com/app/apikey or https://aistudio.google.com/
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Select or create a Google Cloud project
5. Copy the generated API key

The key format: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### API Endpoint

- Base URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- Model: Gemini Pro
- Request format: REST API with JSON payload

### Rate Limits

Free tier (as of 2025):
- 60 requests per minute
- Generous token limits
- Suitable for most personal journaling applications

### Configuration Parameters

Default settings used:
- Temperature: 0.7 (balanced creativity and consistency)
- Top K: 40
- Top P: 0.95
- Max output tokens: 500 (approximately 2-3 paragraphs)

## Environment Configuration

### Creating the .env.local File

1. Navigate to your project root directory
2. Create a file named `.env.local`
3. Add the following configuration:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mirrormind?retryWrites=true&w=majority&appName=Cluster0

# Hugging Face API Token
HUGGINGFACE_API_TOKEN=hf_your_token_here

# Google AI Studio API Key
GOOGLE_AI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# App Configuration
NEXT_PUBLIC_USE_MONGODB=true
```

### Important Notes

- Never commit `.env.local` to version control
- The file is already included in `.gitignore`
- Restart your development server after changing environment variables
- Keep your API keys secure and private

## Verification

### Testing MongoDB Connection

After starting the development server, check the terminal output:
```
✓ MongoDB connected successfully
```

If you see an error:
- Verify the connection string format
- Check that your IP is whitelisted
- Confirm username and password are correct
- Ensure the cluster is running

### Testing Hugging Face API

Write a journal entry and click "Reflect". The terminal should show:
- Successful API calls to HF models
- Or fallback to local analysis if there are issues

### Testing Google AI

The AI response section should display:
- Personalized, contextual responses
- Multi-paragraph format
- Specific, actionable suggestions

## Troubleshooting

### MongoDB Issues

**Error: "MongoServerError: bad auth"**
- Solution: Check username and password in connection string
- Ensure no special characters need URL encoding

**Error: "MongoTimeoutError"**
- Solution: Verify IP whitelist includes your current IP
- Check internet connection

**Error: "Cannot find database"**
- Solution: Ensure `/mirrormind` is in the connection string

### Hugging Face Issues

**Error: "Model is loading"**
- Solution: Wait 20-30 seconds and retry
- Models need warm-up time on free tier

**Error: "Rate limit exceeded"**
- Solution: Application automatically falls back to local analysis
- Wait and try again later

**Error: "Authentication failed"**
- Solution: Verify token is correct and has "Read" permission
- Generate a new token if needed

### Google AI Issues

**Error: "API key not valid"**
- Solution: Check API key is correctly copied
- Ensure no extra spaces or characters
- Verify the key is enabled in Google Cloud Console

**Error: "Quota exceeded"**
- Solution: Check your usage in Google Cloud Console
- Wait for quota reset (usually per minute)

**Error: "Model not found"**
- Solution: Ensure using `gemini-pro` model name
- Check API endpoint URL is correct

## Production Deployment

### Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable:
   - Name: `MONGODB_URI`, Value: [your connection string]
   - Name: `HUGGINGFACE_API_TOKEN`, Value: [your token]
   - Name: `GOOGLE_AI_API_KEY`, Value: [your key]
   - Name: `NEXT_PUBLIC_USE_MONGODB`, Value: `true`
4. Set environment: Production (or all environments)
5. Save and redeploy your application

### Security Best Practices

1. **Rotate credentials periodically**
   - Change database passwords every 90 days
   - Regenerate API tokens quarterly

2. **Use separate credentials for development and production**
   - Create different MongoDB clusters
   - Use different API keys

3. **Monitor usage**
   - Check MongoDB metrics regularly
   - Monitor API usage to avoid unexpected charges

4. **Restrict access**
   - Limit MongoDB network access to known IPs in production
   - Use environment-specific API keys

5. **Backup regularly**
   - Export MongoDB data periodically
   - Store backups securely offline

## API Cost Considerations

### Current Setup (All Free Tiers)

- MongoDB Atlas M0: Free forever, 512 MB storage
- Hugging Face: Free tier with rate limits
- Google AI Studio: Generous free tier

### When to Upgrade

Consider paid tiers when:
- MongoDB storage exceeds 512 MB
- Hugging Face rate limits become restrictive
- Google AI quota is consistently reached
- Application has multiple concurrent users

## Additional Resources

### Documentation

- MongoDB Atlas: https://docs.atlas.mongodb.com/
- Hugging Face: https://huggingface.co/docs/api-inference
- Google AI: https://ai.google.dev/docs

### Support

- MongoDB Community Forums: https://www.mongodb.com/community/forums/
- Hugging Face Discord: https://huggingface.co/join/discord
- Stack Overflow: Tag questions appropriately

### Rate Limit Guidelines

To stay within free tier limits:
- Use the application for personal journaling
- Avoid making excessive test requests
- Implement caching where possible
- Let the application use fallback mechanisms when needed

## Conclusion

With all three APIs configured, MirrorMind provides:
- Cloud storage for persistent journal entries
- Advanced sentiment analysis and summarization
- Intelligent, personalized responses
- Reliable fallback mechanisms

The free tiers are sufficient for personal use and portfolio demonstrations. Monitor your usage and upgrade only when necessary.
