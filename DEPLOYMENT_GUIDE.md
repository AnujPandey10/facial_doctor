# Deployment Guide

## Overview

This guide covers deploying the SkinCare Analysis MVP to production, including infrastructure setup, environment configuration, and post-deployment verification.

## Deployment Architecture Options

### Option 1: Heroku (Simplest)

**Pros:**
- Easy deployment
- Managed database
- Auto-scaling
- Good for MVP

**Cons:**
- More expensive at scale
- Limited customization

**Estimated Cost:** $50-150/month

### Option 2: AWS (Recommended)

**Pros:**
- Full control
- Cost-effective at scale
- Many service options
- Industry standard

**Cons:**
- More setup required
- Steeper learning curve

**Estimated Cost:** $30-100/month

### Option 3: Vercel + Railway

**Pros:**
- Frontend on Vercel (free tier)
- Backend on Railway
- Simple deployment
- Good DX

**Estimated Cost:** $20-50/month

---

## Option 1: Heroku Deployment

### Prerequisites

```bash
# Install Heroku CLI
brew install heroku/brew/heroku  # macOS
# or download from https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login
```

### 1. Create Heroku Apps

```bash
# Create apps
heroku create skincare-api
heroku create skincare-frontend

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini -a skincare-api
```

### 2. Configure Backend

```bash
cd backend

# Set environment variables
heroku config:set \
  NODE_ENV=production \
  OPENAI_API_KEY=your_key_here \
  LLM_MODEL=gpt-4-vision-preview \
  FRONTEND_URL=https://skincare-frontend.herokuapp.com \
  MAX_FILE_SIZE=10485760 \
  -a skincare-api

# Get database URL (automatically set)
heroku config:get DATABASE_URL -a skincare-api
```

### 3. Deploy Backend

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial backend"

# Add Heroku remote
heroku git:remote -a skincare-api

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate -a skincare-api

# Seed database
heroku run npm run seed -a skincare-api

# Check logs
heroku logs --tail -a skincare-api
```

### 4. Configure Frontend

```bash
cd ../frontend

# Create .env.production
cat > .env.production << EOF
VITE_API_URL=https://skincare-api.herokuapp.com/api
EOF
```

### 5. Deploy Frontend

```bash
# Build
npm run build

# Deploy to Heroku
git init
git add .
git commit -m "Initial frontend"
heroku git:remote -a skincare-frontend
git push heroku main

# Or deploy to Vercel (easier)
npm install -g vercel
vercel --prod
```

### 6. Custom Domain (Optional)

```bash
# Add custom domain
heroku domains:add www.yourdomain.com -a skincare-api
heroku domains:add www.yourdomain.com -a skincare-frontend

# Add SSL
heroku certs:auto:enable -a skincare-api
```

---

## Option 2: AWS Deployment

### Architecture

```
Internet
   │
   ▼
CloudFront (CDN)
   │
   ├──▶ S3 (Frontend Static Files)
   │
   └──▶ ALB (Application Load Balancer)
           │
           ▼
       ECS Fargate (Backend API)
           │
           ▼
       RDS PostgreSQL
```

### Prerequisites

```bash
# Install AWS CLI
brew install awscli  # macOS
aws configure  # Enter credentials
```

### 1. Database Setup (RDS)

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier skincare-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14.7 \
  --master-username admin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxx \
  --publicly-accessible \
  --backup-retention-period 7

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier skincare-db \
  --query 'DBInstances[0].Endpoint.Address'
```

### 2. Backend Deployment (ECS Fargate)

**Create Dockerfile:**

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start
CMD ["node", "dist/server.js"]
```

**Build and push to ECR:**

```bash
cd backend

# Create ECR repository
aws ecr create-repository --repository-name skincare-api

# Get login command
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t skincare-api .

# Tag image
docker tag skincare-api:latest \
  ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/skincare-api:latest

# Push to ECR
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/skincare-api:latest
```

**Create ECS Task Definition:**

```json
{
  "family": "skincare-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "skincare-api",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/skincare-api:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3001"}
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:db-url"
        },
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:openai-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/skincare-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

**Create ECS Service:**

```bash
# Create cluster
aws ecs create-cluster --cluster-name skincare-cluster

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-def.json

# Create service
aws ecs create-service \
  --cluster skincare-cluster \
  --service-name skincare-api-service \
  --task-definition skincare-api \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:region:account:targetgroup/xxx,containerName=skincare-api,containerPort=3001"
```

### 3. Frontend Deployment (S3 + CloudFront)

```bash
cd frontend

# Build production bundle
npm run build

# Create S3 bucket
aws s3 mb s3://skincare-frontend

# Configure bucket for static hosting
aws s3 website s3://skincare-frontend \
  --index-document index.html \
  --error-document index.html

# Upload build files
aws s3 sync dist/ s3://skincare-frontend --delete

# Make public
aws s3api put-bucket-policy \
  --bucket skincare-frontend \
  --policy file://bucket-policy.json
```

**bucket-policy.json:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::skincare-frontend/*"
    }
  ]
}
```

**Create CloudFront Distribution:**

```bash
aws cloudfront create-distribution \
  --origin-domain-name skincare-frontend.s3.amazonaws.com \
  --default-root-object index.html
```

### 4. Secrets Management (AWS Secrets Manager)

```bash
# Store database URL
aws secretsmanager create-secret \
  --name skincare/database-url \
  --secret-string "postgresql://user:pass@host:5432/db"

# Store OpenAI key
aws secretsmanager create-secret \
  --name skincare/openai-key \
  --secret-string "your_openai_api_key"
```

---

## Option 3: Vercel + Railway

### 1. Backend Deployment (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Add PostgreSQL
railway add postgresql

# Set environment variables
railway variables set OPENAI_API_KEY=your_key
railway variables set NODE_ENV=production

# Deploy
railway up

# Get URL
railway domain
```

### 2. Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-railway-url.up.railway.app/api
```

---

## Post-Deployment Checklist

### 1. Verify Services

```bash
# Check backend health
curl https://your-api-url.com/api/health

# Expected: {"status":"ok","timestamp":"..."}

# Check database connection
# Should see database logs if connected
```

### 2. Run Migrations

```bash
# SSH into backend or use Heroku/Railway console
npm run migrate
npm run seed
```

### 3. Test Critical Flows

1. **Homepage loads**
   - Visit https://your-domain.com
   - Check console for errors

2. **Consent modal**
   - Click "Start Analysis"
   - Verify modal appears

3. **Image upload**
   - Try file upload
   - Verify it works

4. **End-to-end analysis**
   - Upload test image
   - Wait for results
   - Verify products display

5. **Admin panel**
   - Access /admin
   - Try creating/editing product

### 4. Performance Check

```bash
# Test response time
curl -o /dev/null -s -w '%{time_total}\n' https://your-api-url.com/api/health

# Should be < 1 second

# Test with image analysis (expect 10-30s)
```

### 5. Security Verification

```bash
# Verify HTTPS
curl -I https://your-domain.com | grep -i strict

# Should see Strict-Transport-Security header

# Check CORS
curl -H "Origin: https://evil.com" https://your-api-url.com/api/health

# Should not allow cross-origin
```

### 6. Monitoring Setup

**Set up alerts for:**
- API downtime
- Error rate > 5%
- Response time > 30s
- Database connection failures

**Recommended tools:**
- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry
- **Performance**: New Relic, DataDog
- **Logs**: Papertrail, Loggly

---

## Environment Variables Reference

### Backend (.env)

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db
OPENAI_API_KEY=sk-...
NODE_ENV=production

# Optional
PORT=3001
LLM_MODEL=gpt-4-vision-preview
FRONTEND_URL=https://yourdomain.com
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
JWT_SECRET=random_secure_string_here
```

### Frontend (.env.production)

```bash
VITE_API_URL=https://api.yourdomain.com/api
```

---

## Scaling Considerations

### When to Scale

Scale when you hit:
- 100+ concurrent users
- 1000+ analyses per day
- Database queries > 1s
- API response time > 30s

### Horizontal Scaling

**Backend:**
```bash
# Heroku
heroku ps:scale web=3 -a skincare-api

# AWS ECS
aws ecs update-service \
  --cluster skincare-cluster \
  --service skincare-api-service \
  --desired-count 5
```

**Database:**
- Add read replicas
- Enable connection pooling
- Consider caching (Redis)

### Vertical Scaling

**Heroku:**
```bash
# Upgrade dyno
heroku ps:resize web=standard-2x -a skincare-api
```

**AWS:**
- Increase ECS task CPU/memory
- Upgrade RDS instance class

---

## Cost Estimates

### Heroku Stack

| Service | Tier | Cost/Month |
|---------|------|------------|
| Web Dyno | Standard-1X | $25 |
| PostgreSQL | Mini | $5 |
| SSL | Auto | Free |
| **Total** | | **$30** |

At scale (1000+ users):
| Service | Tier | Cost/Month |
|---------|------|------------|
| Web Dynos | Standard-2X x3 | $150 |
| PostgreSQL | Standard-0 | $50 |
| **Total** | | **$200** |

### AWS Stack (Optimized)

| Service | Configuration | Cost/Month |
|---------|--------------|------------|
| ECS Fargate | 0.5 vCPU, 1GB RAM x2 | $30 |
| RDS t3.micro | PostgreSQL | $15 |
| S3 | 10GB storage | $0.50 |
| CloudFront | 100GB transfer | $10 |
| **Total** | | **$55.50** |

### Additional Costs

| Service | Cost/Month |
|---------|------------|
| OpenAI API | $0.01/image × volume |
| Domain | $10-15/year |
| SSL Certificate | Free (Let's Encrypt) |
| Monitoring (Sentry) | $0-26 |

**Example at 10,000 analyses/month:**
- Infrastructure: $55.50
- OpenAI: $100 (10K × $0.01)
- **Total: $155.50/month**

---

## Rollback Procedure

### If deployment fails:

**Heroku:**
```bash
# Rollback to previous release
heroku releases:rollback -a skincare-api
```

**AWS ECS:**
```bash
# Update service to previous task definition
aws ecs update-service \
  --cluster skincare-cluster \
  --service skincare-api-service \
  --task-definition skincare-api:PREVIOUS_REVISION
```

**Vercel:**
```bash
# Rollback via dashboard or CLI
vercel rollback
```

---

## Maintenance

### Regular Tasks

**Daily:**
- Check error logs
- Monitor uptime

**Weekly:**
- Review performance metrics
- Check database size
- Review affiliate click data

**Monthly:**
- Update dependencies
- Review security alerts
- Backup database
- Review costs

### Database Backups

**Heroku:**
```bash
# Create backup
heroku pg:backups:capture -a skincare-api

# Download backup
heroku pg:backups:download -a skincare-api
```

**AWS RDS:**
- Automated backups (configured in RDS settings)
- Manual snapshots via AWS Console

---

## Troubleshooting

### "Application Error" on Heroku

```bash
# Check logs
heroku logs --tail -a skincare-api

# Common issues:
# - Missing environment variables
# - Database connection failure
# - Port binding error (use process.env.PORT)
```

### Database Connection Errors

```bash
# Test connection
psql $DATABASE_URL

# Check for connection limits
# Upgrade to higher tier or add connection pooling
```

### Frontend Not Loading

```bash
# Check build output
npm run build

# Verify API_URL is set correctly
echo $VITE_API_URL

# Check CORS settings in backend
```

---

## Support Resources

- **Heroku Docs**: https://devcenter.heroku.com/
- **AWS Docs**: https://docs.aws.amazon.com/
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app/

---

**Deployment is complete! 🚀 Monitor carefully for the first few days.**

