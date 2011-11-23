$(document).ready(function() {

window.Session = Backbone.Model.extend({
    initialize: function() {
        this.setName(),
        this.bind('change', this.setName, this);
    },

    defaults: {
        "address": false,
        "port" : false,
        "dpid" : false,
        "active" : true,
        "show" : true
    },

    setName: function() {
        if (this.get('dpid')) {
            if (!this.get('dpidCount')) {
                this.set({'dpidCount': sessions.getDpidCount(this.get('dpid'))});
            }

            if (this.get('dpidCount') > 1) {
                this.set({'name': this.get('dpid') + ' (' + this.get('dpidCount') + ')'});
            } else {
                this.set({'name': this.get('dpid')});
            }
        } else {
            this.set({'name': this.get('address') + ':' + this.get('port')});
        }
    },

    cleanUp: function() {
        messages.deleteSession(this);
        sessionEvents.deleteSession(this);
        sessions.remove(this);
    }

});

window.Sessions = Backbone.Collection.extend({
    model: Session,

    dpidCounter : {}, // counts the occurence of a given dpid

    update : function(id, props) {
        var session = this.get(id);
        if (session) {
            session.set(props);
        } else {
            console.log('Update for non-existing session (id: ' + id + ').');
        }
    },

    getDpidCount : function(dpid) {
        if (dpid in this.dpidCounter) {
            var count = this.dpidCounter[dpid] + 1;
            this.dpidCounter[dpid] = count;
            return count;
        } else {
            this.dpidCounter[dpid] = 1;
            return 1;
        }
    }

});



window.SessionEvent = Backbone.Model.extend({
    initialize: function() {
        var session = sessions.get(this.get('session_id'));
        if (session) {
            this.set({'session': session});
            this.set({'id': session.get('id') + '-' + this.get('at') + '-' + this.get('type')});
        } else {
            console.log('SessionEvent has no session (id: ' + this.get('session_id') +  ').');
        }
    },

    defaults: {
        "type": "start"
    }
});

window.SessionEvents = Backbone.Collection.extend({
    model: SessionEvent,

    deleteSession: function(session) {
        var self = this;
        var models = this.models.slice(0);
        _.each(models, function(msg) {
                if (msg.get('session') == session) {
                    self.remove(msg);
                }
        });
    }
});


window.Message = Backbone.Model.extend({
    initialize: function() {
        var session = sessions.get(this.get('session_id'));
        if (session) {
            this.set({'session': session});
            this.set({'id': session.get('id') + '-' + this.get('by') + '-' + this.get('at')});
        } else {
            console.log('Message has no session (id: ' + this.get('session_id') +  ').');
        }

    },

    defaults: {
        "at": false,
        "by": false,
        "message": false
    }
});

window.Messages = Backbone.Collection.extend({
    model: Message,

    deleteSession: function(session) {
        var self = this;
        var models = this.models.slice(0);
        _.each(models, function(msg) {
                if (msg.get('session') == session) {
                    self.remove(msg);
                }
        });
    }
});




window.Type = Backbone.Model.extend({
    initialize: function() {
    },
    defaults: {
        "show": true
    }
});

window.Types = Backbone.Collection.extend({
    model: Type
});

window.Connection = Backbone.Model.extend({
    intialize: function() {
    },
    defaults: {
        "connected": false
    }
});

window.Status = Backbone.Model.extend({
    initialize: function() {
    },
    defaults: {
        "state": 'stopped'   // 'stopped', 'starting', 'started', 'stopping'
    }
});

window.sessions = new Sessions();

window.messages = new Messages();

window.sessionEvents = new SessionEvents();

window.types = new Types();

});