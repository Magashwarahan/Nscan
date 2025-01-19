from flask import Flask, request, jsonify
from flask_cors import CORS
import nmap
import datetime
import uuid

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

def parse_nmap_output(nm, scan_type):
    """Parse nmap output based on scan type"""
    results = []
    
    for host in nm.all_hosts():
        host_info = {
            'host': host,
            'hostname': nm[host].hostname() if 'hostname' in nm[host] else '',
            'state': nm[host].state(),
            'protocols': {}
        }
        
        # Add protocol specific information
        for proto in nm[host].all_protocols():
            ports = nm[host][proto].keys()
            proto_info = []
            
            for port in ports:
                service = nm[host][proto][port]
                port_info = {
                    'port': port,
                    'state': service['state'],
                    'service': service['name'],
                    'version': service.get('version', ''),
                    'product': service.get('product', ''),
                    'extrainfo': service.get('extrainfo', ''),
                    'cpe': service.get('cpe', []),
                }
                proto_info.append(port_info)
            
            host_info['protocols'][proto] = proto_info

        # Add OS detection results if available
        if 'osmatch' in nm[host]:
            host_info['os'] = {
                'matches': nm[host]['osmatch'],
                'accuracy': nm[host].get('osclass', {}).get('accuracy', 'N/A')
            }
        
        # Add script results if available
        if 'script' in nm[host]:
            host_info['scripts'] = nm[host]['script']
            
        results.append(host_info)
    
    return results

@app.route('/api/scan', methods=['POST'])
def scan():
    data = request.json
    target = data.get('target')
    scan_type = data.get('scanType')
    custom_attributes = data.get('customAttributes')
    
    if not target or not scan_type:
        return jsonify({
            'status': 'error',
            'output': 'Target and scan type are required',
            'timestamp': datetime.datetime.now().isoformat()
        }), 400
    
    nm = nmap.PortScanner()
    
    scan_configs = {
        'quick': '-sV -F -T4 --version-intensity 5',
        'full': '-sS -sV -O -p- -T4 --version-intensity 7',
        'stealth': '-sS -Pn -T2 --version-intensity 0',
        'vuln': '-sV -sC --script vuln -T4',
        'service': '-sV -A --version-all',
        'os': '-O -sV --osscan-guess --fuzzy',
        'udp': '-sU -sV --version-intensity 5',
        'script': '-sC -sV --script default,safe',
        'custom': custom_attributes if custom_attributes else '-A -T4 -v'
    }
    
    arguments = scan_configs.get(scan_type, '-sV')
    
    try:
        print(f"Starting {scan_type} scan on target: {target}")
        scan_result = nm.scan(hosts=target, arguments=arguments)
        
        # Parse the results based on scan type
        parsed_results = parse_nmap_output(nm, scan_type)
        
        print(f"Scan completed successfully for {target}")
        
        return jsonify({
            'status': 'success',
            'output': parsed_results,
            'raw': nm.csv(),
            'timestamp': datetime.datetime.now().isoformat()
        })
    
    except Exception as e:
        error_message = str(e)
        print(f"Scan error for {target}: {error_message}")
        return jsonify({
            'status': 'error',
            'output': error_message,
            'timestamp': datetime.datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)