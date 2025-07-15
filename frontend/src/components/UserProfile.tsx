import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Star, Clock, Award, Plus, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext"; // Assuming AuthContext provides user
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
  skillsOffered?: string[];
  skillsWanted?: string[];
  bio?: string;
  profilePicture?: string;
  contactInfo?: string;
  location?: string;
  availability?: string;
  isPublic?: boolean;
  role?: 'user' | 'admin';
}

interface UserProfileProps {
  onBack: () => void;
  currentUser: User | null; // Add currentUser prop
}

export function UserProfile({ onBack, currentUser }: UserProfileProps) {
  const { user: authUser, logout, updateUser } = useAuth(); // Use authUser to distinguish from currentUser prop
  const queryClient = useQueryClient();

  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [availability, setAvailability] = useState(currentUser?.availability || '');
  const [isPublic, setIsPublic] = useState(currentUser?.isPublic ?? true);
  const [skillsOffered, setSkillsOffered] = useState<string[]>(currentUser?.skillsOffered || []);
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [skillsWanted, setSkillsWanted] = useState<string[]>(currentUser?.skillsWanted || []);
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [profilePicture, setProfilePicture] = useState(currentUser?.profilePicture || ''); // Added
  const [contactInfo, setContactInfo] = useState(currentUser?.contactInfo || ''); // Added

  const userStats = {
    skillsOffered: currentUser?.skillsOffered?.length || 0,
    skillsLearned: currentUser?.skillsWanted?.length || 0, // Placeholder, actual learned skills would come from completed swaps
    rating: 0, // Placeholder, fetch from backend if available
    completedSwaps: 0 // Placeholder, fetch from backend if available
  };

  // Mutation for updating user profile
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: Partial<User>) => {
      const response = await api.put(`/users/profile/${currentUser?._id}`, updatedData); // Use currentUser._id
      return response.data;
    },
    onSuccess: (data) => {
      // Update localStorage and AuthContext's user state manually
      updateUser(data); // Update the user in AuthContext
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['users'] }); // To update other user listings
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleSaveProfile = async () => {
    const updatedData = {
      name,
      email,
      location,
      bio,
      availability,
      isPublic,
      skillsOffered,
      skillsWanted,
      profilePicture, // Added
      contactInfo, // Added
    };
    await updateProfileMutation.mutateAsync(updatedData);
  };

  const addSkill = (type: 'offered' | 'wanted') => {
    if (type === 'offered' && newSkillOffered.trim()) {
      console.log('Attempting to add offered skill:', newSkillOffered.trim());
      setSkillsOffered(prevSkills => {
        const updatedSkills = [...prevSkills, newSkillOffered.trim()];
        console.log('Skills offered after update:', updatedSkills);
        return updatedSkills;
      });
      setNewSkillOffered('');
    } else if (type === 'wanted' && newSkillWanted.trim()) {
      console.log('Attempting to add wanted skill:', newSkillWanted.trim());
      setSkillsWanted(prevSkills => {
        const updatedSkills = [...prevSkills, newSkillWanted.trim()];
        console.log('Skills wanted after update:', updatedSkills);
        return updatedSkills;
      });
      setNewSkillWanted('');
    }
  };

  const removeSkill = (type: 'offered' | 'wanted', skillToRemove: string) => {
    if (type === 'offered') {
      setSkillsOffered(skillsOffered.filter(skill => skill !== skillToRemove));
    } else if (type === 'wanted') {
      setSkillsWanted(skillsWanted.filter(skill => skill !== skillToRemove));
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Profile
          </h1>
        </div>

        {/* Profile Card */}
        <Card className="shadow-lg animate-fade-in">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentUser?.profilePicture || "/api/placeholder/80/80"} />
                  <AvatarFallback className="text-xl">{currentUser?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{currentUser?.name || 'User'}</CardTitle>
                  <CardDescription className="text-base">
                    {currentUser?.bio || 'No bio available'}
                  </CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{userStats.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({userStats.completedSwaps} swaps completed)
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing && (
                  <Button variant="secondary" size="sm" onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                </div>
                <div>
                  <Label htmlFor="profilePicture">Profile Picture URL</Label>
                  <Input id="profilePicture" value={profilePicture} onChange={(e) => setProfilePicture(e.target.value)} placeholder="https://example.com/your-image.jpg" />
                </div>
                <div>
                  <Label htmlFor="contactInfo">Contact Info</Label>
                  <Input id="contactInfo" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="e.g., +1234567890" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
                </div>
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Input id="availability" value={availability} onChange={(e) => setAvailability(e.target.value)} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label htmlFor="isPublic">Public Profile</Label>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-base font-medium">Email: <span className="text-muted-foreground">{currentUser?.email || 'N/A'}</span></p>
                <p className="text-base font-medium">Contact Info: <span className="text-muted-foreground">{currentUser?.contactInfo || 'N/A'}</span></p>
                <p className="text-base font-medium">Location: <span className="text-muted-foreground">{currentUser?.location || 'N/A'}</span></p>
                <p className="text-base font-medium">Availability: <span className="text-muted-foreground">{currentUser?.availability || 'N/A'}</span></p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Profile Visibility: </span>
                  <Badge variant={currentUser?.isPublic ? "default" : "secondary"}>
                    {currentUser?.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center p-4 shadow-lg transition-all duration-300">
            <div className="text-2xl font-bold text-primary">{userStats.skillsOffered}</div>
            <div className="text-sm text-muted-foreground">Skills Offered</div>
          </Card>
          <Card className="text-center p-4 shadow-lg transition-all duration-300">
            <div className="text-2xl font-bold text-accent">{userStats.skillsLearned}</div>
            <div className="text-sm text-muted-foreground">Skills Learning</div>
          </Card>
          <Card className="text-center p-4 shadow-lg transition-all duration-300">
            <div className="text-2xl font-bold text-yellow-600">{userStats.rating}</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </Card>
          <Card className="text-center p-4 shadow-lg transition-all duration-300">
            <div className="text-2xl font-bold text-green-600">{userStats.completedSwaps}</div>
            <div className="text-sm text-muted-foreground">Completed Swaps</div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="skills" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="skills">My Skills</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-primary">Skills I'm Offering</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="New skill to offer"
                          value={newSkillOffered}
                          onChange={(e) => setNewSkillOffered(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill('offered');
                            }
                          }}
                        />
                        <Button onClick={() => addSkill('offered')} size="icon"><Plus className="h-4 w-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skillsOffered.map((skill, index) => (
                          <Badge key={index} variant="default" className="cursor-pointer" onClick={() => removeSkill('offered', skill)}>
                            {skill} <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {skillsOffered.length > 0 ? (
                        skillsOffered.map((skill, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                            <span className="font-medium">{skill}</span>
                            <Badge variant="default">Active</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No skills offered yet.</p>
                      )}
                    </div>
                  )}
                  <Button variant="outline" className="w-full mt-4" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Done' : 'Edit Skills'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-accent">Skills I'm Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="New skill to learn"
                          value={newSkillWanted}
                          onChange={(e) => setNewSkillWanted(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkill('wanted');
                            }
                          }}
                        />
                        <Button onClick={() => addSkill('wanted')} size="icon"><Plus className="h-4 w-4" /></Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {skillsWanted.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill('wanted', skill)}>
                            {skill} <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {skillsWanted.length > 0 ? (
                        skillsWanted.map((skill, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-accent/10">
                            <span className="font-medium">{skill}</span>
                            <Badge variant="secondary">Learning</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No skills wanted yet.</p>
                      )}
                    </div>
                  )}
                  <Button variant="outline" className="w-full mt-4" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Done' : 'Edit Skills'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Replace with real activity data fetched from backend */}
                  <p className="text-muted-foreground text-center py-4">No recent activity to display.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="shadow-lg">
                <CardContent className="p-6 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                  <h3 className="font-semibold mb-2">Skill Master</h3>
                  <p className="text-sm text-muted-foreground">Completed 10+ skill swaps</p>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardContent className="p-6 text-center">
                  <Star className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold mb-2">Top Rated</h3>
                  <p className="text-sm text-muted-foreground">Maintained 4.5+ rating</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}