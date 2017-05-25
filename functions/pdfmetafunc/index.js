const crypto = require('crypto');
const rules = require('./rules.json');
const textmeta = require('textmeta');

module.exports = function (context, document) {
  textmeta.extractFromPDFBuffer(document, rules).then((result) => {
    const uriHash = crypto.createHash('sha256')
                    .update(context.bindingData.uri)
                    .digest('hex');

    var document = {
      id: uriHash,
      name: context.bindingData.name + ".pdf",
      text: result.text,
      last_updated: new Date(),
      meta: result.meta
    }

    // DEBUG LOGGING
    context.log("Updating document => " + document.id);
    context.log("Metadata found => " + JSON.stringify(document.meta, null, 4));

    context.bindings.out = document;
    context.done();

  });
}