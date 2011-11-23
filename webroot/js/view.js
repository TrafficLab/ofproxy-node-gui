$(document).ready(function() {

window.SessionView = Backbone.View.extend({
    tagName: "li",
    className: "session",
    template: _.template($('#session-template').html()),
    events: {
    },
    initialize: function() {
        this.model.bind('change:name', this.changeName, this);
        this.model.bind('change:active', this.changeActive, this);
        this.model.bind('destroy', this.remove, this);
    },
    render: function() {
        var self = this;

        $(this.el).html(this.template(this.model.toJSON())).appendTo('#sessions-list');

        var checkbox = $(this.el).find('input.show');

        checkbox.click(function() {
            if (checkbox.is(':checked')) {
                self.model.set({'show': true});
            } else {
                self.model.set({'show': false});
            }
        });

        var del = $(this.el).find('div.delete');
        del.click(function() {
            if (!self.model.get('active')) {
                if (confirm('Are you sure you want to delete the session?')) {
                    self.model.cleanUp();
                }
            }
        });

        this.changeActive();

        return this;
    },

    changeActive: function() {
        if (this.model.get('active')) {
            $(this.el).removeClass('inactive').addClass('active');
            $(this.el).find('div.delete img').css('display', 'none');
        } else {
            $(this.el).removeClass('active').addClass('inactive');
            $(this.el).find('div.delete img').css('display', '');
        }
    },

    changeName: function() {
        $(this.el).find('div.name').text(this.model.get('name'));
    },

    remove: function() {
        $(this.el).remove();
    },
    clear: function() {
        this.model.destroy();
    }
});


window.SessionsView = Backbone.View.extend({
    el: $('#sessions-pane'),
    events: {
    },
    initialize: function() {
        sessions.bind('add', this.addOne, this);
        sessions.bind('remove', this.removeOne, this);
        this.render();
    },

    render: function() {
    },

    addOne: function(session) {
        var view = new SessionView({model: session});
        session.view = view;
        this.$('#sessions-list').append(view.render().el);
    },

    removeOne: function(session) {
        session.view.remove();
    }
});

window.MessageView = Backbone.View.extend({
    tagName: "li",
    className: "message",
    template: _.template($('#message-template').html()),
    events: {
    },
    initialize: function() {
        this.model.bind('destroy', this.remove, this);

        if (this.model.get('session')) {
            this.model.get('session').bind('change:name', this.sessionName, this);
            this.model.get('session').bind('change:show', this.show, this);

            this.show();
        }
    },
    render: function() {
        $(this.el).html(this.template(this.model.toJSON())).appendTo('#events-list');
        if (this.model.get('message').body && _.keys(this.model.get('message').body).length > 0) {
            var self = this;
            $(this.el).click(function() {
                                $(self.el).find('div.body').toggle(200);
                            });
        }
        return this;
    },

    sessionName: function() {
        $(this.el).find('div.session').text(this.model.get('session').get('name'));
    },

    show: function() {
        var self = this;
        if (this.model.get('session').get('show')) {
            $(self.el).css('display', '');
        } else {
            $(self.el).css('display', 'none');
        }
    },

    remove: function() {
        $(this.el).remove();
    }
});




window.SessionEventView = Backbone.View.extend({
    tagName: "li",
    className: "session-event",
    template: _.template($('#session-event-template').html()),
    events: {
    },
    initialize: function() {
        this.model.bind('change', this.render, this);
        this.model.bind('destroy', this.remove, this);

        if (this.model.get('session')) {
            this.model.get('session').bind('change:name', this.sessionName, this);
        }
    },
    render: function() {
        $(this.el).html(this.template(this.model.toJSON())).appendTo('#events-list');
        if (this.model.get('type') == "start") {
            $(this.el).addClass("start");
        } else {
            $(this.el).addClass("end");
        }
        return this;
    },

    sessionName: function() {
        $(this.el).find('div.session').text(this.model.get('session').get('name'));
    },

    remove: function() {
        $(this.el).remove();
    },
    clear: function() {
        this.model.destroy();
    }
});



window.EventsView = Backbone.View.extend({
    el: $('#events-pane'),
    events: {
    },
    initialize: function() {
        messages.bind('add', this.addOneMessage, this);
        messages.bind('remove', this.removeOneMessage, this);
        sessionEvents.bind('add', this.addOneSessionEvent, this);
        sessionEvents.bind('remove', this.removeOneSessionEvent, this);
        this.render();
    },

    render: function() {
    },

    addOneMessage: function(message) {
        var view = new MessageView({model: message});
        message.view = view;
        this.$('#events-list').append(view.render().el);
    },

    removeOneMessage: function(message) {
        message.view.remove();
    },

    addOneSessionEvent: function(sessionEvent) {
        var view = new SessionEventView({model: sessionEvent});
        sessionEvent.view = view;
        this.$('#events-list').append(view.render().el);
    },

    removeOneSessionEvent: function(sessionEvent) {
        sessionEvent.view.remove();
    }

});


window.TypeView = Backbone.View.extend({
    tagName: "li",
    className: "type",
    template: _.template($('#type-template').html()),
    initialize: function() {
        this.model.bind('change:show', this.changeActive, this);
    },
    render: function() {
        var self = this;

        $(this.el).html(this.template(this.model.toJSON())).appendTo('#types-list');

        var checkbox = $(this.el).find('input.show');
        checkbox.click(function() {
            if (checkbox.is(':checked')) {
                self.model.set({'show': true});
            } else {
                self.model.set({'show': false});
            }
        });

        this.changeActive();

        return this;
    },

    changeActive: function() {
        if (this.model.get('show')) {
            $(this.el).removeClass('inactive').addClass('active');
        } else {
            $(this.el).removeClass('active').addClass('inactive');
        }
    },

    remove: function() {
        $(this.el).remove();
    }
});

window.TypesView = Backbone.View.extend({
    el: $('#types-pane'),
    events: {
    },
    initialize: function() {
        types.bind('add', this.addOne, this);
        types.bind('remove', this.removeOne, this);
    },

    render: function() {
    },

    addOne: function(type) {
        var view = new TypeView({model: type});
        type.view = view;
        this.$('#types-list').append(view.render().el);
    },

    removeOne: function(session) {
        session.view.remove();
    }
});

window.ConnectionView = Backbone.View.extend({
    el: $('#connection'),
    events: {
    },
    initialize: function() {
        this.model.bind('change:connected', this.changeConnected, this);
        this.model.view = this;
    },
    render: function() {
    },
    changeConnected: function() {
        if (this.model.get('connected')) {
            $(this.el).addClass('connected')
                      .removeClass('disconnected')
                      .text('Connected');
        } else {
            $(this.el).addClass('disconnected')
                      .removeClass('connected')
                      .text('Disconnected');
        }
    }
});

window.StatusView = Backbone.View.extend({
    el: $('#status'),
    events: {
    },
    initialize: function() {
        this.model.bind('change:state', this.changeState, this);
        this.model.view = this;

        var self = this;

        $(this.el).click(function() {
            switch (self.model.get('state')) {
                case 'stopped' : {
                    self.start(); // passed by ofproxy
                    break;
                }
                case 'started' : {
                    self.stop(); // passed by ofproxy
                    break;
                }
            }
        });
    },
    changeState: function() {
        switch (this.model.get('state')) {
            case 'stopped': {
                $(this.el).removeClass('stopping')
                          .removeClass('starting')
                          .addClass('stopped')
                          .text('Stopped');
                break;
            }
            case 'starting': {
                $(this.el).removeClass('stopped')
                          .addClass('starting')
                          .text('Starting...');
                break;
            }
            case 'started': {
                $(this.el).removeClass('starting')
                          .addClass('started')
                          .text('Started');
                break;
            }
            case 'stopping' : {
                $(this.el).removeClass('started')
                          .addClass('stopping')
                          .text('Stopping...');
                break;
            }
        }
    }
});

window.sessionsView = new SessionsView();

window.eventsView = new EventsView();

window.typesView = new TypesView();


});