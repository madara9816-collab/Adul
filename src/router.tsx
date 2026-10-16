import { useEffect, useState, useCallback } from "react";
import { storeVideo } from "@/utils/videoStore";
import type { Video } from "@/types";

export type { Video as RouteVideo } from "@/types";
export type { Video } from "@/types";

export type Route =
  | { name: "home" }
  | { name: "search"; query: string }
  | { name: "category"; categoryId: string }
  | { name: "country"; countryId: string }
  | { name: "video"; videoId: string }
  | { name: "favorites" }
  | { name: "privacy" }
  | { name: "terms" }
  | { name: "dmca" }
  | { name: "contact" };

function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, "");
  const [path, ...rest] = clean.split("/");

  switch (path) {
    case "":
    case "home":
      return { name: "home" };
    case "search":
      return { name: "search", query: decodeURIComponent(rest.join("/") || "") };
    case "category":
      return { name: "category", categoryId: rest[0] || "" };
    case "country":
      return { name: "country", countryId: rest[0] || "" };
    case "video":
      return { name: "video", videoId: rest.join("/") || "" };
    case "favorites":
      return { name: "favorites" };
    case "privacy":
      return { name: "privacy" };
    case "terms":
      return { name: "terms" };
    case "dmca":
      return { name: "dmca" };
    case "contact":
      return { name: "contact" };
    default:
      return { name: "home" };
  }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case "home":
      return "#/";
    case "search":
      return `#/search/${encodeURIComponent(route.query)}`;
    case "category":
      return `#/category/${route.categoryId}`;
    case "country":
      return `#/country/${route.countryId}`;
    case "video":
      return `#/video/${route.videoId}`;
    case "favorites":
      return "#/favorites";
    case "privacy":
      return "#/privacy";
    case "terms":
      return "#/terms";
    case "dmca":
      return "#/dmca";
    case "contact":
      return "#/contact";
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const handler = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = useCallback((newRoute: Route, video?: Video) => {
    if (newRoute.name === "video" && video) {
      storeVideo(video);
    }
    window.location.hash = routeToHash(newRoute);
  }, []);

  return { route, navigate };
}
