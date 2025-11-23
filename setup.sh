#!/bin/bash

# SkinCare Analysis MVP - Setup Script
# This script helps set up the development environment

set -e  # Exit on error

echo "🚀 SkinCare Analysis MVP - Setup Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) found${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL not found. Please install PostgreSQL 14+ first.${NC}"
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu: sudo apt-get install postgresql"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL found${NC}"

# Check if database exists
DB_NAME="skincare_db"
if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${GREEN}✓ Database '$DB_NAME' exists${NC}"
else
    echo -e "${YELLOW}📦 Creating database '$DB_NAME'...${NC}"
    createdb $DB_NAME
    echo -e "${GREEN}✓ Database created${NC}"
fi

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo -e "${YELLOW}⚙️  Creating backend .env file...${NC}"
    cp env.example .env
    echo -e "${GREEN}✓ .env created${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Please edit backend/.env and set:${NC}"
    echo "   - DATABASE_URL (if not using defaults)"
    echo "   - OPENAI_API_KEY (required for analysis)"
    echo ""
    read -p "Press Enter when you've updated .env, or Ctrl+C to exit and do it later..."
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Run migrations
echo ""
echo "🔧 Running database migrations..."
npm run migrate

# Seed database
echo ""
echo "🌱 Seeding database with sample data..."
npm run seed

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Done
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the development servers:"
echo "   ${YELLOW}npm run dev${NC} (from project root)"
echo ""
echo "   Or in separate terminals:"
echo "   ${YELLOW}cd backend && npm run dev${NC}"
echo "   ${YELLOW}cd frontend && npm run dev${NC}"
echo ""
echo "2. Open your browser:"
echo "   Frontend: ${YELLOW}http://localhost:3000${NC}"
echo "   Backend:  ${YELLOW}http://localhost:3001/api/health${NC}"
echo "   Admin:    ${YELLOW}http://localhost:3000/admin${NC}"
echo ""
echo "3. Test the flow:"
echo "   - Click 'Start Analysis'"
echo "   - Accept consent"
echo "   - Upload a selfie"
echo "   - View results!"
echo ""
echo "For more information, see:"
echo "   - ${YELLOW}QUICKSTART.md${NC} - Quick start guide"
echo "   - ${YELLOW}README.md${NC} - Full documentation"
echo ""
echo "Happy coding! 🎉"

