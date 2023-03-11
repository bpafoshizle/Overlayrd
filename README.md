# socket-stream

## Overview
Event subscription and overlay solution for streamers on a budget

Plan is to leverage newer (still beta) WebSocket events capability of initially Twitch to avoid subscription fees a la streamlabs and streamelements. I'm surprised there isn't already a solution for this. 

## Last status 2023-03-11

WebSocket connection implemented on front end. Back end subscriptions implemented. Just need to generate events to test handling.

To do:
* Further testing of websockets with twitch cli or live events
* Add ability to refresh user token via refresh token
* Implement Oauth user token flow in React
* Add sqllite to store state
* Add react app to configure
  * Way to set up broadcaster and events to follow
  * Way to configure app client id and secret
  * Way to configure graphics and audio


* Tap into video and audio streams
* Add ML
* Profit :moneybag:
* Advanced OBS controls

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