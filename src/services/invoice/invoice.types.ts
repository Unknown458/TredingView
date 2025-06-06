export interface InvoiceInterface {
    invoiceId?: number;
    invoiceNo: number;
    invoiceDate: string;
    godownId: number;
    remark: string;
    invoiceDetails: InvoiceDetailsInterface[];
  }

  export interface InvoiceDetailsInterface {
    invoiceDetailId?: number;
    invoiceId?: number;
    memoDate: string;
    rateType: string;
    weight: number;
    truckId: number;
    stationId: number;
    packages: number;
    lmNo: number;
    amount: number;
    status: string;
  }
