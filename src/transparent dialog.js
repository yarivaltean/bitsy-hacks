/**
👁️‍🗨️
@file transparent dialog
@summary makes the dialog box have a transparent background
@license MIT
@author Sean S. LeBlanc

@description
Makes the dialog box have a transparent background.

HOW TO USE:
Copy-paste into a script tag after the bitsy source
*/
import bitsy from 'bitsy';
import { after } from './helpers/kitsy-script-toolkit';

after('renderClearInstruction', function (bufferId, buffer, paletteIndex) {
	if (bufferId !== bitsy.textboxBufferId || paletteIndex !== bitsy.textBackgroundIndex) return;
	var bufferContext = buffer.canvas.getContext('2d');
	bufferContext.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
});
