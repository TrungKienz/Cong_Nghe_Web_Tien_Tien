import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";
import { pusherServer } from '@/app/libs/pusher'


import prisma from "@/app/libs/prismadb";

export async function POST(
  request: Request,
) {
  try {
    const body = await request.json();
    const { messageId, conversationId } = await body;
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return NextResponse.json(null);
    }

    const existingMessage = await prisma.message.findUnique({
        where: {
          id: messageId
        }
    });
    
    
    if (!existingMessage) {
      return new NextResponse('Invalid message ID', { status: 400 });
    }

    const deletedMessage = await prisma.message.update({
        where: {
          id: messageId,
        },
        include: {
          seen: true,
          sender: true
        },
        data: {
            body: "Tin nhắn đã bị thu hồi",
            conversation: {
              connect: { id: conversationId }
            },
            sender: {
              connect: { id: currentUser.id }
            },
            seen: {
              connect: {
                id: currentUser.id
              }
            },
        }
      });

      await pusherServer.trigger(conversationId, 'messages:delete', deletedMessage);
    
    
    return NextResponse.json(deletedMessage)
  } catch (error) {
    return NextResponse.json(null);
  }
}