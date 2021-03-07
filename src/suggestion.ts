import * as vscode from 'vscode';

import { Patterns } from './patterns';
import { Settings } from './settings';
import { Helpers } from './helpers';
//
// Sorting functions
//
// Tasks are sorted by one of the fields: priority, context, project or tag. In
// the special case of a tag, they can also be sorted by the value of the tag.
// (This is currently only exposed for the due: tag to sort by due date). The
// getLineObjects routine extracts the appropriate value of the field for each
// line and then sorting is performed on that field, defaulting to the line
// number if the field is absent. This preserves the existing line order for
// lines without the tag which is what you would expect (the sort is stable).
//
export namespace Suggestion {

    export function nextRevisionToDo() {
        let [startLine, endLine] = [0, Helpers.getLastTodoLineInDocument(vscode.window.activeTextEditor.document)];
        const editor = vscode.window.activeTextEditor;

        var tasks = new Array(endLine - startLine -1);
        for (var i = startLine; i <= endLine; i++) {
            let text = editor.document.lineAt(i).text;
            if(!text.match("\W*-[\s*\w*(),]*")){
                console.info(`Skipping ${text}`);
                continue;
            }
            console.info(`Parsing task ${text}`)
            var doneDatesString = text.match("DD:([\\d,]*)");
            if (doneDatesString) {
                var doneDates = doneDatesString[1].split(",");
                var sorted = doneDates.sort();
                const doneDate = sorted[sorted.length - 1];
                let task = {
                    index: i,
                    line : text,
                    doneDate: doneDate
                }
                console.info(`Task built ${task}`);
                tasks.push(task);
            }else{
                let task = {
                    index: i,
                    line : text,
                    doneDate: null
                }
                console.info(`Task built ${task}`);
                tasks.push(task);
            }
        }

        tasks.sort(function(objectA, objectB) {
            let a = objectA.doneDate;
            let b = objectB.doneDate;
            if(a === b){
                return 0;
            }else if(a === null && b !== null){
                return -1;
            }else if(b === null && a !== null){
                return 1;
            }else{
                a < b ? -1 : 1;
            }
        });
        console.info(`Sorted tasks %o`, tasks);

        for(var i = 0; i < 5; i++){
            const nextTask = tasks[0];
            console.log(nextTask);
            vscode.window.showInformationMessage(`Next Task [${nextTask.index + 1}] ${nextTask.line}`);
            editor.selection = new vscode.Selection(new vscode.Position(nextTask.index, 0), 
            new vscode.Position(nextTask.index, 0));
        }
    }

}
