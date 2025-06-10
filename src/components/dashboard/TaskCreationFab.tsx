'use client';

import { Plus, FileText, Mic, Type, Sparkles } from 'lucide-react';

interface TaskCreationFabProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  onTextInput: () => void;
  onFileUpload: () => void;
  onVoiceCapture: () => void;
  onAiCreate: () => void;
}

export default function TaskCreationFab({
  expanded,
  setExpanded,
  onTextInput,
  onFileUpload,
  onVoiceCapture,
  onAiCreate,
}: TaskCreationFabProps) {
  const handleAction = (action: () => void) => {
    setExpanded(false);
    action();
  };

  const toggleExpand = () => setExpanded(!expanded);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {expanded && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-2">
          <button
            onClick={() => handleAction(onAiCreate)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg rounded-full p-3 hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Create with AI</span>
          </button>
          <button
            onClick={() => handleAction(onTextInput)}
            className="bg-white shadow-lg rounded-full p-3 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Type className="w-5 h-5" />
            <span className="text-sm font-medium">Manual Input</span>
          </button>
          <button
            onClick={() => handleAction(onFileUpload)}
            className="bg-white shadow-lg rounded-full p-3 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">Upload File</span>
          </button>
          <button
            onClick={() => handleAction(onVoiceCapture)}
            className="bg-white shadow-lg rounded-full p-3 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Mic className="w-5 h-5" />
            <span className="text-sm font-medium">Voice Capture</span>
          </button>
        </div>
      )}

      <button
        onClick={toggleExpand}
        className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
        aria-label={expanded ? 'Close task creation menu' : 'Open task creation menu'}
      >
        <Plus className={`w-6 h-6 transition-transform ${expanded ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
}
