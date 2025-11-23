# Quick Start Guide

Get the SkinCare Analysis MVP up and running in 10 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- OpenAI API key

## Step 1: Clone & Install (2 min)

```bash
cd project_face_scene

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 2: Database Setup (2 min)

```bash
# Create database
createdb skincare_db

# Or using psql
psql -U postgres
CREATE DATABASE skincare_db;
\q

# Configure backend environment
cd ../backend
cp env.example .env

# Edit .env and set:
# DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/skincare_db
# OPENAI_API_KEY=your_openai_api_key_here
```

## Step 3: Run Migrations & Seed (1 min)

```bash
# Still in backend directory
npm run migrate
npm run seed
```

You should see:
```
✓ Migration completed successfully
✓ Created evidence: Niacinamide
✓ Created product: CeraVe Renewing SA Cleanser
...
✅ Seed completed successfully!
   - Created 10 evidence entries
   - Created 12 products
```

## Step 4: Start Servers (1 min)

```bash
# From project root, in separate terminals:

# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Or use the convenience command from root:
```bash
npm run dev  # Starts both concurrently
```

## Step 5: Access the App (1 min)

Open your browser:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/health
- **Admin Panel**: http://localhost:3000/admin

## Step 6: Test the Flow (3 min)

1. Click "Start Analysis"
2. Accept consent modal
3. Upload a test selfie (or use webcam)
4. Click "Analyze Skin"
5. Wait 10-30 seconds
6. View results with product recommendations!

---

## Common Issues

### "Database connection failed"
```bash
# Check PostgreSQL is running
brew services list | grep postgresql
# or
sudo service postgresql status

# Verify connection
psql -U YOUR_USER -d skincare_db -c "SELECT 1;"
```

### "OpenAI API error"
```bash
# Verify your API key
echo $OPENAI_API_KEY  # In terminal where backend runs

# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_KEY"
```

### "Port already in use"
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill

# Or change port in backend/.env
PORT=3002
```

### "Webcam not working"
- Ensure you're using HTTPS or localhost
- Check browser permissions
- Try uploading a file instead

---

## Next Steps

- Read [README.md](README.md) for full documentation
- Review [TESTING_GUIDE.md](TESTING_GUIDE.md) for testing procedures
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production deployment
- See [MIGRATION_NOTES.md](MIGRATION_NOTES.md) for CV service migration

---

## Development Tips

### Backend Development

```bash
cd backend

# Watch mode (auto-restart on changes)
npm run dev

# Build TypeScript
npm run build

# Run migrations
npm run migrate

# Seed database
npm run seed
```

### Frontend Development

```bash
cd frontend

# Development server with HMR
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Database Management

```bash
# Access database
psql skincare_db

# Useful queries
SELECT * FROM products;
SELECT * FROM evidence;
SELECT * FROM analyses ORDER BY created_at DESC LIMIT 5;
SELECT * FROM affiliate_clicks;

# Reset database (caution!)
DROP DATABASE skincare_db;
CREATE DATABASE skincare_db;
npm run migrate
npm run seed
```

---

## Environment Variables Quick Reference

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/skincare_db
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-4-vision-preview
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (optional .env)
```bash
VITE_API_URL=http://localhost:3001/api
```

---

**You're ready to go! 🎉**

For questions or issues, check the documentation or review the code comments.

