// store/uiStore.ts
import { create } from 'zustand';

type Priority = 'all' | 'low' | 'medium' | 'high';

interface UIState {
  // State
  sidebarCollapsed:  boolean;
  activeProjectId:   string | null;
  filterPriority:    Priority;
  filterAssigneeId:  string | null;

  // Actions
  toggleSidebar:      () => void;
  setActiveProject:   (id: string | null) => void;
  setFilterPriority:  (priority: Priority) => void;
  setFilterAssignee:  (id: string | null) => void;
  resetFilters:       () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  sidebarCollapsed: false,
  activeProjectId:  null,
  filterPriority:   'all',
  filterAssigneeId: null,

  // Actions
  toggleSidebar:     () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setActiveProject:  (id) => set({ activeProjectId: id }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterAssignee: (id) => set({ filterAssigneeId: id }),
  resetFilters:      () => set({ filterPriority: 'all', filterAssigneeId: null }),
}));
