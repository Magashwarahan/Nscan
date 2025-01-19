import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { initiateNmapScan } from "@/services/scanApi";
import { Progress } from "@/components/ui/progress";

const CustomScan = () => {
  const [scanName, setScanName] = useState("");
  const [target, setTarget] = useState("");
  const [attributes, setAttributes] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleScan = async () => {
    if (!scanName || !target || !attributes) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before starting the scan.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setProgress(25);

    try {
      const result = await initiateNmapScan(target, "custom", attributes);
      setProgress(75);

      // Store scan result with metadata
      const scanData = {
        scan_name: scanName,
        target: target,
        scan_type: "custom",
        timestamp: new Date().toISOString(),
        result: JSON.stringify(result.output),
        status: result.status,
      };

      localStorage.setItem('currentScanResult', JSON.stringify(scanData));
      setProgress(100);

      // Navigate after a short delay to ensure data is stored
      setTimeout(() => {
        navigate('/scan/custom');
      }, 500);

    } catch (error: any) {
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to perform scan",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Scan</h1>
          <p className="text-muted-foreground">
            Configure and run a custom Nmap scan with specific attributes
          </p>
        </div>

        <div className="grid gap-6">
          <div className="space-y-4">
            <Input
              placeholder="Scan Name"
              value={scanName}
              onChange={(e) => setScanName(e.target.value)}
              disabled={isScanning}
            />
            <Input
              placeholder="Target IP Address"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={isScanning}
            />
            <Textarea
              placeholder="Nmap Attributes (e.g., -A -sS -T4)"
              value={attributes}
              onChange={(e) => setAttributes(e.target.value)}
              disabled={isScanning}
              className="min-h-[100px]"
            />
            {isScanning && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Scanning in progress...
                </p>
              </div>
            )}
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full"
            >
              {isScanning ? "Scanning..." : "Start Scan"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomScan;