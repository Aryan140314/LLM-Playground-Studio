import streamlit as st

from llm.gemini_client import GeminiClient

# ---------------------------------
# Page Configuration
# ---------------------------------

st.set_page_config(
    page_title="Chat Playground",
    page_icon="💬",
    layout="wide"
)

# ---------------------------------
# Sidebar
# ---------------------------------

with st.sidebar:

    st.title("⚙ Settings")

    model = st.selectbox(
        "Model",
        [
            "Gemini 2.5 Flash"
        ]
    )

    st.divider()

    if st.button("🗑 Clear Chat", use_container_width=True):

        st.session_state.messages = []

        st.rerun()

# ---------------------------------
# Main Title
# ---------------------------------

st.title("💬 Chat Playground")

st.caption("Interact with Large Language Models")

# ---------------------------------
# Session State
# ---------------------------------

if "messages" not in st.session_state:

    st.session_state.messages = []

# ---------------------------------
# Display Previous Messages
# ---------------------------------

for message in st.session_state.messages:

    with st.chat_message(message["role"]):

        st.markdown(message["content"])

# ---------------------------------
# Chat Input
# ---------------------------------

prompt = st.chat_input("Type your message...")

# ---------------------------------
# Generate Response
# ---------------------------------

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

        with st.spinner("Gemini is thinking..."):

            client = GeminiClient()

            result = client.generate_response(prompt)

            st.markdown(result["text"])

            st.divider()

            col1, col2, col3 = st.columns(3)

            col1.metric(
                "⏱ Response Time",
                f'{result["response_time"]} sec'
            )

            col2.metric(
                "📝 Words",
                result["word_count"]
            )

            col3.metric(
                "🔠 Characters",
                result["character_count"]
            )

    st.session_state.messages.append(
        {
            "role": "assistant",
            "content": result["text"]
        }
    )