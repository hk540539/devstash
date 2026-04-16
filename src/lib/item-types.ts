export const CREATABLE_TYPES = ["Snippet", "Prompt", "Command", "Note", "Link", "File", "Image"] as const;
export type CreatableType = (typeof CREATABLE_TYPES)[number];
