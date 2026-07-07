"""
Generate a sample PDF document for testing the RAG pipeline.
Content: Introduction to Large Language Models and AI concepts.
"""
import os

def create_sample_pdf():
    """Creates a multi-page PDF about LLMs and AI for RAG testing."""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        has_reportlab = True
    except ImportError:
        has_reportlab = False

    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "sample_docs")
    os.makedirs(output_dir, exist_ok=True)

    # Content pages about AI/LLM topics
    pages = [
        {
            "title": "Chapter 1: Introduction to Large Language Models",
            "content": """Large Language Models (LLMs) are a class of artificial intelligence models trained on vast amounts of text data to understand and generate human-like language. These models, such as GPT-4, Gemini, and Claude, use transformer architectures to process and produce text with remarkable fluency.

The key breakthrough behind LLMs is the transformer architecture, introduced in the 2017 paper 'Attention Is All You Need' by Vaswani et al. Transformers use self-attention mechanisms that allow the model to weigh the importance of different words in a sentence relative to each other, enabling it to capture long-range dependencies in text.

Modern LLMs are typically trained in two phases. First, they undergo pre-training on massive corpora of text from the internet, books, and other sources. During this phase, the model learns general language patterns, facts, and reasoning abilities. Second, they go through fine-tuning or alignment using techniques like Reinforcement Learning from Human Feedback (RLHF) to make them more helpful, harmless, and honest.

The scale of these models is staggering. GPT-4 is estimated to have over 1.7 trillion parameters, while even smaller models like Llama 3 have 70 billion parameters. This massive scale, combined with diverse training data, enables LLMs to perform a wide variety of tasks including translation, summarization, code generation, and question answering."""
        },
        {
            "title": "Chapter 2: Retrieval-Augmented Generation (RAG)",
            "content": """Retrieval-Augmented Generation (RAG) is a technique that enhances LLM responses by first retrieving relevant information from a knowledge base before generating an answer. This approach was introduced by Lewis et al. in 2020 and has become one of the most important patterns in production AI systems.

The RAG pipeline consists of three main stages. The first stage is Ingestion, where documents are loaded, split into chunks, embedded into vector representations, and stored in a vector database like ChromaDB, Pinecone, or Weaviate. The second stage is Retrieval, where a user's query is embedded and used to search the vector database for semantically similar document chunks. The third stage is Generation, where the retrieved chunks are injected into a prompt template and sent to an LLM for answer generation.

RAG solves several critical problems with standalone LLMs. It eliminates hallucination by grounding responses in actual documents. It provides access to private or proprietary data that wasn't part of the model's training set. It enables real-time information access since the knowledge base can be updated without retraining the model. And it reduces costs compared to fine-tuning models on specific datasets.

The quality of a RAG system depends heavily on the chunking strategy, embedding model quality, retrieval algorithm, and prompt engineering. Poor chunking can split important context across chunks, while weak embeddings may fail to capture semantic relationships between queries and documents."""
        },
        {
            "title": "Chapter 3: Vector Databases and Embeddings",
            "content": """Vector databases are specialized storage systems designed to efficiently store, index, and query high-dimensional vector embeddings. Unlike traditional databases that match exact values, vector databases find items that are semantically similar to a query using mathematical distance metrics.

Popular vector databases include ChromaDB, which is an open-source embedding database designed for simplicity; Pinecone, a fully managed cloud vector database; Weaviate, which combines vector search with structured filtering; and FAISS (Facebook AI Similarity Search), a library for efficient similarity search developed by Meta.

Embeddings are dense numerical representations of text, images, or other data types. Text embedding models like OpenAI's text-embedding-3-small, Sentence-BERT, and BGE convert text strings into fixed-length vectors (typically 384 to 1536 dimensions). These vectors capture semantic meaning, so similar texts produce vectors that are close together in the vector space.

The similarity between vectors is typically measured using cosine similarity, which calculates the cosine of the angle between two vectors. A cosine similarity of 1.0 means the vectors point in the same direction (highly similar), while 0.0 means they are orthogonal (unrelated). Other distance metrics include Euclidean distance and dot product similarity.

When building a RAG system, the choice of embedding model significantly impacts retrieval quality. Models like all-MiniLM-L6-v2 offer a good balance of speed and quality for English text, while larger models like BGE-large-en-v1.5 provide higher accuracy at the cost of slower processing."""
        },
        {
            "title": "Chapter 4: Chunking Strategies",
            "content": """Document chunking is the process of breaking large documents into smaller, manageable pieces for embedding and retrieval. The chunking strategy significantly impacts RAG performance because it determines how information is organized and retrieved.

Fixed-size chunking is the simplest approach. Documents are split into chunks of a predetermined number of characters or tokens (e.g., 512 tokens per chunk). An overlap parameter (e.g., 50 tokens) ensures that information at chunk boundaries isn't lost. While simple to implement, fixed-size chunking can split sentences or paragraphs mid-thought.

Semantic chunking uses natural language processing to identify logical boundaries in text. It splits documents at paragraph breaks, section headers, or sentence boundaries. This preserves the semantic coherence of each chunk, ensuring that related ideas stay together. Tools like LangChain's RecursiveCharacterTextSplitter implement a hierarchical approach that tries paragraph splits first, then sentence splits, then word splits.

Hierarchical chunking creates a tree structure where large chunks contain references to smaller sub-chunks. During retrieval, the system can first match at a high level and then drill down to more specific content. This approach combines the benefits of broad context awareness with precise information retrieval.

The optimal chunk size depends on the use case. Smaller chunks (100-200 tokens) work well for precise fact retrieval. Larger chunks (500-1000 tokens) preserve more context and work better for summarization tasks. Most production systems use chunks of 256-512 tokens with 10-20% overlap as a reasonable default."""
        },
        {
            "title": "Chapter 5: Prompt Engineering for RAG",
            "content": """Prompt engineering is the practice of designing and optimizing the text instructions sent to an LLM to achieve desired outputs. In a RAG system, prompt engineering is critical because it determines how effectively the model uses the retrieved context to answer questions.

A basic RAG prompt template consists of three parts: a system instruction that defines the model's behavior, the retrieved context documents, and the user's question. The system instruction typically tells the model to only use the provided context and to acknowledge when it doesn't have enough information.

Advanced prompt techniques for RAG include Chain-of-Thought (CoT) prompting, where the model is instructed to reason step-by-step before providing an answer. This improves accuracy for complex questions that require synthesizing information from multiple chunks. Few-shot prompting provides examples of correct question-answer pairs to guide the model's response format.

Context window management is another important consideration. LLMs have a maximum context window (e.g., 128K tokens for GPT-4). The prompt must fit within this limit, including the system instruction, all retrieved chunks, the question, and space for the generated answer. If too many chunks are retrieved, they must be ranked and truncated.

The 'Lost in the Middle' phenomenon is a well-documented issue where LLMs pay more attention to information at the beginning and end of the context, potentially ignoring relevant information in the middle. To mitigate this, important chunks should be placed at the beginning of the context, or the number of retrieved chunks should be kept small (typically 3-5)."""
        },
    ]

    # Write as plain text PDF alternative if reportlab not available
    if not has_reportlab:
        # Create a simple text file as fallback, then we'll use fpdf or just txt
        txt_path = os.path.join(output_dir, "llm_foundations.txt")
        with open(txt_path, "w", encoding="utf-8") as f:
            for page in pages:
                f.write(f"\n{'='*60}\n")
                f.write(f"{page['title']}\n")
                f.write(f"{'='*60}\n\n")
                f.write(f"{page['content']}\n\n")
        print(f"Created sample TXT at: {txt_path}")
        return txt_path

    # Create PDF with reportlab
    pdf_path = os.path.join(output_dir, "llm_foundations.pdf")
    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    for page in pages:
        story.append(Paragraph(page["title"], styles["Heading1"]))
        story.append(Spacer(1, 12))
        for para in page["content"].split("\n\n"):
            if para.strip():
                story.append(Paragraph(para.strip(), styles["BodyText"]))
                story.append(Spacer(1, 8))
        story.append(Spacer(1, 24))

    doc.build(story)
    print(f"Created sample PDF at: {pdf_path}")
    return pdf_path


if __name__ == "__main__":
    create_sample_pdf()
