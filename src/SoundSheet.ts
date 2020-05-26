module sound {

    export class SoundSheet {
        private static _sounds: { [name: string]: SoundSheet } = {};
        protected _sound: egret.Sound;
        protected _isloaded: boolean;
        protected _isloading: boolean;
        protected _url: string;
        protected _slices: { [name: string]: SheetItem };
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
            this._slices = {};
            for (var key in slices) {
                this._slices[key] = new SheetItem(this._sound, slices[key].start, slices[key].end);
            }
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
                this._slices[name].play(volume);
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
        constructor(sound: egret.Sound, start: number, end: number) {
            this._sound = sound;
            this._start = start;
            this._end = end;
        }

        public play(volume: number = 1) {
            this.stop();
            this._soundChannel = this._sound.play(this._start, 1);
            this._soundChannel.volume = volume;
            egret.ticker.$startTick(this.render, this);
            this._soundChannel.addEventListener(egret.Event.SOUND_COMPLETE, this.playOver, this);
        }

        public stop() {
            this._soundChannel && this._soundChannel.stop();
            egret.ticker.$stopTick(this.render, this);
            this._soundChannel && this._soundChannel.removeEventListener(egret.Event.SOUND_COMPLETE, this.playOver, this);
        }

        private render(timestamp: number) {
            if (this._end >= 0 && this._soundChannel) {
                if (this._soundChannel.position >= this._end) {
                    this.stop();
                }
                return true;
            }
            this.stop();
            return true;
        }

        private playOver() {
            this.stop();
        }
    }
}