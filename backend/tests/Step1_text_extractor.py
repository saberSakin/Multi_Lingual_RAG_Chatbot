from pdf2image import convert_from_path
import pytesseract

# Set Tesseract path if not in PATH
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"  # Update if your path is different

pdf_path = "HSC26-Bangla1st-Paper.pdf"
output_path = "extracted_bangla_ocr.txt"

# Convert PDF pages to images (specify poppler_path if needed)
pages = convert_from_path(pdf_path, poppler_path=r"C:\poppler\Library\bin")

with open(output_path, "w", encoding="utf-8") as f:
    for i, page in enumerate(pages):
        text = pytesseract.image_to_string(page, lang="ben")  # 'ben' for Bangla
        f.write(f"Page {i + 1}:\n")
        f.write(text)
        f.write("\n" + "="*50 + "\n")  # Separator between pages

print(f"✅ Bangla text extracted and saved to {output_path}")