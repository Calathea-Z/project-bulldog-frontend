import { Loader2 } from 'lucide-react';
import { PullIndicatorProps } from '@/types';

export function PullIndicator({ isRefreshing, percent }: PullIndicatorProps) {
  return (
    <div className="flex justify-center items-center py-2 text-sm text-muted-foreground">
      {isRefreshing ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          Refreshing...
        </>
      ) : percent < 100 ? (
        <>⬇️ Pull to refresh ({Math.floor(percent)}%)</>
      ) : (
        <>✅ Release to refresh</>
      )}
    </div>
  );
}
