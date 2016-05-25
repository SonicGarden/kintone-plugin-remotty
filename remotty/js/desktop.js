jQuery.noConflict();

(function($, PLUGIN_ID) {
  "use strict";

  var changeEventBase = [
    "app.record.index.edit.change",
    "app.record.edit.change",
    "app.record.create.change"
  ];

  // var setNotificationEvent = function (codes) {
  //   var changeEvents = [];
  //   changeEventBase.forEach(function (base) {
  //     codes.forEach(function (code) {
  //       changeEvents.push(base + "." + code);
  //     });
  //   });
  //   kintone.events.on(changeEvents, function (e) {
  //     var code = e.type.split(".").pop();
  //     appPromise(e.appId).then(function (app) {
  //       var payload = {
  //         message: "kintone " + app.name + " (appId:" + e.appId + ") の " + code + " が更新されました\n`" + e.changes.field.value + "`"
  //       };
  //       kintone.proxy(webhookUrl, 'POST', headers, payload).then(function (args) {
  //         var body = args[0], status = args[1], headers = args[2];
  //         console.log(status, body);
  //       });
  //     });
  //   });
  // };

  var config = kintone.plugin.app.getConfig(PLUGIN_ID);
  var webhookUrl = config.url;
  var headers = {
    "Accept": "application/json",
    "Content-Type": "application/json"
  };

  var setSubmitNotificationEvent = function () {
    var submitEvents = [
      "app.record.index.edit.submit",
      "app.record.edit.submit",
      "app.record.create.submit"
    ];
    kintone.events.on(submitEvents, function (e) {
      appPromise(e.appId).then(function (app) {
        var payload = {
          message: "kintone " + app.name + " appId:" + e.appId + " recordId:" + e.recordId + " が更新されました\n```" + recordToText(e.record) + "```"
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

  var recordToText = function (record) {
    var values = Object.keys(record).reduce(function (obj, key) {
      obj[key] = record[key].value;
      return obj;
    }, {});
    return json2yaml.stringify(values);
  }

  var apps = {};
  var appPromise = function (appId) {
    if (!apps[appId]) {
      apps[appId] = kintone.api(
        kintone.api.url("/k/v1/app", true),
        'GET',
        { id: appId }
      );
    }
    return apps[appId];
  }

  setSubmitNotificationEvent();

})(jQuery, kintone.$PLUGIN_ID);
