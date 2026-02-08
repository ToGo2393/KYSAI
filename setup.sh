#!/bin/bash

echo "🚀 Setting up KYSAI Quality Management System..."

# 1. Backend Setup
echo "📦 Installing Backend Dependencies..."
cd backend
python -m venv venv
# Windows specific activation
if [ -f "venv/Scripts/activate" ]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

pip install -r requirements.txt
echo "✅ Backend Dependencies Installed."

# 2. Frontend Setup
echo "🎨 Installing Frontend Dependencies..."
cd ../frontend
npm install
echo "✅ Frontend Dependencies Installed."

# 3. Environment Setup
cd ..
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "❗ Please update .env with your GEMINI_API_KEY."
fi

echo "🎉 Setup Complete!"
echo "To start the application:"
echo "1. Backend: cd backend && uvicorn app.main:app --reload"
echo "2. Frontend: cd frontend && npm run dev"
