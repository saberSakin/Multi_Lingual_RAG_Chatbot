from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from ai_model import chatbot
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Multi-Lingual RAG Chatbot API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    sessionId: str | None = None

class ChatResponse(BaseModel):
    answer: str
    context: str | None = None
    sessionId: str
    timestamp: float

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": time.time()}

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Chat endpoint that processes user messages and returns AI responses
    """
    try:
        # Log incoming request
        logger.info(f"Received chat request with message: {request.message[:50]}...")
        
        # Get response from RAG chatbot
        response = chatbot.get_rag_response(request.message)
        
        # Generate session ID if not provided
        # session_id = request.sessionId or f"session_{int(time.time())}"
        session_id = request.sessionId or "default"

        logger.info(f"Chatbot response: {response}")  # <-- Add this line
        
        return ChatResponse(
            answer=response["answer"],
            context=response["context"],
            sessionId=session_id,
            timestamp=time.time()
        )
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your request"
        )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred"}
    )
