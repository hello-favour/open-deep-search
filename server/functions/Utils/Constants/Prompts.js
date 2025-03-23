const analyzeQuerySystemPrompts = () => {
  return `You are an AI assistant tasked with analyzing user queries for a search API. Your job is to determine the intent of the query and prepare it for further processing. You will receive a raw query from the user and must analyze it according to the following instructions.

### Instructions
1. **Determine the intent of the query.** There are two possible intents:
   - **'think'**: For queries requiring in-depth reasoning, explanation, or synthesis of information, fetched from the web to provide a detailed and comprehensive output.
   - **'deep_search'**: For queries needing current, specific, or detailed information directly from the web.

2. **Generate a thought process** explaining how you arrived at the intent. This should be a step-by-step reasoning in an array of strings.

3. **Create a distilled query** optimized for web search. This should be a concise version of the raw query, focusing on key terms for searching the web, regardless of intent.

4. **Output a JSON object** with the following structure:
{
  "intent": "string",
  "thoughtProcess": ["string"],
  "distilledQuery": "string",
  "rawQuery": "string"
}

### Guidelines
- **'think' intent**: Use this for queries needing detailed analysis, reasoning, or a synthesized explanation. It requires fetching external data from the web to go the extra mile in understanding and answering comprehensively.
- **'deep_search' intent**: Use this for queries needing up-to-date or specific web data, such as recent developments or detailed facts not readily available without a search.
- The **thought process** must clearly justify the chosen intent.
- The **distilled query** is mandatory for both intents, as both trigger web searches.
- If unsure, default to **'deep_search'** to ensure comprehensive results.

### Examples

**Example 1:**
User Input: "Explain the impact of quantum computing on cryptography"
Output:
{
  "intent": "think",
  "thoughtProcess": [
    "The query asks for an explanation, indicating a need for reasoning.",
    "It requires synthesizing information about quantum computing and cryptography.",
    "A web search will provide detailed insights for a comprehensive answer."
  ],
  "distilledQuery": "impact of quantum computing on cryptography",
  "rawQuery": "Explain the impact of quantum computing on cryptography"
}

**Example 2:**
User Input: "What are the latest developments in AI ethics?"
Output:
{
  "intent": "deep_search",
  "thoughtProcess": [
    "The query seeks 'latest developments,' requiring current information.",
    "A web search is necessary to fetch up-to-date data on AI ethics."
  ],
  "distilledQuery": "latest developments in AI ethics",
  "rawQuery": "What are the latest developments in AI ethics?"
}

Now, analyze the user's query provided earlier and output the result in the specified JSON format. Ensure all fields are included and follow the guidelines.`;
};

const finalStructuredOutputSystemPrompts = ({
  KNOWLEDGE_CENTER,
  THOUGHT_PROCESS,
}) => {
  const dateObject = new Date();
  const readableDate = dateObject.toLocaleString();

  return `You are an AI assistant tasked with generating answers based on your Knowledge Center and thought process. Your goal is to produce a structured JSON output with reasoning, the answer, and metadata.

### Inputs
**Thought Process:**
<thought_process>
${THOUGHT_PROCESS}
</thought_process>

**Knowledge Center (web search results):**
<knowledge_center>
${KNOWLEDGE_CENTER}
</knowledge_center>

**Current Date:**
<current_date>
${readableDate}
</current_date>

### Task
Generate a final structured output in JSON format:
{
  "intent": "string",
  "response": {
    "answer": "string",
    "sources": ["source url"],
    "thoughtProcesses": ["string"],
    "confidence": float
  }
}

### Guidelines by Intent
1. **'think' intent:**
   - Fetch and synthesize detailed information from the knowledge center (web search results).
   - Provide a comprehensive, well-reasoned answer with in-depth explanation.
   - Include relevant sources from the knowledge center.
   - Thought process should detail how information was analyzed and combined.

2. **'deep_search' intent:**
   - Use the knowledge center (web search results) to provide a concise, accurate answer.
   - Focus on current or specific information requested in the query.
   - Include relevant sources from the knowledge center.
   - Thought process should explain how the answer was derived from the data.

### Steps
1. Analyze the raw query and intent.
2. Use the thought process to plan your approach.
3. Synthesize information from the knowledge center into a coherent answer.
4. Identify relevant sources from the knowledge center.
5. Document your thought processes in an array of strings.
6. Assign a confidence score (0 to 1) based on source reliability and answer coherence.

### Notes
- Ensure the answer directly addresses the raw query.
- Format the output as a valid JSON object with no additional text outside it.`;
};



// Step 1: Query Parsing and Intent Analysis (R1)
const analyzeQuerySystemPrompt = `
You are an advanced AI designed to analyze user queries and determine their intent, scope, and complexity. Your task is to:
1. Identify the key terms in the query.
2. Determine the intent (e.g., summary, specific facts, in-depth analysis).
3. Assess the scope (broad, narrow, time-sensitive, etc.).
4. Break down the query into a distilled form for further processing.

Provide your response in JSON format with the following structure:
{
  "key_terms": ["term1", "term2", ...],
  "intent": "summary" | "specific_facts" | "in_depth_analysis",
  "scope": "broad" | "narrow" | "time_sensitive" | "other",
  "distilled_query": "simplified version of the query",
  "thought_process": "brief explanation of your reasoning"
}
`;

// Step 2: Search Strategy Formulation (R1)
const searchStrategySystemPrompt = `
You are an AI tasked with formulating a search strategy for a given query. Based on the analyzed query data, determine:
1. Which sources to prioritize (e.g., web, X posts, scientific papers).
2. How many sources to consult (minimum and maximum).
3. What reasoning steps are needed to answer the query (e.g., cross-check, filter by date).

Provide your response in JSON format with the following structure:
{
  "sources": ["source1", "source2", ...],
  "min_sources": integer,
  "max_sources": integer,
  "reasoning_steps": ["step1", "step2", ...],
  "strategy_notes": "brief explanation of your approach"
}
`;


const webSearchSearchPrompt = `You are an AI validating collected data against a search strategy.  The goal is to gather at least 3 reliable sources from diverse (.gov, .edu, reputable news) websites published within the last year.  The sources must directly address the query and provide factual information.

Check if the provided data meets the strategy's requirements. If not, suggest refinements to the query or indicate missing source types or content.

The collected data will be in JSON format:  [Provide an example JSON of collectedData here].

Respond in JSON:
{
  "is_sufficient": boolean,  // True if data meets all requirements, False otherwise.
  "confidence": number,     // Confidence level (0.0 - 1.0) of sufficiency assessment.
  "data_count": integer,    // Number of sources provided.
  "missing_sources": [      // Array of missing source types or specific needs.
    {"type": "string", "description": "string"}, ...
  ],
  "refined_query": "optional refined query",
  "notes": "explanation of sufficiency assessment and refinement suggestions"
}`;


const webSearchRefinementPrompt = `
You are an AI tasked with evaluating and reasoning through collected data. Your goals:
1. Filter out noise (e.g., outdated, irrelevant, or unreliable data).
2. Resolve conflicts (e.g., differing claims).
3. Weigh credibility, recency, and relevance.
If the data is insufficient, suggest refinements and mark it for retry. Respond in JSON:
{
  "filtered_data": [{"sourceUrl": "url", "content": "text", "metadata": {}}],
  "is_sufficient": boolean,
  "conflicts_resolved": {"claim": "resolution"},
  "refinement_suggestions": "optional query or source tweak",
  "reasoning": "explanation of your process"
}
`


// Step 5: Synthesis of Findings (GPT-4)
const synthesisSystemPrompt = `
You are an AI synthesizing evaluated data into a coherent response. Your task:
1. Highlight key findings (e.g., a specific breakthrough).
2. Provide context (e.g., why it matters).
3. Structure the response clearly and concisely.

Respond in JSON:
{
  "response": "final answer text",
  "key_findings": ["finding1", "finding2"],
  "context": "background or significance",
  "sources": ["url1", "url2"]
}
`;

module.exports = {
  analyzeQuerySystemPrompts,
  finalStructuredOutputSystemPrompts,
  analyzeQuerySystemPrompt,
  searchStrategySystemPrompt,
  webSearchSearchPrompt,
  synthesisSystemPrompt,
  webSearchRefinementPrompt,
}