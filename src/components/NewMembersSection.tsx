import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin } from "lucide-react";
import { useNewMembers } from "@/hooks/useProfile";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

const NewMembersSection = () => {
  const { data: members, isLoading } = useNewMembers();

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!members || members.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Aramıza Yeni Katılanlar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            TheCompany Coffee Academy ailesine hoş geldiniz!
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {members.map((member, index) => (
            <Card
              key={member.id}
              className="shadow-soft hover:shadow-hover transition-all animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-6 text-center">
                <Avatar className="w-16 h-16 mx-auto mb-4 border-2 border-primary/20">
                  <AvatarImage src={member.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10">
                    <User className="w-8 h-8 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-sm md:text-base mb-1 truncate">
                  {member.full_name || "Yeni Üye"}
                </h3>
                {member.store_name && (
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{member.store_name}</span>
                  </p>
                )}
                <p className="text-xs text-primary">
                  {formatDistanceToNow(new Date(member.created_at || new Date()), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewMembersSection;
