var server = 'ws://localhost:8080/';

function zPad(n) {
    if (n < 10) return '0' + n;
    else return n;
}

function timestamp() {
    var d = new Date();
    return zPad(d.getHours()) + ':' + zPad(d.getMinutes()) + ':' + zPad(d.getSeconds());
}

function write_to_mbox(message) {
    var line = '[' + timestamp() + '] ' + message + '<br>';
    $('#messages').append(line);

    var msgBox = $('.message_box')
    msgBox.animate({scrollTop : msgBox.prop('scrollHeight')})
}

$(document).ready(function() {
    $('#name').focus();

    $('#connect-form').submit(function() {
        var socket = new WebSocket(server);
        var name = $('#name').val();

        socket.onerror = function(error) {
            console.log('WebSocket Error: ' + error);
        };

        socket.onopen = function(event) {
            $('#jumbotron').hide();
            write_to_mbox('Connected to: ' + server);
            msg = {"type":"name", "name": name};
            socket.send(JSON.stringify(msg));
            $('#message_wrapper').show();
            $('#message').focus();
        };

        socket.onmessage = function(event) {
            var data = JSON.parse(event.data)
            if (data['type']=='msg') {
                write_to_mbox(data['msg'])
            } else {
                console.log('Unsupported type: ' + data['type']);
            }
        };

        socket.onclose = function(event) {
            write_to_mbox('Disconnected from ' + server);
        };

        $('#message-form').submit(function() {
            msg = {"type": "msg", "msg": $('#message').val()};
            socket.send(JSON.stringify(msg));
            $('#message').val('');
            return false;
        });

        return false;
    });
});
