import axios from "axios";
import { useEffect } from "react";
import useUserAuth from "./useUserAuth";
import useRefreshToken from "./useRefreshToken";

export default function useAxiosInterceptors() {
  const { user, logout, saveAuthentication } = useUserAuth();
  const refresh = useRefreshToken();

  useEffect(() => {
    // Permite modificar las peticiones
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (!config.headers.Authorization)
          // Incluimos el JWT en el encabezado en todas las llamadas
          config.headers.Authorization = `Bearer ${user?.token}`;

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Permite correr código en caso de una respuesta de falla como un JWT expirado
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Obtenemos la petición anterior
        const prevRequest = error.config;

        if (error.response?.status === 403) {
          // Solicitamos un nuevo JWT
          const response = await refresh();
          const { token } = response || {};

          // Registramos el nuevo JWT en el encabezado
          prevRequest.headers.Authorization = `Bearer ${token}`;

          // Realizamos la misma llamada anterior
          return axios(prevRequest);
        }

        if (error.response?.status === 401)
          if (prevRequest?.url === "/refreshToken")
            // Termina la sesión si no se puede obtener otro Refresh Token
            logout(true);

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [refresh, user, logout, saveAuthentication]);

  return axios;
}
