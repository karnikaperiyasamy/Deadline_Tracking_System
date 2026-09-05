import axios from 'axios';
import { config } from '../config';

async function testGroq() {
  console.log('Testing Groq Key:', config.ai.groqApiKey);
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'llama3-70b-8192', 'llama3-8b-8192'];

  for (const model of models) {
    try {
      console.log(`Trying Groq model: ${model}...`);
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: 'Say hello in 3 words' }],
        },
        {
          headers: {
            Authorization: `Bearer ${config.ai.groqApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      console.log(`SUCCESS with model ${model}:`, res.data?.choices?.[0]?.message?.content);
      return;
    } catch (err: any) {
      console.error(`FAILED with model ${model}:`, err.response?.data || err.message);
    }
  }
}

testGroq();
