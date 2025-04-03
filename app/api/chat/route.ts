import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getStoragePublicUrl } from '@/services/api';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { question, documentPath, documentBucket } = await request.json();
    if (!question || !documentPath || !documentBucket) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get the document content from Supabase storage
    const documentUrl = await getStoragePublicUrl(documentBucket, documentPath);
    const documentResponse = await fetch(documentUrl);
    const documentContent = await documentResponse.text();

    // Create the system message with the document content
    const systemMessage: ChatCompletionMessageParam = {
      role: 'system',
      content: `You are a helpful assistant analyzing a legislative bill document. Here is the document content in an HTML format:\n\n${documentContent}`
    };

    // Create the user message with the question
    const userMessage: ChatCompletionMessageParam = {
      role: 'user',
      content: question
    };

    // Create a streaming response
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [systemMessage, userMessage],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    // Create a new ReadableStream that will be our response
    const textEncoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(textEncoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
          controller.enqueue(textEncoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Return the stream response
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
