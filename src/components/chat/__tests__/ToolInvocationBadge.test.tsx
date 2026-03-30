import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// ─── getToolLabel: str_replace_editor ────────────────────────────────────────

test("getToolLabel: str_replace_editor create", () => {
  const result = getToolLabel("str_replace_editor", {
    command: "create",
    path: "/src/components/App.jsx",
  });
  expect(result.pending).toBe("Creating App.jsx");
  expect(result.done).toBe("Created App.jsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  const result = getToolLabel("str_replace_editor", {
    command: "str_replace",
    path: "/src/components/Button.tsx",
  });
  expect(result.pending).toBe("Editing Button.tsx");
  expect(result.done).toBe("Edited Button.tsx");
});

test("getToolLabel: str_replace_editor insert", () => {
  const result = getToolLabel("str_replace_editor", {
    command: "insert",
    path: "/src/utils/helpers.ts",
  });
  expect(result.pending).toBe("Editing helpers.ts");
  expect(result.done).toBe("Edited helpers.ts");
});

test("getToolLabel: str_replace_editor view", () => {
  const result = getToolLabel("str_replace_editor", {
    command: "view",
    path: "/src/App.tsx",
  });
  expect(result.pending).toBe("Reading App.tsx");
  expect(result.done).toBe("Read App.tsx");
});

test("getToolLabel: str_replace_editor undo_edit", () => {
  const result = getToolLabel("str_replace_editor", {
    command: "undo_edit",
    path: "/src/App.tsx",
  });
  expect(result.pending).toBe("Undoing edit");
  expect(result.done).toBe("Undid edit");
});

// ─── getToolLabel: file_manager ──────────────────────────────────────────────

test("getToolLabel: file_manager rename", () => {
  const result = getToolLabel("file_manager", {
    command: "rename",
    path: "/src/components/Old.tsx",
    new_path: "/src/components/New.tsx",
  });
  expect(result.pending).toBe("Renaming Old.tsx");
  expect(result.done).toBe("Renamed Old.tsx");
});

test("getToolLabel: file_manager delete", () => {
  const result = getToolLabel("file_manager", {
    command: "delete",
    path: "/src/components/App.jsx",
  });
  expect(result.pending).toBe("Deleting App.jsx");
  expect(result.done).toBe("Deleted App.jsx");
});

// ─── getToolLabel: fallback ───────────────────────────────────────────────────

test("getToolLabel: unknown tool name returns raw toolName", () => {
  const result = getToolLabel("some_unknown_tool", {
    command: "do_something",
    path: "/src/file.ts",
  });
  expect(result.pending).toBe("some_unknown_tool");
  expect(result.done).toBe("some_unknown_tool");
});

test("getToolLabel: known tool with unknown command falls back to toolName", () => {
  const result = getToolLabel("str_replace_editor", {
    command: "unknown_command",
    path: "/src/file.ts",
  });
  expect(result.pending).toBe("str_replace_editor");
  expect(result.done).toBe("str_replace_editor");
});

// ─── getToolLabel: edge cases ─────────────────────────────────────────────────

test("getToolLabel: missing path uses empty string as filename", () => {
  const result = getToolLabel("str_replace_editor", { command: "create" });
  expect(result.pending).toBe("Creating ");
  expect(result.done).toBe("Created ");
});

test("getToolLabel: path with no slashes uses full path as filename", () => {
  const result = getToolLabel("str_replace_editor", {
    command: "create",
    path: "App.jsx",
  });
  expect(result.pending).toBe("Creating App.jsx");
  expect(result.done).toBe("Created App.jsx");
});

test("getToolLabel: path ending with slash uses empty string as filename", () => {
  const result = getToolLabel("file_manager", {
    command: "delete",
    path: "/src/components/",
  });
  expect(result.pending).toBe("Deleting ");
  expect(result.done).toBe("Deleted ");
});

// ─── ToolInvocationBadge component: pending states ───────────────────────────

test("ToolInvocationBadge renders spinner and pending text for call state", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "call-1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/App.jsx" },
        state: "call",
      }}
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  const badge = screen.getByText("Creating App.jsx").closest("div");
  const svg = badge?.querySelector("svg");
  expect(svg?.getAttribute("class")).toContain("animate-spin");
  expect(svg?.getAttribute("class")).toContain("text-blue-600");
});

test("ToolInvocationBadge renders spinner for partial-call state", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "call-1",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/src/Button.tsx" },
        state: "partial-call",
      }}
    />
  );
  expect(screen.getByText("Editing Button.tsx")).toBeDefined();
  const badge = screen.getByText("Editing Button.tsx").closest("div");
  const svg = badge?.querySelector("svg");
  expect(svg?.getAttribute("class")).toContain("animate-spin");
});

// ─── ToolInvocationBadge component: done state ───────────────────────────────

test("ToolInvocationBadge renders green dot and done text when result present", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "call-1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/App.jsx" },
        state: "result",
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Created App.jsx")).toBeDefined();
  const badge = screen.getByText("Created App.jsx").closest("div");
  expect(badge?.querySelector(".bg-emerald-500")).toBeDefined();
  expect(badge?.querySelector("svg")).toBeNull();
});

test("ToolInvocationBadge treats result: null as pending", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "call-1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/App.jsx" },
        state: "result",
        result: null,
      }}
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  const badge = screen.getByText("Creating App.jsx").closest("div");
  expect(badge?.querySelector("svg")?.getAttribute("class")).toContain("animate-spin");
});

// ─── ToolInvocationBadge component: label accuracy ───────────────────────────

test("ToolInvocationBadge shows correct done text for file_manager delete", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "call-1",
        toolName: "file_manager",
        args: { command: "delete", path: "/src/OldFile.tsx" },
        state: "result",
        result: "deleted",
      }}
    />
  );
  expect(screen.getByText("Deleted OldFile.tsx")).toBeDefined();
});

test("ToolInvocationBadge falls back to raw toolName for unknown tool", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "call-1",
        toolName: "mystery_tool",
        args: {},
        state: "call",
      }}
    />
  );
  expect(screen.getByText("mystery_tool")).toBeDefined();
});

// ─── ToolInvocationBadge component: badge styling ────────────────────────────

test("ToolInvocationBadge has correct badge styling classes", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "call-1",
        toolName: "str_replace_editor",
        args: { command: "view", path: "/src/App.tsx" },
        state: "call",
      }}
    />
  );
  const badge = container.firstChild as HTMLElement;
  expect(badge.className).toContain("inline-flex");
  expect(badge.className).toContain("items-center");
  expect(badge.className).toContain("gap-2");
  expect(badge.className).toContain("mt-2");
  expect(badge.className).toContain("bg-neutral-50");
  expect(badge.className).toContain("rounded-lg");
  expect(badge.className).toContain("text-xs");
  expect(badge.className).toContain("font-mono");
  expect(badge.className).toContain("border-neutral-200");
});
