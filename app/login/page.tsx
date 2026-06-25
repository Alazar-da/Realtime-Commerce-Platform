"use client";

import { useState } from "react";
import { loginUser } from '@/actions/auth-actions';
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
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";


export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  


const getRedirectPath = (role?: string) => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";

    case "customer":
      return "/";

    default:
      return "/";
  }
};

const handleLogin = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  if (!email || !password) {
    toast.error("Please fill in all fields");
    return;
  }

  setIsLoading(true);

  const result = await loginUser({
    email,
    password,
  });

  if (!result.success) {
    toast.error(result.error || "Login failed");
    setIsLoading(false);
    return;
  }
  

  toast.success("Welcome back!");

  setTimeout(() => {
    const redirectPath = getRedirectPath(result.user?.role);
    router.push(redirectPath);
  }, 1000);

  setIsLoading(false);
};

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md border-0 shadow-xl bg-card">
        <CardHeader className="space-y-2 text-center py-4">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2">
            <LogIn className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Welcome back
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup className="space-y-4">
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

              <div className="flex justify-end">
                <a
                  href="/forgot-password"
                  className="text-sm text-secondary hover:text-secondary/80 font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center pt-2 pb-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="/register" className="text-secondary hover:text-secondary/80 font-medium transition-colors">
              Create an account
            </a>
          </p>
        </CardFooter>
      </Card>
      <Toaster/>
    </main>
  );
}