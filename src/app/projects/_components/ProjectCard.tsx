import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays } from 'lucide-react';

interface Props {
  project: {
    _id: string;
    name: string;
    description?: string;
    owner: { name: string; image?: string };
    members: { _id: string; name: string; image?: string }[];
    createdAt: string;
  };
}

export default function ProjectCard({ project }: Props) {
  return (
    <Link href={`/projects/${project._id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base">{project.name}</CardTitle>
            <Badge variant="secondary" className="text-xs ml-2 shrink-0">
              {project.members.length} member{project.members.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}

          {/* Member Avatars */}
          <div className="flex -space-x-2">
            {project.members
  .filter((member: any) => member && member._id)
  .slice(0, 4)
  .map((member: any) => (
    <Avatar key={member._id} className="w-7 h-7 border-2 border-background">
      <AvatarImage src={member.image} />
      <AvatarFallback className="text-xs">
        {member?.name?.[0]?.toUpperCase() ?? '?'}
      </AvatarFallback>
    </Avatar>
  ))}

            {project.members.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                +{project.members.length - 4}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="w-3 h-3" />
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </CardContent>

      </Card>
    </Link>
  );
}
