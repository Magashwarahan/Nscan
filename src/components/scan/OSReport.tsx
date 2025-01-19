import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Monitor, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface OSReportProps {
  scanResult: any;
}

export const OSReport = ({ scanResult }: OSReportProps) => {
  const results = typeof scanResult === 'string' ? JSON.parse(scanResult) : scanResult;

  if (!results || results.length === 0) {
    return (
      <Alert>
        <AlertTitle>No OS Detection Results</AlertTitle>
        <AlertDescription>
          No operating system information could be detected for this target.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="p-6 animate-enter">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Operating System Detection Results</h3>
          <Monitor className="h-5 w-5 text-cyber-teal" />
        </div>

        <div className="space-y-4">
          {results.map((host: any, index: number) => (
            <Accordion
              key={index}
              type="single"
              collapsible
              className="w-full"
            >
              <AccordionItem value={`host-${index}`}>
                <AccordionTrigger className="flex items-center gap-2 px-4">
                  <Shield className="h-4 w-4" />
                  <span className="font-mono">{host.host}</span>
                  {host.hostname && (
                    <Badge variant="outline" className="ml-2">
                      {host.hostname}
                    </Badge>
                  )}
                </AccordionTrigger>
                <AccordionContent className="space-y-4 p-4">
                  {host.os?.matches?.map((match: any, matchIndex: number) => (
                    <Card key={matchIndex} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-muted-foreground">
                            OS Match {matchIndex + 1}
                          </h4>
                          <Badge variant="secondary">
                            Accuracy: {match.accuracy}%
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xl font-semibold">{match.name}</p>
                          {match.osclass && (
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline">
                                Type: {match.osclass.type}
                              </Badge>
                              <Badge variant="outline">
                                Vendor: {match.osclass.vendor}
                              </Badge>
                              <Badge variant="outline">
                                Family: {match.osclass.osfamily}
                              </Badge>
                              <Badge variant="outline">
                                Gen: {match.osclass.osgen}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>
    </Card>
  );
};