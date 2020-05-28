module sound {

    export class SoundSheet {
        private static _sounds: { [name: string]: SoundSheet } = {};
        protected _sound: egret.Sound;
        protected _isloaded: boolean;
        protected _isloading: boolean;
        protected _url: string;
        protected _slices:  { [name: string]: { start: number, end: number } };
        private _cachelist: { name: string, volume: number }[];
        constructor() {
        }

        /**
         * 取到一个对象
         * @param type 音频类型
         * @param url 音频地址
         * @param slices 分割信息
         */
        public static from(type: string, url: string, slices: { [name: string]: { start: number, end: number } }) {
            if (!SoundSheet._sounds[url]) {
                SoundSheet._sounds[url] = new SoundSheet().initialize(type, url, slices);
            }
            SoundSheet._sounds[url].load(this, (soundSheet: SoundSheet) => {
                if (soundSheet._cachelist && soundSheet._cachelist.length) {
                    while (soundSheet._cachelist.length) {
                        var object = soundSheet._cachelist.shift();
                        soundSheet.play(object.name, object.volume);
                    }
                    soundSheet._cachelist = null;
                }
            });
            return SoundSheet._sounds[url];
        }

        public initialize(type: string, url: string, slices: { [name: string]: { start: number, end: number } }) {
            if (this._sound) {
                this._sound.close();
                this._sound = null;
            }
            this._sound = new egret.Sound();
            this._sound.type = type;
            this._slices = slices;

            this._url = url;
            return this;
        }

        public reset() {
            if (this._sound) {
                this._sound.close();
                this._sound = null;
            }
            this._slices = null;
        }

        public async load(caller?: any, method?: Function) {
            if (this._isloading || this._isloaded) return Promise.resolve();
            var that = this;
            return new Promise((resolve, reject) => {
                function loadedHandler() {
                    that._isloaded = true;
                    that._sound.removeEventListener(egret.IOErrorEvent.IO_ERROR, errorHandler, that);
                    that._sound.removeEventListener(egret.Event.COMPLETE, loadedHandler, that);
                    method && method.call(caller, that);
                    resolve(that);
                }
                function errorHandler() {
                    that._sound.removeEventListener(egret.Event.COMPLETE, loadedHandler, that);
                    that._sound.removeEventListener(egret.IOErrorEvent.IO_ERROR, errorHandler, that);
                    console.error('[声音加载错误] : ' + that._url);
                    reject(that);
                }
                //添加加载完成侦听
                that._sound.addEventListener(egret.Event.COMPLETE, loadedHandler, that);
                that._sound.addEventListener(egret.IOErrorEvent.IO_ERROR, errorHandler, that);
                //开始加载
                that._sound.load(that._url);
                that._isloading = true;
            });
        }

        public play(name: string, volume: number = 1) {
            if (!this._isloaded) {
                if (!this._cachelist) this._cachelist = [];
                this._cachelist.push({ name: name, volume: volume });
                return;
            }
            if (this._slices[name]) {
                var item:SheetItem=SheetItem.from(this._sound,this._slices[name].start,this._slices[name].end)
                item.play(volume,this,($item:SheetItem)=>{
                    SheetItem.to($item);
                });
            }
            return this;
        }

        public get url(): string {
            return this._url;
        }
    }

    class SheetItem {
        private _sound: egret.Sound;
        private _start: number;
        private _end: number;
        private _soundChannel: egret.SoundChannel;
        private _complete:{caller:any,method:Function}
        public initialize(sound: egret.Sound, start: number, end: number) {
            this._sound = sound;
            this._start = start;
            this._end = end;
            egret.lifecycle.stage.addEventListener(egret.Event.DEACTIVATE,this.deactivateHandler,this);
            return this;
        }

        public reset(){
            this.stop();
            this._sound=null;
            this._start=this._end=0;
            if(this._complete){
                this._complete=null;
            }
            egret.lifecycle.stage.removeEventListener(egret.Event.DEACTIVATE,this.deactivateHandler,this);
        }

        public play(volume: number = 1,caller?:any,method?:Function) {
            this.stop();
            this._complete={caller:caller,method:method}
            this._soundChannel = this._sound.play(this._start, 1);
            this._soundChannel.volume = volume;
            egret.ticker.$startTick(this.render, this);
            this._soundChannel.addEventListener(egret.Event.SOUND_COMPLETE, this.end, this);
        }

        public stop() {
            this._soundChannel && this._soundChannel.stop();
            egret.ticker.$stopTick(this.render, this);
            this._soundChannel && this._soundChannel.removeEventListener(egret.Event.SOUND_COMPLETE, this.end, this);
        }

        private render(timestamp: number) {
            if (this._end >= 0 && this._soundChannel) {
                if (this._soundChannel.position >= this._end) {
                    this.end();
                }
                return true;
            }
            this.end();
            return true;
        }

        private deactivateHandler(){
            this.end();
        }

        private end() {
            this.stop();
            this._complete&&this._complete.method.call(this._complete.caller,this);
        }

        private static _pool:SheetItem[]=[];
        public static from(sound: egret.Sound, start: number, end: number){
            if(SheetItem._pool.length){
                return SheetItem._pool.pop().initialize(sound,start,end);
            }
            return new SheetItem().initialize(sound,start,end);
        }

        public static to(item:SheetItem){
            if(SheetItem._pool.indexOf(item)==-1){
                item.reset();
                SheetItem._pool.push(item);
            }
        }
    }
}