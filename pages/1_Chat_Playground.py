import streamlit as st
from llm.gemini_client import GeminiClient

st.set_page_config(
    page_title="Chat Playground",
    page_icon="💬",
    layout="wide"
)

st.title("💬 Chat Playground")

st.write("Interact with Google's Gemini model.")

# -------------------------
# Session State
# -------------------------

if "messages" not in st.session_state:
    st.session_state.messages = []

# -------------------------
# Display Chat History
# -------------------------

for message in st.session_state.messages:

    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# -------------------------
# User Input
# -------------------------

prompt = st.chat_input("Ask Gemini anything...")

# -------------------------
# Generate Response
# -------------------------

if prompt:

    st.session_state.messages.append(
        {
            "role": "user",
            "content": prompt
        }
    )

    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):

        with st.spinner("Thinking..."):

            client = GeminiClient()

            response = client.generate_response(prompt)

            st.markdown(response)

    st.session_state.messages.append(
        {
            "role": "assistant",
            "content": response
        }
    )