/**
🖼
@file backdrops
@summary makes the game have a backdrop
@license MIT
@author Cephalopodunk & Sean S. LeBlanc
@version 20.1.0
@requires Bitsy 7.12


@description
Shows backdrops behind the game

Note: includes transparent background/sprites

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
3. You may need to add `background-size: cover` to the #game CSS up above to get the backdrop to fit correctly in the game screen
*/
this.hacks = this.hacks || {};
(function (exports, bitsy) {
'use strict';
var hackOptions = {
	// If true, backdrop changes will persist across rooms without a backdrop defined
	permanent: false,
	// Backdrops shown by room
	// Include an entry in this map for every room that you want to trigger a change,
	// and then specify the image source for the backdrop (generally a file path relative to your game's html file).
	// Expand the map to include as many rooms as you need.
	backdropsByRoom: {
		'room name or id': './images/image for room.png',
	},
	// Backdrop shown during title
	backdropTitle: './images/title.png',
	// transparent sprites option
	isTransparent: function (drawing) {
		// return drawing.name == 'tea'; // specific transparent drawing
		// return ['tea', 'flower', 'hat'].indexOf(drawing.name) !== -1; // specific transparent drawing list
		// return drawing.name && drawing.name.indexOf('TRANSPARENT') !== -1; // transparent drawing flag in name
		return true; // all drawings are transparent
	},
};

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

bitsy = bitsy || /*#__PURE__*/_interopDefaultLegacy(bitsy);

/**
 * Helper used to replace code in a script tag based on a search regex.
 * To inject code without erasing original string, using capturing groups; e.g.
 * ```js
 * inject(/(some string)/,'injected before $1 injected after');
 * ```
 * @param searcher Regex to search and replace
 * @param replacer Replacer string/fn
 */
function inject$1(searcher, replacer) {
    // find the relevant script tag
    var scriptTags = document.getElementsByTagName('script');
    var scriptTag;
    var code = '';
    for (var i = 0; i < scriptTags.length; ++i) {
        scriptTag = scriptTags[i];
        if (!scriptTag.textContent)
            continue;
        var matchesSearch = scriptTag.textContent.search(searcher) !== -1;
        var isCurrentScript = scriptTag === document.currentScript;
        if (matchesSearch && !isCurrentScript) {
            code = scriptTag.textContent;
            break;
        }
    }
    // error-handling
    if (!code || !scriptTag) {
        throw new Error('Couldn\'t find "' + searcher + '" in script tags');
    }
    // modify the content
    code = code.replace(searcher, replacer);
    // replace the old script tag with a new one using our modified code
    var newScriptTag = document.createElement('script');
    newScriptTag.textContent = code;
    scriptTag.insertAdjacentElement('afterend', newScriptTag);
    scriptTag.remove();
}
/**
 * Helper for getting an array with unique elements
 * @param  {Array} array Original array
 * @return {Array}       Copy of array, excluding duplicates
 */
function unique(array) {
    return array.filter(function (item, idx) {
        return array.indexOf(item) === idx;
    });
}
// Ex: inject(/(names.sprite.set\( name, id \);)/, '$1console.dir(names)');
/** test */
function kitsyInject(searcher, replacer) {
    if (!kitsy.queuedInjectScripts.some(function (script) {
        return searcher.toString() === script.searcher.toString() && replacer === script.replacer;
    })) {
        kitsy.queuedInjectScripts.push({
            searcher: searcher,
            replacer: replacer,
        });
    }
    else {
        console.warn('Ignored duplicate inject');
    }
}
// Ex: before('load_game', function run() { alert('Loading!'); });
//     before('show_text', function run(text) { return text.toUpperCase(); });
//     before('show_text', function run(text, done) { done(text.toUpperCase()); });
function before$1(targetFuncName, beforeFn) {
    kitsy.queuedBeforeScripts[targetFuncName] = kitsy.queuedBeforeScripts[targetFuncName] || [];
    kitsy.queuedBeforeScripts[targetFuncName].push(beforeFn);
}
// Ex: after('load_game', function run() { alert('Loaded!'); });
function after$1(targetFuncName, afterFn) {
    kitsy.queuedAfterScripts[targetFuncName] = kitsy.queuedAfterScripts[targetFuncName] || [];
    kitsy.queuedAfterScripts[targetFuncName].push(afterFn);
}
function applyInjects() {
    kitsy.queuedInjectScripts.forEach(function (injectScript) {
        inject$1(injectScript.searcher, injectScript.replacer);
    });
}
function applyHooks(root) {
    var allHooks = unique(Object.keys(kitsy.queuedBeforeScripts).concat(Object.keys(kitsy.queuedAfterScripts)));
    allHooks.forEach(applyHook.bind(this, root || window));
}
function applyHook(root, functionName) {
    var functionNameSegments = functionName.split('.');
    var obj = root;
    while (functionNameSegments.length > 1) {
        obj = obj[functionNameSegments.shift()];
    }
    var lastSegment = functionNameSegments[0];
    var superFn = obj[lastSegment];
    var superFnLength = superFn ? superFn.length : 0;
    var functions = [];
    // start with befores
    functions = functions.concat(kitsy.queuedBeforeScripts[functionName] || []);
    // then original
    if (superFn) {
        functions.push(superFn);
    }
    // then afters
    functions = functions.concat(kitsy.queuedAfterScripts[functionName] || []);
    // overwrite original with one which will call each in order
    obj[lastSegment] = function () {
        var returnVal;
        var args = [].slice.call(arguments);
        var i = 0;
        function runBefore() {
            // All outta functions? Finish
            if (i === functions.length) {
                return returnVal;
            }
            // Update args if provided.
            if (arguments.length > 0) {
                args = [].slice.call(arguments);
            }
            if (functions[i].length > superFnLength) {
                // Assume funcs that accept more args than the original are
                // async and accept a callback as an additional argument.
                return functions[i++].apply(this, args.concat(runBefore.bind(this)));
            }
            // run synchronously
            returnVal = functions[i++].apply(this, args);
            if (returnVal && returnVal.length) {
                args = returnVal;
            }
            return runBefore.apply(this, args);
        }
        return runBefore.apply(this, arguments);
    };
}
/**
@file kitsy-script-toolkit
@summary Monkey-patching toolkit to make it easier and cleaner to run code before and after functions or to inject new code into script tags
@license WTFPL (do WTF you want)
@author Original by mildmojo; modified by Sean S. LeBlanc
@version 20.1.0
@requires Bitsy 7.12

*/
var kitsy = (window.kitsy = window.kitsy || {
    queuedInjectScripts: [],
    queuedBeforeScripts: {},
    queuedAfterScripts: {},
    inject: kitsyInject,
    before: before$1,
    after: after$1,
    /**
     * Applies all queued `inject` calls.
     *
     * An object that instantiates an class modified via injection will still refer to the original class,
     * so make sure to reinitialize globals that refer to injected scripts before calling `applyHooks`.
     */
    applyInjects,
    /** Apples all queued `before`/`after` calls. */
    applyHooks,
});

var hooked = kitsy.hooked;
if (!hooked) {
	kitsy.hooked = true;
	var oldStartFunc = bitsy.startExportedGame;
	bitsy.startExportedGame = function doAllInjections() {
		// Only do this once.
		bitsy.startExportedGame = oldStartFunc;

		// Rewrite scripts
		kitsy.applyInjects();

		// recreate the script and dialog objects so that they'll be
		// referencing the code with injections instead of the original
		bitsy.scriptModule = new bitsy.Script();
		bitsy.scriptInterpreter = bitsy.scriptModule.CreateInterpreter();

		bitsy.dialogModule = new bitsy.Dialog();
		bitsy.dialogRenderer = bitsy.dialogModule.CreateRenderer();
		bitsy.dialogBuffer = bitsy.dialogModule.CreateBuffer();
		bitsy.renderer = new bitsy.TileRenderer(bitsy.tilesize);

		// Hook everything
		kitsy.applyHooks();

		// reset callbacks using hacked functions
		bitsy.bitsyOnUpdate(bitsy.update);
		bitsy.bitsyOnQuit(bitsy.stopGame);
		bitsy.bitsyOnLoad(bitsy.load_game);

		// Start the game
		bitsy.startExportedGame.apply(this, arguments);
	};
}

/** @see kitsy.inject */
var inject = kitsy.inject;
/** @see kitsy.before */
var before = kitsy.before;
/** @see kitsy.after */
var after = kitsy.after;

/**
🏁
@file transparent sprites
@summary makes all sprites have transparent backgrounds
@license MIT
@author Sean S. LeBlanc
@version 20.1.0
@requires Bitsy 7.12


@description
Makes all sprites have transparent backgrounds.
i.e. tiles can be seen underneath the player, sprites, and items.

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/

var hackOptions$2 = {
	isTransparent: function (drawing) {
		// return drawing.name == 'tea'; // specific transparent drawing
		// return ['tea', 'flower', 'hat'].indexOf(drawing.name) !== -1; // specific transparent drawing list
		// return drawing.name && drawing.name.indexOf('TRANSPARENT') !== -1; // transparent drawing flag in name
		return true; // all drawings are transparent
	},
};

window.makeTransparent = false;
// flag what should be transparent
before('renderer.GetDrawingFrame', function (drawing, frameIndex) {
	window.makeTransparent = hackOptions$2.isTransparent(drawing);
});
// send -1 instead of background colour index if transparent
inject(/bitsyDrawPixel\(backgroundColor, x, y\)/, 'bitsyDrawPixel(window.makeTransparent ? -1 : backgroundColor, x, y)');
// overwrite transparent pixel
after('renderPixelInstruction', function (bufferId, buffer, paletteIndex, x, y) {
	if (paletteIndex !== -1) return;

	if (buffer.imageData) {
		for (var sy = 0; sy < buffer.scale; sy++) {
			for (var sx = 0; sx < buffer.scale; sx++) {
				var pixelIndex = (y * buffer.scale + sy) * buffer.width * buffer.scale * 4 + (x * buffer.scale + sx) * 4;
				buffer.imageData.data[pixelIndex + 3] = 0;
			}
		}
	} else {
		var bufferContext = buffer.canvas.getContext('2d');
		bufferContext.clearRect(x * buffer.scale, y * buffer.scale, buffer.scale, buffer.scale);
	}
});

/**
🔳
@file transparent background
@summary makes the game have a transparent background
@license MIT
@author Cephalopodunk & Sean S. LeBlanc
@version 20.1.0
@requires Bitsy 7.12


@description
Makes the game background transparent, showing whatever would be visible behind it in the html document.
Note that the bitsy canvas has a black background in CSS by default, which blocks things behind it.
Depending on your use case, you may need to change this (e.g. to `background: transparent;`)

Note: also includes transparent sprites

HOW TO USE:
1. Copy-paste this script into a script tag after the bitsy source
2. Edit hackOptions below as needed
*/

var hackOptions$1 = {
	// transparent sprites option
	isTransparent: function (drawing) {
		// return drawing.name == 'tea'; // specific transparent drawing
		// return ['tea', 'flower', 'hat'].indexOf(drawing.name) !== -1; // specific transparent drawing list
		// return drawing.name && drawing.name.indexOf('TRANSPARENT') !== -1; // transparent drawing flag in name
		return true; // all drawings are transparent
	},
};

// pass through transparent sprites option
hackOptions$2.isTransparent = function (drawing) {
	return hackOptions$1.isTransparent(drawing);
};

before('renderGame', function () {
	bitsy.ctx.clearRect(0, 0, bitsy.canvas.width, bitsy.canvas.height);
});

after('renderClearInstruction', function (bufferId, buffer, paletteIndex) {
	if (bufferId !== bitsy.screenBufferId || paletteIndex !== bitsy.tileColorStartIndex) return;
	var bufferContext = buffer.canvas.getContext('2d');
	bufferContext.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);
});





// pass through transparent sprites option
hackOptions$1.isTransparent = function (drawing) {
	return hackOptions.isTransparent(drawing);
};

var imgCache = [];
after('loadGame', function () {
	// set base style
	var game = document.getElementById('game');
	game.style.backgroundSize = 'cover';
	game.style.backgroundColor = 'transparent';
	// preload images
	Object.values(hackOptions.backdropsByRoom)
		.concat([hackOptions.imageTitle, hackOptions.imageDefault])
		.filter(function (src) {
			return src;
		})
		.reduce(function (result, src) {
			var img = new Image();
			img.src = src;
			result.push(img);
			return result;
		}, imgCache);
});

// hook up backdrops
var currentBackdrop;
function setBackdrop(src) {
	if (src === currentBackdrop) {
		return;
	}
	currentBackdrop = src;
	var game = document.getElementById('game');
	if (!src) {
		game.style.backgroundImage = null;
		return;
	}
	game.style.backgroundImage = 'url("' + src + '")';
}

before('drawRoom', function () {
	var backdrop = hackOptions.backdropsByRoom[bitsy.player().room];
	// if no backdrop defined + not permanent, reset
	if (backdrop !== undefined || !hackOptions.permanent) {
		setBackdrop(backdrop);
	}
});

after('startNarrating', function (dialogStr, end) {
	if (!end) {
		setBackdrop(hackOptions.backdropTitle);
	}
});

exports.hackOptions = hackOptions;

Object.defineProperty(exports, '__esModule', { value: true });

})(this.hacks.backdrops = this.hacks.backdrops || {}, window);
