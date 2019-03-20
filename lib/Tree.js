'use strict';

class Tree {
    constructor() {
        this.nodes = [];
        this.root = new Tree.Node("root");
        this.nodes = [this.root]
    }


    getRoot() {
        return this.root;
    }

}


Tree.Node = class {
    constructor(type) {
        this.type = type;
        this.children = [];
    }

    addChild(child) {
        this.children.push(child)
    }
};

Tree.TextNode = class extends Tree.Node {
    constructor(type, text) {
        super(type);
        this.text = text;
    }
};

Tree.SpaceNode = class extends Tree.Node {
    constructor(type) {
        super(type);
        this.text = " ";
    }
};

Tree.ParagraphNode = class extends Tree.Node {
    constructor(type) {
        super(type);
    }
};

Tree.HeaderNode = class extends Tree.Node {
    constructor(type, level) {
        super(type);
        this.level = level;
    }
};

Tree.ImageNode = class extends Tree.Node {
    constructor(type, alt, link) {
        super(type);
        this.level = ""; // что это?
        this.alt = alt;
        this.link = link;
    }
};

Tree.CodeNode = class extends Tree.Node {
    constructor(type, code) {
        super(type);
        this.code = code;
    }
};

Tree.CharacterNode = class extends Tree.Node {
    constructor(type, symbol) {
        super(type);
        this.symbol = symbol;
    }
};
Tree.EmptyLine = class extends Tree.Node {
    constructor(type) {
        super(type);
    }
};

Tree.HorizontalLine = class extends Tree.Node {
    constructor(type, line) {
        super(type);
        this.line = line;
    }
};

Tree.BlockCode = class extends Tree.Node {
    constructor(type, lines = []) {
        super(type);
        this.lines = lines;
    }

    addLine(line) {
        this.lines = [...this.lines, line]
    }
};


Tree.ErrorNode = class extends Tree.Node {
    constructor(type, symbol) {
        super(type);
        this.symbol = symbol;
    }
};

Tree.EmphasizeNode = class extends Tree.Node {
    constructor(type) {
        super(type);
    }
};


Tree.Link = class extends Tree.Node {
    constructor(type, alt, link, title) {
        super(type);
        this.link = link;
        this.alt = alt;
        this.title = title;
    }
};

Tree.ReferenceLable = class extends Tree.Node {
    constructor(type, alt, lable, link, title) {
        super(type);
        this.link = link;
        this.alt = alt;
        this.lable = lable;
        this.title = title;
    }
};

module.exports = Tree;


