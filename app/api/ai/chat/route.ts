import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { fetchHtmlContent, processDocumentContent, truncateContent } from '@/utils/documentUtils';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages, documentContent, documentTitle, htmlFilePath, storageBucket } = await request.json();

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
      content: `You are an AI assistant helping with information about this US federal government document: "${documentTitle}". Answer questions based on the document content.`
    };

    // Try to get document content from the provided HTML path if not directly provided
    let content = documentContent;

    // Try to fetch HTML content if available
    if (!content && htmlFilePath && storageBucket) {
      content = await fetchHtmlContent(storageBucket, htmlFilePath);
    }

    // Process and truncate the content if available
    if (content) {
      content = processDocumentContent(content);
      content = truncateContent(content, 50000); // Limit to ~50K chars to stay within token limits
      systemMessage.content += `\n\nHere is the content of the document:\n\n${content}`;

      // Prepare messages for OpenAI API with document content
      const apiMessages = [systemMessage, ...messages];

      console.log('API Messages with document content');
      // Call OpenAI API with document content
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Extract the response
      const responseMessage = completion.choices[0].message.content;
      return NextResponse.json({ message: responseMessage });
    } else {
      // If no content is available, use web search tool
      systemMessage.content += `\n\nNo document content is available. Please use web search to find relevant information about this document.`;

      // Prepare messages for OpenAI API with web search tool
      const apiMessages = [systemMessage, ...messages];

      console.log('API Messages with web search');
      // Call OpenAI API with web search tool enabled
      const completion = await openai.responses.create({
        model: 'gpt-4o',
        input: apiMessages,
        tools: [{ type: "web_search_preview" }],
      });

      // Extract the response
      const responseMessage = completion.output_text;
      return NextResponse.json({ message: responseMessage });
    }
  } catch (error) {
    console.error('Error processing AI chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
