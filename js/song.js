"use strict"

var Song = {
	Length: 1,
	Sequence: []
}

function InitSong() {
	for (var i = 0; i < Constants.MaxSongLength; i++) {
		Song.Sequence[i] = 0
	}
}
