import axios from 'axios';
import { config } from '../config';

async function testGroqActiveModels() {
  const models = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b', 'qwen/qwen3.6-27b', 'groq/compound'];

  for (const model of models) {
    try {
      console.log(`Testing active Groq model: ${model}...`);
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: 'Respond with "SUCCESS"' }],
        },
        {
          headers: {
            Authorization: `Bearer ${config.ai.groqApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      console.log(`🎉 SUCCESS WITH MODEL ${model}:`, res.data?.choices?.[0]?.message?.content);
      return model;
    } catch (err: any) {
      console.error(`FAILED WITH ${model}:`, err.response?.data || err.message);
    }
  }
}

testGroqActiveModels();
