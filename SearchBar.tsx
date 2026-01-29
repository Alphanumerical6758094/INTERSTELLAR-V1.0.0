import { useState, useEffect } from "react";
import { Search, ExternalLink } from "lucide-react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  initialQuery?: string;
}

const SearchBar = ({ onSearch, initialQuery }: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery || "");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Check if it's a URL
    const isUrl = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(query.trim());
    
    let targetUrl: string;
    if (isUrl) {
      targetUrl = query.startsWith("http") ? query : `https://${query}`;
    } else {
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    
    // Track the search
    onSearch?.(query.trim());
    
    // Open through a proxy-style approach (new tab)
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div 
        className={`
          relative group transition-all duration-500
          ${isFocused ? "scale-105" : "scale-100"}
        `}
      >
        {/* Glow effect behind */}
        <div 
          className={`
            absolute inset-0 rounded-2xl transition-all duration-500
            ${isFocused 
              ? "opacity-100 blur-xl bg-primary/30" 
              : "opacity-50 blur-lg bg-primary/20"
            }
          `}
          style={{ transform: "scale(1.05)" }}
        />
        
        {/* Main input container */}
        <div 
          className={`
            relative flex items-center gap-3 px-6 py-4 
            bg-card/80 backdrop-blur-xl rounded-2xl
            border-2 transition-all duration-300
            ${isFocused 
              ? "border-primary shadow-[var(--shadow-glow)]" 
              : "border-border/50 hover:border-primary/50"
            }
          `}
        >
          <Search 
            className={`
              w-5 h-5 transition-colors duration-300 flex-shrink-0
              ${isFocused ? "text-primary" : "text-muted-foreground"}
            `}
          />
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search the universe or enter a URL..."
            className="
              flex-1 bg-transparent outline-none 
              text-foreground placeholder:text-muted-foreground
              font-sans text-base
            "
          />
          
          <button
            type="submit"
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl
              font-display text-sm font-semibold uppercase tracking-wider
              transition-all duration-300
              ${query.trim() 
                ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer" 
                : "bg-muted text-muted-foreground cursor-not-allowed"
              }
            `}
            disabled={!query.trim()}
          >
            <span className="hidden sm:inline">Launch</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <p className="text-center text-muted-foreground text-xs mt-4 font-sans">
        Press Enter to navigate through the cosmos
      </p>
    </form>
  );
};

export default SearchBar;
