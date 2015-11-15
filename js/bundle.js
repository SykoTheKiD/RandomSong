var playingCssClass = 'playing',
    audioObject = null,
    playObject = null,
    song = null,
    songID = null;

function searchAlbums(query, callback) {
    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        data: {
            q: query,
            type: 'album',
            limit: 9
        },
        success: function(response) {
            callback(response);
            // var albums = response.albums.items;
            // response.albums.items = [albums[0]];
            // resultsPlaceholder.innerHTML = template(response);
            // albums.shift();
            // response.albums.items = albums;
            // fetchTracks(response.albums.items[0].id, null);
            // relatedPlaceholder.innerHTML = templateRelated(response);

        }
    });
};

function getArtistPicture(artistURI, callback) {
    var url = "https://api.spotify.com/v1/artists/" + artistURI
    $.ajax({
        url: url,
        success: function(response) {
            callback(response.images[0].url);
            // container.style.backgroundImage = "url(\'" +
            // response.images[0].url + "\')";
        }
    });
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function delayButton() {
    document.getElementById('newSong').disabled = true;
    setTimeout(function() {
        document.getElementById('newSong').disabled = false
    }.get, 1000);
}

function newSong() {
    var year = randomNumber(1950, new Date().getFullYear());
    var url = 'https://api.spotify.com/v1/search?q=year:' + year.toString() +
        '&type=artist&market=US';
    $.ajax({
        url: url,
        success: function(response) {        
            buildObj = {albumSearchResponse:null, albumData:null, artistPicture: null};
            var numArtists = response.artists.items.length,
                rand = Math.floor(Math.random() * (numArtists));            
            searchAlbums(response.artists.items[rand].name, function(data){
                buildObj.albumSearchResponse = data;
                console.log(data);
            });
            fetchTracks(buildObj.albumSearchResponse.albums.items[0].id,function(data){
                buildObj.albumData = data;
            });
            getArtistPicture(buildObj.albumData.artists[0].id, function(data){
                buildObj.artistPicture = data.images[0].url;
            });

            buildUI(buildObj);

            // var numArtists = response.artists.items.length;
            // var rand = Math.floor(Math.random() * (numArtists));
            // searchAlbums(response.artists.items[rand].name);
        }
    });
}

function buildUI(buildObj){
    var templateSource = document.getElementById('results-template').innerHTML,
        template = Handlebars.compile(templateSource),
        resultsPlaceholder = document.getElementById('results');
    var templateSourceRelated = document.getElementById('related-template').innerHTML,
        templateRelated = Handlebars.compile(templateSourceRelated),
        relatedPlaceholder = document.getElementById('related-albums');
    try{
        container.style.backgroundImage = "url(\'" + buildObj.artistPicture + "\')";
        var titleDiv = document.getElementById('track-title'),
            albumDiv = document.getElementById('track-album'),
            artistDiv = document.getElementById('track-artist');
        albumDiv.innerHTML = buildObj.albumData.name;
        titleDiv.innerHTML = buildObj.albumData.tracks.items[song].name;
        artistDiv.innerHTML = buildObj.albumData.artists[0].name;
        var albums = buildObj.albumSearchResponse.albums.items;
        response.albums.items = [albums[0]];
        resultsPlaceholder.innerHTML = template(response);
        albums.shift();
        response.albums.items = albums;
        fetchTracks(response.albums.items[0].id, null);
        relatedPlaceholder.innerHTML = templateRelated(response);
    }catch(err){
        throw "UI Build Error"
    }

}

function fetchTracks(albumId, callback) {
    $.ajax({
        url: 'https://api.spotify.com/v1/albums/' + albumId,
        success: function(response) {
            if (!song) {
                song = randomNumber(0, response.tracks.items.length - 1);
            }
            callback(response);
        }
    });
};
results.addEventListener('click', function(e) {
    var target = e.target;
    if (target !== null && target.classList.contains('cover')) {
        if (target.classList.contains(playingCssClass)) {
            audioObject.pause();
        } else {
            if (audioObject) {
                audioObject.pause();
            }
            fetchTracks(target.getAttribute('data-album-id'), function(
                data) {
                audioObject = new Audio(data.tracks.items[song].preview_url);
                audioObject.play();
                target.classList.add(playingCssClass);
                audioObject.addEventListener('ended', function() {
                    target.classList.remove(
                        playingCssClass);
                });
                audioObject.addEventListener('pause', function() {
                    target.classList.remove(
                        playingCssClass);
                });
            });
        }
    }
});
// 1544
window.onload = newSong();