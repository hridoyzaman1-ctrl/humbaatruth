import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const SortableItem = ({ id, children, className }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative touch-manipulation',
        isDragging && 'z-50 opacity-90 shadow-lg scale-[1.02]',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(
            'flex-shrink-0 p-1.5 rounded-md cursor-grab active:cursor-grabbing',
            'hover:bg-muted touch-manipulation',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            isDragging && 'cursor-grabbing'
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
};

interface SortableHandleProps {
  listeners?: Record<string, Function>;
  attributes?: Record<string, unknown>;
  isDragging?: boolean;
}

export const SortableHandle = ({ listeners, attributes, isDragging }: SortableHandleProps) => (
  <button
    type="button"
    className={cn(
      'flex-shrink-0 p-1.5 rounded-md cursor-grab active:cursor-grabbing',
      'hover:bg-muted touch-manipulation',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
      isDragging && 'cursor-grabbing'
    )}
    {...attributes}
    {...listeners}
  >
    <GripVertical className="h-4 w-4 text-muted-foreground" />
  </button>
);
