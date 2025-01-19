import { useParams, Navigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ScanStats } from "@/components/scan/ScanStats";
import { ScanDetails } from "@/components/scan/ScanDetails";
import { VulnerabilityReport } from "@/components/scan/VulnerabilityReport";
import { useAuth } from "@/hooks/useAuth";
import { OSReport } from "@/components/scan/OSReport";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ScanResults = () => {
  const { scanId } = useParams();
  const { session } = useAuth();

  const { data: scanHistory, isLoading, error } = useQuery({
    queryKey: ['scan', scanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .eq('id', scanId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!scanId && !!session,
  });

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-cyber-teal" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !scanHistory) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ? error.message : "No scan results found. Please try running the scan again."}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const renderScanResults = () => {
    try {
      switch (scanHistory.scan_type) {
        case 'os':
          return <OSReport scanResult={scanHistory.result} />;
        case 'vuln':
          return <VulnerabilityReport scanResult={scanHistory.result} />;
        case 'quick':
        case 'full':
        case 'stealth':
        case 'custom':
        default:
          return (
            <>
              <ScanStats scanResult={scanHistory.result} />
              <ScanDetails scanResult={scanHistory.result} />
            </>
          );
      }
    } catch (error) {
      console.error('Error rendering scan results:', error);
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to render scan results. The scan data might be corrupted.
          </AlertDescription>
        </Alert>
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {'Scan Results'}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Target: {scanHistory.target}</span>
                <span>•</span>
                <span>{new Date(scanHistory.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">  
          {renderScanResults()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ScanResults;