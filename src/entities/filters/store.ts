import { create } from "zustand";

type FiltersState = {
  withinId: string[];
  draftWithinId: string[];
  type: number[];
  rentType: ("rent" | "buy")[];
  rent: [number, number];
  showPriceOnRequest: boolean;
  near?: {
    coordinates: [number, number];
    radius?: number;
  };
  bbox?: [number, number, number, number];
  setWithinId: (ids: string[]) => void;
  setDraftWithinId: (ids: string[]) => void;
  applyDraft: () => void;
  setType: (typeIds: number[]) => void;
  setRentType: (rentType: "rent" | "buy") => void;
  setRent: (min: number, max: number) => void;
  setShowPriceOnRequest: (show: boolean) => void;
  setNear: (near?: { coordinates: [number, number]; radius?: number }) => void;
  setBbox: (bbox?: [number, number, number, number]) => void;
  resetFilters: () => void;
};

const initialFilters = {
  withinId: [],
  draftWithinId: [],
  type: [2],
  rentType: ["rent" as const],
  rent: [0, 9999] as [number, number],
  showPriceOnRequest: true,
  near: undefined,
  bbox: undefined,
};

export const useFiltersStore = create<FiltersState>((set) => ({
  ...initialFilters,
  setWithinId: (ids) => set({ withinId: ids, near: undefined, bbox: undefined }),
  setDraftWithinId: (ids) => set({ draftWithinId: ids }),
  applyDraft: () => set((state) => ({ withinId: state.draftWithinId, draftWithinId: [], near: undefined, bbox: undefined })),
  setType: (typeIds) => set({ type: typeIds }),
  setRentType: (rentType) => set({ rentType: [rentType] }),
  setRent: (min, max) => set({ rent: [min, max] }),
  setShowPriceOnRequest: (show) => set({ showPriceOnRequest: show }),
  setNear: (near) => set({ near, withinId: [], bbox: undefined }),
  setBbox: (bbox) => set({ bbox, withinId: [], near: undefined }),
  resetFilters: () => set(initialFilters),
}));
