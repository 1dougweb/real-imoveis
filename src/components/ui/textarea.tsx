import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value"> {
    value?: string | number | readonly string[] | undefined;
  }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, ...props }, ref) => {
    // Ensure value is never null (convert null to empty string for string values)
    const safeValue = value === null ? "" : value;
    
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        value={safeValue}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
