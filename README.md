# Squares.vote

An open-source framework for mapping political positions across key policy dimensions.

🌐 **[Live Site](https://squares.vote)** | 🔌 **[Embed Demo](https://squares.vote/embed)** | 📖 **[TAME-R Framework](#tame-r-framework)**

---

## 🚀 Quick Start for Developers

### Embed Widget

Add Squares to your website in 2 minutes:

```html
<div id="squares-widget"></div>
<script src="https://squares.vote/embed.js"></script>
<script>
  SquaresEmbed.init({
    elementId: 'squares-widget',
    variant: 'card',
    maxWidth: '600px',
    align: 'center'
  });
</script>
```

See [full embedding documentation](#embedding) below.

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

Add Squares to your website with a simple embed. Choose from two options:

### Option 1: Card Embed (Recommended)

Self-contained card with explanation and example. Best for first-time visitors.

```html
<!-- Add this where you want the card to appear -->
<div id="squares-widget"></div>

<!-- Add this before closing </body> tag -->
<script src="https://squares.vote/embed.js"></script>
<script>
  SquaresEmbed.init({
    elementId: 'squares-widget',
    variant: 'card',
    buttonText: 'Map Your Squares',
    // Optional customization:
    align: 'center',        // 'left', 'center', 'right'
    maxWidth: '600px',      // e.g., '600px', '100%'
    primaryColor: '#4285f4', // Custom button color
    borderRadius: '12px',   // Custom border radius
    shadow: true            // Show/hide shadow
  });
</script>
```

### Option 2: Button Only

Minimal embed for sites where context is already provided.

```html
<!-- Add this where you want the button to appear -->
<div id="squares-widget"></div>

<!-- Add this before closing </body> tag -->
<script src="https://squares.vote/embed.js"></script>
<script>
  SquaresEmbed.init({
    elementId: 'squares-widget',
    variant: 'button',
    buttonText: 'Map Your Squares'
  });
</script>
```

### Customization Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `elementId` | string | required | ID of container element |
| `variant` | string | `'card'` | `'card'` or `'button'` |
| `buttonText` | string | `'Map Your Squares'` | Custom button text |
| `align` | string | `'center'` | `'left'`, `'center'`, or `'right'` |
| `maxWidth` | string | `null` | Max width (e.g., `'600px'`) |
| `primaryColor` | string | `null` | Custom button color (hex) |
| `borderRadius` | string | `null` | Custom border radius |
| `shadow` | boolean | `true` | Show/hide shadow |

### Features

- ✅ **Self-contained:** No dependencies, works anywhere
- ✅ **Responsive:** Works on all screen sizes
- ✅ **Fast:** Lightweight and optimized
- ✅ **Customizable:** Full styling control
- ✅ **Isolated:** Shadow DOM prevents conflicts
- ✅ **Privacy-focused:** No tracking or data collection

See the [live embed demo](https://squares.vote/embed) for interactive examples.

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
* 🟪 partial birth abortion
* 🟦 limit after viability
* 🟩 limit after third trimester
* 🟨 limit after second trimester
* 🟧 limit after first trimester
* 🟥 limit after heartbeat detection
* ⬛️ no exceptions allowed

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

Rights (civil liberties, e.g. LGBTQ+ rights)
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
* 🟪 **Partial birth abortion** - Legalize partial birth abortion
* 🟦 **Limit after viability** - Legalize abortion after viability, but before birth
* 🟩 **Limit after third trimester** - Legalize abortion after third trimester, but before birth
* 🟨 **Limit after second trimester** - Legalize abortion after second trimester, but before birth
* 🟧 **Limit after first trimester** - Legalize abortion after first trimester, but before birth
* 🟥 **Limit after heartbeat detection** - Legalize abortion after heartbeat detection, but before birth
* ⬛️ **No exceptions allowed** - No abortion unless to save mother's life

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

**Rights (Civil Liberties)**
* 🟪 **Full legal equality** - Marriage equality, adoption rights, anti-discrimination laws in all sectors
* 🟦 **Protections with few limits** - Legal recognition and protections, some religious exemptions
* 🟩 **Protections with some limits** - Anti-discrimination in public sector, religious freedom in private sector
* 🟨 **Tolerance without endorsement** - Legal to exist, no special protections or recognition
* 🟧 **Traditional definitions only** - Marriage/family defined traditionally, no legal accommodations
* 🟥 **No legal recognition** - No legal status for same-sex relationships or gender identity changes
* ⬛️ **Criminalization** - Laws prohibiting LGBTQ+ expression or relationships

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
- Abortion: 🟩 Limit after third trimester
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
- Abortion: 🟩 Limit after third trimester
- Migration: 🟨 Current restrictions
- Economics: 🟦 Minimal regulation
- Rights: 🟦 Protections with few limits

**Eleanor Roosevelt (1884-1962)** 🟩🟨🟦🟧🟪
- Trade: 🟩 Selective trade agreements
- Abortion: 🟨 Limit after second trimester
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
- Abortion: 🟩 Limit after third trimester
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
- Abortion: 🟦 Limit after viability
- Migration: 🟦 Easy pathways to citizenship
- Economics: 🟧 Strong social programs
- Rights: 🟪 Full legal equality

**Donald Trump (b. 1946)** 🟥🟩🟥🟦🟨
- Trade: 🟥 Heavy tariffs
- Abortion: 🟩 Limit after third trimester
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
