# ofproxy-node

A browser-based frontend for Ofproxy-node.

## Dependencies

oproxy-node (https://github.com/TrafficLab/ofproxy-node)

## Usage

    var PROXY_PORT = 5532;
    
    var CONTROLLER_PORT = 5533;
    var CONTROLLER_HOST = 'localhost';
    
    var HTTP_PORT = 8080;
    
    require('ofproxy-node-gui')(PROXY_PORT, CONTROLLER_HOST, CONTROLLER_PORT, HTTP_PORT);
