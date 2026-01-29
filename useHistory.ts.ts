import { useState, useEffect, useCallback } from "react";

export interface HistoryItem {
  id: string;
  type: "search" | "chat";
  query: string;
  response?: string;
  timestamp: number;
}

const STORAGE_KEY = "interstellar-history";
const MAX_HISTORY_ITEMS = 50;

export const useHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryItem[];
        setHistory(parsed);
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  }, [history]);

  const addSearchHistory = useCallback((query: string) => {
    const item: HistoryItem = {
      id: crypto.randomUUID(),
      type: "search",
      query,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, MAX_HISTORY_ITEMS);
      return updated;
    });
  }, []);

  const addChatHistory = useCallback((query: string, response: string) => {
    const item: HistoryItem = {
      id: crypto.randomUUID(),
      type: "chat",
      query,
      response,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, MAX_HISTORY_ITEMS);
      return updated;
    });
  }, []);

  const removeHistoryItem = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    addSearchHistory,
    addChatHistory,
    removeHistoryItem,
    clearHistory,
  };
};
