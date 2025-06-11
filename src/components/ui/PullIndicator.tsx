import { Loader2 } from 'lucide-react';

interface Props {
  isRefreshing: boolean;
  percent: number;
}

export default function PullIndicator({ isRefreshing, percent }: Props) {
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
