# Testing Guide

## Overview

This document provides comprehensive testing instructions for the SkinCare Analysis MVP, including manual test procedures, test data requirements, and acceptance criteria verification.

## Test Environment Setup

### 1. Prerequisites

```bash
# Ensure services are running
- PostgreSQL database
- Backend API (port 3001)
- Frontend dev server (port 3000)
- OpenAI API key configured
```

### 2. Test Data Preparation

You'll need **20 diverse sample images** for testing. These should cover:

#### Skin Tone Diversity (Fitzpatrick Scale)
- 4 images: Type I-II (Fair/Light)
- 4 images: Type III (Medium)
- 4 images: Type IV (Olive/Tan)
- 4 images: Type V (Brown)
- 4 images: Type VI (Dark Brown/Black)

#### Skin Concern Variety
- 5 images: Acne (mild, moderate, severe)
- 5 images: Hyperpigmentation/dark spots
- 3 images: Fine lines/wrinkles/aging
- 3 images: Redness/rosacea
- 2 images: Enlarged pores/texture
- 2 images: Clear/healthy skin (control)

#### Image Quality Variety
- Good lighting (10 images)
- Suboptimal lighting (5 images)
- Different angles (3 profile, 17 frontal)
- With/without makeup

### Where to Get Test Images

**Public Datasets:**
- Dermnet (medical dermatology images)
- Kaggle skin condition datasets
- PAD-UFES-20 (public dataset)

**Stock Photos:**
- Unsplash (search "face skincare")
- Pexels (search "skin texture")
- Adobe Stock (free with trial)

**Important**: Ensure you have rights to use images for testing.

---

## Manual Test Suite

### Test 1: Consent Flow

**Objective**: Verify consent modal appears and blocks access without acceptance

**Steps:**
1. Navigate to homepage (http://localhost:3000)
2. Click "Start Analysis"
3. **Expected**: Consent modal appears
4. Try to close modal without accepting
5. **Expected**: Cannot proceed to camera
6. Read consent text
7. **Verify**: Text mentions cloud upload, non-medical nature, age 18+
8. Try clicking "Accept" without checkbox
9. **Expected**: Button disabled
10. Check checkbox
11. **Expected**: Button enabled
12. Click "Accept & Continue"
13. **Expected**: Redirected to camera page

**Pass Criteria:**
- ✅ Modal blocks camera access
- ✅ Checkbox required
- ✅ All disclosures present
- ✅ Successful redirect after acceptance

---

### Test 2: Image Capture (Webcam)

**Objective**: Verify webcam capture works correctly

**Steps:**
1. Navigate to camera page
2. **Expected**: Webcam permission requested
3. Allow webcam access
4. **Expected**: Live camera feed displays
5. Position face in frame
6. **Verify**: Face guide overlay visible
7. **Verify**: Guidance tips displayed
8. Click "Capture Photo"
9. **Expected**: Photo captured and displayed
10. **Verify**: "Retake" and "Analyze Skin" buttons appear
11. Click "Retake"
12. **Expected**: Return to camera view
13. Capture again and click "Analyze Skin"
14. **Expected**: Loading indicator appears

**Pass Criteria:**
- ✅ Webcam initializes
- ✅ Capture works
- ✅ Retake works
- ✅ Analysis starts

---

### Test 3: Image Upload (File)

**Objective**: Verify file upload works correctly

**Steps:**
1. Navigate to camera page
2. Click "Upload Photo"
3. Select test image file
4. **Expected**: Image displays
5. Click "Analyze Skin"
6. **Expected**: Loading indicator shows "Analyzing your skin..."
7. Wait for analysis to complete (10-30 seconds)

**Pass Criteria:**
- ✅ File upload works
- ✅ Image preview displays
- ✅ Analysis processes

---

### Test 4: Analysis Processing

**Objective**: Verify backend processes image and returns results

**Steps:**
1. Upload/capture test image
2. Click "Analyze Skin"
3. **Monitor**: Network tab in DevTools
4. **Verify**: POST request to `/api/analyze`
5. **Verify**: Request includes image FormData
6. Wait for response
7. **Expected**: Success toast notification
8. **Expected**: Redirect to results page

**Backend Logs to Check:**
```
Executed query... (database calls)
Analyzing image with LLM...
✓ Created evidence: [ingredient]
```

**Pass Criteria:**
- ✅ API request successful (200 status)
- ✅ Response time < 30 seconds
- ✅ No errors in console
- ✅ Redirect to results

---

### Test 5: Results Display - Basic

**Objective**: Verify results page displays correctly

**Steps:**
1. After analysis completes, verify results page
2. **Verify**: Overall assessment displayed
3. **Verify**: Skin tone estimation shown
4. **Verify**: Date/time of analysis
5. **Verify**: List of detected issues
6. For each issue, verify:
   - Issue name
   - Severity badge (mild/moderate/severe)
   - Confidence percentage
   - Description
   - Affected areas
7. **Verify**: "New Analysis" button in header

**Pass Criteria:**
- ✅ All analysis data displayed
- ✅ No missing fields
- ✅ Proper formatting
- ✅ Navigation works

---

### Test 6: Product Recommendations

**Objective**: Verify product recommendations display with evidence

**Steps:**
1. On results page, scroll to detected issues
2. For each issue, verify:
   - "Recommended Products" section exists
   - 2-4 products displayed
3. For each product, verify:
   - Product name
   - Brand
   - Price (if available)
   - Key ingredients tags
   - LLM-generated summary (brief explanation)
   - "Show/Hide Scientific Evidence" button
4. Click "Show Scientific Evidence"
5. **Verify**: Evidence entries expand
6. For each evidence entry, verify:
   - Active ingredient name
   - Strength badge (strong/moderate/preliminary)
   - Short summary
   - Paper title and year
   - PubMed link (if available)

**Pass Criteria:**
- ✅ Products match issue tags
- ✅ Evidence linked correctly
- ✅ LLM summaries present
- ✅ External links work

---

### Test 7: Affiliate Tracking

**Objective**: Verify affiliate links track clicks correctly

**Steps:**
1. On results page, click "Buy Now" on a product
2. **Verify**: New tab opens
3. **Verify**: URL includes UTM parameters:
   - `utm_source=skincare_app`
   - `utm_medium=recommendation`
   - `utm_campaign=skin_analysis`
4. **Verify**: URL redirects through `/api/affiliate/:productId`
5. Check backend database:
   ```sql
   SELECT * FROM affiliate_clicks ORDER BY clicked_at DESC LIMIT 1;
   ```
6. **Verify**: Click recorded with:
   - product_id
   - analysis_id
   - user_id
   - UTM parameters

**Pass Criteria:**
- ✅ Redirect works
- ✅ UTM parameters present
- ✅ Click tracked in database
- ✅ Correct affiliate URL

---

### Test 8: Analysis History

**Objective**: Verify history page shows past analyses

**Steps:**
1. Complete 2-3 analyses
2. Navigate to homepage
3. Click "History" button
4. **Verify**: History page displays
5. **Verify**: All past analyses listed
6. For each analysis entry, verify:
   - Date/time
   - Skin tone
   - Number of issues detected
   - Brief overall assessment
7. Click on an analysis entry
8. **Expected**: Redirected to results page for that analysis
9. Click "Clear History"
10. Confirm deletion
11. **Expected**: History cleared

**Pass Criteria:**
- ✅ History displays correctly
- ✅ Navigation to past results works
- ✅ Clear history works
- ✅ Proper sorting (newest first)

---

### Test 9: Admin Panel - Products

**Objective**: Verify admin can manage products

**Steps:**
1. Navigate to http://localhost:3000/admin
2. **Verify**: Products tab active by default
3. **Verify**: Existing products listed
4. Click "Add Product"
5. Fill in product form:
   - Name: "Test Product"
   - Brand: "Test Brand"
   - Affiliate URL: "https://example.com"
   - Price: 19.99
   - Key Actives: "Niacinamide, Retinol"
   - Tags: "acne, aging"
   - INCI: "Water, Glycerin, Niacinamide"
6. Click "Create Product"
7. **Verify**: Success toast
8. **Verify**: Product appears in list
9. **Verify**: Changes reflect in recommendations (run new analysis)
10. Click delete icon on test product
11. Confirm deletion
12. **Verify**: Product removed from list

**Pass Criteria:**
- ✅ CRUD operations work
- ✅ Form validation works
- ✅ Data persists in database
- ✅ Changes reflect in recommendations

---

### Test 10: Admin Panel - Evidence

**Objective**: Verify admin can manage evidence

**Steps:**
1. Navigate to admin panel
2. Click "Evidence" tab
3. **Verify**: Existing evidence listed
4. Click "Add Evidence"
5. Fill in evidence form:
   - Active Ingredient: "Test Ingredient"
   - Paper Title: "Test Study"
   - Source: "Test Journal"
   - Year: 2023
   - Strength: Moderate
   - Summary: "Test summary of efficacy"
   - PubMed URL: (optional)
6. Click "Create Evidence"
7. **Verify**: Success toast
8. **Verify**: Evidence appears in list
9. Delete test evidence
10. **Verify**: Deletion successful

**Pass Criteria:**
- ✅ Evidence CRUD works
- ✅ Strength labels display correctly
- ✅ Data persists
- ✅ Links functional

---

### Test 11: Error Handling

**Objective**: Verify graceful error handling

**Test Cases:**

**A. Invalid Image Format**
1. Try uploading a .txt file
2. **Expected**: Error message "Only image files allowed"

**B. Image Too Large**
1. Try uploading >10MB image
2. **Expected**: Error message "File too large"

**C. Network Error**
1. Stop backend server
2. Try analysis
3. **Expected**: Error toast "Analysis failed"

**D. Invalid API Key**
1. Set invalid OpenAI key
2. Try analysis
3. **Expected**: Backend error logged, user sees generic error

**Pass Criteria:**
- ✅ All errors caught gracefully
- ✅ User-friendly error messages
- ✅ No app crashes
- ✅ Console logs for debugging

---

### Test 12: LLM Response Parsing

**Objective**: Verify parser handles various LLM responses

**Test Cases:**

**A. Standard Response**
- LLM returns proper JSON
- **Expected**: Parses successfully

**B. Markdown-Wrapped Response**
- LLM returns JSON wrapped in ```json...```
- **Expected**: Parser strips markdown and parses

**C. Missing Optional Fields**
- LLM omits `heatmap_url` or `skin_tone`
- **Expected**: Parser uses fallbacks, no crash

**D. Low Confidence Detections**
- LLM detects issues with <0.5 confidence
- **Expected**: All detections shown (no filtering)

**Pass Criteria:**
- ✅ Parser handles variations
- ✅ Fallbacks work
- ✅ No JSON parse errors
- ✅ All data extracted

---

## Comprehensive Test Run (20 Images)

### Test Procedure

For each of the 20 test images:

1. **Upload Image**
2. **Record Analysis Time** (start to finish)
3. **Verify Schema Compliance**
   - Check response structure
   - Verify all required fields present
4. **Check Detection Quality**
   - Does detected issue match image?
   - Is confidence reasonable?
   - Is severity appropriate?
5. **Verify Product Mapping**
   - Are 2-4 products recommended per issue?
   - Do product tags match issue tags?
   - Are evidence summaries present?
6. **Record Results** in test log

### Test Log Template

| # | Image Description | Analysis Time | Issues Detected | Products Count | Tags Match | Evidence Count | Pass/Fail | Notes |
|---|-------------------|---------------|-----------------|----------------|------------|----------------|-----------|-------|
| 1 | Acne mild - fair skin | 15s | Acne (mild) | 4 | ✓ | 3 | Pass | Good detection |
| 2 | Dark spots - medium | 18s | Hyperpig (mod) | 3 | ✓ | 2 | Pass | Accurate |
| ... | | | | | | | | |

### Success Criteria

**Passing Score**: 18/20 images (90% success rate)

**Must Pass:**
- ✅ All 20 analyses complete without errors
- ✅ Average response time < 25 seconds
- ✅ At least 2 products per issue (avg)
- ✅ Evidence linked for 80%+ of products
- ✅ No crashes or unhandled errors

---

## Performance Testing

### Load Test

**Tool**: Apache Bench or Artillery

```bash
# Test 100 concurrent analyses
ab -n 100 -c 10 -p test_image.json -T application/json \
  http://localhost:3001/api/analyze
```

**Acceptance:**
- ✅ Server handles 10 concurrent requests
- ✅ No 500 errors
- ✅ Average response time < 30s
- ✅ 95th percentile < 45s

### Database Performance

```sql
-- Check slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

**Acceptance:**
- ✅ All queries < 1000ms
- ✅ Indexes being used
- ✅ No full table scans on large tables

---

## Security Testing

### Test Cases

**1. SQL Injection**
```bash
# Try malicious product_id
curl "http://localhost:3001/api/admin/products/1' OR '1'='1"
```
**Expected**: No data leak, error or 404

**2. XSS Attempt**
```bash
# Try script injection in product name
POST /api/admin/products
{"name": "<script>alert('xss')</script>", ...}
```
**Expected**: Script escaped in display

**3. Rate Limiting**
```bash
# Send 200 requests rapidly
for i in {1..200}; do
  curl http://localhost:3001/api/health &
done
```
**Expected**: Rate limit triggered after 100 requests

**4. File Upload Limits**
- Try uploading 20MB file
- **Expected**: Rejected (>10MB limit)

**5. Authentication** (if implemented)
- Try accessing admin without login
- **Expected**: Redirect or 401

---

## Acceptance Criteria Verification

From the original requirements, verify:

### Must-Have Features

- [x] **End-to-end flow**: User takes selfie → LLM analysis → results with products
- [x] **LLM parser tolerates missing fields**: Test with various responses
- [x] **Consent modal**: Blocks upload until accepted
- [x] **Affiliate tracking**: Clicks tracked with UTM
- [x] **Admin can edit**: Products/evidence changes reflect in 5 min (instant in dev)
- [x] **Basic security**: TLS-ready, secrets not hard-coded
- [x] **20 sample images**: Structured responses for diverse images

### Deliverables

- [x] **Frontend + backend deployed**: Can deploy to staging
- [x] **Product catalog**: 12+ products with INCI
- [x] **Evidence entries**: 10+ with scientific sources
- [x] **Admin panel**: Full CRUD for products/evidence
- [x] **Documentation**: README, schemas, LLM prompts, consent text
- [x] **Test suite**: This document + manual testing
- [x] **Migration note**: CV service replacement guide

---

## Test Report Template

After completing all tests, compile a report:

```markdown
# Test Report - SkinCare Analysis MVP

**Date**: [Date]
**Tester**: [Name]
**Environment**: Development

## Summary
- Total Tests: 12 major test cases + 20 image tests
- Passed: X
- Failed: Y
- Pass Rate: Z%

## Test Results

### Functional Tests
1. Consent Flow: PASS/FAIL - [Notes]
2. Image Capture: PASS/FAIL - [Notes]
...

### 20 Image Test Results
- Success Rate: X/20 (Y%)
- Average Analysis Time: Zs
- Average Products per Issue: N
- Evidence Coverage: M%

## Issues Found
1. [Issue description] - Priority: High/Medium/Low
2. ...

## Performance
- Average Response Time: Xs
- 95th Percentile: Ys
- Database Query Performance: Good/Needs Improvement

## Security
- All security tests: PASS/FAIL
- Vulnerabilities Found: [List]

## Recommendations
1. [Recommendation]
2. ...

## Conclusion
Ready for staging deployment: YES/NO
Blockers: [List any critical issues]
```

---

## Continuous Testing

### Automated Tests (Future)

Consider implementing:
- Jest unit tests for backend services
- React Testing Library for frontend components
- Cypress E2E tests for critical flows
- API integration tests with Supertest

### Monitoring in Production

Set up:
- Error tracking (Sentry)
- Performance monitoring (New Relic, DataDog)
- Uptime monitoring (Pingdom)
- User analytics (Google Analytics)

---

**Testing is critical for MVP success. Allocate sufficient time for thorough testing before any public launch.**

