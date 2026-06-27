import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from huggingface.tokenizer_utils import get_tokenizer_data
from utils.tokenizer_metrics import calculate_metrics
from utils.export import to_csv
from utils.charts import bar_chart

# ------------------------------------------------
# Page Configuration
# ------------------------------------------------
st.set_page_config(
    page_title="Tokenizer Explorer",
    page_icon="🔤",
    layout="wide"
)

# ------------------------------------------------
# Main Title & Header
# ------------------------------------------------
st.title("🔤 Tokenizer Explorer")
st.caption("Compare how different Large Language Model tokenization algorithms process your text.")

# ------------------------------------------------
# Sidebar Configuration
# ------------------------------------------------
with st.sidebar:
    st.header("⚙️ Tokenizer Settings")
    
    st.markdown("Customize the models used for the tokenization comparison.")
    
    gpt_model = st.selectbox(
        "GPT Tokenizer (BPE)",
        options=["cl100k_base", "o200k_base", "p50k_base"],
        index=0,
        help="cl100k_base: GPT-4 & GPT-3.5\no200k_base: GPT-4o\np50k_base: Codex / GPT-3"
    )
    
    bert_model = st.selectbox(
        "BERT Tokenizer (WordPiece)",
        options=["bert-base-uncased", "bert-base-cased"],
        index=0,
        help="bert-base-uncased: lowercases text\nbert-base-cased: preserves text casing"
    )
    
    sp_model = st.selectbox(
        "SentencePiece Tokenizer",
        options=["t5-small", "xlm-roberta-base"],
        index=0,
        help="t5-small: Standard T5 vocabulary\nxlm-roberta-base: Multilingual vocabulary"
    )
    
    st.divider()
    
    include_special = st.toggle(
        "Include Special Tokens",
        value=True,
        help="Whether to include start/end sequence tokens like [CLS], [SEP] for BERT, or </s> for T5."
    )

# ------------------------------------------------
# Preset Templates & Input Text
# ------------------------------------------------
st.subheader("Input Text")

# Preset selector
preset_options = {
    "English Sentence": "I love Machine Learning and Generative AI.",
    "Python Code Block": "def greet(name: str) -> str:\n    return f\"Hello, {name}!\" # Greeting function",
    "Multilingual Text": "Hello World! Bonjour le monde! ¡Hola Mundo! Hello Welt! 🤖",
    "Tricky Token Boundaries": "tokenize, tokenization, tokenise, tokenisation, subword, sub-word, wordpiece.",
}

col_preset, _ = st.columns([2, 2])
with col_preset:
    preset_choice = st.selectbox("Choose a sample preset or write custom text below:", list(preset_options.keys()))

default_text = preset_options[preset_choice]

# TextInput area
input_text = st.text_area(
    "Text to Tokenize",
    value=default_text,
    height=120,
    placeholder="Enter text to analyze..."
)

# ------------------------------------------------
# Tokenization Logic & State
# ------------------------------------------------
token_results = {}
metrics_results = {}
success = True

if st.button("🚀 Tokenize Text", use_container_width=True) or input_text:
    
    if not input_text.strip():
        st.warning("Please enter some text to tokenize.")
    else:
        # Tokenize with GPT
        with st.spinner("Tokenizing with GPT..."):
            gpt_res = get_tokenizer_data(input_text, "gpt", gpt_model)
            if gpt_res["success"]:
                token_results["GPT"] = gpt_res
                metrics_results["GPT"] = calculate_metrics(input_text, gpt_res["tokens"], gpt_res["ids"])
            else:
                st.error(f"GPT Tokenization failed: {gpt_res['error']}")
                success = False

        # Tokenize with BERT
        with st.spinner("Tokenizing with BERT..."):
            bert_res = get_tokenizer_data(input_text, "bert", bert_model, include_special_tokens=include_special)
            if bert_res["success"]:
                token_results["BERT"] = bert_res
                metrics_results["BERT"] = calculate_metrics(input_text, bert_res["tokens"], bert_res["ids"])
            else:
                st.error(f"BERT Tokenization failed: {bert_res['error']}")
                success = False

        # Tokenize with SentencePiece
        with st.spinner("Tokenizing with SentencePiece..."):
            sp_res = get_tokenizer_data(input_text, "sentencepiece", sp_model, include_special_tokens=include_special)
            if sp_res["success"]:
                token_results["SentencePiece"] = sp_res
                metrics_results["SentencePiece"] = calculate_metrics(input_text, sp_res["tokens"], sp_res["ids"])
            else:
                st.error(f"SentencePiece Tokenization failed: {sp_res['error']}")
                success = False

# Helper function to generate beautiful colored token badges
def generate_token_html(tokens: list, ids: list) -> str:
    colors = [
        {"bg": "rgba(74, 222, 128, 0.15)", "border": "rgba(74, 222, 128, 0.4)", "text": "#16a34a"},
        {"bg": "rgba(96, 165, 250, 0.15)", "border": "rgba(96, 165, 250, 0.4)", "text": "#2563eb"},
        {"bg": "rgba(250, 204, 21, 0.15)", "border": "rgba(250, 204, 21, 0.4)", "text": "#ca8a04"},
        {"bg": "rgba(192, 132, 252, 0.15)", "border": "rgba(192, 132, 252, 0.4)", "text": "#9333ea"},
        {"bg": "rgba(244, 63, 94, 0.15)", "border": "rgba(244, 63, 94, 0.4)", "text": "#e11d48"},
        {"bg": "rgba(45, 212, 191, 0.15)", "border": "rgba(45, 212, 191, 0.4)", "text": "#0d9488"},
    ]
    
    html = ['<div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; line-height: 1.8; background-color: transparent;">']
    
    for idx, (token, token_id) in enumerate(zip(tokens, ids)):
        color = colors[idx % len(colors)]
        
        # Escape HTML special characters
        escaped_token = (
            token.replace("&", "&amp;")
                 .replace("<", "&lt;")
                 .replace(">", "&gt;")
        )
        
        # Make spaces visible as dots for easier boundary inspection
        display_token = escaped_token.replace(" ", "·")
        
        html.append(
            f'<span style="'
            f'background-color: {color["bg"]}; '
            f'border: 1px solid {color["border"]}; '
            f'color: {color["text"]}; '
            f'padding: 2px 6px; '
            f'border-radius: 4px; '
            f'font-family: monospace; '
            f'font-size: 14px; '
            f'cursor: help; '
            f'white-space: pre;'
            f'" title="Index: {idx}\nToken ID: {token_id}\nRaw Token: {token}">'
            f'{display_token}'
            f'</span>'
        )
        
    html.append('</div>')
    return "".join(html)

# ------------------------------------------------
# Comparison View (Only shown if tokenization succeeded)
# ------------------------------------------------
if success and metrics_results:
    st.divider()
    st.subheader("Tokenizer Comparison Dashboard")
    
    # 1. Comparative Metrics Table
    summary_data = []
    for t_name, metrics in metrics_results.items():
        summary_data.append({
            "Tokenizer": t_name,
            "Model Name": gpt_model if t_name == "GPT" else (bert_model if t_name == "BERT" else sp_model),
            "Algorithm": token_results[t_name]["algorithm"],
            "Token Count": metrics["token_count"],
            "Avg Token Len (chars)": metrics["avg_token_len"],
            "Longest Token": f"'{metrics['longest_token']}' ({metrics['longest_token_len']})",
            "Char/Token Ratio": metrics["char_token_ratio"],
            "Vocabulary Size": token_results[t_name]["vocab_size"]
        })
        
    df_summary = pd.DataFrame(summary_data)
    st.dataframe(df_summary, use_container_width=True, hide_index=True)
    
    # 2. Main Tabs
    tab_visualizer, tab_charts, tab_details, tab_edu = st.tabs([
        "🎨 Interactive Token Visualizer",
        "📊 Comparison Charts",
        "📄 Detailed Token Tables",
        "📚 Learn the Algorithms"
    ])
    
    # --- TAB 1: INTERACTIVE VISUALIZER ---
    with tab_visualizer:
        st.markdown("### Alternating Colored Tokens")
        st.caption("Hover over individual tokens to inspect their exact Token ID and sequence index.")
        
        for t_name in ["GPT", "BERT", "SentencePiece"]:
            model_info_name = gpt_model if t_name == "GPT" else (bert_model if t_name == "BERT" else sp_model)
            st.markdown(f"#### **{t_name}** - `{model_info_name}` ({token_results[t_name]['algorithm']})")
            
            html_content = generate_token_html(
                token_results[t_name]["tokens"],
                token_results[t_name]["ids"]
            )
            st.markdown(html_content, unsafe_allow_html=True)
            st.markdown(f"**Total Tokens:** `{metrics_results[t_name]['token_count']}` | **Vocabulary Size:** `{token_results[t_name]['vocab_size']:,}`")
            st.write("")
            
    # --- TAB 2: COMPARISON CHARTS ---
    with tab_charts:
        st.markdown("### Graphical Comparison")
        
        chart_col1, chart_col2 = st.columns(2)
        
        with chart_col1:
            # Token Count Comparison
            fig_count = go.Figure(data=[
                go.Bar(
                    x=df_summary["Tokenizer"],
                    y=df_summary["Token Count"],
                    text=df_summary["Token Count"],
                    textposition='auto',
                    marker_color=['#16a34a', '#2563eb', '#ca8a04']
                )
            ])
            fig_count.update_layout(
                title_text="Token Count (Lower is usually more efficient)",
                xaxis_title="Tokenizer",
                yaxis_title="Count of Tokens",
                template="plotly_white"
            )
            st.plotly_chart(fig_count, use_container_width=True)
            
        with chart_col2:
            # Average Token Length Comparison
            fig_len = go.Figure(data=[
                go.Bar(
                    x=df_summary["Tokenizer"],
                    y=df_summary["Avg Token Len (chars)"],
                    text=df_summary["Avg Token Len (chars)"],
                    textposition='auto',
                    marker_color=['#16a34a', '#2563eb', '#ca8a04']
                )
            ])
            fig_len.update_layout(
                title_text="Average Token Length (in characters)",
                xaxis_title="Tokenizer",
                yaxis_title="Avg Characters per Token",
                template="plotly_white"
            )
            st.plotly_chart(fig_len, use_container_width=True)
            
    # --- TAB 3: DETAILED TABLES & CSV EXPORT ---
    with tab_details:
        st.markdown("### Detailed Token & ID Breakdown")
        
        table_cols = st.columns(3)
        
        for idx, t_name in enumerate(["GPT", "BERT", "SentencePiece"]):
            with table_cols[idx]:
                st.markdown(f"#### **{t_name}** Details")
                
                # Build detailed dataframe
                tokens_list = token_results[t_name]["tokens"]
                ids_list = token_results[t_name]["ids"]
                
                df_detail = pd.DataFrame({
                    "Index": range(len(ids_list)),
                    "Token String": tokens_list,
                    "Token ID": ids_list,
                    "Length (chars)": [len(t) for t in tokens_list]
                })
                
                st.dataframe(df_detail, use_container_width=True, hide_index=True, height=300)
                
                # CSV Export
                csv_data = to_csv(df_detail)
                st.download_button(
                    label=f"📥 Download {t_name} CSV",
                    data=csv_data,
                    file_name=f"{t_name.lower()}_tokenization.csv",
                    mime="text/csv",
                    key=f"dl_csv_{t_name.lower()}"
                )
                
                # Copy raw tokens string representation helper
                flat_tokens = ", ".join([f"'{t}'" for t in tokens_list])
                st.text_area(f"Raw {t_name} Tokens Array (Copyable)", value=flat_tokens, height=60, key=f"copy_{t_name.lower()}")

    # --- TAB 4: EDUCATIONAL CONTENT ---
    with tab_edu:
        st.markdown("### Understanding Subword Tokenization Algorithms")
        
        st.markdown("""
        To convert raw text into something a neural network can understand, LLMs use **Subword Tokenizers**.
        This strikes a balance between **Character-level tokenization** (too many tokens, no semantic structure) and **Word-level tokenization** (massive vocabulary size, cannot handle typos or out-of-vocabulary words).
        """)
        
        col_edu1, col_edu2, col_edu3 = st.columns(3)
        
        with col_edu1:
            st.info("### 1. BPE (Byte-Pair Encoding)")
            st.markdown("""
            **Used by:** GPT-3.5/4/4o, LLaMA, RoBERTa.
            
            **How it works:**
            1. Starts with every character (or byte) as an individual token.
            2. Iteratively finds the most frequent pair of adjacent tokens in the corpus.
            3. Merges them into a new single token.
            4. Repeats this process until the desired vocabulary size is reached.
            
            **Key characteristic:**
            Uses byte-level fallback (`tiktoken`), meaning it can tokenize *any* string of bytes without out-of-vocabulary (OOV) errors.
            """)
            
        with col_edu2:
            st.success("### 2. WordPiece")
            st.markdown("""
            **Used by:** BERT, DistilBERT, MobileBERT.
            
            **How it works:**
            1. Starts with all characters in the vocabulary.
            2. Rather than choosing the absolute most frequent pair, it picks pairs that *maximize the likelihood of the training data* (using a statistical score comparing joint frequency vs individual frequency).
            3. Uses prefix notations like `##` to identify subwords that must be attached to the previous token.
            
            **Key characteristic:**
            Often has an explicit list of special tokens (`[CLS]`, `[SEP]`, `[MASK]`) and throws OOV tokens (`[UNK]`) if a character is completely unknown.
            """)
            
        with col_edu3:
            st.warning("### 3. SentencePiece (Unigram)")
            st.markdown("""
            **Used by:** T5, ALBERT, XLNet, MarianMT.
            
            **How it works:**
            1. Often uses the **Unigram Language Model** algorithm.
            2. Starts with a *very large* set of subwords and iteratively *prunes* (deletes) the least useful tokens to maximize corpus probability.
            3. Treats the space character as an ordinary symbol (rendered as ` ` - Unicode block `\u2581`).
            
            **Key characteristic:**
            Lossless tokenization. Because it preserves spaces as a character symbol ` `, it can convert tokens back to the exact string without relying on language-specific rule-based pre-tokenizers.
            """)
