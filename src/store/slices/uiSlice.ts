import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarCollapsed:  boolean;
  activeProjectId:   string | null;
  filterPriority:    'all' | 'low' | 'medium' | 'high';
  filterAssigneeId:  string | null;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  activeProjectId:  null,
  filterPriority:   'all',
  filterAssigneeId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {

    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    setActiveProject(state, action: PayloadAction<string | null>) {
      state.activeProjectId = action.payload;
    },

    setFilterPriority(state, action: PayloadAction<UIState['filterPriority']>) {
      state.filterPriority = action.payload;
    },

    setFilterAssignee(state, action: PayloadAction<string | null>) {
      state.filterAssigneeId = action.payload;
    },

    resetFilters(state) {
      state.filterPriority   = 'all';
      state.filterAssigneeId = null;
    },

  },
});

export const {
  toggleSidebar,
  setActiveProject,
  setFilterPriority,
  setFilterAssignee,
  resetFilters,
} = uiSlice.actions;

export default uiSlice.reducer;
