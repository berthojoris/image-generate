"use client";

import { useState, useEffect } from "react";
import { CommentItem, CommentSkeleton } from "@/components/ui/comment";
import { CommentForm } from "@/components/ui/comment-form";
import { Button } from "@/components/ui/button";
import { MessageCircle, SortAsc, SortDesc } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'USER' | 'ADMIN';
  };
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  isEdited?: boolean;
}

interface CommentSectionProps {
  articleId: string;
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

type SortOption = 'newest' | 'oldest' | 'popular';

// Mock data for development
const mockComments: Comment[] = [
  {
    id: '1',
    content: 'Great article! This really helped me understand the concepts better. I especially liked the examples you provided.',
    author: {
      id: 'user1',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      role: 'USER'
    },
    createdAt: new Date('2024-01-15T10:30:00Z'),
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: '2',
        content: 'I agree! The examples made it much clearer.',
        author: {
          id: 'user2',
          name: 'Jane Smith',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
          role: 'USER'
        },
        createdAt: new Date('2024-01-15T11:00:00Z'),
        likes: 2,
        isLiked: true,
      }
    ]
  },
  {
    id: '3',
    content: 'Thanks for sharing this! I have a question about the implementation details. Could you elaborate on the performance implications?',
    author: {
      id: 'user3',
      name: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      role: 'USER'
    },
    createdAt: new Date('2024-01-15T14:20:00Z'),
    likes: 3,
    isLiked: false,
  },
  {
    id: '4',
    content: 'Excellent write-up! I\'ve been working on a similar project and this gives me some great ideas. The code examples are particularly helpful.',
    author: {
      id: 'admin1',
      name: 'Sarah Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      role: 'ADMIN'
    },
    createdAt: new Date('2024-01-16T09:15:00Z'),
    likes: 8,
    isLiked: false,
    isEdited: true,
  }
];

export function CommentSection({ articleId, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const { toast } = useToast();

  // Load comments on mount
  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setComments(mockComments);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load comments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [articleId, toast]);

  const sortComments = (comments: Comment[], sortOption: SortOption): Comment[] => {
    const sorted = [...comments].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    // Sort replies recursively
    return sorted.map(comment => ({
      ...comment,
      replies: comment.replies ? sortComments(comment.replies, sortOption) : undefined
    }));
  };

  const handleSubmitComment = async (content: string, parentId?: string) => {
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: 'USER'
      },
      createdAt: new Date(),
      likes: 0,
      isLiked: false,
    };

    if (parentId) {
      // Add as reply
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newComment]
          };
        }
        return comment;
      }));
      setReplyingTo(null);
    } else {
      // Add as top-level comment
      setComments(prev => [newComment, ...prev]);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like comments.",
        variant: "destructive",
      });
      return;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));

    const updateCommentLike = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateCommentLike(comment.replies)
          };
        }
        return comment;
      });
    };

    setComments(prev => updateCommentLike(prev));
  };

  const handleEditComment = (commentId: string) => {
    setEditingComment(commentId);
    // In a real app, you would open an edit form here
    toast({
      title: "Edit Comment",
      description: "Edit functionality would be implemented here.",
      variant: "info",
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const removeComment = (comments: Comment[]): Comment[] => {
        return comments.filter(comment => {
          if (comment.id === commentId) {
            return false;
          }
          if (comment.replies) {
            comment.replies = removeComment(comment.replies);
          }
          return true;
        });
      };

      setComments(prev => removeComment(prev));
      
      toast({
        title: "Success",
        description: "Comment deleted successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReportComment = (commentId: string) => {
    toast({
      title: "Report Submitted",
      description: "Thank you for reporting this comment. We'll review it shortly.",
      variant: "info",
    });
  };

  const sortedComments = sortComments(comments, sortBy);
  const commentCount = comments.reduce((count, comment) => {
    return count + 1 + (comment.replies?.length || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Comments ({commentCount})
          </h3>
        </div>
        
        {comments.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        )}
      </div>

      {/* Comment Form */}
      <CommentForm
        articleId={articleId}
        currentUser={currentUser}
        onSubmit={handleSubmitComment}
        placeholder="Share your thoughts..."
      />

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <CommentSkeleton key={index} />
          ))
        ) : comments.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No comments yet
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          // Comments
          sortedComments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <CommentItem
                comment={comment}
                currentUserId={currentUser?.id}
                onReply={(commentId) => setReplyingTo(commentId)}
                onLike={handleLikeComment}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onReport={handleReportComment}
              />
              
              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="ml-11">
                  <CommentForm
                    articleId={articleId}
                    parentCommentId={comment.id}
                    currentUser={currentUser}
                    onSubmit={handleSubmitComment}
                    onCancel={() => setReplyingTo(null)}
                    placeholder={`Reply to ${comment.author.name}...`}
                    submitLabel="Post Reply"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}