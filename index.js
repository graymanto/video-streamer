"use strict";

/*!
 * video-streamer
 * MIT Licensed
 */

/**
 * Module dependencies
 */

const path = require('path');
const fsp = require('fs-promise');
const fs = require('fs');

/**
 * Module exports
 */

module.exports = videoStream;

/**
 * Video stream:
 *
 * Returns sections of a video to allow streaming from htm
 *
 * @param {object} [options]
 * @return {function}
 * @api public
 */
function videoStream(options) {
  const opts = options || {};
  const videoPath = opts.videoPath || 'video';

  return (req, res) => {

    processVideoStream(videoPath, req, res);
  };
}

function processVideoStream(videoPath, req, res) {
  const videoName = req.params[Object.keys(req.params)[0]];

  const file = path.join(videoPath, videoName);

  const extension = path.extname(videoName);

  if (extension !== '.mp4') {
    res.status(415).send({
      error: `File type ${extension} is not supported.`
    });
    return;
  }

  const rangeHeader = req.headers.range;
  if (!rangeHeader) {
    res.status(400).send({
      error: 'Range header not found in video stream request.'
    });
    return;
  }
  const positions = rangeHeader.replace(/bytes=/, "").split("-");

  fsp.stat(file).then(stat => {
      const info = calculateFileInfo(stat.size, positions);

      writeHeaders(res, info.start, info.end, info.total, info.chunksize);

      const responseStream = fs.createReadStream(file, {
        flags: "r",
        start: info.start,
        end: info.end + 1
      });

      responseStream.pipe(res);
    }, err => {
      console.log("File access error", err);
      res.status(404).send({
        error: 'File not found on video stream request'
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    });
}

function calculateFileInfo(size, positions) {
  const start = parseInt(positions[0], 10);
  const end = positions[1] ? parseInt(positions[1], 10) : size - 1;

  return {
    total: size,
    start: start,
    end: end,
    chunksize: (end - start) + 1
  };
}

function writeHeaders(res, start, end, total, chunkSize) {
  res.writeHead(206, {
    "Content-Range": "bytes " + start + "-" + end + "/" + total,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    Connection: "keep-alive",
    "Content-Type": "video/mp4"
  });
}
