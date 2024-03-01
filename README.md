# Panchgani Hills
Interactive animation made during workaway for [NOCT](https://noct.in/) [design studio](https://www.instagram.com/noctindia/)
in Feb 2024. Wouldn't come to existence without [Yuri Artiukh's](https://www.youtube.com/channel/UCDo7RTzizoOdPjY8A-xDR7g)
wonderful tutorials.

Developed on Node.js v21.6.2.

# Local install and launch
## From zip file (if you have one)
Double click on the zipped archive to unarchive it.
Install [Node](https://nodejs.org/en/download) with npm.
Open terminal (on a Mac press cmd + space and type 'Terminal').
In the terminal navigate to the unarchived folder (`pwd` for the path you are currently at, 
`cd <path>` to go to a path; if you have the folder `noct` on the Desktop you probably need to run
`cd Desktop/noct`).
`npm install` to install all the dependencies.

`npx vite` to launch the animation in http://localhost:5173/.

# Development
## Changing the camera
`sceneControls.js` contains a bunch of `Setup` classes responsible for controlling
the camera.

You can control it manually by commenting-out `this.controls.enabled = false;` in
`app.js` and using your mouse to navigate the scene. If you want to know the current
camera positions and look directions you can uncomment the `sketch.controls.addEventListener`
lines in `app.js` and then whenever you change the camera with your mouse, the current
values will be displayed to the browser's developer console.

## Events
At the moment the transitions between different parts of the animation is bound to keypress events.
Press `n` to transition to the hill-forming stage, repeatedly `m` to make the hill grow and `o` to
transition back to the initial screen.

When the animation is gonna be deployed to production you will want to bind the transitions to different
events like button clicks etc. 

At the very bottom of `app.js` file there is the `document.onkeyup` instruction and the code
under respective keystrokes. Just copy the code for other events and it should work like a charm.

## Adjusting sizes
In `mountains.js` change `xBound` and `zBound` to change the size of the animation. It
spans `[-xBound, xBound]` and `[-zBound, zBound]` on the XZ-plane. `lineSampleCount`
is the number of points used to draw a line. Unexpected things might happen if you
set it to anything other than four times `lineCount`.

## Line placement
Lines are initially laid flat on the XZ plane as described by the variables above. The points
making the lines are evenly spaced. This is then processed by the `vertexLine` shader which
is responsible for elevating the points along the Y axis to their final 'mountain' position,
as well as making them flow and be disturbed by the mouse. The shader is just a shader from `MeshLineMaterial`
with some changes marked by the comments.

`distortionSize` in `app.js` controls the scale of the mouse distortion,
`amplitude` the maximum height of the mountains.

## Line colors
Colors are decided in the `fragmentLine` shader. It contains hardcoded colors, assigns them to
the lines are changes them with `lineSpeed` from `app.js`. Only the lines marked by the comments
contain the Panchgani-code - the rest is original shader code from `MeshLineMaterial`.

## FBO
For advanced use only.

Uncommenting`this.mountains.setupFBO(this.renderer);` and `this.uniforms.uPositions.value = this.mountains.renderTexture(this.renderer);`
in `app.js` and then the fbo code in `vertexLine.glsl` gives a greater control over the position of points making the lines.

The line points positions are encoded in a texture in, which is then rendered using shaders `fboVertex.glsl` and `fboFragment.glsl`
and passed to the line shaders via the `uPositions` uniform. Setting `this.staticFbo = false;` within the
scene control will render the texture dynamically based on the values from the previous scene.

For more info refer to the last part of the Loom video, if you have it.