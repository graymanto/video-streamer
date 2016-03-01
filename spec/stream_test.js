"use strict";

const request = require('supertest');
const express = require('express');
const path = require('path');
const fsp = require('fs-promise');
const fs = require('fs');
const http = require('http');

const app = express();

const tempDir = 'temp';
const demoVideoFileName = 'big_buck_bunny_720p_1mb.mp4';
const demoVideoUrl = 'http://www.sample-videos.com/video/mp4/720/' + demoVideoFileName;
const demoVideoFilePath = path.join(tempDir, demoVideoFileName);

const videoStreamer = require('../index');

app.get('/video/:videoName', videoStreamer({
  videoPath: 'temp'
}));

function downloadFile(url, fileName) {
  return new Promise((fulfill, reject) => {
    var file = fs.createWriteStream(fileName);
    console.log("Getting the thing ", url);
    http.get(url, function(response) {
      response.on('data', data => {
          file.write(data);
        })
        .on('end', () => {
          file.end();
          fulfill();
        })
        .on('error', err => {
          reject(err);
        });
    });
  });
}

describe('Video streaming tests', () => {
  beforeEach((done) => {
    fsp.ensureDir(tempDir)
      .then(() => fsp.stat(demoVideoFilePath))
      .catch(() => downloadFile(demoVideoUrl, demoVideoFilePath))
      .then(() => {
        done();
      })
      .catch(err => done.fail(err));
  }, 20000);

  it('Checks that it returns 404 for a video that does not exist', done => {
    request(app)
      .get('/video/anything.mp4')
      .set('Range', 'bytes=100-')
      .expect(404)
      .end(function(err) {
        if (err) {
          throw err;
        }
        done();
      });
  });

  it('Checks that it returns 400 if the range header is not sent.', done => {
    request(app)
      .get('/video/' + demoVideoFileName)
      .expect(400)
      .end(function(err) {
        if (err) {
          throw err;
        }
        done();
      });
  });

  it('Checks that it returns 415 if the wrong file type is requested.', done => {
    request(app)
      .get('/video/anything.doc')
      .expect(415)
      .end(function(err) {
        if (err) {
          throw err;
        }
        done();
      });
  });

  it('Checks that it returns 206 for a valid request.', done => {
    request(app)
      .get('/video/' + demoVideoFileName)
      .set('Range', 'bytes=100-')
      .expect(206)
      .end(function(err) {
        if (err) {
          throw err;
        }
        done();
      });
  });
});
