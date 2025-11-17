import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, BookOpen, Crown, Medal } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Leaderboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const { data: leaderboard, isLoading } = useLeaderboard();

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

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return null;
    }
  };

  const getPositionBg = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20";
      case 2:
        return "bg-gradient-to-r from-gray-400/10 to-slate-400/10 border-gray-400/20";
      case 3:
        return "bg-gradient-to-r from-amber-700/10 to-orange-700/10 border-amber-700/20";
      default:
        return "bg-background";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Liderlik Tablosu</h1>
          </div>
          <p className="text-muted-foreground">En başarılı öğrencileri keşfedin</p>
        </div>

        {/* Top 3 Podium */}
        {leaderboard && leaderboard.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 2nd Place */}
            {leaderboard[1] && (
              <Card className={`${getPositionBg(2)} border-2 md:mt-8`}>
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-4">
                    {getMedalIcon(2)}
                  </div>
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {leaderboard[1].full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-xl mb-2">{leaderboard[1].full_name}</h3>
                  <Badge className="mb-4">{leaderboard[1].level}</Badge>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{leaderboard[1].total_points} puan</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{leaderboard[1].completed_courses} kurs</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>{leaderboard[1].badges_earned} rozet</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 1st Place */}
            {leaderboard[0] && (
              <Card className={`${getPositionBg(1)} border-2`}>
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-4">
                    {getMedalIcon(1)}
                  </div>
                  <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-yellow-500/50">
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                      {leaderboard[0].full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-2xl mb-2">{leaderboard[0].full_name}</h3>
                  <Badge className="mb-4 text-lg px-4 py-1">{leaderboard[0].level}</Badge>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <span className="font-bold text-lg">{leaderboard[0].total_points} puan</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{leaderboard[0].completed_courses} kurs</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>{leaderboard[0].badges_earned} rozet</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3rd Place */}
            {leaderboard[2] && (
              <Card className={`${getPositionBg(3)} border-2 md:mt-8`}>
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-4">
                    {getMedalIcon(3)}
                  </div>
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {leaderboard[2].full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-xl mb-2">{leaderboard[2].full_name}</h3>
                  <Badge className="mb-4">{leaderboard[2].level}</Badge>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{leaderboard[2].total_points} puan</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{leaderboard[2].completed_courses} kurs</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>{leaderboard[2].badges_earned} rozet</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Rest of the leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Tüm Sıralama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard?.map((person, index) => {
                const isCurrentUser = user?.id === person.id;
                
                return (
                  <div
                    key={person.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      isCurrentUser
                        ? "bg-primary/5 border-primary"
                        : "bg-background hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-muted-foreground">
                      {index + 1}
                    </div>
                    
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {person.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {person.full_name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-primary">(Sen)</span>
                          )}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {person.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          <span>{person.total_points}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>{person.completed_courses}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          <span>{person.badges_earned}</span>
                        </div>
                      </div>
                    </div>

                    {index < 3 && getMedalIcon(index + 1)}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Leaderboard;
