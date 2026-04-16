import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, User, Loader2, LogOut, Heart, Phone, MapPin, Mail, Shield, Clock, Activity, AlertCircle, Save, Edit2, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logActivity } from "@/utils/analytics";

const Profile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    bloodGroup: "",
    gender: "",
    height: "",
    weight: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalConditions: "",
    medications: "",
    allergies: "",
    address: ""
  });

  const [originalProfile, setOriginalProfile] = useState(profile);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const profileData = {
        fullName: user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        age: user.user_metadata?.age || "",
        bloodGroup: user.user_metadata?.blood_group || "",
        gender: user.user_metadata?.gender || "",
        height: user.user_metadata?.height || "",
        weight: user.user_metadata?.weight || "",
        emergencyContact: user.user_metadata?.emergency_contact || "",
        emergencyPhone: user.user_metadata?.emergency_phone || "",
        medicalConditions: user.user_metadata?.medical_conditions || "",
        medications: user.user_metadata?.medications || "",
        allergies: user.user_metadata?.allergies || "",
        address: user.user_metadata?.address || ""
      };
      setProfile(profileData);
      setOriginalProfile(profileData);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.fullName,
          phone: profile.phone,
          age: profile.age,
          blood_group: profile.bloodGroup,
          gender: profile.gender,
          height: profile.height,
          weight: profile.weight,
          emergency_contact: profile.emergencyContact,
          emergency_phone: profile.emergencyPhone,
          medical_conditions: profile.medicalConditions,
          medications: profile.medications,
          allergies: profile.allergies,
          address: profile.address
        }
      });

      if (error) throw error;
      setOriginalProfile(profile);
      setIsEditing(false);
      toast.success("Profile updated successfully");
      // Log profile update to activity history
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        logActivity(currentUser.id, "Profile Updated", "/profile", "Completed", {
          fieldsUpdated: Object.keys(profile).filter(
            k => profile[k as keyof typeof profile] !== originalProfile[k as keyof typeof originalProfile]
          )
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  const calculateBMI = () => {
    if (profile.height && profile.weight) {
      const heightInMeters = parseInt(profile.height) / 100;
      const bmi = parseInt(profile.weight) / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = () => {
    const bmi = calculateBMI();
    if (!bmi) return null;
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return { category: "Underweight", color: "text-blue-600" };
    if (bmiNum < 25) return { category: "Normal", color: "text-green-600" };
    if (bmiNum < 30) return { category: "Overweight", color: "text-yellow-600" };
    return { category: "Obese", color: "text-red-600" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="container max-w-6xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Header Card */}
        <Card className="shadow-xl border-blue-200/50 overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
                    <User className="h-10 w-10" />
                  </div>
                  {isEditing && (
                    <button
                      title="Change profile photo"
                      aria-label="Change profile photo"
                      className="absolute bottom-0 right-0 rounded-full bg-white p-2 text-blue-600 hover:bg-gray-100"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div>
                  <CardTitle className="text-3xl font-display">{profile.fullName || "User Profile"}</CardTitle>
                  <CardDescription className="text-blue-100">
                    {profile.email}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleUpdate}
                      disabled={isLoading}
                      className="bg-white text-blue-600 hover:bg-gray-100"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={handleCancel}
                      variant="outline"
                      className="text-white border-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="shadow-lg border-blue-100/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="text-2xl font-bold text-blue-600">{profile.age || "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-red-100/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Blood Group</p>
                  <p className="text-2xl font-bold text-red-600">{profile.bloodGroup || "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-green-100/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="text-2xl font-bold text-green-600">{profile.weight ? `${profile.weight} kg` : "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-purple-100/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">Height</p>
                  <p className="text-2xl font-bold text-purple-600">{profile.height ? `${profile.height} cm` : "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-orange-100/50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">BMI</p>
                  <p className={`text-2xl font-bold ${getBMICategory()?.color || 'text-gray-600'}`}>
                    {calculateBMI() || "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs Section */}
        <Card className="shadow-xl border-blue-100/50">
          <CardContent className="pt-6">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="emergency">Emergency</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              {/* Personal Tab */}
              <TabsContent value="personal" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-base font-semibold">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      disabled={!isEditing}
                      placeholder="John Doe"
                      className="border-blue-200 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted border-gray-200"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="+1 (555) 123-4567"
                      className="border-blue-200 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-base font-semibold">Gender</Label>
                    <Input
                      id="gender"
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Male/Female/Other"
                      className="border-blue-200 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-base font-semibold">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                      disabled={!isEditing}
                      placeholder="25"
                      className="border-blue-200 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-base font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      disabled={!isEditing}
                      placeholder="123 Main St, City, State"
                      className="border-blue-200 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Medical Tab */}
              <TabsContent value="medical" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup" className="text-base font-semibold flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-600" />
                      Blood Group
                    </Label>
                    <Input
                      id="bloodGroup"
                      value={profile.bloodGroup}
                      onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                      disabled={!isEditing}
                      placeholder="A+"
                      className="border-blue-200 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-base font-semibold">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={profile.height}
                      onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                      disabled={!isEditing}
                      placeholder="170"
                      className="border-blue-200 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-base font-semibold">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={profile.weight}
                      onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                      disabled={!isEditing}
                      placeholder="70"
                      className="border-blue-200 focus:ring-blue-500"
                    />
                  </div>

                  {calculateBMI() && (
                    <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/20">
                      <CardContent className="pt-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">BMI</p>
                          <p className={`text-3xl font-bold ${getBMICategory()?.color}`}>
                            {calculateBMI()}
                          </p>
                          <p className={`text-sm font-medium ${getBMICategory()?.color}`}>
                            {getBMICategory()?.category}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="medicalConditions" className="text-base font-semibold">Medical Conditions</Label>
                    <Input
                      id="medicalConditions"
                      value={profile.medicalConditions}
                      onChange={(e) => setProfile({ ...profile, medicalConditions: e.target.value })}
                      disabled={!isEditing}
                      placeholder="e.g., Diabetes, Hypertension"
                      className="border-blue-200 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications" className="text-base font-semibold">Current Medications</Label>
                    <Input
                      id="medications"
                      value={profile.medications}
                      onChange={(e) => setProfile({ ...profile, medications: e.target.value })}
                      disabled={!isEditing}
                      placeholder="e.g., Aspirin, Insulin"
                      className="border-blue-200 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="allergies" className="text-base font-semibold">Allergies</Label>
                    <Input
                      id="allergies"
                      value={profile.allergies}
                      onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                      disabled={!isEditing}
                      placeholder="e.g., Penicillin, Peanuts"
                      className="border-blue-200 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Emergency Tab */}
              <TabsContent value="emergency" className="space-y-6">
                <Alert className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    Emergency contacts will be visible to healthcare providers in case of emergency.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="text-base font-semibold">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      value={profile.emergencyContact}
                      onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Jane Doe"
                      className="border-orange-200 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone" className="text-base font-semibold flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Emergency Phone
                    </Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={profile.emergencyPhone}
                      onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="+1 (555) 987-6543"
                      className="border-orange-200 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5 text-green-600" />
                        Account Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold mb-2">Last Password Change</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Not set - Consider changing your password regularly
                        </p>
                      </div>
                      <Button className="w-full">Change Password</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="h-5 w-5 text-blue-600" />
                        Two-Factor Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add an extra layer of security to your account
                      </p>
                      <Button variant="outline" className="w-full">Enable 2FA</Button>
                    </CardContent>
                  </Card>

                  <Button 
                    variant="destructive"
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Alert */}
        {!isEditing && (
          <Alert className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Your Privacy:</strong> Your health information is encrypted and stored securely. Only you and medical professionals you authorize can access this data.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default Profile;
