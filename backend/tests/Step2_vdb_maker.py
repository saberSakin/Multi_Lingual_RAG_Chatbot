from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
import google.generativeai as genai
from google.generativeai import GenerativeModel
import os
from dotenv import load_dotenv

# Load Gemini API key
load_dotenv("../.env")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Load the extracted text
input_file = "extracted_bangla_ocr.txt"
with open(input_file, "r", encoding="utf-8") as f:
    raw_text = f.read()

# Create text splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    separators=["\n\n", "\n", "।", ".", "?", "!", " ", ""]
)

# Split text into chunks
print("📄 Splitting text into chunks...")
text_chunks = text_splitter.split_text(raw_text)
print(f"Created {len(text_chunks)} chunks")

# Initialize embedding model
print("🔗 Initializing embedding model...")
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

# Create and save FAISS index
print("💾 Creating FAISS index...")
faiss_path = "faiss_index"
vectorstore = FAISS.from_texts(text_chunks, embeddings)
vectorstore.save_local(faiss_path)

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