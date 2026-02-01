import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  Lock,
  Upload,
  Save
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiDatePicker } from "@/components/ui/multi-date-picker";

const timeSlots = [
  { value: "morning", label: "Morning (09:00-12:00)" },
  { value: "afternoon", label: "Afternoon (13:00-16:00)" },
  { value: "evening", label: "Evening (17:00-20:00)" },
  { value: "full-day", label: "Full Day (09:00-17:00)" }
];

const centers = ["Center A", "Center B", "Center C", "Center D", "Center E"];

const ProfileSettings = () => {
  const { getProfile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      qualification: "",
      preferredCenter: [],
      unavailableDates: [],
      contact: "",
      timeSlot: "",
      password: "",
    },
  });

  useEffect(() => {
    getProfile().then((data) => {
      form.reset({
        name: data.name || "",
        email: data.email || "",
        qualification: data.qualification || "",
        preferredCenter: data.preferredCenter || [],
        unavailableDates: data.unavailableDates ? data.unavailableDates.map((d) => new Date(d)) : [],
        contact: data.contact || "",
        timeSlot: data.timeSlot || "",
        password: "",
      });

      if (data.avatar) {
        setAvatarUrl(data.avatar);
      }
    });
  }, [getProfile, form]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        toast.error("You can only upload image files!");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await updateProfile({
        ...values,
        unavailableDates: values.unavailableDates 
          ? JSON.stringify(values.unavailableDates.map((d) => {
              const date = d instanceof Date ? d : new Date(d);
              return date.toISOString().split('T')[0];
            }))
          : "[]",
        avatar: avatarFile || null
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-gray-600 mt-1">Manage your personal information and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl} alt="Profile" />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload">
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </span>
                    </Button>
                  </label>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Full name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input placeholder="Full name" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ required: "Email is required", type: "email" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input type="email" placeholder="Email" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input placeholder="Contact number" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input type="password" placeholder="New password" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualification</FormLabel>
                    <FormControl>
                      <Input placeholder="Qualifications" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredCenter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Centers</FormLabel>
                    <div className="space-y-2">
                      {centers.map((center) => (
                        <div key={center} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(center)}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              if (checked) {
                                field.onChange([...currentValue, center]);
                              } else {
                                field.onChange(currentValue.filter((c) => c !== center));
                              }
                            }}
                          />
                          <Label className="font-normal cursor-pointer" onClick={() => {
                            const currentValue = field.value || [];
                            if (currentValue.includes(center)) {
                              field.onChange(currentValue.filter((c) => c !== center));
                            } else {
                              field.onChange([...currentValue, center]);
                            }
                          }}>
                            {center}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time Slot</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map(slot => (
                          <SelectItem key={slot.value} value={slot.value}>{slot.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unavailableDates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unavailable Dates</FormLabel>
                    <FormControl>
                      <MultiDatePicker
                        dates={field.value || []}
                        onSelect={field.onChange}
                        maxTagCount="responsive"
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500 mt-1">Select dates you are NOT available</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="flex justify-end">
                <Button type="submit" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
