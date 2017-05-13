'use strict';

require('pdfjs-dist');
// adding DOMParser to read XMP metadata.
// from: https://github.com/mozilla/pdf.js/blob/master/examples/node/getinfo.js
global.DOMParser = require('./domparsermock.js').DOMParserMock;
var fs = require('fs');

var PDFTextExtractor = function (file) {
  this.file = file;
}

PDFTextExtractor.prototype = {
  getTextContent: function() {
    var extract = function(resolve, reject) {
      console.log("Processing file: " + this.file);
      if (!fs.existsSync(this.file)) {
        console.log("Error, could not open file: " + this.file);
        return;
      }

      var data = new Uint8Array(fs.readFileSync(this.file));
      var document = PDFJS.getDocument(data).then(function (document) {
        var lastPromise, documentInfo;
        var documentText = "";
        var lastY = 0;

        lastPromise = document.getMetadata().then(function (data) {
          documentInfo = data;
        });

        var loadPage = function (pageNumber) {
          return document.getPage(pageNumber).then(function (page) {
            lastY = 0;
            return page.getTextContent().then(function (content) {
              content.items.map(function (item) {
                if ( item.transform[5] < lastY ) {
                  documentText += "\n";
                } else if (documentText !== "") {
                  documentText += " ";
                }
                documentText += item.str;
                lastY = item.transform[5];
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