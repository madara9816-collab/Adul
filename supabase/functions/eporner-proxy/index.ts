const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NormalizedVideo {
  id: string;
  title: string;
  url: string;
  url_embed: string | null;
  thumbnail: string;
  length: string;
  quality: string | null;
  views: number;
  rate: string;
  tags: string[];
  pornstar: string[];
  added: string;
  source: string;
}

interface NormalizedResponse {
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
  videos: NormalizedVideo[];
}

function parseDurationToSec(duration: string): number {
  if (!duration) return 0;
  const parts = duration.split(":").map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

async function fetchEporner(
  query: string,
  page: number,
  perPage: number,
  order: string
): Promise<NormalizedResponse> {
  const apiParams = new URLSearchParams();
  if (query) apiParams.set("query", query);
  apiParams.set("per_page", String(perPage));
  apiParams.set("page", String(page));
  apiParams.set("order", order);

  const apiUrl = `https://www.eporner.com/api/v2/video/search/?${apiParams.toString()}`;
  const response = await fetch(apiUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; VideoPlatform/1.0)",
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Eporner API returned ${response.status}`);
  }

  const data = await response.json();
  const videos: NormalizedVideo[] = (data.videos || []).map((v: any) => {
    const thumbs = v.thumbs;
    let thumb = v.default_thumb?.src || "";
    if (thumbs && thumbs.length > 0) {
      thumb = [...thumbs].sort((a: any, b: any) => b.width * b.height - a.width * a.height)[0].src;
    }
    return {
      id: `ep_${v.id}`,
      title: v.title || "",
      url: v.url || "",
      url_embed: v.embed || null,
      thumbnail: thumb,
      length: String(v.length_sec || 0),
      quality: null,
      views: v.views || 0,
      rate: v.rate || "0",
      tags: (v.keywords || "").split(",").map((k: string) => k.trim()).filter((k: string) => k.length > 0 && k.length < 50),
      pornstar: v.pornstar || [],
      added: v.added || "",
      source: "eporner",
    };
  });

  return {
    total: data.total_count || 0,
    current_page: data.page || 1,
    last_page: data.total_pages || 1,
    per_page: data.per_page || perPage,
    videos,
  };
}

async function fetchRedtube(
  query: string,
  page: number,
  perPage: number,
  order: string
): Promise<NormalizedResponse> {
  const orderMap: Record<string, string> = {
    latest: "newest",
    mostviewed: "mostviewed",
    toprated: "rating",
    longest: "longest",
    relevance: "relevance",
  };

  const apiParams = new URLSearchParams();
  apiParams.set("data", "redtube.Videos.searchVideos");
  apiParams.set("output", "json");
  apiParams.set("thumbsize", "big");
  apiParams.set("page", String(page));
  if (query) apiParams.set("search", query);
  apiParams.set("ordering", orderMap[order] || "newest");

  const apiUrl = `https://api.redtube.com/?${apiParams.toString()}`;
  const response = await fetch(apiUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; VideoPlatform/1.0)",
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`RedTube API returned ${response.status}`);
  }

  const data = await response.json();
  const rawVideos: any[] = data.videos || [];
  const count = data.count || 0;

  const videos: NormalizedVideo[] = rawVideos.map((entry: any) => {
    const v = entry.video;
    const thumbs = v.thumbs;
    let thumb = v.default_thumb || v.thumb || "";
    if (thumbs && thumbs.length > 0) {
      thumb = [...thumbs].sort((a: any, b: any) => b.width * b.height - a.width * a.height)[0].src;
    }
    let tags: string[] = [];
    if (Array.isArray(v.tags)) {
      tags = v.tags.map((t: any) => t.tag_name).filter((t: string) => t && t !== "HD" && t.length < 50);
    }
    let pornstars: string[] = [];
    if (v.pornstars && Array.isArray(v.pornstars)) {
      pornstars = v.pornstars.map((s: any) => s.pornstar_name).filter((s: string) => !!s);
    }
    return {
      id: `rt_${v.video_id}`,
      title: v.title || "",
      url: v.url || "",
      url_embed: v.embed_url || null,
      thumbnail: thumb,
      length: String(parseDurationToSec(v.duration || "")),
      quality: null,
      views: parseInt(v.views, 10) || 0,
      rate: String(v.rating || 0),
      tags,
      pornstar: pornstars,
      added: v.publish_date || "",
      source: "redtube",
    };
  });

  const totalPages = Math.ceil(count / perPage) || 1;

  return {
    total: count,
    current_page: page,
    last_page: totalPages,
    per_page: perPage,
    videos,
  };
}

async function fetchPornhub(
  query: string,
  page: number,
  perPage: number,
  order: string
): Promise<NormalizedResponse> {
  const orderMap: Record<string, string> = {
    latest: "newest",
    mostviewed: "mostviewed",
    toprated: "rating",
    longest: "longest",
    relevance: "relevance",
  };

  const apiParams = new URLSearchParams();
  apiParams.set("thumbsize", "big");
  apiParams.set("page", String(page));
  apiParams.set("ordering", orderMap[order] || "newest");
  if (query) apiParams.set("search", query);

  const apiUrl = `https://www.pornhub.com/webmasters/search?${apiParams.toString()}`;
  const response = await fetch(apiUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; VideoPlatform/1.0)",
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`PornHub API returned ${response.status}`);
  }

  const data = await response.json();
  const rawVideos: any[] = data.videos || [];
  const count = rawVideos.length;

  const videos: NormalizedVideo[] = rawVideos.map((v: any) => {
    const thumbs = v.thumbs;
    let thumb = v.default_thumb || v.thumb || "";
    if (thumbs && thumbs.length > 0) {
      thumb = [...thumbs].sort((a: any, b: any) => {
        const aw = (parseInt(a.width) || 0) * (parseInt(a.height) || 0);
        const bw = (parseInt(b.width) || 0) * (parseInt(b.height) || 0);
        return bw - aw;
      })[0].src;
    }
    let tags: string[] = [];
    if (Array.isArray(v.tags)) {
      tags = v.tags.map((t: any) => t.tag_name).filter((t: string) => t && t !== "HD" && t.length < 50);
    }
    let categories: string[] = [];
    if (Array.isArray(v.categories)) {
      categories = v.categories.map((c: any) => c.category).filter((c: string) => !!c && c.length < 50);
    }
    let pornstars: string[] = [];
    if (v.pornstars && Array.isArray(v.pornstars)) {
      pornstars = v.pornstars.map((s: any) => s.pornstar_name).filter((s: string) => !!s);
    }
    const vidId = v.video_id || "";
    return {
      id: `ph_${vidId}`,
      title: v.title || "",
      url: v.url || "",
      url_embed: vidId ? `https://www.pornhub.com/embed/${vidId}` : null,
      thumbnail: thumb,
      length: String(parseDurationToSec(v.duration || "")),
      quality: null,
      views: parseInt(v.views, 10) || 0,
      rate: String(v.rating || 0),
      tags: [...tags, ...categories].slice(0, 20),
      pornstar: pornstars,
      added: v.publish_date || "",
      source: "pornhub",
    };
  });

  const totalPages = Math.ceil(count / perPage) || 1;

  return {
    total: count,
    current_page: page,
    last_page: totalPages,
    per_page: perPage,
    videos,
  };
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
}

function parseXvideosDuration(dur: string): number {
  const m = dur.match(/(\d+)\s*min/);
  if (m) return parseInt(m[1]) * 60;
  const parts = dur.split(":").map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

async function fetchXvideos(
  query: string,
  page: number,
  perPage: number,
  order: string
): Promise<NormalizedResponse> {
  const searchUrl = query
    ? `https://www.xvideos.com/?k=${encodeURIComponent(query)}&p=${page}`
    : `https://www.xvideos.com/tags/amateur/${page}`;

  const response = await fetch(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`XVideos returned ${response.status}`);
  }

  const html = await response.text();

  const cardRegex = /<div id="video_([a-z0-9]+)"\s+data-id="(\d+)"[^>]*>(.*?)(?=<div id="video_|$)/gs;
  const videos: NormalizedVideo[] = [];
  let match: RegExpExecArray | null;

  while ((match = cardRegex.exec(html)) !== null && videos.length < perPage) {
    const alphaId = match[1];
    const block = match[3];

    const titleM = block.match(/class="title"[^>]*>\s*<a[^>]*title="([^"]+)"/);
    const thumbM = block.match(/data-mzl="([^"]+)"/) || block.match(/data-src-avif="([^"]+)"/) || block.match(/data-src="([^"]+)"/);
    const durM = block.match(/class="duration"[^>]*>([^<]+)</);
    const hdM = block.match(/class="video-hd-mark"[^>]*>([^<]+)</);
    const slugM = block.match(/href="\/video\.[a-z0-9]+\/([^"]+)"/);
    const previewM = block.match(/data-pvv="([^"]+)"/);

    const title = decodeHtmlEntities(titleM ? titleM[1] : (slugM ? slugM[1].replace(/_/g, " ") : "Untitled"));

    videos.push({
      id: `xv_${alphaId}`,
      title,
      url: `https://www.xvideos.com/video.${alphaId}/${slugM ? slugM[1] : ""}`,
      url_embed: null,
      thumbnail: thumbM ? thumbM[1] : "",
      length: String(parseXvideosDuration(durM ? durM[1].trim() : "")),
      quality: hdM ? hdM[1].trim() : null,
      views: 0,
      rate: "0",
      tags: [],
      pornstar: [],
      added: "",
      source: "xvideos",
    });
  }

  return {
    total: videos.length,
    current_page: page,
    last_page: 100,
    per_page: perPage,
    videos,
  };
}

async function resolveXvideosVideo(alphaId: string): Promise<{ mp4_url: string | null; hls_url: string | null }> {
  const videoUrl = `https://www.xvideos.com/video.${alphaId}/video`;
  const response = await fetch(videoUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://www.xvideos.com/",
    },
  });

  if (!response.ok) {
    return { mp4_url: null, hls_url: null };
  }

  const html = await response.text();

  const mp4Match = html.match(/(https?:\/\/[^"']+mp4_sd\.mp4[^"']*)/);
  const hlsMatch = html.match(/(https?:\/\/[^"']+\.m3u8[^"']*)/);

  return {
    mp4_url: mp4Match ? mp4Match[1] : null,
    hls_url: hlsMatch ? hlsMatch[1] : null,
  };
}

function interleave(sources: NormalizedVideo[][]): NormalizedVideo[] {
  const result: NormalizedVideo[] = [];
  const maxLen = Math.max(...sources.map((s) => s.length), 0);
  for (let i = 0; i < maxLen; i++) {
    for (const source of sources) {
      if (i < source.length) result.push(source[i]);
    }
  }
  return result;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    const query = params.get("query") || params.get("q") || "";
    const perPage = parseInt(params.get("per_page") || "30", 10);
    const page = parseInt(params.get("page") || "1", 10);
    const order = params.get("order") || "latest";
    const source = params.get("source") || "all";
    const action = params.get("action") || "";

    if (action === "resolve_xvideos") {
      const videoId = params.get("video_id") || "";
      if (!videoId) {
        return new Response(JSON.stringify({ error: "Missing video_id" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const result = await resolveXvideosVideo(videoId);
      return new Response(JSON.stringify(result), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (source === "eporner") {
      const result = await fetchEporner(query, page, perPage, order);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store, max-age=0" },
      });
    }

    if (source === "redtube") {
      const result = await fetchRedtube(query, page, perPage, order);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store, max-age=0" },
      });
    }

    if (source === "pornhub") {
      const result = await fetchPornhub(query, page, perPage, order);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store, max-age=0" },
      });
    }

    if (source === "xvideos") {
      const result = await fetchXvideos(query, page, perPage, order);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store, max-age=0" },
      });
    }

    const perSource = Math.ceil(perPage / 4);

    const [epornerResult, redtubeResult, pornhubResult, xvideosResult] = await Promise.allSettled([
      fetchEporner(query, page, perSource, order),
      fetchRedtube(query, page, perSource, order),
      fetchPornhub(query, page, perSource, order),
      fetchXvideos(query, page, perSource, order),
    ]);

    const epornerData = epornerResult.status === "fulfilled" ? epornerResult.value : null;
    const redtubeData = redtubeResult.status === "fulfilled" ? redtubeResult.value : null;
    const pornhubData = pornhubResult.status === "fulfilled" ? pornhubResult.value : null;
    const xvideosData = xvideosResult.status === "fulfilled" ? xvideosResult.value : null;

    if (!epornerData && !redtubeData && !pornhubData && !xvideosData) {
      return new Response(
        JSON.stringify({ error: "All sources failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sourceArrays: NormalizedVideo[][] = [];
    if (epornerData) sourceArrays.push(epornerData.videos);
    if (redtubeData) sourceArrays.push(redtubeData.videos);
    if (pornhubData) sourceArrays.push(pornhubData.videos);
    if (xvideosData) sourceArrays.push(xvideosData.videos);

    const interleaved = interleave(sourceArrays);
    const trimmed = interleaved.slice(0, perPage);

    const result: NormalizedResponse = {
      total: (epornerData?.total || 0) + (redtubeData?.total || 0) + (pornhubData?.total || 0) + (xvideosData?.total || 0),
      current_page: page,
      last_page: Math.max(epornerData?.last_page || 1, redtubeData?.last_page || 1, pornhubData?.last_page || 1, xvideosData?.last_page || 1),
      per_page: perPage,
      videos: trimmed,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
