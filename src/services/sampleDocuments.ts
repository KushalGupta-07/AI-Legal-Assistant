import type { LegalDocument } from '../types/legal';

export const SAMPLE_DOCUMENTS: LegalDocument[] = [
  {
    id: 'sample-lease',
    title: 'Commercial Office Lease Agreement (High Risk)',
    type: 'contract',
    fileName: 'Commercial_Office_Lease_2026.txt',
    uploadDate: '2026-09-14',
    wordCount: 1420,
    content: `COMMERCIAL REAL ESTATE LEASE AGREEMENT

This Commercial Lease Agreement ("Lease") is entered into as of January 15, 2026, by and between Apex Property Management LLC ("Landlord") and Nova Technologies Inc. ("Tenant").

SECTION 1. PREMISES & TERM
1.1 Premises: Landlord leases to Tenant Suite 400 located at 500 Commerce Way, Tech District, containing approximately 4,500 square feet.
1.2 Term: The initial term shall be three (3) years, commencing February 1, 2026 and expiring January 31, 2029.

SECTION 2. RENT & ESCALATIONS
2.1 Monthly Base Rent: Tenant shall pay $12,500.00 per month, due on the first day of each calendar month.
2.2 Escalation: Base Rent shall automatically escalate by ten percent (10%) annually on each anniversary of the Commencement Date without notice.
2.3 Late Charges: Any rent payment received after the 3rd of the month shall incur a mandatory 15% late fee ($1,875.00) plus compounding interest of 1.5% per month.

SECTION 3. MAINTENANCE, REPAIRS & HVAC OBLIGATIONS
3.1 Triple Net (NNN) Responsibilities: Tenant assumes full financial and operational responsibility for all repairs, replacement, and maintenance of the HVAC system, roof membrane structural integrity, exterior structural walls, and foundation.
3.2 Emergency Repairs: Tenant must complete structural or mechanical repairs within forty-eight (48) hours of occurrence, failing which Landlord may hire contractors at Tenant's expense with a 30% administrative fee surcharge.

SECTION 4. AUTOMATIC RENEWAL & TERMINATION NOTICE
4.1 Auto-Renewal: This Lease will automatically renew for an additional five (5) year period unless Tenant delivers written cancellation notice via Certified Mail to Landlord exactly between ninety (90) and one hundred twenty (120) days prior to the expiration date. Failure to notify within this exact 30-day window shall automatically bind Tenant to the 5-year renewal.
4.2 Landlord Early Termination: Landlord reserves the absolute right to terminate this Lease without cause at any time upon thirty (30) days prior written notice to Tenant, with no relocation allowance or compensation.

SECTION 5. PERSONAL GUARANTEE & UNLIMITED LIABILITY
5.1 Unlimited Personal Guarantee: The undersigned Officers of Nova Technologies Inc. hereby personally, unconditionally, and irrevocably guarantee the full payment and performance of all Tenant financial obligations under this Lease for the entire term and any renewal term.
5.2 Indemnification: Tenant agrees to defend, indemnify, hold harmless Landlord against any and all claims, lawsuits, property damage, loss of business, or legal expenses arising on or near the Premises, regardless of whether caused in whole or in part by Landlord's negligence.

SECTION 6. LANDLORD ACCESS & SECURITY DEPOSIT
6.1 Access: Landlord reserves the right to enter the Premises at any time, 24/7, without prior notice to inspect, alter, market, or showcase the Premises to prospective tenants or buyers.
6.2 Security Deposit Forfeiture: Landlord shall retain the $25,000 security deposit. Landlord may unilaterally retain the deposit for any alleged minor breach or cosmetic wall scuffs upon move-out without itemized documentation.`,
    analysis: {
      executiveSummary: 'This Commercial Lease Agreement favors the Landlord heavily and contains multiple severe red flags. It features an automatic 5-year renewal clause with a narrow notice window, an annual 10% rent increase, unlimited personal officer guarantees, and tenant liability for structural building elements (roof and foundation).',
      keyTakeaways: [
        'Personal officers must personally guarantee all financial obligations (high personal risk).',
        'Auto-renews for 5 additional years if notice is missed between 90-120 days before expiration.',
        'Tenant is responsible for structural building repairs (roof, HVAC, foundation).',
        'Landlord can enter 24/7 without notice and terminate early with only 30 days notice.',
        'Rent escalates by 10% each year automatically.'
      ],
      plainEnglishTranslation: 'Under this contract, if your business falls behind on rent, your personal personal savings and assets can be seized because of the personal guarantee. Also, if you forget to send a cancellation letter within a very tight 30-day window 3 months before expiry, you are trapped in a 5-year extension. Landlord can also kick you out in 30 days while you cannot leave early.',
      laypersonRating: 'Very Complex',
      complexityScore: 88,
      overallRiskLevel: 'high',
      clauses: [
        {
          id: 'lease-c1',
          section: 'Section 5.1',
          title: 'Unlimited Personal Guarantee',
          originalText: 'The undersigned Officers of Nova Technologies Inc. hereby personally, unconditionally, and irrevocably guarantee the full payment and performance of all Tenant financial obligations under this Lease...',
          plainTextSummary: 'Company executives are personally liable with their personal bank accounts and assets for all lease payments if the company defaults.',
          category: 'liability',
          riskLevel: 'high',
          riskReason: 'Personal officer assets are exposed to company lease debt.',
          recommendations: 'Negotiate complete removal of personal guarantee or cap guarantee to 3-6 months rent with a burn-off provision.',
          entityInvolved: 'User',
          tags: ['Personal Risk', 'Guarantee', 'Red Flag']
        },
        {
          id: 'lease-c2',
          section: 'Section 4.1',
          title: 'Strict Auto-Renewal Window',
          originalText: 'This Lease will automatically renew for an additional five (5) year period unless Tenant delivers written cancellation notice... exactly between 90 and 120 days prior to expiration date.',
          plainTextSummary: 'If you miss the specific 30-day window (90-120 days before end date), you are locked into 5 more years of rent.',
          category: 'termination',
          riskLevel: 'high',
          riskReason: 'Narrow window can easily lead to inadvertent 5-year lease lock-in.',
          recommendations: 'Change notice requirement to "any time prior to 90 days before expiration".',
          entityInvolved: 'Both',
          tags: ['Auto-Renewal', 'Deadline', 'Trap']
        },
        {
          id: 'lease-c3',
          section: 'Section 3.1',
          title: 'Structural Repair Responsibility (Roof/Foundation)',
          originalText: 'Tenant assumes full financial and operational responsibility for all repairs, replacement, and maintenance of the HVAC system, roof membrane structural integrity, exterior structural walls, and foundation.',
          plainTextSummary: 'You are forced to pay for major structural building replacements like a broken roof or cracked building foundation.',
          category: 'obligations',
          riskLevel: 'high',
          riskReason: 'Capital building structural expenses belong to landlord, not tenant.',
          recommendations: 'Limit Tenant repair duties to interior routine maintenance; Landlord must maintain roof and foundation.',
          entityInvolved: 'User',
          tags: ['Financial Obligation', 'Building Maintenance']
        },
        {
          id: 'lease-c4',
          section: 'Section 4.2',
          title: 'Unilateral Landlord Termination Without Cause',
          originalText: 'Landlord reserves the absolute right to terminate this Lease without cause at any time upon thirty (30) days prior written notice to Tenant...',
          plainTextSummary: 'Landlord can force your business to relocate with just 30 days notice even if you pay rent on time.',
          category: 'termination',
          riskLevel: 'high',
          riskReason: 'Extreme business disruption risk without landlord relocation compensation.',
          recommendations: 'Delete landlord right to terminate without cause, or require 180 days notice plus relocation payout.',
          entityInvolved: 'Counterparty',
          tags: ['Asymmetric Rights', 'Termination']
        },
        {
          id: 'lease-c5',
          section: 'Section 2.2',
          title: '10% Annual Base Rent Escalation',
          originalText: 'Base Rent shall automatically escalate by ten percent (10%) annually on each anniversary...',
          plainTextSummary: 'Rent increases by 10% every single year ($12.5k -> $13.75k -> $15.12k).',
          category: 'financial',
          riskLevel: 'medium',
          riskReason: 'Above-market inflation rate compounding cost escalation.',
          recommendations: 'Cap annual escalation to 3% or tie to CPI index.',
          entityInvolved: 'User',
          tags: ['Rent Escalation', 'Financial']
        }
      ],
      obligations: [
        {
          id: 'ob-1',
          clauseId: 'lease-c1',
          party: 'User',
          description: 'Officers must personally back financial defaults of Nova Technologies Inc.',
          isStrict: true,
          penalty: 'Personal asset repossession / lawsuit against officer individuals.'
        },
        {
          id: 'ob-2',
          clauseId: 'lease-c2',
          party: 'User',
          description: 'Deliver written cancellation notice exactly between Nov 3, 2028 and Dec 3, 2028 (90-120 days before Jan 31, 2029).',
          deadline: '2028-11-03',
          isStrict: true,
          penalty: 'Automatic 5-year renewal binding company to ~$800,000 in total rent.'
        },
        {
          id: 'ob-3',
          clauseId: 'lease-c3',
          party: 'User',
          description: 'Repair structural damages or HVAC failures within 48 hours.',
          deadline: 'Within 48 hours of damage',
          isStrict: true,
          penalty: 'Landlord hires contractor with 30% administrative markup.'
        }
      ],
      deadlines: [
        {
          id: 'dl-1',
          title: 'Lease Commencement & First Rent Payment',
          dateOrTimeframe: '2026-02-01',
          type: 'payment',
          details: 'Initial monthly payment of $12,500.00 due on first of month.',
          isCompleted: false,
          clauseRef: 'Section 2.1'
        },
        {
          id: 'dl-2',
          title: 'First Annual 10% Rent Increase',
          dateOrTimeframe: '2027-02-01',
          type: 'payment',
          details: 'Monthly base rent increases from $12,500 to $13,750.',
          isCompleted: false,
          clauseRef: 'Section 2.2'
        },
        {
          id: 'dl-3',
          title: 'Strict Non-Renewal Window Opens (120 Days Before Expiry)',
          dateOrTimeframe: '2028-10-03',
          type: 'notice',
          details: 'Earliest date to send written non-renewal notice via Certified Mail.',
          isCompleted: false,
          clauseRef: 'Section 4.1'
        },
        {
          id: 'dl-4',
          title: 'Strict Non-Renewal Window Closes (90 Days Before Expiry)',
          dateOrTimeframe: '2028-11-02',
          type: 'notice',
          details: 'DEADLINE: Non-renewal notice MUST be delivered before today or contract auto-renews for 5 years.',
          isCompleted: false,
          clauseRef: 'Section 4.1'
        }
      ],
      inconsistencies: [
        {
          id: 'inc-1',
          title: 'Asymmetric Termination Notice vs Renewal Notice',
          description: 'Tenant must give exactly 90-120 days notice via Certified Mail to avoid auto-renewal, while Landlord can terminate at any time with only 30 days notice without cause.',
          clauseIds: ['lease-c2', 'lease-c4'],
          severity: 'high',
          resolutionSuggestion: 'Equalize notice periods to 90 days for both parties and mandate mutual early termination terms.'
        },
        {
          id: 'inc-2',
          title: 'Conflict Between Repair Window and Emergency Surcharge',
          description: 'Section 3.2 allows 48 hours for repairs, but Landlord 24/7 unannounced access in Section 6.1 permits immediate entry and repair declaration before the 48-hour window elapses.',
          clauseIds: ['lease-c3', 'lease-c5'],
          severity: 'medium',
          resolutionSuggestion: 'Add written notification step before Landlord contractor deployment.'
        }
      ]
    }
  },
  {
    id: 'sample-nda-v1',
    title: 'Mutual Non-Disclosure Agreement (Standard v1)',
    type: 'agreement',
    fileName: 'Mutual_NDA_Standard_v1.txt',
    uploadDate: '2026-09-10',
    wordCount: 850,
    content: `MUTUAL NON-DISCLOSURE AGREEMENT (STANDARD)

This Mutual Non-Disclosure Agreement ("Agreement") is made effective as of August 1, 2026 by and between Party A Corp ("Disclosing Party") and Party B Solutions ("Receiving Party").

1. PURPOSE & CONFIDENTIAL INFORMATION
The parties wish to explore a potential strategic business relationship. "Confidential Information" includes all non-public technical, financial, customer, product data, and trade secrets disclosed by either party.

2. OBLIGATIONS OF CONFIDENTIALITY
Each party agrees to maintain confidentiality using the same degree of care as for its own trade secrets, but no less than reasonable care. Information shall only be disclosed to employees with a direct need-to-know.

3. EXCLUSIONS FROM CONFIDENTIALITY
Confidential Information does not include information that: (a) is or becomes publicly known through no fault of Receiving Party; (b) was already known prior to disclosure; (c) is independently developed; or (d) is required by law or court order to be disclosed.

4. TERM & DURATION
This Agreement shall remain in effect for two (2) years from the Effective Date. Confidentiality obligations for trade secrets shall survive for three (3) years following termination.

5. NO LICENSE OR OBLIGATION
Nothing herein obligates either party to proceed with any business transaction or grants any IP license.`,
    analysis: {
      executiveSummary: 'Standard mutual non-disclosure agreement protecting confidential business exchanges for 2 years with a 3-year survival clause. Balanced terms for both parties.',
      keyTakeaways: [
        'Mutual protection for both parties.',
        '2-year agreement term with 3-year survival period.',
        'Standard exclusions for public knowledge, prior knowledge, and legal compulsion.'
      ],
      plainEnglishTranslation: 'A balanced agreement where both companies promise to keep each other’s business secrets private for up to 3 years after the deal ends.',
      laypersonRating: 'Simple',
      complexityScore: 25,
      overallRiskLevel: 'low',
      clauses: [
        {
          id: 'nda1-c1',
          section: 'Section 4',
          title: '3-Year Confidentiality Term',
          originalText: 'Confidentiality obligations for trade secrets shall survive for three (3) years following termination.',
          plainTextSummary: 'Secrets must be kept private for 3 years after the contract ends.',
          category: 'ip_confidentiality',
          riskLevel: 'low',
          riskReason: 'Standard industry timeframe.',
          entityInvolved: 'Both',
          tags: ['Standard', 'Confidentiality']
        }
      ],
      obligations: [
        {
          id: 'nda1-ob1',
          clauseId: 'nda1-c1',
          party: 'Both',
          description: 'Maintain secrecy of disclosed proprietary files.',
          deadline: '3 years after contract end',
          isStrict: false
        }
      ],
      deadlines: [
        {
          id: 'nda1-dl1',
          title: 'Expiration of Agreement',
          dateOrTimeframe: '2028-08-01',
          type: 'renewal',
          details: 'Initial 2-year term ends.',
          isCompleted: false
        }
      ],
      inconsistencies: []
    }
  },
  {
    id: 'sample-nda-v2',
    title: 'Vendor-Drafted NDA (Revised v2 - High Penalty)',
    type: 'agreement',
    fileName: 'Vendor_NDA_HeavyPenalties_v2.txt',
    uploadDate: '2026-09-14',
    wordCount: 1100,
    content: `NON-DISCLOSURE & NON-SOLICITATION AGREEMENT (VENDOR FORM)

This Agreement is entered into on September 1, 2026 by Apex Global Corp ("Vendor") and Client Corp ("Recipient").

1. ONE-WAY CONFIDENTIALITY
Recipient agrees that all information, software code, customer lists, and verbal discussions shared by Vendor shall be deemed strictly Confidential Information. Vendor has no reciprocal obligation regarding Recipient information.

2. DURATION IN PERPETUITY
Recipient's obligation to protect Vendor Confidential Information shall continue IN PERPETUITY (forever), with no expiration date.

3. MANDATORY LIQUIDATED DAMAGES ($250,000 PER INFRAGEMENT)
In the event Recipient breaches any provision of this Agreement, Recipient agrees to pay Vendor fixed liquidated damages of $250,000 per occurrence plus full reimbursement of Vendor's actual legal counsel fees without requiring Vendor to prove actual harm.

4. STRICT NON-SOLICITATION & $100,000 POACHING PENALTY
Recipient agrees not to solicit, hire, or engage any employee, contractor, or consultant of Vendor for a period of five (5) years. Breach of this clause triggers an immediate mandatory penalty fee of $100,000 per employee.

5. PRE-EXISTING IP ASSIGNMENT
Any improvements, suggestions, ideas, or modifications made by Recipient regarding Vendor's operations or software shall automatically become the sole and exclusive intellectual property of Vendor.`,
    analysis: {
      executiveSummary: 'Extremely aggressive one-way vendor NDA containing perpetual confidentiality obligations, harsh liquidated damages ($250k per breach), a 5-year employee non-solicitation clause with $100k penalties, and automatic pre-existing IP assignments.',
      keyTakeaways: [
        'One-way protection only favoring Vendor.',
        'Perpetual confidentiality term (never expires).',
        '$250,000 mandatory liquidated damage penalty per breach.',
        '5-year non-solicitation with $100,000 fee per poached employee.',
        'All client ideas/improvements automatically belong to Vendor.'
      ],
      plainEnglishTranslation: 'This is not a mutual agreement. Only you are bound to keep secrets forever, while the vendor can share your stuff. If you breach even accidentally, you owe $250k in damages instantly.',
      laypersonRating: 'Complex',
      complexityScore: 82,
      overallRiskLevel: 'high',
      clauses: [
        {
          id: 'nda2-c1',
          section: 'Section 3',
          title: 'Liquidated Damages ($250,000 per breach)',
          originalText: 'Recipient agrees to pay Vendor fixed liquidated damages of $250,000 per occurrence plus full reimbursement...',
          plainTextSummary: 'Fixed fine of $250,000 for any alleged secret disclosure without needing proof of loss.',
          category: 'liability',
          riskLevel: 'high',
          riskReason: 'Excessive liquidated damages clause.',
          recommendations: 'Strike out liquidated damages; limit liability to actual proven direct damages.',
          entityInvolved: 'User',
          tags: ['Heavy Penalty', 'Liquidated Damages']
        },
        {
          id: 'nda2-c2',
          section: 'Section 4',
          title: '5-Year Non-Solicitation & $100k Penalty',
          originalText: 'Recipient agrees not to solicit, hire, or engage any employee... breach triggers an immediate mandatory penalty fee of $100,000 per employee.',
          plainTextSummary: 'Cannot hire any vendor workers for 5 years or face $100k fine per person.',
          category: 'obligations',
          riskLevel: 'high',
          riskReason: 'Unreasonably long 5-year restriction and high fine.',
          recommendations: 'Limit non-solicitation to 1 year and restrict to direct hiring efforts.',
          entityInvolved: 'User',
          tags: ['Non-Solicitation', 'Penalty']
        }
      ],
      obligations: [
        {
          id: 'nda2-ob1',
          clauseId: 'nda2-c1',
          party: 'User',
          description: 'Keep vendor disclosures confidential forever.',
          deadline: 'Perpetual (No End Date)',
          isStrict: true,
          penalty: '$250,000 mandatory payment per occurrence.'
        }
      ],
      deadlines: [],
      inconsistencies: []
    }
  }
];
