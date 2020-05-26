# egret-sound-sheet
白鹭的声音精灵图表，像图片图集一样将声音打包在一个文件里

## 使用示例

最简单的方式

```javascript
sound.SoundSheet.from(egret.Sound.EFFECT, 'resource/assets/effect.mp3', {
    reload: { start: 0, end: 1 },
    gun: { start: 1.2, end: 2.4 },
    getshot: { start: 2.5, end: 3.065 }
}).play('reload');
```

严格方式

```javascript
var sheetdata={
    reload: { start: 0, end: 1 },
    gun: { start: 1.2, end: 2.4 },
    getshot: { start: 2.5, end: 3.065 }
}
var sheet = new sound.SoundSheet()
sheet.initialize(egret.Sound.EFFECT, 'resource/assets/effect.mp3',sheetdata);
sheet.load(this,()=>{
    sheet.play('gun');
})
```