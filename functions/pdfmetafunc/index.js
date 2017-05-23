const crypto = require('crypto');
const PDFTextExtractor = require('./pdftextextractor');
const RXProcessor = require('./rxprocessor');
const rules = require('./rules.json');

module.exports = function (context, document) {
  var pdfExtractor = new PDFTextExtractor();
  var config = {
    trimWhiteSpace: true 
  };

  var rxProcessor = new RXProcessor(config);
  const uriHash = crypto.createHash('sha256')
                   .update(context.bindingData.uri)
                   .digest('hex');

  pdfExtractor.getDataFromBuffer(document).then(function(data) {
    var metaData = rxProcessor.process(data.text, rules);
    var document = {
      id: uriHash,
      name: context.bindingData.name + ".pdf",
      text: data.text,
      last_updated: new Date(),
      meta: metaData
    }

    // DEBUG LOGGING
    context.log("Updating document => " + document.id);
    context.log("Metadata found => " + JSON.stringify(document.meta, null, 4));

    context.bindings.out = document;
    context.done();
  });
}