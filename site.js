//1. после загрузки страницы отображать список twitch-аккаунтов со статусом "online" или "offline"
//1.1 сходить в api и получить данные( base URL https://wind-bow.gomix.me/twitch-api )
//1.2 в случае ошибки в поле ошибки выводить сообщение о ней
//1.3.1 при успешном возврате данных выводить список на экран со ссылками на каналы
//1.3.2 в случае, если статус "online", указывать информацию о стриме
//2. Если аккаунт удален или не существовал вовсе, выводить отметку об этом

//enhancement сделать форму, в которую можно ввести логин, информация о котором интересна

var STREAM_CHANNELS_LIST = ["freecodecamp", "ESL_SC2", "OgamingSC2", "cretetion", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas", "brunofin"];


function ajaxRequest(url, renderFunction) {

    $.ajax({
        url: url,
        dataType: "jsonp",
        jsonp: "callback",
        data: {
            format: "json"
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $('.error-message').html('Something went wrong. Please, try again.')
        },
        success: function(data) {
            $('.error-message').html('');
            renderFunction(data);
        }
    });
}

function getChannelInfo(channelsList) {

    if (!$.isArray(channelsList)) {
        channelsList = [channelsList];
    }

    //Итерации цикла обернуты во временную функцию для того, чтобы значение каждого i сохранялось,
    // так как ajaxRequest() начинает выполнение позже и возвращает только последний результат

    for (var i = 0; i < channelsList.length; i++) {
        (function (index) {
            var ChannelsUrls = "https://wind-bow.gomix.me/twitch-api/channels/" + channelsList[index];
            var StreamsUrls = "https://wind-bow.gomix.me/twitch-api/streams/" + channelsList[index];

            ajaxRequest(ChannelsUrls, function(data) {
                displayChannelInfo(data);
                if (!data.error) {
                    ajaxRequest(StreamsUrls, displayStreamInfo);
                }
            });
        })(i);
    }
}

function displayChannelInfo(data) {
    var channelBlock = $('<a />').attr({
        id: data._id,
        class: 'channel',
        href: data.url,
        target: '_blank'
    });

    var logoElementBlock = $('<div />').attr('class', 'channel_logo');
    var logoElement = $('<img>');
    if (data.logo) {
        logoElement.attr('src', data.logo);
    } else {
        logoElement.attr('src', 'https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-128.png');
    }
    logoElementBlock.append(logoElement);
    channelBlock.append(logoElementBlock);
    $('#results-block').append(channelBlock);

    var contentElementBlock = $('<div />').attr('class', 'channel_content');
    var channelNameElement = $('<p />').attr('class', 'channel_name').text(data.display_name);
    channelBlock.append(contentElementBlock);
    contentElementBlock.append(channelNameElement);

    var streamStatus = $('<div />').addClass("status").text('Offline');

    if (data.error) {
        streamStatus.addClass('errorStatus').text('Error');
        contentElementBlock.append(
            $('<p />').attr('class', 'channel_name').text(data.message)
        );
    }

    contentElementBlock.append(streamStatus);
}

function displayStreamInfo(data) {
    if (data.stream) {
        var thisElement = $('#' + data.stream.channel._id).find(".channel_content");
        $(thisElement).find('.status').addClass('statusOnline').html('Online');

        var streamDescriptionElement = $('<p />').attr('class', 'stream_description').text(data.stream.channel.status);
        $(thisElement).append(streamDescriptionElement);
    }
}

function clearSearchResult() {
    $("#results-block").empty();
    $(".search-form_target").val('');
}

$(document).ready(function() {
    getChannelInfo(STREAM_CHANNELS_LIST);

    $(".search-form").on('submit', function(e) {
        e.preventDefault();

        var channelName = $(".search-form_target").val();
        clearSearchResult();
        getChannelInfo(channelName);
    });
});
