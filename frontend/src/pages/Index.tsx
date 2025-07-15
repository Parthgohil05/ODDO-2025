import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User, LogOut } from "lucide-react";
import { SkillCard } from "@/components/SkillCard";
import { LoginForm } from "@/components/LoginForm";
import { SkillRequestForm } from "@/components/SkillRequestForm";
import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate and Link
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import api from "../lib/api"; // Import api utility

type View = "home" | "login" | "profile" | "offer-skill" | "request-skill";

const Index = () => {
  const { user, isAuthenticated, logout } = useAuth(); // Use useAuth hook
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>(isAuthenticated ? "home" : "login");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (!isAuthenticated && currentView !== "login") {
      setCurrentView("login");
    } else if (isAuthenticated && currentView === "login") {
      setCurrentView("home");
    }
  }, [isAuthenticated, currentView]);

  // Fetch users from backend
  const { data: users, isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  console.log('Fetched Users:', users);

  // Fetch swap requests from backend
  const { data: swapRequests, isLoading: isLoadingSwaps, error: swapsError } = useQuery({
    queryKey: ['swaps'],
    queryFn: async () => {
      const response = await api.get('/swaps');
      return response.data;
    },
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  console.log('Fetched Swap Requests:', swapRequests);

  const skillCards = [];

  // Process offered skills from users (individual skills)
  if (users) {
    users.forEach((u: any) => {
      if (u.skillsOffered && Array.isArray(u.skillsOffered)) {
        u.skillsOffered.forEach((skill: string) => {
          skillCards.push({
            id: `${u._id}-${skill}-offer`,
            title: skill,
            description: u.bio || 'No description available.',
            category: "Programming", // Placeholder, will refine if categories are in user model
            user: { _id: u._id, name: u.name, avatar: u.profilePicture, rating: 0 }, // Added _id
            timeCommitment: u.availability || "Flexible",
            skillsWanted: u.skillsWanted || [], // Skills wanted by the user offering
            type: "offer" as const,
            currentUserId: user?._id || "", // Pass current user ID
          });
        });
      }
    });
  }

  // Process swap requests (offers and requests from SwapRequest model)
  if (swapRequests) {
    swapRequests.forEach((swap: any) => {
      // For skill offers (where requester is offering a skill)
      if (swap.offeredSkill && swap.offeredSkill.length > 0) {
        swap.offeredSkill.forEach((skill: string) => {
          skillCards.push({
            id: `${swap._id}-${skill}-swap-offer`,
            title: skill,
            description: swap.message || 'No specific message.',
            category: swap.category || "Other", // Use swap.category
            user: { _id: swap.requester?._id || '', name: swap.requester?.name || 'N/A', avatar: swap.requester?.profilePicture || '/api/placeholder/80/80', rating: 0 }, // Added _id
            timeCommitment: swap.timeCommitment || "Flexible", // Use swap.timeCommitment
            skillsWanted: swap.requestedSkill || [], // Skills wanted by the requester
            type: "offer" as const,
            currentUserId: user?._id || "", // Pass current user ID
          });
        });
      }

      // For skill requests (where requester is requesting a skill)
      if (swap.requestedSkill && swap.requestedSkill.length > 0) {
        swap.requestedSkill.forEach((skill: string) => {
          skillCards.push({
            id: `${swap._id}-${skill}-swap-request`,
            title: skill,
            description: swap.message || 'No specific message.',
            category: swap.category || "Other", // Use swap.category
            user: { _id: swap.requester?._id || '', name: swap.requester?.name || 'N/A', avatar: swap.requester?.profilePicture || '/api/placeholder/80/80', rating: 0 }, // Added _id
            timeCommitment: swap.timeCommitment || "Flexible", // Use swap.timeCommitment
            skillsWanted: swap.offeredSkill || [], // Skills offered by the requester
            type: "request" as const,
            currentUserId: user?._id || "", // Pass current user ID
          });
        });
      }
    });
  }

  const categories = ["All", "Programming", "Design", "Marketing", "Business", "Music", "Language", "Cooking", "Fitness", "Photography", "Writing", "Data Science", "Other"]; // Updated categories to match form

  const filteredCards = skillCards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (card.description && card.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || selectedCategory === "All" || 
                           card.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // const handleLogin = (email: string, password: string) => {
  //   setIsLoggedIn(true);
  //   setCurrentView("home");
  // };

  const handleLogout = () => {
    logout(); // Use logout from AuthContext
    // setCurrentView("login"); // No need, useEffect handles it
  };

  const handleSkillSubmit = (skillData: any) => {
    // No longer need to handle console.log or setCurrentView directly here
    // The useMutation in SkillRequestForm will handle toast and navigation
  };

  // Render different views
  if (currentView === "login") {
    return <LoginForm onBack={() => setCurrentView("home")} />;
  }

  if (currentView === "profile" && isAuthenticated) {
    return <UserProfile onBack={() => setCurrentView("home")} currentUser={user} />;
  }

  if (currentView === "offer-skill" && isAuthenticated) {
    return (
      <SkillRequestForm
        type="offer"
        onSubmit={handleSkillSubmit} // onSubmit now triggers invalidateQueries in SkillRequestForm
        onCancel={() => setCurrentView("home")}
      />
    );
  }

  if (currentView === "request-skill" && isAuthenticated) {
    return (
      <SkillRequestForm
        type="request"
        onSubmit={handleSkillSubmit} // onSubmit now triggers invalidateQueries in SkillRequestForm
        onCancel={() => setCurrentView("home")}
      />
    );
  }

  // Main home view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm shadow-card sticky top-0 z-50 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                Skill Swap Platform
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setCurrentView("profile")}>
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button variant="gradient" onClick={() => setCurrentView("login")}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center animate-slide-up">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Learn. Teach. Grow Together.
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with people who want to learn what you know, and learn what they know. 
            Exchange skills, build relationships, and grow your expertise.
          </p>
          
          {isAuthenticated ? (
            <div className="flex gap-4 justify-center">
              <Button variant="hero" size="xl" onClick={() => setCurrentView("offer-skill")}>
                <Plus className="h-5 w-5" />
                Offer a Skill
              </Button>
              <Button variant="accent" size="xl" onClick={() => setCurrentView("request-skill")}>
                <Search className="h-5 w-5" />
                Request a Skill
              </Button>
            </div>
          ) : (
            <Button variant="hero" size="xl" onClick={() => setCurrentView("login")}>
              Get Started
            </Button>
          )}
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="px-4 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="transition-all duration-300 focus:shadow-glow"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {categories.slice(1).map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => setSelectedCategory(selectedCategory === category ? "" : category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingUsers || isLoadingSwaps ? (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                Loading skills...
              </div>
            ) : usersError || swapsError ? (
              <div className="col-span-full text-center py-20 text-destructive">
                Error loading skills: {usersError?.message || swapsError?.message}
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-xl text-muted-foreground mb-4">
                  No skills found matching your criteria
                </p>
                <p className="text-muted-foreground">
                  Try adjusting your search or browse all categories
                </p>
              </div>
            ) : (
              filteredCards.map((card, index) => (
                <div key={card.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <SkillCard {...card} />
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
