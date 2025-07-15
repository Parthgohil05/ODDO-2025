import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Users } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { toast } from "sonner"; // Use sonner for toast notifications

interface SwapRequest {
  _id: string;
  requester: string;
  offeredSkill: string[];
  requestedSkill: string[];
  category: string;
  timeCommitment: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message?: string;
  targetUser: string;
  createdAt: string;
  updatedAt: string;
}

interface SkillCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  timeCommitment: string;
  skillsWanted: string[];
  type: "offer" | "request";
  currentUserId: string; // Add currentUserId prop
}

export function SkillCard({
  id,
  title,
  description,
  category,
  user,
  timeCommitment,
  skillsWanted,
  type,
  currentUserId // Destructure currentUserId
}: SkillCardProps) {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

  const { data: swapRequests, isLoading: isLoadingSwaps } = useQuery<SwapRequest[]>({
    queryKey: ['swapRequests', authUser?._id, user._id], // Include both user IDs in query key
    queryFn: async () => {
      if (!authUser?._id) return [];
      const response = await api.get(`/swaps?requesterId=${authUser._id}&targetUserId=${user._id}`);
      return response.data;
    },
    enabled: !!authUser?._id, // Only run if authenticated user ID is available
  });

  const hasPendingSwap = swapRequests?.some(swap =>
    (swap.requester === authUser?._id && swap.targetUser === user._id && swap.status === 'pending') ||
    (swap.requester === user._id && swap.targetUser === authUser?._id && swap.status === 'pending')
  );

  const buttonText = hasPendingSwap ? "Request Pending" : "Connect";
  const isButtonDisabled = hasPendingSwap || isLoadingSwaps || !authUser?._id || authUser._id === user._id;

  const createSwapRequestMutation = useMutation({
    mutationFn: async (newSwapRequest: {
      offeredSkill: string[];
      requestedSkill: string[];
      message: string;
      targetUser: string;
      category: string;
      timeCommitment: string;
    }) => {
      const response = await api.post('/swaps', newSwapRequest);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refetch swap requests and update button state
      queryClient.invalidateQueries({ queryKey: ['swapRequests', authUser?._id, user._id] });
      toast.success('Swap request sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send swap request');
    },
  });

  const handleConnect = async () => {
    if (!authUser) {
      toast.error('You need to be logged in to send a swap request.');
      return;
    }

    const skillToOffer = authUser.skillsOffered && authUser.skillsOffered.length > 0 ? authUser.skillsOffered : ['Any Skill'];
    const skillToRequest = skillsWanted && skillsWanted.length > 0 ? skillsWanted : ['Any Skill'];

    console.log('Sending swap request to user ID:', user._id); // Add this line for debugging

    const newSwapRequest = {
      offeredSkill: skillToOffer,
      requestedSkill: skillToRequest,
      message: `I'm interested in swapping skills! I can offer ${skillToOffer.join(', ')} and I'm interested in learning ${skillToRequest.join(', ')}.`,
      targetUser: user._id,
      category: category, // Use the category from the skill card
      timeCommitment: timeCommitment, // Use the timeCommitment from the skill card
    };

    await createSwapRequestMutation.mutateAsync(newSwapRequest);
  };

  return (
    <Card className="hover:shadow-card transition-all duration-300 hover:-translate-y-1 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={type === "offer" ? "default" : "secondary"}>
                {type === "offer" ? "Offering" : "Requesting"}
              </Badge>
              <Badge variant="outline">{category}</Badge>
            </div>
            <CardTitle className="text-lg mb-2">{title}</CardTitle>
            <CardDescription className="text-sm line-clamp-2">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{user.name}</p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">★ {user.rating}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{timeCommitment}</span>
          </div>

          {skillsWanted.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                {type === "offer" ? "Wants to learn:" : "Has these skills:"}
              </p>
              <div className="flex flex-wrap gap-1">
                {skillsWanted.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {skillsWanted.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{skillsWanted.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button
            variant="gradient"
            size="sm"
            className="w-full"
            onClick={handleConnect}
            disabled={isButtonDisabled || createSwapRequestMutation.isPending}
          >
            {createSwapRequestMutation.isPending ? "Sending Request..." : buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}