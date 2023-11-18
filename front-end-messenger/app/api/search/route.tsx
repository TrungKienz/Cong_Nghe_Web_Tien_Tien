import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

export async function POST(
  request: Request,
) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const {
      conversationId,
      searchContent, 
    } = body;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId
      },
      include: {
        users: true
      }
    });

    if (!existingConversation) {
      return new NextResponse('Invalid ID', { status: 400 });
    }
    let messages;
      // If searchQuery is provided, perform a search on messages
      messages = await prisma.message.findMany({
        where: {
          body: {
            contains: searchContent,
          },
          conversationId: {
            equals: conversationId,
          },
        },
        include: {
          sender: true,
        },
      });


    // Handle search results
    return NextResponse.json(messages);
  } catch (error) {
    return new NextResponse('Error', { status: 500 });
  }
}
