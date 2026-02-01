import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { 
  User, 
  Lock, 
  LogIn,
  Users,
  CheckCircle2,
  Star,
  AlertCircle
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const CircularLogo = () => {
  return (
    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20">
      <Users className="h-10 w-10 text-white" />
    </div>
  );
};

const SuperintendentLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (values) => {
    setIsLoading(true);
    setError("");
    
    try {
      await login(values.email, values.password);
    } catch (err) {
      const errorMsg = err.message || "Login failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRoleSelection = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
      <div className="w-full h-screen flex flex-row">
        {/* Left Side - Promotional Content */}
        <div className="w-1/2 bg-purple-600 text-white flex items-center justify-center p-16 overflow-y-auto">
          <div className="max-w-md space-y-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20">
                <Users className="h-12 w-12 text-white" />
              </div>
            </div>
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">Superintendent Portal</h1>
              <p className="text-purple-100 text-lg">
                Manage examination centers, generate reports, and oversee invigilator activities.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Center Management</p>
                  <p className="text-purple-100 text-sm">Manage multiple examination centers</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Comprehensive Reports</p>
                  <p className="text-purple-100 text-sm">Generate detailed attendance reports</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Invigilator Oversight</p>
                  <p className="text-purple-100 text-sm">Monitor and manage invigilator activities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Secure & Reliable</p>
                  <p className="text-purple-100 text-sm">Enterprise-grade security and reliability</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-4">
              <Star className="h-5 w-5 text-yellow-300" />
              <p className="text-sm">Trusted by 1000+ Superintendents</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-1/2 flex items-center justify-center p-12 overflow-y-auto bg-white">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-4">
              <CircularLogo />
              <h2 className="text-3xl font-bold text-gray-900">Superintendent</h2>
            </div>

            <Separator />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: "Please input your email!",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email!"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="Email address" 
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  rules={{
                    required: "Please input your password!",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters!"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input 
                            type="password"
                            placeholder="Password" 
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LogIn className="h-4 w-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Login as Superintendent
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <Separator />

            <div className="space-y-3">
              <Link to="/superintendent/register" className="block text-center text-purple-600 hover:text-purple-700 text-sm font-medium">
                Don't have an account? Register here
              </Link>
              <Button 
                variant="link" 
                className="w-full" 
                onClick={handleBackToRoleSelection}
              >
                Back to role selection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperintendentLogin;
