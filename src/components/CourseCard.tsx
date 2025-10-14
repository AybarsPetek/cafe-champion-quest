import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Play } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  level: string;
  points: number;
  progress?: number;
}

const CourseCard = ({
  id,
  title,
  description,
  image,
  duration,
  level,
  points,
  progress = 0,
}: CourseCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-hover">
      <div className="relative overflow-hidden aspect-video">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
          {points} Puan
        </Badge>
      </div>

      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Clock className="h-4 w-4" />
          <span>{duration}</span>
          <Badge variant="secondary" className="ml-auto">
            {level}
          </Badge>
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground line-clamp-2">{description}</p>
        
        {progress > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">İlerleme</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full gap-2">
          <Link to={`/course/${id}`}>
            <Play className="h-4 w-4" />
            {progress > 0 ? "Devam Et" : "Başla"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
