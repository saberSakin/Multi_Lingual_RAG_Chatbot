from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
import google.generativeai as genai
from google.generativeai import GenerativeModel
import os
from dotenv import load_dotenv

# Load Gemini API key
load_dotenv("../.env")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Initialize embedding model (must be the same as creation)
print("🔗 Loading embedding model...")
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

# Load FAISS vectorstore
print("📚 Loading FAISS vectorstore...")
try:
    vectorstore = FAISS.load_local(
        "faiss_index",
        embeddings,
        allow_dangerous_deserialization=True
    )
    print(f"✅ Loaded successfully: {type(vectorstore)}")
    print(f"✅ Has similarity_search method: {hasattr(vectorstore, 'similarity_search')}")
    
    # Verify it's the right object type
    if not hasattr(vectorstore, 'similarity_search'):
        raise Exception("Vectorstore doesn't have similarity_search method!")
        
except Exception as e:
    print(f"❌ Failed to load vectorstore: {e}")
    print("Please check your faiss_index directory!")
    exit(1)

# Initialize Gemini model
model = GenerativeModel("models/gemini-2.0-flash")

# Test queries
queries = [
    "Who did Anupom call his fortune god?",
    "অনুপমের ভাষায় সুপুরুষ কাকে বলা হয়েছে?",
    "বিয়ের সময় কল্যাণীর প্রকৃত বয়স কত ছিল?",
    "Who is the author of the story in the book?",
]

# Process queries
for i, query in enumerate(queries, 1):
    print(f"\n{'='*50}")
    print(f"🔍 Query {i}: {query}")
    print('='*50)
    
    try:
        # Search for relevant documents
        docs = vectorstore.similarity_search(query, k=3)  # Get top 3 for better context
        
        if docs:
            # Combine top chunks for better context
            context = "\n\n".join([doc.page_content for doc in docs[:2]])  # Use top 2
            print(f"📄 Retrieved Context:\n{context[:200]}...\n")
            
            # Generate answer using Gemini
            prompt = f"""Based on the following context from a Bengali text, please answer the question. If the answer is not clearly available in the context, please say so.

Context:
{context}

Question: {query}

Answer:"""
            
            response = model.generate_content(prompt)
            print(f"🤖 Gemini Answer:\n{response.text}")
            
        else:
            print("❌ No relevant documents found.")
            
    except Exception as e:
        print(f"❌ Error processing query: {e}")

print(f"\n{'='*50}")
print("🎉 Testing complete!")
print('='*50)