export interface RateMasterInterface {
	rateId?: number;
	weight: number;
	directAmount: number;
	indirectAmount: number;
	fromDate: string;
	toDate: string;
    levy?: number;
    localCharges?: number;
}