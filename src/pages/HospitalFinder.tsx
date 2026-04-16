import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Phone, Navigation, Clock, ExternalLink, Star, ChevronDown, ChevronUp, Calendar, User, Stethoscope, AlertCircle, CheckCircle, LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/utils/analytics";
import { useRef } from "react";

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    amenity?: string;
    name?: string;
    healthcare?: string;
    [key: string]: string | undefined;
  };
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: string;
  timeSlots: Record<string, string[]>;
}

interface OpeningHours {
  [day: string]: {
    open: string;
    close: string;
    available: boolean;
  };
}

interface Hospital {
  id: string | number;
  name: string;
  lat: number;
  lon: number;
  distance: string;
  type: string;
  address?: string;
  phone?: string;
  specialty?: string;
  hours?: string;
  rating?: string;
  emergency?: boolean;
  openingHours?: OpeningHours;
  doctors?: Doctor[];
}


const HospitalFinder = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapProvider, setMapProvider] = useState<string>("openstreetmap");
  const [expandedHospital, setExpandedHospital] = useState<string | number | null>(null);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    
    if (suggestionTimeout.current) {
      clearTimeout(suggestionTimeout.current);
    }
    
    if (value.trim().length > 2) {
      suggestionTimeout.current = setTimeout(async () => {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=in&limit=5`, {
            headers: {
              "Accept-Language": "en-US,en;q=0.9",
              "User-Agent": "KeenCare-Bot/1.0"
            }
          });
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Autocomplete error:", error);
        }
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setLocation(suggestion.display_name);
    setShowSuggestions(false);
    fetchFacilitiesByCoords(suggestion.lat, suggestion.lon, suggestion.display_name);
  };

  // Sample data for fallback with enhanced doctor and hours info
  const sampleHospitals = [
    {
      id: 1,
      name: "Prime Cardiac Hospital",
      address: "123 Heart Care Avenue, Medical District",
      phone: "+1-555-0123",
      distance: "1.8 km",
      type: "Specialty Hospital",
      specialty: "Cardiology & Heart Surgery",
      hours: "24/7",
      rating: "4.9",
      emergency: true,
      lat: 40.7128,
      lon: -74.0060,
      openingHours: {
        Monday: { open: "00:00", close: "23:59", available: true },
        Tuesday: { open: "00:00", close: "23:59", available: true },
        Wednesday: { open: "00:00", close: "23:59", available: true },
        Thursday: { open: "00:00", close: "23:59", available: true },
        Friday: { open: "00:00", close: "23:59", available: true },
        Saturday: { open: "00:00", close: "23:59", available: true },
        Sunday: { open: "00:00", close: "23:59", available: true }
      },
      doctors: [
        {
          id: "d1",
          name: "Dr. James Peterson",
          specialty: "Interventional Cardiologist",
          experience: "15 years",
          rating: "4.9",
          timeSlots: {
            Monday: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"],
            Wednesday: ["09:00", "10:30", "13:00", "14:00", "15:30"],
            Friday: ["10:00", "11:00", "14:00", "15:00", "16:00"]
          }
        },
        {
          id: "d2",
          name: "Dr. Patricia Williams",
          specialty: "Cardiac Surgeon",
          experience: "18 years",
          rating: "4.8",
          timeSlots: {
            Tuesday: ["08:30", "10:00", "11:30", "13:00", "14:30"],
            Thursday: ["09:00", "11:00", "13:00", "15:00"],
            Saturday: ["10:00", "11:30", "12:30"]
          }
        },
        {
          id: "d3",
          name: "Dr. David Martinez",
          specialty: "Echocardiographist",
          experience: "10 years",
          rating: "4.7",
          timeSlots: {
            Monday: ["08:00", "09:30", "11:00", "14:00", "15:30", "17:00"],
            Wednesday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
            Friday: ["08:30", "10:00", "11:30", "14:30", "16:00"]
          }
        }
      ]
    },
    {
      id: 2,
      name: "Advanced Orthopedic Center",
      address: "456 Joint Care Boulevard, Healthcare Park",
      phone: "+1-555-0124",
      distance: "2.5 km",
      type: "Specialty Hospital",
      specialty: "Orthopedic Surgery & Rehabilitation",
      hours: "7:00 AM - 9:00 PM",
      rating: "4.8",
      emergency: false,
      lat: 40.7282,
      lon: -73.9942,
      openingHours: {
        Monday: { open: "07:00", close: "21:00", available: true },
        Tuesday: { open: "07:00", close: "21:00", available: true },
        Wednesday: { open: "07:00", close: "21:00", available: true },
        Thursday: { open: "07:00", close: "21:00", available: true },
        Friday: { open: "07:00", close: "21:00", available: true },
        Saturday: { open: "08:00", close: "17:00", available: true },
        Sunday: { open: "09:00", close: "14:00", available: true }
      },
      doctors: [
        {
          id: "d4",
          name: "Dr. Michael O'Connor",
          specialty: "Orthopedic Surgeon",
          experience: "16 years",
          rating: "4.8",
          timeSlots: {
            Monday: ["07:30", "09:00", "10:30", "14:00", "15:30", "17:00"],
            Wednesday: ["08:00", "09:30", "11:00", "14:30", "16:00"],
            Friday: ["07:30", "09:00", "11:00", "14:00", "15:30"]
          }
        },
        {
          id: "d5",
          name: "Dr. Angela Brooks",
          specialty: "Spine Specialist",
          experience: "12 years",
          rating: "4.7",
          timeSlots: {
            Tuesday: ["08:00", "09:30", "11:00", "14:00", "15:30"],
            Thursday: ["08:30", "10:00", "11:30", "14:30", "16:00"],
            Saturday: ["09:00", "10:30", "12:00"]
          }
        },
        {
          id: "d6",
          name: "Dr. Robert Thompson",
          specialty: "Sports Medicine Physician",
          experience: "9 years",
          rating: "4.6",
          timeSlots: {
            Monday: ["08:00", "09:00", "10:00", "15:00", "16:00", "17:30"],
            Wednesday: ["08:30", "10:00", "11:00", "14:00", "15:30"],
            Friday: ["08:00", "09:30", "11:00", "14:30", "16:00"],
            Sunday: ["10:00", "11:00", "12:00", "13:00"]
          }
        }
      ]
    },
    {
      id: 3,
      name: "Sunshine Children's Hospital",
      address: "789 Pediatric Lane, Wellness District",
      phone: "+1-555-0125",
      distance: "3.2 km",
      type: "Specialty Hospital",
      specialty: "Pediatrics & Child Health",
      hours: "6:00 AM - 10:00 PM",
      rating: "4.9",
      emergency: true,
      lat: 40.7580,
      lon: -73.9855,
      openingHours: {
        Monday: { open: "06:00", close: "22:00", available: true },
        Tuesday: { open: "06:00", close: "22:00", available: true },
        Wednesday: { open: "06:00", close: "22:00", available: true },
        Thursday: { open: "06:00", close: "22:00", available: true },
        Friday: { open: "06:00", close: "22:00", available: true },
        Saturday: { open: "07:00", close: "20:00", available: true },
        Sunday: { open: "08:00", close: "18:00", available: true }
      },
      doctors: [
        {
          id: "d7",
          name: "Dr. Catherine Anderson",
          specialty: "General Pediatrician",
          experience: "14 years",
          rating: "4.9",
          timeSlots: {
            Monday: ["06:30", "08:00", "09:30", "14:00", "15:30", "17:00"],
            Wednesday: ["07:00", "08:30", "10:00", "14:30", "16:00"],
            Friday: ["06:30", "08:00", "10:00", "14:00", "15:30"],
            Sunday: ["10:00", "11:00", "12:00"]
          }
        },
        {
          id: "d8",
          name: "Dr. Richard Kumar",
          specialty: "Pediatric Immunologist",
          experience: "11 years",
          rating: "4.8",
          timeSlots: {
            Tuesday: ["07:00", "08:30", "10:00", "14:00", "15:30", "16:30"],
            Thursday: ["07:30", "09:00", "10:30", "14:30", "16:00"],
            Saturday: ["09:00", "10:30", "12:00"]
          }
        },
        {
          id: "d9",
          name: "Dr. Jennifer Lopez",
          specialty: "Pediatric Neurologist",
          experience: "9 years",
          rating: "4.7",
          timeSlots: {
            Monday: ["08:00", "09:00", "11:00", "15:00", "16:00", "17:30"],
            Wednesday: ["08:30", "10:00", "11:30", "14:00", "15:30"],
            Friday: ["08:00", "09:30", "11:00", "14:30", "16:00"],
            Sunday: ["11:00", "12:00", "13:00"]
          }
        }
      ]
    },
    {
      id: 4,
      name: "Oncology & Cancer Research Institute",
      address: "321 Medical Excellence Road, Research Park",
      phone: "+1-555-0126",
      distance: "4.1 km",
      type: "Specialty Hospital",
      specialty: "Oncology & Cancer Treatment",
      hours: "8:00 AM - 8:00 PM",
      rating: "4.7",
      emergency: false,
      lat: 40.7400,
      lon: -73.9800,
      openingHours: {
        Monday: { open: "08:00", close: "20:00", available: true },
        Tuesday: { open: "08:00", close: "20:00", available: true },
        Wednesday: { open: "08:00", close: "20:00", available: true },
        Thursday: { open: "08:00", close: "20:00", available: true },
        Friday: { open: "08:00", close: "20:00", available: true },
        Saturday: { open: "09:00", close: "15:00", available: true },
        Sunday: { open: "00:00", close: "00:00", available: false }
      },
      doctors: [
        {
          id: "d10",
          name: "Dr. Susan Foster",
          specialty: "Medical Oncologist",
          experience: "17 years",
          rating: "4.8",
          timeSlots: {
            Monday: ["08:30", "10:00", "11:30", "14:00", "15:30"],
            Wednesday: ["09:00", "10:30", "13:00", "14:30"],
            Friday: ["08:00", "10:00", "14:00", "15:30"]
          }
        },
        {
          id: "d11",
          name: "Dr. Howard Bennett",
          specialty: "Surgical Oncologist",
          experience: "19 years",
          rating: "4.9",
          timeSlots: {
            Tuesday: ["08:30", "10:00", "11:00", "13:30", "14:30"],
            Thursday: ["09:00", "10:30", "13:00", "14:00"],
            Saturday: ["10:00", "11:00", "12:00"]
          }
        },
        {
          id: "d12",
          name: "Dr. Monica Patel",
          specialty: "Radiation Oncologist",
          experience: "13 years",
          rating: "4.7",
          timeSlots: {
            Monday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
            Wednesday: ["08:30", "10:00", "14:30", "15:30"],
            Friday: ["09:00", "11:00", "14:00", "15:00"]
          }
        }
      ]
    },
    {
      id: 5,
      name: "Comprehensive Health Center",
      address: "654 Multi-Specialty Drive, Central District",
      phone: "+1-555-0127",
      distance: "2.0 km",
      type: "Multi-Specialty Hospital",
      specialty: "General Medicine, Surgery & Emergency",
      hours: "24/7",
      rating: "4.6",
      emergency: true,
      lat: 40.7200,
      lon: -73.9900,
      openingHours: {
        Monday: { open: "00:00", close: "23:59", available: true },
        Tuesday: { open: "00:00", close: "23:59", available: true },
        Wednesday: { open: "00:00", close: "23:59", available: true },
        Thursday: { open: "00:00", close: "23:59", available: true },
        Friday: { open: "00:00", close: "23:59", available: true },
        Saturday: { open: "00:00", close: "23:59", available: true },
        Sunday: { open: "00:00", close: "23:59", available: true }
      },
      doctors: [
        {
          id: "d13",
          name: "Dr. Christopher Hall",
          specialty: "Emergency Medicine Specialist",
          experience: "11 years",
          rating: "4.6",
          timeSlots: {
            Monday: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"],
            Tuesday: ["08:00", "09:00", "11:00", "13:00", "15:00", "17:00", "19:00"],
            Wednesday: ["08:30", "10:30", "12:30", "14:30", "16:30", "18:30", "20:30"],
            Thursday: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"],
            Friday: ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"]
          }
        },
        {
          id: "d14",
          name: "Dr. Linda Warren",
          specialty: "General Surgeon",
          experience: "14 years",
          rating: "4.7",
          timeSlots: {
            Monday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
            Wednesday: ["09:30", "10:30", "14:30", "15:30"],
            Friday: ["09:00", "11:00", "14:00", "15:00"],
            Saturday: ["10:00", "11:00", "12:00"]
          }
        },
        {
          id: "d15",
          name: "Dr. William Scott",
          specialty: "Internal Medicine Physician",
          experience: "12 years",
          rating: "4.5",
          timeSlots: {
            Monday: ["08:00", "09:00", "10:30", "14:00", "15:30", "17:00"],
            Tuesday: ["08:30", "10:00", "11:00", "13:30", "15:00", "16:30"],
            Wednesday: ["08:00", "10:00", "14:00", "15:00", "16:30"],
            Thursday: ["09:00", "10:00", "11:00", "14:00", "15:30"],
            Friday: ["08:30", "10:00", "14:30", "16:00"],
            Sunday: ["10:00", "11:00", "12:00"]
          }
        }
      ]
    }
  ];

  const fetchFacilitiesByCoords = async (lat: string | number, lon: string | number, locationName: string) => {
    setIsSearching(true);
    try {
      let hospitalList: Hospital[] = [];

      const overpassQuery = `
        [out:json];
        (
          node["amenity"="hospital"](around:10000,${lat},${lon});
          way["amenity"="hospital"](around:10000,${lat},${lon});
          node["amenity"="clinic"](around:10000,${lat},${lon});
          way["amenity"="clinic"](around:10000,${lat},${lon});
          node["amenity"="doctors"](around:10000,${lat},${lon});
          way["amenity"="doctors"](around:10000,${lat},${lon});
          node["amenity"="pharmacy"](around:10000,${lat},${lon});
          way["amenity"="pharmacy"](around:10000,${lat},${lon});
        );
        out body;
      `;

      const overpassResponse = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'KeenCare-Bot/1.0'
        },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });

      if (overpassResponse.ok) {
        const data = await overpassResponse.json();
        
        hospitalList = data.elements.slice(0, 100).map((element: OverpassElement, index: number) => {
          const hospitalLat = element.lat || element.center?.lat;
          const hospitalLon = element.lon || element.center?.lon;
          
          const distance = hospitalLat && hospitalLon
            ? calculateDistance(parseFloat(lat as string), parseFloat(lon as string), hospitalLat, hospitalLon)
            : "N/A";

          let type = "Medical Facility";
          if (element.tags?.amenity === "hospital") type = "Hospital";
          if (element.tags?.amenity === "clinic") type = "Clinic";
          if (element.tags?.amenity === "doctors") type = "Doctor's Office";
          if (element.tags?.amenity === "pharmacy") type = "Pharmacy";

          const randomSample = sampleHospitals[index % sampleHospitals.length];

          return {
            id: element.id || index,
            name: element.tags?.name || "Unnamed Medical Facility",
            address: element.tags?.["addr:full"] || 
                     `${element.tags?.["addr:street"] || ""} ${element.tags?.["addr:city"] || ""}`.trim() || 
                     "Address not available",
            phone: element.tags?.phone || element.tags?.["contact:phone"] || "Not available",
            distance: typeof distance === "number" ? `${distance.toFixed(1)} km` : distance,
            type: type,
            hours: element.tags?.opening_hours || "Not specified",
            rating: (Math.random() * 1 + 3.5).toFixed(1),
            lat: hospitalLat || (parseFloat(lat as string) + (Math.random() - 0.5) * 0.1),
            lon: hospitalLon || (parseFloat(lon as string) + (Math.random() - 0.5) * 0.1),
            emergency: element.tags?.emergency === "yes" || type === "Hospital",
            doctors: randomSample.doctors,
            openingHours: randomSample.openingHours,
          };
        });
      }

      if (hospitalList.length === 0) {
        toast.error(`No medical facilities found near ${locationName}`);
      } else {
        toast.success(`Found ${hospitalList.length} medical facilities near ${locationName}`);
      }

      hospitalList.sort((a: Hospital, b: Hospital) => {
        if (a.distance === "N/A") return 1;
        if (b.distance === "N/A") return -1;
        return parseFloat(a.distance) - parseFloat(b.distance);
      });

      setHospitals(hospitalList);
    } catch (error: unknown) {
      console.error("Facility search error:", error);
      setHospitals([]);
      toast.error("Failed to fetch nearby medical facilities. Please try again.");
    } finally {
      setIsSearching(false);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          logActivity(user.id, "Hospital Search", "/hospital-finder", "Completed", { location: locationName });
        }
      } catch (err) {
        console.error("Failed to log activity", err);
      }
    }
  };

  const handleSearch = async () => {
    if (!location.trim()) {
      toast.error("Please enter a location");
      return;
    }

    setIsSearching(true);
    
    try {
      // Enhance search query for Indian PIN codes to prevent getting results from other countries
      const isPinCode = /^\\d{6}$/.test(location.trim());
      const searchQuery = isPinCode ? `${location.trim()}, India` : location.trim();
      
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=1`,
        {
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": "KeenCare-Bot/1.0"
          }
        }
      );
      const geocodeData = await geocodeResponse.json();
      
      if (geocodeData && geocodeData.length > 0) {
        const { lat, lon } = geocodeData[0];
        await fetchFacilitiesByCoords(lat, lon, location);
      } else {
        toast.error("Location not found. Please try exploring on maps.");
        setHospitals([]);
        setIsSearching(false);
      }
    } catch (error: unknown) {
      console.error("Geocoding error:", error);
      setHospitals([]);
      toast.error("Network error while searching for location.");
      setIsSearching(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode to get a readable name
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          let locationName = "Current Location";
          
          if (data && data.address) {
            locationName = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.state_district || "Current Location";
          }
          
          setLocation(locationName);
          await fetchFacilitiesByCoords(latitude, longitude, locationName);
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setLocation("Current Location");
          await fetchFacilitiesByCoords(latitude, longitude, "Current Location");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let errorMsg = "Unable to retrieve your location";
        if (error.code === 1) errorMsg = "Location access denied by user";
        else if (error.code === 2) errorMsg = "Position unavailable";
        else if (error.code === 3) errorMsg = "Location request timed out";
        toast.error(errorMsg);
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleGetDirections = (hospital: Hospital) => {
    if (!hospital.lat || !hospital.lon) {
      toast.error("Location coordinates not available");
      return;
    }

    let directionsUrl = "";

    switch (mapProvider) {
      case "openstreetmap":
        directionsUrl = `https://www.openstreetmap.org/directions?from=&to=${hospital.lat},${hospital.lon}`;
        break;
      case "googlemaps":
        directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`;
        break;
      case "mapquest":
        directionsUrl = `https://www.mapquest.com/directions/to/${hospital.lat},${hospital.lon}`;
        break;
      case "heremaps":
        directionsUrl = `https://wego.here.com/directions/drive/mylocation/${hospital.lat},${hospital.lon}`;
        break;
      default:
        directionsUrl = `https://www.openstreetmap.org/directions?from=&to=${hospital.lat},${hospital.lon}`;
    }

    window.open(directionsUrl, '_blank');
  };

  const handleViewOnMap = (hospital: Hospital) => {
    if (!hospital.lat || !hospital.lon) {
      toast.error("Location coordinates not available");
      return;
    }

    let mapUrl = "";

    switch (mapProvider) {
      case "openstreetmap":
        mapUrl = `https://www.openstreetmap.org/?mlat=${hospital.lat}&mlon=${hospital.lon}#map=15/${hospital.lat}/${hospital.lon}`;
        break;
      case "googlemaps":
        mapUrl = `https://www.google.com/maps?q=${hospital.lat},${hospital.lon}`;
        break;
      case "mapquest":
        mapUrl = `https://www.mapquest.com/latlng/${hospital.lat},${hospital.lon}`;
        break;
      case "heremaps":
        mapUrl = `https://wego.here.com/?map=${hospital.lat},${hospital.lon},15,normal`;
        break;
      default:
        mapUrl = `https://www.openstreetmap.org/?mlat=${hospital.lat}&mlon=${hospital.lon}#map=15/${hospital.lat}/${hospital.lon}`;
    }

    window.open(mapUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-green-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="container max-w-5xl mx-auto py-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 hover:bg-blue-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-2xl border-0 mb-6 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">Medical Facility Finder</CardTitle>
                <CardDescription className="text-blue-100 text-base">
                  Find hospitals, doctors, and book time slots
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 relative w-full">
                <Input
                  placeholder="Enter your location, city, or zip code..."
                  value={location}
                  onChange={handleLocationChange}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="h-12 text-lg border-2 border-blue-300 rounded-xl focus:border-blue-600 pr-12 w-full"
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="p-3 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer flex flex-col gap-1 border-b last:border-0 border-gray-100 dark:border-slate-700"
                        onMouseDown={() => handleSelectSuggestion(suggestion)}
                      >
                        <span className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                          {suggestion.display_name.split(',')[0]}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {suggestion.display_name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 rounded-full"
                  onClick={handleUseMyLocation}
                  disabled={isLocating || isSearching}
                  title="Use My Location"
                >
                  <LocateFixed className={`h-5 w-5 ${isLocating ? 'animate-pulse text-indigo-500' : ''}`} />
                </Button>
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
              >
                {isSearching ? "Searching..." : "Find Facilities"}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Map Provider:</span>
              <Select value={mapProvider} onValueChange={setMapProvider}>
                <SelectTrigger className="w-48 border-2">
                  <SelectValue placeholder="Select map provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openstreetmap">OpenStreetMap (Free)</SelectItem>
                  <SelectItem value="googlemaps">Google Maps (Free)</SelectItem>
                  <SelectItem value="mapquest">MapQuest (Free)</SelectItem>
                  <SelectItem value="heremaps">HERE Maps (Free)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hospitals.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    Found {hospitals.length} Medical Facilities
                  </h3>
                  <Badge className="bg-blue-600 text-white text-sm px-3 py-1">
                    Sorted by distance
                  </Badge>
                </div>
                
                {hospitals.map((hospital) => (
                  <Card 
                    key={hospital.id} 
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-blue-200 dark:border-slate-700"
                  >
                    {/* Hospital Header */}
                    <div 
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 p-5 cursor-pointer hover:from-blue-100 hover:to-indigo-100"
                      onClick={() => setExpandedHospital(expandedHospital === hospital.id ? null : hospital.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">{hospital.name}</h3>
                            {hospital.emergency && (
                              <Badge className="bg-red-600 text-white text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Emergency
                              </Badge>
                            )}
                            <Badge className="bg-blue-600 text-white text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {hospital.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-amber-600 font-semibold">
                              <Star className="h-4 w-4 fill-current" />
                              {hospital.rating}
                            </div>
                            <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
                              <MapPin className="h-4 w-4" />
                              {hospital.distance}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {expandedHospital === hospital.id ? (
                            <ChevronUp className="h-6 w-6 text-blue-600" />
                          ) : (
                            <ChevronDown className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hospital Details - Always Visible */}
                    <div className="p-5 border-t-2 border-blue-200 dark:border-slate-600 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Address</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200">{hospital.address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Phone</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200">{hospital.phone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Main Hours</p>
                          <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold">{hospital.hours}</p>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content - Doctors & Hours */}
                    {expandedHospital === hospital.id && (
                      <div className="border-t-2 border-blue-200 dark:border-slate-600 p-5 space-y-5 bg-slate-50 dark:bg-slate-800/30">
                        {/* Opening Hours by Day */}
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-purple-600" />
                            Week Hours
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(hospital.openingHours).map(([day, hours]: [string, { open: string; close: string; available: boolean; }]) => (
                              <div 
                                key={day}
                                className={`p-3 rounded-lg border-2 ${
                                  hours.available 
                                    ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700" 
                                    : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                }`}
                              >
                                <p className="font-semibold text-sm text-gray-900 dark:text-white">{day.slice(0, 3)}</p>
                                {hours.available ? (
                                  <p className="text-xs text-gray-700 dark:text-gray-300">
                                    {hours.open.slice(0, 5)} - {hours.close.slice(0, 5)}
                                  </p>
                                ) : (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Closed</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Doctors Section */}
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Stethoscope className="h-5 w-5 text-blue-600" />
                            Available Doctors ({hospital.doctors.length})
                          </h4>
                          <div className="space-y-3">
                            {hospital.doctors.map((doctor: Doctor) => (
                              <div 
                                key={doctor.id}
                                className="bg-white dark:bg-slate-700 p-4 rounded-lg border-2 border-blue-200 dark:border-slate-600 hover:shadow-lg transition-all"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <User className="h-4 w-4 text-blue-600" />
                                      <p className="font-bold text-gray-900 dark:text-white">{doctor.name}</p>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">{doctor.specialty}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">{doctor.experience}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                                      <Star className="h-4 w-4 fill-current" />
                                      {doctor.rating}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Doctor Time Slots */}
                                <div className="mt-3">
                                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Available Slots:</p>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {Object.entries(doctor.timeSlots).map(([day, times]: [string, any]) => (
                                      <div key={day} className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-300 dark:border-blue-700">
                                        <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1">{day.slice(0, 3)}</p>
                                        <div className="flex flex-wrap gap-1">
                                          {times.slice(0, 3).map((time: string, idx: number) => (
                                            <button
                                              key={idx}
                                              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                                            >
                                              {time}
                                            </button>
                                          ))}
                                          {times.length > 3 && (
                                            <span className="text-xs text-gray-600 dark:text-gray-400 px-2 py-1">
                                              +{times.length - 3} more
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 p-4 bg-gray-50 dark:bg-slate-800 border-t-2 border-blue-200 dark:border-slate-700">
                      <Button 
                        onClick={() => handleGetDirections(hospital)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        Get Directions
                      </Button>
                      <Button 
                        onClick={() => handleViewOnMap(hospital)}
                        variant="outline"
                        className="flex-1 font-semibold border-2"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on Map
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {hospitals.length === 0 && !isSearching && (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold">Enter a location to find nearby medical facilities</p>
                <p className="text-sm mt-2">See hospitals, doctors, and available time slots</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalFinder;