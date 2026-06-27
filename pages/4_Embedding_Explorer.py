import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from huggingface.embedding_utils import generate_embeddings
from huggingface.similarity import cosine_scores, query_similarity
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.cluster import KMeans

# ------------------------------------------------
# Page Configuration
# ------------------------------------------------
st.set_page_config(
    page_title="Embedding Explorer",
    page_icon="📊",
    layout="wide"
)

# ------------------------------------------------
# Main Title & Header
# ------------------------------------------------
st.title("📊 Embedding Explorer")
st.caption("Generate vector representations of text, analyze semantic similarities, and visualize high-dimensional embeddings.")

# ------------------------------------------------
# Sidebar Configuration
# ------------------------------------------------
with st.sidebar:
    st.header("⚙️ Embedding Settings")
    st.markdown("Configure the model and visual settings.")
    
    # Model Selector
    model_name = st.selectbox(
        "Embedding Model",
        options=[
            "sentence-transformers/all-MiniLM-L6-v2",
            "sentence-transformers/all-mpnet-base-v2",
            "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        ],
        index=0,
        help="all-MiniLM-L6-v2: Fast & efficient (384 dims)\nall-mpnet-base-v2: High quality (768 dims)\nparaphrase-multilingual-MiniLM-L12-v2: Supports multiple languages (384 dims)"
    )
    
    st.divider()
    
    st.header("🗺️ 2D Projection Settings")
    
    # Dimension reduction method
    dim_algo = st.radio(
        "Reduction Algorithm",
        options=["PCA", "t-SNE"],
        index=0,
        help="PCA: Linear projection, fast and deterministic.\nt-SNE: Non-linear projection, excellent at keeping similar items close."
    )
    
    st.divider()
    
    st.header("🤖 Clustering Settings")
    
    # Enable K-means clustering
    enable_cluster = st.toggle(
        "Perform Semantic Clustering",
        value=False,
        help="Use K-Means to cluster sentences into distinct groups based on their embeddings."
    )
    
    if enable_cluster:
        n_clusters = st.slider(
            "Number of Clusters (K)",
            min_value=2,
            max_value=6,
            value=3,
            step=1
        )

# ------------------------------------------------
# Presets & Input Area
# ------------------------------------------------
st.subheader("Input Sentences")

preset_options = {
    "Semantic Similarity": [
        "I love AI",
        "I enjoy Machine Learning",
        "Banana is yellow",
        "A mango is a delicious sweet fruit",
        "Deep learning is a subset of artificial intelligence"
    ],
    "Word Disambiguation": [
        "The bank of the river was covered in moss.",
        "He went to the river bank to fish.",
        "I need to deposit money at the bank.",
        "The financial bank announced a new interest rate.",
        "The robbery occurred at a local banking institution."
    ],
    "Tech vs Food": [
        "Apple released a new iPhone model today.",
        "Microsoft is investing heavily in cloud computing.",
        "I bought a fresh, juicy apple from the market.",
        "Baking an apple pie requires sweet apples and cinnamon.",
        "Google plans to update its search engine algorithms."
    ],
    "Custom Text": []
}

col_preset, _ = st.columns([2, 2])
with col_preset:
    preset_choice = st.selectbox("Choose a sample preset to load:", list(preset_options.keys()))

# Get default lines
if preset_choice == "Custom Text":
    default_text = ""
else:
    default_text = "\n".join(preset_options[preset_choice])

# TextInput area
input_text = st.text_area(
    "Enter sentences (one per line, minimum 2 sentences):",
    value=default_text,
    height=140,
    placeholder="Type sentences here..."
)

# ------------------------------------------------
# Computation Trigger
# ------------------------------------------------
sentences = [s.strip() for s in input_text.split("\n") if s.strip()]

if len(sentences) < 2:
    st.warning("Please enter at least 2 sentences to perform comparisons and visualization.")
else:
    with st.spinner("Generating embeddings..."):
        try:
            # Generate embeddings
            embeddings = generate_embeddings(sentences, model_name=model_name)
            
            # Calculate pairwise similarity matrix
            sim_matrix = cosine_scores(embeddings)
            
            st.success("Embeddings generated successfully!")
            st.divider()
            
            # ------------------------------------------------
            # Interactive Tabs
            # ------------------------------------------------
            tab_heatmap, tab_projection, tab_search, tab_vectors = st.tabs([
                "🔥 Similarity Heatmap",
                "🗺️ 2D Vector Space",
                "🔍 Semantic Search",
                "🔢 Raw Vector Inspection"
            ])
            
            # --- TAB 1: SIMILARITY HEATMAP ---
            with tab_heatmap:
                st.markdown("### Cosine Similarity Heatmap")
                st.caption("A cosine similarity score near 1.0 means high semantic similarity; near 0.0 means unrelated.")
                
                # Truncate labels for cleaner rendering on the plot axes
                truncated_labels = [s[:25] + "..." if len(s) > 25 else s for s in sentences]
                
                fig_heatmap = px.imshow(
                    sim_matrix,
                    labels=dict(color="Similarity Score"),
                    x=truncated_labels,
                    y=truncated_labels,
                    color_continuous_scale="Viridis",
                    aspect="auto",
                    text_auto=".2f"
                )
                
                # Update hover information
                fig_heatmap.update_traces(
                    hovertemplate="Sentence A: %{y}<br>Sentence B: %{x}<br>Similarity: %{z:.4f}<extra></extra>"
                )
                fig_heatmap.update_layout(
                    margin=dict(l=10, r=10, t=10, b=10),
                    yaxis=dict(autorange="reversed")
                )
                
                st.plotly_chart(fig_heatmap, use_container_width=True)
                
            # --- TAB 2: 2D VECTOR SPACE ---
            with tab_projection:
                st.markdown("### 2D Projection of Embedding Space")
                st.caption("Dimensionality reduction projects the high-dimensional vectors to 2D while keeping semantically similar sentences close together.")
                
                n_samples = len(sentences)
                coords = None
                
                if dim_algo == "PCA":
                    # PCA needs min(samples, features) components
                    n_comp = min(2, n_samples)
                    pca = PCA(n_components=n_comp)
                    coords = pca.fit_transform(embeddings)
                    # If PCA only yields 1D coordinate, pad with zeros
                    if coords.shape[1] < 2:
                        coords = np.column_stack((coords[:, 0], np.zeros(n_samples)))
                else:
                    # t-SNE perplexity must be less than the number of samples
                    perplexity = min(30, max(1, n_samples - 1))
                    tsne = TSNE(n_components=2, perplexity=perplexity, random_state=42, init='pca')
                    coords = tsne.fit_transform(embeddings)
                
                df_coords = pd.DataFrame({
                    "x": coords[:, 0],
                    "y": coords[:, 1],
                    "Sentence": sentences
                })
                
                # Clustering
                color_col = None
                if enable_cluster:
                    actual_k = min(n_clusters, n_samples)
                    kmeans = KMeans(n_clusters=actual_k, random_state=42)
                    df_coords["Cluster"] = kmeans.fit_predict(embeddings)
                    df_coords["Cluster"] = df_coords["Cluster"].astype(str) # color discrete
                    color_col = "Cluster"
                    st.info(f"K-Means grouped these sentences into `{actual_k}` semantic clusters.")
                
                fig_scatter = px.scatter(
                    df_coords,
                    x="x",
                    y="y",
                    color=color_col,
                    hover_data={"Sentence": True, "x": False, "y": False},
                    title=f"2D Projection via {dim_algo}"
                )
                
                # Apply custom styled markers and label positions
                fig_scatter.update_traces(
                    textposition="top center",
                    mode="markers+text",
                    text=truncated_labels,
                    marker=dict(size=14, line=dict(width=1, color="DarkSlateGrey"))
                )
                
                fig_scatter.update_layout(
                    template="plotly_white",
                    margin=dict(l=10, r=10, t=40, b=10)
                )
                
                st.plotly_chart(fig_scatter, use_container_width=True)
                
            # --- TAB 3: SEMANTIC SEARCH ---
            with tab_search:
                st.markdown("### Semantic Search Sandbox")
                st.markdown("Type a query string below to find the sentences most semantically relevant, even if they share no exact words!")
                
                search_query = st.text_input("Enter search query (e.g., 'fruit', 'bank account', 'smartphones'):", placeholder="Type a search query...")
                
                if search_query:
                    # Embed search query
                    query_emb = generate_embeddings(search_query, model_name=model_name)[0]
                    
                    # Calculate similarity scores
                    scores = query_similarity(query_emb, embeddings)
                    
                    # Sort results
                    search_results = pd.DataFrame({
                        "Sentence": sentences,
                        "Similarity Score": scores
                    }).sort_values(by="Similarity Score", ascending=False)
                    
                    st.write("#### Search Results:")
                    
                    for idx, row in search_results.iterrows():
                        col_text, col_bar = st.columns([3, 2])
                        with col_text:
                            st.write(f"**{row['Sentence']}**")
                        with col_bar:
                            score = float(row["Similarity Score"])
                            # Clamp progress value to [0.0, 1.0]
                            progress_val = max(0.0, min(1.0, score))
                            st.progress(progress_val)
                            st.caption(f"Cosine Similarity: `{score:.4f}`")
                        st.divider()
                        
            # --- TAB 4: RAW VECTOR INSPECTION ---
            with tab_vectors:
                st.markdown("### Embedding Vectors Inspector")
                st.caption("Inspect the actual numeric arrays generated by the transformer model.")
                
                selected_idx = st.selectbox(
                    "Select a sentence to view its vector:",
                    options=range(len(sentences)),
                    format_func=lambda i: f"[{i}] {sentences[i][:40]}..." if len(sentences[i]) > 40 else f"[{i}] {sentences[i]}"
                )
                
                chosen_sentence = sentences[selected_idx]
                chosen_vector = embeddings[selected_idx]
                
                st.markdown(f"**Selected Sentence:** *\"{chosen_sentence}\"*")
                
                col_stat1, col_stat2, col_stat3, col_stat4 = st.columns(4)
                col_stat1.metric("Dimensions (Length)", len(chosen_vector))
                col_stat2.metric("Mean Value", f"{chosen_vector.mean():.4f}")
                col_stat3.metric("Min Value", f"{chosen_vector.min():.4f}")
                col_stat4.metric("Max Value", f"{chosen_vector.max():.4f}")
                
                st.markdown("#### Sample Vector Preview (First 40 dimensions):")
                # Format printout
                vector_preview = ", ".join([f"{v:.5f}" for v in chosen_vector[:40]]) + ", ..."
                st.code(f"[\n  {vector_preview}\n]", language="python")
                
                st.markdown("#### Stats Breakdown:")
                vector_stats = pd.Series(chosen_vector).describe()
                st.dataframe(pd.DataFrame(vector_stats).T, hide_index=True)
                
        except Exception as e:
            st.error(f"Failed to generate embeddings: {e}")
            st.exception(e)
