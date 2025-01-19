interface ScanResult {
  output: any;
  status: 'success' | 'error';
  timestamp: string;
  raw?: string;
}

export const initiateNmapScan = async (
  target: string, 
  scanType: string, 
  customAttributes?: string
): Promise<ScanResult> => {
  console.log(`Initiating ${scanType} scan on target: ${target}`);
  
  try {
    const response = await fetch('http://localhost:5000/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target,
        scanType,
        customAttributes,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.output || 'Scan request failed');
    }

    const result = await response.json();
    console.log('Scan completed successfully:', result);
    
    // Ensure we always return a consistent format
    return {
      output: result.output,
      status: result.status,
      timestamp: result.timestamp,
      raw: result.raw
    };
  } catch (error: any) {
    console.error('Scan error:', error);
    throw new Error(error.message || 'Failed to perform scan');
  }
};