const axios = require('axios');
const { finalConfigs } = require('../Configurations');



async function getLLMChatCompletionResponse({
    messages,   // Required: Array of message objects
    model = "gpt-3.5-turbo",    // Default model
    provider = "openai",    // Default provider
    temperature = 1,
    top_p = 1,
    top_k = 0,
    frequency_penalty = 0,
    presence_penalty = 0,
    repetition_penalty = 1,
    n = 1,
    beam_size = 1,
    max_tokens = 300,
    stream = false,
    tools = [],
    tool_choice = "auto",
    tools_model = "claude-3-5-sonnet",
    integrity = 12,
    integrity_model = "gpt-3.5-turbo",
    force_provider = false,
    memory = false,
    mem_session = "",
    mem_expire = 60,
    mem_clear = 1,
    mem_msgs = 10,
    mem_length = 20,
    rag_tune = "",
    routing = "perf",
}) {
    try {
        const { PIE_API_KEY } = finalConfigs(); 

        const data = {
            messages,
            model,
            provider,
            temperature,
            top_p,
            top_k,
            frequency_penalty,
            presence_penalty,
            repetition_penalty,
            n,
            beam_size,
            max_tokens,
            stream,
            tools,
            tool_choice,
            tools_model,
            integrity,
            integrity_model,
            force_provider,
            memory,
            mem_session,
            mem_expire,
            mem_clear,
            mem_msgs,
            mem_length,
            rag_tune,
            routing,
        };

        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

        const config = {
            method: "post",
            url: "https://apipie.ai/v1/chat/completions",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${PIE_API_KEY}`,
            },
            data: JSON.stringify(data),
        };

        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        console.error("Error in getLLMChatCompletionResponse:", error);
        throw error;
    }
}

module.exports = {
    getLLMChatCompletionResponse,
}