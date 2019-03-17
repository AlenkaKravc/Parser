const Context = require('./Сontext');
const Patterns = require('./patterns');
const Tree = require('./Tree');


let patterns = new Patterns();


const PatternsReg = {
    IMG: { //доделать
        type: "image",
    },
    Horizontal_Rules: {
        type: "Horizontal Rules",
    },
    Header: {
        type: "Header",
    },
    Header_Underline: {
        type: "Header_underline",
    },
    BlockQuotes: {
        type: "BlockQuotes",
    },
    List: {
        type: "List",
    },
    BlockCode: {
        type: "BlockCode",
    },
    Code: {
        type: "Code",
    },
    Backslashe: {
        type: "Backslashe",
    },
    Em: {
        type: "Em",
    },
    Strong: {
        type: "Strong",
    },
    Link: { //добавить пробелы
        type: "Link",
    },
    LinkLable: { //(2 типа)
        type: "LinkLable",
    },
    SpecialCharacter: {
        type: "SpecialCharacters",
    },
    Text: {
        type: "Text",
        reg: new RegExp(`^[a-zA-Za-яА-я0-9ё\\s]`)
    }
};


const specialSymbols = new RegExp(`^[-$@#\|/%^&*()=+_{}a-zA-Za-яА-я0-9ё\\s]`);

class MarkdownParser {
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
            this.context.moveUp();
            return true;
        } else {
            if(currentNode.type === this.currentNode.type){
                let state = this.parseParagraph(currentNode);
                return state;
            } else {
                currentNode.addChild(new Tree.ErrorNode("Error", this.context.char));
                this.context.toNextChar();
                return false;
            }
        }
    }

    parsePattern(pattern, parent) {
        if (this.context.isLineBreak()) {
            this.context.changeState(); //пересчетать контекст , сказать что в начале строки
            return true;
        }
        let currentPosition = this.context.text.slice(this.context.position);
        if (pattern.reg.test(currentPosition)) {
            if (pattern.type === PatternsReg.Header.type) {
                this.context.modeDown();
                let state = this.parseHeader(parent);
                return state;
                // переместить позицию контекста, пересчитать режимы
            }
            if (pattern.type === PatternsReg.Strong.type) {
                this.context.modeDown();
                let state = this.parseStrong(parent);
                return state;
            }
            if (pattern.type === PatternsReg.Em.type) {
                this.context.modeDown();
                let state = this.parseCoursive(parent);
                return state;
            }
            if (pattern.type === PatternsReg.IMG.type) {
                this.context.modeDown();
                let state = this.parseImage(parent);
                return state;
            }
            if (pattern.type === PatternsReg.SpecialCharacter.type) {
                this.context.modeDown();
                let state = this.parseSpecialCharacter(parent);
                return state;
            }
            if (pattern.type === PatternsReg.Text.type ) {
                this.context.modeDown();
                let state = this.parseParagraph(parent);
                return state;
            }
            if (pattern.type === PatternsReg.Header_Underline.type ) {
                this.context.modeDown();
                let state = this.parseUnderlineHeader(parent);
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

    parseUnderlineHeader(parent) {

        // "===" - level 1
        // "---" - level 2
        let line = this.context.text.slice(this.context.position, this.context.getEndLine());
        let new_node = new Tree.HeaderNode("Header Underline");

        this.parseLine(new_node,line);
        parent.addChild(new_node);
        this.context.toNextChar(); // переходим на новую строку ---- или ===
        let underline = this.context.text.slice(this.context.position, this.context.getEndLine());
        new_node.level = underline.indexOf("=") !== -1 ? 1 : 2;
        this.context.toNextChar(underline.length); // пропускаем символы подчеркивания
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

module.exports = MarkdownParser;