module.exports = function (context, document) {
  context.log(document);
  context.log("done!");
  // Close context (end function)
  context.done();
}