import os
import sys
import json
import logging
from datasets import load_dataset

# Ensure backend module can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.data_processing.loader import load_ag_news_csv
from backend.data_processing.cleaner import clean_and_merge_records
from dataclasses import asdict

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    # Setup paths
    backend_data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    os.makedirs(backend_data_dir, exist_ok=True)
    
    raw_csv_path = os.path.join(backend_data_dir, 'ag_news_raw.csv')
    processed_json_path = os.path.join(backend_data_dir, 'processed_documents.json')
    
    # 1. Download AG News if the raw CSV is missing
    if not os.path.exists(raw_csv_path):
        logger.info("Raw CSV not found. Downloading AG News dataset from Hugging Face...")
        dataset = load_dataset("fancyzhx/ag_news", split="train")
        df = dataset.to_pandas()
        
        # AG News labels in HF are 0-3. Our mapping expects 1-4.
        df['class_index'] = df['label'] + 1
        
        # HF 'ag_news' just gives us a 'text' column which we map to description
        df['description'] = df['text']
        df['title'] = '' 
        
        df = df[['class_index', 'title', 'description']]
        df.to_csv(raw_csv_path, index=False)
        logger.info(f"Saved raw data to {raw_csv_path}")

    # 2. Run loader
    logger.info("Loading data via loader.py...")
    raw_records = load_ag_news_csv(raw_csv_path)
    
    # 3. Run cleaner
    logger.info("Cleaning data via cleaner.py...")
    clean_docs = clean_and_merge_records(raw_records)
    
    # 4. Save processed output
    logger.info(f"Saving processed data to {processed_json_path}")
    docs_dicts = [asdict(doc) for doc in clean_docs]
    
    with open(processed_json_path, 'w', encoding='utf-8') as f:
        json.dump(docs_dicts, f, indent=4)
        
    logger.info(f"Pipeline complete! Processed {len(docs_dicts)} documents.")

if __name__ == "__main__":
    main()
