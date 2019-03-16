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
        reg: new RegExp(`^\\\\([!\`*_{}[\\]()#+-.]|[\\\\])`)
    },
    Text: {
        type: "Text",
        reg: new RegExp(`^[a-zA-Za-яА-я0-9ё\\s]`)
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

        while (!this.context.isEndText()) {
            if (this.context.isLineBreak()) {
                this.currentNode.addChild(new Tree.EmptyLine("EmptyLine"));
                this.context.changeState();
                continue;
            }

            if (this.context.isSpace()) {
                this.currentNode.addChild(new Tree.SpaceNode("SpaceNode"));
                this.context.toNextChar();
                continue;
            }

            if (this.checkPattern(this.currentNode)) {
                if (this.context.isLineBreak()) {
                    this.context.changeState();
                    continue;
                }
            } else {
                console.log("Error");
            }


        }
    }


    checkPattern(currentNode) {
        let charPatterns = patterns.get(this.context);

        if (charPatterns.some(pattern => this.parsePattern(pattern, currentNode))) {
            return true;
        } else {
            currentNode.addChild(new Tree.ErrorNode("Error", this.context.char));
            this.context.toNextChar();
            return false;
        }
    }

    parsePattern(pattern, parent) {
        if (this.context.isLineBreak()) {
            this.context.toNextChar(); //пересчетать контекст , сказать что в начале строки
            console.log("alo");
            return true;
        }
        let currentPosition = this.context.text.slice(this.context.position);
        if (pattern.reg.test(currentPosition)) {
            if (pattern.type === PatternsReg.Header.type) {
                let state = this.parseHeader(parent);
                return state;
                // переместить позицию контекста, пересчитать режимы
            }
            if (pattern.type === PatternsReg.Text.type) {
                let state = this.parseParagraph(parent);
                return state;
            }
            if (pattern.type === PatternsReg.Strong.type) {
                let state = this.parseStrong(parent);
                return state;
            }
            if (pattern.type === PatternsReg.Em.type) {
                let state = this.parseCoursive(parent);
                return state;
            }
            if (pattern.type === PatternsReg.IMG.type) {
                let state = this.parseImage(parent);
                return state;
            }
            if (pattern.type === PatternsReg.SpecialCharacter.type) {
                let state = this.parseSpecialCharacter(parent);
                return state;
            }

            return false;
        } else {
            return false
        }
    }


    parseText(parent = {}) {
        let text = "";
        while (PatternsReg.Text.reg.test(this.context.char) && !this.context.isLineBreak()) {
            text = text.concat(this.context.char);
            this.context.toNextChar();
        }

        if (text !== "") {
            parent.addChild(new Tree.TextNode("text", text));
            return true;
        } else {
            return false;
        }

    }


    parseLine(parent = {}, line) {
        let start = this.context.position;
        while (this.context.position < start + line.length) {
            if (this.parseText(parent)) {
                continue;
            } else {
                if (!this.context.isLineBreak()) {
                    if (this.checkPattern(parent)) {
                        continue;
                    }
                }
            }
        }
        return true;
    }


    parseParagraph(parent = {}) {
        let new_node = new Tree.ParagraphNode("Paragraph");
        while (!this.context.isLineBreak() && !this.context.isEndText()) {
            if (this.parseText(new_node)) {
                continue;
            } else {
                if (this.checkPattern(new_node)) {
                    continue;
                }
            }
        }
        parent.addChild(new_node);
        return new_node;
    }


    parseStrong(parent) {

        let new_node = new Tree.EmphasizeNode("strong");
        let start = this.context.position;

        let length = this.context.text.slice(this.context.position + 2).indexOf(this.context.text[start].concat(this.context.text[start])); //Длина выделяемой части
        if (length !== -1) {
            this.context.toNextChar();
            this.context.toNextChar();
            this.parseLine(new_node, this.context.text.slice(start + 2, start + 2 + length));
            parent.addChild(new_node);
            this.context.toNextChar();
            this.context.toNextChar();
            return true;
        } else {
            return false
        }

    }

    parseCoursive(parent) {

        if (this.context.char === this.context.text[this.context.position + 1] && this.parseStrong(parent)) { //так как могут быть пересечение
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
        let line = this.context.text.slice(this.context.position, this.context.getEndLine());
        let level = line.split(" ")[0].length;

        let new_node = new Tree.HeaderNode("Header", level);
        this.context.toNextChar(level);
        this.context.toNextChar();
        this.parseLine(new_node, line.slice(level + 1,));
        parent.addChild(new_node);
        return true;
    }

    parseImage(parent) {

        let line = this.context.text.slice(this.context.position, this.context.getEndLine());
        let alt = line.slice(line.indexOf('[') + 1, line.indexOf(']'));
        let link = line.slice(line.indexOf('(') + 1, line.indexOf(')'));
        let new_node = new Tree.ImageNode("Image", alt, link);
        parent.addChild(new_node);
        this.context.toNextChar(line.indexOf(')') + 1);
        return true;
    }


    parseSpecialCharacter(parent) {

        this.context.toNextChar(); // переходим к символу
        let new_node = new Tree.CharacterNode("Symbol", this.context.char);
        this.context.toNextChar(); //следующий символ
        parent.addChild(new_node);

        return true;
    }


    printTree() {
        console.log(this.tree.root);
    }

    show() {
        return this.context.printText();
    }

    printContext() {
        this.context.printContext();
    }

}

module.exports = Parser;