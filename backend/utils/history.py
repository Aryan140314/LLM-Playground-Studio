import streamlit as st
from datetime import datetime

def log_run(model_name: str, strategy: str, prompt: str, success: bool, response_time: float, word_count: int, character_count: int):
    """
    Logs an LLM generation run to the Streamlit session state history.
    This logs metadata that powers the Analytics Dashboard.
    """
    if "run_history" not in st.session_state:
        st.session_state.run_history = []
        
    st.session_state.run_history.append({
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "model": model_name,
        "strategy": strategy,
        "prompt": prompt[:60] + "..." if len(prompt) > 60 else prompt,
        "success": success,
        "response_time": response_time,
        "word_count": word_count,
        "character_count": character_count
    })
