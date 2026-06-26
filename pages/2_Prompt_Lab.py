import streamlit as st

from llm.gemini_client import GeminiClient
from llm.prompt_templates import PromptTemplates


st.set_page_config(
    page_title="Prompt Lab",
    page_icon="🧠",
    layout="wide"
)

st.title("🧠 Prompt Engineering Lab")

st.markdown(
    """
Experiment with different Prompt Engineering techniques.

Current Strategies:

- Normal
- Zero Shot
- Few Shot
- Chain of Thought
"""
)

st.divider()

# ------------------------------------------------
# Sidebar
# ------------------------------------------------

with st.sidebar:

    st.header("⚙ Settings")

    strategy = st.selectbox(
        "Prompt Strategy",
        [
            "Normal",
            "Zero Shot",
            "Few Shot",
            "Chain of Thought"
        ]
    )

st.subheader("Ask your Question")

question = st.text_area(
    "",
    height=180,
    placeholder="Example: Explain Transformers."
)

if st.button("🚀 Generate Response", use_container_width=True):

    if question.strip() == "":

        st.warning("Please enter a question.")

        st.stop()

    # ----------------------------------------
    # Select Prompt
    # ----------------------------------------

    if strategy == "Normal":

        prompt = PromptTemplates.normal(question)

    elif strategy == "Zero Shot":

        prompt = PromptTemplates.zero_shot(question)

    elif strategy == "Few Shot":

        prompt = PromptTemplates.few_shot(question)

    else:

        prompt = PromptTemplates.chain_of_thought(question)

    client = GeminiClient()

    result = client.generate_response(prompt)

    st.divider()

    st.subheader("📤 Prompt Sent")

    st.code(prompt)

    st.divider()

    st.subheader("🤖 Gemini Response")

    if result["success"]:

        st.write(result["text"])

    else:

        st.error(result["text"])

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