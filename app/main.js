require.config({
    paths: {
        'angular': '../bower_components/angular/angular',
        'angular-ui-router': '../bower_components/angular-ui-router/release/angular-ui-router',
        'angular-animate': '../bower_components/angular-animate/angular-animate',
        'app': 'app'
    },
    shim: {
        app: {
            deps: ['angular', 'angular-ui-router', 'angular-animate']
        }

    }

});

require(['app'], function(app) {
    app.init();
});
