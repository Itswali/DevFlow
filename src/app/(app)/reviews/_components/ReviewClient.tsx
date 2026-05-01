'use client';

import { useState, useEffect, useTransition } from 'react';
import { getReviewComments }  from '@/lib/actions/review.actions';
import { createComment }      from '@/lib/actions/comment.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Clock, Loader2, Code, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button }   from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark }   from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Task {
  _id:         string;
  title:       string;
  description: string;
  project:     string;
  assignee?:   { _id: string; name: string; image?: string } | null;
  updatedAt:   string;
}

interface Comment {
  _id:          string;
  content:      string;
  codeSnippet?: string | null;
  language?:    string;
  author:       { _id: string; name: string; image?: string | null };
  createdAt:    string;
}

interface Props {
  tasks:             Task[];
  currentUserId:     string;
  currentUserName:   string;
  currentUserImage:  string | null;
}

const LANGUAGES = ['typescript', 'javascript', 'python', 'css', 'html', 'bash', 'json'];

export default function ReviewClient({ tasks, currentUserId, currentUserName, currentUserImage }: Props) {
  const [selectedTask, setSelectedTask]     = useState<Task | null>(tasks[0] ?? null);
  const [comments,     setComments]         = useState<Comment[]>([]);
  const [content,      setContent]          = useState('');
  const [snippet,      setSnippet]          = useState('');
  const [language,     setLanguage]         = useState('typescript');
  const [showSnippet,  setShowSnippet]      = useState(false);
  const [isLoading,    startLoadTransition] = useTransition();
  const [isPending,    startPostTransition] = useTransition();

  useEffect(() => {
    if (!selectedTask) return;
    setComments([]);
    startLoadTransition(async () => {
      const data = await getReviewComments(selectedTask._id);
      setComments(data);
    });
  }, [selectedTask?._id]);

  function handlePost() {
    if (!content.trim() || !selectedTask) return;
    startPostTransition(async () => {
      try {
        const newComment = await createComment({
          content:     content.trim(),
          taskId:      selectedTask._id,
          projectId:   selectedTask.project,
          codeSnippet: showSnippet ? snippet : undefined,
          language:    showSnippet ? language : undefined,
        });
        setComments((prev) => [...prev, newComment]);
        setContent('');
        setSnippet('');
        setShowSnippet(false);
        toast.success('Comment posted');
      } catch {
        toast.error('Failed to post comment');
      }
    });
  }

  const totalComments = comments.length;

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 py-4 border-b bg-white shrink-0">
        <h1 className="text-lg font-bold text-gray-900">Code Reviews</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} pending review
          {selectedTask ? ` · ${totalComments} recent comment${totalComments !== 1 ? 's' : ''}` : ''}
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Left panel — pending reviews list */}
        <div className="w-80 shrink-0 border-r bg-white flex flex-col overflow-hidden">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-4 pt-4 pb-2">
            Pending Reviews
          </p>

          <div className="flex-1 overflow-y-auto">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <p className="text-sm text-gray-400">No tasks pending review</p>
              </div>
            ) : (
              tasks.map((task) => (
                <button
                  key={task._id}
                  onClick={() => setSelectedTask(task)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selectedTask?._id === task._id ? 'bg-violet-50 border-l-2 border-l-violet-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-violet-600">{'{}'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                        {task.title}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1.5">
                          {task.assignee && (
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={task.assignee.image} />
                              <AvatarFallback className="text-[8px]">
                                {task.assignee.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <span className="text-[11px] text-gray-400 truncate">
                            {task.assignee?.name ?? 'Unassigned'}
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <Clock className="w-2.5 h-2.5" /> Awaiting
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right panel — discussion thread */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {!selectedTask ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <MessageSquare className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Select a task to view its discussion</p>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="px-6 py-3.5 border-b bg-white shrink-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                  Discussion Thread
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-violet-100 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-violet-600">{'{}'}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{selectedTask.title}</p>
                </div>
              </div>

              {/* Comments */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-sm text-gray-400">No comments yet. Start the discussion!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                        <AvatarImage src={comment.author.image ?? undefined} />
                        <AvatarFallback className="text-xs bg-violet-100 text-violet-600">
                          {comment.author.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {comment.author.name}
                          </span>
                          {comment.author._id === currentUserId && (
                            <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded font-medium">
                              you
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                        {comment.codeSnippet && (
                          <div className="mt-2 rounded-lg overflow-hidden">
                            <SyntaxHighlighter
                              language={comment.language ?? 'typescript'}
                              style={atomOneDark}
                              customStyle={{ margin: 0, borderRadius: '8px', fontSize: '12px', padding: '12px' }}
                            >
                              {comment.codeSnippet}
                            </SyntaxHighlighter>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Comment input */}
              <div className="px-6 py-4 border-t bg-white shrink-0 space-y-2">
                {showSnippet && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">Code Snippet</span>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-32 h-6 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((l) => (
                            <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Paste code here..."
                      value={snippet}
                      onChange={(e) => setSnippet(e.target.value)}
                      rows={3}
                      className="resize-none font-mono text-xs"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarImage src={currentUserImage ?? undefined} />
                    <AvatarFallback className="text-[10px] bg-violet-100 text-violet-600">
                      {currentUserName[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Write a comment or paste a code snippet..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePost(); } }}
                      className="flex-1 h-9 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-300 transition-all"
                    />
                    <button
                      onClick={() => setShowSnippet((p) => !p)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors border ${
                        showSnippet
                          ? 'bg-violet-100 text-violet-600 border-violet-200'
                          : 'bg-gray-50 text-gray-400 border-gray-200 hover:text-gray-600'
                      }`}
                      title="Toggle code snippet"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                    <Button
                      size="sm"
                      onClick={handlePost}
                      disabled={isPending || !content.trim()}
                      className="h-9 px-3 bg-violet-600 hover:bg-violet-700"
                    >
                      {isPending
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Send className="w-3.5 h-3.5" />
                      }
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
