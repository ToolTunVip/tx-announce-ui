fx_version 'cerulean'
game 'gta5'

author 'Custom'
description 'txAnnounce - Cinematic Announcement UI'
version '2.1.0'

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'html/img/Logo.png',
    'html/sounds/announce.mp3',
}

shared_script 'config.lua'
client_script  'client.lua'
server_script  'server.lua'