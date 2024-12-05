import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconSearch, IconX } from '@tabler/icons-react';
import { forwardRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange }, ref) => {
    return (
      <div className="relative w-[200px]">
        <Input
          ref={ref}
          placeholder="Find in log (⌘F)"
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          className="pl-8 pr-8"
        />
        <IconSearch 
          size={14} 
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" 
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            <IconX size={14} />
          </Button>
        )}
      </div>
    );
  }
);