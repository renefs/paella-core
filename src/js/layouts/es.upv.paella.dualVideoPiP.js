import VideoLayout from "../core/VideoLayout";

import defaultIconSwitchSide from 'paella-core/icons/icon_switch_side.svg';
import defaultIconMaximize from 'paella-core/icons/maximize.svg';
import defaultIconClose from 'paella-core/icons/close.svg';
import defaultIconSideBySide from 'paella-core/icons/icon_side_by_side.svg';
import { CanvasButtonPosition } from "../core/CanvasPlugin";

const pipLeft = {
    id: 'pip-left',
    name: {es: "Dos streams imagen dentro de imagen"},
    hidden: false,
    videos: [
        {
            content: null,
            rect:[
                {aspectRatio:"16/9",left:0,top:0,width:1280,height:720},
                {aspectRatio:"16/10",left:64,top:0,width:1152,height:720},
                {aspectRatio:"5/3",left:40,top:0,width:1200,height:720},
                {aspectRatio:"5/4",left:190,top:0,width:900,height:720},
                {aspectRatio:"4/3",left:160,top:0,width:960,height:720}
            ],
            visible:true,
            layer:1
        },
        {
            content: null,
            rect:[
                {aspectRatio:"16/9",left:50,top:470,width:350,height:197},
                {aspectRatio:"16/10",left:50,top:448,width:350,height:219},
                {aspectRatio:"5/3",left:50,top:457,width:350,height:210},
                {aspectRatio:"5/4",left:50,top:387,width:350,height:280},
                {aspectRatio:"4/3",left:50,top:404,width:350,height:262}
            ],
            visible:true,
            layer:2
        }
    ],
    buttons: []
};

const pipRight = {
    id: "pip-right",
    name: {es: "Dos streams imagen dentro de imagen a la derecha"},
    hidden: false,
    videos: [
        {
            content:null,
            rect:[
                {aspectRatio:"16/9",left:0,top:0,width:1280,height:720},
                {aspectRatio:"16/10",left:64,top:0,width:1152,height:720},
                {aspectRatio:"5/3",left:40,top:0,width:1200,height:720},
                {aspectRatio:"5/4",left:190,top:0,width:900,height:720},
                {aspectRatio:"4/3",left:160,top:0,width:960,height:720}
            ],
            visible:true,
            layer:1
        },
        {
            content:null,
            rect:[
                {aspectRatio:"16/9",left:880,top:470,width:350,height:197},
                {aspectRatio:"16/10",left:880,top:448,width:350,height:219},
                {aspectRatio:"5/3",left:880,top:457,width:350,height:210},
                {aspectRatio:"5/4",left:880,top:387,width:350,height:280},
                {aspectRatio:"4/3",left:880,top:404,width:350,height:262}
            ],
            visible:true,
            layer:2
        }
    ],
    buttons: []
};

export default class DualVideoPiPLayout extends VideoLayout {
    get identifier() { return "dual-video-pip"; }

    async load() {
        this._currentLayout = pipLeft;
        this.dualVideoContentIds = this.config.dualVideoContentIds || []
    }

    getValidStreams(streamData) {
        return super.getValidStreams(streamData)
            .filter(stream => stream.length === 2);
    }

    getVideoCanvasButtons(layoutStructure, content, video, videoCanvas) {
        const iconClose = this.player.getCustomPluginIcon(this.name, "iconClose") || defaultIconClose;
        const iconSwitchSide = this.player.getCustomPluginIcon(this.name, "iconSwitchSide") || defaultIconSwitchSide;
        const iconMaximize = this.player.getCustomPluginIcon(this.name, "iconMaximize") || defaultIconMaximize;
        const iconSideBySide = this.player.getCustomPluginIcon(this.name, "iconSideBySide") || defaultIconSideBySide;
        const result = [
            {
                icon: iconClose,
                position: CanvasButtonPosition.RIGHT,
                title: this.player.translate("Close video"),
                ariaLabel: this.player.translate("Close video"),
                click: async () => {
                    const singleStreamContentIds = this.player.videoContainer.validContentIds.filter(cid => cid.indexOf("-") === -1);
                    const contentId = singleStreamContentIds.find(cid => cid !== content);
                    await this.player.videoContainer.setLayout(contentId);
                }
            }
        ];
        if (content === this._pipVideo) {
            result.push({
                icon: iconSwitchSide,
                position: CanvasButtonPosition.LEFT,
                title: this.player.translate("Switch side"),
                ariaLabel: this.player.translate("Switch side"),
                click: async () => {
                    this.switchSide();
                    await this.player.videoContainer.updateLayout(this._fullVideo);
                }
            });

            result.push({
                icon: iconMaximize,
                position: CanvasButtonPosition.LEFT,
                title: this.player.translate("Maximize video"),
                ariaLabel: this.player.translate("Maximize video"),
                click: async () => {
                    this.switchSources();
                    await this.player.videoContainer.updateLayout(this._fullVideo);
                }
            })
        }
        else if (this.dualVideoContentIds.length > 1) {
            result.push({
                icon: iconSideBySide,
                position: CanvasButtonPosition.LEFT,
                title: this.player.translate("Set side by side"),
                ariaLabel: this.player.translate("Set side by side"),
                click: async () => {
                    const availableContentIds = this.player.videoContainer.validContentIds;
                    const dualVideoContentId = this.dualVideoContentIds.find(id => {
                        return availableContentIds.indexOf(id) !== -1;
                    });
                    if (dualVideoContentId) {
                        this.player.videoContainer.setLayout(dualVideoContentId);
                    }
                }
            })
        }
        return result;
    }

    switchSide() {
        if (this._currentLayout.id === 'pip-left') {
            this._currentLayout = pipRight;
        }
        else {
            this._currentLayout = pipLeft;
        }
    }

    switchSources() {
        const tmp = this._pipVideo;
        this._pipVideo = this._fullVideo;
        this._fullVideo = tmp;
    }

    getLayoutStructure(streamData, contentId, mainContent) {
        const { content } = this.validContent.find(content => content.id === contentId);
        if (mainContent && content.find(content => content === mainContent)) {
            this._fullVideo = mainContent;
            this._pipVideo = content.find(content => content !== mainContent);
        }
        else if (!this._pipVideo || !this._fullVideo) {
            this._pipVideo = content[0];
            this._fullVideo = content[1];
        }

        const result = JSON.parse(JSON.stringify(this._currentLayout));

        result.player = this.player;
        result.videos[0].content = this._fullVideo;
        result.videos[1].content = this._pipVideo;

        return result;
    }
}

