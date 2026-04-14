export const CREATABLE_TYPES = ["Snippet", "Prompt", "Command", "Note", "Link"] as const;
export type CreatableType = (typeof CREATABLE_TYPES)[number];
