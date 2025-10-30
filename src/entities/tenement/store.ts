import { create } from "zustand";
import type { TenementSearchRequest } from "./types";

type TenementState = {
  currentRequest: TenementSearchRequest | null;
  setRequest: (request: TenementSearchRequest) => void;
  setPage: (page: number) => void;
};

export const useTenementStore = create<TenementState>((set, get) => ({
  currentRequest: null,

  setRequest: (request: TenementSearchRequest) => {
    set({ currentRequest: request });
  },

  setPage: (page: number) => {
    const { currentRequest } = get();
    if (currentRequest) {
      set({
        currentRequest: {
          ...currentRequest,
          paging: {
            ...currentRequest.paging,
            page,
          },
        },
      });
    }
  },
}));

