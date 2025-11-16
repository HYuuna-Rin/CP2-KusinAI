import React from "react";
import { cn } from "./utils";

export default function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-leaf/40 bg-background px-3 py-2 text-text text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent placeholder:text-leaf/70 resize-y min-h-[120px]",
        className
      )}
      {...props}
    />
  );
}
