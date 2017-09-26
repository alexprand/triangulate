// Main.js Global variables
var height = 500;
var width = 500;
var BLUR_RADIUS = 0;
var NUM_POINTS = 1000;
var img;

// Get triangle centers
var getSites = function() {
    return d3
        .range(NUM_POINTS)
        .map(function(d) {
            return [
                Math.random() * width,
                Math.random() * height
            ];
        });
}
var sites = getSites();

// Function to build -- after image is uploaded
var build = function() {
    // Select image
    img = document.getElementById('my-img');
    img.height = height;
    // img.width = width;
    console.log('img build ', img)

    // Make Canvas elements (for photos)
    canvases.forEach(makeCanvas)

    // Append arrow
    $('.ele-container').append('<span>&#x2192;</span>')

    // Blur Canvases
    drawBlur()
    // Append svgs (for triangles)
    appendSvgs();
    canvases.map(drawTriangle);
};

// Canvases to draw
var canvases = [{
    id: 'heroCanvas',
    className: 'hero'
}];

// Function to make Canvas elements
var makeCanvas = function(can) {
    console.log('make canvas ', img)
    var canvas = document.createElement('canvas');
    canvas.id = can.id;
    canvas.className += can.className;
    canvas.width = width;
    canvas.height = height;
    canvas
        .getContext('2d')
        .drawImage(img, 0, 0, width, height);
    document
        .getElementsByClassName('ele-container')[0]
        .appendChild(canvas);
}
// canvases.forEach(makeCanvas) Blur the canvas
var drawBlur = function() {
    var canvas = document.getElementById('heroCanvas');
    canvas
        .getContext('2d')
        .drawImage(img, 0, 0, width, height);
    stackBlurCanvasRGBA('heroCanvas', 0, 0, width, height, BLUR_RADIUS);
};

// Function to draw Path
var drawPath = function(tri, can) {
    var canvas = document.getElementById(can);
    tri
        .attr("d", function(d) {
            return "M" + d.join("L") + "Z";
        })
        .style("fill", function(d) {
            var x = 0;
            var y = 0;
            d.forEach(function(dd) {
                x += dd[0];
                y += dd[1];
            })
            x = x / 3;
            y = y / 3;
            var pixelData = canvas
                .getContext('2d')
                .getImageData(x, y, 1, 1)
                .data;
            return 'rgba(' + pixelData.toString() + ')';
        });
}
var appendSvgs = function() {
    canvases
        .forEach(function(can) {
            d3
                .select('.ele-container')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('id', 'svg-' + can.id)
                .append("g")
                .attr("class", "triangles " + can.id)

        })
}

// Function to draw triangles
var drawTriangle = function(can) {
    var voronoi = d3.voronoi();

    var triangles = d3
        .select('#svg-' + can.id + ' g')
        .selectAll("path")
        .data(voronoi.triangles(sites))

    triangles
        .enter()
        .append('path')
        .merge(triangles)
        .call(drawPath, can.id);

    triangles
        .exit()
        .remove();
};

// Change events
$('#blur-size input').val(BLUR_RADIUS)
$('#num-points input').val(NUM_POINTS)
$('#blur-size input').on('change', function(value) {
    BLUR_RADIUS = this.value;
    drawBlur();
    d3
        .select('#svg-heroCanvas')
        .selectAll('path')
        .call(drawPath, 'heroCanvas')
});

// Number of triangle points
$('#num-points input').on('change', function(value) {
    NUM_POINTS = this.value;
    sites = getSites();
    canvases.map(drawTriangle)
});


// $('#file').on('click', function() {
//     // Get rid of background images
//     setTimeout(function() {
//         $('.image-background').animate({
//             'opacity': 0
//         }, 1000, function() {
//             $(this).remove()
//         });
//     }, 1000)

// })
// File uploader
$("#file").change(function() {
    // New file reader
    var reader = new FileReader();
    // Empty the container -- a little lazy
    $('.ele-container').empty();
    $('canvas').remove();
    reader.onloadend = function(e) {
        img = document.getElementById('my-img');
        img.src = e.target.result;
        // Unsure why this is necessary to setTimeout
        setTimeout(build, 1)
    };

    reader.readAsDataURL(this.files[0]);

});
// Wait for image to load
$(window).on("load", function() {
    build();
    $('.modal').modal();
});
$(".button-collapse").sideNav();