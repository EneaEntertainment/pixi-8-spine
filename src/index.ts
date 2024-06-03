import 'pixi.js/basis';

import { Application, Assets } from 'pixi.js';
import { AtlasAttachmentLoader, SkeletonBinary, SkeletonJson, Spine } from '@pixi/spine-pixi';

import type { TextureAtlas } from '@pixi/spine-pixi';

window.onload = main;

async function main()
{
    const app = new Application();

    await app.init({
        backgroundColor : 0x1099bb,
        resizeTo        : window
    });

    document.body.appendChild(app.canvas);

    Assets.add({ alias: 'skeleton', src: 'spine/spineboy.skel' });
    Assets.add({ alias: 'png', src: 'spine/spineboy-png.atlas' });
    Assets.add({ alias: 'basis', src: 'spine/spineboy-basis.atlas' });

    await Assets.load(['skeleton', 'png', 'basis']);

    const png = getSpine('skeleton', 'png');

    png.position.set((app.screen.width / 2) - 200, app.screen.height - 100);
    png.state.setAnimation(0, 'walk', true);

    app.stage.addChild(png);

    const basis = getSpine('skeleton', 'basis');

    basis.position.set((app.screen.width / 2) + 200, png.y);
    basis.state.setAnimation(0, 'walk', true);

    app.stage.addChild(basis);

    app.ticker.add((t) =>
    {
        png.update(t.deltaMS * 0.001);
        basis.update(t.deltaMS * 0.001);
    });
}

function getSpine(skeleton: string, atlas: string): Spine
{
    const skeletonAsset = Assets.get<any | Uint8Array>(skeleton);

    const atlasAsset = Assets.get<TextureAtlas>(atlas);
    const attachmentLoader = new AtlasAttachmentLoader(atlasAsset);

    const parser: SkeletonBinary | SkeletonJson = skeletonAsset instanceof Uint8Array ?
        new SkeletonBinary(attachmentLoader) :
        new SkeletonJson(attachmentLoader);

    parser.scale = 0.5;

    const skeletonData = parser.readSkeletonData(skeletonAsset);

    const spine = new Spine({ skeletonData });

    spine.autoUpdate = false;

    return spine;
}
