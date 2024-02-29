# Panchgani Hills
Interactive animation made during workaway for [NOCT](https://noct.in/) [design studio](https://www.instagram.com/noctindia/)
in Feb 2024. Wouldn't come to existence without [Yuri Artiukh's](https://www.youtube.com/channel/UCDo7RTzizoOdPjY8A-xDR7g)
wonderful tutorials.

Developed on Node.js v21.6.2.

# Local install
## From zip file (if you have one)
Install Node.
Open terminal (for Mac cmd + space, type Terminal).
Type `unzip <file>` hit enter.
Type `cd unzipped` enter, and then `npx vite`. Navigate to http://localhost:5173/.
## From git
Install git, Node, npm.
Open terminal, type `git clone`, then `cd`, then `npm install`.

# Launching
Form the unzipped/cloned directory run.
`npx vite`, and navigate to http://localhost:5173/ to see the animation
locally on your computer.

# Development
## Changing the camera
`sceneControls.js` contains a bunch of `Setup` classes responsible for controlling
the camera.

You can control it manually by commenting-out `this.controls.enabled = false;` in
`app.js` and using your mouse to navigate the scene. If you want to know the current
camera positions and look directions you can uncomment the `sketch.controls.addEventListener`
lines in `app.js` and then whenever you change the camera with your mouse, the current
values will be displayed to the browser's developer console.

## Adjusting sizes
In `mountains.js` change `xBound` and `zBound` to change the size of the animation. It
spans `[-xBound, xBound]` and `[-zBound, zBound]` on the XZ-plane. `lineSampleCount`
is the number of points used to draw a line. Unexpected things might happen if you
set it to anything other than four times `lineCount`.

## Line placement
Lines are initially laid flat on the XZ plane as described by the variables above. The points
making the lines are evenly spaced. This is then processed by the `vertexLine` shader which
is responsible for elevating the points along the Y axis to their final 'mountains' position,
as well as making them flow and be disturbed by the mouse. It is a shader from `MeshLineMaterial`
with some changes marked by the comments.

`distortionSize` in `app.js` controls the scale of the mouse distortion,
`amplitude` the maximum height of the mountains.

## Line colors
Colors are decided in the `fragmentLine` shader. It contains hardcoded colors, assigns them to
the lines are changes them with `lineSpeed` from `app.js`. Only the lines marked by the comments
contain the Panchgani-code - the rest is original shader code from `MeshLineMaterial`.

## Events

## FBO
`SyntheticMountains` class encodes the line points positions in a texture in `setupFBO()`, rendering it
in `renderTexture()` using shaders `fboVertex.glsl` and `fboFragment.glsl`, and then using it to
render the points in the actual scene via `uPositions` uniform. At the moment this is an unnecessary complication but this
setup can be used for a better control of the points' positions.