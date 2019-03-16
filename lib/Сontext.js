const Tree = require("./Tree");


//Состояние в данной позиции документа
//const state = {
//    0: "start line", //в начале строки
//    1: "start text", // в начале документа
//    2: "empty line before this", //до этого пустая строка
//    3: "no whitespace from the beginning" // от начала строки не было не пробельных символов
//    4: Конец строки ??
//};


class Context {

    constructor(text) {
        this.text = text;
        this.lines = this.text.split("\n"); // Why \r\n
        this.position = 0;
        this.state = {

            isStartLine: true,
            isEmptyLineBefore: false,
            isWhiteSpace: true,  //были только пробельные символы или никаких символов не было с начала строки
            isEndLine: false,

            numEmptyLineBefore: 0,
            numWhiteSpaceBefore: 0,

            isEndText: false,
        };

        this.char = text[this.position] || "";

        this.numLine = 0;
        this.line = this.lines[this.numLine];

        this.depth = 0;
    }

    init(text) {
        this.text = text;
        this.char = text[0];
    }

    show() {
        return this;
    }

    atEnd() {
        return this.iChar === this.text.length;
    }

    printText() {
        for (let i = 0; i < this.text.length; i++) {
            console.log(i, this.text[i]);
        }
    }

    printLines() {
        let lines = this.text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            console.log(i, lines[i]);
        }
    }

    toNextCharAfterSpace(){
        this.state = {

            ...this.state,
            isStartLine: false,
            numWhiteSpaceBefore: this.state.numWhiteSpaceBefore + 1,
        };
       this.toNextChar();
    }

    toNextChar(n = 1) {

        this.position = this.position + n;
        this.char = this.text[this.position] || "";
        //this.newMode();
        this.state = {
            ...this.state,
            isEndLine: !this.state.isEndLine  && this.isLineBreak(),
        }

    }



    printContext() {
        console.log(this)
    }

    isSpace() {
        return this.char === " ";
    }

    isLineBreak() {
        return this.char === "\n" || this.char === "\r";
    }


    isEndText() {
        return this.position >= this.text.length;
    }


    getEndLine() {
        let line = this.text.slice(this.position);
        let index =  line.indexOf('\n')  || line.indexOf("\r") || line.indexOf("\r\n") ;
        if (index !== -1 ){
            return index + this.position;
        } else {
            return this.text.length;
        }
    }


}

module.exports = Context;