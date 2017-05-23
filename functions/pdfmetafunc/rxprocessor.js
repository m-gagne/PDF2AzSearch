'use strict';

var objectAssign = require('object-assign');

var RXProcessor = function (config) {
  this.config = config;
  this.defaultOptions = {
    trimWhiteSpace: true,
    flags: "i"
  }
}

RXProcessor.prototype.process = function(text, rules) {
  var __this = this;
  var data = {};

  rules.forEach(function (rule) {
    switch (rule.type.toUpperCase()) {
      case "FIRSTSINGLE":
        data[rule.key] = __this.extractFirstSingle(text, rule);
        break;
      case "ALL":
        data[rule.key] = __this.extractAll(text, rule);
        break;
      case "ALLUNIQUE":
        data[rule.key] = __this.extractAllUnique(text, rule);
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
  console.log(data);
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