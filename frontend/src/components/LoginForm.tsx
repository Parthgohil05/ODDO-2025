import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, ArrowLeft, Plus, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Define validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  skillsOffered: z.array(z.string()).optional(),
  skillsWanted: z.array(z.string()).optional(),
  bio: z.string().optional(),
  profilePicture: z.string().optional(),
  contactInfo: z.string().optional(),
  location: z.string().optional(),
  availability: z.string().optional(),
  isPublic: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface FormInputs {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  skillsOffered?: string[];
  skillsWanted?: string[];
  bio?: string;
  profilePicture?: string;
  contactInfo?: string;
  location?: string;
  availability?: string;
  isPublic?: boolean;
}

interface LoginFormProps {
  onBack: () => void;
}

export function LoginForm({ onBack }: LoginFormProps) {
  const { login, register, isLoading, isAuthenticated } = useAuth(); // Use useAuth hook
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');

  const formSchema = isSignUp ? signUpSchema : loginSchema;
  const { register: formRegister, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skillsOffered: [],
      skillsWanted: [],
      isPublic: true,
    }
  });

  const passwordValue = watch("password"); // Watch password for confirmPassword validation
  const skillsOffered = watch("skillsOffered") || [];
  const skillsWanted = watch("skillsWanted") || [];

  const addSkill = (type: 'offered' | 'wanted') => {
    if (type === 'offered' && newSkillOffered.trim()) {
      const currentSkills = getValues('skillsOffered') || [];
      if (!currentSkills.includes(newSkillOffered.trim())) {
        setValue('skillsOffered', [...currentSkills, newSkillOffered.trim()]);
        setNewSkillOffered('');
      }
    } else if (type === 'wanted' && newSkillWanted.trim()) {
      const currentSkills = getValues('skillsWanted') || [];
      if (!currentSkills.includes(newSkillWanted.trim())) {
        setValue('skillsWanted', [...currentSkills, newSkillWanted.trim()]);
        setNewSkillWanted('');
      }
    }
  };

  const removeSkill = (type: 'offered' | 'wanted', skillToRemove: string) => {
    if (type === 'offered') {
      setValue('skillsOffered', (getValues('skillsOffered') || []).filter(skill => skill !== skillToRemove));
    } else if (type === 'wanted') {
      setValue('skillsWanted', (getValues('skillsWanted') || []).filter(skill => skill !== skillToRemove));
    }
  };

  const onSubmit = async (data: FormInputs) => {
    try {
      if (isSignUp) {
        await register(data); // Call register from AuthContext
      } else {
        await login(data.email, data.password); // Call login from AuthContext
      }
      // If successful, AuthContext's onSuccess will handle toast and user state
      if (isAuthenticated) {
        navigate("/"); // Navigate to home after successful auth
      }
    } catch (error) {
      // Errors are handled by AuthContext via sonner toast
    }
  };

  // Redirect if already authenticated and trying to access login/signup
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate("/");
  //   }
  // }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg animate-scale-in">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Skill Swap Platform
            </h1>
            <div className="w-10" /> {/* Spacer for center alignment */}
          </div>
          <CardTitle className="text-xl">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Join our community of skill sharers" 
              : "Sign in to continue your learning journey"
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    {...formRegister('name')}
                  />
                  {errors.name?.message && (
                    <p className="text-sm text-destructive">{String(errors.name.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    {...formRegister('bio')}
                    rows={3}
                  />
                  {errors.bio?.message && (
                    <p className="text-sm text-destructive">{String(errors.bio.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Profile Picture URL</Label>
                  <Input
                    id="profilePicture"
                    type="url"
                    placeholder="e.g., https://example.com/your-image.jpg"
                    {...formRegister('profilePicture')}
                  />
                  {errors.profilePicture?.message && (
                    <p className="text-sm text-destructive">{String(errors.profilePicture.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Contact Info (e.g., Phone, Social Media)</Label>
                  <Input
                    id="contactInfo"
                    type="text"
                    placeholder="How can others contact you?"
                    {...formRegister('contactInfo')}
                  />
                  {errors.contactInfo?.message && (
                    <p className="text-sm text-destructive">{String(errors.contactInfo.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Your city or region"
                    {...formRegister('location')}
                  />
                  {errors.location?.message && (
                    <p className="text-sm text-destructive">{String(errors.location.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    type="text"
                    placeholder="e.g., Weekends, Evenings"
                    {...formRegister('availability')}
                  />
                  {errors.availability?.message && (
                    <p className="text-sm text-destructive">{String(errors.availability.message)}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Input
                    id="isPublic"
                    type="checkbox"
                    className="h-4 w-4 rounded"
                    {...formRegister('isPublic')}
                  />
                  <Label htmlFor="isPublic">Make Profile Public</Label>
                  {errors.isPublic?.message && (
                    <p className="text-sm text-destructive">{String(errors.isPublic.message)}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Skills You Can Offer</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill you can teach"
                      value={newSkillOffered}
                      onChange={(e) => setNewSkillOffered(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill('offered'))}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={() => addSkill('offered')}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {skillsOffered.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skillsOffered.map((skill, index) => (
                        <Badge key={index} variant="default" className="pr-1">
                          {skill}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 hover:bg-destructive/20"
                            onClick={() => removeSkill('offered', skill)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Skills You Want to Learn</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill you want to learn"
                      value={newSkillWanted}
                      onChange={(e) => setNewSkillWanted(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill('wanted'))}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={() => addSkill('wanted')}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {skillsWanted.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skillsWanted.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="pr-1">
                          {skill}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 ml-1 hover:bg-destructive/20"
                            onClick={() => removeSkill('wanted', skill)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...formRegister('email')}
              />
              {errors.email?.message && (
                <p className="text-sm text-destructive">{String(errors.email.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  {...formRegister('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password?.message && (
                <p className="text-sm text-destructive">{String(errors.password.message)}</p>
              )}
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...formRegister('confirmPassword')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword?.message && (
                  <p className="text-sm text-destructive">{String(errors.confirmPassword.message)}</p>
                )}
              </div>
            )}

            {!isSignUp && (
              <div className="text-right">
                <Button variant="link" size="sm" className="p-0 h-auto text-sm">
                  Forgot password?
                </Button>
              </div>
            )}

            <Button 
              type="submit" 
              variant="hero" 
              size="lg" 
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? (isSignUp ? "Creating..." : "Signing In...") : (isSignUp ? "Create Account" : "Sign In")}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={isLoading}
          >
            {isSignUp ? "Sign In Instead" : "Create Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}