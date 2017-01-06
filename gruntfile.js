module.exports = function ( grunt ) {
    grunt.initConfig( {
        concat: {
            options: {
                separator: "\r\n",
                banner   : "(function(){\r\n",
                footer   : "\r\n})();"
            },
            dist   : {
                src : [ "src/fancy.js", "src/core.js", "src/*.js" ],
                dest: "dist/fancy.js"
            }
        },
        jsdoc : {
            dist: {
                src    : [ "<%= concat.dist.src %>" ],
                options: {
                    destination: "out"
                }
            }
        },
        clean : {
            build: {
                src: [ "<%= jsdoc.dist.options.destination %>" ]
            }
        },
        watch : {
            scripts: {
                files  : [ "<%= concat.dist.src %>" ],
                tasks  : [ "concat", "doc" ],
                options: {
                    debounceDelay: 2500
                }
            }
        }
    } );

    grunt.loadNpmTasks( "grunt-contrib-watch" );
    grunt.loadNpmTasks( "grunt-contrib-concat" );
    grunt.loadNpmTasks( "grunt-contrib-clean" );
    grunt.loadNpmTasks( "grunt-jsdoc" );

    grunt.registerTask( "doc", [ "clean", "jsdoc" ] )
};