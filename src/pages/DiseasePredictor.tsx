import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Activity, AlertCircle, ExternalLink, Loader2, Play, CheckCircle } from "lucide-react";

const DiseasePredictor = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAccessible, setIsAccessible] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    checkStreamlitStatus();
    // Check every 10 seconds
    const interval = setInterval(checkStreamlitStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkStreamlitStatus = async () => {
    setIsChecking(true);
    try {
      // Try to fetch the Streamlit app
      const response = await fetch('http://localhost:8505', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      setIsAccessible(true);
    } catch (error) {
      setIsAccessible(false);
    } finally {
      setIsLoading(false);
      setIsChecking(false);
    }
  };

  const startStreamlitApp = async () => {
    setIsStarting(true);
    try {
      // Show instructions to user
      const command = `cd "Disease ML Model\\multiple-disease-prediction-streamlit-app" && streamlit run app.py --server.port 8505 --server.headless true`;
      navigator.clipboard.writeText(command).then(() => {
        alert(`Command copied to clipboard!\n\n${command}\n\n1. Open a new terminal/command prompt\n2. Paste and run the command above\n3. Wait for "Local URL: http://localhost:8505" to appear\n4. Come back and click "Check Connection"`);
      });
    } catch (error) {
      alert('Please manually run this command in a terminal:\n\ncd "Disease ML Model\\multiple-disease-prediction-streamlit-app"\nstreamlit run app.py --server.port 8505 --server.headless true');
    } finally {
      setIsStarting(false);
    }
  };

  const openStandalone = () => {
    window.open('http://localhost:8505', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="container max-w-6xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-large animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-display">Disease Prediction Model</CardTitle>
                <CardDescription>Advanced ML-based prediction for Diabetes, Heart Disease, and Parkinson's</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Status Section */}
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Streamlit Server Status</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={checkStreamlitStatus}
                    disabled={isChecking}
                    size="sm"
                    variant="outline"
                  >
                    {isChecking ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Check Status
                  </Button>
                  <Button
                    onClick={openStandalone}
                    size="sm"
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Standalone
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600">Checking server status...</span>
                  </>
                ) : isAccessible ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700 font-medium">✓ Server is running and accessible</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700 font-medium">✗ Server is not running</span>
                  </>
                )}
              </div>
            </div>

            {/* Error Alert */}
            {!isAccessible && !isLoading && (
              <Alert className="mb-6 border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Streamlit Server Required</AlertTitle>
                <AlertDescription className="text-amber-700">
                  The disease prediction model requires a separate Streamlit server to be running on port 8505.
                  <br /><br />
                  <strong>How to start the server:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Open a new terminal/command prompt</li>
                    <li>Navigate to your project folder</li>
                    <li>Run this command:</li>
                  </ol>
                  <code className="block mt-2 p-3 bg-amber-100 rounded text-sm font-mono border">
                    cd "Disease ML Model\multiple-disease-prediction-streamlit-app"<br />
                    streamlit run app.py --server.port 8505 --server.headless true
                  </code>
                  <br />
                  <div className="flex gap-2">
                    <Button
                      onClick={startStreamlitApp}
                      disabled={isStarting}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {isStarting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Copying...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Copy Command
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={openStandalone}
                      size="sm"
                      variant="outline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Try Opening Anyway
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Embedded App */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Prediction Interface</h3>
                {isAccessible && (
                  <Button onClick={openStandalone} size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Full Window
                  </Button>
                )}
              </div>

              <div className="w-full h-[800px] border rounded-lg overflow-hidden shadow-inner bg-white">
                {isAccessible ? (
                  <iframe
                    src="http://localhost:8505"
                    className="w-full h-full"
                    title="Disease Prediction Model"
                    allow="fullscreen"
                    onLoad={() => setIsAccessible(true)}
                    onError={() => setIsAccessible(false)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">Server Not Available</h3>
                      <p className="text-gray-500 mb-4">
                        Please start the Streamlit server using the instructions above.
                      </p>
                      <Button onClick={startStreamlitApp} className="bg-blue-600 hover:bg-blue-700">
                        <Play className="h-4 w-4 mr-2" />
                        Get Started
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> This embedded application uses machine learning models trained on medical datasets.
                Results are for educational purposes only and should not replace professional medical advice.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiseasePredictor;