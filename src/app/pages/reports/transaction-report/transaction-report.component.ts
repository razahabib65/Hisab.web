import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionReportService } from '../../../core/services/transaction-report.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterNavComponent } from '../../../shared/components/footer-nav/footer-nav.component';

@Component({
  selector: 'app-transaction-report',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterNavComponent],
  templateUrl: './transaction-report.component.html',
  styleUrl: './transaction-report.component.scss'
})
export class TransactionReportComponent implements OnInit {

  private readonly reportService = inject(TransactionReportService);

  public readonly report = this.reportService.report;
  public readonly isLoading = this.reportService.isLoading;
  public readonly error = this.reportService.error;

  public readonly fromDate = signal<string>(this.getFirstDayOfPrevMonthString());
  public readonly toDate   = signal<string>(this.getTodayDateString());

  public ngOnInit(): void {
    this.loadData();
  }

  public loadData(): void {
    const from = this.fromDate();
    const to = this.toDate();
    if (from && to) {
      this.reportService.loadReport(from, to, undefined);
    }
  }

  private getTodayDateString(): string {
    const today = new Date();
    const year  = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day   = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getFirstDayOfPrevMonthString(): string {
    const today    = new Date();
    // Day 0 of current month = last day of previous month
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const year  = prevMonth.getFullYear();
    const month = String(prevMonth.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  }
}
