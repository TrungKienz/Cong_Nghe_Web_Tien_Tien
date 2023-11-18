'use client';

import clsx from "clsx";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { FullMessageType } from "@/app/types";
import { IoTrashOutline } from 'react-icons/io5'

import Avatar from "@/app/components/Avatar";
import DeleteMessage from "./DeleteMessageModal";
import { useState } from "react";

interface MessageBoxProps {
  data: FullMessageType;
  isLast?: boolean;
}

const MessageBox: React.FC<MessageBoxProps> = ({ 
  data, 
  isLast
}) => {
  // State for DeleteMessage modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const session = useSession();

  const isOwn = session.data?.user?.email === data?.sender?.email
  const seenList = (data.seen || [])
    .filter((user) => user.email !== data?.sender?.email)
    .map((user) => user.name)
    .join(', ');

  const container = clsx('flex gap-3 p-4', isOwn && 'justify-end');

  const avatar = clsx(isOwn && 'order-2');
  const body = clsx('flex flex-col gap-2', isOwn && 'items-end');

  const message = clsx(
    'text-sm w-fit overflow-hidden', 
    isOwn ? 'bg-pink-500 text-white' : 'bg-gray-100', 
    'rounded-full py-2 px-3',
  );
  

    // Function to close the DeleteMessage modal
    const closeDeleteModal = () => {
      setIsDeleteModalOpen(false);
    };
  return ( 
    <>
      <DeleteMessage
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        messageId={data.id}
        conversationId={data.conversationId}
      />
      <div className={container}>
        <div className={avatar}>
          <Avatar user={data.sender} />
        </div>
        <div className={body}>
          <div className="flex items-center gap-1">
            <div className="text-sm text-pink-500">
              {data.sender.name}
            </div>
            <div className="text-xs text-pink-400">
              {format(new Date(data.createdAt), 'p')}
            </div>
            {isOwn && <div 
            className="flex bg-white text-pink-500 cursor-pointer hover:bg-gray-100" 
            style={{padding: "5px", borderRadius: "5px"}}
            onClick={() => setIsDeleteModalOpen(true)}>
              <IoTrashOutline/>
            </div>}
            
          </div>
          <div className={message}>
            <div>{data.body === "Tin nhắn đã bị thu hồi" ? (<div style={{fontStyle: "italic"}}>Tin nhắn đã bị thu hồi</div>): data.body}</div>
          </div>
          
          {isLast && isOwn && seenList.length > 0 && (
            <div 
              className="
              text-xs 
              font-light 
              text-pink-500
              "
            >
              Đã xem
            </div>
          )}
        </div>
      </div> 
    </>
   );
}
 
export default MessageBox;
