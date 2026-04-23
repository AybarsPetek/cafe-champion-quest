import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import EmptyState from "@/components/EmptyState";
import SEO from "@/components/SEO";
import CourseGridSkeleton from "@/components/skeletons/CourseGridSkeleton";
import { useCourses } from "@/hooks/useCourses";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { BookOpen } from "lucide-react";

const Courses = () => {
  const [user, setUser] = useState<User | null>(null);

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

  return (
    <div className="min-h-screen">
      <SEO
        title="Eğitim Kütüphanesi"
        description="Profesyonel barista olmak için tüm video eğitimler — temelden ileri seviyeye kahve sanatı."
      />
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Eğitim Kütüphanesi</h1>
          <p className="text-lg text-muted-foreground">
            Profesyonel barista olmak için gereken tüm eğitimler
          </p>
        </div>

        {isLoading ? (
          <CourseGridSkeleton />
        ) : !courses || courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Henüz eğitim yok"
            description="Yakında yeni eğitimler eklenecek. Tekrar göz atmayı unutma!"
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
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
