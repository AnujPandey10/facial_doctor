# Project File Structure

## Overview

This document provides a complete overview of the project structure, explaining the purpose of each directory and key files.

```
project_face_scene/
│
├── 📄 README.md                      # Main documentation
├── 📄 PROJECT_SUMMARY.md             # Executive summary and status
├── 📄 QUICKSTART.md                  # 10-minute setup guide
├── 📄 TESTING_GUIDE.md               # Comprehensive testing procedures
├── 📄 DEPLOYMENT_GUIDE.md            # Production deployment guide
├── 📄 MIGRATION_NOTES.md             # LLM → CV service migration
├── 📄 LEGAL_CONSENT.md               # Legal & compliance documentation
├── 📄 FILE_STRUCTURE.md              # This file
│
├── 📜 package.json                   # Root package.json (for concurrent dev)
├── 🔧 setup.sh                       # Automated setup script
├── 📝 .gitignore                     # Git ignore rules
│
├── 📁 backend/                       # Backend API (Express + TypeScript)
│   ├── 📜 package.json               # Backend dependencies
│   ├── 📜 tsconfig.json              # TypeScript configuration
│   ├── 📝 env.example                # Environment variables template
│   │
│   └── 📁 src/                       # Source code
│       ├── 📄 server.ts              # Express app & server entry point
│       │
│       ├── 📁 routes/                # API route definitions
│       │   └── 📄 index.ts           # Main router (analyze, admin, affiliate)
│       │
│       ├── 📁 controllers/           # Request handlers
│       │   ├── 📄 analysisController.ts    # Image analysis endpoints
│       │   ├── 📄 affiliateController.ts   # Affiliate tracking
│       │   └── 📄 adminController.ts       # Admin CRUD operations
│       │
│       ├── 📁 services/              # Business logic layer
│       │   └── 📄 llmService.ts      # OpenAI GPT-4 Vision integration
│       │
│       ├── 📁 repositories/          # Database access layer
│       │   ├── 📄 productRepository.ts     # Product CRUD
│       │   └── 📄 evidenceRepository.ts    # Evidence CRUD
│       │
│       ├── 📁 db/                    # Database setup
│       │   ├── 📄 database.ts        # PostgreSQL connection & query helper
│       │   └── 📄 schema.sql         # Database schema (7 tables)
│       │
│       ├── 📁 types/                 # TypeScript types & schemas
│       │   └── 📄 schema.ts          # Zod schemas & canonical types
│       │
│       └── 📁 scripts/               # Utility scripts
│           ├── 📄 migrate.ts         # Run database migrations
│           └── 📄 seed.ts            # Seed with 12 products + 10 evidence
│
└── 📁 frontend/                      # Frontend app (React + TypeScript)
    ├── 📜 package.json               # Frontend dependencies
    ├── 📜 tsconfig.json              # TypeScript configuration
    ├── 📜 tsconfig.node.json         # Node-specific TS config
    ├── 📜 vite.config.ts             # Vite build configuration
    ├── 📜 tailwind.config.js         # TailwindCSS configuration
    ├── 📜 postcss.config.js          # PostCSS configuration
    ├── 📄 index.html                 # HTML entry point
    │
    └── 📁 src/                       # Source code
        ├── 📄 main.tsx               # React app entry point
        ├── 📄 App.tsx                # Root component with routing
        ├── 📄 index.css              # Global styles (Tailwind imports)
        ├── 📄 vite-env.d.ts          # Vite environment types
        │
        ├── 📁 pages/                 # Page components
        │   ├── 📄 HomePage.tsx       # Landing page with consent modal
        │   ├── 📄 CameraPage.tsx     # Selfie capture (webcam/upload)
        │   ├── 📄 ResultsPage.tsx    # Analysis results & recommendations
        │   ├── 📄 HistoryPage.tsx    # Past analyses
        │   └── 📄 AdminPage.tsx      # Product/evidence management
        │
        ├── 📁 components/            # Reusable components
        │   └── 📄 ConsentModal.tsx   # GDPR-compliant consent modal
        │
        ├── 📁 api/                   # API client
        │   └── 📄 client.ts          # Axios client with typed methods
        │
        └── 📁 types/                 # TypeScript interfaces
            └── 📄 index.ts           # Frontend type definitions
```

---

## Directory Purposes

### `/backend/src/controllers/`
**Purpose**: Handle HTTP requests and responses
- Parse request data
- Call service layer
- Return formatted responses
- Handle errors gracefully

**Key Files:**
- `analysisController.ts`: Image upload → LLM → product mapping
- `affiliateController.ts`: Click tracking & redirect
- `adminController.ts`: CRUD for products & evidence

---

### `/backend/src/services/`
**Purpose**: Business logic and external integrations
- LLM API calls
- Data processing
- Product recommendation logic
- **Future**: `cvService.ts` for CV integration

**Key Files:**
- `llmService.ts`: OpenAI integration with prompt engineering

---

### `/backend/src/repositories/`
**Purpose**: Database access layer (Data Access Objects)
- Abstract SQL queries
- Provide clean interfaces
- Handle data mapping
- Type-safe database operations

**Key Files:**
- `productRepository.ts`: Tag-based product search
- `evidenceRepository.ts`: Ingredient-based evidence lookup

---

### `/backend/src/db/`
**Purpose**: Database configuration and schema
- Connection pooling
- Query helper functions
- Schema definitions

**Key Files:**
- `database.ts`: PostgreSQL connection with error handling
- `schema.sql`: Complete database schema (7 tables, indexes)

---

### `/backend/src/types/`
**Purpose**: TypeScript types and validation schemas
- Zod runtime validation
- TypeScript interfaces
- Canonical JSON schemas
- Request/response types

**Key Files:**
- `schema.ts`: **THE CONTRACT** - defines all data structures

---

### `/backend/src/scripts/`
**Purpose**: Database management utilities
- Schema migrations
- Data seeding
- Maintenance tasks

**Key Files:**
- `migrate.ts`: Create tables and indexes
- `seed.ts`: Populate with 12 products + 10 evidence entries

---

### `/frontend/src/pages/`
**Purpose**: Full-page components (route targets)
- Each page is a route destination
- Contains page-specific logic
- Orchestrates components

**Key Files:**
- `HomePage.tsx`: Hero + consent modal
- `CameraPage.tsx`: Webcam/upload with guidance
- `ResultsPage.tsx`: Analysis display with product cards
- `HistoryPage.tsx`: Past analyses list
- `AdminPage.tsx`: Product/evidence management dashboard

---

### `/frontend/src/components/`
**Purpose**: Reusable UI components
- Shared across pages
- Presentational components
- UI patterns

**Key Files:**
- `ConsentModal.tsx`: Blocking modal with legal text

---

### `/frontend/src/api/`
**Purpose**: Backend API communication
- Axios configuration
- Typed API methods
- Error handling
- Request/response transformation

**Key Files:**
- `client.ts`: All API endpoints in one place

---

### `/frontend/src/types/`
**Purpose**: Frontend TypeScript interfaces
- Mirror backend types (where applicable)
- UI-specific types
- Props interfaces

**Key Files:**
- `index.ts`: Product, Evidence, AnalysisResult, etc.

---

## Key Files Explained

### Root Level

#### `README.md`
- **Purpose**: Main documentation entry point
- **Contains**: Setup, API docs, schema, architecture
- **Audience**: Developers and stakeholders

#### `PROJECT_SUMMARY.md`
- **Purpose**: Executive overview
- **Contains**: Status, deliverables, metrics, next steps
- **Audience**: Project managers, stakeholders

#### `QUICKSTART.md`
- **Purpose**: Fast local setup
- **Contains**: 10-minute setup guide, common issues
- **Audience**: New developers

#### `TESTING_GUIDE.md`
- **Purpose**: Testing procedures
- **Contains**: 12 test cases, 20-image protocol, QA checklist
- **Audience**: QA engineers, developers

#### `DEPLOYMENT_GUIDE.md`
- **Purpose**: Production deployment
- **Contains**: 3 deployment options, cost estimates, monitoring
- **Audience**: DevOps, platform engineers

#### `MIGRATION_NOTES.md`
- **Purpose**: LLM → CV migration guide
- **Contains**: Step-by-step migration, code examples, testing
- **Audience**: ML engineers, developers

#### `LEGAL_CONSENT.md`
- **Purpose**: Legal compliance documentation
- **Contains**: Consent text, privacy policy, disclaimers
- **Audience**: Legal, compliance, product managers

#### `setup.sh`
- **Purpose**: Automated setup script
- **Usage**: `./setup.sh` to set up entire environment
- **Does**: Install deps, create DB, migrate, seed

---

## Database Schema (schema.sql)

### Tables

1. **`products`**
   - Stores skincare product catalog
   - INCI ingredients, key actives, tags
   - Affiliate URLs

2. **`evidence`**
   - Scientific research entries
   - Linked to active ingredients
   - Strength ratings

3. **`product_evidence`**
   - Many-to-many relationship
   - Links products to research

4. **`analyses`**
   - Stores analysis history
   - JSONB for detected issues
   - User linkage (optional)

5. **`affiliate_clicks`**
   - Tracks product clicks
   - UTM parameters
   - Analytics data

6. **`user_consents`**
   - GDPR compliance
   - Consent version tracking
   - IP address logging

7. **`admin_users`**
   - Admin authentication (basic)
   - Future: expand with roles

---

## Configuration Files

### Backend

- **`package.json`**: Express, TypeScript, pg, OpenAI SDK, Zod
- **`tsconfig.json`**: Strict mode, ES2020, CommonJS
- **`env.example`**: Template for environment variables

### Frontend

- **`package.json`**: React, TypeScript, Vite, TailwindCSS
- **`tsconfig.json`**: React JSX, ESNext, strict mode
- **`vite.config.ts`**: Dev server, proxy to backend, aliases
- **`tailwind.config.js`**: Custom colors, content paths
- **`postcss.config.js`**: Tailwind + Autoprefixer

---

## Data Flow

### Analysis Request Flow

```
User uploads image
      ↓
ConsentModal checks acceptance
      ↓
CameraPage captures/uploads
      ↓
POST /api/analyze (FormData + metadata)
      ↓
analysisController.ts
      ↓
llmService.analyzeImageWithLLM()
      ↓
OpenAI GPT-4 Vision API
      ↓
Parse JSON response (with fallbacks)
      ↓
For each detected issue:
  ↓
  productRepository.findByTags(issue.tags)
  ↓
  For each product:
    ↓
    evidenceRepository.findByActiveIngredient()
    ↓
    generateProductSummary() via LLM
      ↓
Store analysis in database
      ↓
Return FinalResponse to frontend
      ↓
ResultsPage displays with ProductCards
      ↓
User clicks "Buy Now"
      ↓
GET /api/affiliate/:productId
      ↓
Log click to affiliate_clicks table
      ↓
Redirect to affiliate URL with UTM
```

---

## Important Conventions

### Naming

- **Files**: camelCase for TypeScript, kebab-case for configs
- **Components**: PascalCase (e.g., `ConsentModal.tsx`)
- **Functions**: camelCase (e.g., `analyzeImage`)
- **Types/Interfaces**: PascalCase (e.g., `AnalysisResult`)
- **Database**: snake_case (e.g., `product_id`)

### Code Organization

- **Controllers**: Keep thin, delegate to services
- **Services**: Business logic, no HTTP concerns
- **Repositories**: SQL only, return typed data
- **Types**: Single source of truth in `schema.ts`

### Error Handling

- **Controllers**: Try-catch, return user-friendly errors
- **Services**: Throw errors with context
- **Frontend**: Toast notifications for errors

---

## Development Workflow

### Adding a New Product

1. Use Admin Dashboard at `/admin`
2. Click "Add Product"
3. Fill in form (name, brand, INCI, tags, etc.)
4. Submit → stored in `products` table
5. Immediately available in recommendations

### Adding New Evidence

1. Use Admin Dashboard at `/admin`
2. Switch to "Evidence" tab
3. Click "Add Evidence"
4. Enter research details (ingredient, study, year)
5. Submit → stored in `evidence` table
6. Auto-links to products with matching active ingredient

### Adding a New Skin Concern Detection

1. Update LLM prompt in `llmService.ts`
2. Add detection logic to prompt
3. Add new tags for product matching
4. Add products with those tags
5. Test with sample images

---

## File Counts

- **Total Files**: 50+
- **Backend TypeScript Files**: 15
- **Frontend TypeScript Files**: 15
- **Documentation Files**: 8
- **Configuration Files**: 10+
- **Lines of Code**: ~8,000+

---

## Next File to Check

When debugging or enhancing:

1. **Analysis not working?** → Check `llmService.ts`
2. **Products not matching?** → Check `productRepository.ts` and tags
3. **Database issues?** → Check `schema.sql` and `database.ts`
4. **UI not displaying?** → Check `ResultsPage.tsx`
5. **Consent issues?** → Check `ConsentModal.tsx`

---

This structure enables:
- ✅ Clear separation of concerns
- ✅ Easy testing (each layer isolated)
- ✅ Simple migration to CV service
- ✅ Horizontal scaling (stateless backend)
- ✅ Team collaboration (clear ownership)

