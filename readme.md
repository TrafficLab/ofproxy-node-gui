# ofproxy-node

A browser-based frontend for Ofproxy-node.

## Dependencies

oflib-node (https://github.com/TrafficLab/oflib-node/)

oproxy-node (https://github.com/TrafficLab/ofproxy-node/)

node-static (https://github.com/cloudhead/node-static/)

socket-io (https://github.com/LearnBoost/socket.io/)

### Transitive dependencies

node-uuid (https://github.com/broofa/node-uuid/)

socket.io-client (https://github.com/LearnBoost/socket.io-client/)

uglify-js (https://github.com/mishoo/UglifyJS/)


## Usage

    var PROXY_PORT = 5532;
    
    var CONTROLLER_PORT = 5533;
    var CONTROLLER_HOST = 'localhost';
    
    var HTTP_PORT = 8080;
    
    require('ofproxy-node-gui')(PROXY_PORT, CONTROLLER_HOST, CONTROLLER_PORT, HTTP_PORT);
