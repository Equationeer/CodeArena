import {
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import axiosMain from "./utils/axios";

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosMain.post("/user/register", userData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosMain.post("/user/login", credentials);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/check",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosMain.get("/user/getAuth");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosMain.post("/user/logout");
      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    role: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;

        state.user = action.payload;
        state.role =
          action.payload?.role ||
          action.payload?.user?.role ||
          null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.error = action.payload || "Something went wrong";
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;

        state.user = action.payload;
        state.role =
          action.payload?.role ||
          action.payload?.user?.role ||
          null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.error = action.payload || "Something went wrong";
      })

      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;

        state.user = action.payload;
        state.role =
          action.payload?.role ||
          action.payload?.user?.role ||
          null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        state.error = action.payload || "Something went wrong";
      })

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
      });
  },
});

export const getAllProblem = createAsyncThunk(
  "problems/getAllProblem",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosMain.get("problem/getAllproblem");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const problemSlice = createSlice({
  name: "problem",
  initialState: {
    problems: [],
    loading: true,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllProblem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProblem.fulfilled, (state, action) => {
        state.loading = false;
        state.problems = action.payload;
      })
      .addCase(getAllProblem.rejected, (state, action) => {
        state.loading = false;
        state.problems = [];
        state.error = action.payload || "Something went wrong";
      });
  },
});