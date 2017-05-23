'use strict';

var objectAssign = require('object-assign');

var RXProcessor = function (config) {
  this.config = config;
  this.defaultOptions = {
    trimWhiteSpace: true,
    flags: "i"
  }
}

RXProcessor.prototype.prepareText = function(text, rule)
{
  let options = objectAssign({}, this.defaultOptions, rule.options);
  let preparedText = text;
  if (rule.startKeyword && rule.endKeyword) {
    let start = preparedText.toLowerCase().indexOf(rule.startKeyword.toLowerCase()) + rule.startKeyword.length;
    let end = preparedText.toLowerCase().indexOf(rule.endKeyword.toLowerCase());
    preparedText = preparedText.substring(start, end);
  }

  if (options.trimWhiteSpace) {
    preparedText = preparedText.trim();
  }

  return preparedText;
}

RXProcessor.prototype.process = function(text, rules) {
  var data = {};

  rules.forEach((rule) => {
    let preparedText = this.prepareText(text, rule);
    switch (rule.type.toUpperCase()) {
      case "FIRSTSINGLE":
        data[rule.key] = this.extractFirstSingle(preparedText, rule);
        break;
      case "ALL":
        data[rule.key] = this.extractAll(preparedText, rule);
        break;
      case "ALLUNIQUE":
        data[rule.key] = this.extractAllUnique(preparedText, rule);
        break;
    }
  });

  return data;
}

RXProcessor.prototype.extractFirstSingle = function(text, rule) {
  var options = objectAssign({}, this.defaultOptions, rule.options);

  var match = text.match(this.createExpression(rule.expression, options));
  if (!match) {
    return rule.default || null;
  }

  return(this.processMatch(match[1], options));
}

RXProcessor.prototype.extractAllUnique = function(text, rule) {
  var data = this.extractAll(text, rule);
  var onlyUnique = function(value, index, self) {
    return self.indexOf(value) === index;
  }
  
  data = data.filter(onlyUnique);
  return data;
}

RXProcessor.prototype.extractAll = function(text, rule) {
  var options = objectAssign({}, this.defaultOptions, rule.options);

  var expression = this.createExpression(rule.expression, options);
  var matches = [];
  var match;
  
  while (match = expression.exec(text))
  {
    matches.push(match[1]);
  }

  if (matches.length === 0) {
    return rule.default || null;
  }

  return(this.processMatches(matches, options));
}

RXProcessor.prototype.createExpression = function(rule, options) {
  return new RegExp(rule, options.flags);
}

RXProcessor.prototype.processMatches = function(values, options) {
  var __this = this;
  values = values.map(function(value) {
    return __this.processMatch(value, options);
  })

  return values;
}

RXProcessor.prototype.processMatch = function(value, options) {
  if (!value) {
    return value;
  }
  
  if (options.trimWhiteSpace) value = value.trim();

  return value;
}

module.exports = RXProcessor;