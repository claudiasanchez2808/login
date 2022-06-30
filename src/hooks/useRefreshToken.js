import { fetchNewToken } from "../api";
import { getRefreshToken } from "../auth/jwtHelper";
import useUserAuth from "./useUserAuth";

export default function useRefreshToken() {
  const { saveAuthentication } = useUserAuth();

  return async function refresh(config) {
    try {
      const refreshToken = getRefreshToken();

      const response = await fetchNewToken({ refreshToken }, config);
      const { token } = response.data || {};

      const tokens = {
        token,
        refreshToken,
      };

      // Lo guardamos con los datos del usuario
      saveAuthentication(tokens);

      return tokens;
    } catch (error) {
      throw error;
    }
  };
}
