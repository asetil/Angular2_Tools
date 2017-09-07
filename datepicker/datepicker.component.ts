import { Component, Input, Output, EventEmitter, Renderer, ElementRef } from "@angular/core";

@Component({
    selector: "aw-datepicker",
    template: `<div class="date-picker">
                <div class="preview"  (click)="open = !open">
                   <input type="text" [id]="controlID" [name]="controlID" class="form-control" [(ngModel)]="dateText" (keyup)="refreshDate()" autocomplete="off"/>
                   <i class="fa fa-calendar"></i>
                </div>
                   <div class="date-panel" [class.open]="open" >
                       <div class="navigation">
                            <span class="fl" (click)="navigate(-1)"><i class="fa fa-chevron-left"></i>&nbsp;&nbsp;{{prevLabel}}</span>
                            <div class="current-date" (click)="changeViewMode(1)">{{currentName}}</div>
                            <span class="fr" (click)="navigate(1)">{{nextLabel}}&nbsp;&nbsp;<i class="fa fa-chevron-right"></i></span>
                       </div>
                       <table class="table" *ngIf="viewMode<=0">
                        <tr class="head"> 
                            <td *ngFor="let cell of dayNames">{{cell}}</td>
                        </tr>

                        <tr *ngFor="let row of dateRows"> 
                            <td *ngFor="let cell of row">
                                <span (click)="setDate(cell.v)" [class.active]="cell.s==1" [class.today]="cell.t==1" [class.day]="cell.v.length>0">{{cell.v}}</span>
                            </td>
                        </tr>
                       </table>
                       <div class="monthyear-panel" *ngIf="viewMode==1">
                            <div *ngFor="let month of monthNames;let ind = index" (click)="navigate(0,ind)">
                                {{month | short:3:""}}
                            </div>
                       </div>
                       <div class="monthyear-panel year-panel" *ngIf="viewMode==2">
                            <div *ngFor="let year of yearList" (click)="navigate(0,year)">{{year}}</div>
                       </div>
                   </div>
              </div>`
})
export class DatePickerComponent {
    @Input("value") selectedDate: Date;
    @Input("id") controlID: string;
    @Output("valueChange") selectedDateChange = new EventEmitter<Date>();

    private currentDate: Date;
    private dateText: string;

    private sundayFirst = false; //set false if Monday first day
    private open = false;
    private dateRows = [];
    private viewMode = 0;
    private yearList = [];

    private minYear = 1850;
    private maxYear = 2099;

    // listeners
    clickListener: Function;

    constructor(private renderer: Renderer, private elementRef: ElementRef) {
        this.clickListener = renderer.listenGlobal("document", "click",(event: MouseEvent) => this.handleGlobalClick(event));
    }

    ngOnInit() {
        this.selectedDate = this.getDate(this.selectedDate);
        this.currentDate = this.selectedDate || new Date();
        this.dateText = this.getDateText(this.selectedDate);
        this.refreshDatePanel();
    }

    refreshDate() {
        let dateParts = this.dateText.replace(/\//g, ".").replace(/-/g, ".").split(".");
        if (dateParts.length == 3) {
            let day = parseInt(dateParts[0]);
            let month = parseInt(dateParts[1]);
            let year = parseInt(dateParts[2]);

            if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1850 && year < 2030) {
                this.selectedDate = new Date(Date.UTC(year, month - 1, day));
                this.currentDate = this.selectedDate;
                this.refreshDatePanel();
            }
        } else {
            this.selectedDate = null;
            this.refreshDatePanel();
        }
    }

    setDate(day: string) {
        this.selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), +day);
        this.dateText = this.getDateText(this.selectedDate);
        this.refreshDatePanel();
        this.open = false;
    }

    navigate(inc: number, value: number = -1) {
        if (this.viewMode == 2) {
            let yy = (value >= 0 ? value : this.currentDate.getFullYear()) + (12 * inc);
            if (yy < this.minYear) { yy = this.minYear+6; }
            if (yy > this.maxYear) { yy = this.maxYear-5; }
            this.currentDate = new Date(yy, 1, 1);
        }
        else {
            let mm = (value >= 0 ? value : this.currentDate.getMonth()) + inc;
            this.currentDate = new Date(this.currentDate.getFullYear(), mm, 1);
        }

        if (value >= 0 || this.viewMode > 0) {
            this.changeViewMode(value >= 0 ? -1 : 0);
        } else {
            this.refreshDatePanel();
        }
    }

    changeViewMode(inc: number) {
        this.viewMode += inc;
        this.viewMode = this.viewMode < 0 ? 0 : this.viewMode;
        this.viewMode = this.viewMode > 2 ? 2 : this.viewMode;

        let y = this.currentDate.getFullYear();
        this.currentName = y + "";
        this.prevLabel = "";
        this.nextLabel = "";

        if (this.viewMode <= 0) {
            this.refreshDatePanel();
        }
        else if (this.viewMode == 2) {
            this.currentName = (y - 6) + " - " + (y + 5);
            this.yearList = [];
            for (let i = 0; i < 12; i++) {
                this.yearList.push(y - 6 + i);
            }
        }
    }

    private prevLabel: string = "";
    private currentName: string = "";
    private nextLabel: string = "";
    private dayNames = ["Pz", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"];
    private monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

    refreshDatePanel() {
        var m = this.currentDate.getMonth();
        var y = this.currentDate.getFullYear();

        let startDate = new Date(y, m, 1);
        var monthDays = new Date(y, m + 1, 0).getDate();
        let endDate = new Date(y, m, monthDays);

        this.prevLabel = this.getMonthName(m - 1, 3);
        this.nextLabel = this.getMonthName(m + 1, 3);
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
        this.selectedDateChange.emit(this.selectedDate);
    }

    getMonthName(index: number, length: number = 0): string {
        if (index == -1) { index = 11; }
        if (index == 12) { index = 0; }
        let name = this.monthNames[index];

        if (length > 0 && name.length > length) { name = name.substring(0, length); }
        return name;
    }

    getDateText(date: Date): string {
        return date ? date.toLocaleDateString() : "";
    }

    getDate(dateInfo): Date {
        if (dateInfo) {
            let timeStamp = (parseInt(dateInfo.substr(6)));
            let date = new Date(timeStamp);
            return date;
        }
        return null;
    }

    handleGlobalClick(event: MouseEvent): void {
        const withinElement = this.elementRef.nativeElement.contains(event.target);
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.open=false;
        }
    }
}