/**
 * @return {boolean}
 */

const PatternsReg = {
    IMG: {
        type: "image",
        reg: new RegExp('^!\\[(.{0,})\\]\\((.+)\\)'),
    },
    Horizontal_Rules: {
        type: "Horizontal Rules",
        reg: new RegExp('^([ ]*[-][ ]*[-][ ]*[-][ ]?)[- ]*[\\n]|^([ ]*[*][ ]*[*][ ]*[*][ ]?)[* ]*[\\n]|^([ ]*[_][ ]*[_][ ]*[_][ ]?)[_ ]*[\\n]'),
    },
    Header: {
        type: "Header",
        reg: new RegExp(`^[#]{1,6}[\\s]`)
    },
    Header_Underline: {
        type: "Header_underline",
        reg: new RegExp('^[\\\\\\-!`[\\]$@#|/%^&*()=+_{}a-zA-Za-яА-я0-9ё ]+[\\n]+[ ]{0,3}([-]+|[=]+)[\\s]*[\\n]') //все символы и
        // reg: new RegExp(`^(.+)+[\\n]+[ ]{0,3}([-]+|[=]+)[\\s]*[\\n]`) //все символы и

    },
    BlockQuotes: {
        type: "BlockQuotes",
        reg: new RegExp('^[>]{1}[ ]{1}|^[>]{1}[\\n]{1}')
    },
    List: {
        type: "List",
        reg: new RegExp('^[*|+|-]{1}[ ]{1}|^[0-9]{1,9}.[ ]{1}')
    },
    numberList: {
        type: "List",
        reg: new RegExp(`^[0-9]{1,9}.[ ]`)
    },
    BlockCode: {
        type: "BlockCode",
        reg: new RegExp('^[ ]{4,}(.+)+[\\n]')
    },
    Code: {
        type: "Code",
        reg: new RegExp('^`((.)+[\\n]?(.)+)*`|^``((.)+[\\n]?(.)+)*``') //
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

    Link: {
        type: "Link",
        reg: new RegExp('^\\[(.+)\\]\\([ ]*(\\S)+[ ]*("(.*)")?[ ]*\\)|^<(.+)>')
    },
    ReferenceLable: {
        type: "ReferenceLable",
        reg: new RegExp(`^\\[.+][ ]*(\\[(.*)])`)
    },
    DefineLable: {
        type: "DefineLable",
        test: new RegExp(`^([ ]{0,3})\\[.+]:([ ]+)([-a-zA-ZА-Яа-я@/_:.]+)([  ]*)[\n]$`),
        reg: new RegExp(`^([ ]{0,3})\\[.+]:([ ]+)([-a-zA-ZА-Яа-я@/_:.]+)([  ]*)[\n]$|^([ ]{0,3})\\[.+]:([ ]+)([<]{1})([-a-zA-ZА-Яа-я@/_:.]+)([>]{1})([  ]*)[\n]$|^([ ]{0,3})\\[.+]:([ ]+)([-a-zA-ZА-Яа-я@/_:.]+)([  ]*)"(.+)"([  ]*)[\n]$|^([ ]{0,3})\\[.+]:([ ]+)([-a-zA-ZА-Яа-я@/_:.]+)([  ]*)'(.+)'([  ]*)[\n]$|^([ ]{0,3})\\[.+]:([ ]+)([-a-zA-ZА-Яа-я@/_:.]+)([  ]*)([(]{1})(.+)([)]{1})([  ]*)[\n]$`)
    },
    SpecialCharacter: {
        type: "SpecialCharacters",
        //reg: new RegExp(`^\\\\[!\`*_{}[\\]()#+-.]`)
        reg: new RegExp(`^\\\\([!\`*_{}[\\]()#+-.]|[\\\\])`)

    },
    Text: {
        type: "Text",
        reg: new RegExp(`^[a-zA-Za-яА-я0-9\\s]`)
    },
};


this.state = {
    isStartLine: true,
    isEmptyLineBefore: false,
    isWhiteSpace: false,  //были только пробельные символы или никаких символов не было с начала строки
    isEndLine: false,

    numEmptyLineBefore: 0,
    numWhiteSpaceBefore: 0,
};


class Patterns {
    constructor() {

    }

    getMarginPattern(context) {
        let patterns = []; ///добавить все стандартные паттерны

        if (context.state.isWhiteSpace) {
            if (context.depth === 0) {
                patterns.push(PatternsReg.BlockCode);
            }
        }

        return patterns;
    }

    get(context) {
        let patterns = [];

        if (context.state.isWhiteSpace) {
            patterns.push(PatternsReg.Header);
            if (context.depth === 0) {
                patterns.push(PatternsReg.Header_Underline);
                patterns.push(PatternsReg.Horizontal_Rules); //доработать
                patterns.push(PatternsReg.DefineLable)
            }

            if (context.char === ">") {
                patterns.push(PatternsReg.BlockQuotes);
            }
            if (context.char === "+" || context.char === "-" || context.char === "*" || (new RegExp('^[0-9]')).test(context.char)) {
                patterns.push(PatternsReg.List);
            }

        }

        if (context.depth !== 0) {
            if (context.char === "!") {
                patterns.push(PatternsReg.IMG);
            }
            if (context.char === "*") {
                patterns.push(PatternsReg.Em, PatternsReg.Strong, PatternsReg.List);
            }
            if (context.char === "_") {
                patterns.push(PatternsReg.Em, PatternsReg.Strong);
            }
            if (context.char === "\\") {
                patterns.push(PatternsReg.SpecialCharacter);
            }
            if (context.char === "`") {
                patterns.push(PatternsReg.Code);
            }
            if (context.char === "<") {
                patterns.push(PatternsReg.Link);
            }
            if (context.char === "[") {
                patterns.push(PatternsReg.Link, PatternsReg.ReferenceLable);
            }
        }

        return [...patterns, PatternsReg.Text];
    }
}

module.exports = Patterns;

