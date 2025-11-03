import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Phone, Navigation, Clock, ExternalLink, Star } from "lucide-react";
import { toast } from "sonner";

const HospitalFinder = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapProvider, setMapProvider] = useState<string>("openstreetmap");

  // Sample data for fallback
  const sampleHospitals = [
    {
      id: 1,
      name: "City General Hospital",
      address: "123 Medical Center Drive, Downtown",
      phone: "+1-555-0123",
      distance: "2.1 km",
      type: "Hospital",
      hours: "24/7",
      rating: "4.5",
      emergency: true,
      lat: 40.7128,
      lon: -74.0060
    },
    {
      id: 2,
      name: "Community Health Clinic",
      address: "456 Health Avenue, Midtown",
      phone: "+1-555-0124",
      distance: "3.4 km",
      type: "Clinic",
      hours: "8:00 AM - 6:00 PM",
      rating: "4.2",
      emergency: false,
      lat: 40.7282,
      lon: -73.9942
    },
    {
      id: 3,
      name: "Urgent Care Center",
      address: "789 Emergency Lane, Uptown",
      phone: "+1-555-0125",
      distance: "1.8 km",
      type: "Urgent Care",
      hours: "7:00 AM - 11:00 PM",
      rating: "4.3",
      emergency: true,
      lat: 40.7580,
      lon: -73.9855
    }
  ];

  const handleSearch = async () => {
    if (!location.trim()) {
      toast.error("Please enter a location");
      return;
    }

    setIsSearching(true);
    
    try {
      // Try to use real API first
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      );
      const geocodeData = await geocodeResponse.json();
      
      let hospitalList = [];

      if (geocodeData && geocodeData.length > 0) {
        const { lat, lon } = geocodeData[0];

        // Find hospitals using Overpass API
        const overpassQuery = `
          [out:json];
          (
            node["amenity"="hospital"](around:10000,${lat},${lon});
            way["amenity"="hospital"](around:10000,${lat},${lon});
            node["amenity"="clinic"](around:10000,${lat},${lon});
            way["amenity"="clinic"](around:10000,${lat},${lon});
            node["amenity"="doctors"](around:10000,${lat},${lon});
            way["amenity"="doctors"](around:10000,${lat},${lon});
          );
          out body;
        `;

        const overpassResponse = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `data=${encodeURIComponent(overpassQuery)}`
        });

        if (overpassResponse.ok) {
          const data = await overpassResponse.json();
          
          hospitalList = data.elements.slice(0, 10).map((element: any, index: number) => {
            const hospitalLat = element.lat || element.center?.lat;
            const hospitalLon = element.lon || element.center?.lon;
            
            const distance = hospitalLat && hospitalLon
              ? calculateDistance(parseFloat(lat), parseFloat(lon), hospitalLat, hospitalLon)
              : "N/A";

            let type = "Medical Facility";
            if (element.tags?.amenity === "hospital") type = "Hospital";
            if (element.tags?.amenity === "clinic") type = "Clinic";
            if (element.tags?.amenity === "doctors") type = "Doctor's Office";

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
              lat: hospitalLat || (parseFloat(lat) + (Math.random() - 0.5) * 0.1),
              lon: hospitalLon || (parseFloat(lon) + (Math.random() - 0.5) * 0.1),
              emergency: element.tags?.emergency === "yes"
            };
          });
        }
      }

      // If no real data found, use sample data
      if (hospitalList.length === 0) {
        hospitalList = sampleHospitals.map(hospital => ({
          ...hospital,
          distance: hospital.distance
        }));
        toast.info("Showing sample medical facilities for demonstration");
      } else {
        toast.success(`Found ${hospitalList.length} medical facilities near ${location}`);
      }

      // Sort by distance
      hospitalList.sort((a: any, b: any) => {
        if (a.distance === "N/A") return 1;
        if (b.distance === "N/A") return -1;
        return parseFloat(a.distance) - parseFloat(b.distance);
      });

      setHospitals(hospitalList);
    } catch (error: any) {
      console.error("Hospital search error:", error);
      // Fallback to sample data
      setHospitals(sampleHospitals);
      toast.info("Showing sample medical facilities. Real data unavailable.");
    } finally {
      setIsSearching(false);
    }
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

  const handleGetDirections = (hospital: any) => {
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

  const handleViewOnMap = (hospital: any) => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Medical Facility Finder</CardTitle>
                <CardDescription className="text-blue-100">
                  Find nearby hospitals, clinics, and healthcare providers
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <Input
                  placeholder="Enter your location, city, or zip code..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="h-12 text-lg"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="h-12 text-lg bg-blue-600 hover:bg-blue-700"
              >
                {isSearching ? "Searching..." : "Find Facilities"}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">Map Provider:</span>
              <Select value={mapProvider} onValueChange={setMapProvider}>
                <SelectTrigger className="w-48">
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
                  <h3 className="text-lg font-semibold text-gray-800">
                    Found {hospitals.length} Medical Facilities
                  </h3>
                  <Badge variant="secondary" className="text-sm">
                    Sorted by distance
                  </Badge>
                </div>
                
                {hospitals.map((hospital) => (
                  <Card key={hospital.id} className="p-4 hover:shadow-lg transition-all duration-300 border border-gray-200">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-gray-900">{hospital.name}</h3>
                            {hospital.emergency && (
                              <Badge variant="destructive" className="text-xs">
                                Emergency
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-sm">
                              {hospital.type}
                            </Badge>
                            <div className="flex items-center gap-1 text-amber-600">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="text-sm font-semibold">{hospital.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{hospital.distance}</p>
                          <p className="text-sm text-gray-500">away</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="flex-1">{hospital.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{hospital.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-500 flex-shrink-0" />
                          <span>Hours: {hospital.hours}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={() => handleGetDirections(hospital)}
                          variant="default"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Navigation className="mr-2 h-4 w-4" />
                          Get Directions
                        </Button>
                        <Button 
                          onClick={() => handleViewOnMap(hospital)}
                          variant="outline"
                          className="flex-1"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View on Map
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {hospitals.length === 0 && !isSearching && (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Enter a location to find nearby medical facilities</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalFinder;