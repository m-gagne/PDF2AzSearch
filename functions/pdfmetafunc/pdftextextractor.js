'use strict';

require('pdfjs-dist');
// adding DOMParser to read XMP metadata.
// from: https://github.com/mozilla/pdf.js/blob/master/examples/node/getinfo.js
global.DOMParser = require('./domparsermock.js').DOMParserMock;
var fs = require('fs');

var PDFTextExtractor = function () {
}

PDFTextExtractor.prototype = {
  getDataFromFile: function(file) {
    console.log("Reading file: " + file);
    if (!fs.existsSync(file)) {
      console.log("Error, could not open file: " + file);
      return;
    }

    return getDataFromBuffer(new Uint8Array(fs.readFileSync(file)));
  },
  getDataFromBuffer: function(data) {
    var extract = function(resolve, reject) {
      var document = PDFJS.getDocument(data).then(function (document) {
        var lastPromise, documentInfo;
        var documentText = "";
        var lastY, currentY;

        lastPromise = document.getMetadata().then(function (data) {
          documentInfo = data;
        });

        var loadPage = function (pageNumber) {
          return document.getPage(pageNumber).then(function (page) {
            lastY = 0;
            currentY = 0;
            return page.getTextContent().then(function (content) {
              content.items.map(function (item) {
                currentY = parseInt(item.transform[5]);
                if ( documentText !== "" ) {
                  if ( currentY != lastY ) {
                  documentText += "\n";
                  } else {
                    documentText += " ";
                  }
                }
                documentText += item.str;
                lastY = currentY;
              });
            });
          });
        }

        var pages = document.numPages;
        for (var i = 1; i <= pages; i++) {
          lastPromise = lastPromise.then(loadPage.bind(null, i));
        }

        lastPromise.then( function () {
          resolve({
            info: documentInfo,
            text: documentText
          });
        })
      });
    };

    return new Promise(extract.bind(this));
  }
}

module.exports = PDFTextExtractor;