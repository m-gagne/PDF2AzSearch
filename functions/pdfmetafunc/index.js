var PDFTextExtractor = require('./pdftextextractor');
var RXProcessor = require('./rxprocessor');
var rules = require('./rules.json');

module.exports = function (context, document) {
  var pdfExtractor = new PDFTextExtractor();

  var config = {
    trimWhiteSpace: true 
  };

  var rxProcessor = new RXProcessor(config);

  pdfExtractor.getDataFromBuffer(document).then(function(data) {
    let meta = rxProcessor.process(data.text, rules);
      
    var document = {
      text: data.text,
      meta: meta
    }

    context.log(JSON.stringify(document, null, 4));
    context.done();
  });
}