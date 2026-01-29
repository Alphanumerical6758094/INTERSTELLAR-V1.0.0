import { useState } from "react";
import { History, Search, MessageSquare, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { HistoryItem } from "@/hooks/useHistory";
import { formatDistanceToNow } from "date-fns";

interface HistorySidebarProps {
  history: HistoryItem[];
  onRemoveItem: (id: string) => void;
  onClearHistory: () => void;
  onSelectItem: (item: HistoryItem) => void;
}

const HistorySidebar = ({
  history,
  onRemoveItem,
  onClearHistory,
  onSelectItem,
}: HistorySidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const searchHistory = history.filter((item) => item.type === "search");
  const chatHistory = history.filter((item) => item.type === "chat");

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed top-4 z-50 p-3 rounded-xl
          bg-card/80 backdrop-blur-xl border border-border/50
          text-muted-foreground hover:text-foreground
          transition-all duration-300 hover:border-primary/50
          ${isOpen ? "left-[280px]" : "left-4"}
        `}
        aria-label={isOpen ? "Close history" : "Open history"}
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <History className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 z-40
          bg-card/95 backdrop-blur-xl border-r border-border/50
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-semibold text-foreground">History</h2>
              </div>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Clear all history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {history.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                <History className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No history yet</p>
                <p className="text-xs mt-1">Your searches and chats will appear here</p>
              </div>
            ) : (
              <>
                {/* Searches Section */}
                {searchHistory.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Search className="w-4 h-4 text-secondary" />
                      <h3 className="font-sans text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        Searches
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {searchHistory.slice(0, 10).map((item) => (
                        <HistoryCard
                          key={item.id}
                          item={item}
                          onRemove={onRemoveItem}
                          onSelect={onSelectItem}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Chats Section */}
                {chatHistory.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <h3 className="font-sans text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        AI Conversations
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {chatHistory.slice(0, 15).map((item) => (
                        <HistoryCard
                          key={item.id}
                          item={item}
                          onRemove={onRemoveItem}
                          onSelect={onSelectItem}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay when open on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

interface HistoryCardProps {
  item: HistoryItem;
  onRemove: (id: string) => void;
  onSelect: (item: HistoryItem) => void;
}

const HistoryCard = ({ item, onRemove, onSelect }: HistoryCardProps) => {
  return (
    <div
      className="
        group relative p-3 rounded-lg
        bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border/50
        transition-all duration-200 cursor-pointer
      "
      onClick={() => onSelect(item)}
    >
      <div className="pr-6">
        <p className="text-sm text-foreground line-clamp-2 font-sans">
          {item.query}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(item.timestamp, { addSuffix: true })}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.id);
        }}
        className="
          absolute top-2 right-2 p-1 rounded
          opacity-0 group-hover:opacity-100
          text-muted-foreground hover:text-destructive
          transition-all duration-200
        "
        title="Remove from history"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default HistorySidebar;
