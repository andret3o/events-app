import { EventCategory } from "@/types/event";
import { SearchIcon, SlidersHorizontal, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ALL_CATEGORIES, CATEGORY_META } from "@/constants/event";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

export function FilterBar({
  search,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  showFilters,
  onToggleFilters,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  activeCategory: EventCategory | null;
  onCategoryChange: (c: EventCategory | null) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <InputGroup>
            <InputGroupInput
              placeholder="Search events..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              {search && <X onClick={() => onSearchChange("")} />}
            </InputGroupAddon>
          </InputGroup>
        </div>
        <Button
          type="button"
          variant={showFilters || activeCategory ? "default" : "outline"}
          onClick={onToggleFilters}
          className="gap-2 shrink-0"
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filter</span>
          {activeCategory && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-primary text-[10px] font-bold">
              1
            </span>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-muted/40 p-3">
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150
              ${
                !activeCategory
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
          >
            All
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const m = CATEGORY_META[cat];
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(active ? null : cat)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150
                  ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
              >
                <span>{m.emoji}</span>
                {m.label}
              </button>
            );
          })}
        </div>
      )}

      {activeCategory && !showFilters && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filtered by:</span>
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary"
          >
            {CATEGORY_META[activeCategory].emoji}{" "}
            {CATEGORY_META[activeCategory].label}
            <X size={11} />
          </button>
        </div>
      )}
    </div>
  );
}
