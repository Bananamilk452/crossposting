import { createContext, useState } from "react";

export interface QueueItem {
  platform: string;
  id: string;
  status: "pending" | "success" | "error";
  message: string;
  content?: string;
  link?: string;
}

interface WriterContextType {
  queue: QueueItem[];
  addToQueue: (item: QueueItem) => void;
  updateQueueItem: (id: string, updates: Partial<QueueItem>) => void;
}

export const WriterContext = createContext<WriterContextType | undefined>(
  undefined,
);

export function WriterProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  function addToQueue(item: QueueItem) {
    setQueue((prev) => [...prev, item]);
  }

  function updateQueueItem(id: string, updates: Partial<QueueItem>) {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }

  return (
    <WriterContext.Provider value={{ queue, addToQueue, updateQueueItem }}>
      {children}
    </WriterContext.Provider>
  );
}
