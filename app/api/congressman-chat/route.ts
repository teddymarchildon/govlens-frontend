import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function generateCongressmanContext(congressman: any): string {
  return `You are an expert on Congress and legislative affairs. The user is asking about ${congressman.full_name}. Use the following information to answer their questions:

- Full Name: ${congressman.full_name}
- Party: ${congressman.party}
- State: ${congressman.state}
- District: ${congressman.district || 'N/A'}
- Chamber: ${congressman.chamber}
- Terms Served: ${congressman.terms?.length || 0}
- Current Status: ${congressman.current_status || 'Unknown'}

When answering questions, focus on their legislative work, achievements, and impact. Be specific and data-driven when possible.`;
}

export async function POST(request: Request) {
  try {
    const { question, congressman } = await request.json();

    if (!question || !congressman) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const context = generateCongressmanContext(congressman);

    const systemMessage: ChatCompletionMessageParam = {
      role: 'system',
      content: context
    };

    const userMessage: ChatCompletionMessageParam = {
      role: 'user',
      content: question
    };

    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
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
    console.error('Error in congressman chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
