"use client";

import { useState } from "react";
import { registerUser } from '@/actions/auth-actions';
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Eye, EyeOff, User, Mail, Lock, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

 const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!username || !email || !password || !confirmPassword) {
    toast.error('Please fill in all fields');
    return;
  }

  if (password !== confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }

  if (password.length < 6) {
    toast.error('Password must be at least 6 characters');
    return;
  }

  setIsLoading(true);

  const result = await registerUser({
    username,
    email,
    password,
  });

  if (!result.success) {
    toast.error(result.error || 'Registration failed');
    setIsLoading(false);
    return;
  }

  toast.success('Registration successful! Please login.');

  setTimeout(() => {
    router.push('/login');
  }, 1000);

  setIsLoading(false);
};

  return (
    <main className="h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-card h-[90vh] overflow-y-auto scrollbar-none">
        <CardHeader className="space-y-2 text-center py-6">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2">
            <UserPlus className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Create an account
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Join our commerce platform and start shopping
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister}>
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="username" className="text-sm font-medium">
                  Username
                </FieldLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="johndoe"
                    className="pl-9 h-11"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium">
                  Email
                </FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="hello@example.com"
                    className="pl-9 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="password" className="text-sm font-medium">
                  Password
                </FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-10 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-10 h-11"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </Field>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  "Create account"
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center pt-2 pb-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-secondary hover:text-secondary/80 font-medium transition-colors">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
      <Toaster/>
    </main>
  );
}