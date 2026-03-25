import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // UI-specific state only if needed, but currently mostly empty
  loading: false,
  error: null,
};

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    clearExpenses: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
});

export const { clearExpenses } = expenseSlice.actions;
export default expenseSlice.reducer;
