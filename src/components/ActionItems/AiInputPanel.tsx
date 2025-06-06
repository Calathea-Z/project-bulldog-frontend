'use client';

interface AiInputPanelProps {
  aiInput: string;
  setAiInput: (val: string) => void;
  handleAiCreate: () => void;
  isLoading: boolean;
}

export default function AiInputPanel({
  aiInput,
  setAiInput,
  handleAiCreate,
  isLoading,
}: AiInputPanelProps) {
  return (
    <div className="sticky top-0 z-20 bg-background p-4 border-b border-accent mb-4">
      <label htmlFor="aiInput" className="block text-sm font-medium text-gray-700 mb-1">
        AI‐Assisted Task Creation (paste meeting notes, transcript, etc.)
      </label>
      <textarea
        id="aiInput"
        value={aiInput}
        onChange={(e) => setAiInput(e.target.value)}
        placeholder="“Generate tasks from my 10-minute Zoom call…”"
        className="w-full rounded border border-accent bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        rows={3}
        disabled={isLoading}
      />
      <button
        onClick={handleAiCreate}
        className="mt-2 rounded bg-blue-600 px-4 py-2 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-600"
        disabled={isLoading}
      >
        {isLoading ? 'Generating…' : 'Add AI Tasks'}
      </button>
    </div>
  );
}
