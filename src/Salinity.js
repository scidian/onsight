/**
 * @description Salinity
 * @about       Interactive, easy to use JavaScript game framework.
 * @author      Written by Stephens Nunnally <@stevinz>
 * @license     MIT - Copyright (c) 2024 Stephens Nunnally
 * @source      https://github.com/salinityengine
 */

/******************** CONSTANTS ********************/

import { VERSION } from './constants.js';
export * from './constants.js';

/******************** APP ********************/

export { App } from './app/App.js';
export { AssetManager } from './app/AssetManager.js';
export { SceneManager } from './app/SceneManager.js'

/******************** CORE ********************/

export { Clock } from './core/Clock.js';
export { Thing } from './core/Thing.js';

export { Camera2D } from './core/Camera2D.js';
export { Object2D } from './core/Object2D.js';
export { Renderer } from './core/Renderer.js';
export { Viewport } from './core/Viewport.js';

// Assets
export { Asset } from './core/assets/Asset.js';
export { Palette } from './core/assets/Palette.js';
export { Script } from './core/assets/Script.js';

// Input
export { Key } from './core/input/Key.js';
export { Keyboard } from './core/input/Keyboard.js';
export { Pointer } from './core/input/Pointer.js';

// Project
export { Entity } from './core/project/Entity.js';
export { Project } from './core/project/Project.js';
export { Stage } from './core/project/Stage.js';
export { World } from './core/project/World.js';

// Objects
export { Box } from './core/objects/Box.js';
export { Circle } from './core/objects/Circle.js';
export { Line } from './core/objects/Line.js';
export { Sprite } from './core/objects/Sprite.js';
export { Text } from './core/objects/Text.js';
// export { DOM } from './core/objects/DOM.js';
// export { MultiLineText } from './core/objects/MultiLineText.js';
// export { Pattern } from './core/objects/Pattern.js';
// export { RoundedBox } from './core/objects/RoundedBox.js';

// Objects, Curves
// export { BezierCurve } from './core/objects/BezierCurve.js';
// export { QuadraticCurve } from './core/objects/QuadraticCurve.js';
// export { Path } from './core/objects/Path.js';

// Objects, Mask
export { Mask } from './core/objects/mask/Mask.js';
export { BoxMask } from './core/objects/mask/BoxMask.js';

// Objects, Style
export { Style } from './core/objects/style/Style.js';
export { ColorStyle } from './core/objects/style/ColorStyle.js';
export { LinearGradientStyle } from './core/objects/style/LinearGradientStyle.js';
export { RadialGradientStyle } from './core/objects/style/RadialGradientStyle.js';
// export { PatternStyle } from './core/objects/style/PatternStyle.js';

/******************** MATH ********************/

export { Box2 } from './math/Box2.js';
export { Matrix2 } from './math/Matrix2.js';
export { Vector2 } from './math/Vector2.js';
export { Vector3 } from './math/Vector3.js';

/******************** UTILS ********************/

export { ArrayUtils } from './utils/ArrayUtils.js';
export { MathUtils } from './utils/MathUtils.js';
export { SysUtils } from './utils/SysUtils.js';

/******************** SINGLE IMPORT ********************/

if (typeof window !== 'undefined') {
    if (window.__SALINITY__) console.warn(`Salinity v${window.__SALINITY__} already imported, now importing v${VERSION}!`);
    else window.__SALINITY__ = VERSION;
}
