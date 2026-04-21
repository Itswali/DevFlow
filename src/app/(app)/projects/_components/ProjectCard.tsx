import Link  from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage }      from '@/components/ui/avatar';
import { CalendarDays, ArrowRight }                 from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';

interface Props {
  project: {
    _id:          string;
    name:         string;
    description?: string;
    owner:        { name: string; image?: string };
    members:      { _id: string; name: string; image?: string }[];
    createdAt:    string;
  };
}

export default function ProjectCard({ project }: Props) {
  return (
    <Link href={`/projects/${project._id}`}>
      <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full group">

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">

            {/* Project initial icon */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">
                  {project?.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <CardTitle className="text-base leading-tight">
                {project.name}
              </CardTitle>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* Description */}
          {project.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              No description
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">

            {/* Member Avatars */}
            <div className="flex -space-x-2">
              {project.members.slice(0, 4).map((member) => (
                <Avatar
                  key={member._id}
                  className="w-6 h-6 border-2 border-background"
                >
                  <AvatarImage src={member.image} />
                  <AvatarFallback className="text-[10px]">
                    {member?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.members.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] text-muted-foreground">
                  +{project.members.length - 4}
                </div>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="w-3 h-3" />
              {new Date(project.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day:   'numeric',
                year:  'numeric',
              })}
                <DeleteButton projectId={project._id} />
            </div>

          </div>
        </CardContent>

      </Card>
    </Link>
  );
}
