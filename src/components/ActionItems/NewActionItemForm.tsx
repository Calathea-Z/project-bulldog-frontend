'use client';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { RefObject } from 'react';

interface NewActionItemFormProps {
  inputRef: RefObject<HTMLInputElement>;
  newText: string;
  setNewText: (text: string) => void;
  newDueAt: Date | null;
  setNewDueAt: (date: Date | null) => void;
  handleAdd: () => void;
}

export default function NewActionItemForm({
  inputRef,
  newText,
  setNewText,
  newDueAt,
  setNewDueAt,
  handleAdd,
}: NewActionItemFormProps) {
  return (
    <div
      className="sticky top-[88px] z-10 bg-background p-4 border-b border-accent"
      role="form"
      aria-label="Add new action item"
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          ref={inputRef}
          id="newActionItemInput"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="New action item..."
          className="flex-1 rounded border border-accent bg-surface text-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="New action item text"
        />
        <DatePicker
          selected={newDueAt}
          onChange={(date) => setNewDueAt(date)}
          placeholderText="Due date (optional)"
          showTimeSelect
          dateFormat="MMM d, yyyy h:mm aa"
          className="rounded border border-accent bg-surface text-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          minDate={new Date()}
          aria-label="Due date"
        />
        <button
          onClick={handleAdd}
          className="rounded bg-primary px-4 py-2 text-background hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Add new action item"
        >
          Add
        </button>
      </div>
    </div>
  );
}
