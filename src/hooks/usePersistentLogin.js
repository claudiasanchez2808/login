import { useEffect } from "react";

import { getRefreshToken } from "../auth/jwtHelper";
import useUserAuth from "./useUserAuth";
import useRefreshToken from "./useRefreshToken";

export default function usePersistentLogin() {
  const { logout } = useUserAuth();
  const refresh = useRefreshToken();

  useEffect(function initUserSession() {
    const refreshToken = getRefreshToken();

    // Sólo borra el usuario si no tenemos un Refresh Token
    if (!refreshToken) {
      logout();
      return;
    }

    const controller = new AbortController();
    (async function refreshTheToken() {
      try {
        await refresh({ signal: controller.signal });
      } catch (error) {
        if (error.name === "CanceledError") return;

        logout(true);
      }
    })();

    return () => controller.abort();
    // Sólo queremos que corra una vez y esas dependencias no cambian
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
