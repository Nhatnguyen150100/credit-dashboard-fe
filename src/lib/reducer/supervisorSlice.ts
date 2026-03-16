import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { ISupervisor } from "../../types/childApp";

const initialState: { info?: ISupervisor } = {};

export const supervisorSlice = createSlice({
  name: "supervisor",
  initialState,
  reducers: {
    setSupervisorInfo: (state, action: PayloadAction<ISupervisor>) => {
      state.info = action.payload;
    },
    clearSupervisor: () => {
      return initialState;
    },
  },
});

export const { setSupervisorInfo, clearSupervisor } = supervisorSlice.actions;

const supervisorReducer = supervisorSlice.reducer;
export default supervisorReducer;
