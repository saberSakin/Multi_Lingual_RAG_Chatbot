
# RAG-based chatbot model logic
import os
from typing import Optional
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
import google.generativeai as genai
from google.generativeai import GenerativeModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)

import re

def detect_language(text: str) -> str:
    """Detects if the text is Bengali or English (simple heuristic)."""
    # Bengali Unicode range: \u0980-\u09FF
    if re.search(r'[\u0980-\u09FF]', text):
        return "bn"
    return "en"

class RAGChatbot:
    def __init__(self):
        self.embeddings = None
        self.vectorstore = None
        self.model = None
        self.initialize_models()

    def initialize_models(self):
        """Initialize the embedding model, vector store and LLM"""
        try:
            # Initialize embedding model
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
            )
            logger.info("✅ Embedding model loaded successfully")

            # Load FAISS vectorstore
            FAISS_DIR = os.path.join("data", "faiss_index")
            self.vectorstore = FAISS.load_local(
                FAISS_DIR,
                self.embeddings,
                allow_dangerous_deserialization=True
            )
            logger.info("✅ FAISS vectorstore loaded successfully")

            # Initialize Gemini model
            self.model = GenerativeModel("models/gemini-2.0-flash")
            logger.info("✅ Gemini model initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize models: {str(e)}")
            raise

    def get_rag_response(self, query: str) -> dict:
        try:
            if not query or not query.strip():
                return {
                    "answer": "Please provide a valid question.",
                    "context": None,
                    "error": None
                }

            docs = self.vectorstore.similarity_search(query, k=3)
            if not docs:
                return {
                    "answer": "No relevant information found for your query.",
                    "context": None,
                    "error": None
                }

            context = "\n\n".join([doc.page_content for doc in docs[:2]])
            lang = detect_language(query)

            if lang == "bn":
                prompt = f"""প্রসঙ্গটি মনোযোগ দিয়ে পড়ুন এবং প্রশ্নের উত্তর নিজের ভাষায় স্পষ্টভাবে দিন। 
উত্তরটি প্রসঙ্গের তথ্যের ভিত্তিতে যুক্তিসম্মত ও সংক্ষিপ্তভাবে দিন। 
যদি প্রসঙ্গে উত্তর না থাকে, 'প্রসঙ্গে উত্তর নেই' লিখুন।

প্রসঙ্গ:
{context}

প্রশ্ন: {query}

উত্তর:"""
            else:
                prompt = f"""Read the following context carefully and answer the question in your own words, clearly and concisely in English. 
Base your answer on the information in the context, using reasoning if needed. 
If the answer is not present, reply 'Not available in the context.

Context:
{context}

Question: {query}

Answer:"""

            response = self.model.generate_content(prompt)
            return {
                "answer": response.text.strip(),
                "context": context,
                "error": None
            }

        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return {
                "answer": "Sorry, I encountered an error while processing your query.",
                "context": None,
                "error": str(e)
            }

# Initialize global chatbot instance
chatbot = RAGChatbot()

def get_rag_response(query: str) -> str:
    """
    Wrapper function for backward compatibility
    """
    response = chatbot.get_rag_response(query)
    return response["answer"]


