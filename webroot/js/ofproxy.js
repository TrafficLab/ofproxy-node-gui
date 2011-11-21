$(document).ready(function() {

    function parse(str) {
        return JSON.parse(str, function reviver(key, value) {
                                    if (typeof value == 'object' && '$b' in value) return value['$b'];
                                    if (typeof value == 'object' && '$i' in value) return value['$i'];
                                    return value;
                                });
    };

    function dateFormat(str) {
        function pad2(n) {
            if (n > 9) {
                return "" + n;
            } else {
                return "0" + n;
            }
        };

        function pad3(n) {
            if (n > 99) {
                return "" + n;
            } else if (n > 9) {
                return "0" + n;
            } else {
                return "00" + n;
            }
        };

        var d = new Date(str);
        return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate()) + ' '
             + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()) + "." + pad3(d.getMilliseconds());
    }

    var start = function() {
        if (connection.get('connected')) {
            status.set({'state': 'starting'});

            var typeRequest = [];

            types.each(function(type) {
                if (type.get('show')) {
                    typeRequest.push(type.get('name'));
                }
            });

            socket.emit('ofProxyStart', {'types' : typeRequest});

        }
    };

    var stop = function() {
            status.set({'state': 'stopping'});

            socket.emit('ofProxyStop', {});

            sessions.each(function(session) {
                session.set({'active': false});
            });

            status.set({'state': 'stopped'});
    };


    var changeTypes = function() {
        if (status.get('state') == 'started') {
            var typeRequest = [];

            types.each(function(type) {
                if (type.get('show')) {
                    typeRequest.push(type.get('name'));
                }
            });

            socket.emit('ofProxyTypes', {'types' : typeRequest});
        }
    };

    var connection = new Connection();
    var connectionView = new ConnectionView({model: connection});

    var status = new Status();
    var statusView = new StatusView({model: status});
    statusView.start = start;
    statusView.stop = stop;

    var socket = io.connect(); /* same host/port as http */

    socket.on('connect', function() {
        connection.set({'connected': true});
    });

    socket.on('disconnect', function() {
        connection.set({'connected': false});
        status.set({'state': 'stopped'});
        sessions.each(function(session) {
            session.set({'active': false});
        });
    });

    socket.on('ofProxySessions', function(json) {
        status.set({'state': 'started'});
        var obj = parse(json);
        obj.forEach(function(o) {
            sessions.add(new Session({
                    id: o.id,
                    address: o.address,
                    port: o.port,
                    dpid: o.dpid
            }));
        });
    });

    socket.on('ofProxySessionStart', function(json) {
        var obj = parse(json);
        sessions.add(new Session({
                id: obj.id,
                address: obj.address,
                port: obj.port
        }));

        sessionEvents.add(new SessionEvent({
                    session_id : obj.id,
                    at : dateFormat(obj.at),
                    type : "start"
        }));

    });

    socket.on('ofProxySessionEnd', function(json) {
        var obj = parse(json);
        sessions.update(obj.id, {'active' : false});

        sessionEvents.add(new SessionEvent({
                    session_id : obj.id,
                    at : dateFormat(obj.at),
                    type : "end"
        }));
    });

    socket.on('ofProxySessionUpdate', function(json) {
        var obj = parse(json);
        sessions.update(obj.id, {'dpid' : obj.dpid});
    });



    socket.on('ofProxyMessage', function(json) {
        var obj = parse(json);

        messages.add(new Message({
                    session_id : obj.id,
                    at : dateFormat(obj.at),
                    by : obj.by,
                    message : obj.message
        }));

    });

    socket.on('ofProxyError', function(json) {
        var obj = parse(json);
    });




    types.add(new Type({name: 'OFPT_HELLO', show: true}));
    types.add(new Type({name: 'OFPT_ERROR', show: true}));
    types.add(new Type({name: 'OFPT_ECHO_REQUEST', show: true}));
    types.add(new Type({name: 'OFPT_ECHO_REPLY', show: true}));
    types.add(new Type({name: 'OFPT_EXPERIMENTER', show: true}));
    types.add(new Type({name: 'OFPT_FEATURES_REQUEST', show: true}));
    types.add(new Type({name: 'OFPT_FEATURES_REPLY', show: true}));
    types.add(new Type({name: 'OFPT_GET_CONFIG_REQUEST', show: true}));
    types.add(new Type({name: 'OFPT_GET_CONFIG_REPLY', show: true}));
    types.add(new Type({name: 'OFPT_SET_CONFIG', show: true}));
    types.add(new Type({name: 'OFPT_PACKET_IN', show: false}));
    types.add(new Type({name: 'OFPT_FLOW_REMOVED', show: true}));
    types.add(new Type({name: 'OFPT_PORT_STATUS', show: true}));
    types.add(new Type({name: 'OFPT_PACKET_OUT', show: false}));
    types.add(new Type({name: 'OFPT_FLOW_MOD', show: true}));
    types.add(new Type({name: 'OFPT_GROUP_MOD', show: true}));
    types.add(new Type({name: 'OFPT_PORT_MOD', show: true}));
    types.add(new Type({name: 'OFPT_TABLE_MOD', show: true}));
    types.add(new Type({name: 'OFPT_STATS_REQUEST', show: true}));
    types.add(new Type({name: 'OFPT_STATS_REPLY', show: true}));
    types.add(new Type({name: 'OFPT_BARRIER_REQUEST', show: true}));
    types.add(new Type({name: 'OFPT_BARRIER_REPLY', show: true}));
    types.add(new Type({name: 'OFPT_QUEUE_GET_CONFIG_REQUEST', show: true}));
    types.add(new Type({name: 'OFPT_QUEUE_GET_CONFIG_REPLY', show: true}));


    types.each(function(type) {
        type.bind('change:show', changeTypes, this);
    });
});