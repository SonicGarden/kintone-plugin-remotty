jQuery.noConflict();

(function($, PLUGIN_ID) {
    "use strict";

    $(function() {
        var PREFIX = 'sendgrid-plugin-';
        var SENDGRID_URL = 'https://api.sendgrid.com/api/';

        var $id = function(name) {
            return $('#' + PREFIX + name);
        };

        // load configuration
        var config = kintone.plugin.app.getConfig(PLUGIN_ID);
        if (config.url) {
          $id('api-key').val(config.url);
        }

        // var proxyConfig = kintone.plugin.app.getProxyConfig(SENDGRID_URL, 'POST');
        //
        // if (proxyConfig && proxyConfig.headers.Authorization) {
        //   var bearer = proxyConfig.headers.Authorization;
        //   $id('api-key').val(bearer.slice(7));
        // }

        $id('submit').click(function() {
            // save configuration
            var apiKey = $id('api-key').val();
            if (!apiKey) {
                alert("入力してください。");
                return;
            }
            var config = {url: apiKey};
            kintone.plugin.app.setConfig(config);
            // var headers = {};
            // headers.Authorization = "Bearer " + apiKey;
            // kintone.plugin.app.setProxyConfig(SENDGRID_URL
            //         , 'POST', headers, {}, function() {
            //     kintone.plugin.app.setConfig(config);
            // });
        });
        $id('cancel').click(function() {
            history.back();
        });
    });
})(jQuery, kintone.$PLUGIN_ID);
