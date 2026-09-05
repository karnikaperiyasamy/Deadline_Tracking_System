import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { logger } from '../utils/logger';
import { calculateUrgency, calculateRiskLevel } from '../utils/urgency';

export class AIService {
  private static groqModels = [
    config.ai.model || 'openai/gpt-oss-120b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
    'qwen/qwen3.6-27b',
    'groq/compound',
  ];

  private static geminiModels = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-flash',
    'gemini-pro',
  ];

  private static async generateContentWithFallback(prompt: string): Promise<string> {
    const groqKey = config.ai.groqApiKey;
    let lastError: any = null;

    // 1. Primary: Ultra-fast Groq API Chat Completions with Active Account Models
    if (groqKey) {
      for (const modelName of Array.from(new Set(this.groqModels))) {
        try {
          logger.info(`Attempting Groq AI generation with active model: ${modelName}`);
          const groqRes = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              model: modelName,
              messages: [
                {
                  role: 'system',
                  content: 'You are LifeOS AI — an elite deadline management and personal productivity architect. Answer concisely, precisely, and practically.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.6,
            },
            {
              headers: {
                Authorization: `Bearer ${groqKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 15000,
            }
          );

          const text = groqRes.data?.choices?.[0]?.message?.content;
          if (text && text.trim().length > 0) {
            logger.info(`✅ Groq AI response generated successfully using active model ${modelName}`);
            return text;
          }
        } catch (err: any) {
          logger.warn(`Groq Model ${modelName} failed: ${err.response?.data?.error?.message || err.message}`);
          lastError = err;
        }
      }
    }

    // 2. Secondary Fallback: Google Gemini SDK & REST
    const geminiKey = config.ai.apiKey;
    if (geminiKey) {
      const genAI = new GoogleGenerativeAI(geminiKey);
      for (const modelName of this.geminiModels) {
        try {
          logger.info(`Gemini SDK Attempting AI generation with model: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          if (text && text.trim().length > 0) {
            return text;
          }
        } catch (err: any) {
          logger.warn(`Gemini SDK Model ${modelName} failed: ${err.message}`);
          lastError = err;
        }
      }
    }

    throw new Error(
      `AI Service Error: Could not generate response. Details: ${lastError?.response?.data?.error?.message || lastError?.message || 'Check API keys.'}`
    );
  }

  private static async getSystemContext(userId: string) {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();
    const formattedTasks = tasks.map((t: any) => {
      const urgency = calculateUrgency(t.dueDate, t.status);
      const risk = calculateRiskLevel(t.dueDate, t.estimatedHours, t.priority, t.status);
      return `- Title: "${t.title}" | Category: ${t.category} | Priority: ${t.priority} | Status: ${t.status} | DueDate: ${t.dueDate.toISOString()} (${urgency}) | Risk: ${risk} | EstHours: ${t.estimatedHours}`;
    }).join('\n');

    return `You are LifeOS AI — an elite deadline management and personal productivity architect.
Current Server Timestamp: ${now.toISOString()}
User's Real Database Tasks Count: ${tasks.length}

Tasks currently in user database:
${formattedTasks.length > 0 ? formattedTasks : 'No tasks currently scheduled.'}

Instructions:
1. Provide actionable, concise, and helpful advice based ONLY on the actual database tasks listed above when answering task queries.
2. Be encouraging, precise, and practical.`;
  }

  static async chat(userId: string, userMessage: string, conversationId?: string) {
    const systemContext = await this.getSystemContext(userId);

    let convId = conversationId;
    if (!convId) {
      const conv = await prisma.aIConversation.create({
        data: {
          userId,
          title: userMessage.slice(0, 40) + '...',
        },
      });
      convId = conv.id;
    }

    await prisma.aIMessage.create({
      data: {
        userId,
        conversationId: convId,
        role: 'user',
        content: userMessage,
      },
    });

    const prompt = `${systemContext}\n\nUser Question: ${userMessage}`;
    const replyText = await this.generateContentWithFallback(prompt);

    await prisma.aIMessage.create({
      data: {
        userId,
        conversationId: convId,
        role: 'assistant',
        content: replyText,
      },
    });

    return {
      conversationId: convId,
      reply: replyText,
    };
  }

  static async generateDailyPlan(userId: string) {
    const systemContext = await this.getSystemContext(userId);

    const prompt = `${systemContext}

TASK: Generate an optimal, realistic Daily Schedule for TODAY based strictly on the user's tasks.
Divide the plan into three clear blocks: Morning, Afternoon, Evening.

Return ONLY a valid JSON object matching this structure (no markdown fences, pure JSON):
{
  "summary": "Brief 1-sentence motivation",
  "morning": [
    { "taskName": "string", "estimatedHours": 1.5, "priority": "CRITICAL|HIGH|MEDIUM|LOW", "reason": "string" }
  ],
  "afternoon": [
    { "taskName": "string", "estimatedHours": 2, "priority": "CRITICAL|HIGH|MEDIUM|LOW", "reason": "string" }
  ],
  "evening": [
    { "taskName": "string", "estimatedHours": 1, "priority": "CRITICAL|HIGH|MEDIUM|LOW", "reason": "string" }
  ]
}`;

    const text = await this.generateContentWithFallback(prompt);

    try {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      logger.warn('AI Daily Plan response was not strict JSON, returning raw format:', text);
      return {
        summary: text,
        morning: [],
        afternoon: [],
        evening: [],
      };
    }
  }

  static async generateTaskBreakdown(userId: string, taskTitle: string, taskDescription?: string, estimatedHours?: number) {
    const prompt = `You are a productivity expert. Break down the following complex objective into 4 to 6 actionable subtasks with clear estimated effort and categories.

Task Title: "${taskTitle}"
Description: "${taskDescription || 'None'}"
Total Estimated Hours: ${estimatedHours || 5}

Available Categories: ASSIGNMENT, EXAM, PROJECT, HACKATHON, JOB, INTERNSHIP, SCHOLARSHIP, MEETING, EVENT, PERSONAL, OTHER
Available Priorities: LOW, MEDIUM, HIGH, CRITICAL

Return ONLY a valid JSON array of objects (no markdown codeblock wrappers, pure JSON array):
[
  {
    "title": "Subtask title",
    "description": "Subtask details",
    "category": "PROJECT",
    "priority": "HIGH",
    "estimatedHours": 1.5,
    "daysFromNow": 1
  }
]`;

    const text = await this.generateContentWithFallback(prompt);

    try {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      logger.error('Failed to parse task breakdown JSON:', text);
      throw new Error('AI was unable to format subtasks automatically. Please try again.');
    }
  }

  static async analyzeDeadlineRisk(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new Error('Task not found');

    const urgency = calculateUrgency(task.dueDate, task.status);
    const calculatedRisk = calculateRiskLevel(task.dueDate, task.estimatedHours, task.priority, task.status);

    const prompt = `Analyze this deadline risk for a student/professional:
Task Title: "${task.title}"
Category: ${task.category}
Priority: ${task.priority}
Status: ${task.status}
Due Date: ${task.dueDate.toISOString()}
Calculated Urgency: ${urgency}
Estimated Hours Required: ${task.estimatedHours}
Rule-based Calculated Risk: ${calculatedRisk}

Generate a concise 2-3 sentence risk assessment explanation and 3 bullet point recommendations to mitigate risk.

Return ONLY valid JSON:
{
  "riskLevel": "${calculatedRisk}",
  "assessment": "Detailed explanation of risk factors",
  "recommendations": ["Step 1", "Step 2", "Step 3"]
}`;

    const text = await this.generateContentWithFallback(prompt);

    try {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      return {
        riskLevel: calculatedRisk,
        assessment: `This task is at ${calculatedRisk} due to remaining time vs ${task.estimatedHours} required hours.`,
        recommendations: [
          'Break task into 30-minute study blocks',
          'Eliminate non-essential distractions',
          'Review key core requirements first',
        ],
      };
    }
  }

  static async parseNaturalLanguageTask(userId: string, promptText: string) {
    const now = new Date();

    const prompt = `Current Server Datetime: ${now.toISOString()}
Current Day of Week: ${now.toLocaleDateString('en-US', { weekday: 'long' })}

User Input: "${promptText}"

Extract the deadline task information from the user's natural language input.
Infer the exact due date timestamp relative to Current Server Datetime.
Categories MUST be one of: ASSIGNMENT, EXAM, PROJECT, HACKATHON, JOB, INTERNSHIP, SCHOLARSHIP, MEETING, EVENT, PERSONAL, OTHER
Priorities MUST be one of: LOW, MEDIUM, HIGH, CRITICAL

Return ONLY valid JSON object (no markdown formatting):
{
  "title": "Extracted task title",
  "description": "Extracted description or context if present",
  "category": "ASSIGNMENT",
  "priority": "HIGH",
  "dueDate": "ISO 8601 Datetime string e.g. 2026-08-30T18:00:00.000Z",
  "estimatedHours": 2.0
}`;

    const text = await this.generateContentWithFallback(prompt);

    try {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      logger.error('Failed to parse natural language task:', text);
      throw new Error('Could not understand task input. Please specify title and due date.');
    }
  }
}
