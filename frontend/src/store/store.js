import { configureStore } from "@reduxjs/toolkit";
import {authSlice,problemSlice} from "../Slice";

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    problem:problemSlice.reducer,
  },
});
export default store;
