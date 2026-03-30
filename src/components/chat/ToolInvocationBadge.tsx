"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

function basename(path: unknown): string {
  if (typeof path !== "string" || path.length === 0) return "";
  const parts = path.split("/");
  return parts[parts.length - 1];
}

export function getToolLabel(
  toolName: string,
  args: Record<string, unknown>
): { pending: string; done: string } {
  const file = basename(args.path);

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return { pending: `Creating ${file}`, done: `Created ${file}` };
      case "str_replace":
      case "insert":
        return { pending: `Editing ${file}`, done: `Edited ${file}` };
      case "view":
        return { pending: `Reading ${file}`, done: `Read ${file}` };
      case "undo_edit":
        return { pending: "Undoing edit", done: "Undid edit" };
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename":
        return { pending: `Renaming ${file}`, done: `Renamed ${file}` };
      case "delete":
        return { pending: `Deleting ${file}`, done: `Deleted ${file}` };
    }
  }

  return { pending: toolName, done: toolName };
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const { toolName, args, state } = toolInvocation;
  const isDone =
    state === "result" &&
    "result" in toolInvocation &&
    toolInvocation.result != null;

  const label = getToolLabel(toolName, args as Record<string, unknown>);
  const displayText = isDone ? label.done : label.pending;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{displayText}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{displayText}</span>
        </>
      )}
    </div>
  );
}
