const normalizeRoute = (route: string) => {
  const trimmedRoute = route.trim();

  if (!trimmedRoute || trimmedRoute === "/") {
    return "/";
  }

  return trimmedRoute.endsWith("/") ? trimmedRoute.slice(0, -1) : trimmedRoute;
};

export const hasRouteAccess = (routes: string[] | undefined, targetRoute: string) => {
  if (!routes || routes.length === 0) {
    return targetRoute === "/";
  }

  const normalizedTargetRoute = normalizeRoute(targetRoute);

  return routes.map(normalizeRoute).includes(normalizedTargetRoute);
};

export const getFirstAccessibleRoute = (routes: string[] | undefined) => {
  if (!routes || routes.length === 0) {
    return "/";
  }

  const normalizedRoutes = Array.from(new Set(routes.map(normalizeRoute))).sort();

  return normalizedRoutes.includes("/") ? "/" : normalizedRoutes[0] ?? null;
};
