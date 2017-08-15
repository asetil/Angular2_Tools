import { Component, Input, Output} from '@angular/core';

@Component({
    selector: "aw-datepicker",
    template: `<div class="date-picker">
                <div class="preview"  (click)="toggle()">
                   <input type="text" [id]="id" [name]="id" class="form-control" #txtInput [(ngModel)]="selectedDate"/>
                   <i class="fa fa-calendar"></i>
                </div>
                   <div class="date-panel" [class.open]="open">
                       <div class="navigation">
                            <span class="fl" (click)="prevMonth()"><i class="fa fa-chevron-left"></i>&nbsp;&nbsp;{{prevMonthName}}</span>
                            <span class="">{{currentName}}</span>
                            <span class="fr" (click)="nextMonth()">{{nextMonthName}}&nbsp;&nbsp;<i class="fa fa-chevron-right"></i></span>
                       </div>
                       <table class="table">
                        <tr class="head"> 
                            <td *ngFor="let cell of nameRow">{{cell}}</td>
                        </tr>

                        <tr *ngFor="let row of dateRows"> 
                            <td *ngFor="let cell of row">
                                <span (click)="setDate(cell.v)" [class.active]="cell.s==1" [class.today]="cell.t==1" [class.day]="cell.v.length>0">{{cell.v}}</span>
                            </td>
                        </tr>
                       </table>
                   </div>
              </div>`
})
export class DatePickerComponent {     
    @Input() value: Date;
    @Input() id: string;

    private currentDate: Date;    
    private selectedDate: Date;
    private open = false;

    private sundayFirst=false; //set false if Monday first day
    private nameRow = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    private dateRows = [];

    ngOnInit() {
        this.value = this.value || new Date();
        this.selectedDate = this.value;
        this.currentDate = this.value;
        this.loadDateInfo();
    }

    setDate(day: string) {
        this.selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), +day);
        this.loadDateInfo();
        this.open =false;
    }

    prevMonth() {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
        this.loadDateInfo();
    }

    nextMonth() {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
        this.loadDateInfo();
    }

    toggle() {
        this.open = !this.open;
    }

    private prevMonthName: string = "";
    private currentName: string = "";
    private nextMonthName: string = "";

    loadDateInfo() {
        var m = this.currentDate.getMonth();
        var y = this.currentDate.getFullYear();

        let startDate = new Date(y, m, 1);
        var monthDays = new Date(y, m + 1, 0).getDate();
        let endDate = new Date(y, m, monthDays);

        this.prevMonthName = this.getMonthName(m - 1, 3);
        this.nextMonthName = this.getMonthName(m + 1, 3);
        this.currentName = y + " " + this.getMonthName(m, 3);

        let day = startDate.getDay();
        if (!this.sundayFirst) {
            this.nameRow = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
            day = day == 0 ? 6 : day - 1;
        }
        
        var today = new Date();
        var inRange = this.selectedDate >= startDate && this.selectedDate <= endDate;
        var hasToday = today >= startDate && today <= endDate;

        this.dateRows = [];
        var rowArray = [];
        for (var i = 0; i < 7; i++) {
            var selected = inRange && this.selectedDate.getDate() == i - day + 1 ? 1 : 0;
            var isToday = hasToday && today.getDate() == i - day + 1 ? 1 : 0;
            i < day ? rowArray[i] = { v: "", t: 0, c: 0 } : rowArray[i] = { v: "" + (i - day + 1), s: selected, t: isToday };
        }
        this.dateRows.push(rowArray);

        var ind = 7 - day + 1;
        while (ind <= monthDays) {
            rowArray = [];
            for (var j = ind; j < ind + 7; j++) {
                rowArray[j - ind] = { v: "", t: 0, c: 0 };
                if (j <= monthDays) {
                    var selected = inRange && this.selectedDate.getDate() == j ? 1 : 0;
                    var isToday = hasToday && today.getDate() == j ? 1 : 0;
                    rowArray[j - ind] = { v: "" + j, s: selected, t: isToday };
                }
            }

            this.dateRows.push(rowArray);
            ind = ind + 7;
        }
    }

    getMonthName(index: number, length: number = 0): string {
        if (index == -1) { index = 11; }
        if (index == 12) { index = 0; }

        var result = "";
        switch (index) {
            case 0: result = "January"; break;
            case 1: result = "February"; break;
            case 2: result = "March"; break;
            case 3: result = "April"; break;
            case 4: result = "May"; break;
            case 5: result = "June"; break;
            case 6: result = "July"; break;
            case 7: result = "August"; break;
            case 8: result = "Sebtember"; break;
            case 9: result = "October"; break;
            case 10: result = "November"; break;
            case 11: result = "December"; break;
        }

        if (length > 0 && result.length > length) { result = result.substring(0, length); }
        return result;
    }
}