function selectNovel() {
    var fileDom = document.getElementById("file");
    var charsetDom = document.getElementById('charsetSelect')
    var fileList = fileDom.files;//获取到文件列表
    var fileName = fileList[0].name; // 文件名
    var reader = new FileReader();//新建一个FileReader
    var charset = charsetDom.value;
    reader.readAsText(fileList[0], charset);//读取文件 
    reader.onload = function (evt) { //读取完文件之后会回来这里
        var fileString = evt.target.result; // 读取文件内容
        NovelParser.init();
        text = NovelParser.parse(fileString);
        var outputFile = new File([text], fileName, {type: "text/plain;charset=" + charset});
        saveAs(outputFile);
    }
}

function cerry (func) {
    var _args = [].slice.call(arguments, 1);
    return function () {
        return func.apply(this, [].concat.call(arguments, _args));
    };
}

var NovelParser = {
    parse: function(novelStr){
        var rowEnd = "(?:\n|$)";
        var pattern = this.pattern;
        for(var i = 0; i < pattern.length; i++){
            var curPattern = pattern[i];
            var curReg = new RegExp(curPattern+rowEnd, "igm");
            var result = novelStr.replace(curReg, "第$1章 $2");
            if(result !== novelStr){
                novelStr = result;
                break;
            }
        }
        return novelStr;
    },
    init: function(){
        var symbols = "\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5";
        var word = "[" + symbols + "\u4e00-\u9fa5a-zA-Z0-9]*";
        var words = "[" + symbols + "\u4e00-\u9fa5a-zA-Z0-9]+";
        var numbers = "[一二三四五六七八九十零千百0-9]+";
        var mathNums = "[0-9]+";
        this.pattern = [
            "#+" + "(" + numbers + ")" + "(" + words + ")" + "#+",
            "("+ mathNums + ")" + "(" + word + ")",
            "第" + "(" + numbers + ")" + "章" + "(" + words + ")"
        ];
        this.unit = {
            symbols: symbols,
            word: word,
            words: words,
            numbers: numbers,
            mathNums: mathNums
        }
    },
    extend: function(flag, key, val){
        if(flag === 'unit'){
            var unit = this.unit;
            if(!unit[key]){
                unit[key] = val;
            }else{
                return false;
            }
        }else if(flag === 'pattern'){
            var cb = key;
            var pattern = cb.call(this);
            if(pattern.indexOf(val) < 0){
                pattern.push(val);
            }else{
                return false;
            }
        }
        return true;
    },
    extendUnit: cerry(this.extend, 'unit'),
    /**
     * 
     * @param { func } cb 
     * cb返回值应为pattern
     */
    extendPattern: cerry(this.extend, 'pattern')
};