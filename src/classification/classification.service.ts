import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { EvaluationRequest, EvaluationResponse } from '../proto/classification';

@Injectable()
export class ClassificationService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Ensure you have set this environment variable
    });
  }

  async evaluateClassification(request: EvaluationRequest): Promise<EvaluationResponse> {
    const prompt = `
    You are an assistant that evaluates how well an AI classification agent assigns customer messages to predefined categories by comparing the agent's classification to the expert (human-labeled) classification.

    You're given a history of messages exchanged between a customer and an AI agent, along with a predefined set of categories.

    Compare the classification based on the given evaluation criteria between triple dashes.

    You should output the score for the agent’s classification, describing how well it matches the human-labeled classification, and provide reasoning for the given score.

    Stick to the specified output format.

    Output a python dictionary with the following structure:
    {
        "message": <The customer’s last message being classified>,
        "agent_classification": <The classification assigned by the AI agent>,
        "human_classification": <The correct human-labeled classification>,
        "score": <A percentage (0-100) describing the accuracy of the classification>,
        "reason": <Explanation for the assigned score based on the evaluation criteria>
    }

    You are comparing based on this given data:
    [BEGIN DATA]
    ************
    [MESSAGE HISTORY]: ${request.messageHistory}
    ************
    [AGENT CLASSIFICATION]: ${request.agentOutput}
    ************
    [HUMAN CLASSIFICATION]: ${request.humanLabeledOutput}
    ************
    [CATEGORIES]: ${request.categories}
    ************
    [END DATA]
    `;

    const response = await this.openai.chat.completions.create({
      model: 'GPT4o-mini', // or any other model you prefer
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.choices[0].message.content;
    if (!content) {
        throw new Error('No content returned from OpenAI API');
    }

    // Parse the content as JSON
    const result = JSON.parse(content);

    return {
        message: result.message,
        agentClassification: result.agent_classification,
        humanClassification: result.human_classification,
        score: result.score,
        reason: result.reason,
    };
    }
}