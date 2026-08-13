// Draft operational/legal document templates. The binding documents (seller
// agreement, buyer pickup release, auction terms, SMS consent) are flagged
// for attorney review before real-world use — see each form's `legalReview`.

const PROHIBITED_ITEMS_HTML = `
  <ul class="form-list">
    <li><strong>Illegal / non-negotiable:</strong> firearms, ammunition, explosives, fireworks; illegal drugs or controlled substances; stolen property; property Seller does not have clear legal right to sell.</li>
    <li><strong>Fire &amp; combustion risk:</strong> fuel (gasoline, diesel, kerosene); propane tanks or other compressed gas cylinders; loose or damaged large-format lithium battery packs; open flame devices or anything lit.</li>
    <li><strong>Hazardous / biological:</strong> industrial chemicals, solvents, corrosives; biohazards, medical waste, human waste; live animals.</li>
    <li><strong>Perishable / pest risk:</strong> open or perishable food; wet, moldy, or pest-infested items; anything with active odor or decay risk.</li>
    <li><strong>Operational limits:</strong> items that don't fit through the unit door or exceed its weight/floor-load limit; items requiring power or refrigeration to stay safe.</li>
  </ul>
`;

const FORMS = [
  {
    id: 'bidder-registration',
    code: 'FRM-01',
    title: 'Bidder Registration Form',
    roles: ['bidder'],
    summary: 'Required before any bidder can place a bid.',
    legalReview: false,
    bodyHtml: `
      <p class="form-intro">Complete this form to register as a bidder on Container Auctions. A refundable bidding deposit will be authorized on your payment method before you can place your first bid.</p>
      <div class="field-grid">
        <div class="field"><label>Legal Name</label><span class="blank"></span></div>
        <div class="field"><label>Date of Birth</label><span class="blank"></span></div>
        <div class="field"><label>Mailing Address</label><span class="blank"></span></div>
        <div class="field"><label>City / State / ZIP</label><span class="blank"></span></div>
        <div class="field"><label>Phone</label><span class="blank"></span></div>
        <div class="field"><label>Email</label><span class="blank"></span></div>
        <div class="field"><label>Government-Issued ID Type &amp; Number</label><span class="blank"></span></div>
        <div class="field"><label>Payment Method on File</label><span class="blank">&#9744; Card &nbsp; &#9744; Apple Pay &nbsp; &#9744; Google Pay &nbsp; ending ____</span></div>
      </div>
      <h4>Acknowledgments</h4>
      <ul class="form-checklist">
        <li>&#9744; I am at least 18 years of age.</li>
        <li>&#9744; I have read and agree to the Auction Terms &amp; Participation Agreement.</li>
        <li>&#9744; I understand a refundable bidding deposit will be authorized on my payment method before I can place any bid.</li>
        <li>&#9744; I consent to receive auction-related email. (Text messages require a separate SMS Text Consent Form.)</li>
      </ul>
    `,
  },
  {
    id: 'seller-agreement',
    code: 'FRM-02',
    title: 'Seller Agreement',
    roles: ['seller'],
    summary: 'Signed at intake before any items go into an assigned unit.',
    legalReview: true,
    bodyHtml: `
      <p class="form-intro">This Seller Agreement ("Agreement") is entered into between <strong>[OPERATOR LEGAL NAME]</strong> ("Operator") and the undersigned ("Seller") for the auction of personal property placed in the container section identified below.</p>
      <div class="field-grid">
        <div class="field"><label>Facility</label><span class="blank"></span></div>
        <div class="field"><label>Unit</label><span class="blank">&#9744; A &nbsp; &#9744; B &nbsp; &#9744; C &nbsp; &#9744; D</span></div>
        <div class="field"><label>Setup Window (2 days)</label><span class="blank">From ____ to ____</span></div>
      </div>
      <ol class="form-clauses">
        <li><strong>Assignment.</strong> Seller is assigned the unit identified above for the stated setup window only.</li>
        <li><strong>Security Deposit.</strong> Seller shall pay a refundable security deposit of <span class="blank inline">$______</span> prior to placing any items in the unit. If the auction closes with no winning bid meeting reserve, Operator may apply this deposit toward unit cleanup and/or a no-sale use fee of <span class="blank inline">$______</span>.</li>
        <li><strong>Prohibited Items.</strong> Seller shall not place any prohibited item in the unit, including but not limited to the categories listed in Exhibit A below.</li>
        <li><strong>Documentation.</strong> Seller consents to photo and video documentation of the unit's contents prior to lockup, and to interior/exterior camera monitoring of the unit throughout the auction, setup, and removal periods.</li>
        <li><strong>AI Screening.</strong> Seller understands that intake photographs will be screened by automated image detection for likely prohibited items, that any flag will be reviewed by Operator's facility manager, and that lockup will not proceed until any flag is resolved.</li>
        <li><strong>Lockup.</strong> Once the unit is locked and sealed, no person may add, remove, rearrange, or alter its contents without Operator's prior written approval.</li>
        <li><strong>Commission.</strong> Operator's commission is 10% of the winning bid, deducted from Seller's payout. A separate buyer's premium is paid by the buyer and is not part of Seller's proceeds.</li>
        <li><strong>Payout.</strong> Seller's payout (winning bid less commission) is released after Operator confirms the unit was cleared and left in acceptable condition during the buyer's removal window.</li>
        <li><strong>No Reliance.</strong> Seller acknowledges that Operator has made no representations or warranties regarding the sale price or outcome of the auction.</li>
        <li><strong>Limitation of Liability.</strong> Operator's total liability to Seller under this Agreement shall not exceed the total fees paid by Seller to Operator.</li>
        <li><strong>Right to Refuse.</strong> Operator reserves the right to refuse any item, deny access, or terminate this Agreement at its sole discretion.</li>
        <li><strong>Time is of the Essence.</strong> Time is of the essence with respect to the setup window and all other deadlines in this Agreement.</li>
        <li><strong>Attorney's Fees.</strong> In any dispute arising from this Agreement, the prevailing party shall be entitled to reasonable attorney's fees and costs.</li>
      </ol>
      <h4>Exhibit A — Prohibited Items</h4>
      ${PROHIBITED_ITEMS_HTML}
    `,
  },
  {
    id: 'buyer-pickup-release',
    code: 'FRM-03',
    title: 'Buyer Pickup Release',
    roles: ['bidder'],
    summary: 'Confirms removal terms once payment is complete.',
    legalReview: true,
    bodyHtml: `
      <p class="form-intro">This release confirms the terms under which the undersigned ("Buyer") takes possession of the contents of the unit identified below, sold as-is, where-is, through an auction conducted by <strong>[OPERATOR LEGAL NAME]</strong> ("Operator").</p>
      <div class="field-grid">
        <div class="field"><label>Facility / Unit</label><span class="blank"></span></div>
        <div class="field"><label>Auction / Listing ID</label><span class="blank"></span></div>
        <div class="field"><label>Winning Bid</label><span class="blank">$______</span></div>
        <div class="field"><label>Buyer's Premium (15%)</label><span class="blank">$______</span></div>
        <div class="field"><label>Sales Tax</label><span class="blank">$______</span></div>
        <div class="field"><label>Total Paid</label><span class="blank">$______</span></div>
        <div class="field"><label>Removal Window (2 days)</label><span class="blank">From ____ to ____</span></div>
        <div class="field"><label>Cleanup / Performance Deposit</label><span class="blank">$______ (refundable)</span></div>
      </div>
      <ol class="form-clauses">
        <li><strong>Sold As-Is.</strong> Buyer acknowledges the unit and its contents were purchased as-is, where-is, with no representations or warranties made by Operator or Seller.</li>
        <li><strong>Removal.</strong> Buyer is solely responsible for removing all purchased contents within the removal window stated above.</li>
        <li><strong>Access.</strong> Buyer will be issued a temporary access code valid only for the removal window. The code deactivates automatically at the end of the window.</li>
        <li><strong>Cleanup Deposit.</strong> The cleanup/performance deposit is refunded only if the unit is fully cleared, undamaged, and vacated within the removal window. Missing any of these conditions results in forfeiture of the deposit and may result in additional charges.</li>
        <li><strong>No-Show.</strong> If Buyer does not complete removal within the window, Operator may treat the property as abandoned per Operator's abandoned-property policy, and Buyer may be suspended from future bidding.</li>
      </ol>
    `,
  },
  {
    id: 'bidder-deposit-receipt',
    code: 'FRM-04',
    title: 'Bidder Deposit Receipt',
    roles: ['bidder'],
    summary: 'Issued when your bidding deposit is authorized.',
    legalReview: false,
    bodyHtml: `
      <div class="field-grid">
        <div class="field"><label>Bidder Name</label><span class="blank"></span></div>
        <div class="field"><label>Date</label><span class="blank"></span></div>
        <div class="field"><label>Deposit Amount Authorized</label><span class="blank">$______</span></div>
        <div class="field"><label>Payment Method</label><span class="blank">Card ending ____</span></div>
        <div class="field"><label>Authorization Reference #</label><span class="blank"></span></div>
      </div>
      <p>This deposit is a hold, not a charge. It is released if you do not win an auction. If you win and complete payment, this hold is released separately from your purchase payment. If you win and fail to complete payment, this deposit may be forfeited per the Auction Terms &amp; Participation Agreement.</p>
      <p><strong>Status:</strong> &#9744; Active &nbsp; &#9744; Released &nbsp; &#9744; Forfeited</p>
    `,
  },
  {
    id: 'seller-deposit-receipt',
    code: 'FRM-05',
    title: 'Seller Deposit Receipt',
    roles: ['seller'],
    summary: 'Issued when your security deposit is collected at intake.',
    legalReview: false,
    bodyHtml: `
      <div class="field-grid">
        <div class="field"><label>Seller Name</label><span class="blank"></span></div>
        <div class="field"><label>Date</label><span class="blank"></span></div>
        <div class="field"><label>Facility / Unit</label><span class="blank"></span></div>
        <div class="field"><label>Deposit Amount</label><span class="blank">$______</span></div>
      </div>
      <p>This deposit is refundable upon a successful sale and confirmed unit condition, or may be applied toward unit cleanup and/or a no-sale use fee if the listing closes without a winning bid, per the Seller Agreement.</p>
      <p><strong>Status:</strong> &#9744; Held &nbsp; &#9744; Refunded &nbsp; &#9744; Applied to cleanup &nbsp; &#9744; Applied to no-sale fee</p>
    `,
  },
  {
    id: 'sms-consent',
    code: 'FRM-06',
    title: 'SMS Text Consent Form',
    roles: ['bidder', 'seller'],
    summary: 'Opt in to text alerts for new listings, endings, and pickup.',
    legalReview: true,
    bodyHtml: `
      <p class="form-intro">By providing your mobile number below and checking the box, you agree to receive auction-related text messages from <strong>[OPERATOR LEGAL NAME]</strong>, including new-listing alerts, ending-soon reminders, and pickup/access notifications.</p>
      <div class="field-grid">
        <div class="field"><label>Name</label><span class="blank"></span></div>
        <div class="field"><label>Mobile Number</label><span class="blank"></span></div>
      </div>
      <p>&#9744; I consent to receive recurring automated text messages at the number above. Message frequency varies. Message and data rates may apply. Consent is not a condition of registration or purchase. Reply STOP to opt out at any time, or HELP for help.</p>
      <p class="form-fineprint">For carrier compliance (A2P 10DLC), Operator retains signed consent on file for the duration of messaging plus applicable record-retention requirements.</p>
    `,
  },
  {
    id: 'auction-terms',
    code: 'FRM-07',
    title: 'Auction Terms Packet',
    roles: ['all'],
    summary: 'The terms every participant agrees to by registering or bidding.',
    legalReview: true,
    bodyHtml: `
      <p class="form-intro">This packet governs all participation in auctions conducted by <strong>[OPERATOR LEGAL NAME]</strong> ("Operator"). By registering, bidding, accessing, or listing auction inventory, you agree to all terms contained herein.</p>
      <ol class="form-clauses">
        <li><strong>Eligibility.</strong> Bidders must be at least 18 years old and complete registration before placing any bid.</li>
        <li><strong>Bidding Deposit.</strong> A refundable bidding deposit is required and will be authorized on Bidder's payment method before Bidder may place any bid.</li>
        <li><strong>Buyer's Premium.</strong> A 15% buyer's premium is added to the winning bid and is payable by the winning bidder in addition to the bid amount.</li>
        <li><strong>Sales Tax.</strong> Applicable sales tax is calculated on the winning bid plus buyer's premium and collected at checkout.</li>
        <li><strong>As-Is Sale.</strong> All items are sold as-is, where-is. Operator makes no representations or warranties as to the condition, completeness, or value of any item.</li>
        <li><strong>No Reliance.</strong> Bidder acknowledges that Bidder is not relying on any statement, image, or description beyond Bidder's own judgment in placing a bid.</li>
        <li><strong>Payment.</strong> The winning bidder must complete payment as instructed at auction close. Failure to pay may result in forfeiture of the bidding deposit and suspension from future auctions.</li>
        <li><strong>Removal.</strong> The winning bidder must remove all purchased contents within the posted removal window. See the Buyer Pickup Release for full terms.</li>
        <li><strong>Deposits Generally.</strong> Deposits represent a reasonable estimate of damages in the event of default, including but not limited to relisting, cleanup, and lost auction value.</li>
        <li><strong>Limitation of Liability.</strong> Operator's total liability, if any, shall not exceed the total amount paid by Bidder.</li>
        <li><strong>Right to Refuse Service.</strong> Operator reserves the right to refuse service, deny access, or ban any participant at its sole discretion.</li>
        <li><strong>Time is of the Essence.</strong> Time is of the essence in all obligations, including payment and removal deadlines.</li>
        <li><strong>Dispute Resolution.</strong> Disputes are handled per Operator's published dispute policy. In any dispute arising from this Agreement, the prevailing party shall be entitled to reasonable attorney's fees and costs.</li>
        <li><strong>Assembly.</strong> This packet incorporates by reference the Bidder Registration Form, Seller Agreement, Buyer Pickup Release, and SMS Text Consent Form where applicable.</li>
      </ol>
      <h4>Agreement Acceptance</h4>
      <p>By signing below, I acknowledge that I have read, understood, and agree to all terms contained in this packet.</p>
    `,
  },
  {
    id: 'access-instructions',
    code: 'FRM-08',
    title: 'No-Contact Access Instruction Sheet',
    roles: ['bidder', 'seller', 'facility'],
    summary: 'How to use your access code during your scheduled window.',
    legalReview: false,
    bodyHtml: `
      <p class="form-intro">Your access code is valid only for your scheduled window. Follow these steps for contactless entry and exit.</p>
      <ol class="form-clauses">
        <li>Arrive at <span class="blank inline">[FACILITY ADDRESS]</span> any time during your access window: <span class="blank inline">____ to ____</span>.</li>
        <li>Locate your assigned unit at the facility.</li>
        <li>Enter your access code on the unit's keypad. Your code is personal to you and will not work outside your window.</li>
        <li>Cameras record all entry and exit activity for security and documentation purposes.</li>
        <li><strong>Sellers:</strong> do not place prohibited items in the unit — see the prohibited items list provided at intake.</li>
        <li><strong>Buyers:</strong> remove all purchased contents before your window closes. Leave the unit swept clean.</li>
        <li>If your code does not work, call <span class="blank inline">[OPERATOR PHONE]</span> — do not attempt to force entry.</li>
        <li>In case of fire or medical emergency, call 911 first, then notify Operator.</li>
        <li>No smoking or open flame anywhere on the premises.</li>
        <li>Your access code deactivates automatically at the end of your window.</li>
      </ol>
    `,
  },
];

function getFormsForRole(role) {
  return FORMS.filter((f) => f.roles.includes('all') || f.roles.includes(role));
}

function getForm(id) {
  return FORMS.find((f) => f.id === id);
}

function canAccess(form, role) {
  return form.roles.includes('all') || form.roles.includes(role);
}

module.exports = { FORMS, getFormsForRole, getForm, canAccess };
