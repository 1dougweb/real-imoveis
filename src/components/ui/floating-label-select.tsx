import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FloatingLabelSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  children: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

const FloatingLabelSelect = React.forwardRef<HTMLButtonElement, FloatingLabelSelectProps>(
  ({ label, value, onValueChange, id, children, placeholder = "", className, disabled = false, required = false, ...props }, ref) => {
    const selectId = id || `floating-select-${Math.random().toString(36).substring(2, 11)}`;
    
    return (
      <div className="relative">
        <Select value={value} onValueChange={onValueChange} disabled={disabled} {...props}>
          <SelectTrigger 
            id={selectId} 
            ref={ref}
            className={cn(
              "w-full pt-6 rounded-md border border-input bg-background px-3 h-14 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {children}
          </SelectContent>
        </Select>
        <label
          htmlFor={selectId}
          className={cn(
            "absolute text-sm text-muted-foreground duration-150 transform -translate-y-3 scale-75 top-1 z-10 origin-[0] px-3 left-1",
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);

FloatingLabelSelect.displayName = "FloatingLabelSelect";

export { FloatingLabelSelect }; 