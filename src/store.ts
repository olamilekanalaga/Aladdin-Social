import { create } from "zustand";
import { persist } from "zustand/middleware";
import { posts } from "./data";
import type { Post, AppNotification, NotificationCategory } from "./models";
interface State {
  demoLaunchStage: "scheduled" | "announced" | "detected";
  demoTokenDiscovered: boolean;
  setDemoLaunchStage: (stage: "scheduled" | "announced" | "detected") => void;
  participation: "social" | "wallet";
  setParticipation: (mode: "social" | "wallet") => void;
  posts: Post[];
  follows: string[];
  likes: string[];
  bookmarks: string[];
  favorites: string[];
  comments: Record<string, string[]>;
  preferences: Record<string, NotificationCategory[]>;
  notifications: AppNotification[];
  toggle: (
    field: "follows" | "likes" | "bookmarks" | "favorites",
    id: string,
  ) => void;
  publish: (post: Post) => void;
  comment: (id: string, text: string) => void;
  configure: (id: string, categories: NotificationCategory[]) => void;
  simulate: (
    userId: string,
    tokenId: string,
    category: NotificationCategory,
  ) => void;
  read: () => void;
}
export const useStore = create<State>()(
  persist(
    (set) => ({
      posts,
      demoLaunchStage: "scheduled",
      demoTokenDiscovered: false,
      setDemoLaunchStage: (stage) =>
        set((s) => ({
          demoLaunchStage: stage,
          demoTokenDiscovered: s.demoTokenDiscovered || stage === "detected",
        })),
      participation: "social",
      setParticipation: (participation) => set({ participation }),
      follows: [],
      likes: [],
      bookmarks: [],
      favorites: [],
      comments: {},
      preferences: {},
      notifications: [
        {
          id: "n1",
          userId: "u1",
          tokenId: "t1",
          category: "Launch",
          text: "launchking launched $ALADDIN",
          timestamp: "2026-10-24T08:42:00Z",
          read: false,
        },
      ],
      toggle: (field, id) =>
        set((s) => ({
          [field]: s[field].includes(id)
            ? s[field].filter((v) => v !== id)
            : [...s[field], id],
        })),
      publish: (post) => set((s) => ({ posts: [post, ...s.posts] })),
      comment: (id, text) =>
        set((s) => ({
          comments: { ...s.comments, [id]: [...(s.comments[id] || []), text] },
        })),
      configure: (id, categories) =>
        set((s) => ({ preferences: { ...s.preferences, [id]: categories } })),
      simulate: (userId, tokenId, category) =>
        set((s) =>
          s.follows.includes(userId) &&
          (
            s.preferences[userId] || ["Launch", "Post", "2×", "5×", "10×"]
          ).includes(category)
            ? {
                notifications: [
                  {
                    id: crypto.randomUUID(),
                    userId,
                    tokenId,
                    category,
                    text: `Simulated ${category} event from a followed account`,
                    timestamp: new Date().toISOString(),
                    read: false,
                  },
                  ...s.notifications,
                ],
              }
            : {},
        ),
      read: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
    }),
    { name: "aladdin-demo-v1" },
  ),
);
