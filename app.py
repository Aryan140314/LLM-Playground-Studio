import streamlit as st

st.set_page_config(
    page_title="LLM Playground Studio",
    page_icon="🤖",
    layout="wide"
)

st.title("🤖 LLM Playground Studio")

st.markdown("""
Welcome to **LLM Playground Studio**.

This project helps you learn and explore:

- 💬 LLM APIs
- 🧠 Prompt Engineering
- 🔤 Tokenizers
- 📊 Embeddings
- ⚖️ Model Comparison

Use the sidebar to navigate through the application.
""")

st.sidebar.success("Select a module from the sidebar.")