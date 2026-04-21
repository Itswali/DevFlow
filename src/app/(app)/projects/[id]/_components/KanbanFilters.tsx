'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setFilterPriority,
  setFilterAssignee,
  resetFilters,
} from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X } from 'lucide-react';

interface Member {
  _id:    string;
  name:   string;
  image?: string;
}

interface Props {
  members: Member[];
}

export default function KanbanFilters({ members }: Props) {
  const dispatch       = useAppDispatch();
  const filterPriority = useAppSelector((s) => s.ui.filterPriority);
  const filterAssignee = useAppSelector((s) => s.ui.filterAssigneeId);

  const isFiltered = filterPriority !== 'all' || filterAssignee !== null;

  return (
    <div className="flex items-center gap-2 px-6 py-2 border-b flex-wrap">

      {/* Priority Filter */}
      <Select
        value={filterPriority}
        onValueChange={(val) =>
          dispatch(setFilterPriority(val as 'all' | 'low' | 'medium' | 'high'))
        }
      >
        <SelectTrigger className="h-8 w-36 text-xs">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>

      {/* Assignee Filter */}
      <Select
        value={filterAssignee ?? 'all'}
        onValueChange={(val) =>
          dispatch(setFilterAssignee(val === 'all' ? null : val))
        }
      >
        <SelectTrigger className="h-8 w-40 text-xs">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All assignees</SelectItem>
          {members.map((member) => (
            <SelectItem key={member._id} value={member._id}>
              <div className="flex items-center gap-2">
                <Avatar className="w-4 h-4">
                  <AvatarImage src={member.image} />
                  <AvatarFallback className="text-[9px]">
                    {member.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {member.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset button — only shown when filters are active */}
      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground"
          onClick={() => dispatch(resetFilters())}
        >
          <X className="w-3 h-3 mr-1" />
          Clear filters
        </Button>
      )}

      {/* Active filter indicators */}
      {filterPriority !== 'all' && (
        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
          {filterPriority} priority
        </span>
      )}
      {filterAssignee && (
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          {members.find((m) => m._id === filterAssignee)?.name ?? 'Assignee'}
        </span>
      )}

    </div>
  );
}
