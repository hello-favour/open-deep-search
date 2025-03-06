const axios = require('axios');
const { finalConfigs } = require('../Configurations');


async function getLLMChatCompletionResponse({ messages, modal, provider, }) {
    try {

        const { PIE_API_KEY } = finalConfigs();

        let data = {};

        if (messages) data.messages = messages;
        if (modal) data.modal = modal;
        if (provider) data.provider = provider;


        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://apipie.ai/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${PIE_API_KEY}`
            },
            data: JSON.stringify(data),
        };

        const response = await axios.request(config);

        return response.data;
    } catch (error) {
        console.log(error);
    }

    return undefined;
}

module.exports = {
    getLLMChatCompletionResponse,
}