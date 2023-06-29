<p align="center" style="background-color:black"><img src=frontend/src/assets/logo.png width=300></p>

--------------------------------------------------------------------------------

# Overlayrd

Overlayerd is a streaming solution for overlaying custom images and audio that can be triggered by events (e.g. from Twitch) as well as other stream content (video, audio). Overlayrd is developed by streamers, for streamers, especially those on a budget who don't want to spend their hard earned cash on services to make their streams. 

## Features

* Configure custom overlay images and audio sound effects and connect them to twitch events
* Authentication with Twitch
* Real time event driven connection with Twitch


## Roadmap

* Tap into video and audio streams from OBS
* Add CV - Automated Kill Counter for Call of Duty
* Add audio2text model to allow events triggered from keywords audio channels
* Profit :moneybag:
* Advanced OBS controls


## Some Debugging Stuff for the Devs

Using twitch cli to generate Oauth user tokens atm. To configure with client ID and secret use:
```
  # twitch configure
  Client ID: xxxxxxxxx
  Client Secret: xxxxxxxx
```
To generate an app token use:
```
  # twitch token
  2023/03/10 23:45:39 App Access Token: xxxxxxxxxxxxx
```

To generate a user token with needed scopes use:
```
  # twitch token -u -s 'moderator:read:followers channel:read:subscriptions'
  Opening browser. Press Ctrl+C to cancel...
  2023/03/11 00:15:29 Waiting for authorization response ...
  2023/03/11 00:15:33 Closing local server ...
  2023/03/11 00:15:39 User Access Token: xxxxxx
  Refresh Token: xxxxxxxxxxxxxxxxxxx
  Expires At: 2023-03-11 09:53:36.771687 +0000 UTC
  Scopes: [channel:read:subscriptions moderator:read:followers]
```