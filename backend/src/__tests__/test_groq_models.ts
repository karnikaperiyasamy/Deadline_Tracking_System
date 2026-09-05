import axios from 'axios';
import { config } from '../config';

async function listGroqModels() {
  try {
    const res = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${config.ai.groqApiKey}`,
      },
    });
    console.log('ACTIVE GROQ MODELS:');
    const modelIds = res.data.data.map((m: any) => m.id);
    console.log(modelIds);
    
    // Test the first active model
    if (modelIds.length > 0) {
      const activeModel = modelIds[0];
      console.log(`\nTesting active model: ${activeModel}...`);
      const testRes = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: activeModel,
          messages: [{ role: 'user', content: 'Say hello in 3 words' }],
        },
        {
          headers: {
            Authorization: `Bearer ${config.ai.groqApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`SUCCESSFUL GENERATION RESPONSE:`, testRes.data?.choices?.[0]?.message?.content);
    }
  } catch (err: any) {
    console.error('FAILED TO LIST GROQ MODELS:', err.response?.data || err.message);
  }
}

listGroqModels();
