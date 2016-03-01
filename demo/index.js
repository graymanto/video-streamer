"use strict";

const express = require('express');
const app = express();

const videoStreamer = require('../index');

app.get('/video/:videoName', videoStreamer( { videoPath: 'temp' } ));

app.listen(3000);
