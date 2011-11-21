$(document).ready(function() {
    $('#container').layout({
                        defaults: {
                            closable: false
                        },
                        north: {
                            paneSelector: "#control-pane",
                            size: 50,
                            resizable: false
                        },
                        center: {
                            paneSelector: "#events-pane",
                            minSize: 700,
                            maxSize: 700
                        },
                        west: {
                            paneSelector: "#selectors-pane",
                            size: 280
                        }
                    });

    $('#selectors-pane').layout({
                            defaults: {
                                closable: false
                            },
                            center: {
                                paneSelector: "#sessions-pane"
                            },
                            south: {
                                paneSelector: "#types-pane",
                                size: '50%'
                            }
                        });
});
