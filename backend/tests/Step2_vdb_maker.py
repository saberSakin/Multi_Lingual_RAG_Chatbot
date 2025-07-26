from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
import google.generativeai as genai
from google.generativeai import GenerativeModel
import pickle
import os
from dotenv import load_dotenv

# Load Gemini API key
load_dotenv("../.env")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Load FAISS vectorstore
faiss_path = "faiss_index"

# Initialize the same embedding model used during creation
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

# Load the FAISS vectorstore (this is all you need)
vectorstore = FAISS.load_local(
    faiss_path,
    embeddings,
    allow_dangerous_deserialization=True
)

# Remove this section - it's causing the problem:
# with open(pkl_path, "rb") as f:
#     vectorstore, _ = pickle.load(f)

# Gemini model
model = GenerativeModel("models/gemini-2.0-flash")

# Queries
queries = [
    "Who did Anupom call his fortune god?",
    "অনুপমের ভাষায় সুপুরুষ কাকে বলা হয়েছে?",
    "বিয়ের সময় কল্যাণীর প্রকৃত বয়স কত ছিল?",
    "Who is the author of the story in the book?",
]

# Query loop
for query in queries:
    print(f"\n🔍 Query: {query}")
    try:
        docs = vectorstore.similarity_search(query, k=1)
        if docs:
            top_chunk = docs[0].page_content
            print(f"📄 Top Chunk:\n{top_chunk}\n")
            prompt = f"Answer this question based on the following context:\n{top_chunk}\n\nQuestion: {query}"
            response = model.generate_content(prompt)
            print(f"🤖 Gemini Answer:\n{response.text}\n")
        else:
            print("No relevant chunk found.\n")
    except Exception as e:
        print(f"Error processing query: {e}\n")