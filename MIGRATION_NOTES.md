# Migration Notes: LLM to Custom CV Service

## Overview

This document provides detailed guidance on replacing the OpenAI GPT-4 Vision LLM with a dedicated computer vision (CV) service for skin analysis, while maintaining full compatibility with the existing system.

## Why Migrate?

### Benefits of Custom CV Service
1. **Cost Reduction**: Potentially 10-100x cheaper than LLM API calls
2. **Performance**: Faster inference times, lower latency
3. **Customization**: Train on domain-specific data, fine-tune for skin analysis
4. **Privacy**: Self-hosted option for sensitive medical data
5. **Reliability**: Less dependent on third-party API availability
6. **Scalability**: Easier to scale horizontally with dedicated GPU instances

### When to Migrate
- After validating product-market fit with LLM MVP
- When monthly LLM costs exceed $500
- When latency becomes a user experience issue (>5s response time)
- When privacy regulations require on-premise processing
- When you need fine-grained control over detection algorithms

## Current Architecture

```
┌──────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────┐
│  Image   │───▶│ Backend  │───▶│   OpenAI    │───▶│  Parse   │
│  Upload  │    │          │    │  GPT-4-V    │    │  & Map   │
└──────────┘    └──────────┘    └─────────────┘    └────┬─────┘
                                                          │
                                                          ▼
                                                    ┌──────────┐
                                                    │ Products │
                                                    └──────────┘
```

## Target Architecture

```
┌──────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────┐
│  Image   │───▶│ Backend  │───▶│   Custom    │───▶│  Parse   │
│  Upload  │    │          │    │ CV Service  │    │  & Map   │
└──────────┘    └──────────┘    └─────────────┘    └────┬─────┘
                                                          │
                                                          ▼
                                                    ┌──────────┐
                                                    │ Products │
                                                    └──────────┘
```

## Critical: Maintain JSON Schema

### The Contract

The **most important** aspect of migration is maintaining the exact JSON schema. Your CV service MUST return data in this format:

```typescript
interface AnalysisResponse {
  analysis_id: string;          // UUID
  timestamp: string;             // ISO 8601 datetime
  skin_tone?: string;            // "fair" | "light" | "medium" | "tan" | "deep"
  overall_assessment: string;    // 2-3 sentence summary
  detected_issues: SkinIssue[];  // Array of detected concerns
  heatmap_url?: string;          // Optional visual overlay URL
}

interface SkinIssue {
  issue_id: string;              // e.g., "issue_1"
  issue_name: string;            // e.g., "Acne", "Dark Spots"
  confidence: number;            // 0.0 to 1.0
  severity: "mild" | "moderate" | "severe";
  description: string;           // What you observe
  affected_areas: string[];      // ["forehead", "cheeks", "chin", ...]
  bounding_boxes?: BoundingBox[]; // Optional location data
  tags: string[];                // For product matching
}
```

### Example Valid Response

```json
{
  "analysis_id": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2024-01-15T10:30:00Z",
  "skin_tone": "medium",
  "overall_assessment": "Your skin shows moderate signs of acne on the T-zone with some post-inflammatory hyperpigmentation on the cheeks. Overall texture appears slightly uneven with visible pores.",
  "detected_issues": [
    {
      "issue_id": "issue_1",
      "issue_name": "Acne & Breakouts",
      "confidence": 0.87,
      "severity": "moderate",
      "description": "Multiple inflammatory papules visible on forehead and chin, with some blackheads on the nose",
      "affected_areas": ["forehead", "nose", "chin"],
      "tags": ["acne", "oily_skin", "enlarged_pores", "blackheads", "inflammation"],
      "bounding_boxes": [
        {"x": 120, "y": 80, "width": 40, "height": 40},
        {"x": 160, "y": 200, "width": 30, "height": 30}
      ]
    },
    {
      "issue_id": "issue_2",
      "issue_name": "Hyperpigmentation",
      "confidence": 0.75,
      "severity": "mild",
      "description": "Post-inflammatory hyperpigmentation marks visible on both cheeks",
      "affected_areas": ["cheeks"],
      "tags": ["hyperpigmentation", "dark_spots", "post_inflammatory", "uneven_tone"]
    }
  ]
}
```

## Step-by-Step Migration

### Phase 1: Create CV Service Interface (Week 1)

1. **Create Service Wrapper**

```typescript
// backend/src/services/cvService.ts

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { AnalysisResponse, AnalysisResponseSchema } from '../types/schema';

const CV_SERVICE_URL = process.env.CV_SERVICE_URL || 'http://localhost:8000';

export async function analyzeImageWithCV(imageBase64: string): Promise<AnalysisResponse> {
  try {
    const response = await axios.post(`${CV_SERVICE_URL}/analyze`, {
      image: imageBase64,
      options: {
        detect_issues: true,
        estimate_skin_tone: true,
        generate_summary: true
      }
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CV_SERVICE_API_KEY}`
      }
    });

    // Validate response matches our schema
    const validated = AnalysisResponseSchema.parse(response.data);
    
    return validated;
  } catch (error) {
    console.error('CV Service Error:', error);
    throw new Error(`Failed to analyze image with CV service: ${error.message}`);
  }
}
```

2. **Add Environment Configuration**

```bash
# Add to backend/.env
CV_SERVICE_URL=http://localhost:8000
CV_SERVICE_API_KEY=your_cv_service_key
ANALYSIS_SERVICE=llm  # or 'cv' to switch
```

3. **Create Service Selector**

```typescript
// backend/src/services/analysisService.ts

import { analyzeImageWithLLM } from './llmService';
import { analyzeImageWithCV } from './cvService';
import { AnalysisResponse } from '../types/schema';

export async function analyzeImage(imageBase64: string): Promise<AnalysisResponse> {
  const service = process.env.ANALYSIS_SERVICE || 'llm';
  
  switch (service) {
    case 'cv':
      return await analyzeImageWithCV(imageBase64);
    case 'llm':
      return await analyzeImageWithLLM(imageBase64);
    default:
      throw new Error(`Unknown analysis service: ${service}`);
  }
}
```

4. **Update Controller**

```typescript
// backend/src/controllers/analysisController.ts

// Replace:
import { analyzeImageWithLLM } from '../services/llmService';
const analysis = await analyzeImageWithLLM(imageBase64);

// With:
import { analyzeImage } from '../services/analysisService';
const analysis = await analyzeImage(imageBase64);
```

### Phase 2: Build CV Service (Weeks 2-4)

#### Option A: FastAPI + PyTorch (Recommended)

```python
# cv_service/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from PIL import Image
import io
import base64
from datetime import datetime
import uuid

app = FastAPI()

class AnalysisRequest(BaseModel):
    image: str  # base64 encoded
    options: dict = {}

class BoundingBox(BaseModel):
    x: int
    y: int
    width: int
    height: int

class SkinIssue(BaseModel):
    issue_id: str
    issue_name: str
    confidence: float
    severity: str
    description: str
    affected_areas: list[str]
    tags: list[str]
    bounding_boxes: list[BoundingBox] | None = None

class AnalysisResponse(BaseModel):
    analysis_id: str
    timestamp: str
    skin_tone: str | None = None
    overall_assessment: str
    detected_issues: list[SkinIssue]
    heatmap_url: str | None = None

# Load your trained models
acne_detector = torch.load('models/acne_detector.pt')
hyperpigmentation_detector = torch.load('models/hyperpigmentation_detector.pt')
wrinkle_detector = torch.load('models/wrinkle_detector.pt')
skin_tone_classifier = torch.load('models/skin_tone_classifier.pt')

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_skin(request: AnalysisRequest):
    try:
        # Decode image
        image_data = base64.b64decode(request.image)
        image = Image.open(io.BytesIO(image_data))
        
        # Run detectors
        detected_issues = []
        
        # Acne detection
        acne_result = detect_acne(image)
        if acne_result['confidence'] > 0.5:
            detected_issues.append(SkinIssue(
                issue_id=f"issue_{len(detected_issues) + 1}",
                issue_name="Acne & Breakouts",
                confidence=acne_result['confidence'],
                severity=acne_result['severity'],
                description=acne_result['description'],
                affected_areas=acne_result['areas'],
                tags=["acne", "oily_skin", "enlarged_pores"],
                bounding_boxes=acne_result['boxes']
            ))
        
        # Hyperpigmentation detection
        hyper_result = detect_hyperpigmentation(image)
        if hyper_result['confidence'] > 0.5:
            detected_issues.append(SkinIssue(
                issue_id=f"issue_{len(detected_issues) + 1}",
                issue_name="Hyperpigmentation",
                confidence=hyper_result['confidence'],
                severity=hyper_result['severity'],
                description=hyper_result['description'],
                affected_areas=hyper_result['areas'],
                tags=["hyperpigmentation", "dark_spots", "uneven_tone"]
            ))
        
        # ... more detectors ...
        
        # Skin tone estimation
        skin_tone = estimate_skin_tone(image)
        
        # Generate overall assessment
        assessment = generate_assessment(detected_issues, skin_tone)
        
        return AnalysisResponse(
            analysis_id=str(uuid.uuid4()),
            timestamp=datetime.utcnow().isoformat() + 'Z',
            skin_tone=skin_tone,
            overall_assessment=assessment,
            detected_issues=detected_issues
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def detect_acne(image):
    # Your acne detection logic
    pass

def detect_hyperpigmentation(image):
    # Your hyperpigmentation detection logic
    pass

def estimate_skin_tone(image):
    # Fitzpatrick scale estimation
    pass

def generate_assessment(issues, skin_tone):
    # Generate natural language summary
    pass
```

#### Option B: TensorFlow Serving

```python
# Similar structure but using TensorFlow models
import tensorflow as tf

model = tf.saved_model.load('models/skin_analysis_model')
```

#### Option C: Commercial API

If building from scratch is too expensive, consider:
- **AWS Rekognition Custom Labels** - Train custom models
- **Google Vision AI** - Custom image classification
- **Clarifai** - Pre-trained + custom models
- **Hugging Face Inference API** - Deploy your models

### Phase 3: Testing & Validation (Week 5)

1. **Create Test Suite**

```typescript
// backend/src/tests/cvService.test.ts

import { analyzeImageWithCV } from '../services/cvService';
import { analyzeImageWithLLM } from '../services/llmService';
import fs from 'fs';

describe('CV Service vs LLM Comparison', () => {
  const testImages = [
    'test_data/acne_mild.jpg',
    'test_data/acne_severe.jpg',
    'test_data/dark_spots.jpg',
    'test_data/wrinkles.jpg',
    // ... 20 total images
  ];

  test.each(testImages)('should analyze %s', async (imagePath) => {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');

    // Analyze with both services
    const cvResult = await analyzeImageWithCV(imageBase64);
    const llmResult = await analyzeImageWithLLM(imageBase64);

    // Compare results
    console.log('CV detected:', cvResult.detected_issues.length, 'issues');
    console.log('LLM detected:', llmResult.detected_issues.length, 'issues');

    // Validate schema compliance
    expect(cvResult).toMatchSchema(AnalysisResponseSchema);
    
    // Compare confidence scores
    // Compare detected issue types
    // etc.
  });
});
```

2. **A/B Testing Setup**

```typescript
// Enable gradual rollout
const userBucket = getUserBucket(userId); // 0-99

let service: 'llm' | 'cv';
if (userBucket < 10) {
  service = 'cv'; // 10% of users get CV
} else {
  service = 'llm'; // 90% get LLM
}

const analysis = await analyzeImage(imageBase64, service);
```

3. **Metrics to Track**

```typescript
// Track and compare:
- Response time (latency)
- Detection accuracy (compared to ground truth)
- User satisfaction (ratings)
- Product recommendation quality
- Cost per analysis
- Error rates
```

### Phase 4: Deployment (Week 6)

1. **Deploy CV Service**

**Option A: Docker + AWS ECS**
```dockerfile
# cv_service/Dockerfile
FROM nvidia/cuda:11.8.0-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y python3.10 python3-pip

WORKDIR /app
COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Option B: AWS SageMaker**
- Deploy as SageMaker endpoint
- Auto-scaling based on load
- Built-in monitoring

**Option C: Google Cloud Run**
- Serverless deployment
- Pay per request
- Auto-scaling

2. **Update Backend Configuration**

```bash
# Production .env
ANALYSIS_SERVICE=cv
CV_SERVICE_URL=https://cv-service.yourdomain.com
CV_SERVICE_API_KEY=production_key_here
```

3. **Gradual Rollout**

Week 1: 10% of traffic → CV service
Week 2: 25% of traffic → CV service
Week 3: 50% of traffic → CV service
Week 4: 100% of traffic → CV service

Monitor metrics at each stage!

## CV Model Development Guide

### Skin Concerns to Detect

1. **Acne & Breakouts**
   - Whiteheads, blackheads
   - Inflammatory papules/pustules
   - Cysts
   - Post-inflammatory marks

2. **Hyperpigmentation**
   - Age spots
   - Sun damage
   - Melasma
   - Post-inflammatory hyperpigmentation

3. **Fine Lines & Wrinkles**
   - Forehead lines
   - Crow's feet
   - Smile lines
   - Under-eye wrinkles

4. **Texture & Pores**
   - Enlarged pores
   - Rough texture
   - Uneven surface

5. **Redness & Rosacea**
   - Facial redness
   - Visible blood vessels
   - Rosacea patterns

6. **Under-Eye Concerns**
   - Dark circles
   - Puffiness
   - Fine lines

### Training Data Sources

- **Dermnet**: Medical dermatology images
- **Kaggle**: Skin disease datasets
- **Custom Collection**: Commission photography
- **Synthetic Data**: Use GANs to augment

### Model Architecture Suggestions

**Option 1: EfficientNet-based Multi-task Model**
```python
# Single backbone, multiple heads for different concerns
backbone = EfficientNetB4(pretrained=True)
acne_head = ClassificationHead(num_classes=4)  # none, mild, moderate, severe
hyperpig_head = ClassificationHead(num_classes=4)
wrinkle_head = RegressionHead()  # wrinkle density
localization_head = DetectionHead()  # bounding boxes
```

**Option 2: YOLO for Detection**
```python
# Object detection approach
model = YOLOv8('yolov8x.pt')
model.train(data='skin_issues.yaml', epochs=100)
```

**Option 3: Segmentation Model**
```python
# Pixel-wise classification
model = UNet(encoder='resnet50', classes=10)  # 10 issue types
```

### Evaluation Metrics

- **Accuracy**: % of correct classifications
- **Precision/Recall**: For each concern type
- **IoU**: For bounding box accuracy
- **F1 Score**: Balanced metric
- **User Agreement**: Human raters vs model

## Cost Comparison

### LLM Costs (GPT-4 Vision)
- $0.01 per image (approximate)
- 1000 analyses/day = $10/day = $300/month
- 10,000 analyses/day = $100/day = $3,000/month

### Custom CV Service Costs
- **Development**: $20,000 - $100,000 (one-time)
- **GPU Instance (AWS g4dn.xlarge)**: ~$500/month
- **Per analysis**: ~$0.0001 - $0.001
- **10,000 analyses/day**: ~$1-10/month (infrastructure only)

**Break-even**: ~300-500 analyses/day makes CV cheaper

## Risk Mitigation

### Fallback Strategy

```typescript
async function analyzeImageWithFallback(imageBase64: string): Promise<AnalysisResponse> {
  try {
    // Try CV service first
    return await analyzeImageWithCV(imageBase64);
  } catch (error) {
    console.error('CV service failed, falling back to LLM:', error);
    
    // Fall back to LLM
    return await analyzeImageWithLLM(imageBase64);
  }
}
```

### Monitoring

```typescript
// Track success rates
if (service === 'cv') {
  metrics.increment('cv_analysis_success');
} else {
  metrics.increment('llm_analysis_success');
}

// Alert if CV error rate > 5%
if (cvErrorRate > 0.05) {
  alert('CV service degraded, consider LLM fallback');
}
```

## Conclusion

Migration from LLM to CV service is **straightforward** because:
1. ✅ Clean abstraction with JSON schema contract
2. ✅ No changes needed to product matching logic
3. ✅ No frontend changes required
4. ✅ A/B testing capability built-in
5. ✅ Easy rollback if needed

The key is maintaining the **exact JSON schema** and implementing proper **testing & monitoring** during rollout.

---

**Estimated Timeline**: 6-8 weeks from decision to full migration
**Estimated Cost**: $30K-$150K (including model development)
**ROI**: Positive after 3-6 months at scale (>10K analyses/month)

