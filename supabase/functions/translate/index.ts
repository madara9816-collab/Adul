import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

function simpleTranslate(text: string, lang: string): string {
  const lower = text.toLowerCase();

  if (lang === "es") {
    const replacements: Record<string, string> = {
      "amateur": "aficionado",
      "blowjob": "oral",
      "lesbian": "lesbianas",
      "teen": "jóvenes",
      "mature": "maduras",
      "big tits": "tetas grandes",
      "asian": "asiáticas",
      "latina": "latinas",
      "ebony": "ebony",
      "group sex": "grupo",
      "public": "público",
      "cosplay": "cosplay",
      "verified amateurs": "verificados",
      "anal": "anal",
      "milf": "milf",
      "pov": "pov",
      "brazilian": "brasileño",
      "japanese": "japonés",
      "american": "americano",
      "german": "alemán",
      "french": "francés",
      "british": "británico",
      "italian": "italiano",
      "russian": "ruso",
      "korean": "coreano",
      "chinese": "chino",
      "indian": "indio",
      "czech": "checo",
      "spanish": "español",
      "swedish": "sueco",
    };
    let result = text;
    for (const [en, es] of Object.entries(replacements)) {
      result = result.replace(new RegExp(`\\b${en}\\b`, "gi"), (match) =>
        match[0] === match[0].toUpperCase() ? es.charAt(0).toUpperCase() + es.slice(1) : es
      );
    }
    return result === lower ? text : result;
  }

  if (lang === "en") {
    const replacements: Record<string, string> = {
      "amador": "amateur",
      "lésbicas": "lesbian",
      "maduras": "mature",
      "jovens": "teen",
      "peitos grandes": "big tits",
      "asiáticas": "asian",
      "latinas": "latina",
      "amadoras": "amateur",
      "brasileira": "brazilian",
      "brasileiro": "brazilian",
      "japonês": "japanese",
      "alemão": "german",
      "francês": "french",
      "britânico": "british",
      "italiano": "italian",
      "russo": "russian",
      "coreano": "korean",
      "chinês": "chinese",
      "indiano": "indian",
      "tcheco": "czech",
      "espanhol": "spanish",
      "sueco": "swedish",
    };
    let result = text;
    for (const [pt, en] of Object.entries(replacements)) {
      result = result.replace(new RegExp(`\\b${pt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"), (match) =>
        match[0] === match[0].toUpperCase() ? en.charAt(0).toUpperCase() + en.slice(1) : en
      );
    }
    return result === text ? text : result;
  }

  return text;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { texts, type, language } = await req.json();

    if (!texts || !Array.isArray(texts) || !language) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: texts, type, language" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (language === "pt") {
      const result: Record<string, string> = {};
      for (const t of texts) result[t] = t;
      return new Response(JSON.stringify({ translations: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check database for existing translations
    const { data: existing } = await supabase
      .from("translations")
      .select("entity_key, translated_text")
      .eq("entity_type", type)
      .eq("language", language)
      .in("entity_key", texts);

    const translations: Record<string, string> = {};
    const found = new Set<string>();

    if (existing) {
      for (const row of existing) {
        translations[row.entity_key] = row.translated_text;
        found.add(row.entity_key);
      }
    }

    // For texts not in database, auto-translate and store
    const untranslated = texts.filter((t: string) => t && !found.has(t));

    if (untranslated.length > 0) {
      const newRows: { entity_type: string; entity_key: string; language: string; translated_text: string; is_manual: boolean }[] = [];

      for (const text of untranslated) {
        const translated = simpleTranslate(text, language);
        translations[text] = translated;
        newRows.push({
          entity_type: type,
          entity_key: text,
          language,
          translated_text: translated,
          is_manual: false,
        });
      }

      // Store in database for future use
      if (newRows.length > 0) {
        await supabase.from("translations").upsert(newRows, {
          onConflict: "entity_type,entity_key,language",
        });
      }
    }

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
