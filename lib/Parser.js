const Context = require('./Сontext');
const Patterns = require('./patterns');
const Tree = require('./Tree');

let patterns = new Patterns();


const PatternsReg = {
    IMG: { //доделать
        type: "image",
        reg: new RegExp('^!\\[(.{0,})\\]\\((.+)\\)'),
    },
    Horizontal_Rules: {
        type: "Horizontal Rules",
        reg: new RegExp('^[-]{3,}$|^[*]{3,}$|^[_]{3,}$'),
    },
    Header: {
        type: "Header",
        reg: new RegExp('^[#]{1,6}[\\s]')
    },
    Header_Underline: {
        type: "Header_underline",
        reg: new RegExp('^[-]{3,}[\\s]*$|^[*]{3,}[\\s]*$|^[=]{3,}[\\s]*$')
    },
    BlockQuotes: {
        type: "BlockQuotes",
        reg: new RegExp('^[>]{1}')
    },
    List: {
        type: "List",
        reg: new RegExp('^[*|+|-]{1}[\\s]')
    },
    BlockCode: {
        type: "BlockCode",
        reg: new RegExp('^[ ]{4,}$|^[\t]')
    },
    Code: {
        type: "Code",
        reg: new RegExp('^[ ]{4,}$|^[\t]')
    },
    Backslashe: {
        type: "Backslashe",
        reg: new RegExp('^\\*(.+)\\*')
    },
    Em: {
        type: "Em",
        reg: new RegExp('^\\*(.+)\\*|^_(.+)_'),
    },
    Strong: {
        type: "Strong",
        reg: new RegExp('^[\*]{2}(.+)[\*]{2}|^[\_]{2}(.+)[\_]{2}'),
    },

    Link: { //добавить пробелы
        type: "Link",
        reg: new RegExp('^\\[(.{0,})\\]\\((.+)\\)|^\\<(.{0,})\\>\\((.+)\\)')
    },
    LinkLable: { //(2 типа)
        type: "LinkLable",
        reg: new RegExp(`^\\[.+]:(.+)$`)
    },
    SpecialCharacter: {
        type: "SpecialCharacters",
        reg: new RegExp(`^\\\\[!\`*_{}[\\]()#+-.]`)
    },
    Text: {
        type: "Text",
        reg: new RegExp(`^[a-zA-Za-яА-я0-9\\s]`)
    }
};



const specialSymbols = "$@#\\/|`~*_-{}[]().?,!;%:^&";

class Parser {
    constructor(text) {
        this.tree = new Tree;
        this.currentNode = this.tree.getRoot();
        this.context = new Context(text);
    }


    parse() {

        console.log("test",PatternsReg.SpecialCharacter.reg.test("\\!"));
        while (!this.context.isEndText()) {
            if (this.context.isSpace()) {
                if(this.context.isLineBreak()) {
                    this.context.toNextChar();
                }
                if(this.context.state.isWhiteSpace) {
                    this.context.toNextCharAfterSpace();
                    continue;
                } else {
                    this.currentNode.addChild(new Tree.SpaceNode("SpaceNode"));
                }

            }

            if(this.checkPattern(this.currentNode)){
            } else {
                this.context.toNextChar();
            }


        }
    }



    checkPattern(currentNode) {
        let charPatterns = patterns.get(this.context);

        console.log(this.context);

        if (charPatterns.some(pattern => this.parsePattern(pattern, currentNode))) {
            return true;
        } else {
            currentNode.addChild(new Tree.ErrorNode("Error", this.context.char));
            return false;
        }
    }

    parsePattern(pattern, parent) {
        if(this.context.isLineBreak()) {
            this.context.toNextChar(); //пересчетать контекст , сказать что в начале строки
            return true;
        }
        let currentPosition = this.context.text.slice(this.context.position);
        if (pattern.reg.test(currentPosition)) {
            if (pattern.type === PatternsReg.Header.type) {
                let state = this.parseHeader(parent);
                if(state) {
                    return true;
                } else {
                    return false;
                }
                // переместить позицию контекста, пересчитать режимы
            }
            if(pattern.type === PatternsReg.Text.type) {
                console.log("here", [this.context.char]);
                let state = this.parseParagraph(parent);
                //parent.addChild(new_node);
                return state;
            }
            if(pattern.type === PatternsReg.Strong.type) {
                let state = this.parseStrong(parent);
                return state;
            }
            if(pattern.type === PatternsReg.Em.type) {
                let state = this.parseCoursive(parent);
                if(state){
                    this.context.toNextChar();
                    return true;
                } else {
                    return false;
                }
            }
            if(pattern.type === PatternsReg.IMG.type) {
                let state = this.parseImage(parent);
                return state;
            }
            if(pattern.type === PatternsReg.SpecialCharacter.type) {
                console.log("defrg");
                let state = this.parseSpecialCharacter(parent);
                return state;
            }


            return false;
        } else {
            return false
        }


        /*context.backup();
        if (pattern.regexp.match(...)) {
            // сгенерировать соответствующий узел
            context.moveTo(...); // переместить позицию контекста, пересчитать режимы
            // выйти из текущего узла, если текущий узел не поддерживает формат нового узла
            // если нужно, сгенерировать узел-контейнер (код, список, цитата и т.п.)
            // добавить узел в дерево
            return true;
        } else {
            context.restore();
            return false;
        }*/
    }



    printContext() {
        this.context.printContext();
    }


    parseText(parent) {
        let text = "";
        while(PatternsReg.Text.reg.test(this.context.char) && !this.context.isLineBreak()) {
            text = text.concat(this.context.char);
            this.context.toNextChar();
        }

        if(this.context.isLineBreak()){
            this.context.toNextChar();
        }

        if(text !== "") {
            parent.addChild(new Tree.TextNode("text", text));
            return true;
        } else {
            return false;
        }

    }



    parseLine(parent, line) {

        let start = this.context.position;
        while (this.context.position < start + line.length) {
            if (this.parseText(parent)) {
                continue;
            } else {
                if(this.context.char !== "\n") {
                    if (this.checkPattern(parent)) {
                        //console.log("new level");
                        continue;
                    }
                } else {
                    //console.log("to next line");
                }
                this.context.toNextChar();
            }
        }
        return true;
    }


    parseParagraph(parent = {}) {

        let new_node = new Tree.ParagraphNode("Paragraph");
        while (!this.context.isLineBreak() && !this.context.isEndText()) {
            if(this.parseText(new_node)) {
                continue;
            } else {
                if(this.context.char !== "\n") {
                    if (this.checkPattern(parent)) {
                      //  console.log("new level");
                        continue;
                    }
                } else {
                    //console.log("to next line");
                }
                this.context.toNextChar();
            }
        }
        parent.addChild(new_node);
        return new_node;
    }


    parseStrong(parent) {

        let new_node = new Tree.EmphasizeNode("strong");
        let start = this.context.position;

        let length = this.context.text.slice(this.context.position + 2).indexOf(this.context.text[start].concat(this.context.text[start])); //Длина выделяемой части
        if(length !== -1) {
            this.context.toNextChar();
            this.context.toNextChar();
            this.parseLine(new_node, this.context.text.slice(start + 2, start + 2 + length));
            parent.addChild(new_node);
            this.context.toNextChar();
            return true;
        } else {
            return false
        }

    }

    parseCoursive(parent) {

        if(this.context.char === this.context.text[this.context.position + 1] && this.parseStrong(parent)) { //так как могут быть пересечение
            return true
        } else {
            let new_node = new Tree.EmphasizeNode("cursive");
            let start = this.context.position;
            let length = this.context.text.slice(this.context.position + 1).indexOf(this.context.text[start]); //Длина выделяемой части
            this.context.toNextChar();
            this.parseLine(new_node, this.context.text.slice(start + 1, start + 1 + length));
            parent.addChild(new_node);
            this.context.toNextChar();
            return true;
        }
    }


    parseHeader(parent) {
        let line = this.context.text.slice(this.context.position);
        let end = line.indexOf("\n")  || line.indexOf("\r") || line.indexOf("\r\n") ;
        let words = line.slice(0, end).split(" ");

        if(end === -1 ) {
            end = this.context.text.length;
        }
        let new_node = new Tree.HeaderNode("Header", words[0].length);

        this.context.toNextChar(words[0].length + 1);

        this.parseLine(new_node, line.slice(words[0].length + 1, end));

        parent.addChild(new_node);
        return true;
    }

    parseImage(parent) {

        let line = this.context.text.slice(this.context.position,this.context.getEndLine() );

        let alt = line.slice(line.indexOf('[') + 1, line.indexOf(']'));
        let  link = line.slice(line.indexOf('(') +1 , line.indexOf(')'));

        let new_node = new Tree.ImageNode("Image", alt, link);
        parent.addChild(new_node);
        this.context.toNextChar(line.indexOf(')') + 1);

        return true;
    }



    parseSpecialCharacter(parent) {

        console.log(this.context.char);
        this.context.toNextChar();
        let new_node = new Tree.CharacterNode("Symbol", this.context.char);
        this.context.toNextChar();
        parent.addChild(new_node);

        return true;
    }

    show(){
        return this.context.printText();
    }

    printTree() {
        console.log(this.tree.root);
    }


}

module.exports = Parser;