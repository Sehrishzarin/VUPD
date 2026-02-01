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
  AlertCircle,
  Mail,
  IdCard,
  Phone,
  Award
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

// shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const InvigilatorRegister = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      cnic: "",
      email: "",
      password: "",
      preferredCenter: "",
      qualification: "",
      contact: "",
    },
  });

  const handleRegister = async (values) => {
    setIsLoading(true);
    setError("");
    
    try {
await register({
  name: values.name,
  cnic: values.cnic,
  email: values.email,
  password: values.password,
  preferredCenter: values.preferredCenter ? [values.preferredCenter] : [],
  qualification: values.qualification,
  role: "invigilator",
  contact: values.contact || ""
});
    
      setRegistrationSuccess(true);
      toast.success("Registration complete. Please wait for the admin to approve your account.");
    } catch (err) {
      const errorMsg = err.message || "Registration failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      form.reset();
      setIsLoading(false);
    }
  };

  const handleBackToRoleSelection = () => {
    navigate("/");
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="w-full h-screen flex flex-row">
          <div className="w-1/2 bg-blue-600 text-white flex items-center justify-center p-16 overflow-y-auto">
            <div className="max-w-md space-y-8 text-center">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20">
                  <Users className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold">Registration Successful!</h1>
              <p className="text-blue-100 text-lg">
                Your registration has been submitted successfully. Please wait for admin approval.
              </p>
            </div>
          </div>
          <div className="w-1/2 flex items-center justify-center p-12 overflow-y-auto bg-white">
            <div className="w-full max-w-md space-y-6">
              <div className="text-center space-y-4">
                  <CircularLogo />
                <h2 className="text-3xl font-bold text-gray-900">Registration Submitted</h2>
              </div>
              <Separator />
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Please wait for the admin to approve your account. You will be notified once your account is activated.
                </AlertDescription>
              </Alert>
                  <Button 
                    onClick={handleBackToRoleSelection}
                className="w-full"
                size="lg"
                  >
                    Back to Home
                  </Button>
              </div>
              </div>
            </div>
          </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
      <div className="w-full h-screen flex flex-row">
          {/* Left Side - Promotional Content */}
        <div className="w-1/2 bg-blue-600 text-white flex items-center justify-center p-16 overflow-y-auto">
          <div className="max-w-md space-y-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/20">
                <Users className="h-12 w-12 text-white" />
              </div>
            </div>
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">Become an Invigilator</h1>
              <p className="text-blue-100 text-lg">
                Join our team and help ensure fair and secure examinations. Flexible schedules and competitive compensation.
              </p>
            </div>
              
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <div>
                  <p className="font-semibold">Flexible Scheduling</p>
                  <p className="text-blue-100 text-sm">Choose duties that fit your availability</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <div>
                  <p className="font-semibold">Easy Payment</p>
                  <p className="text-blue-100 text-sm">Get paid quickly and securely</p>
                </div>
                  </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <div>
                  <p className="font-semibold">Mobile Friendly</p>
                  <p className="text-blue-100 text-sm">Manage everything from your phone</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Support Available</p>
                  <p className="text-blue-100 text-sm">24/7 support when you need help</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-4">
              <Star className="h-5 w-5 text-yellow-300" />
              <p className="text-sm">Join 5000+ Active Invigilators</p>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
        <div className="w-1/2 flex items-center justify-center p-12 overflow-y-auto bg-white">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
                <CircularLogo />
              <h2 className="text-3xl font-bold text-gray-900">Register as Invigilator</h2>
              <p className="text-gray-600 text-sm">Enter your credentials to register as an invigilator</p>
            </div>

            <Separator />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
                <FormField
                  control={form.control}
                name="name"
                  rules={{ required: "Please input your name!" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invigilator Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input placeholder="Invigilator name" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
  name="cnic"
                  rules={{
                    required: "Please input your CNIC!",
                    minLength: { value: 13, message: "CNIC must be 13 digits (without dashes)!" },
                    maxLength: { value: 13, message: "CNIC must be 13 digits (without dashes)!" }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNIC</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input placeholder="CNIC (e.g. 3520178901234)" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input type="email" placeholder="Invigilator email" className="pl-10" {...field} />
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
                    minLength: { value: 6, message: "Password must be at least 6 characters!" }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input type="password" placeholder="Password" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
  name="preferredCenter"
                  rules={{ required: "Please input your preferred center!" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Center</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input placeholder="Preferred Center (e.g. Center A)" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
  name="qualification"
                  rules={{ required: "Please input your qualification!" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input placeholder="Qualification (e.g. Masters in CS)" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
  name="contact"
                  rules={{
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: "Please enter a valid contact number!"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number (optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input placeholder="Contact Number" className="pl-10" {...field} />
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
                      Registering...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Register as Invigilator
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <Separator />

            <div className="space-y-3">
              <Link to="/invigilator/login" className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                 Already a user? Login here
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

export default InvigilatorRegister;
