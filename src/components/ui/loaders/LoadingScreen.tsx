'use client';

export default function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900"
      role="status"
      aria-label="Loading screen"
    >
      <div
        className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"
        aria-label="Loading spinner"
      />
    </div>
  );
}
