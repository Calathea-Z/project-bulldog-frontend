interface PullProgressBarProps {
  percent: number;
}

export default function PullProgressBar({ percent }: PullProgressBarProps) {
  return (
    <div className="fixed top-0 left-0 z-50 w-full">
      <div className="h-1 bg-muted">
        <div
          className="h-full bg-blue-600 transition-all duration-100 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      {percent > 0 && (
        <div className="text-xs text-center py-1 bg-background text-muted-foreground animate-pulse">
          {percent < 100 ? '⬇️ Pull to refresh...' : '✅ Release to refresh'}
        </div>
      )}
    </div>
  );
}
