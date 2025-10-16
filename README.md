# squares.vote

An open-source framework for mapping political positions across key policy dimensions.

🌐 **[Live Site](https://squares.vote)** | 🔌 **[Embed Demo](https://squares.vote/developer)** | 📚 **[Embed Guide](./DEVELOPER.md)** | 📖 **[TAME-R Framework](#tame-r-framework)**

---

## 🚀 Quick Start for Developers

### Installation

```bash
npm install @squares-app/react
```

### Usage

```tsx
import { SquaresEmbedReact } from '@squares-app/react';

function App() {
  return <SquaresEmbedReact variant="card" maxWidth="600px" />;
}
```

📚 **[Complete Documentation →](./DEVELOPER.md)**

### Local Development

```bash
git clone https://github.com/seanbhart/squares.git
cd squares
npm install
npm run dev
```

Visit `http://localhost:3000` to see the app.

---

## Embedding

Add Squares to your website with a simple embed.

### React Component (Recommended for React Apps)

Install the official React component:

```bash
npm install @squares-app/react
```

**Basic Usage:**

```tsx
import { SquaresEmbedReact } from '@squares-app/react';

function MyComponent() {
  return <SquaresEmbedReact variant="card" />;
}
```

**With Customization:**

```tsx
<SquaresEmbedReact
  variant="card"
  buttonText="Take the Quiz"
  align="center"
  maxWidth="600px"
  primaryColor="#ff6b6b"
  borderRadius="16px"
  shadow={true}
/>
```

**Features:**
- ✅ **Proper lifecycle management** - Uses `useRef` and `useEffect`
- ✅ **No DOM conflicts** - Integrates cleanly with React's rendering
- ✅ **TypeScript support** - Full type safety
- ✅ **Auto-cleanup** - Automatically destroys widget on unmount
- ✅ **SSR-safe** - Works with Next.js and other SSR frameworks
- ✅ **Responsive** - Works on all screen sizes
- ✅ **Privacy-focused** - No tracking or data collection

See the [complete documentation](./DEVELOPER.md) for all props and examples.

---

## Development

### Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth)
- **Styling:** CSS Modules
- **Deployment:** Vercel

### Project Structure

```
squares/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel
│   ├── embed/             # Embed demo page
│   └── page.tsx           # Main application
├── components/            # React components
│   └── embed/            # Embeddable widget components
├── lib/                   # Utilities and API clients
│   ├── admin/            # Admin API functions
│   ├── api/              # Public API functions
│   └── supabase/         # Supabase client
└── supabase/             # Database migrations and functions
    └── migrations/       # SQL migration files
```

### Admin Panel

Access the admin panel at `/admin` (requires admin role):
- Manage figures and their timelines
- View analysis history
- Manage user roles
- Edit AI prompts

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Guidelines

1. Follow the existing code style
2. Write clear commit messages
3. Add tests for new features
4. Update documentation as needed

---

## TAME-R Framework

The Squares typology uses a seven-point spectrum for each issue, allowing individuals to identify their position on multiple policy dimensions. Each color represents a distinct stance, creating a multi-dimensional political profile.

### Policy Dimensions

The **TAME-R** framework measures positions across five core policy areas:

- **T**rade
- **A**bortion  
- **M**igration / Immigration
- **E**conomics
- **R**ights

### The Five Dimensions Explained

#### **Trade Policy**

**Common Disputes:**
- Tariffs on imported goods (steel, automobiles, consumer electronics)
- Trade agreements (NAFTA/USMCA, TPP, bilateral deals)
- Intellectual property protections and enforcement
- Currency manipulation and fair trade practices
- Offshoring of manufacturing jobs vs. consumer prices
- Agricultural subsidies and food security
- National security concerns vs. economic efficiency

**Historical Evolution in the United States:**

The U.S. trade policy has oscillated between protectionism and free trade throughout its history. The early republic (1789-1816) relied heavily on tariffs as a revenue source and to protect nascent industries. The **Tariff of 1816** marked the beginning of the "American System" championed by Henry Clay, which used protective tariffs to fund internal improvements.

The late 19th century saw high protective tariffs like the **McKinley Tariff (1890)** and **Dingley Tariff (1897)**, reflecting Republican dominance and industrial interests. This era prioritized domestic manufacturing over international commerce.

The **Smoot-Hawley Tariff Act (1930)** raised tariffs to historic highs during the Great Depression, widely considered to have worsened the economic crisis by triggering retaliatory tariffs worldwide. This disaster led to a policy reversal.

Post-WWII, the U.S. championed free trade through institutions like GATT (1947) and later the **WTO (1995)**. The **Kennedy Round (1964-67)** and **Tokyo Round (1973-79)** progressively reduced tariffs. **NAFTA (1994)** eliminated most tariffs between the U.S., Canada, and Mexico, representing the peak of the free trade consensus.

The 21st century has seen a backlash against globalization. The 2008 financial crisis, manufacturing job losses, and wage stagnation fueled skepticism. The Trump administration (2017-2021) imposed tariffs on steel, aluminum, and Chinese goods, marking a return to protectionist rhetoric. The **USMCA (2020)** replaced NAFTA with modest revisions. Current debates center on economic security, supply chain resilience (especially post-COVID), and competition with China.

#### **Abortion Rights**

**Common Disputes:**
- Gestational limits on legal abortion
- Parental notification/consent for minors
- Waiting periods and mandatory counseling
- Public funding for abortion services
- Clinic regulations and TRAP laws (Targeted Regulation of Abortion Providers)
- Medication abortion access (mifepristone)
- Religious/conscience exemptions for healthcare providers
- Fetal personhood and "heartbeat bills"
- Travel restrictions and interstate legal conflicts

**Historical Evolution in the United States:**

Abortion was largely unregulated in early America until "quickening" (fetal movement, ~4-5 months). The mid-19th century saw the **American Medical Association (1857)** campaign to criminalize abortion, partly to professionalize medicine and eliminate midwife competitors. By 1900, nearly all states had banned abortion except to save the mother's life.

The mid-20th century saw growing advocacy for reform. The **Model Penal Code (1959)** recommended allowing abortion in cases of rape, incest, fetal defects, or threats to maternal health. Several states liberalized laws in the 1960s-70s.

**Roe v. Wade (1973)** established a constitutional right to abortion, creating a trimester framework that balanced fetal viability with women's autonomy. The decision instantly made abortion a central political dividing line. **Planned Parenthood v. Casey (1992)** replaced the trimester framework with "undue burden" analysis, allowing more state restrictions while affirming the core right.

The decades following saw incremental restrictions: waiting periods, parental consent laws, bans on public funding (**Hyde Amendment, 1976**), and targeted regulation of clinics. "Heartbeat bills" emerged in the 2010s, banning abortion once cardiac activity is detected (~6 weeks, often before pregnancy awareness).

**Dobbs v. Jackson (2022)** overturned Roe, returning abortion regulation to states. This has created a patchwork of laws, from total bans in ~14 states to protected access in others. Interstate travel for abortion, medication abortion pills, and enforcement mechanisms (civil lawsuits, criminal penalties) dominate current debates. Ballot initiatives have become a key battleground, with voters in red states like Kansas and Ohio rejecting abortion restrictions.

#### **Migration / Immigration**

**Common Disputes:**
- Border security and physical barriers
- Asylum policies and refugee admissions
- Pathways to citizenship for undocumented immigrants
- DACA (Deferred Action for Childhood Arrivals) and "Dreamers"
- Visa caps and country quotas
- Family reunification vs. merit-based immigration
- Workplace enforcement and E-Verify
- Sanctuary cities and federal-state cooperation
- Temporary worker programs (H-1B, H-2A, H-2B)
- Immigration detention and family separation

**Historical Evolution in the United States:**

Early America had essentially open borders, seeking to populate a vast territory. The **Naturalization Act of 1790** restricted citizenship to "free white persons," but immigration itself was unrestricted.

The first significant restrictions came with the **Chinese Exclusion Act (1882)**, banning Chinese laborers—the first law to exclude an ethnic group. The **Immigration Act of 1917** imposed literacy tests and barred immigration from most of Asia (the "Asiatic Barred Zone").

The **National Origins Act (1924)** established strict quotas favoring Northern/Western Europeans, severely limiting Southern/Eastern Europeans and Asians. This system lasted four decades, reflecting nativist sentiment and eugenics ideology.

The **Immigration and Nationality Act of 1965** abolished national-origin quotas, prioritizing family reunification and skilled workers. This dramatically increased immigration from Asia, Latin America, and Africa, reshaping American demographics.

The late 20th century saw growing illegal immigration, particularly across the southern border. **IRCA (Immigration Reform and Control Act, 1986)** granted amnesty to ~3 million undocumented immigrants while increasing border enforcement and employer sanctions—a compromise that pleased neither side.

Post-9/11 brought security-focused reforms. The **Department of Homeland Security** (2002) consolidated immigration enforcement. Comprehensive immigration reform efforts failed repeatedly (2007, 2013), leaving the system gridlocked.

**DACA (2012)** provided temporary protection for undocumented immigrants brought as children. The Trump administration (2017-2021) pursued restrictive policies: family separation, asylum limitations, border wall construction, Muslim-majority country travel bans, and increased enforcement. The Biden administration reversed many policies but has struggled with record border crossings and political pressure.

Current debates center on border security technology vs. physical barriers, humanitarian treatment of asylum seekers, pathways to citizenship for long-term residents, and balancing economic needs with cultural concerns.

#### **Economic Policy**

**Common Disputes:**
- Tax rates and progressivity
- Social safety net programs (Social Security, Medicare, Medicaid)
- Healthcare system (single-payer vs. market-based)
- Minimum wage and labor protections
- Corporate regulation and antitrust enforcement
- Government spending and deficit levels
- Public vs. private ownership of utilities and services
- Banking regulation and financial system oversight
- Environmental regulations and carbon pricing
- Industrial policy and government subsidies

**Historical Evolution in the United States:**

The early republic operated with minimal federal economic intervention. The **Second Bank of the United States** (1816-1836) was controversial, opposed by Jacksonian Democrats as elitist.

The **Gilded Age (1870s-1900)** saw laissez-faire capitalism dominate, with minimal regulation of monopolies, working conditions, or consumer protections. Inequality soared, labor unrest grew, and political corruption flourished.

The **Progressive Era (1890s-1920s)** brought the first major federal interventions: antitrust enforcement (**Sherman Act, 1890**), food and drug safety (**Pure Food and Drug Act, 1906**), labor protections, and the **Federal Reserve** (1913). Income tax was established (**16th Amendment, 1913**), enabling redistributive policies.

The **New Deal (1933-1938)** fundamentally transformed the federal role. FDR's response to the Great Depression created **Social Security (1935)**, unemployment insurance, banking regulation (**Glass-Steagall Act**), agricultural price supports, and massive public works programs. Labor gained collective bargaining rights (**Wagner Act, 1935**). Government spending as a percentage of GDP surged.

Post-WWII **Keynesian consensus** dominated through the 1960s, with both parties accepting government stabilization of the economy, progressive taxation, and a welfare state. **Medicare and Medicaid (1965)** expanded the social safety net.

The 1970s **stagflation crisis** (high inflation + unemployment) discredited Keynesian orthodoxy. **Reagan Revolution (1981-1989)** ushered in supply-side economics: tax cuts (especially top rates), deregulation (airlines, telecommunications, banking), reduced social spending, and anti-union policies. This "Washington Consensus" emphasized markets over government.

The **2008 Financial Crisis** revealed the dangers of deregulation. **TARP bailouts** and the **Affordable Care Act (2010)** represented government intervention, but broader progressive reforms stalled. Inequality continued rising.

Current debates reflect populist skepticism of both unfettered capitalism and big government. Issues include: wealth concentration, student debt, healthcare access, gig economy labor protections, infrastructure investment, and industrial policy to compete with China. Both parties have moved away from pure free-market orthodoxy, with Republicans embracing economic nationalism and Democrats supporting industrial policy and expanded social programs.

#### **Civil Rights (Equal Treatment & Liberties)**

**Current Focus: LGBTQ+ Rights**

The Rights dimension measures positions on civil liberties and equal treatment under the law. While the current frontier of this debate centers on LGBTQ+ rights, the category has historically encompassed many marginalized groups seeking legal equality and protection from discrimination.

**Current Common Disputes (LGBTQ+ Rights):**
- Marriage equality and relationship recognition
- Adoption and parental rights
- Anti-discrimination protections (employment, housing, public accommodations)
- Religious exemptions and conscience clauses
- Transgender rights (healthcare, sports, restrooms, identification documents)
- Conversion therapy and minors' access to gender-affirming care
- Sex education and parental rights in schools
- Military service policies
- Expression and "compelled speech" debates

**Historical Topics in This Category:**

If this assessment had been given in earlier periods of U.S. history, the Rights dimension would have focused on:

**1790s-1860s:**
- Slavery and abolition
- Free Black rights in Northern states
- Native American sovereignty and citizenship
- Religious freedom (Catholic, Jewish, Quaker rights)
- Women's property rights

**1860s-1950s:**
- Reconstruction and Black citizenship (13th, 14th, 15th Amendments)
- Segregation ("separate but equal" vs. integration)
- Lynching and anti-lynching legislation
- Asian exclusion and Japanese internment
- Women's suffrage and legal status
- Native American citizenship and land rights

**1950s-1980s:**
- School desegregation
- Voting rights and poll taxes
- Interracial marriage bans
- Fair housing and employment discrimination
- Immigration and naturalization (national origin)
- Disability rights and accommodations
- Women's equality (ERA, Title IX, workplace rights)

**1980s-2000s:**
- Affirmative action and race-conscious policies
- Criminal justice and mass incarceration
- Immigration status and "Dreamers"
- Religious accommodation (Muslim rights post-9/11)
- Same-sex relationship recognition (beginning of current LGBTQ+ focus)

**2000s-Present:**
- LGBTQ+ rights (marriage, adoption, anti-discrimination)
- Transgender rights (the newest frontier)
- Racial justice and police reform
- Voting access and voter ID laws
- Religious liberty vs. anti-discrimination
- Disability access and inclusion

**Why LGBTQ+ Rights Are the Current Focus:**

LGBTQ+ rights represent the most active civil rights debate in contemporary American politics, with rapidly evolving laws, significant regional variation, and sharp partisan divides. Other civil rights issues (racial equality, disability rights, women's rights) remain important but have achieved more settled legal frameworks, even as implementation and enforcement continue to be debated.

The seven-point spectrum from "full legal equality" to "criminalization" can be applied to any marginalized group's civil rights: it would have worked equally well for measuring positions on racial segregation in the 1950s, women's suffrage in the 1910s, or religious liberty in the 1790s. The specific group changes with the era, but the fundamental question—how should the law treat those who differ from the majority?—remains constant.

**Important: This Dimension Is Unique**

Unlike the other four TAME-R dimensions (Trade, Abortion, Migration, Economics), the Rights spectrum does NOT measure a simple increase or decrease in government intervention. Both ends of this spectrum require active government enforcement:

- **🟪 Full legal equality** → Government enforces laws that **prevent** the enforcement of social roles (anti-discrimination protections)
- **⬛️ Criminalization** → Government enforces laws that **prescribe** specific social roles (criminal penalties, legal hierarchies)

The difference is not *how much* the government intervenes, but *what kind of laws* it enforces:

- **One end (🟪)**: Laws that prevent role enforcement → "You cannot discriminate based on X, you cannot deny services based on Y, you cannot restrict opportunities based on Z"
- **Other end (⬛️)**: Laws that enforce specific roles → "Only these groups can marry, only these people have these rights, these behaviors are criminal"

**In the other dimensions**, the spectrum moves from less to more government intervention:
- **Trade**: Free trade (minimal intervention) → Closed economy (maximum intervention)
- **Economics**: Pure free market (minimal intervention) → Full state control (maximum intervention)
- **Abortion/Migration**: More permissive (less restriction) → Total restriction (maximum enforcement)

**But in Rights**, both ends require equal government power (police, courts, legislation). The question is:
- Does the state use that power to **prescribe social roles and hierarchies**?
- Or does it use that power to **prevent others from enforcing such roles**?

This makes Rights debates fundamentally about **what the law should protect**: traditional social structures or individual autonomy from those structures. Both require active state enforcement; they just enforce opposite visions of society.

**Historical Evolution of LGBTQ+ Rights in the United States:**

LGBTQ+ issues were almost entirely invisible in early American political discourse. Homosexuality was criminalized through sodomy laws inherited from British common law, but rarely prosecuted until the 20th century.

The **McCarthy era (1950s)** saw the "Lavender Scare" paralleling the Red Scare, with gay and lesbian federal employees purged as security risks. This intensified persecution but also sparked early organizing.

The **Stonewall Riots (1969)** in New York City marked a turning point, galvanizing the gay liberation movement. Early activism focused on decriminalization and anti-discrimination protections, making limited progress.

The **AIDS crisis (1980s-1990s)** devastated the gay community but also increased visibility and mobilization. Government indifference, especially early in the Reagan administration, radicalized activists and built political infrastructure.

**"Don't Ask, Don't Tell" (1993)** represented a compromise: LGBTQ+ people could serve in the military if they remained closeted. While framed as progressive at the time, it institutionalized discrimination.

The **Defense of Marriage Act (DOMA, 1996)** defined marriage as between one man and one woman for federal purposes and allowed states to refuse recognition of same-sex marriages. It passed with bipartisan support, reflecting the political consensus of the era.

The 2000s saw accelerating change. **Massachusetts (2004)** became the first state to legalize same-sex marriage. Public opinion shifted rapidly, especially among younger Americans. **Don't Ask, Don't Tell was repealed (2010)**.

**United States v. Windsor (2013)** struck down DOMA's federal marriage ban. **Obergefell v. Hodges (2015)** established nationwide marriage equality, a watershed moment achieved in just over a decade of rapid social change.

Transgender rights emerged as the new frontier. **Bathroom bills** sparked controversy in the mid-2010s. The Trump administration reversed Obama-era protections, then the Biden administration restored and expanded them. **Bostock v. Clayton County (2020)** interpreted federal employment discrimination law to cover sexual orientation and gender identity.

Current debates center on transgender participation in youth sports, gender-affirming medical care for minors, parental rights in education, religious exemptions, and drag performance restrictions. Some conservative states have passed laws restricting transgender rights, while progressive states have enacted protections. The **Respect for Marriage Act (2022)** codified same-sex and interracial marriage recognition in federal law, reflecting both progress and ongoing vulnerability.

The trajectory has been toward expanded rights and protections, but with significant backlash and geographic variation. The speed of change has been unprecedented in American civil rights history.

---

### Position Spectrums

Trade
* 🟪 free trade
* 🟦 minimal tariffs
* 🟩 selective trade agreements
* 🟨 balanced tariffs
* 🟧 strategic protections
* 🟥 heavy tariffs
* ⬛️ closed economy

Abortion
* 🟪 no gestational limit
* 🟦 limit after second trimester
* 🟩 limit after viability
* 🟨 limit after 15 weeks
* 🟧 limit after first trimester
* 🟥 limit after heartbeat detection
* ⬛️ total ban

Migration / Immigration
* 🟪 open borders
* 🟦 easy pathways to citizenship
* 🟩 expanded quotas
* 🟨 current restrictions
* 🟧 reduced quotas
* 🟥 strict limits only
* ⬛️ no immigration

Economics
* 🟪 pure free market
* 🟦 minimal regulation
* 🟩 market-based with safety net
* 🟨 balanced public-private
* 🟧 strong social programs
* 🟥 extensive public ownership
* ⬛️ full state control

Rights (civil liberties & equal treatment, currently focused on LGBTQ+ rights)
* 🟪 full legal equality
* 🟦 protections with few limits
* 🟩 protections with some limits
* 🟨 tolerance without endorsement
* 🟧 traditional definitions only
* 🟥 no legal recognition
* ⬛️ criminalization

### Verbose Examples

**Trade Policy**
* 🟪 **Free trade** - Eliminate tariffs, join multilateral agreements, minimal barriers
* 🟦 **Minimal tariffs** - Low tariffs for most goods, focus on trade expansion
* 🟩 **Selective trade agreements** - Free trade with allies, targeted tariffs on competitors
* 🟨 **Balanced tariffs** - Moderate tariffs to protect some domestic industries
* 🟧 **Strategic protections** - Higher tariffs on key industries (steel, agriculture, tech)
* 🟥 **Heavy tariffs** - Broad tariffs to prioritize domestic production
* ⬛️ **Closed economy** - Import restrictions, self-sufficiency focus, limited trade

**Abortion**
* 🟪 **No gestational limit** - Legal abortion at any point in pregnancy
* 🟦 **Limit after second trimester** - Legal abortion up to ~28 weeks
* 🟩 **Limit after viability** - Legal abortion up to fetal viability (~24 weeks)
* 🟨 **Limit after 15 weeks** - Legal abortion up to 15 weeks gestation
* 🟧 **Limit after first trimester** - Legal abortion up to ~12-13 weeks
* 🟥 **Limit after heartbeat detection** - Legal abortion up to ~6 weeks (heartbeat detection)
* ⬛️ **Total ban** - No legal abortion except to save mother's life

**Migration / Immigration**
* 🟪 **Open borders** - No restrictions, visa-free travel, easy pathways to citizenship
* 🟦 **Easy pathways to citizenship** - Visa requirements, naturalization process, easy citizenship
* 🟩 **Expanded quotas** - Higher immigration limits, family reunification, skilled migration
* 🟨 **Current restrictions** - Moderate immigration, selective visas, family reunification
* 🟧 **Reduced quotas** - Lower immigration limits, selective visas, family reunification
* 🟥 **Strict limits only** - Limited immigration, selective visas, family reunification
* ⬛️ **No immigration** - No immigration, no visas, no citizenship

**Economics**
* 🟪 **Pure free market** - Minimal government, privatize most services, no safety net
* 🟦 **Minimal regulation** - Low taxes, light regulation, basic safety net only
* 🟩 **Market-based with safety net** - Private economy with unemployment, healthcare subsidies
* 🟨 **Balanced public-private** - Mixed economy with public utilities and private markets
* 🟧 **Strong social programs** - Universal healthcare, education, significant welfare state
* 🟥 **Extensive public ownership** - Government owns key industries, strong redistribution
* ⬛️ **Full state control** - Central planning, most property/industry state-owned

**Rights (Civil Liberties & Equal Treatment)**

*Note: These examples focus on LGBTQ+ rights (the current frontier), but this spectrum has historically applied to all civil rights debates—from slavery to segregation to women's suffrage. The seven levels represent universal positions on how the law should treat marginalized groups.*

* 🟪 **Full legal equality** - Marriage equality, adoption rights, anti-discrimination laws in all sectors
* 🟦 **Protections with few limits** - Legal recognition and protections, some religious exemptions
* 🟩 **Protections with some limits** - Anti-discrimination in public sector, religious freedom in private sector
* 🟨 **Tolerance without endorsement** - Legal to exist, no special protections or recognition
* 🟧 **Traditional definitions only** - Marriage/family defined traditionally, no legal accommodations
* 🟥 **No legal recognition** - No legal status for same-sex relationships or gender identity changes
* ⬛️ **Criminalization** - Laws prohibiting LGBTQ+ expression or relationships

*Historical application examples: These same seven levels would describe positions on racial segregation (1950s), interracial marriage (1960s), women's suffrage (1910s), or religious freedom (1790s). The spectrum measures the fundamental tension between majority tradition and minority rights.*

### Personal Type Examples

**Franklin D. Roosevelt (1882-1945)** 🟧🟥🟧🟥🟨
- Trade: 🟧 Strategic protections
- Abortion: 🟥 Limit after heartbeat detection
- Migration: 🟧 Reduced quotas
- Economics: 🟥 Extensive public ownership
- Rights: 🟨 Tolerance without endorsement

**Ronald Reagan (1911-2004)** 🟦🟧🟩🟦🟨
- Trade: 🟦 Minimal tariffs
- Abortion: 🟧 Limit after first trimester
- Migration: 🟩 Expanded quotas
- Economics: 🟦 Minimal regulation
- Rights: 🟨 Tolerance without endorsement

**Margaret Thatcher (1925-2013)** 🟪🟩🟥🟦🟧
- Trade: 🟪 Free trade
- Abortion: 🟩 Limit after viability
- Migration: 🟥 Strict limits only
- Economics: 🟦 Minimal regulation
- Rights: 🟧 Traditional definitions only

**Martin Luther King Jr. (1929-1968)** 🟨🟥🟩🟧🟪
- Trade: 🟨 Balanced tariffs
- Abortion: 🟥 Limit after heartbeat detection
- Migration: 🟩 Expanded quotas
- Economics: 🟧 Strong social programs
- Rights: 🟪 Full legal equality

**Barry Goldwater (1909-1998)** 🟦🟩🟨🟦🟦
- Trade: 🟦 Minimal tariffs
- Abortion: 🟩 Limit after viability
- Migration: 🟨 Current restrictions
- Economics: 🟦 Minimal regulation
- Rights: 🟦 Protections with few limits

**Eleanor Roosevelt (1884-1962)** 🟩🟨🟦🟧🟪
- Trade: 🟩 Selective trade agreements
- Abortion: 🟨 Limit after 15 weeks
- Migration: 🟦 Easy pathways to citizenship
- Economics: 🟧 Strong social programs
- Rights: 🟪 Full legal equality

**John F. Kennedy (1917-1963)** 🟩🟥🟩🟧🟩
- Trade: 🟩 Selective trade agreements
- Abortion: 🟥 Limit after heartbeat detection
- Migration: 🟩 Expanded quotas
- Economics: 🟧 Strong social programs
- Rights: 🟩 Protections with some limits

**Lyndon B. Johnson (1908-1973)** 🟨🟥🟦🟥🟦
- Trade: 🟨 Balanced tariffs
- Abortion: 🟥 Limit after heartbeat detection
- Migration: 🟦 Easy pathways to citizenship
- Economics: 🟥 Extensive public ownership
- Rights: 🟦 Protections with few limits

**Richard Nixon (1913-1994)** 🟧🟥🟧🟨🟨
- Trade: 🟧 Strategic protections
- Abortion: 🟥 Limit after heartbeat detection
- Migration: 🟧 Reduced quotas
- Economics: 🟨 Balanced public-private
- Rights: 🟨 Tolerance without endorsement

**Gerald Ford (1913-2006)** 🟦🟧🟨🟩🟩
- Trade: 🟦 Minimal tariffs
- Abortion: 🟧 Limit after first trimester
- Migration: 🟨 Current restrictions
- Economics: 🟩 Market-based with safety net
- Rights: 🟩 Protections with some limits

**George H.W. Bush (1924-2018)** 🟦🟧🟨🟦🟨
- Trade: 🟦 Minimal tariffs
- Abortion: 🟧 Limit after first trimester
- Migration: 🟨 Current restrictions
- Economics: 🟦 Minimal regulation
- Rights: 🟨 Tolerance without endorsement

**Bill Clinton (b. 1946)** 🟦🟩🟩🟩🟩
- Trade: 🟦 Minimal tariffs
- Abortion: 🟩 Limit after viability
- Migration: 🟩 Expanded quotas
- Economics: 🟩 Market-based with safety net
- Rights: 🟩 Protections with some limits

**George W. Bush (b. 1946)** 🟦🟥🟨🟩🟨
- Trade: 🟦 Minimal tariffs
- Abortion: 🟥 Limit after heartbeat detection
- Migration: 🟨 Current restrictions
- Economics: 🟩 Market-based with safety net
- Rights: 🟨 Tolerance without endorsement

**Barack Obama (b. 1961)** 🟩🟦🟦🟧🟪
- Trade: 🟩 Selective trade agreements
- Abortion: 🟦 Limit after second trimester
- Migration: 🟦 Easy pathways to citizenship
- Economics: 🟧 Strong social programs
- Rights: 🟪 Full legal equality

**Donald Trump (b. 1946)** 🟥🟩🟥🟦🟨
- Trade: 🟥 Heavy tariffs
- Abortion: 🟩 Limit after viability
- Migration: 🟥 Strict limits only
- Economics: 🟦 Minimal regulation
- Rights: 🟨 Tolerance without endorsement

---

## License

MIT License - feel free to use this project for any purpose.

---

## Contact

- **Website:** [squares.vote](https://squares.vote)
- **GitHub:** [seanbhart/squares](https://github.com/seanbhart/squares)
- **Issues:** [GitHub Issues](https://github.com/seanbhart/squares/issues)
