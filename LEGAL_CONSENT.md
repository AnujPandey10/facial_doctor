# Legal & Consent Documentation

## Consent Text (Version 1.0)

**Effective Date**: January 2024

### Full Consent Agreement

By clicking "Accept & Continue", you acknowledge and agree to the following:

#### 1. Not Medical Advice

This service provides **cosmetic skin analysis only** and is not a medical diagnostic tool. The analysis and recommendations are for informational and cosmetic purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment.

**You should consult a licensed dermatologist or healthcare provider for:**
- Medical skin conditions
- Persistent skin issues
- Suspicious moles or lesions
- Skin infections or rashes
- Any condition requiring medical treatment

#### 2. Image Upload & Processing

- Your facial image will be **uploaded to cloud servers** for processing
- Images are sent to **OpenAI (GPT-4 Vision API)** or similar third-party AI service providers
- Images may be **temporarily stored** for quality assurance and service improvement
- We implement industry-standard encryption and security measures
- Third-party providers have their own privacy policies (see links below)

#### 3. Data Usage

- **Analysis Results**: Stored in our database and linked to your anonymous user ID
- **Images**: May be retained for up to 30 days for quality assurance
- **Deletion Rights**: You may request deletion of your data at any time via settings
- **No Sale of Data**: We do not sell your personal information to third parties
- **Research**: Anonymized, aggregated data may be used for research and service improvement

#### 4. Affiliate Relationships

- Product recommendations may include **affiliate links**
- We may earn a commission if you purchase recommended products
- **No obligation**: You are not required to purchase anything
- Recommendations are based on skin analysis results and ingredient efficacy
- We do not endorse specific brands and do not guarantee product results

#### 5. Age Requirement

You must be **18 years or older** to use this service. By accepting, you confirm that you meet this age requirement.

#### 6. Accuracy & Limitations

- AI analysis may not be 100% accurate
- Results depend on image quality, lighting, and other factors
- False positives and false negatives may occur
- Recommendations are general and may not suit your specific skin needs
- Individual results with products may vary

#### 7. Liability

We are not liable for:
- Adverse reactions to recommended products
- Inaccurate AI analysis results
- Decisions made based on recommendations
- Third-party product quality or availability

#### 8. Privacy & Security

- Your data is transmitted using TLS/HTTPS encryption
- We follow SOC 2 and industry-standard security practices
- No guarantees of absolute security can be made
- See our full Privacy Policy for details

#### 9. Changes to Terms

We may update this consent agreement. Continued use of the service constitutes acceptance of updated terms.

---

### Third-Party Privacy Policies

When using our service, your data may be processed by:

- **OpenAI**: https://openai.com/policies/privacy-policy
- **AWS** (hosting): https://aws.amazon.com/privacy/
- [Add other service providers]

---

### Consent Checkbox Text (Short Version)

```
☐ I have read and understood the above information. I consent to uploading 
  my image for cosmetic skin analysis and understand this is not medical 
  advice. I am 18 years or older.
```

---

## Privacy Policy (Summary)

### What We Collect

1. **Images**: Facial photos you upload
2. **Analysis Results**: AI-generated skin analysis
3. **Usage Data**: Pages visited, features used
4. **Device Info**: Browser type, IP address (for security)
5. **Optional**: Email (if you create an account)

### How We Use It

- Provide skin analysis service
- Generate product recommendations
- Improve AI accuracy
- Prevent fraud and abuse
- Respond to support requests

### Who We Share With

- **AI Service Providers**: OpenAI for analysis
- **Cloud Hosting**: AWS for infrastructure
- **Analytics**: Google Analytics (anonymized)
- **Payment Processors**: If you purchase directly
- **Legal Requirements**: When required by law

### Your Rights

- **Access**: Request a copy of your data
- **Deletion**: Request deletion of your data
- **Correction**: Request correction of inaccurate data
- **Opt-out**: Stop using the service at any time
- **Data Portability**: Export your data in standard format

### Data Retention

- **Images**: 30 days (then deleted)
- **Analysis Results**: Retained until you request deletion
- **Account Data**: Retained until account closure + 90 days

### Security Measures

- TLS/HTTPS encryption in transit
- Encrypted database storage
- Regular security audits
- Access controls and authentication
- Automatic session timeouts

### Children's Privacy

We do not knowingly collect data from anyone under 18. If we discover such data, it will be promptly deleted.

### International Users

Data may be processed in the United States. By using our service, you consent to this transfer.

### Contact

For privacy questions or data requests:
- Email: privacy@yourdomain.com
- Address: [Your Business Address]

---

## Medical Disclaimer (Displayed Throughout App)

### Standard Disclaimer

```
⚠️ DISCLAIMER: This is a cosmetic analysis tool and does NOT diagnose 
medical conditions or replace professional dermatological advice. For 
medical concerns, please consult a licensed dermatologist.
```

### Detailed Disclaimer (Terms of Service)

**This Service Does Not:**

1. Diagnose skin diseases (melanoma, skin cancer, eczema, psoriasis, etc.)
2. Provide medical treatment recommendations
3. Prescribe medications or treatments
4. Replace examination by a licensed medical professional
5. Claim to cure, treat, or prevent any disease
6. Provide FDA-approved medical device functionality

**This Service Does:**

1. Analyze cosmetic skin concerns (acne, dark spots, fine lines, etc.)
2. Suggest cosmetic skincare products based on concerns
3. Provide ingredient information and research summaries
4. Help you make informed cosmetic purchasing decisions

**When to See a Doctor:**

- Suspicious moles or lesions
- Rapidly changing skin features
- Persistent rashes or irritation
- Signs of skin infection
- Severe acne requiring prescription treatment
- Any concern that worries you

---

## Regulatory Compliance

### United States

#### FDA Classification
This service is **NOT** classified as a medical device under FDA regulations because:
- It provides cosmetic analysis only
- Does not diagnose disease
- Does not claim to treat medical conditions
- Recommendations are for over-the-counter cosmetic products only

#### FTC Compliance
- Clear disclosure of affiliate relationships
- Honest representation of capabilities
- No unsubstantiated health claims
- Prominent disclaimers

### European Union (GDPR)

#### Legal Basis for Processing
- **Consent**: Primary legal basis (Article 6(1)(a))
- **Legitimate Interests**: Service improvement (Article 6(1)(f))

#### Data Subject Rights
- Right to access (Article 15)
- Right to rectification (Article 16)
- Right to erasure (Article 17)
- Right to data portability (Article 20)
- Right to object (Article 21)

#### Implementation Checklist
- ✅ Explicit consent mechanism
- ✅ Clear privacy notice
- ✅ Data minimization
- ✅ Storage limitation (30-day image retention)
- ✅ Security measures
- ⚠️ TODO: DPO appointment (if required)
- ⚠️ TODO: Data Processing Agreement with OpenAI

### California (CCPA/CPRA)

#### Consumer Rights
- Right to know what data is collected
- Right to delete personal information
- Right to opt-out of sale (N/A - we don't sell data)
- Right to non-discrimination

#### "Do Not Sell My Personal Information"
Not applicable as we do not sell personal information.

---

## Recommended Implementation

### Before First Use
1. Display consent modal (blocking)
2. Require checkbox acknowledgment
3. Log consent with timestamp and IP
4. Provide "Learn More" link to full terms

### During Use
1. Display disclaimer on results page
2. Include "Not medical advice" notice
3. Provide "Delete My Data" option in settings
4. Show affiliate disclosure on product cards

### Email Notifications (if implemented)
Include footer:
```
This is not medical advice. Results are for cosmetic purposes only.
Consult a dermatologist for medical concerns.
```

---

## Legal Review Checklist

Before launch, have legal counsel review:

- [ ] Consent agreement text
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Medical disclaimers
- [ ] Affiliate disclosures
- [ ] Data processing agreements with vendors
- [ ] GDPR compliance (if serving EU)
- [ ] CCPA compliance (if serving California)
- [ ] Insurance requirements (E&O, cyber liability)

---

## Updates & Versioning

### Version History

**v1.0** - January 2024
- Initial consent agreement
- OpenAI processing disclosure
- Affiliate link disclosure
- Medical disclaimer
- GDPR rights statement

### When to Update

Update consent when:
- Adding new data processing
- Changing AI provider
- Adding new features affecting privacy
- Regulatory requirements change
- Legal counsel recommends updates

### Notification Process

When consent terms change:
1. Notify existing users via email (if collected)
2. Show updated consent modal on next login
3. Require re-acceptance for continued use
4. Provide 30-day notice for material changes

---

**Last Updated**: January 2024
**Consent Version**: 1.0

