import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { fetchHtmlContent, processDocumentContent, truncateContent } from '@/utils/documentUtils';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages, documentContent, documentType, documentTitle, htmlFilePath, pdfFilePath, storageBucket } = await request.json();

    // Validate required fields
    if (!messages || !messages.length) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Create a system message with context about the document
    const systemMessage = {
      role: 'system',
      content: `You are an AI assistant helping with information about this ${documentType}: "${documentTitle}". Answer questions based on the document content.`
    };

    // Try to get document content from the provided HTML path if not directly provided
    let content = documentContent;

    console.log('Document Content:', documentContent);
    console.log('HTML File Path:', htmlFilePath);
    console.log('Storage Bucket:', storageBucket);
    
    // Try to fetch HTML content if available
    if (!content && htmlFilePath && storageBucket) {
      console.log('Fetching HTML content...');
      content = await fetchHtmlContent(storageBucket, htmlFilePath);
    }
    
    console.log('Fetched Content Length:', content ? content.length : 0);
    // Process and truncate the content if available
    if (content) {
      content = processDocumentContent(content);
      content = truncateContent(content, 50000); // Limit to ~50K chars to stay within token limits
      systemMessage.content += `\n\nHere is the content of the document:\n\n${content}`;
    } else {
      systemMessage.content += `\n\nNo document content is available. Please answer based on general knowledge.`;
    }

    // Prepare messages for OpenAI API
    const apiMessages = [systemMessage, ...messages];

    console.log('API Messages:', apiMessages);
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract the response
    const responseMessage = completion.choices[0].message.content;

    return NextResponse.json({ message: responseMessage });
  } catch (error) {
    console.error('Error processing AI chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
