# Passage (port)

Jason Rohrer's Passage v4 (2007), ported from its C++ source (`re/passage/`). The 100×16 picture is shown
on the SDK's pixel screen at the largest whole-number zoom that fits the window, on black.

## Controls

* **Arrow keys** walk (a gamepad's stick, as the original's joystick, or its d-pad).
* **Any key** on the title starts a life.
* **B** while held zooms down to 1× and back up, as in the original; **F** toggles full screen.
* **Q** or **Esc** leaves (the original quit the program).
* **S** while held turns off the smoothed stepping of the screen (a key the original has).

## Deviations the browser forces

* **Size**: the window decides the largest zoom (the original's full screen was 640×480, zoom 6).
* **Sound**: synthesized at the original's 22050 Hz and resampled linearly to the browser's rate; it
  starts with the first key or click (browsers allow sound only after one).
* **Gamepad d-pad**: also walks (the original read only the joystick's axes).
* **Keyboard needed**: there are no touch controls, as in the original.
