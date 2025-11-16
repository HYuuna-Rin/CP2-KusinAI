import * as React from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return (
    <div className={cn("rounded-xl border border-black/5 bg-surface p-6 shadow-sm", className)} {...props} />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-lg font-semibold text-text", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("text-text", className)} {...props} />;
}
