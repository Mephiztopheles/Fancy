module.exports = function ( grunt ) {
    grunt.initConfig( {
        uglify: {
            options: {
                mangle   : false,
                sourceMap: true
            },
            dist   : {
                files: {
                    "fancy.min.js": [ "fancy.js" ]
                }
            }
        }
    } );

    grunt.loadNpmTasks( "grunt-contrib-uglify" );
};