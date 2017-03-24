jQuery.noConflict();

(function($, PLUGIN_ID) {
  "use strict";

  var config = kintone.plugin.app.getConfig(PLUGIN_ID);
  var webhookUrl = config.url;
  var headers = {
    "Accept": "application/json",
    "Content-Type": "application/json"
  };

  var setSubmitNotificationEvent = function () {
    var submitEvents = [
      "app.record.index.edit.submit.success",
      "app.record.edit.submit.success",
      "app.record.create.submit.success"
    ];
    kintone.events.on(submitEvents, function (e) {
      kintone.Promise.all([appPromise(e.appId), formPromise(e.appId)]).then(function (values) {
        var app = values[0], form = values[1];
        var eventString = (e.type.indexOf('create') !== -1) ? "作成" : "更新";
        var recordUrl = window.location.protocol + "//" + window.location.host + "/k/" + e.appId + "/show#record=" + e.recordId;
        var payload = {
          message: "kintone " + app.name + " (appId:" + e.appId + ") のレコード " + e.recordId + " が" + eventString + "されました\n" + recordUrl + "\n```" + recordToText(e.record, e.appId, form) + "```"
        };
        return kintone.proxy(webhookUrl, 'POST', headers, payload);
      }).then(function (args) {
        var body = args[0], status = args[1], headers = args[2];
        console.log(status, body);
      }).catch(function (error) {
        console.error(error);
      });
    });
  };

  var recordToText = function (record, appId, form) {
    var values = Object.keys(record).reduce(function (obj, key) {
      var formProperty = form.properties.find(function (property) {
        return property.code === key;
      });
      var label = (formProperty && formProperty.label) || key;
      obj[label] = record[key].value;
      return obj;
    }, {});
    return json2yaml.stringify(values);
  }

  var apps = {};
  var appPromise = function (appId) {
    if (!apps[appId]) {
      apps[appId] = kintone.api(kintone.api.url("/k/v1/app", true), 'GET', { id: appId });
    }
    return apps[appId];
  }
  var forms = {};
  var formPromise = function (appId) {
    if (!forms[appId]) {
      forms[appId] = kintone.api(kintone.api.url("/k/v1/form", true), 'GET', { app: appId });
    }
    return forms[appId];
  }

  setSubmitNotificationEvent();

})(jQuery, kintone.$PLUGIN_ID);
