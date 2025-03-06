const axios = require('axios');
const { finalConfigs } = require('../Configurations');



async function getLLMChatCompletionResponse({
    messages,   
    model = "gpt-4o-mini",   
    provider = "openai",
    temperature,
    top_p,
    top_k ,
    frequency_penalty,
    presence_penalty,
    repetition_penalty,
    n,
    beam_size ,
    max_tokens = 8000,
    stream ,
    tools,
    tool_choice,
    tools_model,
    integrity ,
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
}) {
    try {
        const { PIE_API_KEY } = finalConfigs();

        const data = {};

        if(messages) data.messages = messages;
        if(model) data.model = model;
        if(provider) data.provider = provider;
        if(temperature) data.temperature = temperature;
        if(top_p) data.top_p = top_p;
        if(top_k) data.top_k = top_k;
        if(frequency_penalty) data.frequency_penalty = frequency_penalty;
        if(presence_penalty) data.presence_penalty = presence_penalty;
        if(repetition_penalty) data.repetition_penalty = repetition_penalty;
        if(n) data.n = n;
        if(beam_size) data.beam_size = beam_size;
        if(max_tokens) data.max_tokens = max_tokens;
        if(stream) data.stream = stream;
        if(tools) data.tools = tools;
        if(tool_choice) data.tool_choice = tool_choice;
        if(tools_model) data.tools_model = tools_model;
        if(integrity) data.integrity = integrity;
        if(integrity_model) data.integrity_model = integrity_model;     
        if(force_provider) data.force_provider = force_provider;
        if(memory) data.memory = memory;    
        if(mem_session) data.mem_session = mem_session;
        if(mem_expire) data.mem_expire = mem_expire;
        if(mem_clear) data.mem_clear = mem_clear;
        if(mem_msgs) data.mem_msgs = mem_msgs;
        if(mem_length) data.mem_length = mem_length;
        if(rag_tune) data.rag_tune = rag_tune;
        if(routing) data.routing = routing;


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