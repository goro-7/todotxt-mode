import { settings } from 'cluster';
import { Console } from 'console';
import { mainModule } from 'process';
import * as vscode from 'vscode';

import { Helpers } from './helpers';
import { Settings } from './settings';
//
// Logic to add donedate after a task
//
const TaskCompletionRegEx = /^(\s*)(x )?(\([A-Z]\) )?(\d{4}-\d{2}-\d{2} )?(\d{4}-\d{2}-\d{2} )?(.*)$/;

export namespace TaskDone {

    export function addDoneDate() {
        const editor = vscode.window.activeTextEditor;
        let [startLine, endLine] = Helpers.getSelectedLineRange(false);
        for (var i = startLine; i <= endLine; i++) {
            let text = editor.document.lineAt(i).text;
            var lead, completed, priority, completionDate, creationDate, task, _t, newTask;
            [_t, lead, completed, priority, completionDate, creationDate, task] = text.match(TaskCompletionRegEx);
            // regex with one date will match the completionDate first regardless so need to fix that here
            if (!completed && completionDate && !creationDate) {
                creationDate = completionDate;
                completionDate = undefined;
            }
            // toggle to completed by adding in the completed flag and date fields
            var dateObj = new Date();
            var month = dateObj.getUTCMonth() + 1; //months from 1-12
            var monthString = month < 10 ? "0" + month : month;
            var day = dateObj.getUTCDate();
            var dayString = day < 10 ? "0" + day : day;
            let today = monthString.toString() + dayString.toString();
            let prefix = task.match('DD:') ? ',' : ' DD:';
            newTask = lead + task + prefix + today;
            // replace the old line with the new, toggled line
            editor.edit(builder => {
                builder.replace(
                    new vscode.Range(
                        new vscode.Position(i, 0),
                        new vscode.Position(i, text.length)),
                    newTask);
            });
        }
        Helpers.triggerSelectionChange();
    }
}
