# Django Backend Optimization for Local LLM

## Current Issues
- Local LLM processing is taking longer than expected (causing timeouts)
- "Broken pipe" errors when requests take too long
- Frontend timeout errors due to slow processing

## Solutions Implemented
1. **Increased Timeouts**: Updated from 30 seconds to 5 minutes (300 seconds)
   - Frontend components: `sentiment-n8n-tab-updated.tsx`, `sentiment-n8n-tab-improved.tsx`
   - Backend API route: `src/app/api/sentiment/route.ts`

2. **Better Error Messages**: Added specific messaging for LLM processing delays

3. **Keep-Alive Connection**: Added `Connection: keep-alive` header to prevent connection drops

## Django Backend Recommendations

### 1. Add Request Timeout Handling
In your Django views.py, add timeout handling:

```python
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import logging

@require_http_methods(["GET"])
def analyze_sentiment(request, symbol):
    try:
        # Your existing sentiment analysis code
        # Add progress logging
        logging.info(f"Starting sentiment analysis for {symbol}")
        
        # Your LLM processing here
        result = your_llm_processing_function(symbol)
        
        logging.info(f"Completed sentiment analysis for {symbol}")
        return JsonResponse(result)
        
    except Exception as e:
        logging.error(f"Error in sentiment analysis: {str(e)}")
        return JsonResponse({
            'error': 'PROCESSING_ERROR',
            'message': str(e)
        }, status=500)
```

### 2. Optimize LLM Processing
Consider these optimizations in your Django backend:

1. **Reduce Model Size**: Use a smaller, faster model for development
2. **Batch Processing**: Process multiple requests together
3. **Caching**: Cache LLM responses for repeated requests
4. **Async Processing**: Use Django Channels or Celery for long-running tasks

### 3. Add CORS and Connection Settings
In your Django settings.py:

```python
# Increase request timeout
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # Only for development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Keep connections alive
CONN_MAX_AGE = 60
```

### 4. Add Request Middleware for Timeout
Create a middleware to handle long requests:

```python
# middleware.py
import time
import logging
from django.utils.deprecation import MiddlewareMixin

class RequestTimingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.time()
        
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            logging.info(f"Request to {request.path} took {duration:.2f} seconds")
            
            if duration > 60:  # Log slow requests
                logging.warning(f"Slow request detected: {request.path} took {duration:.2f} seconds")
                
        return response
```

### 5. Stream Responses (Advanced)
For very long processing, consider streaming responses:

```python
from django.http import StreamingHttpResponse
import json

def stream_sentiment_analysis(request, symbol):
    def generate_progress():
        yield json.dumps({"status": "starting", "progress": 0}) + "\n"
        
        # Your processing steps
        yield json.dumps({"status": "fetching_data", "progress": 25}) + "\n"
        # ... fetch data
        
        yield json.dumps({"status": "analyzing", "progress": 50}) + "\n"
        # ... LLM processing
        
        yield json.dumps({"status": "complete", "progress": 100, "data": result}) + "\n"
    
    return StreamingHttpResponse(generate_progress(), content_type='application/json')
```

## Testing Your Changes
1. Start your Django server: `python manage.py runserver`
2. Test with Postman to ensure the endpoint still works
3. Test with the frontend to verify the longer timeout works
4. Monitor Django logs for timing information

## Quick Test Commands
```bash
# Test Django endpoint directly
curl "http://127.0.0.1:8000/sentiment/analyze/eurusd/?include_reddit=true&include_news=true&analyze_sentiment=true&max_items=20"

# Test Next.js API route
curl "http://localhost:3000/api/sentiment?symbol=EURUSD"
```
