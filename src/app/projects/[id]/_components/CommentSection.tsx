'use client';

import { useEffect, useState, useTransition } from 'react';
import { createComment, deleteComment } from '@/lib/actions/comment.actions';
import { Button }    from '@/components/ui/button';
import { Textarea }  from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark }   from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { toast }         from 'sonner';
import { Trash2, Code, MessageSquare, Loader2 } from 'lucide-react';

interface Comment {
  _id:          string;
  content:      string;
  codeSnippet?: string;
  language?:    string;
  author:       { _id: string; name: string; image?: string };
  createdAt:    string;
}

interface Props {
  taskId:        string;
  projectId:     string;
  initialComments: Comment[];
  currentUserId: string;
  isLoading?:      boolean;
}

const LANGUAGES = ['typescript', 'javascript', 'python', 'css', 'html', 'bash', 'json'];

export default function CommentSection({
  taskId,
  projectId,
  initialComments,
  currentUserId,
  isLoading,
}: Props) {
  const [comments, setComments]     = useState<Comment[]>(initialComments);
  const [content, setContent]       = useState('');
  const [snippet, setSnippet]       = useState('');
  const [language, setLanguage]     = useState('typescript');
  const [showSnippet, setShowSnippet] = useState(false);
  const [isPending, startTransition] = useTransition();

useEffect(() => {
  setComments(initialComments);
}, [initialComments]);

  function handleSubmit() {
    if (!content.trim()) return toast.error('Comment cannot be empty');

    startTransition(async () => {
      try {
        const newComment = await createComment({
          content:     content.trim(),
          taskId,
          projectId,
          codeSnippet: showSnippet ? snippet : undefined,
          language:    showSnippet ? language : undefined,
        });

        setComments((prev) => [...prev, newComment]);
        setContent('');
        setSnippet('');
        setShowSnippet(false);
        toast.success('Comment added!');
      } catch {
        toast.error('Failed to add comment');
      }
    });
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      try {
        await deleteComment(commentId, projectId);
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        toast.success('Comment deleted');
      } catch {
        toast.error('Failed to delete comment');
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Comment List */}
     <div className="space-y-4 max-h-85 overflow-y-auto pr-1">
  {isLoading ? (
    <div className="flex justify-center py-6">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  ) : comments.length === 0 ? (
    <p className="text-sm text-muted-foreground text-center py-6">
      No comments yet. Be the first!
    </p>
  ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 group">

              {/* Avatar */}
             <Avatar className="w-7 h-7 shrink-0 mt-0.5">
  <AvatarImage src={comment.author?.image} />
  <AvatarFallback className="text-xs">
    {comment.author?.name?.[0]?.toUpperCase() ?? '?'}
  </AvatarFallback>
</Avatar>

              <div className="flex-1 space-y-1">
                {/* Author + date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                   <span className="text-sm font-medium">
  {comment.author?.name ?? 'Unknown'}
</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Delete — only shown to comment author */}
                 {comment?.author?._id === currentUserId && (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete comment?</AlertDialogTitle>
        <AlertDialogDescription>
          This comment will be permanently deleted.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => handleDelete(comment._id)}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}
                </div>

                {/* Comment text */}
                <p className="text-sm text-foreground">{comment.content}</p>

                {/* Code Snippet */}
                {comment.codeSnippet && (
                  <div className="rounded-md overflow-hidden text-xs mt-2">
                    <SyntaxHighlighter
                      language={comment.language ?? 'typescript'}
                      style={atomOneDark}
                      customStyle={{ margin: 0, borderRadius: '6px', fontSize: '12px' }}
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

      {/* Divider */}
      <div className="border-t pt-4 space-y-3">

        {/* Text input */}
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          className="resize-none text-sm"
        />

        {/* Code snippet toggle */}
        {showSnippet && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Code Snippet</span>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-36 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang} className="text-xs">
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Paste your code here..."
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              rows={4}
              className="resize-none font-mono text-xs"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowSnippet((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showSnippet
              ? <><MessageSquare className="w-3.5 h-3.5" /> Hide snippet</>
              : <><Code          className="w-3.5 h-3.5" /> Add code snippet</>
            }
          </button>

          <Button size="sm" onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : 'Comment'
            }
          </Button>
        </div>

      </div>
    </div>
  );
}
