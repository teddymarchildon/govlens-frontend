import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getStoragePublicUrl } from '@/services/api';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { question, documentPath, documentBucket, context } = await request.json();

    // For document-based chat
      const documentUrl = await getStoragePublicUrl(documentBucket, documentPath);
      const documentResponse = await fetch(documentUrl);
      const documentContent = await documentResponse.text();

      const systemMessage: ChatCompletionMessageParam = {
        role: 'system',
        content: `You are a helpful assistant analyzing a legislative bill document. Here is the document content in an HTML format:\n\n${documentContent}`
      };

      const userMessage: ChatCompletionMessageParam = {
        role: 'user',
        content: question
      };

      const stream = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [systemMessage, userMessage],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      });

      const encoder = new TextEncoder();
      const customStream = new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(customStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
