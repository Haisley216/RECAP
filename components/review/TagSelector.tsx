'use client';

import { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { DEFAULT_TAGS } from '@/lib/types';
import { getCustomTags, saveCustomTag } from '@/lib/storage';

interface TagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export default function TagSelector({ selected, onChange }: TagSelectorProps) {
  const [customTags, setCustomTags] = useState<string[]>(getCustomTags);
  const [adding, setAdding] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const wasLongPress = useRef(false);

  const allTags = [...DEFAULT_TAGS, ...customTags];

  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  const addCustomTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed || allTags.includes(trimmed)) return;
    saveCustomTag(trimmed);
    setCustomTags((prev) => [...prev, trimmed]);
    onChange([...selected, trimmed]);
    setNewTag('');
    setAdding(false);
  };

  const startLongPress = () => {
    longPressTimer.current = setTimeout(() => {
      wasLongPress.current = true;
      setDeleteMode(true);
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleTagClick = (tag: string) => {
    if (wasLongPress.current) {
      wasLongPress.current = false;
      return;
    }
    if (deleteMode) {
      setDeleteMode(false);
      return;
    }
    toggle(tag);
  };

  const removeTag = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    onChange(selected.filter((t) => t !== tag));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onPointerDown={startLongPress}
            onPointerUp={cancelLongPress}
            onPointerCancel={cancelLongPress}
            onPointerLeave={cancelLongPress}
            onClick={() => handleTagClick(tag)}
            className={`relative px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 active:scale-95 ${
              selected.includes(tag)
                ? 'bg-[#D9F8F6] text-[#00A59A] border-[#D9F8F6]'
                : 'bg-white text-[#999999] border-gray-200'
            }`}
          >
            {tag}
            {deleteMode && selected.includes(tag) && (
              <span
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => removeTag(e, tag)}
                className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-[#555] text-white text-[10px] flex items-center justify-center leading-none"
              >
                ×
              </span>
            )}
          </button>
        ))}
        {adding ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addCustomTag();
                if (e.key === 'Escape') { setAdding(false); setNewTag(''); }
              }}
              placeholder="태그 이름"
              className="px-3 py-1.5 text-xs border border-primary-300 rounded-full outline-none w-24 bg-white"
              maxLength={10}
            />
            <button
              onClick={addCustomTag}
              className="w-6 h-6 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center active:bg-primary-200 transition-colors"
            >
              <Plus size={13} />
            </button>
            <button
              onClick={() => { setAdding(false); setNewTag(''); }}
              className="w-6 h-6 rounded-full bg-gray-100 text-[#999999] flex items-center justify-center active:bg-gray-200 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-gray-300 text-[#999999] flex items-center gap-1 active:bg-gray-50"
          >
            <Plus size={12} /> 직접 추가
          </button>
        )}
      </div>
    </div>
  );
}
