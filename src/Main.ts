//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {



    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {

            }
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log(e);
        })
    }

    private async runGame() {
        await this.loadResource()

        // sound.SoundSheet.from(egret.Sound.EFFECT, 'resource/assets/effect.mp3', {
        //     reload: { start: 0, end: 1 },
        //     gun: { start: 1.2, end: 2.4 },
        //     getshot: { start: 2.5, end: 3.065 }
        // }).play('reload');

        var sheetdata={
            reload: { start: 0, end: 1 },
            gun: { start: 1.2, end: 2.4 },
            getshot: { start: 2.5, end: 3.065 }
        }
        var sheet = new sound.SoundSheet()
        sheet.initialize(egret.Sound.EFFECT, 'resource/assets/effect.mp3',sheetdata);
        sheet.load()

        var i:number=0;
        for(var key in sheetdata){
            var button:egret.TextField=new egret.TextField();
            button.text=key;
            this.addChild(button);
            button.x=100;
            button.y=100+100*i;
            button.name=key;
            button.touchEnabled=true;
            button.addEventListener(egret.TouchEvent.TOUCH_TAP,(e:egret.TouchEvent)=>{
                console.log(e.target.name);
                sheet.play(e.target.name);
            },this)
            i++;
        }
    }

    private async loadResource() {
        try {
            await RES.loadConfig("resource/default.res.json", "resource/");
        }
        catch (e) {
            console.error(e);
        }
    }
}