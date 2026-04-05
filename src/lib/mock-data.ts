// Mock data for dashboard UI — replace with real DB queries once implemented

export const mockUser = {
  id: "user_1",
  name: "John Doe",
  email: "john@example.com",
  isPro: false,
};

export const mockItemTypes = [
  { id: "type_snippet",  name: "Snippet",  icon: "code-xml",  color: "#7C3AED", isSystem: true, count: 24 },
  { id: "type_prompt",   name: "Prompt",   icon: "sparkles",  color: "#2563EB", isSystem: true, count: 18 },
  { id: "type_command",  name: "Command",  icon: "terminal",  color: "#059669", isSystem: true, count: 15 },
  { id: "type_note",     name: "Note",     icon: "notebook",  color: "#D97706", isSystem: true, count: 12 },
  { id: "type_file",     name: "File",     icon: "file",      color: "#6B7280", isSystem: true, count: 5  },
  { id: "type_image",    name: "Image",    icon: "image",     color: "#DB2777", isSystem: true, count: 3  },
  { id: "type_link",     name: "Link",     icon: "link",      color: "#0891B2", isSystem: true, count: 8  },
];

export const mockCollections = [
  {
    id: "col_1",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    itemCount: 12,
    isFavorite: true,
    typeIcons: ["code-xml", "notebook", "link"],
  },
  {
    id: "col_2",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    itemCount: 8,
    isFavorite: false,
    typeIcons: ["code-xml", "notebook"],
  },
  {
    id: "col_3",
    name: "Context Files",
    description: "AI context files for projects",
    itemCount: 5,
    isFavorite: true,
    typeIcons: ["file", "notebook"],
  },
  {
    id: "col_4",
    name: "Interview Prep",
    description: "Technical interview preparation",
    itemCount: 24,
    isFavorite: false,
    typeIcons: ["code-xml", "sparkles", "link", "notebook"],
  },
  {
    id: "col_5",
    name: "Git Commands",
    description: "Frequently used git commands",
    itemCount: 15,
    isFavorite: true,
    typeIcons: ["terminal", "notebook"],
  },
  {
    id: "col_6",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    itemCount: 18,
    isFavorite: false,
    typeIcons: ["sparkles", "code-xml"],
  },
];

export const mockItems = [
  {
    id: "item_1",
    title: "useAuth Hook",
    description: "Custom authentication hook for React applications",
    contentType: "text",
    content: `import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()
  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  }
}`,
    typeId: "type_snippet",
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    collectionId: "col_1",
    tags: ["react", "auth", "hooks"],
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "item_2",
    title: "API Error Handling Pattern",
    description: "Fetch wrapper with exponential backoff retry logic",
    contentType: "text",
    content: `async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(res.statusText)
      return res
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(r => setTimeout(r, 2 ** i * 1000))
    }
  }
  throw new Error('Unreachable')
}`,
    typeId: "type_snippet",
    language: "typescript",
    isFavorite: false,
    isPinned: true,
    collectionId: "col_1",
    tags: ["api", "error-handling", "typescript"],
    createdAt: "2026-01-15T11:00:00Z",
    updatedAt: "2026-01-15T11:00:00Z",
  },
];
