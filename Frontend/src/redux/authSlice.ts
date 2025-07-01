import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface UserSliceType {
  _id: string;
  email: string;
  role: "freelancer" | "client" | "admin" | "";
  status: "active" | "blocked" | "";
  accessToken: string | null;
  profilePic?: string;
  name?: string;
}

const initialState: UserSliceType = {
  _id: "",
  email: "",
  role: "",
  status: "",
  profilePic: "",
  accessToken: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      Cookies.set("accessToken", action.payload.accessToken, { expires: 7 });
      return { ...state, ...action.payload };
    },
    removeUser: () => {
      Cookies.remove("accessToken");
      return initialState;
    },
    setAccessToken: (state, action) => {
      if (action.payload.accessToken) {
        Cookies.set("accessToken", action.payload.accessToken, { expires: 7 });
        state.accessToken = action.payload.accessToken;
      } else {
        Cookies.remove("accessToken");
        state.accessToken = null;
      }
    },
  },
});

export const { setUser, removeUser, setAccessToken } = userSlice.actions;
export default userSlice.reducer;
