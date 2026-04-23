import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, Library, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface SearchResults {
  courses: Array<{ id: string; title: string; description: string }>;
  library: Array<{ id: string; name: string; description: string | null; category_id: string }>;
  topics: Array<{ id: string; title: string }>;
}

const useGlobalSearch = (term: string) => {
  return useQuery({
    queryKey: ["global-search", term],
    queryFn: async (): Promise<SearchResults> => {
      const t = term.trim();
      if (t.length < 2) return { courses: [], library: [], topics: [] };
      const like = `%${t}%`;

      const [coursesRes, libRes, topicsRes] = await Promise.all([
        supabase
          .from("courses")
          .select("id, title, description")
          .or(`title.ilike.${like},description.ilike.${like}`)
          .limit(5),
        supabase
          .from("library_files")
          .select("id, name, description, category_id")
          .or(`name.ilike.${like},description.ilike.${like}`)
          .limit(5),
        supabase
          .from("forum_topics")
          .select("id, title")
          .ilike("title", like)
          .limit(5),
      ]);

      return {
        courses: coursesRes.data || [],
        library: (libRes.data as any) || [],
        topics: topicsRes.data || [],
      };
    },
    enabled: term.trim().length >= 2,
  });
};

const GlobalSearch = ({ iconOnly = false }: { iconOnly?: boolean }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  const { data: results, isFetching } = useGlobalSearch(term);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    setTerm("");
    navigate(path);
  };

  return (
    <>
      {iconOnly ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Ara"
        >
          <Search className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-2 text-muted-foreground w-48 justify-start"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Ara...</span>
          <kbd className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
        </Button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Eğitim, kütüphane veya forum konusu ara..."
          value={term}
          onValueChange={setTerm}
        />
        <CommandList>
          {term.trim().length < 2 ? (
            <CommandEmpty>En az 2 karakter yaz...</CommandEmpty>
          ) : isFetching ? (
            <CommandEmpty>Aranıyor...</CommandEmpty>
          ) : (
            <>
              {(!results ||
                (results.courses.length === 0 &&
                  results.library.length === 0 &&
                  results.topics.length === 0)) && (
                <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
              )}

              {results && results.courses.length > 0 && (
                <CommandGroup heading="Eğitimler">
                  {results.courses.map((c) => (
                    <CommandItem
                      key={c.id}
                      value={`course-${c.id}-${c.title}`}
                      onSelect={() => go(`/course/${c.id}`)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>{c.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results && results.library.length > 0 && (
                <CommandGroup heading="Kütüphane">
                  {results.library.map((f) => (
                    <CommandItem
                      key={f.id}
                      value={`lib-${f.id}-${f.name}`}
                      onSelect={() => go(`/library`)}
                    >
                      <Library className="mr-2 h-4 w-4" />
                      <span>{f.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results && results.topics.length > 0 && (
                <CommandGroup heading="Forum">
                  {results.topics.map((t) => (
                    <CommandItem
                      key={t.id}
                      value={`topic-${t.id}-${t.title}`}
                      onSelect={() => go(`/forum/topic/${t.id}`)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>{t.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
