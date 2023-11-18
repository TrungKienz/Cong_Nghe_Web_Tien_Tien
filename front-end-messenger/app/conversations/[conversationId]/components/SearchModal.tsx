'use client';

import React, { useCallback, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { FiSearch } from 'react-icons/fi'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Modal from '@/app/components/modals/Modal';
import Button from '@/app/components/Button';
import useConversation from '@/app/hooks/useConversation';
import { toast } from 'react-hot-toast';
import SearchResultModal from './SearchResult';


interface SearchModalProps {
  isOpen?: boolean;
  onClose: () => void;
  // onSearch: (content: string) => void; // Updated prop for search function
}

const SearchModal: React.FC<SearchModalProps> = ({ 
  isOpen, 
  onClose,
  // onSearch, // Updated prop for search function
}) => {
  const router = useRouter();
  const { conversationId } = useConversation();
  const [isLoading, setIsLoading] = useState(false);
  const [searchContent, setSearchContent] = useState('');
  const [searchResultOpen, setSearchResultOpen] = useState(false);
  const [resultSearch, setResultSearch] = useState([]);

  const searchFunction = useCallback(() => {
    setIsLoading(true);
  
    // Assuming `searchContent` is a state variable
    axios.post('/api/search', { conversationId, searchContent })
      .then((response) => {
        // Handle the search results as needed
        const filteredResults = response.data.filter((item: any) => item.body !== "Tin nhắn đã bị thu hồi");

        setResultSearch(filteredResults);
        // Close the modal and reset loading state
        onClose();
      })
      .catch((error) => {
        console.error('Error during search:', error);
        toast.error('Something went wrong!');
      })
      .finally(() => setIsLoading(false));
  }, [onClose, setIsLoading, searchContent]);
  
  const onSearchClick = () => {
    searchFunction();
    setSearchResultOpen(true);
  }
  return (
    <>
      <SearchResultModal
        isOpen={searchResultOpen}
        onClose={() => setSearchResultOpen(false)}
        data={resultSearch}
      />
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="sm:flex sm:items-start">
          <div 
            className="
              mx-auto 
              flex 
              h-12 
              w-12 
              flex-shrink-0 
              items-center 
              justify-center 
              rounded-full 
              bg-blue-100 
              sm:mx-0 
              sm:h-10 
              sm:w-10
            "
          >
            <FiSearch 
              className="h-6 w-6 text-blue-600" 
              aria-hidden="true"
            />
          </div>
          <div 
            className="
              mt-3 
              text-center 
              sm:ml-4 
              sm:mt-0 
              sm:text-left
            "
          >
            <Dialog.Title 
              as="h3" 
              className="text-base font-semibold leading-6 text-gray-900"
            >
              Tìm kiếm
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Nhập nội dung cần tìm kiếm:
              </p>
              <input
                type="text"
                value={searchContent}
                onChange={(e) => setSearchContent(e.target.value)}
                className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 w-full"
              />
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <Button
            disabled={isLoading}
            onClick={onSearchClick}
          >
            Tìm kiếm
          </Button>
          <Button
            disabled={isLoading}
            secondary
            onClick={onClose}
          >
            Thoát
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default SearchModal;
