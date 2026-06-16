package com.example.stock_management.dto;

public enum PaymentStatus {
    PAID("paid", "Payé"),
    UNPAID("unpaid", "À payer"),
    PARTIALLY_PAID("partial", "Partiellement payé"),
    GIFT("gift", "Cadeau");

    private final String code;
    private final String label;

    PaymentStatus(String code, String label) {
        this.code = code;
        this.label = label;
    }

    public String getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }
}
/*
  getPaymentStatusLabel(status: string): string {
    switch (status) {
      case 'PAID':           return 'Payé';
      case 'UNPAID':         return 'Impayé';
      case 'PARTIALLY_PAID': return 'Partiellement Payé';
      default:               return status || '—';
    }
  }
 */