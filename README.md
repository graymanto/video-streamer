# Video Streamer

Express.js module to support basic streaming of video from a server.

Currently this only supports files with an mp4 extension. Streaming should be successful to the both the html5
embedded video element and any similar player, for example the ios video player.

## Installation

```sh
npm install --save video-streamer
```

## Usage

```javascript
const express = require('express');
const app = express();

const videoStreamer = require('video-streamer');

// default path to the video folder is 'video' if no config is specified
app.get('/video/:videoName', videoStreamer( { videoPath: 'video' } ));

app.listen(3000);
```

## Testing

To run the built in http tests:

```sh
npm test
```

To see the streaming in action, a demonstration server and html file are included in the package.
To use, first run the tests with the 'npm test' command as specified above. This will place a
demonstration video in the temp folder. When this is complete, run:


```sh
npm start
```

to start the demonstration streaming server. Open the file demo/index.html in a browser to
see the video stream.


