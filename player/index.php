<html>
    <head>
        <script src="//code.jquery.com/jquery-1.11.2.min.js"></script>
        <script src="../latest.js"></script>
        <script src="latest.js"></script>
        <link href="latest.css" rel="stylesheet" type="text/css">
    </head>
    <body>
        <div style="width: 50%">
            <video>
                <!--<source src="https://30bf1a3f86d41a253ea1-2fa5ba707c933b08a0ac977668a2c7e8.ssl.cf3.rackcdn.com/files/1447961582_Amp%C3%A8re.mp4" type="video/mp4">-->
                <source src="Alpecin_Werbespot.mp4" type="video/mp4">
            </video>
        </div>
        <script>
            var p = Fancy( 'video' ).player( {
                autoplay : false,
                theme: "red"//,
                //start : 35
                
            } );
            
            p.onPlay = function(){
				console.log(this);
			};
        </script>
    </body>
</html>
