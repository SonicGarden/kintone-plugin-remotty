const json2yaml = require("json2yaml");
jQuery.noConflict();

(($, PLUGIN_ID) => {
  "use strict";

  const config = kintone.plugin.app.getConfig(PLUGIN_ID);
  const webhookUrl = config.url;
  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/json"
  };

  const setSubmitNotificationEvent = () => {
    window.kintonePluginRemotty = {};

    const editShowEvents = [
      "app.record.index.edit.show",
      "app.record.edit.show"
    ];
    kintone.events.on(editShowEvents, (e) => {
      console.log(e);
      setOriginalRecord(e.appId, e.recordId, e.record);
    });
    const submitSuccessEvents = [
      "app.record.index.edit.submit.success",
      "app.record.edit.submit.success",
      "app.record.create.submit.success"
    ];
    kintone.events.on(submitSuccessEvents, (e) => {
      console.log(e);
      kintone.Promise.all([appPromise(e.appId), formPromise(e.appId)]).then(([app, form]) => {
        const originalRecord = getOriginalRecord(e.appId, e.recordId);
        setOriginalRecord(e.appId, e.recordId, e.record);
        const eventString = (e.type.indexOf('create') !== -1) ? "作成" : "更新";
        const recordUrl = `${window.location.protocol}//${window.location.host}/k/${e.appId}/show#record=${e.recordId}`;
        const THREE_BACKTICKS = "```";
        const payload = {
          message: `kintone ${app.name} (appId:${e.appId}) のレコード ${e.recordId} が${eventString}されました\n${recordUrl}\n${THREE_BACKTICKS}${recordToText(e.record, originalRecord, form)}${THREE_BACKTICKS}`
        };
        return kintone.proxy(webhookUrl, 'POST', headers, payload);
      }).then(([body, status, headers]) => {
        console.log(status, body);
      }).catch((error) => {
        console.error(error);
      });
    });
  };

  const recordToText = (record, originalRecord, form) => {
    const values = Object.keys(record).reduce((obj, key) => {
      if (originalRecord[key] == null || JSON.stringify(record[key].value) !== JSON.stringify(originalRecord[key].value)) {
        const formProperty = form.properties.find((property) => property.code === key);
        const label = (formProperty && formProperty.label) || key;
        obj[label] = record[key].value;
      }
      return obj;
    }, {});
    return json2yaml.stringify(values);
  }

  let apps = {};
  const appPromise = (appId) => {
    if (!apps[appId]) {
      apps[appId] = kintone.api(kintone.api.url("/k/v1/app", true), 'GET', { id: appId });
    }
    return apps[appId];
  }
  let forms = {};
  const formPromise = (appId) => {
    if (!forms[appId]) {
      forms[appId] = kintone.api(kintone.api.url("/k/v1/form", true), 'GET', { app: appId });
    }
    return forms[appId];
  }
  const getOriginalRecord = (appId, recordId) => (
    (window.kintonePluginRemotty != null ? window.kintonePluginRemotty[`${appId}/${recordId}`] : null) || {}
  )
  const setOriginalRecord = (appId, recordId, record) => {
    window.kintonePluginRemotty = {
      [`${appId}/${recordId}`]: record
    };
  }

  setSubmitNotificationEvent();

})(jQuery, kintone.$PLUGIN_ID);
