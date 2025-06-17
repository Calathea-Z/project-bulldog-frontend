import { ActionItem } from '@/types';
import { UseMutationResult } from '@tanstack/react-query';

// Modal Types
export interface BaseModalProps {
  open: boolean;
  onClose: () => void;
}

// Button Types
export interface LogoutButtonProps {
  className?: string;
  label?: string;
}

// Animation Types
export interface TypewriterTextProps {
  text: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

// Progress Types
export interface PullProgressBarProps {
  percent: number;
}

export interface PullIndicatorProps {
  isRefreshing: boolean;
  percent: number;
}

// FAB Types
export interface TaskCreationFabProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  onVoiceCapture: () => Promise<void>;
}

// Task List Types
export interface EnhancedTaskListProps {
  items: ActionItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: UseMutationResult<void, unknown, { id: string; payload: Partial<ActionItem> }, unknown>;
  isLoading: boolean;
}
