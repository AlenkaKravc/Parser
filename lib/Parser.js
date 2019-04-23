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
        reg: new RegExp('^[>]{1}[ ]{1}|^[>]{1}[\\n]{1}'),
    },
    numberList: {
        type: "List",
        reg: new RegExp(`^[0-9]{1,9}.[ ]`)
    },
    List: {
        type: "List",
        reg: new RegExp('^[*|+|-]{1}[ ]{1}|^[0-9]{1,9}.[ ]{1}')
    },
    BlockCode: {
        type: "BlockCode",
        reg: new RegExp('^[ ]{4,}(.+)+[\\n]')
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
    ReferenceLable: {
        type: "ReferenceLable",
    },
    DefineLable: {
        type: "DefineLable",
    },
    SpecialCharacter: {
        type: "SpecialCharacters",
    },
    Text: {
        type: "Text",
        reg: new RegExp(`^[a-zA-Za-яА-Я0-9ё ]`)
    }
};


const specialSymbols = new RegExp(`^[-$@#\|/%^&*()=+_{}a-zA-Za-яА-я0-9ё\\s]`);
const nestCode = new RegExp('^``((.)+[\\n]?(.)+)*``');


class MarkdownParser {
    constructor(text) {
        this.tree = new Tree;
        this.currentNode = this.tree.getRoot();
        this.context = new Context(text);
    }


    parse() {
        this.context.init();



        while (!this.context.isEndText()) {
            if (this.context.isLineBreak()) {
                this.currentNode.addChild(new Tree.EmptyLine("EmptyLine"));
                this.context.changeState();
                continue;
            }

            if (this.checkPattern(this.currentNode, this.context)) {
                if (this.context.isLineBreak()) {
                    this.context.changeState();
                    continue;
                }
            } else {
                console.log("Error");
            }
        }
    }


    parseContent(currentNode, content) {

        console.log("fe",[content]);
        let new_context = new Context(content);
        new_context.init();

        while (!new_context.isEndText()) {
            if (new_context.isLineBreak()) {
                currentNode.addChild(new Tree.EmptyLine("EmptyLine"));
                new_context.changeState();
                continue;
            }

            if (this.checkPattern(currentNode, new_context)) {
                if (new_context.isLineBreak()) {
                    new_context.changeState();
                    continue;
                }
            } else {
                console.log("Error");
            }
        }


    }

    checkMarginPattern(currentNode, context) {
        let charPatterns = patterns.getMarginPattern(context);
        if (charPatterns.some(pattern => this.parsePattern(pattern, currentNode, context))) {
            context.moveUp();
            return true;
        }
        return false;
    }


    checkPattern(currentNode, context) {
        if (context.isSpace()) {
            if (this.checkMarginPattern(currentNode, context)) {
                if (context.isLineBreak()) {
                    context.changeState();
                    return true;
                }
            }
        }


        let charPatterns = patterns.get(context);

        if (charPatterns.some(pattern => this.parsePattern(pattern, currentNode, context))) {
            context.moveUp();
            return true;
        } else {
            if (currentNode.type === this.currentNode.type || currentNode.type === PatternsReg.BlockQuotes.type ||  currentNode.type === PatternsReg.List.type) {
                context.modeDown();
                let state = this.parseParagraph(currentNode, context);
                context.moveUp();
                return state;
            } else {
                currentNode.addChild(new Tree.ErrorNode("Error", context.char));
                context.toNextChar();
                return true;
            }
        }
    }

    parsePattern(pattern, parent, context) {
        if (context.isLineBreak()) {
            context.changeState(); //пересчетать контекст , сказать что в начале строки
            return true;
        }
        let currentPosition = context.text.slice(context.position);
        if (pattern.reg.test(currentPosition)) {
            if (pattern.type === PatternsReg.Horizontal_Rules.type) {
                context.modeDown();
                let state = this.parseHorizontalLine(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.Header.type) {
                context.modeDown();

                return this.parseHeader(parent, context);
                // переместить позицию контекста, пересчитать режимы
            }
            if (pattern.type === PatternsReg.Strong.type) {
                context.modeDown();
                let state = this.parseStrong(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.Em.type) {
                context.modeDown();
                let state = this.parseCoursive(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.IMG.type) {
                context.modeDown();
                let state = this.parseImage(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.SpecialCharacter.type) {
                context.modeDown();
                let state = this.parseSpecialCharacter(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.Text.type) {
                context.modeDown();
                let state = this.parseParagraph(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.Code.type) {
                context.modeDown();
                let state = this.parseCode(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.Header_Underline.type) {
                context.modeDown();
                let state = this.parseUnderlineHeader(parent, context);
                return state;
            }
            if (pattern.type === PatternsReg.BlockCode.type) {
                context.modeDown();
                return this.parseBlockCode(parent, context);
            }
            if (pattern.type === PatternsReg.Link.type) {
                context.modeDown();
                return this.parseLink(parent, context);
            }
            if (pattern.type === PatternsReg.ReferenceLable.type) {
                context.modeDown();
                return this.parseReferenceLable(parent, context);
            }
            if(pattern.type === PatternsReg.BlockQuotes.type) {
                context.modeDown();
                return this.parseBlockQuotes(parent, context);
            }
            if(pattern.type === PatternsReg.List.type) {
                context.modeDown();
                return this.parseList(parent, context);
            }
            return false;
        } else {
            return false
        }
    }


    parseText(parent = {}, context) {
        let text = "";
        while (PatternsReg.Text.reg.test(context.char) && !context.isLineBreak()) {
            text = text.concat(context.char);
            context.toNextChar();
        }

        if (text !== "") {
            parent.addChild(new Tree.TextNode("text", text));
            return true;
        } else {
            return false;
        }

    }


    parseLine(parent = {}, line, context) {
        let start = context.position;
        while (context.position < start + line.length) {
            if (this.parseText(parent, context)) {
                continue;
            } else {
                if (!context.isLineBreak()) {
                    if (this.checkPattern(parent, context)) {
                        continue;
                    }
                }
            }
        }
        return true;
    }


    parseParagraph(parent = {}, context) {
        let new_node = new Tree.ParagraphNode("Paragraph");
        while (!context.isLineBreak() && !context.isEndText()) {

            if (context.isSpace()) {
                new_node.addChild(new Tree.SpaceNode("SpaceNode"));
                context.toNextChar();
                continue;
            }


            if (this.parseText(new_node, context)) {
                continue;
            } else {
                if (this.checkPattern(new_node, context)) {
                    continue;
                }
            }
        }
        parent.addChild(new_node);
        return new_node;
    }


    parseStrong(parent, context) {

        let new_node = new Tree.EmphasizeNode("strong");
        let start = context.position;

        let length = context.text.slice(context.position + 2).indexOf(context.text[start].concat(context.text[start])); //Длина выделяемой части
        if (length !== -1) {
            context.toNextChar();
            context.toNextChar();
            this.parseLine(new_node, context.text.slice(start + 2, start + 2 + length), context);
            parent.addChild(new_node);
            context.toNextChar();
            context.toNextChar();
            return true;
        } else {
            return false
        }

    }

    parseCoursive(parent, context) {

        if (context.char === context.text[context.position + 1] && this.parseStrong(parent, context)) { //так как могут быть пересечение
            return true
        } else {
            let new_node = new Tree.EmphasizeNode("cursive");
            let start = context.position;
            let length = context.text.slice(context.position + 1).indexOf(context.text[start]); //Длина выделяемой части
            context.toNextChar();
            this.parseLine(new_node, context.text.slice(start + 1, start + 1 + length), context);
            parent.addChild(new_node);
            context.toNextChar();
            return true;
        }
    }


    parseHeader(parent, context) {
        let line = context.text.slice(context.position, context.getEndLine());
        let level = line.split(" ")[0].length;

        let new_node = new Tree.HeaderNode("Header", level);
        context.toNextChar(level);
        context.toNextChar();
        this.parseLine(new_node, line.slice(level + 1,), context);
        parent.addChild(new_node);
        return true;
    }

    parseUnderlineHeader(parent, context) {

        // "===" - level 1
        // "---" - level 2
        let line = context.text.slice(context.position, context.getEndLine());
        let new_node = new Tree.HeaderNode("Header Underline");

        this.parseLine(new_node, line, context);
        parent.addChild(new_node);
        context.toNextChar(); // переходим на новую строку ---- или ===
        let underline = context.text.slice(context.position, context.getEndLine());
        new_node.level = underline.indexOf("=") !== -1 ? 1 : 2;
        context.toNextChar(underline.length); // пропускаем символы подчеркивания
        return true;
    }


    parseImage(parent, context) {

        let line = context.text.slice(context.position, context.getEndLine());
        let alt = line.slice(line.indexOf('[') + 1, line.indexOf(']'));
        let link = line.slice(line.indexOf('(') + 1, line.indexOf(')'));
        let new_node = new Tree.ImageNode("Image", alt, link);
        parent.addChild(new_node);
        context.toNextChar(line.indexOf(')') + 1);
        return true;
    }


    parseSpecialCharacter(parent, context) {
        context.toNextChar(); // переходим к символу
        let new_node = new Tree.CharacterNode("Symbol", context.char);
        context.toNextChar(); //следующий символ
        parent.addChild(new_node);

        return true;
    }

    parseCode(parent, context) {
        let line = context.text.slice(context.position);
        let isNest = nestCode.test(line); //проверяем вложенный код или нет
        let new_node = new Tree.CodeNode("Code");
        if (isNest) {
            let left = line.indexOf("``");
            let right = line.slice(2).indexOf("``");
            let code = line.slice(left + 2, right + 2);
            new_node.code = code;
            context.toNextChar(code.length + 4); //следующий символ
        } else {
            let left = line.indexOf("`");
            let right = line.slice(1).indexOf("`");
            let code = line.slice(left + 1, right + 1);
            new_node.code = code;
            context.toNextChar(code.length + 2); //следующий символ
        }

        parent.addChild(new_node);
        return true;
    }

    parseHorizontalLine(parent, context) {
        let line = context.text.slice(context.position, context.getEndLine());
        let new_node = new Tree.HorizontalLine("Horizontal Line", line);
        context.toNextChar(line.length);
        parent.addChild(new_node);
        return false;
    }

    parseBlockCode(parent, context) {
        let new_node = new Tree.BlockCode("BlockCode");
        while (PatternsReg.BlockCode.reg.test(context.text.slice(context.position))) {
            let line_code = context.text.slice(context.position + 4, context.getEndLine());
            new_node.addLine(line_code);
            context.toNextChar(line_code.length + 5);
        }
        context.toNextChar(-1);

        parent.addChild(new_node);
        return true;
    }

    parseLink(parent, context) {
        let line = context.text.slice(context.position, context.getEndLine());
        let alt = "";
        let link = "";
        let title = "";
        if (line[0] === "[") {
            alt = line.slice(line.indexOf('[') + 1, line.indexOf(']')).toString();
            link = line.slice(line.indexOf('(') + 1, line.indexOf(')')).toString();

            if (link.indexOf('"') !== -1) {
                let left = link.indexOf('"');
                let right = link.slice(left + 1).indexOf('"');
                title = link.slice(left + 1, right + left + 1).toString();
                link = link.slice(0, left);
            }
            context.toNextChar(line.indexOf(')') + 1);
        } else {
            link = line.slice(line.indexOf("<") + 1, line.indexOf(">")).toString();
            context.toNextChar(line.indexOf('>') + 1);
        }
        link = link.replace(/\s/g, ''); //убираем пробелы;
        let new_node = new Tree.Link("Link", alt, link, title);
        parent.addChild(new_node);
        return true;
    }

    parseReferenceLable(parent, context) {
        let line = context.text.slice(context.position, context.getEndLine());
        let link = "";
        let title = "";

        let alt = line.slice(1, line.indexOf("]"));
        line = line.slice(alt.length + 2);
        let lable = line.slice(line.indexOf("[") + 1, line.indexOf("]")).toString();

        let new_node = new Tree.ReferenceLable("Reference Lable", alt, lable, link, title);
        parent.addChild(new_node);
        context.toNextChar(alt.length + 2 + line.indexOf("]") + 1);
        return true;
    }

    parseBlockQuotes(parent, context) {
        let new_node = new Tree.BlockCode("BlockQuotes");

        let content = "";
        while (PatternsReg.BlockQuotes.reg.test(context.text.slice(context.position)) || PatternsReg.Text.reg.test(context.char)) {
            if(PatternsReg.Text.reg.test(context.char)) {
                let line = context.text.slice(context.position, context.getEndLine());
                context.toNextChar(line.length + 1);
                if(PatternsReg.Text.reg.test(context.char)){
                    content = content.concat(line, " ");
                } else {
                    content = content.concat(line, "\n");
                }
                continue;
            }
            if(context.text[context.position + 1] === '\n' ) {
                content = content.concat("\n");
                context.toNextChar(2);


            } else {
                let line = context.text.slice(context.position + 2, context.getEndLine());
                context.toNextChar(line.length + 3);
                if(PatternsReg.Text.reg.test(context.char)){
                    content = content.concat(line, " ");
                } else {
                    content = content.concat(line, "\n");
                }
            }
        }
        context.toNextChar(-1);


        this.parseContent(new_node, content);

        parent.addChild(new_node);

        return true;
    }

    parseList(parent, context){
        let new_node = new Tree.List("List");

        let type = context.char;
        new_node.setTypeList( (new RegExp('^[0-9]').test(type)) ? "number" : type);

        while (PatternsReg.List.reg.test(context.text.slice(context.position)) && (type === context.char || ((new RegExp('^[0-9]').test(type)) && (new RegExp('^[0-9]').test(context.char)) ))){
            let line = context.text.slice(context.position, context.getEndLine());

            if(context.char === "*" || context.char === "_"  ||  context.char === "+" ) {
                if(line.slice(2).length > 0) {
                    this.parseContent(new_node, line.slice(2));
                } else {
                    new_node.addChild(new Tree.EmptyNode("EmptyNode"));
                }
            } else {
                let index_dot = line.indexOf(".");
                if(line.slice(index_dot+2).length > 0) {
                    this.parseContent(new_node, line.slice(index_dot+2));
                } else {
                    new_node.addChild(new Tree.EmptyNode("EmptyNode"));
                }
            }


            context.toNextChar(line.length + 1);

        }
        context.toNextChar(-1);
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