import { useContext } from "react";
import { AuthContext } from "../auth/AuthProvider";

export default function useUserAuth() {
  return useContext(AuthContext);
}
