'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  CheckCircle2, Clock, GitPullRequest,
  AlertCircle, TrendingUp, TrendingDown, Plus,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────
interface Stat {
  count: number; value: number; positive: boolean;
}
interface ActivityDay {
  day: string; tasks: number; reviews: number; comments: number;
}
interface ProjectProgress {
  _id: string; name: string; total: number; done: number; progress: number;
}
interface RecentTask {
  _id: string; title: string; status: string;
  priority: string; tags: string[];
  assignee: { name: string; image?: string | null } | null;
}
interface Contributor {
  rank: number; _id: string; name: string;
  image?: string | null; completed: number; active: number; total: number;
}
interface Props {
  userName:     string;
  stats:        { totalTasks: Stat; inProgress: Stat; codeReviews: Stat; openIssues: Stat };
  activity:     ActivityDay[];
  projects:     ProjectProgress[];
  recentTasks:  RecentTask[];
  contributors: Contributor[];
}

// ── Helpers ───────────────────────────────────────────────────
const STATUS_BADGE: Record<string, string> = {
  'todo':        'bg-gray-100 text-gray-600',
  'backlog':     'bg-gray-100 text-gray-500',
  'in-progress': 'bg-blue-50 text-blue-600',
  'in-review':   'bg-purple-50 text-purple-600',
  'done':        'bg-green-50 text-green-600',
};
const STATUS_LABEL: Record<string, string> = {
  'todo': 'To Do', 'backlog': 'Backlog',
  'in-progress': 'In Progress', 'in-review': 'In Review', 'done': 'Done',
};
const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-red-50 text-red-600',
  high:     'bg-orange-50 text-orange-600',
  medium:   'bg-yellow-50 text-yellow-700',
  low:      'bg-gray-100 text-gray-500',
};

const PROJECT_COLORS = ['#6366f1','#ef4444','#22c55e','#f59e0b','#3b82f6','#ec4899'];
function getColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PROJECT_COLORS[Math.abs(h) % PROJECT_COLORS.length];
}

function greeting(name: string) {
  const h = new Date().getHours();
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${g}, ${name.split(' ')[0]}`;
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  label, count, value, positive, icon, iconColor,
}: {
  label: string; count: number; value: number;
  positive: boolean; icon: React.ReactNode; iconColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1 min-w-0">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{count}</p>
      <div className="flex items-center gap-1 mt-1.5">
        {positive
          ? <TrendingUp   className="w-3.5 h-3.5 text-emerald-500" />
          : <TrendingDown className="w-3.5 h-3.5 text-red-400" />
        }
        <span className={`text-xs font-medium ${positive ? 'text-emerald-500' : 'text-red-400'}`}>
          {positive ? '+' : '-'}{value}%
        </span>
        <span className="text-xs text-gray-400">vs last week</span>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function DashboardClient({
  userName, stats, activity, projects, recentTasks, contributors,
}: Props) {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting(userName)}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Here&apos;s what&apos;s happening across your projects today.
          </p>
        </div>
        <Link
          href="/projects"
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> New Task
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="flex gap-4">
        <StatCard
          label="Total Tasks" count={stats.totalTasks.count}
          value={stats.totalTasks.value} positive={stats.totalTasks.positive}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          iconColor="bg-emerald-50"
        />
        <StatCard
          label="In Progress" count={stats.inProgress.count}
          value={stats.inProgress.value} positive={stats.inProgress.positive}
          icon={<Clock className="w-4 h-4 text-blue-500" />}
          iconColor="bg-blue-50"
        />
        <StatCard
          label="Code Reviews" count={stats.codeReviews.count}
          value={stats.codeReviews.value} positive={stats.codeReviews.positive}
          icon={<GitPullRequest className="w-4 h-4 text-violet-500" />}
          iconColor="bg-violet-50"
        />
        <StatCard
          label="Open Issues" count={stats.openIssues.count}
          value={stats.openIssues.value} positive={stats.openIssues.positive}
          icon={<AlertCircle className="w-4 h-4 text-red-400" />}
          iconColor="bg-red-50"
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-3 gap-4">

        {/* Weekly Activity chart — 2/3 width */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Weekly Activity</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activity} barSize={8} barGap={3}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f3f4f6' }}
                cursor={{ fill: '#f9fafb' }}
              />
              <Legend
                iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              />
              <Bar dataKey="tasks"    name="Tasks"    fill="#6366f1" radius={[4,4,0,0]} />
              <Bar dataKey="reviews"  name="Reviews"  fill="#22c55e" radius={[4,4,0,0]} />
              <Bar dataKey="comments" name="Comments" fill="#a78bfa" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Project Progress — 1/3 width */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Project Progress</p>
          <div className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No projects yet</p>
            ) : projects.map((p) => {
              const color = getColor(p.name);
              return (
                <div key={p._id}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-xs font-medium text-gray-700 truncate flex-1">{p.name}</span>
                    <span className="text-xs text-gray-400">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${p.progress}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{p.done}/{p.total} tasks</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">

        {/* Recent Tasks — 2/3 */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">Recent Tasks</p>
            <Link href="/dashboard" className="text-xs text-violet-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentTasks.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No tasks yet</p>
            ) : recentTasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {/* Assignee avatar */}
                <Avatar className="w-7 h-7 shrink-0">
                  <AvatarImage src={task.assignee?.image ?? undefined} />
                  <AvatarFallback className="text-[10px] bg-violet-100 text-violet-600">
                    {(task.assignee?.name ?? '?')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Title + assignee */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  {task.assignee && (
                    <p className="text-[11px] text-gray-400 truncate">{task.assignee.name}</p>
                  )}
                </div>

                {/* Status + priority */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[task.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABEL[task.status] ?? task.status}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PRIORITY_BADGE[task.priority] ?? 'bg-gray-100 text-gray-500'}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors — 1/3 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-900 mb-4">Top Contributors</p>
          <div className="space-y-3">
            {contributors.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No data yet</p>
            ) : contributors.map((c) => (
              <div key={c._id} className="flex items-center gap-3">
                {/* Rank */}
                <span className="text-xs font-bold text-gray-300 w-4 shrink-0">
                  #{c.rank}
                </span>

                {/* Avatar */}
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={c.image ?? undefined} />
                  <AvatarFallback className="text-xs bg-violet-100 text-violet-600">
                    {c.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Name + stats */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {c.completed} completed · {c.active} active
                  </p>
                </div>

                {/* Total badge */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-semibold text-emerald-500">{c.total} tasks</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
