# YouTube Discord Bot

A simple discord bot that uses slash commands and dropdown selects to play music from YouTube. There is also a basic last.fm integration, currently getting the album cover art.

Commands Available:
- /play: Add or queue a song
- /skip: Skip the current song
- /leave: Stop the music
- /queue: View the current queue and the current song
- /nowplaying: View the current song
- /recent: Songs that have been played recently
- /remove: Remove a song from the queue
- /pause: Pauses/resumes the current song
- /resume: Resume the current song
- /addsimilar: Add more songs to the queue, similar to the ones in the queue (using last.fm)

To do:

- [x] Get search to work through Youtube DL
- [x] Choose search results through dropdown menus using Discord JS
- [x] ~~Download chosen file~~ Stream music through Youtube DL
- [x] Get album cover
    - [x] Get video thumbnail from search results
    - [x] Get an album cover through last.fm or similar API
- [x] Display a "Now playing" or "Added to queue" message with album art
- [ ] Add a /controller command to be able to play/pause/skip/etc. using slash command buttons

Last FM Integration:

- [x] Get covers from last FM
- [ ] Add recently listened to songs if a user has linked their discord account with the bot/last FM
- [ ] Radio mode where once a song is played, the bot will add similar songs to the queue