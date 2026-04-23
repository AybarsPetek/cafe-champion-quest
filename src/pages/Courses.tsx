import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import EmptyState from "@/components/EmptyState";
import SEO from "@/components/SEO";
import CourseGridSkeleton from "@/components/skeletons/CourseGridSkeleton";
import { useCourses } from "@/hooks/useCourses";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { BookOpen, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortKey = "newest" | "popular" | "rating";

const Courses = () => {
  const [user, setUser] = useState<User | null>(null);
  const [params, setParams] = useSearchParams();

  const search = params.get("q") || "";
  const level = params.get("level") || "all";
  const sort = (params.get("sort") as SortKey) || "newest";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all" || value === "newest") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: courses, isLoading } = useCourses(user?.id);

  const levels = useMemo(() => {
    if (!courses) return [];
    return Array.from(new Set(courses.map((c) => c.level))).filter(Boolean);
  }, [courses]);

  const filtered = useMemo(() => {
    if (!courses) return [];
    let list = courses;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    if (level !== "all") {
      list = list.filter((c) => c.level === level);
    }
    list = [...list];
    if (sort === "popular") {
      list.sort((a, b) => (b.enrolled_count || 0) - (a.enrolled_count || 0));
    } else if (sort === "rating") {
      list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }
    return list;
  }, [courses, search, level, sort]);

  const hasFilters = !!search || level !== "all" || sort !== "newest";
  const clearFilters = () => setParams({}, { replace: true });

  return (
    <div className="min-h-screen">
      <SEO
        title="Eğitim Kütüphanesi"
        description="Profesyonel barista olmak için tüm video eğitimler — temelden ileri seviyeye kahve sanatı."
      />
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Eğitim Kütüphanesi</h1>
          <p className="text-lg text-muted-foreground">
            Profesyonel barista olmak için gereken tüm eğitimler
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Eğitim ara..."
              value={search}
              onChange={(e) => setParam("q", e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={level} onValueChange={(v) => setParam("level", v)}>
            <SelectTrigger className="md:w-44">
              <SelectValue placeholder="Seviye" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm seviyeler</SelectItem>
              {levels.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setParam("sort", v)}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Sırala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Yeni eklenenler</SelectItem>
              <SelectItem value="popular">En popüler</SelectItem>
              <SelectItem value="rating">En yüksek puanlı</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Temizle
            </Button>
          )}
        </div>

        {hasFilters && !isLoading && (
          <div className="mb-4 text-sm text-muted-foreground">
            <Badge variant="secondary">{filtered.length}</Badge> sonuç bulundu
          </div>
        )}

        {isLoading ? (
          <CourseGridSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={hasFilters ? "Sonuç bulunamadı" : "Henüz eğitim yok"}
            description={
              hasFilters
                ? "Aramana uyan eğitim yok. Filtreleri değiştirmeyi dene."
                : "Yakında yeni eğitimler eklenecek. Tekrar göz atmayı unutma!"
            }
            actionLabel={hasFilters ? "Filtreleri temizle" : undefined}
            onAction={hasFilters ? clearFilters : undefined}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                image={course.image_url || ""}
                duration={`${Math.floor(course.duration_minutes / 60)} saat ${course.duration_minutes % 60} dk`}
                level={course.level}
                points={course.points}
                progress={course.progress || 0}
                lastWatchedVideoId={course.last_watched_video_id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
