import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Send, AlertCircle, CheckCircle } from "lucide-react";
import { initiateNmapScan } from "@/services/scanApi";
import { saveScanHistory } from "@/services/scanHistoryApi";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScanCardProps {
  title: string;
  description: string;
  type: string;
}

export const ScanCard = ({ title, description, type }: ScanCardProps) => {
  const [scanName, setScanName] = useState("");
  const [target, setTarget] = useState("");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "scanning" | "error" | "success">("idle");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleScan = async () => {
    if (!scanName.trim()) {
      toast({
        title: "Scan Name Required",
        description: "Please provide a name for this scan.",
        variant: "destructive",
      });
      return;
    }

    try {
      setScanning(true);
      setStatus("scanning");
      setProgress(10);

      const result = await initiateNmapScan(target, type);
      setProgress(90);

      const scanHistory = await saveScanHistory({
        target,
        scan_type: type,
        scan_name: scanName,
        timestamp: new Date().toISOString(),
        status: "completed",
        result: JSON.stringify(result.output),
      });

      setProgress(100);
      setStatus("success");
      
      toast({
        title: "Scan Complete",
        description: "The scan has finished successfully.",
      });

      navigate(`/scan/${scanHistory.id}`);
    } catch (error: any) {
      setStatus("error");
      toast({
        title: "Scan Failed",
        description: error.message || "There was an error during the scan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
      setProgress(0);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "scanning":
        return <Shield className="h-6 w-6 text-blue-500 animate-pulse" />;
      case "error":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return <Shield className="h-6 w-6 text-cyber-teal" />;
    }
  };

  return (
    <Card className="glass-card p-6 animate-enter">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {getStatusIcon()}
      </div>

      <div className="mt-4 space-y-4">
        <Input
          placeholder="Enter scan name"
          value={scanName}
          onChange={(e) => setScanName(e.target.value)}
          className="bg-background/50"
        />
        <Input
          placeholder="Enter target IP or hostname"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="bg-background/50"
        />

        <div className="flex items-center gap-4">
          <Button
            onClick={handleScan}
            disabled={scanning || !target || !scanName}
            className="flex-1 cyber-gradient"
          >
            {scanning ? "Scanning..." : "Start Scan"}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="px-3">
                  <Clock className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View scan history</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="px-3">
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share scan results</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {scanning && (
          <div className="space-y-2 animate-slide">
            <div className="flex justify-between text-sm">
              <span>Scan Progress</span>
              <Badge variant={status === "error" ? "destructive" : "default"}>
                {status.toUpperCase()}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>
    </Card>
  );
};