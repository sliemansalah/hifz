'use client';

import { useSearchShortcut } from '@/hooks/useSearchShortcut';
import SearchModal from '@/components/ui/SearchModal';

export default function SearchWrapper() {
  const { isOpen, setIsOpen } = useSearchShortcut();

  return <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
