(function ($) {

    var local;
    var chatChannel;
    var fileChannel;

    var $board = $('#board');
    var $log = $('#log');

    $('#init form').submit(function (e) {
        e.preventDefault();

        var key = $('#key').val() || 'demo';
        var name = $('#name').val() || 'No Name';

        $('#init').hide();
        $('#main').show();
        $('#room').text('Room: ' + key);

        setupWebRTC(key, name);
    });

    $('#chat form').submit(function (e) {
        e.preventDefault();
        var $message = $('#message');
        var message = $message.val();
        if (message) {
            if (chatChannel) {
                chatChannel.send(message);
            }
            writeChatMessage(message, local);
        }
        $message.val('');
        $message.focus();
    });

    $('#main').on('dragenter', ignoreEvent);
    $('#main').on('dragover', ignoreEvent);
    $('#main').on('drop', function (e) {
        e.originalEvent.preventDefault();
        var file = e.originalEvent.dataTransfer.files[0];
        toArrayBuffer(file, function (buffer) {
            var blob = new Blob([new Uint8Array(buffer)]);
            if (fileChannel) {
                fileChannel.send(buffer);
            }
            writeFileLink(blob, local);
        });
    });

    function toArrayBuffer(file, next) {
        var reader = new FileReader();
        reader.onload = function () {
            next(reader.result);
        };
        reader.readAsArrayBuffer(file);
    }

    function ignoreEvent(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function setupWebRTC(key, name) {
        var webRTC = join.createWebRTC({
            key: key,
            name: name,
            secure: location.protocol === 'https:',
            media: { video: true, audio: true },
            channels: [
                { chat: { reliable: false } },
                { file: { reliable: true } }
            ]
        });
        webRTC.on('local', onLocal);
        webRTC.on('remote', onRemote);
        webRTC.on('chat.channel', onChatChannel);
        webRTC.on('file.channel', onFileChannel);
        webRTC.start();
    }

    function onLocal(peer) {
        local = peer;
        local.on('stream', function (stream) {
            $('<span>').text(makeDisplayName(local)).appendTo('#local-user');
            $('#local-user video').attr('src', URL.createObjectURL(stream));
        });
    }

    function onRemote(remote) {
        var $container = $('<div>').attr('id', 'remote-user-' + remote.id);
        remote.on('stream', function (stream) {
            $video = $('<video autoplay>')
                .attr('src', URL.createObjectURL(stream));
            $name = $('<span>').text(makeDisplayName(remote));
            $container
                .append($video)
                .append($name)
                .appendTo('#video-list');
        });
        remote.on('close', function () {
            $container.remove();
        });
    }

    function onChatChannel(channel) {
        chatChannel = channel;
        chatChannel.on('open', function (e) {
            writeSystemMessage(makeDisplayName(e.remote) + ' is here.');
        });
        chatChannel.on('data', function (e) {
            writeChatMessage(e.data, e.remote);
        });
        chatChannel.on('close', function (e) {
            writeSystemMessage(makeDisplayName(e.remote) +  ' is away.');
        });
        chatChannel.on('error', function (e) {
            console.log(JSON.stringify(e));
        });
    }

    function onFileChannel(channel) {
        fileChannel = channel;
        fileChannel.on('data', function (e) {
            var data = e.data;
            if (data instanceof ArrayBuffer) {
                var blob = new Blob([new Uint8Array(data)]);
                writeFileLink(blob, e.remote);
            } else if (data instanceof Blob) {
                writeFileLink(data, e.remote);
            } else {
                console.log('warn: file data type "' + (typeof data) + '" is unexpected.');
            }
        });
    }

    function writeChatMessage(message, peer) {
        $message = $('<span class="message">').text(message);
        writeElement($message, peer);
    }

    function writeSystemMessage(message) {
        $message = $('<span class="system-message">').text(message);
        writeElement($message);
    }

    function writeFileLink(blob, peer) {
        var url = URL.createObjectURL(blob);
        var $link = $('<a target="_blank">file</a>').attr('href', url);
        writeElement($link, peer);
    }

    function writeElement($element, peer) {
        var $container = $('<div>');
        if (peer) {
            $('<span class="name">').text(makeDisplayName(peer) + ': ').prependTo($container);
        }
        $container.append($element);
        $board.append($container);
        $board.scrollTop($board.prop('scrollHeight'));
    }

    function makeDisplayName(peer) {
        return peer.name + '(' + peer.id + ')';
    }

    function logger(level, message) {
        $('<div>').text('[' + level + ']: ' + message).appendTo($log);
        $log.scrollTop($log.prop('scrollHeight'));
    }

}(jQuery));