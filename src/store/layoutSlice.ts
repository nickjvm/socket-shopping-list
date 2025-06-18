import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LayoutState {
  sidebarOpen: boolean;
}

const initialState: LayoutState = {
  sidebarOpen: false,
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { setSidebarOpen, toggleSidebar } = layoutSlice.actions;
export default layoutSlice.reducer;
