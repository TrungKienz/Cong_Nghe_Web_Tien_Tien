'use client';

import clsx from "clsx";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import Modal from '@/app/components/modals/Modal';

import Avatar from "@/app/components/Avatar";

interface SearchResultProps {
    isOpen?: boolean;
    onClose: () => void;
    data: any;
    
}

const SearchResultModal: React.FC<SearchResultProps> = ({ 
    data, 
    isOpen,
    onClose
  }) => {
    const session = useSession();
    
    return ( 
      <Modal isOpen={isOpen} onClose={onClose}>
        <div style={{overflowY: "auto"}}>
            {data.map((element: any) => {
            const isOwn = session.data?.user?.email === element?.sender?.email;
            const container = clsx('flex gap-3 p-4', isOwn && 'justify-end');
            const avatar = clsx(isOwn && 'order-2 text-right');
            const body = clsx('flex flex-col gap-2', isOwn && 'items-end');
            const message = clsx(
                'text-sm w-fit overflow-hidden',
                isOwn ? 'bg-pink-500 text-white' : 'bg-gray-100',
                'rounded-full py-2 px-3',
            );
    
            return (
                <div className={container}>
                    <div key={element.id} className="message-container">
                    <div className={avatar}>
                        <Avatar user={element.sender}/>
                    </div>
                    <div className={body}>
                        <div className="flex items-center gap-1">
                        <div className="text-sm text-pink-500">
                            {element.sender.name}
                        </div>
                        <div className="text-xs text-pink-400">
                            {format(new Date(element.createdAt), 'p')}
                        </div>
                        </div>
                        <div className={message}>
                        {element.body}
                        </div>
                    </div>
                    </div>
                </div>
            );
            })}
        </div>
      </Modal>
      
    );
  };
  
 
export default SearchResultModal;
