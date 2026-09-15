var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => NotionBlock
});
module.exports = __toCommonJS(main_exports);
var import_obsidian7 = require("obsidian");

// src/settings.ts
var import_obsidian2 = require("obsidian");

// src/locale/lang/en.ts
var en = {
  "settings.enablePlugin.name": "Enable plugin",
  "settings.enablePlugin.desc": "Enable or disable the block plugin.",
  "settings.dragGranularity.name": "Drag granularity",
  "settings.dragGranularity.desc": "Switch between line mode and paragraph mode.",
  "settings.dragGranularity.line": "Line mode",
  "settings.dragGranularity.paragraph": "Paragraph mode",
  "settings.hoverDelay.name": "Button hover delay",
  "settings.hoverDelay.desc": "Delay (ms) before showing handles.",
  "settings.hideDelay.name": "Button hide delay",
  "settings.hideDelay.desc": "Delay (ms) before hiding handles.",
  "settings.handleSide.name": "Handle side",
  "settings.handleSide.desc": "Which edge of the text the handle sits beside.",
  "settings.handleSide.left": "Left",
  "settings.handleSide.right": "Right",
  "settings.handleAlwaysVisible.name": "Always show the handle",
  "settings.handleAlwaysVisible.desc": "Pin the handle to the block the caret is in, so it never hides when the pointer moves away.",
  "settings.dateFormat.name": "Date format",
  "settings.dateFormat.desc": "Format for today/yesterday/tomorrow.",
  "settings.timeFormat.name": "Time format",
  "settings.timeFormat.desc": "Format for current time.",
  "handles.addBlock": "Add block below",
  "handles.dragReorder": "Drag to reorder",
  "handles.switchToParagraph": "Switch to paragraph mode",
  "handles.switchToLine": "Switch to line mode",
  "handles.fold": "Fold block",
  "handles.unfold": "Unfold block",
  "fold.expand": "Click to unfold",
  "settings.foldHandle.name": "Show the fold chevron",
  "settings.foldHandle.desc": "A chevron on the handle that collapses a block to its first line. It only appears on blocks that have something to hide.",
  "drag.blocks": "{n} blocks",
  "menu.turnInto": "Turn into",
  "menu.insert": "Insert",
  "menu.color": "Color",
  "menu.textColor": "Text color",
  "menu.backgroundColor": "Background color",
  "menu.callout": "Callout",
  "menu.headings": "Headings",
  "menu.custom": "Custom",
  "menu.paragraph": "Text",
  "menu.h1": "Heading 1",
  "menu.h2": "Heading 2",
  "menu.h3": "Heading 3",
  "menu.h4": "Heading 4",
  "menu.h5": "Heading 5",
  "menu.todo": "To-do list",
  "menu.bullet": "Bulleted list",
  "menu.numbered": "Numbered list",
  "menu.blockquote": "Quote",
  "menu.code": "Code block",
  "menu.math": "Math block",
  "menu.divider": "Divider",
  "menu.toc": "Table of contents",
  "menu.page": "Page",
  "menu.copyLink": "Copy block link",
  "menu.delete": "Delete",
  "menu.link": "Internal link",
  "menu.extLink": "External link",
  "menu.image": "Insert image",
  "menu.attachment": "Insert attachment",
  "menu.table": "Table",
  "menu.today": "Today",
  "menu.yesterday": "Yesterday",
  "menu.tomorrow": "Tomorrow",
  "menu.time": "Current time",
  "menu.footnote": "Footnote",
  "menu.comment": "Comment",
  "color.default": "Default",
  "color.gray": "Gray",
  "color.brown": "Brown",
  "color.orange": "Orange",
  "color.yellow": "Yellow",
  "color.green": "Green",
  "color.blue": "Blue",
  "color.purple": "Purple",
  "color.pink": "Pink",
  "color.red": "Red",
  "color.textDefault": "Default text",
  "color.textGray": "Gray text",
  "color.textBrown": "Brown text",
  "color.textOrange": "Orange text",
  "color.textYellow": "Yellow text",
  "color.textGreen": "Green text",
  "color.textBlue": "Blue text",
  "color.textPurple": "Purple text",
  "color.textPink": "Pink text",
  "color.textRed": "Red text",
  "color.bgDefault": "Default background",
  "color.bgGray": "Gray background",
  "color.bgBrown": "Brown background",
  "color.bgOrange": "Orange background",
  "color.bgYellow": "Yellow background",
  "color.bgGreen": "Green background",
  "color.bgBlue": "Blue background",
  "color.bgPurple": "Purple background",
  "color.bgPink": "Pink background",
  "color.bgRed": "Red background",
  "callout.note": "Note",
  "callout.info": "Info",
  "callout.todo": "Todo",
  "callout.tip": "Tip",
  "callout.success": "Success",
  "callout.question": "Question",
  "callout.warning": "Warning",
  "callout.failure": "Failure",
  "callout.danger": "Danger",
  "callout.bug": "Bug",
  "callout.example": "Example",
  "callout.quote": "Quote",
  "notice.noActiveNote": "No active note",
  "notice.linkCopied": "Block link copied",
  "notice.linkCopyFailed": "Failed to copy block link",
  "notice.selectImage": "Please select an image file.",
  "notice.insertImageFailed": "Failed to insert image.",
  "notice.insertAttachmentFailed": "Failed to insert attachment.",
  "notice.createPageFailed": "Failed to create the page.",
  "notice.noHeadings": "This note has no headings to list.",
  "command.openInsertMenu": "Open block insert menu",
  "menu.closeMenu": "Close menu",
  "page.untitled": "Untitled",
  "toc.title": "Table of contents",
  "settings.insertItems.name": "Insert menu items",
  "settings.insertItems.desc": "Drag to reorder. Uncheck to hide a row. Add a row to run any Obsidian command from the menu.",
  "settings.addCommand": "Add command",
  "settings.resetOrder": "Reset order",
  "settings.commandMissing": "Command unavailable",
  "settings.customCommand.title": "Custom insert command",
  "settings.customCommand.label": "Name",
  "settings.customCommand.command": "Command",
  "settings.customCommand.commandDesc": "Start typing to search Obsidian's commands.",
  "settings.customCommand.icon": "Icon",
  "settings.customCommand.iconDesc": 'A Lucide icon name, e.g. "zap" or "pencil".',
  "settings.customCommand.save": "Save",
  "settings.customCommand.cancel": "Cancel",
  "settings.customCommand.boundTo": "Runs Obsidian \u201C{name}\u201D",
  "settings.customCommand.edit": "Edit",
  "settings.customCommand.delete": "Delete"
};
var en_default = en;

// src/locale/lang/zh.ts
var zh = {
  "settings.enablePlugin.name": "\u542F\u7528\u63D2\u4EF6",
  "settings.enablePlugin.desc": "\u542F\u7528\u6216\u7981\u7528\u533A\u5757\u63D2\u4EF6\u3002",
  "settings.dragGranularity.name": "\u62D6\u62FD\u7C92\u5EA6",
  "settings.dragGranularity.desc": "\u5728\u884C\u6A21\u5F0F\u548C\u6BB5\u843D\u6A21\u5F0F\u4E4B\u95F4\u5207\u6362\u3002",
  "settings.dragGranularity.line": "\u884C\u6A21\u5F0F",
  "settings.dragGranularity.paragraph": "\u6BB5\u843D\u6A21\u5F0F",
  "settings.hoverDelay.name": "\u60AC\u6D6E\u663E\u793A\u5EF6\u8FDF",
  "settings.hoverDelay.desc": "\u663E\u793A\u53E5\u67C4\u4E4B\u524D\u7684\u5EF6\u8FDF\uFF08\u6BEB\u79D2\uFF09\u3002",
  "settings.hideDelay.name": "\u60AC\u6D6E\u9690\u85CF\u5EF6\u8FDF",
  "settings.hideDelay.desc": "\u9690\u85CF\u53E5\u67C4\u4E4B\u524D\u7684\u5EF6\u8FDF\uFF08\u6BEB\u79D2\uFF09\u3002",
  "settings.handleSide.name": "\u624B\u67C4\u4F4D\u7F6E",
  "settings.handleSide.desc": "\u624B\u67C4\u663E\u793A\u5728\u6B63\u6587\u7684\u54EA\u4E00\u4FA7\u3002",
  "settings.handleSide.left": "\u5DE6\u4FA7",
  "settings.handleSide.right": "\u53F3\u4FA7",
  "settings.handleAlwaysVisible.name": "\u59CB\u7EC8\u663E\u793A\u624B\u67C4",
  "settings.handleAlwaysVisible.desc": "\u5C06\u624B\u67C4\u56FA\u5B9A\u5728\u5149\u6807\u6240\u5728\u7684\u5757\u4E0A\uFF0C\u9F20\u6807\u79FB\u5F00\u65F6\u4E5F\u4E0D\u9690\u85CF\u3002",
  "settings.dateFormat.name": "\u65E5\u671F\u683C\u5F0F",
  "settings.dateFormat.desc": "\u4ECA\u5929/\u6628\u5929/\u660E\u5929\u7684\u65E5\u671F\u683C\u5F0F\u3002",
  "settings.timeFormat.name": "\u65F6\u95F4\u683C\u5F0F",
  "settings.timeFormat.desc": "\u5F53\u524D\u65F6\u95F4\u7684\u683C\u5F0F\u3002",
  "handles.addBlock": "\u5728\u4E0B\u65B9\u6DFB\u52A0\u533A\u5757",
  "handles.dragReorder": "\u62D6\u62FD\u4EE5\u91CD\u6392",
  "handles.switchToParagraph": "\u5207\u6362\u5230\u6BB5\u843D\u6A21\u5F0F",
  "handles.switchToLine": "\u5207\u6362\u5230\u884C\u6A21\u5F0F",
  "handles.fold": "\u6298\u53E0\u5757",
  "handles.unfold": "\u5C55\u5F00\u5757",
  "fold.expand": "\u70B9\u51FB\u5C55\u5F00",
  "settings.foldHandle.name": "\u663E\u793A\u6298\u53E0\u7BAD\u5934",
  "settings.foldHandle.desc": "\u624B\u67C4\u4E0A\u7684\u7BAD\u5934\uFF0C\u53EF\u5C06\u5757\u6298\u53E0\u4E3A\u9996\u884C\u3002\u4EC5\u5728\u6709\u5185\u5BB9\u53EF\u6298\u53E0\u7684\u5757\u4E0A\u663E\u793A\u3002",
  "drag.blocks": "{n} \u4E2A\u5757",
  "menu.turnInto": "\u8F6C\u6362\u6210",
  "menu.insert": "\u65B0\u589E",
  "menu.color": "\u989C\u8272",
  "menu.textColor": "\u6587\u672C\u989C\u8272",
  "menu.backgroundColor": "\u80CC\u666F\u989C\u8272",
  "menu.callout": "Callout",
  "menu.paragraph": "\u6587\u672C",
  "menu.headings": "\u6807\u9898",
  "menu.custom": "\u81EA\u5B9A\u4E49",
  "menu.h1": "\u6807\u9898 1",
  "menu.h2": "\u6807\u9898 2",
  "menu.h3": "\u6807\u9898 3",
  "menu.h4": "\u6807\u9898 4",
  "menu.h5": "\u6807\u9898 5",
  "menu.todo": "\u5F85\u529E\u5217\u8868",
  "menu.bullet": "\u65E0\u5E8F\u5217\u8868",
  "menu.numbered": "\u6709\u5E8F\u5217\u8868",
  "menu.blockquote": "\u5F15\u7528",
  "menu.code": "\u4EE3\u7801\u5757",
  "menu.math": "\u6570\u5B66\u5757",
  "menu.divider": "\u5206\u5272\u7EBF",
  "menu.toc": "\u76EE\u5F55",
  "menu.page": "\u9875\u9762",
  "menu.copyLink": "\u62F7\u8D1D\u533A\u5757\u94FE\u63A5",
  "menu.delete": "\u5220\u9664",
  "menu.link": "\u5185\u90E8\u94FE\u63A5",
  "menu.extLink": "\u5916\u90E8\u94FE\u63A5",
  "menu.image": "\u63D2\u5165\u56FE\u7247",
  "menu.attachment": "\u63D2\u5165\u9644\u4EF6",
  "menu.table": "\u8868\u683C",
  "menu.today": "\u4ECA\u5929",
  "menu.yesterday": "\u6628\u5929",
  "menu.tomorrow": "\u660E\u5929",
  "menu.time": "\u5F53\u524D\u65F6\u95F4",
  "menu.footnote": "\u811A\u6CE8",
  "menu.comment": "\u6CE8\u91CA",
  "color.default": "\u9ED8\u8BA4",
  "color.gray": "\u7070\u8272",
  "color.brown": "\u68D5\u8272",
  "color.orange": "\u6A59\u8272",
  "color.yellow": "\u9EC4\u8272",
  "color.green": "\u7EFF\u8272",
  "color.blue": "\u84DD\u8272",
  "color.purple": "\u7D2B\u8272",
  "color.pink": "\u7C89\u8272",
  "color.red": "\u7EA2\u8272",
  "color.textDefault": "\u9ED8\u8BA4\u6587\u672C",
  "color.textGray": "\u7070\u8272\u6587\u672C",
  "color.textBrown": "\u68D5\u8272\u6587\u672C",
  "color.textOrange": "\u6A59\u8272\u6587\u672C",
  "color.textYellow": "\u9EC4\u8272\u6587\u672C",
  "color.textGreen": "\u7EFF\u8272\u6587\u672C",
  "color.textBlue": "\u84DD\u8272\u6587\u672C",
  "color.textPurple": "\u7D2B\u8272\u6587\u672C",
  "color.textPink": "\u7C89\u8272\u6587\u672C",
  "color.textRed": "\u7EA2\u8272\u6587\u672C",
  "color.bgDefault": "\u9ED8\u8BA4\u80CC\u666F",
  "color.bgGray": "\u7070\u8272\u80CC\u666F",
  "color.bgBrown": "\u68D5\u8272\u80CC\u666F",
  "color.bgOrange": "\u6A59\u8272\u80CC\u666F",
  "color.bgYellow": "\u9EC4\u8272\u80CC\u666F",
  "color.bgGreen": "\u7EFF\u8272\u80CC\u666F",
  "color.bgBlue": "\u84DD\u8272\u80CC\u666F",
  "color.bgPurple": "\u7D2B\u8272\u80CC\u666F",
  "color.bgPink": "\u7C89\u8272\u80CC\u666F",
  "color.bgRed": "\u7EA2\u8272\u80CC\u666F",
  "callout.note": "\u4FBF\u7B7E",
  "callout.info": "\u4FE1\u606F",
  "callout.todo": "\u5F85\u529E",
  "callout.tip": "\u63D0\u793A",
  "callout.success": "\u6210\u529F",
  "callout.question": "\u95EE\u9898",
  "callout.warning": "\u8B66\u544A",
  "callout.failure": "\u5931\u8D25",
  "callout.danger": "\u5371\u9669",
  "callout.bug": "\u7F3A\u9677",
  "callout.example": "\u793A\u4F8B",
  "callout.quote": "\u5F15\u7528",
  "notice.noActiveNote": "\u6CA1\u6709\u6D3B\u52A8\u7B14\u8BB0",
  "notice.linkCopied": "\u5DF2\u590D\u5236\u533A\u5757\u94FE\u63A5",
  "notice.linkCopyFailed": "\u590D\u5236\u533A\u5757\u94FE\u63A5\u5931\u8D25",
  "notice.selectImage": "\u8BF7\u9009\u62E9\u56FE\u7247\u6587\u4EF6\u3002",
  "notice.insertImageFailed": "\u63D2\u5165\u56FE\u7247\u5931\u8D25\u3002",
  "notice.insertAttachmentFailed": "\u63D2\u5165\u9644\u4EF6\u5931\u8D25\u3002",
  "notice.createPageFailed": "\u521B\u5EFA\u9875\u9762\u5931\u8D25\u3002",
  "notice.noHeadings": "\u6B64\u7B14\u8BB0\u6CA1\u6709\u53EF\u5217\u51FA\u7684\u6807\u9898\u3002",
  "command.openInsertMenu": "\u6253\u5F00\u5757\u63D2\u5165\u83DC\u5355",
  "menu.closeMenu": "\u5173\u95ED\u83DC\u5355",
  "page.untitled": "\u672A\u547D\u540D",
  "toc.title": "\u76EE\u5F55",
  "settings.insertItems.name": "\u63D2\u5165\u83DC\u5355\u9879",
  "settings.insertItems.desc": "\u62D6\u52A8\u53EF\u6392\u5E8F\uFF0C\u53D6\u6D88\u52FE\u9009\u53EF\u9690\u85CF\u3002\u6DFB\u52A0\u6761\u76EE\u5373\u53EF\u5728\u83DC\u5355\u4E2D\u6267\u884C\u4EFB\u610F Obsidian \u547D\u4EE4\u3002",
  "settings.addCommand": "\u6DFB\u52A0\u547D\u4EE4",
  "settings.resetOrder": "\u91CD\u7F6E\u6392\u5E8F",
  "settings.commandMissing": "\u8BE5\u547D\u4EE4\u76EE\u524D\u4E0D\u53EF\u7528",
  "settings.customCommand.title": "\u81EA\u5B9A\u4E49\u63D2\u5165\u547D\u4EE4",
  "settings.customCommand.label": "\u540D\u79F0",
  "settings.customCommand.command": "\u547D\u4EE4",
  "settings.customCommand.commandDesc": "\u8F93\u5165\u4EE5\u641C\u7D22 Obsidian \u547D\u4EE4\u3002",
  "settings.customCommand.icon": "\u56FE\u6807",
  "settings.customCommand.iconDesc": 'Lucide \u56FE\u6807\u540D\u79F0\uFF0C\u4F8B\u5982 "zap" \u6216 "pencil"\u3002',
  "settings.customCommand.save": "\u4FDD\u5B58",
  "settings.customCommand.cancel": "\u53D6\u6D88",
  "settings.customCommand.boundTo": "\u6765\u81EA Obsidian \u201C{name}\u201D",
  "settings.customCommand.edit": "\u7F16\u8F91",
  "settings.customCommand.delete": "\u5220\u9664"
};
var zh_default = zh;

// src/locale/lang/zh-tw.ts
var zhTw = {
  "settings.enablePlugin.name": "\u555F\u7528\u63D2\u4EF6",
  "settings.enablePlugin.desc": "\u555F\u7528\u6216\u7981\u7528\u5340\u584A\u63D2\u4EF6\u3002",
  "settings.dragGranularity.name": "\u62D6\u66F3\u7C92\u5EA6",
  "settings.dragGranularity.desc": "\u5728\u884C\u6A21\u5F0F\u548C\u6BB5\u843D\u6A21\u5F0F\u4E4B\u9593\u5207\u63DB\u3002",
  "settings.dragGranularity.line": "\u884C\u6A21\u5F0F",
  "settings.dragGranularity.paragraph": "\u6BB5\u843D\u6A21\u5F0F",
  "settings.hoverDelay.name": "\u61F8\u505C\u986F\u793A\u5EF6\u9072",
  "settings.hoverDelay.desc": "\u986F\u793A\u53E5\u67C4\u4E4B\u524D\u7684\u5EF6\u9072\uFF08\u6BEB\u79D2\uFF09\u3002",
  "settings.hideDelay.name": "\u61F8\u505C\u96B1\u85CF\u5EF6\u9072",
  "settings.hideDelay.desc": "\u96B1\u85CF\u53E5\u67C4\u4E4B\u524D\u7684\u5EF6\u9072\uFF08\u6BEB\u79D2\uFF09\u3002",
  "settings.handleSide.name": "\u63A7\u5236\u67C4\u4F4D\u7F6E",
  "settings.handleSide.desc": "\u63A7\u5236\u67C4\u986F\u793A\u5728\u5167\u6587\u7684\u54EA\u4E00\u5074\u3002",
  "settings.handleSide.left": "\u5DE6\u5074",
  "settings.handleSide.right": "\u53F3\u5074",
  "settings.handleAlwaysVisible.name": "\u6C38\u9060\u986F\u793A\u63A7\u5236\u67C4",
  "settings.handleAlwaysVisible.desc": "\u5C07\u63A7\u5236\u67C4\u56FA\u5B9A\u5728\u6E38\u6A19\u6240\u5728\u7684\u5340\u584A\u4E0A\uFF0C\u6ED1\u9F20\u79FB\u958B\u6642\u4E5F\u4E0D\u96B1\u85CF\u3002",
  "settings.dateFormat.name": "\u65E5\u671F\u683C\u5F0F",
  "settings.dateFormat.desc": "\u4ECA\u5929/\u6628\u5929/\u660E\u5929\u7684\u65E5\u671F\u683C\u5F0F\u3002",
  "settings.timeFormat.name": "\u6642\u9593\u683C\u5F0F",
  "settings.timeFormat.desc": "\u7576\u524D\u6642\u9593\u7684\u683C\u5F0F\u3002",
  "handles.addBlock": "\u5728\u4E0B\u65B9\u6DFB\u52A0\u5340\u584A",
  "handles.dragReorder": "\u62D6\u66F3\u4EE5\u91CD\u6392",
  "handles.switchToParagraph": "\u5207\u63DB\u5230\u6BB5\u843D\u6A21\u5F0F",
  "handles.switchToLine": "\u5207\u63DB\u5230\u884C\u6A21\u5F0F",
  "handles.fold": "\u647A\u758A\u5340\u584A",
  "handles.unfold": "\u5C55\u958B\u5340\u584A",
  "fold.expand": "\u9EDE\u64CA\u5C55\u958B",
  "settings.foldHandle.name": "\u986F\u793A\u647A\u758A\u7BAD\u982D",
  "settings.foldHandle.desc": "\u63A7\u5236\u67C4\u4E0A\u7684\u7BAD\u982D\uFF0C\u53EF\u5C07\u5340\u584A\u647A\u758A\u70BA\u9996\u884C\u3002\u50C5\u5728\u6709\u5167\u5BB9\u53EF\u647A\u758A\u7684\u5340\u584A\u4E0A\u986F\u793A\u3002",
  "drag.blocks": "{n} \u500B\u5340\u584A",
  "menu.turnInto": "\u8F49\u63DB\u6210",
  "menu.insert": "\u65B0\u589E",
  "menu.color": "\u984F\u8272",
  "menu.textColor": "\u6587\u5B57\u984F\u8272",
  "menu.backgroundColor": "\u80CC\u666F\u984F\u8272",
  "menu.callout": "Callout",
  "menu.paragraph": "\u6587\u5B57",
  "menu.headings": "\u6A19\u984C",
  "menu.custom": "\u81EA\u8A02",
  "menu.h1": "\u6A19\u984C 1",
  "menu.h2": "\u6A19\u984C 2",
  "menu.h3": "\u6A19\u984C 3",
  "menu.h4": "\u6A19\u984C 4",
  "menu.h5": "\u6A19\u984C 5",
  "menu.todo": "\u5F85\u8FA6\u6E05\u55AE",
  "menu.bullet": "\u7121\u5E8F\u6E05\u55AE",
  "menu.numbered": "\u6709\u5E8F\u6E05\u55AE",
  "menu.blockquote": "\u5F15\u7528",
  "menu.code": "\u7A0B\u5F0F\u78BC\u5340\u584A",
  "menu.math": "\u6578\u5B78\u5340\u584A",
  "menu.divider": "\u5206\u5272\u7DDA",
  "menu.toc": "\u76EE\u9304",
  "menu.page": "\u9801\u9762",
  "menu.copyLink": "\u8907\u88FD\u5340\u584A\u9023\u7D50",
  "menu.delete": "\u522A\u9664",
  "menu.link": "\u5167\u90E8\u9023\u7D50",
  "menu.extLink": "\u5916\u90E8\u9023\u7D50",
  "menu.image": "\u63D2\u5165\u5716\u7247",
  "menu.attachment": "\u63D2\u5165\u9644\u4EF6",
  "menu.table": "\u8868\u683C",
  "menu.today": "\u4ECA\u5929",
  "menu.yesterday": "\u6628\u5929",
  "menu.tomorrow": "\u660E\u5929",
  "menu.time": "\u7576\u524D\u6642\u9593",
  "menu.footnote": "\u8173\u8A3B",
  "menu.comment": "\u8A3B\u89E3",
  "color.default": "\u9810\u8A2D",
  "color.gray": "\u7070\u8272",
  "color.brown": "\u68D5\u8272",
  "color.orange": "\u6A58\u8272",
  "color.yellow": "\u9EC3\u8272",
  "color.green": "\u7DA0\u8272",
  "color.blue": "\u85CD\u8272",
  "color.purple": "\u7D2B\u8272",
  "color.pink": "\u7C89\u7D05\u8272",
  "color.red": "\u7D05\u8272",
  "color.textDefault": "\u9810\u8A2D\u6587\u5B57",
  "color.textGray": "\u7070\u8272\u6587\u5B57",
  "color.textBrown": "\u68D5\u8272\u6587\u5B57",
  "color.textOrange": "\u6A58\u8272\u6587\u5B57",
  "color.textYellow": "\u9EC3\u8272\u6587\u5B57",
  "color.textGreen": "\u7DA0\u8272\u6587\u5B57",
  "color.textBlue": "\u85CD\u8272\u6587\u5B57",
  "color.textPurple": "\u7D2B\u8272\u6587\u5B57",
  "color.textPink": "\u7C89\u7D05\u8272\u6587\u5B57",
  "color.textRed": "\u7D05\u8272\u6587\u5B57",
  "color.bgDefault": "\u9810\u8A2D\u80CC\u666F",
  "color.bgGray": "\u7070\u8272\u80CC\u666F",
  "color.bgBrown": "\u68D5\u8272\u80CC\u666F",
  "color.bgOrange": "\u6A58\u8272\u80CC\u666F",
  "color.bgYellow": "\u9EC3\u8272\u80CC\u666F",
  "color.bgGreen": "\u7DA0\u8272\u80CC\u666F",
  "color.bgBlue": "\u85CD\u8272\u80CC\u666F",
  "color.bgPurple": "\u7D2B\u8272\u80CC\u666F",
  "color.bgPink": "\u7C89\u7D05\u8272\u80CC\u666F",
  "color.bgRed": "\u7D05\u8272\u80CC\u666F",
  "callout.note": "\u4FBF\u7C3D",
  "callout.info": "\u8CC7\u8A0A",
  "callout.todo": "\u5F85\u8FA6",
  "callout.tip": "\u63D0\u793A",
  "callout.success": "\u6210\u529F",
  "callout.question": "\u554F\u984C",
  "callout.warning": "\u8B66\u544A",
  "callout.failure": "\u5931\u6557",
  "callout.danger": "\u5371\u96AA",
  "callout.bug": "\u7F3A\u9677",
  "callout.example": "\u7BC4\u4F8B",
  "callout.quote": "\u5F15\u7528",
  "notice.noActiveNote": "\u6C92\u6709\u4F5C\u7528\u4E2D\u7684\u7B46\u8A18",
  "notice.linkCopied": "\u5DF2\u8907\u88FD\u5340\u584A\u9023\u7D50",
  "notice.linkCopyFailed": "\u8907\u88FD\u5340\u584A\u9023\u7D50\u5931\u6557",
  "notice.selectImage": "\u8ACB\u9078\u64C7\u5716\u7247\u6A94\u6848\u3002",
  "notice.insertImageFailed": "\u63D2\u5165\u5716\u7247\u5931\u6557\u3002",
  "notice.insertAttachmentFailed": "\u63D2\u5165\u9644\u4EF6\u5931\u6557\u3002",
  "notice.createPageFailed": "\u5EFA\u7ACB\u9801\u9762\u5931\u6557\u3002",
  "notice.noHeadings": "\u6B64\u7B46\u8A18\u6C92\u6709\u53EF\u5217\u51FA\u7684\u6A19\u984C\u3002",
  "command.openInsertMenu": "\u958B\u555F\u5340\u584A\u63D2\u5165\u9078\u55AE",
  "menu.closeMenu": "\u95DC\u9589\u9078\u55AE",
  "page.untitled": "\u672A\u547D\u540D",
  "toc.title": "\u76EE\u9304",
  "settings.insertItems.name": "\u63D2\u5165\u9078\u55AE\u9805\u76EE",
  "settings.insertItems.desc": "\u62D6\u66F3\u53EF\u6392\u5E8F\uFF0C\u53D6\u6D88\u52FE\u9078\u53EF\u96B1\u85CF\u3002\u65B0\u589E\u9805\u76EE\u5373\u53EF\u5728\u9078\u55AE\u4E2D\u57F7\u884C\u4EFB\u610F Obsidian \u6307\u4EE4\u3002",
  "settings.addCommand": "\u65B0\u589E\u6307\u4EE4",
  "settings.resetOrder": "\u91CD\u8A2D\u6392\u5E8F",
  "settings.commandMissing": "\u8A72\u6307\u4EE4\u76EE\u524D\u7121\u6CD5\u4F7F\u7528",
  "settings.customCommand.title": "\u81EA\u8A02\u63D2\u5165\u6307\u4EE4",
  "settings.customCommand.label": "\u540D\u7A31",
  "settings.customCommand.command": "\u6307\u4EE4",
  "settings.customCommand.commandDesc": "\u8F38\u5165\u4EE5\u641C\u5C0B Obsidian \u6307\u4EE4\u3002",
  "settings.customCommand.icon": "\u5716\u793A",
  "settings.customCommand.iconDesc": 'Lucide \u5716\u793A\u540D\u7A31\uFF0C\u4F8B\u5982 "zap" \u6216 "pencil"\u3002',
  "settings.customCommand.save": "\u5132\u5B58",
  "settings.customCommand.cancel": "\u53D6\u6D88",
  "settings.customCommand.boundTo": "\u4F86\u81EA Obsidian\u300C{name}\u300D",
  "settings.customCommand.edit": "\u7DE8\u8F2F",
  "settings.customCommand.delete": "\u522A\u9664"
};
var zh_tw_default = zhTw;

// src/locale/helpers.ts
var localeMap = {
  en: en_default,
  zh: zh_default,
  "zh-cn": zh_default,
  "zh-tw": zh_tw_default,
  "zh-hk": zh_tw_default
};
var getLocale = () => {
  var _a;
  const lang = ((_a = window.localStorage) == null ? void 0 : _a.getItem("language")) || "en";
  return localeMap[lang] || localeMap[lang.split("-")[0]] || en_default;
};
function t(key) {
  const currentLocale = getLocale();
  return currentLocale[key] || en_default[key] || key;
}

// src/insertRegistry.ts
var BUILTIN_ITEMS = [
  { id: "h1", sectionKey: "headings", labelKey: "menu.h1", icon: "heading-1", keywords: ["h1", "#1", "title"] },
  { id: "h2", sectionKey: "headings", labelKey: "menu.h2", icon: "heading-2", keywords: ["h2", "#2", "title"] },
  { id: "h3", sectionKey: "headings", labelKey: "menu.h3", icon: "heading-3", keywords: ["h3", "#3", "title"] },
  { id: "h4", sectionKey: "headings", labelKey: "menu.h4", icon: "heading-4", keywords: ["h4", "#4", "title"] },
  { id: "h5", sectionKey: "headings", labelKey: "menu.h5", icon: "heading-5", keywords: ["h5", "#5", "title"] },
  // "check list" with the space is in the keywords deliberately: the matcher
  // tests the query as one substring, so a two-word query matches nothing
  // unless a keyword contains the space too.
  { id: "todo", sectionKey: "insert", labelKey: "menu.todo", icon: "check-square", keywords: ["todo", "task", "checkbox", "checklist", "check list", "- [ ]"] },
  { id: "code", sectionKey: "insert", labelKey: "menu.code", icon: "code", keywords: ["```"] },
  { id: "math", sectionKey: "insert", labelKey: "menu.math", icon: "sigma", keywords: ["latex", "$$"] },
  { id: "table", sectionKey: "insert", labelKey: "menu.table", icon: "table" },
  { id: "divider", sectionKey: "insert", labelKey: "menu.divider", icon: "minus", keywords: ["hr", "---", "rule", "separator", "line", "break"] },
  { id: "toc", sectionKey: "insert", labelKey: "menu.toc", icon: "list-ordered", keywords: ["toc", "contents", "outline", "headings", "index"] },
  { id: "callout", sectionKey: "insert", labelKey: "menu.callout", icon: "pencil", keywords: ["admonition"] },
  { id: "page", sectionKey: "inline", labelKey: "menu.page", icon: "file-plus", keywords: ["note", "subpage", "new"] },
  { id: "link", sectionKey: "inline", labelKey: "menu.link", icon: "link", keywords: ["wikilink", "[["] },
  { id: "ext-link", sectionKey: "inline", labelKey: "menu.extLink", icon: "link-2", keywords: ["url"] },
  { id: "image", sectionKey: "inline", labelKey: "menu.image", icon: "image", keywords: ["photo", "picture"] },
  { id: "attachment", sectionKey: "inline", labelKey: "menu.attachment", icon: "paperclip", keywords: ["file", "pdf", "upload"] },
  { id: "today", sectionKey: "meta", labelKey: "menu.today", icon: "calendar", keywords: ["date"] },
  { id: "yesterday", sectionKey: "meta", labelKey: "menu.yesterday", icon: "calendar-minus", keywords: ["date", "yesterday"] },
  { id: "tomorrow", sectionKey: "meta", labelKey: "menu.tomorrow", icon: "calendar-plus", keywords: ["date", "tomorrow"] },
  { id: "time", sectionKey: "meta", labelKey: "menu.time", icon: "clock" },
  { id: "footnote", sectionKey: "meta", labelKey: "menu.footnote", icon: "hash" },
  { id: "comment", sectionKey: "meta", labelKey: "menu.comment", icon: "message-square" }
];
var DEFAULT_INSERT_ORDER = BUILTIN_ITEMS.map((item) => item.id);
function resolveMenuItems(builtins, custom, order, hidden, translate) {
  var _a;
  const pool = /* @__PURE__ */ new Map();
  for (const item of builtins) {
    pool.set(item.id, {
      id: item.id,
      sectionKey: item.sectionKey,
      label: translate(item.labelKey),
      icon: item.icon,
      keywords: (_a = item.keywords) != null ? _a : []
    });
  }
  for (const item of custom) {
    pool.set(item.id, {
      id: item.id,
      sectionKey: "custom",
      label: item.label,
      icon: item.icon,
      keywords: [],
      commandId: item.commandId
    });
  }
  const hiddenSet = new Set(hidden);
  const placed = /* @__PURE__ */ new Set();
  const result = [];
  for (const id of order) {
    const item = pool.get(id);
    if (!item || placed.has(id))
      continue;
    placed.add(id);
    if (!hiddenSet.has(id))
      result.push(item);
  }
  for (const [id, item] of pool) {
    if (placed.has(id))
      continue;
    if (!hiddenSet.has(id))
      result.push(item);
  }
  return result;
}
function reorderIds(order, from, to) {
  const next = [...order];
  if (!Number.isInteger(from) || !Number.isInteger(to))
    return next;
  if (from === to)
    return next;
  if (from < 0 || from >= order.length)
    return next;
  if (to < 0 || to >= order.length)
    return next;
  const [moved] = next.splice(from, 1);
  next.splice(to - (from < to ? 1 : 0), 0, moved);
  return next;
}
function groupBySection(items) {
  const sections = [];
  for (const item of items) {
    const last = sections[sections.length - 1];
    if (last && last.sectionKey === item.sectionKey) {
      last.items.push(item);
    } else {
      sections.push({ sectionKey: item.sectionKey, items: [item] });
    }
  }
  return sections;
}
var BUILTIN_IDS = new Set(BUILTIN_ITEMS.map((item) => item.id));
function addCustomItem(layout, item) {
  return { ...layout, insertCustom: [...layout.insertCustom, item] };
}
function updateCustomItem(layout, item) {
  return {
    ...layout,
    insertCustom: layout.insertCustom.map((entry) => entry.id === item.id ? item : entry)
  };
}
function removeCustomItem(layout, id) {
  if (BUILTIN_IDS.has(id))
    return layout;
  return {
    insertCustom: layout.insertCustom.filter((entry) => entry.id !== id),
    // Leaving the id in either list would keep resolveMenuItems skipping a
    // row that no longer exists, and a stale hidden entry would suppress a
    // future custom item that happened to reuse the id.
    insertOrder: layout.insertOrder.filter((entry) => entry !== id),
    insertHidden: layout.insertHidden.filter((entry) => entry !== id)
  };
}
function setItemHidden(layout, id, hidden) {
  const without = layout.insertHidden.filter((entry) => entry !== id);
  return { ...layout, insertHidden: hidden ? [...without, id] : without };
}
function resetItemLayout(layout) {
  return { ...layout, insertOrder: [], insertHidden: [] };
}
function applyOrder(layout, order) {
  const live = /* @__PURE__ */ new Set([...BUILTIN_IDS, ...layout.insertCustom.map((entry) => entry.id)]);
  return { ...layout, insertOrder: order.filter((id) => live.has(id)) };
}
var COMMAND_PICKER_LIMIT = 200;
function matchCommands(commands, query, limit = COMMAND_PICKER_LIMIT) {
  const needle = query.trim().toLowerCase();
  const scored = [];
  for (const command of commands) {
    if (!command.name)
      continue;
    const name = command.name.toLowerCase();
    const at = needle === "" ? 0 : name.indexOf(needle);
    if (at === -1)
      continue;
    scored.push({ command, at, name });
  }
  scored.sort((a, b) => a.at - b.at || a.name.localeCompare(b.name));
  return scored.slice(0, limit).map((entry) => entry.command);
}

// src/insertCommandModal.ts
var import_obsidian = require("obsidian");
function listCommands(app) {
  var _a;
  const registry = (_a = app.commands) == null ? void 0 : _a.commands;
  return registry ? Object.values(registry) : [];
}
var CommandSuggest = class extends import_obsidian.AbstractInputSuggest {
  constructor(app, inputEl, onPick) {
    super(app, inputEl);
    this.onPick = onPick;
    this.limit = COMMAND_PICKER_LIMIT;
  }
  getSuggestions(query) {
    return matchCommands(listCommands(this.app), query);
  }
  renderSuggestion(command, el) {
    el.createDiv({ cls: "ftn-command-suggest-name", text: command.name });
    el.createDiv({ cls: "ftn-command-suggest-id", text: command.id });
  }
  selectSuggestion(command) {
    this.setValue(command.name);
    this.onPick(command);
    this.close();
  }
};
var InsertCommandModal = class extends import_obsidian.Modal {
  constructor(app, existing, onSave) {
    var _a, _b, _c, _d;
    super(app);
    this.onSave = onSave;
    this.iconPreviewEl = null;
    this.labelInputEl = null;
    this.id = (_a = existing == null ? void 0 : existing.id) != null ? _a : `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    this.label = (_b = existing == null ? void 0 : existing.label) != null ? _b : "";
    this.icon = (_c = existing == null ? void 0 : existing.icon) != null ? _c : "zap";
    this.commandId = (_d = existing == null ? void 0 : existing.commandId) != null ? _d : "";
  }
  onOpen() {
    var _a, _b;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: t("settings.customCommand.title") });
    new import_obsidian.Setting(contentEl).setName(t("settings.customCommand.label")).addText((text) => {
      this.labelInputEl = text.inputEl;
      text.setValue(this.label).onChange((value) => {
        this.label = value;
      });
    });
    const commandName = (_b = (_a = listCommands(this.app).find((command) => command.id === this.commandId)) == null ? void 0 : _a.name) != null ? _b : "";
    new import_obsidian.Setting(contentEl).setName(t("settings.customCommand.command")).setDesc(t("settings.customCommand.commandDesc")).addText((text) => {
      text.setValue(commandName);
      new CommandSuggest(this.app, text.inputEl, (command) => {
        this.commandId = command.id;
        if (!this.label.trim() && this.labelInputEl) {
          this.label = command.name;
          this.labelInputEl.value = command.name;
        }
        if (command.icon && this.icon === "zap") {
          this.icon = command.icon;
          this.renderIconPreview();
        }
      });
    });
    const iconSetting = new import_obsidian.Setting(contentEl).setName(t("settings.customCommand.icon")).setDesc(t("settings.customCommand.iconDesc")).addText((text) => text.setValue(this.icon).onChange((value) => {
      this.icon = value;
      this.renderIconPreview();
    }));
    this.iconPreviewEl = iconSetting.controlEl.createSpan({ cls: "ftn-icon-preview" });
    this.renderIconPreview();
    new import_obsidian.Setting(contentEl).addButton((button) => button.setButtonText(t("settings.customCommand.save")).setCta().onClick(() => {
      if (!this.label.trim() || !this.commandId)
        return;
      this.onSave({
        id: this.id,
        label: this.label.trim(),
        icon: this.icon.trim() || "zap",
        commandId: this.commandId
      });
      this.close();
    })).addButton((button) => button.setButtonText(t("settings.customCommand.cancel")).onClick(() => this.close()));
  }
  renderIconPreview() {
    if (!this.iconPreviewEl)
      return;
    this.iconPreviewEl.empty();
    (0, import_obsidian.setIcon)(this.iconPreviewEl, this.icon.trim() || "zap");
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/settings.ts
var DEFAULT_SETTINGS = {
  enabled: true,
  // Notion drags whole blocks, not single lines. A wrapped paragraph is one
  // block to the reader, so 'line' meant grabbing a paragraph moved a
  // fragment of it and left the rest behind.
  dragGranularity: "paragraph",
  hoverDelay: 0,
  // Raised from 200ms. It has to cover the pointer's pause between leaving
  // a line and arriving at the handle, which is what made the handle feel
  // like it vanished the moment attention moved to it.
  hideDelay: 300,
  handleSide: "left",
  // OFF by default: it changes the handle from a hover affordance into a
  // permanent one, which is a different editor to look at.
  handleAlwaysVisible: false,
  // OFF by default: it adds a third button to the hover handle, which is a
  // visible change to every line you point at rather than an opt-in feature.
  foldHandle: false,
  dateFormat: "YYYY-MM-DD",
  timeFormat: "HH:mm",
  // OFF by default: it changes editing behaviour, not just appearance.
  // With it on, `**` cannot be clicked between or hand-edited.
  hideSyntaxMarkers: false,
  // OFF by default: it changes what Backspace and typing replace, so it is
  // behaviour rather than appearance. The blue overlay is on regardless.
  snapSelectionToBlocks: false,
  blockKeys: true,
  plusHandle: true,
  slashMenu: true,
  slashTrigger: "/",
  slashInline: true,
  // Empty rather than the built-in order: resolveMenuItems appends anything
  // an order does not name, so an empty order IS the built-in order, and
  // storing it explicitly would freeze out rows added by later versions.
  insertOrder: [],
  insertHidden: [],
  insertCustom: [],
  // OFF by default, as asked: an attachment reads as a link unless it is
  // explicitly meant to render inline.
  embedAttachments: false
};
var BlockPluginSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    /** The insert-menu list, repainted on its own so display() is never needed. */
    this.insertListEl = null;
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian2.Setting(containerEl).setName(t("settings.enablePlugin.name")).setDesc(t("settings.enablePlugin.desc")).addToggle((toggle) => toggle.setValue(this.plugin.settings.enabled).onChange(async (value) => {
      this.plugin.settings.enabled = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName(t("settings.dragGranularity.name")).setDesc(t("settings.dragGranularity.desc")).addDropdown((dropdown) => dropdown.addOption("line", t("settings.dragGranularity.line")).addOption("paragraph", t("settings.dragGranularity.paragraph")).setValue(this.plugin.settings.dragGranularity).onChange(async (value) => {
      this.plugin.settings.dragGranularity = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName(t("settings.hoverDelay.name")).setDesc(t("settings.hoverDelay.desc")).addSlider((slider) => slider.setLimits(0, 500, 50).setValue(this.plugin.settings.hoverDelay).onChange(async (value) => {
      this.plugin.settings.hoverDelay = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName(t("settings.hideDelay.name")).setDesc(t("settings.hideDelay.desc")).addSlider((slider) => slider.setLimits(0, 1e3, 50).setValue(this.plugin.settings.hideDelay).onChange(async (value) => {
      this.plugin.settings.hideDelay = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName(t("settings.handleSide.name")).setDesc(t("settings.handleSide.desc")).addDropdown((dropdown) => dropdown.addOption("left", t("settings.handleSide.left")).addOption("right", t("settings.handleSide.right")).setValue(this.plugin.settings.handleSide).onChange(async (value) => {
      this.plugin.settings.handleSide = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName(t("settings.handleAlwaysVisible.name")).setDesc(t("settings.handleAlwaysVisible.desc")).addToggle((toggle) => toggle.setValue(this.plugin.settings.handleAlwaysVisible).onChange(async (value) => {
      this.plugin.settings.handleAlwaysVisible = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName(t("settings.foldHandle.name")).setDesc(t("settings.foldHandle.desc")).addToggle((toggle) => toggle.setValue(this.plugin.settings.foldHandle).onChange(async (value) => {
      this.plugin.settings.foldHandle = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName(t("settings.dateFormat.name")).setDesc(t("settings.dateFormat.desc")).addText((text) => text.setPlaceholder("YYYY-MM-DD").setValue(this.plugin.settings.dateFormat).onChange(async (value) => {
      this.plugin.settings.dateFormat = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName(t("settings.timeFormat.name")).setDesc(t("settings.timeFormat.desc")).addText((text) => text.setPlaceholder("HH:mm").setValue(this.plugin.settings.timeFormat).onChange(async (value) => {
      this.plugin.settings.timeFormat = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("Hide syntax markers").setDesc(
      "Keep **, _, ==, ` and heading #s hidden even on the line you are editing, so text stops shifting sideways as the caret enters a formatted span. Trade-off: markers cannot be clicked between or hand-edited \u2014 use Cmd+B / Cmd+I instead."
    ).addToggle((toggle) => toggle.setValue(this.plugin.settings.hideSyntaxMarkers).onChange(async (value) => {
      this.plugin.settings.hideSyntaxMarkers = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("Snap selection to whole blocks").setDesc(
      "When a mouse drag crosses a block boundary, expand the selection to whole blocks. The blue block overlay is shown either way; this controls whether typing and Backspace act on whole blocks too. Shift+Arrow is never snapped."
    ).addToggle((toggle) => toggle.setValue(this.plugin.settings.snapSelectionToBlocks).onChange(async (value) => {
      this.plugin.settings.snapSelectionToBlocks = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("Block-aware Cmd+A and Backspace").setDesc(
      "Cmd+A selects the block you are in, and again selects the note. Backspace at the start of a block steps out one indent level, then drops the list marker or heading, then merges into the block above."
    ).addToggle((toggle) => toggle.setValue(this.plugin.settings.blockKeys).onChange(async (value) => {
      this.plugin.settings.blockKeys = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("Insert menu").setHeading();
    new import_obsidian2.Setting(containerEl).setName('Show the "+" handle').setDesc("The button beside the drag handle that opens the insert menu.").addToggle((toggle) => toggle.setValue(this.plugin.settings.plusHandle).onChange(async (value) => {
      this.plugin.settings.plusHandle = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("Open the insert menu by typing").setDesc(
      'Type the trigger character to open the same menu the "+" handle opens, then keep typing to filter it.'
    ).addToggle((toggle) => toggle.setValue(this.plugin.settings.slashMenu).onChange(async (value) => {
      this.plugin.settings.slashMenu = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("Trigger character").setDesc('A single character. For a key combination instead, bind "Open block insert menu" under Hotkeys.').addText((text) => text.setPlaceholder("/").setValue(this.plugin.settings.slashTrigger).onChange(async (value) => {
      this.plugin.settings.slashTrigger = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("Open it mid-line too").setDesc(
      'Off: the trigger only works on an otherwise empty block. On: it also works in the middle of a line, as long as it follows a space \u2014 so "and/or", a URL and a date are still left alone.'
    ).addToggle((toggle) => toggle.setValue(this.plugin.settings.slashInline).onChange(async (value) => {
      this.plugin.settings.slashInline = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("Embed inserted attachments").setDesc(
      'Off: an attachment is inserted as a link, [name](path). On: it gets a leading "!" so Obsidian renders it inline. Either way the file is saved wherever Files & Links says attachments go.'
    ).addToggle((toggle) => toggle.setValue(this.plugin.settings.embedAttachments).onChange(async (value) => {
      this.plugin.settings.embedAttachments = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName(t("settings.insertItems.name")).setDesc(t("settings.insertItems.desc")).setHeading();
    this.renderInsertItemList(containerEl);
  }
  /**
   * The insert menu's rows, reorderable and individually switchable.
   *
   * Order is stored as a full id list rather than as a sparse set of moves:
   * resolveMenuItems appends anything the list does not name, so a partial
   * list still works, but writing the whole list keeps what is stored and
   * what is shown identical.
   */
  renderInsertItemList(containerEl) {
    this.insertListEl = containerEl.createDiv({ cls: "ftn-insert-item-list" });
    this.refreshInsertList();
    new import_obsidian2.Setting(containerEl).addButton((button) => button.setButtonText(t("settings.addCommand")).onClick(() => {
      new InsertCommandModal(this.app, null, (item) => {
        void this.applyLayout(addCustomItem(this.plugin.settings, item));
      }).open();
    })).addButton((button) => button.setButtonText(t("settings.resetOrder")).onClick(() => {
      void this.applyLayout(resetItemLayout(this.plugin.settings));
    }));
  }
  /**
   * Writes a layout back and repaints the list.
   *
   * Never calls display(). PluginSettingTab.display() begins by emptying the
   * whole tab, so using it to reflect a one-row change threw away every other
   * setting on the page and scrolled the user back to the top — on every add,
   * edit, delete, reorder and reset. Only the list needs to change, so only
   * the list is rebuilt.
   */
  async applyLayout(next) {
    this.plugin.settings.insertOrder = next.insertOrder;
    this.plugin.settings.insertHidden = next.insertHidden;
    this.plugin.settings.insertCustom = next.insertCustom;
    await this.plugin.saveSettings();
    this.refreshInsertList();
  }
  /** Every Obsidian command by id, for naming a custom row's binding. */
  commandsById() {
    var _a, _b;
    return (_b = (_a = this.app.commands) == null ? void 0 : _a.commands) != null ? _b : {};
  }
  refreshInsertList() {
    const listEl = this.insertListEl;
    if (!listEl)
      return;
    const settings = this.plugin.settings;
    const scrollTop = listEl.scrollTop;
    listEl.empty();
    const items = resolveMenuItems(BUILTIN_ITEMS, settings.insertCustom, settings.insertOrder, [], (key) => t(key));
    const order = items.map((item) => item.id);
    const commands = this.commandsById();
    items.forEach((item, index) => {
      var _a;
      const row = listEl.createDiv({ cls: "ftn-insert-item-row", attr: { draggable: "true" } });
      row.dataset.index = String(index);
      (0, import_obsidian2.setIcon)(row.createSpan({ cls: "ftn-insert-item-grip" }), "grip-vertical");
      (0, import_obsidian2.setIcon)(row.createSpan({ cls: "ftn-insert-item-icon" }), item.icon);
      const custom = settings.insertCustom.find((entry) => entry.id === item.id);
      const textEl = row.createDiv({ cls: "ftn-insert-item-text" });
      textEl.createDiv({ cls: "ftn-insert-item-label", text: item.label });
      if (custom) {
        const bound = commands[custom.commandId];
        if (bound) {
          textEl.createDiv({
            cls: "ftn-insert-item-source",
            text: t("settings.customCommand.boundTo").replace("{name}", (_a = bound.name) != null ? _a : custom.commandId)
          });
        } else {
          textEl.createDiv({ cls: "ftn-insert-item-source is-missing", text: t("settings.commandMissing") });
        }
      }
      const controls = row.createDiv({ cls: "ftn-insert-item-controls" });
      const toggle = controls.createEl("input", { attr: { type: "checkbox" } });
      toggle.checked = !settings.insertHidden.includes(item.id);
      toggle.addEventListener("change", () => {
        const next = setItemHidden(this.plugin.settings, item.id, !toggle.checked);
        this.plugin.settings.insertHidden = next.insertHidden;
        void this.plugin.saveSettings();
      });
      if (custom) {
        const editBtn = controls.createDiv({ cls: "ftn-insert-item-button", attr: { "aria-label": t("settings.customCommand.edit") } });
        (0, import_obsidian2.setIcon)(editBtn, "pencil");
        editBtn.addEventListener("click", () => {
          new InsertCommandModal(this.app, custom, (updated) => {
            void this.applyLayout(updateCustomItem(this.plugin.settings, updated));
          }).open();
        });
        const deleteBtn = controls.createDiv({ cls: "ftn-insert-item-button is-danger", attr: { "aria-label": t("settings.customCommand.delete") } });
        (0, import_obsidian2.setIcon)(deleteBtn, "trash-2");
        deleteBtn.addEventListener("click", () => {
          void this.applyLayout(removeCustomItem(this.plugin.settings, custom.id));
        });
      }
      row.addEventListener("dragstart", (event) => {
        var _a2;
        (_a2 = event.dataTransfer) == null ? void 0 : _a2.setData("text/plain", String(index));
        row.addClass("is-dragging");
      });
      row.addEventListener("dragend", () => row.removeClass("is-dragging"));
      row.addEventListener("dragover", (event) => {
        event.preventDefault();
        row.addClass("is-drop-target");
      });
      row.addEventListener("dragleave", () => row.removeClass("is-drop-target"));
      row.addEventListener("drop", (event) => {
        var _a2;
        event.preventDefault();
        row.removeClass("is-drop-target");
        const from = Number((_a2 = event.dataTransfer) == null ? void 0 : _a2.getData("text/plain"));
        if (from === index)
          return;
        void this.applyLayout(applyOrder(this.plugin.settings, reorderIds(order, from, index)));
      });
    });
    listEl.scrollTop = scrollTop;
  }
};

// src/blockHandles.ts
var import_view2 = require("@codemirror/view");
var import_obsidian6 = require("obsidian");

// src/history.ts
var import_commands = require("@codemirror/commands");
function dispatchBlockEdit(view, spec) {
  view.dispatch({
    ...spec,
    annotations: [
      import_commands.isolateHistory.of("full"),
      ...toArray(spec.annotations)
    ]
  });
}
function toArray(value) {
  if (value === void 0)
    return [];
  return Array.isArray(value) ? value : [value];
}

// src/notionActionMenu.ts
var import_obsidian4 = require("obsidian");

// src/blockTransform.ts
var import_obsidian3 = require("obsidian");

// src/insertPlan.ts
function planInsert(input) {
  var _a, _b;
  const { lineFrom, lineTo, lineText, insertText, remove, extra = [], needsBlankLine, previousLineHasContent } = input;
  const cursorOffset = (_a = input.cursorOffset) != null ? _a : insertText.length;
  const defaultAt = remove && !input.asBlock ? remove.from : lineTo;
  let at = (_b = input.at) != null ? _b : defaultAt;
  if (remove && at >= remove.from && at < remove.to)
    at = remove.to;
  const remaining = remove ? lineText.slice(0, remove.from - lineFrom) + lineText.slice(remove.to - lineFrom) : lineText;
  const needsNewLine = input.asBlock && remaining.trim().length > 0;
  let prefix = "";
  if (needsNewLine) {
    prefix = needsBlankLine ? "\n\n" : "\n";
  } else if (needsBlankLine && previousLineHasContent) {
    prefix = "\n";
  }
  const changes = [];
  if (remove && remove.to > remove.from)
    changes.push({ from: remove.from, to: remove.to });
  changes.push({ from: at, insert: prefix + insertText });
  changes.push(...extra);
  const removedBefore = remove && remove.to <= at ? remove.to - remove.from : 0;
  const anchor = at - removedBefore + prefix.length + cursorOffset;
  return { changes, anchor };
}

// src/attachmentLink.ts
function encodeLinkPath(path) {
  return encodeURI(path).replace(/\(/g, "%28").replace(/\)/g, "%29");
}
function linkDisplayName(path) {
  var _a;
  const name = (_a = path.split("/").pop()) != null ? _a : path;
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}
function toMarkdownLink(generated, path, embed) {
  var _a;
  const source = generated.trim();
  const wiki = /^!?\[\[([^\]|]+)(?:\|([^\]]*))?\]\]$/.exec(source);
  let link;
  if (wiki) {
    const target = wiki[1];
    const alias = ((_a = wiki[2]) == null ? void 0 : _a.trim()) || linkDisplayName(target);
    link = `[${alias}](${encodeLinkPath(target)})`;
  } else {
    link = source.replace(/^!/, "");
    link = link.replace(/^\[\]\(/, `[${linkDisplayName(path)}](`);
  }
  return (embed ? "!" : "") + link;
}

// src/tableOfContents.ts
var HEADING = /^ {0,3}(#{1,6})[ \t]+(.*?)[ \t]*#*[ \t]*$/;
var FENCE = /^[ \t]*(```|~~~)/;
function collectHeadings(doc, skipLine = 0) {
  const headings = [];
  let openFence = null;
  let n = 0;
  for (const text of doc.iterLines()) {
    n++;
    const fence = FENCE.exec(text);
    if (fence) {
      if (openFence === null)
        openFence = fence[1];
      else if (fence[1] === openFence)
        openFence = null;
      continue;
    }
    if (openFence !== null)
      continue;
    if (n === skipLine)
      continue;
    const match = HEADING.exec(text);
    if (!match)
      continue;
    const label = match[2].trim();
    if (label.length === 0)
      continue;
    headings.push({ level: match[1].length, text: label, line: n });
  }
  return headings;
}
function headingAnchor(text) {
  return text.replace(/[[\]#|^]/g, "").replace(/\s+/g, " ").trim();
}
function tableOfContents(headings, options = {}) {
  var _a, _b;
  const indent = (_a = options.indent) != null ? _a : "	";
  const linkable = headings.map((heading) => ({ level: heading.level, anchor: headingAnchor(heading.text) })).filter((heading) => heading.anchor.length > 0);
  if (linkable.length === 0)
    return "";
  const levels = [...new Set(linkable.map((heading) => heading.level))].sort((a, b) => a - b);
  const depthOf = new Map(levels.map((level, index) => [level, index]));
  const rows = linkable.map((heading) => {
    var _a2;
    const depth = (_a2 = depthOf.get(heading.level)) != null ? _a2 : 0;
    return `${indent.repeat(depth)}- [[#${heading.anchor}|${heading.anchor}]]`;
  });
  const title = (_b = options.title) == null ? void 0 : _b.trim();
  return title ? [`**${title}**`, ...rows].join("\n") : rows.join("\n");
}
function quotePrefix(lineText) {
  var _a, _b;
  return (_b = (_a = /^[ \t]*(?:>[ \t]?)+/.exec(lineText)) == null ? void 0 : _a[0]) != null ? _b : "";
}
function prefixLines(text, prefix, skipFirst = false) {
  if (prefix.length === 0)
    return text;
  return text.split("\n").map((line, index) => skipFirst && index === 0 ? line : prefix + line).join("\n");
}

// src/blockTransform.ts
var IMAGE_EXTENSIONS = /* @__PURE__ */ new Set(["avif", "bmp", "gif", "jpeg", "jpg", "png", "svg", "webp"]);
var now = () => (0, import_obsidian3.moment)();
function stripPrefix(lineText) {
  return lineText.replace(/^#{1,6} /, "").replace(/^[-*+] \[[ x]\] /, "").replace(/^[-*+] /, "").replace(/^\d+\. /, "").replace(/^> \[![^\]]+\][+-]?\n?> ?/, "").replace(/^> /, "").replace(/^%%(.*)%%$/, "$1").trim();
}
async function insertImageFiles(plugin, view, lineNo, files, remove) {
  const imageFiles = files.filter(isImageFile);
  if (imageFiles.length === 0) {
    new import_obsidian3.Notice(t("notice.selectImage"));
    return;
  }
  try {
    const links = await saveAttachments(plugin, imageFiles, (link) => `!${link}`);
    insertTextAtLineEnd(view, lineNo, links.join("\n"), true, remove);
  } catch (e) {
    new import_obsidian3.Notice(t("notice.insertImageFailed"));
  }
}
async function insertAttachmentFiles(plugin, view, lineNo, files, remove) {
  if (files.length === 0)
    return;
  try {
    const embed = plugin.settings.embedAttachments;
    const links = await saveAttachments(
      plugin,
      files,
      (link, path) => toMarkdownLink(link, path, embed)
    );
    insertTextAtLineEnd(view, lineNo, links.join("\n"), true, remove);
  } catch (e) {
    new import_obsidian3.Notice(t("notice.insertAttachmentFailed"));
  }
}
async function insertNewPage(plugin, view, lineNo, remove) {
  var _a, _b, _c;
  const active = plugin.app.workspace.getActiveFile();
  const sourcePath = (_a = active == null ? void 0 : active.path) != null ? _a : "";
  const folder = (_c = (_b = active == null ? void 0 : active.parent) == null ? void 0 : _b.path) != null ? _c : "";
  try {
    const file = await plugin.app.vault.create(
      availableNotePath(plugin, folder, t("page.untitled")),
      ""
    );
    insertTextAtLineEnd(view, lineNo, plugin.app.fileManager.generateMarkdownLink(file, sourcePath), false, remove);
    await plugin.app.workspace.getLeaf(false).openFile(file);
  } catch (e) {
    new import_obsidian3.Notice(t("notice.createPageFailed"));
  }
}
function availableNotePath(plugin, folder, base) {
  const prefix = folder && folder !== "/" ? `${folder}/` : "";
  for (let n = 0; n < 1e3; n++) {
    const path = `${prefix}${n === 0 ? base : `${base} ${n}`}.md`;
    if (!plugin.app.vault.getAbstractFileByPath(path))
      return path;
  }
  throw new Error("no available note name");
}
function insertTableOfContents(view, lineNo, remove) {
  const line = view.state.doc.line(lineNo);
  const body = tableOfContents(collectHeadings(view.state.doc, lineNo), {
    title: t("toc.title")
  });
  if (body.length === 0) {
    insertTextAtLineEnd(view, lineNo, "", false, remove);
    new import_obsidian3.Notice(t("notice.noHeadings"));
    return;
  }
  const remaining = remove ? line.text.slice(0, remove.from - line.from) + line.text.slice(remove.to - line.from) : line.text;
  const prefix = quotePrefix(line.text);
  const onNewLine = remaining.slice(prefix.length).trim().length > 0;
  insertTextAtLineEnd(view, lineNo, prefixLines(body, prefix, !onNewLine), onNewLine, remove);
}
async function saveAttachments(plugin, files, format) {
  var _a, _b;
  const sourcePath = (_b = (_a = plugin.app.workspace.getActiveFile()) == null ? void 0 : _a.path) != null ? _b : "";
  const links = [];
  for (const file of files) {
    const safeName = sanitizeAttachmentName(file.name);
    const targetPath = await plugin.app.fileManager.getAvailablePathForAttachment(safeName, sourcePath);
    const savedFile = await plugin.app.vault.createBinary(targetPath, await file.arrayBuffer());
    const generated = plugin.app.fileManager.generateMarkdownLink(savedFile, sourcePath);
    links.push(format(generated, savedFile.path));
  }
  return links;
}
function insertTextAtLineEnd(view, lineNo, insertText, insertAsBlock, remove) {
  const line = view.state.doc.line(lineNo);
  const plan = planInsert({
    lineFrom: line.from,
    lineTo: line.to,
    lineText: line.text,
    insertText,
    asBlock: insertAsBlock,
    remove
  });
  dispatchBlockEdit(view, {
    changes: plan.changes,
    selection: { anchor: plan.anchor },
    scrollIntoView: true,
    userEvent: "insert.block"
  });
}
function isImageFile(file) {
  const ext = getFileExtension(file.name);
  return IMAGE_EXTENSIONS.has(ext);
}
function sanitizeAttachmentName(name) {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, "-").replace(/[\u0000-\u001f\u007f]/g, "-").replace(/^\.+/, "").trim();
  return cleaned || "attachment";
}
function getFileExtension(name) {
  const index = name.lastIndexOf(".");
  if (index < 0)
    return "";
  return name.slice(index + 1).toLowerCase();
}
function transformLine(view, lineNo, targetType) {
  const line = view.state.doc.line(lineNo);
  const lineText = line.text;
  const content = stripPrefix(lineText);
  let newText = "";
  if (targetType.startsWith("callout-")) {
    const type = targetType.replace("callout-", "");
    newText = `> [!${type}]
> ${content}`;
  } else {
    switch (targetType) {
      case "h1":
        newText = "# " + content;
        break;
      case "h2":
        newText = "## " + content;
        break;
      case "h3":
        newText = "### " + content;
        break;
      case "h4":
        newText = "#### " + content;
        break;
      case "h5":
        newText = "##### " + content;
        break;
      case "bullet":
      case "toggle":
        newText = "- " + content;
        break;
      case "numbered":
        newText = "1. " + content;
        break;
      case "todo":
        newText = "- [ ] " + content;
        break;
      case "blockquote":
        newText = "> " + content;
        break;
      case "paragraph":
        newText = content;
        break;
      case "code":
        newText = "```\n" + content + "\n```";
        break;
      case "math":
        newText = "$$\n" + content + "\n$$";
        break;
      case "divider":
        newText = "---";
        break;
      default:
        newText = content;
        break;
    }
  }
  dispatchBlockEdit(view, {
    changes: {
      from: line.from,
      to: line.to,
      insert: newText
    },
    userEvent: "input.block-transform"
  });
}
function insertBlock(plugin, view, lineNo, targetType, remove) {
  var _a;
  const line = view.state.doc.line(lineNo);
  const settings = plugin.settings;
  let insertText = "";
  let cursorOffset = 0;
  let isMetadata = false;
  let customPos = null;
  const extraChanges = [];
  if (targetType.startsWith("callout-")) {
    const type = targetType.replace("callout-", "");
    insertText = `> [!${type}]
> `;
    cursorOffset = insertText.length;
  } else {
    switch (targetType) {
      case "h1":
        insertText = "# ";
        break;
      case "h2":
        insertText = "## ";
        break;
      case "h3":
        insertText = "### ";
        break;
      case "h4":
        insertText = "#### ";
        break;
      case "h5":
        insertText = "##### ";
        break;
      case "todo":
        insertText = "- [ ] ";
        break;
      case "toggle":
      case "bullet":
        insertText = "- ";
        break;
      case "numbered":
        insertText = "1. ";
        break;
      case "blockquote":
        insertText = "> ";
        break;
      case "paragraph":
        insertText = "";
        break;
      case "code":
        insertText = "```\n\n```";
        cursorOffset = 4;
        break;
      case "math":
        insertText = "$$\n\n$$";
        cursorOffset = 3;
        break;
      case "divider":
        insertText = "---\n";
        break;
      case "link":
        insertText = "[[]]";
        cursorOffset = 2;
        break;
      case "ext-link":
        insertText = "[]()";
        cursorOffset = 1;
        break;
      case "embed":
        insertText = "![[]]";
        cursorOffset = 3;
        break;
      case "tag":
        insertText = "#";
        cursorOffset = 1;
        break;
      case "comment":
        insertText = "%%  %%";
        cursorOffset = 3;
        break;
      case "today":
        insertText = now().format(settings.dateFormat);
        break;
      case "yesterday":
        insertText = now().subtract(1, "days").format(settings.dateFormat);
        break;
      case "tomorrow":
        insertText = now().add(1, "days").format(settings.dateFormat);
        break;
      case "time":
        insertText = now().format(settings.timeFormat);
        break;
      case "table": {
        insertText = "|  |  |  |\n| --- | --- | --- |\n|  |  |  |\n|  |  |  |";
        cursorOffset = 2;
        break;
      }
      case "frontmatter": {
        isMetadata = true;
        const firstLine = view.state.doc.line(1);
        if (firstLine.text === "---") {
          return;
        }
        insertText = "---\n\n---\n";
        customPos = 0;
        cursorOffset = 4;
        break;
      }
      case "footnote": {
        const footnoteId = Math.floor(Math.random() * 1e3);
        insertText = `[^${footnoteId}]`;
        extraChanges.push({
          from: view.state.doc.length,
          insert: `

[^${footnoteId}]: `
        });
        break;
      }
      default:
        insertText = "";
        break;
    }
  }
  const isNewLine = !isMetadata && !["link", "ext-link", "embed", "tag", "comment", "today", "yesterday", "tomorrow", "time"].includes(targetType);
  const needsBlankLine = targetType === "table";
  const previousLineHasContent = needsBlankLine && lineNo > 1 && view.state.doc.line(lineNo - 1).text.trim().length > 0;
  const plan = planInsert({
    lineFrom: line.from,
    lineTo: line.to,
    lineText: line.text,
    insertText,
    cursorOffset: cursorOffset || insertText.length,
    asBlock: isNewLine,
    at: customPos != null ? customPos : void 0,
    remove,
    extra: extraChanges,
    needsBlankLine,
    previousLineHasContent
  });
  dispatchBlockEdit(view, {
    changes: plan.changes,
    selection: { anchor: plan.anchor },
    scrollIntoView: true,
    userEvent: "insert.block"
  });
  if (targetType === "table") {
    const win = (_a = view.dom.ownerDocument.defaultView) != null ? _a : activeWindow;
    win.requestAnimationFrame(() => {
      if (plan.anchor > view.state.doc.length)
        return;
      view.dispatch({ selection: { anchor: plan.anchor }, scrollIntoView: true });
    });
  }
}

// src/menuPosition.ts
var PADDING = 8;
var GAP = 6;
var MAX_HEIGHT = 300;
var MIN_HEIGHT = 120;
function placeMenu(input) {
  const spaceBelow = input.viewportHeight - PADDING - input.anchorY;
  const spaceAbove = input.avoidTop - GAP - PADDING;
  const placeBelow = input.menuHeight <= spaceBelow || spaceBelow >= spaceAbove;
  const maxHeight = Math.min(
    MAX_HEIGHT,
    Math.max(MIN_HEIGHT, placeBelow ? spaceBelow : spaceAbove)
  );
  const height = Math.min(input.menuHeight, maxHeight);
  const top = placeBelow ? input.anchorY : Math.max(PADDING, input.avoidTop - GAP - height);
  let left = input.anchorX;
  if (left + input.menuWidth > input.viewportWidth - PADDING) {
    left = Math.max(PADDING, input.viewportWidth - input.menuWidth - PADDING);
  }
  return { top, left, maxHeight };
}
function placeSubmenu(input) {
  let left = input.parentRight + GAP;
  if (left + input.menuWidth > input.viewportWidth - PADDING) {
    left = Math.max(PADDING, input.parentLeft - input.menuWidth - GAP);
  }
  let top = input.parentTop;
  if (top + input.menuHeight > input.viewportHeight - PADDING) {
    top = Math.max(PADDING, input.viewportHeight - input.menuHeight - PADDING);
  }
  return { top, left };
}

// src/colorWrap.ts
function splitMarkdownLine(text) {
  var _a, _b;
  const blockIdMatch = text.match(/(\s\^[A-Za-z0-9-]+)$/);
  const suffix = (_a = blockIdMatch == null ? void 0 : blockIdMatch[1]) != null ? _a : "";
  const body = suffix ? text.slice(0, -suffix.length) : text;
  const prefixMatch = body.match(/^(#{1,6}\s+|[-*+]\s+\[[ xX]\]\s+|[-*+]\s+|\d+\.\s+|>\s+)/);
  const prefix = (_b = prefixMatch == null ? void 0 : prefixMatch[1]) != null ? _b : "";
  return {
    prefix,
    content: body.slice(prefix.length).trim(),
    suffix
  };
}
function unwrap(content) {
  return content.replace(/^<span style="[^"]*">(.*)<\/span>$/u, "$1").replace(/^<mark style="[^"]*">(.*)<\/mark>$/u, "$1");
}
function planColorWrap(lineText, tagName, style) {
  const parts = splitMarkdownLine(lineText);
  const content = unwrap(parts.content);
  if (!tagName) {
    return {
      text: `${parts.prefix}${content}${parts.suffix}`,
      caretOffset: parts.prefix.length + content.length
    };
  }
  const openTag = `<${tagName} style="${style}">`;
  return {
    text: `${parts.prefix}${openTag}${content}</${tagName}>${parts.suffix}`,
    caretOffset: parts.prefix.length + openTag.length + content.length
  };
}

// src/codeFence.ts
var FENCE2 = /^\s*(```|~~~)/;
function findCodeFence(doc, lineNo) {
  let openChar = null;
  let openLine = 0;
  let n = 0;
  for (const text of doc.iterLines()) {
    n++;
    const match = FENCE2.exec(text);
    if (n <= lineNo) {
      if (match) {
        if (openChar === null) {
          openChar = match[1];
          openLine = n;
        } else if (match[1] === openChar) {
          if (n === lineNo)
            return { openLine, closeLine: n };
          openChar = null;
          openLine = 0;
        }
      }
      if (n === lineNo && openChar === null)
        return null;
      continue;
    }
    if (match && match[1] === openChar)
      return { openLine, closeLine: n };
  }
  return openChar === null ? null : { openLine, closeLine: null };
}
function isInsideCodeFence(doc, lineNo) {
  const fence = findCodeFence(doc, lineNo);
  return fence !== null && lineNo > fence.openLine;
}
function findFencedLines(doc) {
  const fenced = /* @__PURE__ */ new Set();
  let openChar = null;
  let n = 0;
  for (const text of doc.iterLines()) {
    n++;
    const match = FENCE2.exec(text);
    if (openChar !== null) {
      fenced.add(n);
      if (match && match[1] === openChar) {
        openChar = null;
      }
      continue;
    }
    if (match)
      openChar = match[1];
  }
  return fenced;
}
function codeFenceContent(doc, lineNo) {
  const fence = findCodeFence(doc, lineNo);
  if (!fence)
    return null;
  const first = fence.openLine + 1;
  const last = fence.closeLine === null ? doc.lines : fence.closeLine - 1;
  if (last < first)
    return null;
  return { from: doc.line(first).from, to: doc.line(last).to };
}
function findFenceSpans(doc) {
  const spans = /* @__PURE__ */ new Map();
  let openChar = null;
  let open = [];
  let n = 0;
  const close = (lastLine) => {
    const span = { firstLine: open[0], lastLine };
    for (const line of open)
      spans.set(line, span);
    openChar = null;
    open = [];
  };
  for (const text of doc.iterLines()) {
    n++;
    const match = FENCE2.exec(text);
    if (openChar === null) {
      if (match) {
        openChar = match[1];
        open = [n];
      }
      continue;
    }
    open.push(n);
    if (match && match[1] === openChar)
      close(n);
  }
  if (openChar !== null)
    close(n);
  return spans;
}

// src/notionActionMenu.ts
var TEXT_COLORS = [
  { id: "default", label: "\u9ED8\u8BA4\u6587\u672C", value: "", className: "is-default" },
  { id: "gray", label: "\u7070\u8272\u6587\u672C", value: "var(--text-muted)", className: "is-gray" },
  { id: "brown", label: "\u68D5\u8272\u6587\u672C", value: "var(--color-orange)", className: "is-brown" },
  { id: "orange", label: "\u6A59\u8272\u6587\u672C", value: "var(--color-orange)", className: "is-orange" },
  { id: "yellow", label: "\u9EC4\u8272\u6587\u672C", value: "var(--color-yellow)", className: "is-yellow" },
  { id: "green", label: "\u7EFF\u8272\u6587\u672C", value: "var(--color-green)", className: "is-green" },
  { id: "blue", label: "\u84DD\u8272\u6587\u672C", value: "var(--color-blue)", className: "is-blue" },
  { id: "purple", label: "\u7D2B\u8272\u6587\u672C", value: "var(--color-purple)", className: "is-purple" },
  { id: "pink", label: "\u7C89\u8272\u6587\u672C", value: "var(--color-pink)", className: "is-pink" },
  { id: "red", label: "\u7EA2\u8272\u6587\u672C", value: "var(--color-red)", className: "is-red" }
];
var BACKGROUND_COLORS = [
  { id: "default", label: "\u9ED8\u8BA4\u80CC\u666F", value: "", className: "is-default" },
  { id: "gray", label: "\u7070\u8272\u80CC\u666F", value: "rgba(var(--mono-rgb-100), 0.08)", className: "is-gray" },
  { id: "brown", label: "\u68D5\u8272\u80CC\u666F", value: "rgba(var(--color-orange-rgb), 0.16)", className: "is-brown" },
  { id: "orange", label: "\u6A59\u8272\u80CC\u666F", value: "rgba(var(--color-orange-rgb), 0.16)", className: "is-orange" },
  { id: "yellow", label: "\u9EC4\u8272\u80CC\u666F", value: "rgba(var(--color-yellow-rgb), 0.18)", className: "is-yellow" },
  { id: "green", label: "\u7EFF\u8272\u80CC\u666F", value: "rgba(var(--color-green-rgb), 0.16)", className: "is-green" },
  { id: "blue", label: "\u84DD\u8272\u80CC\u666F", value: "rgba(var(--color-blue-rgb), 0.16)", className: "is-blue" },
  { id: "purple", label: "\u7D2B\u8272\u80CC\u666F", value: "rgba(var(--color-purple-rgb), 0.16)", className: "is-purple" },
  { id: "pink", label: "\u7C89\u8272\u80CC\u666F", value: "rgba(var(--color-pink-rgb), 0.16)", className: "is-pink" },
  { id: "red", label: "\u7EA2\u8272\u80CC\u666F", value: "rgba(var(--color-red-rgb), 0.16)", className: "is-red" }
];
var CALLOUT_OPTIONS = [
  { type: "note", label: "note" },
  { type: "info", label: "info" },
  { type: "todo", label: "todo" },
  { type: "tip", label: "tip" },
  { type: "success", label: "success" },
  { type: "question", label: "question" },
  { type: "warning", label: "warning" },
  { type: "failure", label: "failure" },
  { type: "danger", label: "danger" },
  { type: "bug", label: "bug" },
  { type: "example", label: "example" },
  { type: "quote", label: "quote" }
];
var CALLOUT_ICONS = {
  note: "pencil",
  abstract: "clipboard-list",
  summary: "clipboard-list",
  tldr: "clipboard-list",
  info: "info",
  todo: "check-circle",
  tip: "flame",
  hint: "flame",
  important: "flame",
  success: "check",
  check: "check",
  done: "check",
  question: "help-circle",
  help: "help-circle",
  faq: "help-circle",
  warning: "alert-triangle",
  caution: "alert-triangle",
  attention: "alert-triangle",
  failure: "x-circle",
  fail: "x-circle",
  missing: "x-circle",
  danger: "zap",
  error: "zap",
  bug: "bug",
  example: "list",
  quote: "quote",
  cite: "quote"
};
var OPEN_MENUS = /* @__PURE__ */ new Set();
function showNotionBlockActionMenu(plugin, view, lineNo, pos, options = {}) {
  closeNotionBlockActionMenus();
  const menu = new NotionBlockActionMenu(plugin, view, lineNo, pos, options);
  OPEN_MENUS.add(menu);
  menu.open();
}
function closeNotionBlockActionMenus() {
  OPEN_MENUS.forEach((menu) => menu.close());
  OPEN_MENUS.clear();
}
var NotionBlockActionMenu = class {
  constructor(plugin, view, lineNo, pos, options) {
    this.rootEl = null;
    this.submenuEl = null;
    this.listEl = null;
    this.activeIndex = 0;
    this.visibleItems = [];
    this.handlePointerDown = (event) => this.onPointerDown(event);
    this.handleKeyDown = (event) => this.onKeyDown(event);
    var _a;
    this.plugin = plugin;
    this.view = view;
    this.lineNo = lineNo;
    this.pos = pos;
    this.options = options;
    this.ownerDocument = view.dom.ownerDocument;
    this.ownerWindow = (_a = this.ownerDocument.defaultView) != null ? _a : activeWindow;
  }
  open() {
    this.rootEl = this.ownerDocument.body.createDiv({ cls: "wk-nb-action-menu" });
    this.rootEl.setAttribute("role", "menu");
    this.rootEl.tabIndex = -1;
    this.rootEl.setCssStyles({ left: `${this.pos.x}px`, top: `${this.pos.y}px` });
    this.listEl = this.rootEl.createDiv({ cls: "wk-nb-action-menu-list" });
    this.renderList();
    this.reposition();
    this.rootEl.focus();
    this.ownerDocument.addEventListener("pointerdown", this.handlePointerDown, true);
    this.ownerDocument.addEventListener("keydown", this.handleKeyDown, true);
  }
  close() {
    var _a;
    this.ownerDocument.removeEventListener("pointerdown", this.handlePointerDown, true);
    this.ownerDocument.removeEventListener("keydown", this.handleKeyDown, true);
    this.closeFloatingSubmenu();
    (_a = this.rootEl) == null ? void 0 : _a.remove();
    this.rootEl = null;
    OPEN_MENUS.delete(this);
  }
  renderList() {
    if (!this.listEl)
      return;
    this.listEl.empty();
    const transformItems = this.getTurnIntoItems();
    const colorItems = this.getColorEntryItems();
    const blockItems = this.getBlockActionItems();
    this.visibleItems = [...transformItems, ...colorItems, ...blockItems];
    this.renderSection(t("menu.turnInto"), transformItems);
    this.renderSeparator();
    this.renderSection("", colorItems);
    this.renderSeparator();
    this.renderSection("", blockItems);
    this.reposition();
  }
  getTurnIntoItems() {
    return [
      { id: "paragraph", label: t("menu.paragraph"), icon: "text", action: () => this.runTransform("paragraph") },
      // Lucide names are kebab-case; "heading1" resolved to nothing and
      // these rows rendered with a blank icon slot.
      { id: "h1", label: t("menu.h1"), icon: "heading-1", action: () => this.runTransform("h1") },
      { id: "h2", label: t("menu.h2"), icon: "heading-2", action: () => this.runTransform("h2") },
      { id: "h3", label: t("menu.h3"), icon: "heading-3", action: () => this.runTransform("h3") },
      { id: "h4", label: t("menu.h4"), icon: "heading-4", action: () => this.runTransform("h4") },
      { id: "h5", label: t("menu.h5"), icon: "heading-5", action: () => this.runTransform("h5") },
      { id: "todo", label: t("menu.todo"), icon: "check-square", action: () => this.runTransform("todo") },
      { id: "bullet", label: t("menu.bullet"), icon: "list", action: () => this.runTransform("bullet") },
      { id: "numbered", label: t("menu.numbered"), icon: "list-ordered", action: () => this.runTransform("numbered") },
      { id: "blockquote", label: t("menu.blockquote"), icon: "quote", action: () => this.runTransform("blockquote") },
      { id: "code", label: t("menu.code"), icon: "code", action: () => this.runTransform("code") },
      { id: "math", label: t("menu.math"), icon: "sigma", action: () => this.runTransform("math") },
      { id: "divider", label: t("menu.divider"), icon: "minus", action: () => this.runTransform("divider") },
      { id: "callout", label: t("menu.callout"), icon: this.getCurrentCalloutIcon(), page: "callout" }
    ];
  }
  getColorEntryItems() {
    return [
      { id: "color", label: t("menu.color"), icon: "paint-roller", page: "color" }
    ];
  }
  getBlockActionItems() {
    return [
      { id: "copy-link", label: t("menu.copyLink"), icon: "link", shortcut: "\u2318\u2303L", action: () => this.copyBlockLink() },
      { id: "delete", label: t("menu.delete"), icon: "trash-2", shortcut: "Del", action: () => this.deleteLine() }
    ];
  }
  getTextColorItems() {
    return TEXT_COLORS.map((color) => ({
      id: `text-${color.id}`,
      label: t(`color.text${color.id.charAt(0).toUpperCase() + color.id.slice(1)}`),
      icon: "letter-text",
      action: () => this.applyTextColor(color)
    }));
  }
  getBackgroundColorItems() {
    return BACKGROUND_COLORS.map((color) => ({
      id: `bg-${color.id}`,
      label: t(`color.bg${color.id.charAt(0).toUpperCase() + color.id.slice(1)}`),
      icon: "paint-bucket",
      action: () => this.applyBackgroundColor(color)
    }));
  }
  getCalloutItems() {
    return CALLOUT_OPTIONS.map((option) => ({
      id: `callout-${option.type}`,
      label: t(`callout.${option.type}`),
      icon: this.getCalloutIcon(option.type),
      action: () => this.runTransform(`callout-${option.type}`)
    }));
  }
  renderSection(title, items, colorOptions) {
    if (!this.listEl || items.length === 0)
      return;
    if (title) {
      this.listEl.createDiv({ cls: "wk-nb-action-menu-section", text: title });
    }
    items.forEach((item) => this.renderItem(item, colorOptions == null ? void 0 : colorOptions.find((color) => item.id.endsWith(color.id))));
  }
  renderSeparator() {
    var _a;
    (_a = this.listEl) == null ? void 0 : _a.createDiv({ cls: "wk-nb-action-menu-separator" });
  }
  renderItem(item, color) {
    if (!this.listEl)
      return;
    const index = this.visibleItems.indexOf(item);
    const row = this.listEl.createDiv({
      cls: `wk-nb-action-menu-row${index === this.activeIndex ? " is-active" : ""}`,
      attr: { role: "menuitem" }
    });
    const iconWrap = row.createSpan({ cls: "wk-nb-action-menu-icon" });
    if (color) {
      iconWrap.addClass("wk-nb-action-menu-color-icon", color.className);
      iconWrap.setText(item.id.startsWith("text-") ? "A" : "");
    } else {
      (0, import_obsidian4.setIcon)(iconWrap, item.icon);
    }
    row.createSpan({ cls: "wk-nb-action-menu-label", text: item.label });
    if (item.shortcut) {
      row.createSpan({ cls: "wk-nb-action-menu-shortcut", text: item.shortcut });
    }
    if (item.page) {
      (0, import_obsidian4.setIcon)(row.createSpan({ cls: "wk-nb-action-menu-chevron" }), "chevron-right");
    }
    row.addEventListener("mouseenter", () => {
      this.activeIndex = Math.max(0, index);
      this.refreshActiveRows();
      this.syncFloatingSubmenuForItem(item);
    });
    row.addEventListener("click", () => {
      void this.activateItem(item);
    });
  }
  renderFloatingSubmenu(page) {
    var _a;
    if (!this.rootEl)
      return;
    (_a = this.submenuEl) == null ? void 0 : _a.remove();
    this.submenuEl = this.ownerDocument.body.createDiv({ cls: `wk-nb-action-menu wk-nb-action-submenu is-${page}` });
    this.submenuEl.setAttribute("role", "menu");
    if (page === "color") {
      this.renderFloatingSection(this.submenuEl, t("menu.textColor"), this.getTextColorItems(), TEXT_COLORS);
      this.submenuEl.createDiv({ cls: "wk-nb-action-menu-separator" });
      this.renderFloatingSection(this.submenuEl, t("menu.backgroundColor"), this.getBackgroundColorItems(), BACKGROUND_COLORS);
    } else {
      this.renderFloatingSection(this.submenuEl, t("menu.callout"), this.getCalloutItems());
    }
    this.positionFloatingSubmenu();
  }
  closeFloatingSubmenu() {
    var _a;
    (_a = this.submenuEl) == null ? void 0 : _a.remove();
    this.submenuEl = null;
  }
  syncFloatingSubmenuForItem(item) {
    if (item == null ? void 0 : item.page) {
      this.renderFloatingSubmenu(item.page);
      return;
    }
    this.closeFloatingSubmenu();
  }
  renderFloatingSection(container, title, items, colors) {
    container.createDiv({ cls: "wk-nb-action-menu-section", text: title });
    items.forEach((item) => {
      const color = colors == null ? void 0 : colors.find((option) => item.id.endsWith(option.id));
      const row = container.createDiv({ cls: "wk-nb-action-menu-row", attr: { role: "menuitem" } });
      const iconWrap = row.createSpan({ cls: "wk-nb-action-menu-icon" });
      if (color) {
        iconWrap.addClass("wk-nb-action-menu-color-icon", color.className);
        iconWrap.setText(item.id.startsWith("text-") ? "A" : "");
      } else {
        (0, import_obsidian4.setIcon)(iconWrap, item.icon);
      }
      row.createSpan({ cls: "wk-nb-action-menu-label", text: item.label });
      row.addEventListener("click", () => {
        void this.activateItem(item);
      });
    });
  }
  refreshActiveRows() {
    var _a;
    if (!this.listEl)
      return;
    const rows = Array.from(this.listEl.querySelectorAll(".wk-nb-action-menu-row"));
    rows.forEach((row, index) => {
      row.toggleClass("is-active", index === this.activeIndex);
    });
    (_a = rows[this.activeIndex]) == null ? void 0 : _a.scrollIntoView({ block: "nearest" });
  }
  async activateItem(item) {
    if (item.page) {
      this.renderFloatingSubmenu(item.page);
      return;
    }
    if (item.action) {
      await item.action();
      this.close();
    }
  }
  onPointerDown(event) {
    var _a, _b;
    if ((_a = this.rootEl) == null ? void 0 : _a.contains(event.target))
      return;
    if ((_b = this.submenuEl) == null ? void 0 : _b.contains(event.target))
      return;
    this.close();
  }
  onKeyDown(event) {
    if (!this.rootEl)
      return;
    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const length = Math.max(this.visibleItems.length, 1);
      this.activeIndex = (this.activeIndex + delta + length) % length;
      this.refreshActiveRows();
      this.syncFloatingSubmenuForItem(this.visibleItems[this.activeIndex]);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = this.visibleItems[this.activeIndex];
      if (item)
        void this.activateItem(item);
    }
  }
  runTransform(type) {
    transformLine(this.view, this.lineNo, type);
  }
  getCurrentCalloutIcon() {
    const line = this.view.state.doc.line(this.lineNo);
    const match = line.text.match(/^>\s*\[!([^\]\s|+-]+)/);
    return this.getCalloutIcon(match == null ? void 0 : match[1]);
  }
  getCalloutIcon(type) {
    var _a;
    if (!type)
      return CALLOUT_ICONS.note;
    return (_a = CALLOUT_ICONS[type.toLowerCase()]) != null ? _a : CALLOUT_ICONS.note;
  }
  deleteLine() {
    var _a, _b;
    const doc = this.view.state.doc;
    const span = findFenceSpans(doc).get(this.lineNo);
    const first = doc.line((_a = span == null ? void 0 : span.firstLine) != null ? _a : this.lineNo);
    const last = doc.line((_b = span == null ? void 0 : span.lastLine) != null ? _b : this.lineNo);
    const from = first.number === 1 ? first.from : first.from - 1;
    const to = first.number === 1 && doc.lines > last.number ? last.to + 1 : last.to;
    dispatchBlockEdit(this.view, {
      changes: { from, to, insert: "" },
      scrollIntoView: true,
      userEvent: "delete.block"
    });
  }
  async copyBlockLink() {
    var _a;
    const file = this.plugin.app.workspace.getActiveFile();
    if (!file) {
      new import_obsidian4.Notice(t("notice.noActiveNote"));
      return;
    }
    const line = this.view.state.doc.line(this.lineNo);
    const existingId = (_a = line.text.match(/\s\^([A-Za-z0-9-]+)$/)) == null ? void 0 : _a[1];
    const blockId = existingId != null ? existingId : `nb-${Date.now().toString(36)}`;
    if (!existingId) {
      dispatchBlockEdit(this.view, {
        changes: { from: line.to, insert: ` ^${blockId}` },
        userEvent: "input.block-id"
      });
    }
    const link = `[[${file.basename}#^${blockId}]]`;
    try {
      await this.ownerWindow.navigator.clipboard.writeText(link);
      new import_obsidian4.Notice(t("notice.linkCopied"));
    } catch (e) {
      new import_obsidian4.Notice(t("notice.linkCopyFailed"));
    }
  }
  applyTextColor(color) {
    this.wrapLineContent(color.value ? "span" : "", color.value ? `color: ${color.value};` : "");
  }
  applyBackgroundColor(color) {
    this.wrapLineContent(color.value ? "mark" : "", color.value ? `background-color: ${color.value}; color: inherit;` : "");
  }
  wrapLineContent(tagName, style) {
    const line = this.view.state.doc.line(this.lineNo);
    const plan = planColorWrap(line.text, tagName, style);
    dispatchBlockEdit(this.view, {
      changes: { from: line.from, to: line.to, insert: plan.text },
      selection: { anchor: line.from + plan.caretOffset },
      scrollIntoView: true,
      userEvent: "input.block-color"
    });
    this.view.focus();
  }
  reposition() {
    var _a, _b;
    if (!this.rootEl)
      return;
    this.rootEl.setCssStyles({ maxHeight: "" });
    const rect = this.rootEl.getBoundingClientRect();
    const placement = placeMenu({
      anchorX: this.pos.x,
      anchorY: this.pos.y,
      avoidTop: (_b = (_a = this.options.avoid) == null ? void 0 : _a.top) != null ? _b : this.pos.y,
      menuWidth: rect.width,
      menuHeight: rect.height,
      viewportWidth: this.ownerWindow.innerWidth,
      viewportHeight: this.ownerWindow.innerHeight
    });
    this.rootEl.setCssStyles({
      maxHeight: `${placement.maxHeight}px`,
      left: `${placement.left}px`,
      top: `${placement.top}px`
    });
    this.positionFloatingSubmenu();
  }
  positionFloatingSubmenu() {
    if (!this.rootEl || !this.submenuEl)
      return;
    const rootRect = this.rootEl.getBoundingClientRect();
    const submenuRect = this.submenuEl.getBoundingClientRect();
    const placement = placeSubmenu({
      parentLeft: rootRect.left,
      parentRight: rootRect.right,
      parentTop: rootRect.top,
      menuWidth: submenuRect.width,
      menuHeight: submenuRect.height,
      viewportWidth: this.ownerWindow.innerWidth,
      viewportHeight: this.ownerWindow.innerHeight
    });
    this.submenuEl.setCssStyles({ left: `${placement.left}px`, top: `${placement.top}px` });
  }
};

// src/notionInsertMenu.ts
var import_obsidian5 = require("obsidian");

// src/slashTrigger.ts
function isSlashTriggerPosition(textBeforeTrigger, allowInline = false) {
  if (stripMarkers(textBeforeTrigger).trim().length === 0)
    return true;
  if (!allowInline)
    return false;
  return /\s$/.test(textBeforeTrigger);
}
var MARKER = /^[ \t]*(?:>[ \t]*|(?:[-*+]|\d+[.)])[ \t]+(?:\[[ xX]\][ \t]+)?)/;
function stripMarkers(text) {
  let out = text;
  for (; ; ) {
    const next = out.replace(MARKER, "");
    if (next === out)
      return out;
    out = next;
  }
}
function readSlashQuery(lineText, triggerCol, caretCol, trigger) {
  if (caretCol <= triggerCol)
    return null;
  if (lineText[triggerCol] !== trigger)
    return null;
  return lineText.slice(triggerCol + trigger.length, caretCol);
}
function matchesQuery(query, label, keywords = []) {
  const q = query.trim().toLowerCase();
  if (q.length === 0)
    return true;
  return [label, ...keywords].some((candidate) => candidate.toLowerCase().includes(q));
}
function normaliseTrigger(raw) {
  var _a;
  const trimmed = (raw != null ? raw : "").trim();
  if (trimmed.length === 0)
    return null;
  return (_a = Array.from(trimmed)[0]) != null ? _a : null;
}

// src/notionInsertMenu.ts
var CALLOUT_OPTIONS2 = [
  { type: "note", label: "note" },
  { type: "info", label: "info" },
  { type: "todo", label: "todo" },
  { type: "tip", label: "tip" },
  { type: "success", label: "success" },
  { type: "question", label: "question" },
  { type: "warning", label: "warning" },
  { type: "failure", label: "failure" },
  { type: "danger", label: "danger" },
  { type: "bug", label: "bug" },
  { type: "example", label: "example" },
  { type: "quote", label: "quote" }
];
var CALLOUT_ICONS2 = {
  note: "pencil",
  abstract: "clipboard-list",
  summary: "clipboard-list",
  tldr: "clipboard-list",
  info: "info",
  todo: "check-circle",
  tip: "flame",
  hint: "flame",
  important: "flame",
  success: "check",
  check: "check",
  done: "check",
  question: "help-circle",
  help: "help-circle",
  faq: "help-circle",
  warning: "alert-triangle",
  caution: "alert-triangle",
  attention: "alert-triangle",
  failure: "x-circle",
  fail: "x-circle",
  missing: "x-circle",
  danger: "zap",
  error: "zap",
  bug: "bug",
  example: "list",
  quote: "quote",
  cite: "quote"
};
var OPEN_INSERT_MENUS = /* @__PURE__ */ new Set();
function showNotionBlockInsertMenu(plugin, view, lineNo, pos, options = {}) {
  closeNotionBlockInsertMenus();
  const menu = new NotionBlockInsertMenu(plugin, view, lineNo, pos, options);
  OPEN_INSERT_MENUS.add(menu);
  menu.open();
  return menu;
}
function closeNotionBlockInsertMenus() {
  OPEN_INSERT_MENUS.forEach((menu) => menu.close());
  OPEN_INSERT_MENUS.clear();
}
var NotionBlockInsertMenu = class {
  constructor(plugin, view, lineNo, pos, options) {
    this.rootEl = null;
    this.submenuEl = null;
    this.listEl = null;
    this.activeIndex = 0;
    this.query = "";
    this.visibleItems = [];
    this.handlePointerDown = (event) => this.onPointerDown(event);
    this.handleKeyDown = (event) => this.onKeyDown(event);
    var _a;
    this.plugin = plugin;
    this.view = view;
    this.lineNo = lineNo;
    this.pos = pos;
    this.options = options;
    this.ownerDocument = view.dom.ownerDocument;
    this.ownerWindow = (_a = this.ownerDocument.defaultView) != null ? _a : activeWindow;
  }
  open() {
    this.rootEl = this.ownerDocument.body.createDiv({ cls: "wk-nb-action-menu wk-nb-insert-menu" });
    this.rootEl.setAttribute("role", "menu");
    this.rootEl.tabIndex = -1;
    this.rootEl.setCssStyles({ left: `${this.pos.x}px`, top: `${this.pos.y}px` });
    this.listEl = this.rootEl.createDiv({ cls: "wk-nb-action-menu-list" });
    this.renderList();
    this.reposition();
    if (this.options.keepEditorFocus) {
      this.rootEl.addEventListener("mousedown", (event) => event.preventDefault());
    } else {
      this.rootEl.focus();
    }
    this.ownerDocument.addEventListener("pointerdown", this.handlePointerDown, true);
    this.ownerDocument.addEventListener("keydown", this.handleKeyDown, true);
  }
  close() {
    var _a, _b, _c;
    this.ownerDocument.removeEventListener("pointerdown", this.handlePointerDown, true);
    this.ownerDocument.removeEventListener("keydown", this.handleKeyDown, true);
    this.closeFloatingSubmenu();
    (_a = this.rootEl) == null ? void 0 : _a.remove();
    this.rootEl = null;
    OPEN_INSERT_MENUS.delete(this);
    (_c = (_b = this.options).onClose) == null ? void 0 : _c.call(_b);
  }
  setQuery(query) {
    if (query === this.query)
      return this.visibleItems.length > 0;
    this.query = query;
    this.activeIndex = 0;
    this.closeFloatingSubmenu();
    this.renderList();
    return this.visibleItems.length > 0;
  }
  renderList() {
    if (!this.listEl)
      return;
    this.listEl.empty();
    const sections = this.getSections().map((section) => ({
      title: section.title,
      items: section.items.filter((item) => matchesQuery(this.query, item.label, item.keywords))
    })).filter((section) => section.items.length > 0);
    this.visibleItems = sections.flatMap((section) => section.items);
    sections.forEach((section, index) => {
      if (index > 0)
        this.renderSeparator();
      this.renderSection(section.title, section.items);
    });
    this.reposition();
  }
  /** The section heading for a run of rows, or "" where the menu shows none. */
  sectionTitle(key) {
    if (key === "headings")
      return t("menu.headings");
    if (key === "insert")
      return t("menu.insert");
    if (key === "custom")
      return t("menu.custom");
    return "";
  }
  /** Turns a registry row into a menu row, attaching its behaviour. */
  toInsertItem(resolved) {
    if (resolved.commandId) {
      const commandId = resolved.commandId;
      return {
        id: resolved.id,
        label: resolved.label,
        icon: resolved.icon,
        keywords: resolved.keywords,
        action: () => this.runCommand(commandId)
      };
    }
    if (resolved.id === "callout") {
      return {
        id: resolved.id,
        label: resolved.label,
        icon: this.getCalloutIcon("note"),
        keywords: resolved.keywords,
        page: "callout"
      };
    }
    return {
      id: resolved.id,
      label: resolved.label,
      icon: resolved.icon,
      keywords: resolved.keywords,
      action: this.builtinAction(resolved.id)
    };
  }
  builtinAction(id) {
    if (id === "toc")
      return () => this.insertTableOfContents();
    if (id === "page")
      return () => this.createPage();
    if (id === "image")
      return () => this.openImagePicker();
    if (id === "attachment")
      return () => this.openAttachmentPicker();
    return () => this.insert(id);
  }
  getSections() {
    const isFiltering = this.query.trim().length > 0;
    const settings = this.plugin.settings;
    const resolved = resolveMenuItems(
      BUILTIN_ITEMS,
      settings.insertCustom,
      settings.insertOrder,
      // The submenu parent is redundant while filtering, because the flat
      // callout rows below carry every type it would have opened.
      isFiltering ? [...settings.insertHidden, "callout"] : settings.insertHidden,
      t
    );
    const sections = groupBySection(resolved).map((section) => ({
      title: this.sectionTitle(section.sectionKey),
      items: section.items.map((item) => this.toInsertItem(item))
    }));
    sections.push(
      { title: isFiltering ? t("menu.callout") : "", items: isFiltering ? this.getCalloutItems() : [] },
      { title: "", items: this.getDismissItems() }
    );
    return sections;
  }
  /**
   * Runs a user-bound Obsidian command.
   *
   * The menu closes and the typed `/query` is removed first, so the command
   * acts on a document with no trigger text left in it. The removal and the
   * command are two undo steps rather than one: the command dispatches its
   * own transaction and there is no way to reach inside it. Undoing twice
   * after a custom row is the accepted cost of binding arbitrary commands.
   *
   * app.commands is not in Obsidian's public types, hence the narrow cast.
   */
  runCommand(commandId) {
    const remove = this.removeRange();
    this.close();
    if (remove) {
      this.view.dispatch({ changes: { from: remove.from, to: remove.to, insert: "" } });
    }
    const commands = this.plugin.app.commands;
    if (!(commands == null ? void 0 : commands.executeCommandById(commandId))) {
      new import_obsidian5.Notice(t("settings.commandMissing"));
    }
    return true;
  }
  /**
   * "Close menu" — leaves the typed trigger in the note as literal text.
   *
   * Escape already does this, but only if you know it does. Offered only
   * when a trigger character was actually typed: opened from the "+" handle
   * there is no "/" sitting in the document to keep, so the row would close
   * a menu and do nothing else.
   */
  getDismissItems() {
    if (this.options.replaceFrom === void 0)
      return [];
    return [{
      id: "close",
      label: t("menu.closeMenu"),
      icon: "x",
      keywords: ["escape", "esc", "dismiss", "cancel", "text", "literal"],
      // Neither inserts nor removes: everything typed stays exactly
      // where it is, which is the whole point of the row.
      action: () => void 0
    }];
  }
  renderSection(title, items) {
    if (!this.listEl || items.length === 0)
      return;
    if (title) {
      this.listEl.createDiv({ cls: "wk-nb-action-menu-section", text: title });
    }
    items.forEach((item) => this.renderItem(item));
  }
  renderSeparator() {
    var _a;
    (_a = this.listEl) == null ? void 0 : _a.createDiv({ cls: "wk-nb-action-menu-separator" });
  }
  renderItem(item) {
    if (!this.listEl)
      return;
    const index = this.visibleItems.indexOf(item);
    const row = this.listEl.createDiv({
      cls: `wk-nb-action-menu-row${index === this.activeIndex ? " is-active" : ""}`,
      attr: { role: "menuitem" }
    });
    (0, import_obsidian5.setIcon)(row.createSpan({ cls: "wk-nb-action-menu-icon" }), item.icon);
    row.createSpan({ cls: "wk-nb-action-menu-label", text: item.label });
    if (item.page) {
      (0, import_obsidian5.setIcon)(row.createSpan({ cls: "wk-nb-action-menu-chevron" }), "chevron-right");
    }
    row.addEventListener("mouseenter", () => {
      this.activeIndex = Math.max(0, index);
      this.refreshActiveRows();
      this.syncFloatingSubmenuForItem(item);
    });
    row.addEventListener("click", () => {
      this.activateItem(item);
    });
  }
  renderFloatingSubmenu(page) {
    var _a;
    if (!this.rootEl)
      return;
    (_a = this.submenuEl) == null ? void 0 : _a.remove();
    this.submenuEl = this.ownerDocument.body.createDiv({ cls: `wk-nb-action-menu wk-nb-action-submenu is-${page}` });
    this.submenuEl.setAttribute("role", "menu");
    if (this.options.keepEditorFocus) {
      this.submenuEl.addEventListener("mousedown", (event) => event.preventDefault());
    }
    this.renderFloatingSection(this.submenuEl, t("menu.callout"), this.getCalloutItems(false));
    this.positionFloatingSubmenu();
  }
  getCalloutItems(prefixed = true) {
    return CALLOUT_OPTIONS2.map((option) => ({
      id: `callout-${option.type}`,
      // In the flat list both words are in the label so the query can
      // arrive from either direction: "callout" lists them all, "bug"
      // finds the one. Inside the submenu the heading already says
      // "Callout", so repeating it on every row is just noise.
      label: prefixed ? `${t("menu.callout")}: ${t(`callout.${option.type}`)}` : t(`callout.${option.type}`),
      icon: this.getCalloutIcon(option.type),
      keywords: [option.type, "admonition"],
      action: () => this.insert(`callout-${option.type}`)
    }));
  }
  renderFloatingSection(container, title, items) {
    container.createDiv({ cls: "wk-nb-action-menu-section", text: title });
    items.forEach((item) => {
      const row = container.createDiv({ cls: "wk-nb-action-menu-row", attr: { role: "menuitem" } });
      (0, import_obsidian5.setIcon)(row.createSpan({ cls: "wk-nb-action-menu-icon" }), item.icon);
      row.createSpan({ cls: "wk-nb-action-menu-label", text: item.label });
      row.addEventListener("click", () => {
        this.activateItem(item);
      });
    });
  }
  closeFloatingSubmenu() {
    var _a;
    (_a = this.submenuEl) == null ? void 0 : _a.remove();
    this.submenuEl = null;
  }
  syncFloatingSubmenuForItem(item) {
    if (item == null ? void 0 : item.page) {
      this.renderFloatingSubmenu(item.page);
      return;
    }
    this.closeFloatingSubmenu();
  }
  refreshActiveRows() {
    var _a;
    if (!this.listEl)
      return;
    const rows = Array.from(this.listEl.querySelectorAll(".wk-nb-action-menu-row"));
    rows.forEach((row, index) => {
      row.toggleClass("is-active", index === this.activeIndex);
    });
    (_a = rows[this.activeIndex]) == null ? void 0 : _a.scrollIntoView({ block: "nearest" });
  }
  activateItem(item) {
    var _a;
    if (item.page) {
      this.renderFloatingSubmenu(item.page);
      return;
    }
    const keepOpen = (_a = item.action) == null ? void 0 : _a.call(item);
    if (keepOpen !== true)
      this.close();
  }
  /**
   * The `/query` to delete alongside the insert.
   *
   * Read at activation time rather than when the menu opened, because the
   * user carries on typing while it is up and the caret has moved since.
   */
  removeRange() {
    const from = this.options.replaceFrom;
    if (from === void 0)
      return void 0;
    const to = this.view.state.selection.main.head;
    if (to <= from)
      return void 0;
    return { from, to };
  }
  insert(type) {
    insertBlock(this.plugin, this.view, this.lineNo, type, this.removeRange());
  }
  insertTableOfContents() {
    insertTableOfContents(this.view, this.lineNo, this.removeRange());
  }
  /**
   * The query range is read here, synchronously, and passed in.
   *
   * Creating the note is async, so the menu has already closed by the time
   * the link is written — reading the range inside insertNewPage would read
   * it from a menu that no longer exists.
   */
  createPage() {
    void insertNewPage(this.plugin, this.view, this.lineNo, this.removeRange());
  }
  openImagePicker() {
    return this.openFilePicker(
      ".avif,.bmp,.gif,.jpeg,.jpg,.png,.svg,.webp,image/avif,image/bmp,image/gif,image/jpeg,image/png,image/svg+xml,image/webp",
      (files, remove) => insertImageFiles(this.plugin, this.view, this.lineNo, files, remove)
    );
  }
  openAttachmentPicker() {
    return this.openFilePicker(
      "",
      (files, remove) => insertAttachmentFiles(this.plugin, this.view, this.lineNo, files, remove)
    );
  }
  openFilePicker(accept, handle) {
    const remove = this.removeRange();
    const input = this.ownerDocument.body.createEl("input", {
      attr: {
        type: "file",
        multiple: "true",
        ...accept ? { accept } : {}
      }
    });
    input.addClass("wk-nb-hidden-file-input");
    const cleanup = () => {
      input.remove();
      this.close();
    };
    input.addEventListener("change", () => {
      var _a;
      const files = Array.from((_a = input.files) != null ? _a : []);
      void handle(files, remove).finally(cleanup);
    }, { once: true });
    input.addEventListener("cancel", cleanup, { once: true });
    input.click();
    return true;
  }
  getCalloutIcon(type) {
    var _a;
    if (!type)
      return CALLOUT_ICONS2.note;
    return (_a = CALLOUT_ICONS2[type.toLowerCase()]) != null ? _a : CALLOUT_ICONS2.note;
  }
  onPointerDown(event) {
    var _a, _b;
    if ((_a = this.rootEl) == null ? void 0 : _a.contains(event.target))
      return;
    if ((_b = this.submenuEl) == null ? void 0 : _b.contains(event.target))
      return;
    this.close();
  }
  onKeyDown(event) {
    if (!this.rootEl)
      return;
    const consume = () => {
      event.preventDefault();
      event.stopPropagation();
    };
    if (event.key === "Escape") {
      consume();
      this.close();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      consume();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const length = Math.max(this.visibleItems.length, 1);
      this.activeIndex = (this.activeIndex + delta + length) % length;
      this.refreshActiveRows();
      this.syncFloatingSubmenuForItem(this.visibleItems[this.activeIndex]);
      return;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      const item = this.visibleItems[this.activeIndex];
      if (!item)
        return;
      consume();
      this.activateItem(item);
    }
  }
  /**
   * Places the menu below the anchor, or above it when it will not fit.
   *
   * Never between the two. The old behaviour was to slide the menu up until
   * it fit on screen, which put it straight over the line being typed — the
   * query kept filtering, but the user could not see what they were typing.
   * Flipping keeps the caret visible, and the height is capped to whichever
   * side was chosen so the list scrolls rather than overflowing back over it.
   */
  reposition() {
    var _a, _b;
    if (!this.rootEl)
      return;
    this.rootEl.setCssStyles({ maxHeight: "" });
    const rect = this.rootEl.getBoundingClientRect();
    const placement = placeMenu({
      anchorX: this.pos.x,
      anchorY: this.pos.y,
      avoidTop: (_b = (_a = this.options.avoid) == null ? void 0 : _a.top) != null ? _b : this.pos.y,
      menuWidth: rect.width,
      menuHeight: rect.height,
      viewportWidth: this.ownerWindow.innerWidth,
      viewportHeight: this.ownerWindow.innerHeight
    });
    this.rootEl.setCssStyles({
      maxHeight: `${placement.maxHeight}px`,
      left: `${placement.left}px`,
      top: `${placement.top}px`
    });
    this.positionFloatingSubmenu();
  }
  positionFloatingSubmenu() {
    if (!this.rootEl || !this.submenuEl)
      return;
    const rootRect = this.rootEl.getBoundingClientRect();
    const submenuRect = this.submenuEl.getBoundingClientRect();
    const placement = placeSubmenu({
      parentLeft: rootRect.left,
      parentRight: rootRect.right,
      parentTop: rootRect.top,
      menuWidth: submenuRect.width,
      menuHeight: submenuRect.height,
      viewportWidth: this.ownerWindow.innerWidth,
      viewportHeight: this.ownerWindow.innerHeight
    });
    this.submenuEl.setCssStyles({ left: `${placement.left}px`, top: `${placement.top}px` });
  }
};

// src/dragRange.ts
var TAB_WIDTH = 4;
function indentWidth(text) {
  let width = 0;
  for (const ch of text) {
    if (ch === " ")
      width += 1;
    else if (ch === "	")
      width += TAB_WIDTH;
    else
      break;
  }
  return width;
}
function indentString(text) {
  var _a, _b;
  return (_b = (_a = /^[ \t]*/.exec(text)) == null ? void 0 : _a[0]) != null ? _b : "";
}
function isBlank(text) {
  return text.trim() === "";
}
function isBlockStart(text) {
  return /^[ \t]*([-*+]|\d+[.)])[ \t]/.test(text) || // list item or task
  /^[ \t]*#{1,6}[ \t]/.test(text) || // heading
  /^[ \t]*>/.test(text) || // blockquote
  /^[ \t]*(```|~~~|\$\$)/.test(text);
}
function findBlockStart(doc, lineNo) {
  let start = lineNo;
  while (start > 1) {
    const current = doc.line(start);
    if (isBlockStart(current.text))
      break;
    const previous = doc.line(start - 1);
    if (isBlank(previous.text))
      break;
    if (indentWidth(current.text) <= indentWidth(previous.text))
      break;
    start--;
  }
  return start;
}
function findBlockEnd(doc, start) {
  const baseIndent = indentWidth(doc.line(start).text);
  let end = start;
  while (end < doc.lines) {
    const next = doc.line(end + 1);
    if (isBlank(next.text))
      break;
    if (indentWidth(next.text) <= baseIndent)
      break;
    end++;
  }
  return end;
}
function trimBlankEdges(doc, first, last) {
  while (first < last && isBlank(doc.line(first).text))
    first++;
  while (last > first && isBlank(doc.line(last).text))
    last--;
  return [first, last];
}
function toRange(doc, first, last, isFence) {
  return {
    from: doc.line(first).from,
    to: doc.line(last).to,
    firstLine: first,
    lastLine: last,
    indent: indentWidth(doc.line(first).text),
    isFence
  };
}
function resolveDragRange(doc, lineNo, granularity, selection) {
  var _a, _b, _c, _d;
  const spans = findFenceSpans(doc);
  if (selection) {
    for (const range of selection.ranges) {
      if (range.empty)
        continue;
      const first = doc.lineAt(range.from).number;
      const last = doc.lineAt(range.to).number;
      if (first === last)
        continue;
      if (lineNo >= first && lineNo <= last) {
        const [f, l] = trimBlankEdges(doc, first, last);
        const wideFirst = (_b = (_a = spans.get(f)) == null ? void 0 : _a.firstLine) != null ? _b : f;
        const wideLast = (_d = (_c = spans.get(l)) == null ? void 0 : _c.lastLine) != null ? _d : l;
        const span2 = spans.get(wideFirst);
        const whollyOneFence = span2 !== void 0 && span2.firstLine === wideFirst && span2.lastLine === wideLast;
        return toRange(doc, wideFirst, wideLast, whollyOneFence);
      }
    }
  }
  const span = spans.get(lineNo);
  if (span)
    return toRange(doc, span.firstLine, span.lastLine, true);
  if (granularity === "paragraph" && !isBlank(doc.line(lineNo).text)) {
    const start = findBlockStart(doc, lineNo);
    const end = findBlockEnd(doc, start);
    return toRange(doc, start, end, false);
  }
  return toRange(doc, lineNo, lineNo, false);
}
function isListItem(text) {
  return /^[ \t]*([-*+]|\d+[.)])[ \t]/.test(text);
}
function detectIndentUnit(doc, fallback = 4) {
  let smallest = Infinity;
  const limit = Math.min(doc.lines, 500);
  for (let n = 1; n <= limit; n++) {
    const width = indentWidth(doc.line(n).text);
    if (width > 0 && width < smallest)
      smallest = width;
  }
  return smallest === Infinity ? fallback : smallest;
}
function allowedIndents(doc, dropLineNo, unit) {
  let prev = null;
  for (let n = Math.min(dropLineNo - 1, doc.lines); n >= 1; n--) {
    const text = doc.line(n).text;
    if (!isBlank(text)) {
      prev = text;
      break;
    }
  }
  if (prev === null)
    return [0];
  const prevIndent = indentWidth(prev);
  if (!isListItem(prev) && prevIndent === 0)
    return [0];
  const deepest = prevIndent + (isListItem(prev) ? unit : 0);
  const levels = [];
  for (let i = 0; i <= deepest; i += unit)
    levels.push(i);
  return levels.length > 0 ? levels : [0];
}
function pickIndent(allowed, desired) {
  return allowed.reduce(
    (best, candidate) => Math.abs(candidate - desired) < Math.abs(best - desired) ? candidate : best,
    allowed[0]
  );
}
function reindentBlock(text, fromIndent, toIndent) {
  const delta = toIndent - fromIndent;
  if (delta === 0)
    return text;
  return text.split("\n").map((line) => {
    if (isBlank(line))
      return "";
    const current = indentWidth(line);
    const body = line.slice(indentString(line).length);
    return " ".repeat(Math.max(0, current + delta)) + body;
  }).join("\n");
}
var GHOST_TEXT_LIMIT = 50;
function countBlocks(doc, firstLine, lastLine) {
  const spans = findFenceSpans(doc);
  let count = 0;
  let n = firstLine;
  while (n <= lastLine) {
    if (isBlank(doc.line(n).text)) {
      n++;
      continue;
    }
    const span = spans.get(n);
    const end = span ? span.lastLine : findBlockEnd(doc, findBlockStart(doc, n));
    count++;
    n = Math.max(end, n) + 1;
  }
  return count;
}
function describeDragGhost(text, blockCount, blocksLabel) {
  if (blockCount > 1)
    return blocksLabel.replace("{n}", String(blockCount));
  const flat = text.trim();
  return flat.length > GHOST_TEXT_LIMIT ? `${flat.slice(0, GHOST_TEXT_LIMIT)}...` : flat;
}

// src/frameScheduler.ts
var FrameScheduler = class {
  constructor(win) {
    this.win = win;
    this.frame = null;
    this.pending = null;
  }
  /** Runs `task` at the next paint, replacing any task not yet run. */
  schedule(task) {
    this.pending = task;
    if (this.frame !== null)
      return;
    this.frame = this.win.requestAnimationFrame(() => {
      this.frame = null;
      const task2 = this.pending;
      this.pending = null;
      task2 == null ? void 0 : task2();
    });
  }
  /**
   * Drops any pending task and cancels the frame.
   *
   * Callers must do this on teardown: a queued callback closes over the view,
   * so letting it fire after destroy() would touch a detached editor.
   */
  cancel() {
    if (this.frame !== null) {
      this.win.cancelAnimationFrame(this.frame);
      this.frame = null;
    }
    this.pending = null;
  }
};

// src/planMove.ts
function planBlockMove(doc, source, toLineNo, targetIndent) {
  const text = reindentBlock(source.text, source.indent, targetIndent);
  if (toLineNo >= source.firstLine && toLineNo <= source.lastLine + 1)
    return [];
  const atDocEnd = source.to >= doc.length;
  const cutFrom = atDocEnd ? Math.max(0, source.from - 1) : source.from;
  const cutTo = atDocEnd ? doc.length : Math.min(source.to + 1, doc.length);
  if (toLineNo > doc.lines) {
    return [
      { from: doc.length, insert: "\n" + text },
      { from: cutFrom, to: cutTo }
    ];
  }
  const toLine = doc.line(toLineNo);
  return [
    { from: toLine.from, insert: text + "\n" },
    { from: cutFrom, to: cutTo }
  ];
}

// src/blockFold.ts
var import_view = require("@codemirror/view");
var import_state = require("@codemirror/state");

// src/foldRange.ts
function headingLevel(text) {
  const match = /^[ \t]*(#{1,6})[ \t]/.exec(text);
  return match ? match[1].length : 0;
}
function foldableRange(doc, lineNo) {
  if (lineNo < 1 || lineNo > doc.lines)
    return null;
  const line = doc.line(lineNo);
  if (isBlank(line.text))
    return null;
  const level = headingLevel(line.text);
  if (level > 0)
    return headingSection(doc, lineNo, level);
  const start = findBlockStart(doc, lineNo);
  const end = findBlockEnd(doc, start);
  return end > start ? { headLine: start, lastLine: end } : null;
}
function headingSection(doc, lineNo, level) {
  let last = lineNo;
  for (let n = lineNo + 1; n <= doc.lines; n++) {
    const next = headingLevel(doc.line(n).text);
    if (next > 0 && next <= level)
      break;
    last = n;
  }
  while (last > lineNo && isBlank(doc.line(last).text))
    last--;
  return last > lineNo ? { headLine: lineNo, lastLine: last } : null;
}

// src/blockFold.ts
var foldBlockEffect = import_state.StateEffect.define();
var unfoldBlockEffect = import_state.StateEffect.define();
var FoldEllipsisWidget = class extends import_view.WidgetType {
  toDOM(view) {
    const el = document.createElement("span");
    el.className = "ftn-fold-ellipsis";
    el.textContent = "\u2026";
    el.setAttribute("aria-label", t("fold.expand"));
    el.addEventListener("mousedown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const pos = view.posAtDOM(el);
      view.dispatch({ effects: unfoldBlockEffect.of({ from: pos }) });
    });
    return el;
  }
  // Every ellipsis is identical, so CodeMirror may reuse the DOM freely.
  eq() {
    return true;
  }
  // The widget handles its own mousedown; without this CodeMirror would
  // swallow the event before the listener above ever ran.
  ignoreEvent() {
    return false;
  }
};
var foldMark = import_view.Decoration.replace({ widget: new FoldEllipsisWidget() });
var foldField = import_state.StateField.define({
  create: () => import_view.Decoration.none,
  update(folds, tr) {
    folds = folds.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(foldBlockEffect)) {
        folds = folds.update({
          add: [foldMark.range(effect.value.from, effect.value.to)]
        });
      }
      if (effect.is(unfoldBlockEffect)) {
        const target = effect.value.from;
        folds = folds.update({ filter: (from) => from !== target });
      }
    }
    if (tr.docChanged) {
      const doomed = [];
      tr.changes.iterChangedRanges((_fromA, _toA, fromB, toB) => {
        folds.between(fromB, toB, (from) => {
          doomed.push(from);
        });
      });
      if (doomed.length > 0) {
        folds = folds.update({ filter: (from) => !doomed.includes(from) });
      }
    }
    return folds.update({ filter: (from, to) => to > from });
  },
  provide: (field) => import_view.EditorView.decorations.from(field)
});
function foldAt(folds, from) {
  let found = null;
  folds.between(from, from, (start, end) => {
    if (start === from) {
      found = { from: start, to: end };
      return false;
    }
  });
  return found;
}
function foldOffsetsAtLine(view, lineNo) {
  const range = foldableRange(view.state.doc, lineNo);
  if (!range)
    return null;
  return {
    from: view.state.doc.line(range.headLine).to,
    to: view.state.doc.line(range.lastLine).to
  };
}
function isFoldActiveAt(view, from) {
  const folds = view.state.field(foldField, false);
  return !!folds && foldAt(folds, from) !== null;
}
function foldHidingLineEnd(view, lineNo) {
  const folds = view.state.field(foldField, false);
  if (!folds)
    return null;
  const doc = view.state.doc;
  if (lineNo < 1 || lineNo > doc.lines)
    return null;
  const from = doc.line(lineNo).from;
  let last = null;
  folds.between(from, from, (foldFrom, foldTo) => {
    if (foldFrom < from && from <= foldTo) {
      last = doc.lineAt(foldTo).number;
      return false;
    }
  });
  return last;
}
function toggleFoldAtLine(view, lineNo) {
  const folds = view.state.field(foldField, false);
  if (!folds)
    return false;
  const offsets = foldOffsetsAtLine(view, lineNo);
  if (!offsets)
    return false;
  const existing = foldAt(folds, offsets.from);
  view.dispatch({
    effects: existing ? unfoldBlockEffect.of({ from: existing.from }) : foldBlockEffect.of(offsets)
  });
  return true;
}
function blockFoldExtension() {
  return [foldField];
}

// src/dragDrop.ts
var DragManager = class {
  constructor(plugin, view) {
    this.plugin = plugin;
    this.view = view;
    this.ghostEl = null;
    this.indicatorEl = null;
    this.isDragging = false;
    this.startBlock = null;
    this.currentTargetLine = null;
    /** Indent the block will adopt on drop, chosen by horizontal drag position. */
    this.currentTargetIndent = 0;
    /** Indent levels legal at the current drop point. One entry = no choice. */
    this.currentAllowedIndents = [0];
    /** Line the cached indents were computed for; null means they are stale. */
    this.indentsForLine = null;
    /**
     * Fence spans as of drag start, for keeping a drop out of the middle of
     * someone's code. Read once: the document cannot change mid-drag, and this
     * is consulted on every pointer frame.
     */
    this.fenceSpans = /* @__PURE__ */ new Map();
    /** A code block never re-indents on drop, so it is offered no choice. */
    this.draggingFence = false;
    this.indentUnit = 4;
    this.metrics = null;
    this.onViewportChange = () => {
      this.metrics = null;
    };
    /**
     * Records where the pointer is and defers the work to the next frame.
     *
     * A mouse reports movement several times per painted frame, and every extra
     * report used to repeat the full measure-and-position pass. Only the newest
     * position matters, so keeping it and running once per frame drops the work
     * to what the screen can actually show.
     */
    this.onMouseMove = (event) => {
      if (!this.isDragging)
        return;
      const x = event.clientX;
      const y = event.clientY;
      this.scheduler.schedule(() => this.processMove(x, y));
    };
    this.onMouseUp = (event) => {
      if (this.isDragging) {
        this.scheduler.cancel();
        this.processMove(event.clientX, event.clientY);
      }
      this.stopDrag();
    };
    var _a;
    this.ownerDocument = view.dom.ownerDocument;
    this.ownerWindow = (_a = this.ownerDocument.defaultView) != null ? _a : activeWindow;
    this.scheduler = new FrameScheduler(this.ownerWindow);
  }
  startDrag(lineNo, event, onDragEnd) {
    var _a;
    this.onDragEnd = onDragEnd;
    this.isDragging = true;
    this.metrics = null;
    this.indentsForLine = null;
    const doc = this.view.state.doc;
    const range = resolveDragRange(
      doc,
      lineNo,
      this.plugin.settings.dragGranularity,
      this.view.state.selection
    );
    (_a = this.ownerWindow.getSelection()) == null ? void 0 : _a.removeAllRanges();
    const fromPos = range.from;
    const toPos = range.to;
    const text = doc.sliceString(fromPos, toPos);
    this.startBlock = {
      from: fromPos,
      to: toPos,
      text,
      indent: range.indent,
      firstLine: range.firstLine,
      lastLine: range.lastLine
    };
    this.indentUnit = detectIndentUnit(doc);
    this.draggingFence = range.isFence;
    this.fenceSpans = findFenceSpans(doc);
    this.ghostEl = this.ownerDocument.body.createDiv({
      cls: "block-drag-ghost",
      text: describeDragGhost(
        text,
        countBlocks(doc, range.firstLine, range.lastLine),
        t("drag.blocks")
      )
    });
    this.updateGhostPosition(event.clientX, event.clientY);
    this.indicatorEl = this.ownerDocument.body.createDiv({
      cls: "block-drag-indicator"
    });
    this.ownerDocument.addEventListener("mousemove", this.onMouseMove);
    this.ownerDocument.addEventListener("mouseup", this.onMouseUp);
    this.view.scrollDOM.addEventListener("scroll", this.onViewportChange, { passive: true });
    this.ownerWindow.addEventListener("resize", this.onViewportChange);
    this.ownerDocument.body.addClass("is-dragging-block");
  }
  /**
   * Tears down a drag in progress without applying it.
   *
   * The mousemove and mouseup listeners live on the document, so a view torn
   * down mid-drag — closing the pane, disabling the plugin — would otherwise
   * leave them attached to a view that no longer exists.
   */
  destroy() {
    this.startBlock = null;
    this.currentTargetLine = null;
    this.stopDrag();
  }
  stopDrag() {
    var _a;
    if (!this.isDragging)
      return;
    this.scheduler.cancel();
    if (this.startBlock !== null && this.currentTargetLine !== null) {
      this.moveBlock(this.startBlock, this.currentTargetLine);
    }
    this.isDragging = false;
    this.startBlock = null;
    this.currentTargetLine = null;
    this.indentsForLine = null;
    this.metrics = null;
    this.draggingFence = false;
    this.fenceSpans = /* @__PURE__ */ new Map();
    if (this.ghostEl) {
      this.ghostEl.remove();
      this.ghostEl = null;
    }
    if (this.indicatorEl) {
      this.indicatorEl.remove();
      this.indicatorEl = null;
    }
    this.ownerDocument.removeEventListener("mousemove", this.onMouseMove);
    this.ownerDocument.removeEventListener("mouseup", this.onMouseUp);
    this.view.scrollDOM.removeEventListener("scroll", this.onViewportChange);
    this.ownerWindow.removeEventListener("resize", this.onViewportChange);
    this.ownerDocument.body.removeClass("is-dragging-block");
    (_a = this.onDragEnd) == null ? void 0 : _a.call(this);
  }
  readMetrics() {
    if (this.metrics)
      return this.metrics;
    const contentRect = this.view.contentDOM.getBoundingClientRect();
    this.metrics = {
      contentLeft: contentRect.left,
      contentWidth: this.view.contentDOM.clientWidth,
      columnPx: this.view.defaultCharacterWidth || 8
    };
    return this.metrics;
  }
  /**
   * One frame of drag feedback: measure everything, then paint everything.
   *
   * The ordering is the point. Positioning the ghost is a style write, and a
   * write invalidates layout — so the posAtCoords and coordsAtPos probes that
   * used to follow it each forced the browser to recompute layout before it
   * could answer. Taking every measurement first means at most one layout pass
   * per frame instead of one per probe.
   */
  processMove(mouseX, mouseY) {
    var _a, _b;
    if (!this.isDragging)
      return;
    const m = this.readMetrics();
    const pos = this.view.posAtCoords({ x: mouseX, y: mouseY });
    let paint = null;
    if (pos !== null) {
      try {
        const line = this.view.state.doc.lineAt(pos);
        const coords = this.view.coordsAtPos(line.from);
        const endCoords = coords ? this.view.coordsAtPos(line.to) : null;
        if (coords) {
          let top = coords.top;
          let targetLine = line.number;
          if (endCoords) {
            const lineBottom = endCoords.bottom;
            const midPoint = coords.top + (lineBottom - coords.top) / 2;
            if (mouseY > midPoint) {
              top = lineBottom;
              targetLine = line.number + 1;
            }
          }
          const hiddenUntil = foldHidingLineEnd(this.view, targetLine);
          if (hiddenUntil !== null)
            targetLine = hiddenUntil + 1;
          const fence = this.fenceSpans.get(targetLine);
          if (fence && targetLine > fence.firstLine)
            targetLine = fence.lastLine + 1;
          this.currentTargetLine = targetLine;
          if (this.indentsForLine !== targetLine) {
            this.currentAllowedIndents = allowedIndents(
              this.view.state.doc,
              targetLine,
              this.indentUnit
            );
            this.indentsForLine = targetLine;
          }
          const desired = this.draggingFence ? (_b = (_a = this.startBlock) == null ? void 0 : _a.indent) != null ? _b : 0 : Math.max(0, Math.round((mouseX - m.contentLeft) / m.columnPx));
          this.currentTargetIndent = pickIndent(this.currentAllowedIndents, desired);
          const offsetPx = this.currentTargetIndent * m.columnPx;
          paint = {
            top,
            left: coords.left + offsetPx,
            width: Math.max(40, m.contentWidth - offsetPx),
            hasChoice: !this.draggingFence && this.currentAllowedIndents.length > 1
          };
        }
      } catch (e) {
      }
    }
    this.updateGhostPosition(mouseX, mouseY);
    if (paint && this.indicatorEl) {
      this.indicatorEl.toggleClass("is-indent-selectable", paint.hasChoice);
      this.indicatorEl.setCssStyles({
        top: `${paint.top}px`,
        left: `${paint.left}px`,
        width: `${paint.width}px`,
        display: "block"
      });
    }
  }
  updateGhostPosition(x, y) {
    if (this.ghostEl) {
      this.ghostEl.setCssStyles({
        left: `${x + 10}px`,
        top: `${y + 10}px`
      });
    }
  }
  moveBlock(startBlock, toLineNo) {
    const changes = planBlockMove(
      this.view.state.doc,
      startBlock,
      toLineNo,
      this.currentTargetIndent
    );
    if (changes.length === 0)
      return;
    dispatchBlockEdit(this.view, {
      changes,
      scrollIntoView: true,
      userEvent: "move.block"
    });
  }
};

// src/handleZone.ts
var HANDLE_ROW_WIDTH = 68;
var HANDLE_LEFT_GAP = 76;
var HANDLE_RIGHT_GAP = 12;
var HANDLE_SIDE_SLACK = 160;
var OPPOSITE_SIDE_SLACK = 20;
function isInsideHandleZone(m, x, y, side) {
  if (y < 0 || y > m.viewHeight)
    return false;
  const leftSlack = side === "left" ? HANDLE_SIDE_SLACK : OPPOSITE_SIDE_SLACK;
  const rightSlack = side === "right" ? HANDLE_SIDE_SLACK : OPPOSITE_SIDE_SLACK;
  return x >= -leftSlack && x <= m.viewWidth + rightSlack;
}
function handleOffsetX(m, side) {
  if (side !== "right")
    return m.contentOffsetLeft - HANDLE_LEFT_GAP;
  const past = m.contentOffsetLeft + m.contentWidth + HANDLE_RIGHT_GAP;
  return Math.min(past, m.viewWidth - HANDLE_ROW_WIDTH - 4);
}

// src/blockHandles.ts
var blockHandlesExtension = (plugin) => import_view2.ViewPlugin.fromClass(class {
  constructor(view) {
    this.handleEl = null;
    this.addButton = null;
    this.foldButton = null;
    this.dragButton = null;
    this.hoveredLine = null;
    this.hideTimeout = null;
    this.dragManager = null;
    this.isMouseOverHandle = false;
    /**
     * Viewport-space Y span of the hovered line, including its wrapped rows.
     *
     * Most pointer moves stay inside the line they are already on. Without this
     * every one of them ran a posAtCoords probe purely to rediscover a line
     * number that had not changed. Held in viewport coordinates so it can be
     * compared against clientY directly, which means scrolling invalidates it.
     */
    this.hoveredBand = null;
    this.metrics = null;
    /** The handle is a fixed size in CSS, so this is read once and kept. */
    this.handleHeight = 0;
    /** Last value written to the "+" button, so an unchanged setting writes nothing. */
    this.plusHandleShown = null;
    /** Last fold state written to the chevron, so an unchanged state writes nothing. */
    this.foldShown = null;
    /**
     * Bumped on every document change, as a cache key for anything derived
     * from the document. Cheaper than remembering the doc itself, and enough:
     * a walk's answer can only go stale when the text under it moves.
     */
    this.docGeneration = 0;
    /**
     * What a fold on the hovered line would cover, and what that was measured
     * against.
     *
     * WHY IT IS WORTH CACHING
     * foldOffsetsAtLine walks the document — for a heading, forward to the
     * next heading at the same depth or shallower, which under a lone `# H1`
     * is every remaining line of the note. updatePosition needs the answer on
     * every reposition, and in always-visible mode that is once per keystroke.
     * The answer depends only on the line and the text, so a fold being opened
     * or closed does not invalidate it — only which fold is *active* changes,
     * and that is a range lookup rather than a walk.
     */
    this.foldOffsetsCache = null;
    /** Last side written to the wrapper, so an unchanged setting writes nothing. */
    this.sideShown = null;
    /**
     * Last observed value of `handleAlwaysVisible`, so `update()` can detect
     * the true -> false transition and hide a handle that has nothing left
     * pinning it on screen.
     */
    this.alwaysVisibleShown = null;
    this.onScroll = () => this.invalidateMetrics();
    this.onResize = () => this.invalidateMetrics();
    /**
     * Pointer tracking, bound to the scroller rather than the content.
     *
     * WHY NOT ViewPlugin's eventHandlers
     * CodeMirror attaches a plugin's eventHandlers to `view.contentDOM`
     * (ensureHandlers, @codemirror/view). The gutter the handle sits in is
     * outside that element, so the moment the pointer crossed out of the text
     * toward the handle, contentDOM fired `mouseleave` and then went silent:
     * no further mousemove arrived while the pointer was in the gutter.
     *
     * That made the hover zone decorative. isInsideHandleZone could only ever
     * be asked about points inside the content, which are inside the zone by
     * construction, so widening it changed nothing — the handle still started
     * hiding as soon as you reached for it, and only the handle's own
     * mouseenter could call it back. The scroller contains the content, the
     * gutter and the handle, so binding here is what lets the zone do its job.
     */
    this.onPointerMove = (event) => this.handleMouseMove(this.view, event);
    this.onPointerLeave = () => this.handleMouseLeave();
    var _a;
    this.view = view;
    this.ownerWindow = (_a = view.dom.ownerDocument.defaultView) != null ? _a : activeWindow;
    this.scheduler = new FrameScheduler(this.ownerWindow);
    this.scrollEl = view.scrollDOM;
    this.createHandle(view);
    this.alwaysVisibleShown = plugin.settings.handleAlwaysVisible;
    if (plugin.settings.handleAlwaysVisible) {
      this.followCaret(view);
    }
    view.scrollDOM.addEventListener("scroll", this.onScroll, { passive: true });
    this.ownerWindow.addEventListener("resize", this.onResize);
    view.scrollDOM.addEventListener("mousemove", this.onPointerMove, { passive: true });
    view.scrollDOM.addEventListener("mouseleave", this.onPointerLeave);
  }
  createHandle(view) {
    this.handleEl = view.scrollDOM.createDiv();
    this.handleEl.className = "block-handle-wrap is-hidden";
    this.addButton = this.handleEl.createDiv({
      cls: "block-handle-button add-button",
      attr: { "aria-label": t("handles.addBlock") }
    });
    (0, import_obsidian6.setIcon)(this.addButton, "plus");
    this.foldButton = this.handleEl.createDiv({
      cls: "block-handle-button fold-button",
      attr: { "aria-label": t("handles.fold") }
    });
    (0, import_obsidian6.setIcon)(this.foldButton, "chevron-down");
    this.foldButton.onclick = (e) => {
      if (this.hoveredLine === null)
        return;
      e.stopPropagation();
      if (this.hideTimeout) {
        this.ownerWindow.clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      toggleFoldAtLine(view, this.hoveredLine);
    };
    this.dragButton = this.handleEl.createDiv({
      cls: "block-handle-button drag-button",
      attr: { "aria-label": t("handles.dragReorder") }
    });
    (0, import_obsidian6.setIcon)(this.dragButton, "grip-vertical");
    this.handleEl.addEventListener("mouseenter", () => {
      this.isMouseOverHandle = true;
      if (this.hideTimeout) {
        this.ownerWindow.clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
    });
    this.handleEl.addEventListener("mouseleave", () => {
      this.isMouseOverHandle = false;
      this.handleMouseLeave();
    });
    let dragTimeout = null;
    let isDragging = false;
    this.dragButton.onmousedown = (e) => {
      if (this.hoveredLine === null)
        return;
      if (this.hideTimeout) {
        this.ownerWindow.clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      e.preventDefault();
      e.stopPropagation();
      isDragging = false;
      dragTimeout = this.ownerWindow.setTimeout(() => {
        isDragging = true;
        if (!this.dragManager) {
          this.dragManager = new DragManager(plugin, view);
        }
        this.dragManager.startDrag(this.hoveredLine, e, () => {
          this.hoveredLine = null;
          this.hoveredBand = null;
          this.isMouseOverHandle = false;
        });
      }, 150);
    };
    this.dragButton.onmouseup = (_e) => {
      if (dragTimeout !== null)
        this.ownerWindow.clearTimeout(dragTimeout);
      if (!isDragging && this.hoveredLine !== null) {
        const rect = this.dragButton.getBoundingClientRect();
        closeNotionBlockInsertMenus();
        showNotionBlockActionMenu(
          plugin,
          view,
          this.hoveredLine,
          { x: rect.left, y: rect.bottom },
          { avoid: { top: rect.top, bottom: rect.bottom } }
        );
      }
    };
    this.dragButton.onclick = (e) => e.stopPropagation();
    this.dragButton.oncontextmenu = (e) => {
      const menu = new import_obsidian6.Menu();
      menu.addItem((item) => {
        item.setTitle(plugin.settings.dragGranularity === "line" ? t("handles.switchToParagraph") : t("handles.switchToLine")).setIcon("layers").onClick(async () => {
          plugin.settings.dragGranularity = plugin.settings.dragGranularity === "line" ? "paragraph" : "line";
          await plugin.saveSettings();
        });
      });
      menu.showAtMouseEvent(e);
      e.preventDefault();
    };
    this.addButton.onclick = (e) => {
      if (this.hoveredLine === null)
        return;
      if (this.hideTimeout) {
        this.ownerWindow.clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      e.stopPropagation();
      const rect = this.addButton.getBoundingClientRect();
      const pos = { x: rect.left, y: rect.bottom };
      closeNotionBlockActionMenus();
      showNotionBlockInsertMenu(plugin, view, this.hoveredLine, pos, {
        avoid: { top: rect.top, bottom: rect.bottom }
      });
    };
  }
  /** Drops cached geometry so the next read takes it afresh. */
  invalidateMetrics() {
    this.metrics = null;
    this.hoveredBand = null;
  }
  /**
   * Cached editor geometry, measured only when the cache is cold.
   *
   * Every read is taken in one uninterrupted run. Interleaving a style write
   * would force a separate layout pass for each read that followed it.
   */
  readMetrics(view) {
    if (this.metrics)
      return this.metrics;
    const viewRect = view.dom.getBoundingClientRect();
    const contentRect = view.contentDOM.getBoundingClientRect();
    const scrollerRect = view.scrollDOM.getBoundingClientRect();
    this.metrics = {
      viewTop: viewRect.top,
      viewLeft: viewRect.left,
      viewWidth: viewRect.width,
      viewHeight: viewRect.height,
      contentLeft: contentRect.left,
      contentWidth: contentRect.width,
      contentOffsetLeft: view.contentDOM.offsetLeft,
      scrollerTop: scrollerRect.top,
      scrollTop: view.scrollDOM.scrollTop
    };
    return this.metrics;
  }
  update(update) {
    if (update.docChanged)
      this.docGeneration++;
    const movedUnderUs = update.docChanged || update.viewportChanged || update.geometryChanged;
    if (movedUnderUs)
      this.invalidateMetrics();
    if (this.alwaysVisibleShown && !plugin.settings.handleAlwaysVisible) {
      this.hideHandle();
    }
    this.alwaysVisibleShown = plugin.settings.handleAlwaysVisible;
    const followsCaret = plugin.settings.handleAlwaysVisible && (update.selectionSet || update.docChanged || this.hoveredLine === null);
    const foldToggled = update.transactions.some(
      (tr) => tr.effects.some((e) => e.is(foldBlockEffect) || e.is(unfoldBlockEffect))
    );
    if (followsCaret) {
      this.followCaret(update.view);
      return;
    }
    if ((movedUnderUs || foldToggled) && this.hoveredLine !== null) {
      this.updatePosition(update.view);
    }
  }
  /**
   * What a fold on `lineNo` would cover, recomputed only when it can differ.
   *
   * See foldOffsetsCache: this stands in front of a document walk that
   * updatePosition would otherwise run on every reposition.
   */
  foldOffsetsFor(view, lineNo) {
    const cached = this.foldOffsetsCache;
    if (cached && cached.line === lineNo && cached.generation === this.docGeneration) {
      return cached.offsets;
    }
    const offsets = foldOffsetsAtLine(view, lineNo);
    this.foldOffsetsCache = { line: lineNo, generation: this.docGeneration, offsets };
    return offsets;
  }
  /**
   * Repositions the handle over the hovered line.
   *
   * Returns whether it actually wrote a transform. Callers that unhide the
   * handle before repositioning it (followCaret) need to know: unhiding
   * unconditionally would leave a positionless handle parked at the
   * wrapper's default top:0/left:0 whenever coordsAtPos can't yet resolve
   * the line, which happens if this fires before the view's first layout.
   */
  updatePosition(view) {
    var _a, _b;
    if (this.hoveredLine === null || !this.handleEl)
      return false;
    try {
      const line = view.state.doc.line(this.hoveredLine);
      const coords = view.coordsAtPos(line.from);
      if (!coords)
        return false;
      const endCoords = view.coordsAtPos(line.to);
      const m = this.readMetrics(view);
      if (this.handleHeight === 0) {
        this.handleHeight = this.handleEl.offsetHeight || 24;
      }
      let top = coords.top - m.scrollerTop + m.scrollTop;
      const lineHeight = coords.bottom - coords.top;
      top += (lineHeight - this.handleHeight) / 2;
      const left = handleOffsetX(m, plugin.settings.handleSide);
      this.hoveredBand = { top: coords.top, bottom: (endCoords != null ? endCoords : coords).bottom };
      if (this.plusHandleShown !== plugin.settings.plusHandle) {
        this.plusHandleShown = plugin.settings.plusHandle;
        (_a = this.addButton) == null ? void 0 : _a.toggle(plugin.settings.plusHandle);
      }
      if (this.sideShown !== plugin.settings.handleSide) {
        this.sideShown = plugin.settings.handleSide;
        this.handleEl.classList.toggle("is-right", this.sideShown === "right");
      }
      const foldOffsets = plugin.settings.foldHandle ? this.foldOffsetsFor(view, this.hoveredLine) : null;
      const foldState = !foldOffsets ? "none" : isFoldActiveAt(view, foldOffsets.from) ? "folded" : "unfolded";
      if (this.foldShown !== foldState) {
        this.foldShown = foldState;
        (_b = this.foldButton) == null ? void 0 : _b.toggle(foldState !== "none");
        if (this.foldButton && foldState !== "none") {
          (0, import_obsidian6.setIcon)(this.foldButton, foldState === "folded" ? "chevron-right" : "chevron-down");
          this.foldButton.setAttribute(
            "aria-label",
            foldState === "folded" ? t("handles.unfold") : t("handles.fold")
          );
        }
      }
      this.handleEl.setCssStyles({ transform: `translate3d(${left}px, ${Math.round(top)}px, 0)` });
      return true;
    } catch (e) {
      this.hideHandle();
      return false;
    }
  }
  /**
   * Queues a pointer move for the next frame.
   *
   * Only the coordinates and the hit-test result are kept, not the event: the
   * hit test walks the DOM tree rather than measuring it, so it is cheap to do
   * now and would be wrong to defer — by the next frame the pointer may have
   * left the element the event was actually about.
   */
  handleMouseMove(view, event) {
    const clientX = event.clientX;
    const clientY = event.clientY;
    const overHandle = !!event.target.closest(".block-handle-wrap");
    this.scheduler.schedule(() => this.processMouseMove(view, clientX, clientY, overHandle));
  }
  processMouseMove(view, clientX, clientY, overHandle) {
    if (!this.handleEl)
      return;
    const m = this.readMetrics(view);
    const x = clientX - m.viewLeft;
    const y = clientY - m.viewTop;
    if (!isInsideHandleZone(m, x, y, plugin.settings.handleSide)) {
      this.handleMouseLeave();
      return;
    }
    if (overHandle) {
      if (this.hideTimeout) {
        this.ownerWindow.clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      if (this.handleEl.classList.contains("is-hidden")) {
        if (this.hoveredLine === null) {
          const pos2 = view.posAtCoords({ x: m.contentLeft + 5, y: clientY });
          if (pos2 !== null) {
            try {
              this.hoveredLine = view.state.doc.lineAt(pos2).number;
            } catch (e) {
            }
          }
        }
        if (this.updatePosition(view)) {
          this.handleEl.classList.remove("is-hidden");
        }
      }
      return;
    }
    const isHidden = this.handleEl.classList.contains("is-hidden");
    if (!isHidden && this.hoveredLine !== null && this.hoveredBand !== null && clientY >= this.hoveredBand.top && clientY < this.hoveredBand.bottom) {
      if (this.hideTimeout) {
        this.ownerWindow.clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
      return;
    }
    const pos = view.posAtCoords({ x: m.contentLeft + 5, y: clientY });
    if (pos === null)
      return;
    try {
      const line = view.state.doc.lineAt(pos);
      if (this.hoveredLine !== line.number || isHidden) {
        this.hoveredLine = line.number;
        if (this.updatePosition(view)) {
          this.handleEl.classList.remove("is-hidden");
        }
      }
      if (this.hideTimeout) {
        this.ownerWindow.clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
    } catch (e) {
    }
  }
  handleMouseLeave() {
    if (plugin.settings.handleAlwaysVisible)
      return;
    this.scheduler.cancel();
    if (this.hideTimeout)
      this.ownerWindow.clearTimeout(this.hideTimeout);
    this.hideTimeout = this.ownerWindow.setTimeout(() => {
      var _a, _b;
      if (this.isMouseOverHandle || ((_a = this.handleEl) == null ? void 0 : _a.matches(":hover"))) {
        return;
      }
      this.hoveredLine = null;
      this.hoveredBand = null;
      (_b = this.handleEl) == null ? void 0 : _b.classList.add("is-hidden");
    }, plugin.settings.hideDelay);
  }
  /**
   * Parks the handle on the caret's block.
   *
   * Only used in always-visible mode. Hover still moves the handle there,
   * so this is what puts it somewhere sensible when the pointer is nowhere
   * near the editor: on the block being edited.
   */
  followCaret(view) {
    if (!this.handleEl)
      return;
    try {
      const line = view.state.doc.lineAt(view.state.selection.main.head);
      this.hoveredLine = line.number;
      if (this.updatePosition(view)) {
        this.handleEl.classList.remove("is-hidden");
      }
    } catch (e) {
    }
  }
  hideHandle() {
    this.hoveredLine = null;
    this.hoveredBand = null;
    if (this.handleEl) {
      this.handleEl.classList.add("is-hidden");
    }
    if (this.hideTimeout) {
      this.ownerWindow.clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
  destroy() {
    var _a;
    closeNotionBlockActionMenus();
    closeNotionBlockInsertMenus();
    this.scheduler.cancel();
    if (this.hideTimeout) {
      this.ownerWindow.clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    this.scrollEl.removeEventListener("scroll", this.onScroll);
    this.scrollEl.removeEventListener("mousemove", this.onPointerMove);
    this.scrollEl.removeEventListener("mouseleave", this.onPointerLeave);
    this.ownerWindow.removeEventListener("resize", this.onResize);
    (_a = this.dragManager) == null ? void 0 : _a.destroy();
    this.dragManager = null;
    if (this.handleEl) {
      this.handleEl.remove();
    }
  }
});

// src/hideSyntax.ts
var import_view3 = require("@codemirror/view");
var import_state2 = require("@codemirror/state");

// src/markerRanges.ts
var PAIRED = ["***", "___", "**", "__", "==", "~~", "*", "_"];
var FENCE3 = /^\s*(```|~~~|\$\$)/;
var URL_END = /[\s)\]>]/;
function linkLength(text, i) {
  const wiki = text.startsWith("![[", i) ? 3 : text.startsWith("[[", i) ? 2 : 0;
  if (wiki > 0) {
    const close = text.indexOf("]]", i + wiki);
    return close === -1 ? 0 : close + 2 - i;
  }
  const bracketAt = text.startsWith("![", i) ? i + 1 : text[i] === "[" ? i : -1;
  if (bracketAt !== -1) {
    let depth = 0;
    let j = bracketAt;
    for (; j < text.length; j++) {
      if (text[j] === "\\") {
        j++;
        continue;
      }
      if (text[j] === "[")
        depth++;
      else if (text[j] === "]" && --depth === 0)
        break;
    }
    if (depth !== 0 || text[j + 1] !== "(")
      return 0;
    let open = 0;
    let k = j + 1;
    for (; k < text.length; k++) {
      if (text[k] === "\\") {
        k++;
        continue;
      }
      if (text[k] === "(")
        open++;
      else if (text[k] === ")" && --open === 0)
        break;
    }
    return open === 0 ? k + 1 - i : 0;
  }
  if (text[i] === "<") {
    const close = text.indexOf(">", i + 1);
    if (close === -1)
      return 0;
    return /^<[a-z][a-z0-9+.-]*:/i.test(text.slice(i, close + 1)) ? close + 1 - i : 0;
  }
  if (text.startsWith("http://", i) || text.startsWith("https://", i)) {
    let end = i;
    while (end < text.length && !URL_END.test(text[end]))
      end++;
    return end - i;
  }
  return 0;
}
function findMarkerRanges(lineText, lineFrom = 0) {
  if (FENCE3.test(lineText))
    return [];
  const ranges = [];
  const heading = /^(#{1,6})(\s)/.exec(lineText);
  if (heading) {
    ranges.push({ from: lineFrom, to: lineFrom + heading[1].length + heading[2].length });
  }
  const start = heading ? heading[0].length : 0;
  const openers = /* @__PURE__ */ new Map();
  let i = start;
  while (i < lineText.length) {
    if (lineText[i] === "\\") {
      i += 2;
      continue;
    }
    if (lineText[i] === "`") {
      const close = lineText.indexOf("`", i + 1);
      if (close === -1) {
        i++;
        continue;
      }
      if (close > i + 1) {
        ranges.push({ from: lineFrom + i, to: lineFrom + i + 1 });
        ranges.push({ from: lineFrom + close, to: lineFrom + close + 1 });
      }
      i = close + 1;
      continue;
    }
    const link = linkLength(lineText, i);
    if (link > 0) {
      i += link;
      continue;
    }
    const token = PAIRED.find((t2) => lineText.startsWith(t2, i));
    if (!token) {
      i++;
      continue;
    }
    const openAt = openers.get(token);
    if (openAt === void 0) {
      openers.set(token, i);
    } else {
      if (i > openAt + token.length) {
        ranges.push({ from: lineFrom + openAt, to: lineFrom + openAt + token.length });
        ranges.push({ from: lineFrom + i, to: lineFrom + i + token.length });
      }
      openers.delete(token);
    }
    i += token.length;
  }
  return ranges.sort((a, b) => a.from - b.from);
}

// src/hideSyntax.ts
var hiddenMarker = import_view3.Decoration.replace({});
function buildDecorations(view) {
  const builder = new import_state2.RangeSetBuilder();
  const fencedLines = findFencedLines(view.state.doc);
  for (const { from, to } of view.visibleRanges) {
    let pos = from;
    while (pos <= to) {
      const line = view.state.doc.lineAt(pos);
      if (!fencedLines.has(line.number)) {
        for (const range of findMarkerRanges(line.text, line.from)) {
          builder.add(range.from, range.to, hiddenMarker);
        }
      }
      if (line.to + 1 > to)
        break;
      pos = line.to + 1;
    }
  }
  return builder.finish();
}
function hideSyntaxExtension(plugin) {
  const plugins = [
    import_view3.ViewPlugin.fromClass(
      class {
        constructor(view) {
          this.decorations = plugin.settings.hideSyntaxMarkers ? buildDecorations(view) : import_view3.Decoration.none;
        }
        update(update) {
          if (!plugin.settings.hideSyntaxMarkers) {
            this.decorations = import_view3.Decoration.none;
            return;
          }
          if (update.docChanged || update.viewportChanged || update.selectionSet) {
            this.decorations = buildDecorations(update.view);
          }
        }
      },
      { decorations: (value) => value.decorations }
    ),
    // Same ranges again, as atomic. Kept as a separate facet provider
    // rather than derived from the plugin above so that if the decoration
    // plugin is ever rebuilt mid-update, the caret cannot briefly land
    // inside a hidden marker.
    import_view3.EditorView.atomicRanges.of(
      (view) => plugin.settings.hideSyntaxMarkers ? buildDecorations(view) : import_view3.Decoration.none
    )
  ];
  return plugins;
}

// src/blockSelection.ts
var import_view4 = require("@codemirror/view");
var import_state3 = require("@codemirror/state");
var blockSelected = import_view4.Decoration.line({ class: "ftn-block-selected" });
function selectedLines(doc, ranges) {
  const lines = /* @__PURE__ */ new Set();
  for (const range of ranges) {
    if (range.empty)
      continue;
    const first = doc.lineAt(range.from).number;
    const last = doc.lineAt(range.to).number;
    if (first === last)
      continue;
    for (let n = first; n <= last; n++)
      lines.add(n);
  }
  return [...lines].sort((a, b) => a - b);
}
function snapRangeToBlocks(doc, range) {
  if (range.empty)
    return range;
  const first = doc.lineAt(range.from);
  const last = doc.lineAt(range.to);
  if (first.number === last.number)
    return range;
  return range.anchor <= range.head ? import_state3.EditorSelection.range(first.from, last.to) : import_state3.EditorSelection.range(last.to, first.from);
}
function buildDecorations2(view) {
  const builder = new import_state3.RangeSetBuilder();
  const doc = view.state.doc;
  for (const n of selectedLines(doc, view.state.selection.ranges)) {
    const line = doc.line(n);
    builder.add(line.from, line.from, blockSelected);
  }
  return builder.finish();
}
function blockSelectionExtension(plugin) {
  return [
    import_view4.ViewPlugin.fromClass(
      class {
        constructor(view) {
          this.decorations = buildDecorations2(view);
        }
        update(update) {
          if (update.docChanged || update.viewportChanged || update.selectionSet) {
            this.decorations = buildDecorations2(update.view);
          }
          const active = this.decorations.size > 0;
          update.view.dom.classList.toggle("ftn-has-block-selection", active);
        }
      },
      { decorations: (value) => value.decorations }
    ),
    import_view4.EditorView.domEventHandlers({
      mousedown(event, view) {
        if (event.button !== 0)
          return false;
        view.dom.dataset.ftnDragging = "1";
        return false;
      },
      mouseup(_event, view) {
        const wasDragging = view.dom.dataset.ftnDragging === "1";
        delete view.dom.dataset.ftnDragging;
        if (!wasDragging || !plugin.settings.snapSelectionToBlocks)
          return false;
        const doc = view.state.doc;
        const snapped = view.state.selection.ranges.map((r) => snapRangeToBlocks(doc, r));
        const changed = snapped.some(
          (r, i) => r.from !== view.state.selection.ranges[i].from || r.to !== view.state.selection.ranges[i].to
        );
        if (!changed)
          return false;
        view.dispatch({
          selection: import_state3.EditorSelection.create(snapped, view.state.selection.mainIndex),
          // Selection-only, so it must not create an undo entry.
          scrollIntoView: false
        });
        return false;
      }
    })
  ];
}

// src/blockKeymap.ts
var import_state4 = require("@codemirror/state");
var import_view5 = require("@codemirror/view");

// src/blockCommands.ts
var MARKER2 = /^(#{1,6} |[-*+] \[[ xX]\] |[-*+] |\d+[.)] |> ?)/;
function blockMarker(textAfterIndent) {
  var _a, _b;
  return (_b = (_a = MARKER2.exec(textAfterIndent)) == null ? void 0 : _a[1]) != null ? _b : "";
}
function planSelectAll(doc, range) {
  const whole = { from: 0, to: doc.length };
  if (range.from === 0 && range.to === doc.length)
    return null;
  const block = blockAround(doc, doc.lineAt(range.head).number);
  if (!block || block.to <= block.from)
    return whole;
  if (range.empty)
    return block;
  const insideBlock = range.from >= block.from && range.to <= block.to;
  const isWholeBlock = range.from === block.from && range.to === block.to;
  if (insideBlock && !isWholeBlock)
    return block;
  return whole;
}
function blockAround(doc, lineNo) {
  const fence = findCodeFence(doc, lineNo);
  if (fence) {
    return codeFenceContent(doc, lineNo);
  }
  const block = resolveDragRange(doc, lineNo, "paragraph");
  return { from: block.from, to: block.to };
}
function planBackspace(doc, pos, unit) {
  const line = doc.lineAt(pos);
  const indent = indentString(line.text);
  const indentEnd = line.from + indent.length;
  const marker = blockMarker(line.text.slice(indent.length));
  const contentStart = indentEnd + marker.length;
  if (pos > contentStart)
    return null;
  if (isInsideCodeFence(doc, line.number))
    return null;
  if (indent.length > 0) {
    const trailingSpaces = indent.length - indent.replace(/ +$/, "").length;
    const removed = indent.endsWith("	") ? 1 : Math.min(unit, trailingSpaces);
    if (removed <= 0)
      return null;
    return {
      changes: [{ from: indentEnd - removed, to: indentEnd }],
      anchor: Math.max(line.from, pos - removed)
    };
  }
  if (marker.length > 0) {
    return { changes: [{ from: line.from, to: contentStart }], anchor: line.from };
  }
  if (pos !== line.from)
    return null;
  if (line.number === 1)
    return null;
  let prev = line.number - 1;
  while (prev >= 1 && isBlank(doc.line(prev).text))
    prev--;
  if (prev < 1)
    return null;
  if (prev === line.number - 1)
    return null;
  const target = doc.line(prev).to;
  return { changes: [{ from: target, to: line.from }], anchor: target };
}

// src/blockKeymap.ts
var blockKeymapExtension = (plugin) => import_state4.Prec.highest(
  import_view5.keymap.of([
    {
      key: "Mod-a",
      run: (view) => {
        if (!isEnabled(plugin))
          return false;
        const { state } = view;
        if (state.selection.ranges.length !== 1)
          return false;
        const plan = planSelectAll(state.doc, state.selection.main);
        if (!plan)
          return false;
        view.dispatch({
          selection: import_state4.EditorSelection.single(plan.from, plan.to),
          userEvent: "select.block"
        });
        return true;
      }
    },
    {
      key: "Backspace",
      run: (view) => {
        if (!isEnabled(plugin))
          return false;
        const { state } = view;
        if (state.selection.ranges.length !== 1)
          return false;
        const range = state.selection.main;
        if (!range.empty)
          return false;
        const plan = planBackspace(state.doc, range.head, detectIndentUnit(state.doc));
        if (!plan)
          return false;
        view.dispatch({
          changes: plan.changes,
          selection: import_state4.EditorSelection.cursor(plan.anchor),
          scrollIntoView: true,
          userEvent: "delete.backward"
        });
        return true;
      }
    }
  ])
);
function isEnabled(plugin) {
  return plugin.settings.enabled && plugin.settings.blockKeys;
}

// src/slashMenu.ts
var import_view6 = require("@codemirror/view");
var slashMenuExtension = (plugin) => import_view6.ViewPlugin.fromClass(
  class {
    constructor(view) {
      this.menu = null;
      this.triggerPos = null;
      this.pendingOpen = null;
      var _a;
      this.ownerWindow = (_a = view.dom.ownerDocument.defaultView) != null ? _a : activeWindow;
    }
    update(update) {
      if (this.menu) {
        this.syncOrClose(update);
        return;
      }
      if (!update.docChanged)
        return;
      if (!plugin.settings.enabled || !plugin.settings.slashMenu)
        return;
      const trigger = normaliseTrigger(plugin.settings.slashTrigger);
      if (!trigger)
        return;
      if (!update.transactions.some((tr) => tr.isUserEvent("input.type")))
        return;
      const { state } = update;
      if (state.selection.ranges.length !== 1 || !state.selection.main.empty)
        return;
      const head = state.selection.main.head;
      const line = state.doc.lineAt(head);
      const col = head - line.from;
      if (col < trigger.length)
        return;
      if (line.text.slice(col - trigger.length, col) !== trigger)
        return;
      const before = line.text.slice(0, col - trigger.length);
      if (!isSlashTriggerPosition(before, plugin.settings.slashInline))
        return;
      if (isInsideCodeFence(state.doc, line.number))
        return;
      this.scheduleOpen(update.view, head - trigger.length);
    }
    /**
     * Opens on the next tick rather than inside the update.
     *
     * Positioning the menu needs coordsAtPos, and CodeMirror forbids
     * reading layout while an update is in flight — it throws rather
     * than returning a stale measurement.
     */
    scheduleOpen(view, triggerPos) {
      this.triggerPos = triggerPos;
      this.pendingOpen = this.ownerWindow.setTimeout(() => {
        this.pendingOpen = null;
        if (this.triggerPos !== triggerPos || this.menu)
          return;
        const coords = view.coordsAtPos(triggerPos);
        if (!coords) {
          this.triggerPos = null;
          return;
        }
        closeNotionBlockActionMenus();
        const line = view.state.doc.lineAt(triggerPos);
        this.menu = showNotionBlockInsertMenu(
          plugin,
          view,
          line.number,
          { x: coords.left, y: coords.bottom + 6 },
          {
            avoid: { top: coords.top, bottom: coords.bottom },
            replaceFrom: triggerPos,
            keepEditorFocus: true,
            onClose: () => {
              this.menu = null;
              this.triggerPos = null;
            }
          }
        );
      }, 0);
    }
    syncOrClose(update) {
      var _a;
      if (!update.docChanged && !update.selectionSet)
        return;
      const menu = this.menu;
      const triggerPos = this.triggerPos;
      if (!menu || triggerPos === null)
        return;
      const { state } = update;
      if (triggerPos >= state.doc.length + 1) {
        menu.close();
        return;
      }
      const line = state.doc.lineAt(triggerPos);
      const head = state.selection.main.head;
      if (head < line.from || head > line.to) {
        menu.close();
        return;
      }
      const trigger = (_a = normaliseTrigger(plugin.settings.slashTrigger)) != null ? _a : "/";
      const query = readSlashQuery(
        line.text,
        triggerPos - line.from,
        head - line.from,
        trigger
      );
      if (query === null) {
        menu.close();
        return;
      }
      if (!menu.setQuery(query))
        menu.close();
    }
    destroy() {
      var _a;
      if (this.pendingOpen !== null)
        this.ownerWindow.clearTimeout(this.pendingOpen);
      (_a = this.menu) == null ? void 0 : _a.close();
    }
  }
);

// src/main.ts
var NotionBlock = class extends import_obsidian7.Plugin {
  async onload() {
    await this.loadSettings();
    this.registerEditorExtension([
      blockHandlesExtension(this),
      hideSyntaxExtension(this),
      blockSelectionExtension(this),
      blockKeymapExtension(this),
      slashMenuExtension(this),
      blockFoldExtension()
    ]);
    this.addCommand({
      id: "open-insert-menu",
      name: t("command.openInsertMenu"),
      editorCallback: (editor) => this.openInsertMenuAtCursor(editor)
    });
    this.addSettingTab(new BlockPluginSettingTab(this.app, this));
  }
  onunload() {
  }
  openInsertMenuAtCursor(editor) {
    const view = editor.cm;
    if (!view)
      return;
    const head = view.state.selection.main.head;
    const coords = view.coordsAtPos(head);
    if (!coords)
      return;
    showNotionBlockInsertMenu(
      this,
      view,
      view.state.doc.lineAt(head).number,
      { x: coords.left, y: coords.bottom + 6 },
      { avoid: { top: coords.top, bottom: coords.bottom }, keepEditorFocus: true }
    );
  }
  async loadSettings() {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.app.workspace.updateOptions();
  }
};

/* nosourcemap */