import type { Db, Document } from "mongodb";
interface MinimalStaff extends Document {
    _id: unknown;
    firstName?: string;
    lastName?: string;
    email?: string;
    position?: string;
    businessId?: string;
    salary?: number;
    compensationProfileId?: string;
}
/**
 * Called after an EOD is approved or un-approved.
 * Creates or recalculates the draft invoice for the affected payroll period.
 *
 * - If no invoice exists → creates a new draft
 * - If invoice is draft/calculated → recalculates with all currently approved EODs
 * - If invoice is approved/paid → skips silently (locked)
 * - If staff has no salary → skips silently (not payroll-ready)
 */
export declare function invoiceOnEodApproval(db: Db, eodRecord: Document, staffMember: MinimalStaff): Promise<void>;
export {};
//# sourceMappingURL=invoice.eod-hook.service.d.ts.map