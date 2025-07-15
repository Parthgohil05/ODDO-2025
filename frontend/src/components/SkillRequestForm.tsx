import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";
import { toast } from "sonner";

interface SkillRequestFormProps {
  onSubmit: (skillData: any) => void;
  onCancel: () => void;
  type: "offer" | "request";
}

export function SkillRequestForm({ onSubmit, onCancel, type }: SkillRequestFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");
  const [skills, setSkills] = useState<string[]>([]); // This will be the 'other' skill field
  const [newSkill, setNewSkill] = useState("");

  const categories = [
    "Programming", "Design", "Marketing", "Business", "Music", "Language", 
    "Cooking", "Fitness", "Photography", "Writing", "Data Science", "Other"
  ];

  const timeOptions = [
    "1-2 hours/week", "3-5 hours/week", "6-10 hours/week", "10+ hours/week", "Flexible"
  ];

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const queryClient = useQueryClient();

  const createSwapMutation = useMutation({
    mutationFn: async (swapData: any) => {
      const response = await api.post('/swaps', swapData);
      return response.data;
    },
    onSuccess: () => {
      toast.success(`${type === 'offer' ? 'Skill offer' : 'Skill request'} created successfully!`);
      queryClient.invalidateQueries({ queryKey: ['swaps'] }); // Invalidate swaps query to refetch latest data
      onCancel(); // Go back to previous view after success
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || `Failed to create ${type === 'offer' ? 'skill offer' : 'skill request'}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const skillData = {
      offeredSkill: type === 'offer' ? [title, ...skills] : skills, // Title is the main skill, others are additional
      requestedSkill: type === 'request' ? [title, ...skills] : skills, // Same logic for requested skill
      message: description,
      category, // Added
      timeCommitment, // Added
      // The backend needs 'targetUser' if it's a request to a specific user.
      // For now, we'll omit targetUser for general offers/requests.
      // This might need adjustment if we implement direct swap requests.
    };

    // Remove empty arrays if no skills are provided
    if (skillData.offeredSkill.length === 0) delete skillData.offeredSkill;
    if (skillData.requestedSkill.length === 0) delete skillData.requestedSkill;

    await createSwapMutation.mutateAsync(skillData);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-elegant animate-scale-in">
        <CardHeader>
          <CardTitle className="text-2xl">
            {type === "offer" ? "Offer a Skill" : "Request a Skill"}
          </CardTitle>
          <CardDescription>
            {type === "offer" 
              ? "Share your expertise with the community and find skills you want to learn in return"
              : "Describe the skill you want to learn and what you can offer in exchange"
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  {type === "offer" ? "Skill You're Offering" : "Skill You Want to Learn"}
                </Label>
                <Input
                  id="title"
                  placeholder={type === "offer" ? "e.g., React Development" : "e.g., Guitar Lessons"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="transition-all duration-300 focus:shadow-glow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="transition-all duration-300 focus:shadow-glow">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat.toLowerCase()}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder={type === "offer" 
                  ? "Describe your experience and what you can teach..."
                  : "Describe what you want to learn and your current level..."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="transition-all duration-300 focus:shadow-glow"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time Commitment</Label>
              <Select value={timeCommitment} onValueChange={setTimeCommitment} required>
                <SelectTrigger className="transition-all duration-300 focus:shadow-glow">
                  <SelectValue placeholder="How much time can you dedicate?" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>
                {type === "offer" ? "Skills You Want to Learn" : "Skills You Can Offer"}
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="pr-1">
                      {skill}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-destructive/20"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="hero" className="flex-1" disabled={createSwapMutation.isPending}>
                {createSwapMutation.isPending ? (
                  type === "offer" ? "Offering..." : "Requesting..."
                ) : (
                  type === "offer" ? "Offer Skill" : "Request Skill"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}