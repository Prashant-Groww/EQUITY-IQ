import io
import re
import pandas as pd
from loguru import logger

try:
    import pypdf
except ImportError:
    pypdf = None

def extract_text_from_pdf(pdf_bytes: bytes, filename: str = "document.pdf") -> list:
    """
    Extracts text page by page from PDF file bytes.
    Returns list of dicts: [{"page": page_num, "text": content}, ...]
    """
    chunks = []
    if pypdf is None:
        logger.warn("pypdf is not installed, attempting fallback plain text decoder")
        raw_text = pdf_bytes.decode('utf-8', errors='ignore')
        return [{"page": 1, "text": raw_text[:5000]}]

    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        num_pages = len(reader.pages)
        logger.info(f"Extracting text from PDF '{filename}' ({num_pages} pages)")

        for page_idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            page_text = page_text.strip()
            if len(page_text) > 0:
                chunks.append({
                    "page": page_idx + 1,
                    "text": page_text,
                    "source": f"{filename} (Page {page_idx + 1})"
                })
    except Exception as e:
        logger.error(f"Error parsing PDF '{filename}': {str(e)}")
        raw_text = pdf_bytes.decode('utf-8', errors='ignore')
        chunks.append({"page": 1, "text": raw_text, "source": filename})

    return chunks

def parse_structured_csv(csv_bytes: bytes, filename: str = "data.csv") -> list:
    """
    Parses CSV file using pandas, detects columns and converts rows into semantic structured statements.
    Returns list of dicts: [{"row": row_idx, "text": statement, "source": filename}, ...]
    """
    chunks = []
    try:
        df = pd.read_csv(io.BytesIO(csv_bytes))
        logger.info(f"Parsing structured CSV '{filename}' ({len(df)} rows, {len(df.columns)} columns)")

        columns = list(df.columns)
        col_str = ", ".join([str(c) for c in columns])
        
        # Summary chunk for overall table schema
        chunks.append({
            "row": 0,
            "text": f"CSV Dataset '{filename}' contains columns: [{col_str}]. Total records: {len(df)}.",
            "source": f"{filename} (Header Schema)"
        })

        # Process each row into a structured semantic sentence
        for idx, row in df.iterrows():
            row_items = []
            for col in columns:
                val = row[col]
                if pd.notna(val):
                    row_items.append(f"{col}: {val}")
            
            row_text = f"Record Row {idx + 1} ({filename}): " + "; ".join(row_items) + "."
            chunks.append({
                "row": idx + 1,
                "text": row_text,
                "source": f"{filename} (Row {idx + 1})"
            })
    except Exception as e:
        logger.error(f"Error parsing CSV '{filename}': {str(e)}")
        raw_text = csv_bytes.decode('utf-8', errors='ignore')
        chunks.append({"row": 1, "text": raw_text, "source": filename})

    return chunks
