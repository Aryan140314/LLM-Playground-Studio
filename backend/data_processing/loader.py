import pandas as pd
from typing import List, Dict, Any

# Standard AG News class mapping
AG_NEWS_CLASSES = {
    1: "World",
    2: "Sports",
    3: "Business",
    4: "Sci/Tech"
}

def load_ag_news_csv(filepath: str) -> List[Dict[str, Any]]:
    """
    Reads a CSV dataset (like AG News), validates columns, 
    handles missing values, and returns a list of dictionaries.
    """
    # 1. Read CSV
    # If the CSV lacks headers, we provide them. AG News usually has 3 columns.
    df = pd.read_csv(filepath)
    
    # 2. Validate columns & standardize
    if len(df.columns) == 3 and 'Class Index' not in df.columns:
        df.columns = ['class_index', 'title', 'description']
    else:
        df.columns = [str(c).lower().replace(" ", "_") for c in df.columns]
        
    required_cols = {'title', 'description'}
    if not required_cols.issubset(set(df.columns)):
        # Fallback if different columns exist
        if 'text' in df.columns:
            df['description'] = df['text']
            df['title'] = ''
        else:
            raise ValueError(f"CSV is missing required columns. Found: {df.columns}")

    # 3. Handle missing values
    # Drop rows where both title and description are completely missing
    df = df.dropna(subset=['title', 'description'], how='all')
    # Fill remaining NaNs with empty string
    df = df.fillna('')
    
    records = []
    for idx, row in df.iterrows():
        cat_id = row.get('class_index')
        
        record = {
            "id": idx + 1,  # 1-based indexing for IDs
            "title": str(row['title']),
            "description": str(row['description']),
            "category": AG_NEWS_CLASSES.get(cat_id, "Unknown")
        }
        records.append(record)
        
    return records
