import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai'; // Updated import
import { HumanMessage, SystemMessage } from '@langchain/core/messages'; // Updated import
import { EvaluationRequest, EvaluationResponse } from '../proto/classification';

@Injectable()
export class ClassificationService {
  private chatModel: ChatOpenAI;

  constructor() {
    // Initialize LangChain's ChatOpenAI
    this.chatModel = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your .env file
      modelName: 'gpt-4o-mini', // Use a valid model name
    });
  }

  async evaluateClassification(request: EvaluationRequest): Promise<EvaluationResponse> {
    const prompt = `
    You are an assistant that evaluates how well an AI classification agent assigns customer messages to predefined categories by comparing the agent's classification to the expert (human-labeled) classification.
  
    You're given a history of messages exchanged between a customer and an AI agent, along with a predefined set of categories.
  
    Compare the classification based on the given evaluation criteria between triple dashes.
  
    You should output the score for the agents classification, describing how well it matches the human-labeled classification, and provide reasoning for the given score.
  
    Stick to the specified output format.
  
    Output a python dictionary with the following structure:
    {
        "message": <The customers last message being classified>,
        "agent_classification": <The classification assigned by the AI agent>,
        "human_classification": <The correct human-labeled classification>,
        "score": <A percentage (0-100) describing the accuracy of the classification>,
        "reason": <Explanation for the assigned score based on the evaluation criteria>
    }
  
    You are comparing based on this given data:
    [BEGIN DATA]
    ---
    [MESSAGE HISTORY]: ${request.messageHistory}
    ---
    [AGENT CLASSIFICATION]: ${request.agentOutput}
    ---
    [HUMAN CLASSIFICATION]: ${request.humanLabeledOutput}
    ---
    [CATEGORIES]: ${request.categories}
    ---
    [END DATA]
    `;
  
    try {
      // Use LangChain to call the OpenAI API
      const response = await this.chatModel.invoke([
        new SystemMessage('You are an assistant that evaluates how well an AI classification agent assigns customer messages to predefined categories.'), // System role for instructions
        new HumanMessage(prompt), // User role for the actual prompt
      ]);
  
      let content: string = '';  
    if (Array.isArray(response.content)) {  
      // Look for the first complex message that contains text  
      for (const message of response.content) {  
        if ('text' in message) { // Check if the message has a 'text' property  
          content = message.text;  
          break; // Stop after finding the first valid message  
        }  
      }  
      if (content === '') {  
        throw new Error('No valid text content found in the response');  
      }  
    } else if (typeof response.content === 'string') {  
      content = response.content; // If it's a string, use it directly  
    } else {  
      throw new Error('Unexpected content format returned from OpenAI API');  
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
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error('Failed to evaluate classification');
    }
  }
}