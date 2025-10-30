import { useEffect, useMemo, useRef, useState } from "react";

export type SearchResult = {
  id: string;
  name: string;
  altName?: string;
  type: "state" | "city" | "district";
  hasChildren: boolean;
};

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoibHlzdGlvIiwiYSI6ImNtMjA3cmFoejBnMngycXM4anNuNXFmaTQifQ.y-WiEerYZrFOm8Xd8a7GwQ";
const LANGUAGE = "de";
const COUNTRY = "at";
const TYPES = "address,district,place,locality,neighborhood,city,street,poi";

const mapboxTypeToLocal = (types: string[] | undefined): SearchResult["type"] => {
  if (!types || types.length === 0) return "city";
  const t = types[0];
  if (t === "region" || t === "province" || t === "state") return "state";
  if (t === "district" || t === "neighborhood" || t === "postcode") return "district";
  return "city";
};

const buildSuggestUrl = (query: string) => {
  const params = new URLSearchParams({
    q: query,
    language: LANGUAGE,
    country: COUNTRY,
    types: TYPES,
    access_token: MAPBOX_ACCESS_TOKEN,
    limit: "10",
  });
  return `https://api.mapbox.com/search/searchbox/v1/suggest?${params.toString()}`;
};

export const useLocationSearch = (searchValue: string) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const debouncedValue = useDebounced(searchValue, 250);

  useEffect(() => {
    if (!debouncedValue || debouncedValue.trim().length === 0) {
      setResults([]);
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const run = async () => {
      try {
        const url = buildSuggestUrl(debouncedValue.trim());
        const resp = await fetch(url, { signal: controller.signal });
        if (!resp.ok) {
          setResults([]);
          return;
        }
        const data = await resp.json();
        const suggestions: any[] = data?.suggestions || data?.features || [];

        const mapped: SearchResult[] = suggestions.map((s: any) => {
          const id: string = s.mapbox_id || s.id || s.feature?.id || `${s.name}-${s?.context?.id || Math.random()}`;
          const name: string = s.name || s.place_name || s.feature_name || s.properties?.name || "";
          const types: string[] | undefined = s.feature_type ? [s.feature_type] : (s.place_type || s.types);
          const type = mapboxTypeToLocal(types);
          return {
            id,
            name,
            altName: s.properties?.full_address || s.properties?.name || undefined,
            type,
            hasChildren: false,
          };
        });

        setResults(mapped);
      } catch (err) {
        if ((err as any)?.name === "AbortError") return;
        setResults([]);
      }
    };

    run();

    return () => {
      controller.abort();
    };
  }, [debouncedValue]);

  return useMemo(() => results, [results]);
};

const useDebounced = (value: string, delayMs: number) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
};

