import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getStoragePublicUrl } from '@/services/api';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { question, documentPath, documentBucket } = await request.json();

    console.log('question', question);
    console.log('documentPath', documentPath);
    console.log('documentBucket', documentBucket);
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

    console.log('documentContent', documentContent);
    // Create the system message with the document content
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant analyzing a legislative bill document. Here is the document content in an HTML format:\n\n${documentContent}`
    };

    // Create the user message with the question
    const userMessage = {
      role: 'user',
      content: question
    };

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [systemMessage, userMessage],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
