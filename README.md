# SkinCare Analysis MVP

AI-powered cosmetic skin analysis with evidence-backed product recommendations using multimodal LLM.

## 🎯 Overview

This MVP accepts user selfies, analyzes them using OpenAI's GPT-4 Vision API (or similar multimodal LLM), detects cosmetic skin concerns, and provides personalized product recommendations backed by scientific evidence.

## ✨ Features

### Frontend
- ✅ Guided selfie capture with visual tips
- ✅ Consent modal with clear privacy disclosure
- ✅ Upload progress indicator
- ✅ Results screen with detected issues and confidence scores
- ✅ Product recommendations (2-4 per issue) with evidence summaries
- ✅ Affiliate link tracking
- ✅ Analysis history (opt-in)
- ✅ Responsive design for mobile and web

### Backend
- ✅ `/api/analyze` endpoint for image analysis
- ✅ OpenAI GPT-4 Vision integration
- ✅ Structured JSON response with fallback parsing
- ✅ Product catalog with INCI ingredients and key actives
- ✅ Evidence database linked to active ingredients
- ✅ Affiliate click tracking with UTM parameters
- ✅ Admin API for product/evidence management
- ✅ PostgreSQL database with optimized indexes

### Admin Dashboard
- ✅ Product CRUD operations
- ✅ Evidence CRUD operations
- ✅ Product-Evidence linking
- ✅ Simple web interface

## 🏗 Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │─────▶│   Backend    │─────▶│   OpenAI    │
│  (React)    │      │  (Express)   │      │  GPT-4-V    │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  PostgreSQL  │
                     │   Database   │
                     └──────────────┘
```

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- OpenAI API key (or alternative multimodal LLM provider)

## 🚀 Quick Start

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb skincare_db

# Run migrations
cd backend
npm install
npm run migrate

# Seed with sample products and evidence
npm run seed
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp env.example .env
# Edit .env with your credentials:
# - DATABASE_URL
# - OPENAI_API_KEY
# - Other settings

# Start development server
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Access the Application

- **User App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Health**: http://localhost:3001/api/health

## 📊 Database Schema

### Products Table
- `product_id` (UUID, PK)
- `name`, `brand`, `affiliate_url`
- `price`, `image_url`
- `inci[]` - Ingredient list
- `key_actives[]` - Active ingredients
- `tags[]` - For matching with issues
- `description`

### Evidence Table
- `evidence_id` (UUID, PK)
- `active_ingredient`
- `paper_title`, `source`, `year`
- `short_summary`
- `strength_label` (strong/moderate/preliminary)
- `pubmed_url`

### Analyses Table
- Stores analysis history
- Links to user_id (optional)
- Stores detected issues as JSONB

### Affiliate Clicks Table
- Tracks product clicks
- UTM parameters
- Links to product and analysis

## 🔑 API Endpoints

### Analysis
```
POST /api/analyze
  - Body: FormData with 'image' file
  - Returns: AnalysisResult with issues and recommendations

GET /api/analysis/history?user_id=xxx
  - Returns: List of past analyses

GET /api/analysis/:analysisId
  - Returns: Specific analysis details
```

### Affiliate Tracking
```
GET /api/affiliate/:productId?analysisId=xxx&userId=xxx
  - Redirects to affiliate URL with UTM tracking
```

### Admin (Product Management)
```
GET    /api/admin/products
POST   /api/admin/products
GET    /api/admin/products/:id
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
```

### Admin (Evidence Management)
```
GET    /api/admin/evidence
POST   /api/admin/evidence
GET    /api/admin/evidence/:id
PUT    /api/admin/evidence/:id
DELETE /api/admin/evidence/:id
```

## 📝 Canonical JSON Schema

### LLM Analysis Response
```json
{
  "analysis_id": "uuid",
  "timestamp": "2024-01-01T00:00:00Z",
  "skin_tone": "medium",
  "overall_assessment": "Brief summary",
  "detected_issues": [
    {
      "issue_id": "issue_1",
      "issue_name": "Acne",
      "confidence": 0.85,
      "severity": "moderate",
      "description": "Inflammatory acne visible on cheeks",
      "affected_areas": ["cheeks", "chin"],
      "tags": ["acne", "oily_skin", "inflammation"]
    }
  ]
}
```

### Final API Response
```json
{
  "analysis": {
    "analysis_id": "uuid",
    "timestamp": "ISO-8601",
    "skin_tone": "medium",
    "overall_assessment": "Summary text"
  },
  "issues": [
    {
      "issue": { /* SkinIssue object */ },
      "recommendations": [
        {
          "product": { /* Product object */ },
          "evidence": [ /* Evidence objects */ ],
          "llm_generated_summary": "Why this product helps",
          "relevance_score": 0.9
        }
      ]
    }
  ]
}
```

## 🧪 Testing

### Manual Testing Checklist

1. **Consent Flow**
   - [ ] Consent modal appears on "Start Analysis"
   - [ ] Cannot proceed without checking consent box
   - [ ] Consent text clearly states cloud upload and non-medical nature

2. **Image Capture**
   - [ ] Webcam permission requested
   - [ ] Can capture photo from camera
   - [ ] Can upload photo from file
   - [ ] Guidance tips visible and helpful

3. **Analysis**
   - [ ] Loading indicator shows during processing
   - [ ] Analysis completes without errors
   - [ ] Results display detected issues
   - [ ] Confidence scores and severity shown

4. **Product Recommendations**
   - [ ] 2-4 products shown per issue
   - [ ] Products have INCI and key actives
   - [ ] Evidence summaries display
   - [ ] Scientific papers linked (if available)
   - [ ] LLM-generated summaries present

5. **Affiliate Tracking**
   - [ ] "Buy Now" opens new tab
   - [ ] URL includes UTM parameters
   - [ ] Click recorded in database

6. **Admin Panel**
   - [ ] Can list products and evidence
   - [ ] Can add new products
   - [ ] Can add new evidence
   - [ ] Can delete items
   - [ ] Changes reflect in recommendations

### Test Images

The system should be tested with 20 diverse sample images covering:
- Various skin tones (fair, light, medium, tan, deep)
- Different lighting conditions
- Various skin concerns (acne, dark spots, fine lines, etc.)
- Different age groups
- Both genders

## 🔒 Security Considerations

### Implemented
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting (100 requests per 15 min)
- ✅ File size limits (10MB)
- ✅ File type validation (images only)
- ✅ Input validation with Zod schemas
- ✅ SQL injection protection (parameterized queries)
- ✅ TLS/HTTPS ready (configure in production)

### TODO for Production
- [ ] Add authentication (JWT or session-based)
- [ ] Implement admin authentication
- [ ] Add CSRF protection
- [ ] Set up proper secret management (AWS Secrets Manager, etc.)
- [ ] Configure production CORS whitelist
- [ ] Enable HTTPS/TLS certificates
- [ ] Add request signing for sensitive endpoints
- [ ] Implement data encryption at rest

## 📈 Scaling & Production Deployment

### Deployment Checklist

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Configure production `DATABASE_URL`
   - Set secure `JWT_SECRET`
   - Update `FRONTEND_URL` to production domain

2. **Database**
   - Use managed PostgreSQL (AWS RDS, Heroku Postgres, etc.)
   - Enable connection pooling
   - Set up automated backups
   - Configure SSL connection

3. **Backend**
   - Deploy to Heroku, AWS ECS, or similar
   - Set up PM2 or similar process manager
   - Configure health checks
   - Enable logging (Winston + CloudWatch)

4. **Frontend**
   - Build production bundle: `npm run build`
   - Deploy to Vercel, Netlify, or CDN
   - Configure environment variables
   - Set up custom domain

5. **Monitoring**
   - Set up error tracking (Sentry)
   - Configure uptime monitoring
   - Track API performance
   - Monitor LLM API costs

### Suggested Architecture for Scale

```
┌──────────────┐
│   Cloudflare │  (CDN + DDoS protection)
└──────┬───────┘
       │
┌──────▼───────┐
│   Load       │
│   Balancer   │
└──────┬───────┘
       │
   ┌───▼────┬─────────┬─────────┐
   │ API-1  │  API-2  │  API-3  │  (Auto-scaling)
   └────────┴─────────┴─────────┘
       │
   ┌───▼────────────┐
   │  PostgreSQL    │  (Managed, with read replicas)
   │  (RDS/Aurora)  │
   └────────────────┘
```

## 🔄 Migration Path: Replacing LLM with CV Service

### Current Flow
```
Image → Backend → OpenAI GPT-4V → Parse JSON → Map Products
```

### Future Flow
```
Image → Backend → Custom CV Service → Parse JSON → Map Products
```

### Migration Steps

1. **Keep the Same JSON Schema**
   - The CV service should return the exact same JSON structure
   - Use the canonical schema defined in `backend/src/types/schema.ts`
   - This ensures zero changes to the rest of the application

2. **Create CV Service Wrapper**
   ```typescript
   // backend/src/services/cvService.ts
   export async function analyzeImageWithCV(imageBase64: string): Promise<AnalysisResponse> {
     // Call your custom CV service
     const response = await cvServiceClient.analyze(imageBase64);
     
     // Transform to canonical schema if needed
     return transformToCanonicalSchema(response);
   }
   ```

3. **Update Analysis Controller**
   ```typescript
   // In analysisController.ts, replace:
   const analysis = await analyzeImageWithLLM(imageBase64);
   
   // With:
   const analysis = await analyzeImageWithCV(imageBase64);
   ```

4. **Environment Toggle (Recommended)**
   ```typescript
   const analysisService = process.env.ANALYSIS_SERVICE === 'cv' 
     ? analyzeImageWithCV 
     : analyzeImageWithLLM;
   
   const analysis = await analysisService(imageBase64);
   ```

5. **Benefits of This Architecture**
   - Product matching logic unchanged
   - Evidence linking unchanged
   - Frontend displays identically
   - Can A/B test between services
   - Easy rollback if needed

### CV Service Requirements

Your custom CV service should:
- Accept image in base64 or multipart format
- Detect: acne, hyperpigmentation, fine lines, pores, redness, etc.
- Return confidence scores (0.0 to 1.0)
- Provide severity labels (mild/moderate/severe)
- Include affected facial areas
- Add tags for product matching

### Migration Testing

Test with the same 20 sample images:
- Compare LLM vs CV detection accuracy
- Verify JSON schema compliance
- Check product recommendation quality
- Monitor response times
- Measure cost differences

## 📄 Legal & Compliance

### Consent Text (v1.0)

The consent modal includes:
- ✅ Clear statement: "This is NOT medical advice"
- ✅ Disclosure of cloud image processing
- ✅ Third-party AI provider mention (OpenAI)
- ✅ Data storage and retention policy
- ✅ Affiliate link disclosure
- ✅ Age requirement (18+)
- ✅ Medical advice recommendation

### GDPR Compliance (TODO)
- [ ] Add data export functionality
- [ ] Implement right to deletion
- [ ] Create privacy policy page
- [ ] Add cookie consent
- [ ] Set up data processing agreement

### Medical Disclaimer

⚠️ **IMPORTANT**: This application provides cosmetic analysis only and does NOT:
- Diagnose medical conditions
- Replace professional dermatological advice
- Claim to treat diseases
- Provide medical recommendations

All disclaimers are prominently displayed throughout the user journey.

## 🛠 Development

### Project Structure

```
project_face_scene/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # LLM, business logic
│   │   ├── repositories/     # Database access
│   │   ├── routes/           # API routes
│   │   ├── db/               # Database setup
│   │   ├── types/            # TypeScript types & schemas
│   │   └── scripts/          # Migration & seed scripts
│   ├── uploads/              # Uploaded images (gitignored)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/            # Main pages
│   │   ├── components/       # Reusable components
│   │   ├── api/              # API client
│   │   └── types/            # TypeScript interfaces
│   └── package.json
└── README.md
```

### Key Files

- `backend/src/types/schema.ts` - **Canonical JSON schemas**
- `backend/src/services/llmService.ts` - LLM integration
- `backend/src/controllers/analysisController.ts` - Main analysis logic
- `frontend/src/pages/CameraPage.tsx` - Image capture
- `frontend/src/pages/ResultsPage.tsx` - Results display

## 📦 Seeded Data

The seed script includes:
- **12 products** from reputable brands (CeraVe, The Ordinary, Paula's Choice, etc.)
- **10 evidence entries** linking active ingredients to scientific research
- Proper product-evidence relationships

All products include:
- INCI ingredient lists
- Key active ingredients
- Relevant tags for matching
- Affiliate URLs (example links)

## 🐛 Troubleshooting

### "No response from LLM"
- Check OpenAI API key is valid
- Verify API quota/credits available
- Check network connectivity

### "Failed to connect to database"
- Ensure PostgreSQL is running
- Verify DATABASE_URL is correct
- Check database exists and migrations ran

### "Webcam not working"
- Check browser permissions
- Use HTTPS in production (required for camera access)
- Try file upload instead

### "No products recommended"
- Check product tags match issue tags
- Verify seed script ran successfully
- Review LLM's returned tags for the issue

## 📞 Support

For issues or questions:
1. Check this README
2. Review the code comments
3. Check the browser console / server logs
4. Verify environment variables

## 🎓 Future Enhancements

Potential improvements beyond MVP:
- [ ] Before/after photo comparison
- [ ] Progress tracking over time
- [ ] Routine builder
- [ ] Multi-angle image analysis
- [ ] Integration with electronic health records
- [ ] Mobile native apps
- [ ] Social sharing features
- [ ] Dermatologist consultation booking

---

**Built with**: React, TypeScript, Express, PostgreSQL, OpenAI GPT-4 Vision, TailwindCSS

**License**: MIT

