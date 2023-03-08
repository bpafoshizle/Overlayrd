# socket-stream
Event subscription and overlay solution for streamers on a budget

Plan is to leverage newer (still beta) WebSocket events capability of initially Twitch to avoid subscription fees a la streamlabs and streamelements. I'm surprised there isn't already a solution for this. 

To do:
* Experiment with fastapi backend serving jinja templated html with canvas element. JS embedded.
    * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes
    * https://testdriven.io/blog/fastapi-react/
    * https://fastapi.tiangolo.com/advanced/templates/
* Experiment with pure react canvas (may be easier to bundle and distribute)
  * https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258
* Experiment with fastapi web sockets
  * https://fastapi.tiangolo.com/advanced/websockets/
* Experiment with react web sockets
  * https://www.tutorialspoint.com/html5/html5_websocket.htm
* Tap into video and audio streams
* Add ML
* Profit :moneybag:
* Advanced OBS controls