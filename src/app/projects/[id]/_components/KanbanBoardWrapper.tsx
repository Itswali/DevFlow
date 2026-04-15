'use client';

import dynamic from 'next/dynamic';

const KanbanBoard = dynamic(() => import('./KanbanBoard'), {
  ssr: false,  // 👈 this is the fix — don't render on server at all
  loading: () => (
    <div className="flex gap-4 p-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="w-72 h-48 rounded-lg bg-muted/30 animate-pulse shrink-0"
        />
      ))}
    </div>
  ),
});

export { KanbanBoard as default };
