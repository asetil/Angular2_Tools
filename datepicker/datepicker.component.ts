import { Component, Input, Output } from '@angular/core';

@Component({
    selector: "aw-datepicker",
    template: `<div class="date-picker">
                <div class="preview"  (click)="toggle()">
                   <input type="text" [id]="controlID" [name]="controlID" class="form-control" [(ngModel)]="dateText" (keyup)="refreshDate()"/>
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
                            <td *ngFor="let cell of dayNames">{{cell}}</td>
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
    @Input("value") selectedDate: Date;
    @Input("id") controlID: string;

    private currentDate: Date;
    private dateText: string;

    private sundayFirst = false; //set false if Monday first day
    private open = false;
    private dateRows = [];

    ngOnInit() {
        this.selectedDate = this.selectedDate || new Date();
        this.currentDate = this.selectedDate;
        this.dateText = this.getDateText(this.selectedDate);
        this.refreshDatePanel();
    }

    refreshDate() {
        let dateParts = this.dateText.replace(/\//g, ".").replace(/-/g, ".").split(".");
        if (dateParts.length == 3) {
            let day = parseInt(dateParts[0]);
            let month = parseInt(dateParts[1]);
            let year = parseInt(dateParts[2]);

            if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1917 && year < 2030) {
                this.selectedDate = new Date(Date.UTC(year, month - 1, day));
                this.currentDate = this.selectedDate;
                this.refreshDatePanel();
            }
        }
    }

    setDate(day: string) {
        this.selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), +day);
        this.dateText = this.getDateText(this.selectedDate);
        this.refreshDatePanel();
        this.open = false;
    }

    prevMonth() {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
        this.refreshDatePanel();
    }

    nextMonth() {
        this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
        this.refreshDatePanel();
    }

    toggle() {
        this.open = !this.open;
    }

    private prevMonthName: string = "";
    private currentName: string = "";
    private nextMonthName: string = "";
    private dayNames = ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"];
    private monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    refreshDatePanel() {
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
            this.dayNames = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];
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
        let name = this.monthNames[index];

        if (length > 0 && name.length > length) { name = name.substring(0, length); }
        return name;
    }

    getDateText(date: Date): string {
        return date.toLocaleDateString();
    }
}