import { create } from "zustand";
import { type FavouriteState } from "../types";

export const useFavouriteStore = create<FavouriteState>((set) => ({
  ids: [],
  add: (id) => set((state) => ({ ids: [...state.ids, id] })),
  remove: (id) => set((state) => ({ ids: state.ids.filter((i) => i !== id) })),
  set: (ids) => set({ ids }),
}));
