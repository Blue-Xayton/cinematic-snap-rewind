# ReliveAI - Implementation Guide

## What's Been Built

This is the **frontend prototype** for ReliveAI, built with React, TypeScript, and TailwindCSS. It demonstrates the complete user experience flow:

### ✅ Completed Frontend Features

1. **Landing Page** (`/`)
   - Cinematic hero section with gradient backgrounds
   - 3-step process explanation
   - Feature highlights with icons
   - Call-to-action buttons

2. **Create Page** (`/create`)
   - Drag-and-drop file upload interface
   - Multiple file selection support
   - Mood selection (Cinematic, Energetic, Chill)
   - Music track picker
   - Duration slider (15-60s)
   - Sample dataset loader

3. **Job List Page** (`/jobs`)
   - Grid view of all video jobs
   - Status badges (Queued, Processing, Complete, Error)
   - Time ago formatting
   - Quick access to job details

4. **Job Detail Page** (`/jobs/:jobId`)
   - Real-time progress tracking with percentage
   - Live processing logs simulation
   - Beat timeline/storyboard visualization
   - Video player for final output
   - Download and share buttons

### 🎨 Design System

- **Color Palette**: Deep blues (#0D1117 backgrounds) with gold accents (#FFD740)
- **Gradients**: Cinematic hero gradients and accent gradients
- **Shadows**: Elegant shadows and glow effects for depth
- **Typography**: Bold headers with smooth foreground colors
- **Animations**: Smooth transitions and hover effects

All design tokens are defined in `src/index.css` and `tailwind.config.ts` following best practices.

---

## What Still Needs to Be Built

The frontend is **complete and functional**, but it uses **mock data** and simulations. To make ReliveAI fully operational, you need to build the **backend system** described below.

### 🛠️ Backend Architecture Required

ReliveAI requires a separate **Python FastAPI backend** with the following components:

#### 1. **API Server** (Python FastAPI)

**File Structure:**
```
/backend
  /app
    main.py                 # FastAPI application entry
    /api
      jobs.py              # Job endpoints
    models.py              # Pydantic models
    storage.py             # Storage abstraction (local/GCS)
    db.py                  # Database layer (SQLite/PostgreSQL)
    /processing
      pipeline.py          # Orchestrates all steps
      ingest.py            # Media normalization
      scoring.py           # CLIP/heuristic scoring
      audio.py             # Librosa beat detection
      assembler.py         # FFmpeg timeline assembly
    /utils
      ffmpeg_commands.py   # FFmpeg command builders
      thumbnail.py         # Thumbnail generation
    worker.py              # RQ/Celery worker
  requirements.txt
  Dockerfile
  docker-compose.yml
```

**Required Endpoints:**

```python
POST   /api/jobs              # Create new job
GET    /api/jobs              # List jobs (paginated)
GET    /api/jobs/{id}         # Job status and details
GET    /api/jobs/{id}/logs    # Stream logs (SSE)
GET    /api/jobs/{id}/download # Download final video
GET    /api/jobs/{id}/thumbnail/{index} # Serve thumbnails
```

#### 2. **Background Worker** (RQ or Celery)

- Process jobs asynchronously
- Run the 7-step pipeline:
  1. **Ingest & Normalize**: Transcode videos to 1080x1920 proxies
  2. **Frame Extraction**: Extract N frames per clip
  3. **Scoring**: Use CLIP or heuristic scoring (face detection, sharpness, brightness)
  4. **Beat Detection**: Librosa beat tracking
  5. **Clip Selection**: Map best clips to beat times
  6. **Timeline Assembly**: FFmpeg concatenation with transitions (xfade, drawtext)
  7. **Final Render**: Encode with CRF 18, color grading, and export

#### 3. **Dependencies**

**Python Requirements:**
```txt
fastapi
uvicorn
python-multipart
redis
rq (or celery)
librosa
numpy
opencv-python
face-recognition (optional)
moviepy (optional)
transformers (for CLIP)
torch (for CLIP)
Pillow
exifread
google-cloud-storage (optional for GCS)
psycopg2-binary (optional for PostgreSQL)
```

**System Requirements:**
- **FFmpeg** installed (`apt-get install ffmpeg`)
- **Redis** for job queue
- **PostgreSQL** or **SQLite** for job metadata

#### 4. **Storage Layer**

Create a `storage.py` wrapper that supports:
- **Local storage** (for development)
- **Google Cloud Storage** (for production)

Toggle via environment variable: `USE_GCS=true|false`

#### 5. **Environment Variables**

```env
# Backend
REDIS_URL=redis://localhost:6379
DATABASE_URL=sqlite:///./dev.db
WORKDIR_BASE=/tmp/reliveai_workdir
SECRET_KEY=your-secret-key

# Storage
USE_GCS=false
GCS_BUCKET=your-bucket-name

# AI Models
CLIP_MODEL=hf-clip-vit-base-patch32
USE_CLIP=true

# Paths
SAMPLE_TRACKS_DIR=./sample_inputs/tracks
```

#### 6. **Docker Setup**

**Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: reliveai
      POSTGRES_PASSWORD: password
      POSTGRES_DB: reliveai
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      REDIS_URL: redis://redis:6379
      DATABASE_URL: postgresql://reliveai:password@db:5432/reliveai
    depends_on:
      - redis
      - db
    volumes:
      - ./workdir:/tmp/reliveai_workdir

  worker:
    build: ./backend
    command: python app/worker.py
    environment:
      REDIS_URL: redis://redis:6379
      DATABASE_URL: postgresql://reliveai:password@db:5432/reliveai
    depends_on:
      - redis
      - db
    volumes:
      - ./workdir:/tmp/reliveai_workdir
```

---

## Frontend Integration Points

Once the backend is running, update the frontend to call real APIs:

### Update API Service (`src/services/api.ts`)

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const createJob = async (formData: FormData) => {
  const response = await fetch(`${API_BASE_URL}/api/jobs`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

export const getJobStatus = async (jobId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`);
  return response.json();
};

export const getJobLogs = (jobId: string) => {
  return new EventSource(`${API_BASE_URL}/api/jobs/${jobId}/logs`);
};
```

### Update Create Page

Replace mock job creation with real API call:

```typescript
const handleSubmit = async () => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('mood', mood);
  formData.append('track', track);
  formData.append('target_duration', duration[0].toString());

  const result = await createJob(formData);
  navigate(`/jobs/${result.job_id}`);
};
```

### Update Job Detail Page

Replace simulation with real polling/SSE:

```typescript
useEffect(() => {
  const eventSource = getJobLogs(jobId);
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setStatus(data.status);
    setProgress(data.progress);
    setLogs(prev => [...prev, data.log]);
  };

  return () => eventSource.close();
}, [jobId]);
```

---

## Deployment Guide

### Local Development

1. **Start Backend:**
   ```bash
   cd backend
   docker-compose up
   ```

2. **Start Frontend:**
   ```bash
   npm install
   npm run dev
   ```

3. **Access:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Production Deployment

#### Option 1: Google Cloud Run

1. **Build and Push Docker Image:**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/reliveai-backend
   gcloud builds submit --tag gcr.io/PROJECT_ID/reliveai-worker
   ```

2. **Deploy Services:**
   ```bash
   gcloud run deploy reliveai-backend \
     --image gcr.io/PROJECT_ID/reliveai-backend \
     --platform managed \
     --region us-central1 \
     --set-env-vars USE_GCS=true,GCS_BUCKET=your-bucket
   ```

3. **Deploy Frontend:**
   - Build: `npm run build`
   - Deploy to Firebase Hosting, Vercel, or Netlify
   - Set `VITE_API_URL` to Cloud Run backend URL

#### Option 2: AWS ECS / Fargate

Similar Docker deployment with AWS-specific configuration.

---

## Next Steps

### Immediate (Make It Work)
1. Build Python FastAPI backend with job queue
2. Implement FFmpeg pipeline orchestration
3. Add basic CLIP scoring (or heuristic fallback)
4. Connect frontend to real API endpoints
5. Test end-to-end with sample dataset

### Short-term (Make It Better)
1. Add user authentication
2. Implement job persistence (PostgreSQL)
3. Add error handling and retry logic
4. Optimize FFmpeg commands for speed
5. Add more music tracks and moods

### Long-term (Scale It)
1. Cloud storage integration (GCS/S3)
2. CDN for video delivery
3. Horizontal scaling for workers
4. Advanced CLIP models (fine-tuned)
5. Custom transitions and effects library
6. User-uploaded music support
7. Social media direct sharing

---

## Technical Notes

### FFmpeg Command Examples

**Proxy Generation:**
```bash
ffmpeg -y -i input.mov \
  -vf "scale='min(1080,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -preset veryfast -crf 23 \
  -c:a aac -b:a 128k proxy.mp4
```

**Crossfade Transition:**
```bash
ffmpeg -i clip1.mp4 -i clip2.mp4 \
  -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.25:offset=2.5" \
  output.mp4
```

**Text Overlay:**
```bash
ffmpeg -i input.mp4 \
  -vf "drawtext=fontfile=/path/to/font.ttf:text='Summer 2025':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=50:box=1:boxcolor=black@0.5" \
  output.mp4
```

### CLIP Scoring Pseudocode

```python
import torch
from transformers import CLIPProcessor, CLIPModel

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

keywords = ["smile", "sunset", "party", "group", "landscape"]

def score_frame(image_path):
    image = Image.open(image_path)
    inputs = processor(text=keywords, images=image, return_tensors="pt", padding=True)
    outputs = model(**inputs)
    similarities = outputs.logits_per_image.softmax(dim=1)
    return similarities.max().item()
```

---

## Support & Resources

- **FFmpeg Documentation**: https://ffmpeg.org/documentation.html
- **Librosa Docs**: https://librosa.org/doc/latest/index.html
- **FastAPI Guide**: https://fastapi.tiangolo.com/
- **CLIP on HuggingFace**: https://huggingface.co/openai/clip-vit-base-patch32
- **Redis Queue (RQ)**: https://python-rq.org/

---

## License

MIT License - Feel free to use and modify for your projects.

---

**Built with ❤️ using Lovable**
