 /* JS comes here */
 (function() {

    var width = 320; // We will scale the photo width to this
    var height = 0; // This will be computed based on the input stream

    var streaming = false;

    var video = null;
    var canvas = null;
    var photo = null;
    var startbutton = null;

    var data = null;
    var blob = null;
    function startup() {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        startbutton = document.getElementById('startbutton');

        navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            })
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
            })
            .catch(function(err) {
                console.log("An error occurred: " + err);
            });

        video.addEventListener('canplay', function(ev) {
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth / width);

                if (isNaN(height)) {
                    height = width / (4 / 3);
                }

                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);

        startbutton.addEventListener('click', function(ev) {
            takepicture();
            ev.preventDefault();
        }, false);

        clearphoto();
    }


    function clearphoto() {
        var context = canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);

        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
    }

    function takepicture() {
        var context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            var data = canvas.toDataURL('image/png');
          // convert to Blob (async)
            canvas.toBlob( (blob) => {
                const file = new File( [ blob ], "file.png" );
                const dT = new DataTransfer();
                dT.items.add( file );
                document.querySelector("input").files = dT.files;
                getPrediksi()
            } );
        } else {
            clearphoto();
        }
    }
    function dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);
    
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
    
        return new Blob([ia], {type:mimeString});
    }
    function getPrediksi()
    {
        clearForm()
       var fd = new FormData();
       var files = $('#filepoto')[0].files[0];
       fd.append('file', files);
        $.ajax({
            type: "POST",
            url: "https://prima-openapi.herokuapp.com/predict/face",
            type: 'post',
            data: fd,
            contentType: false,
            processData: false,
            beforeSend: function() {
                $('#spinner-id').removeClass('collapse')
            },
            success: function(data) {
                let val = data[0];
                console.log(val)
                $('#spinner-id').addClass('collapse')
              $("#wajah-list").append(`
              <div class="col">
              <div class="card" style="box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;">
              <div class="card-body">
             
              <ul class="list-group list-group-flush">
                <li class="list-group-item">Age : `+val.Years+`</li>
              
                <li class="list-group-item">Etnis : `+val.Ethnicity+`</li>
                <li class="list-group-item">Gender : `+val.Gender+`</li>
              
              </ul>
            </div>
          </div>
              `)
            },
            error: function(err) {
                $('#spinner-id').addClass('collapse')
            }
        });
    }

    function clearForm() {
        $('#wajah-list').html("")    
    }
    window.addEventListener('load', startup, false);
})();