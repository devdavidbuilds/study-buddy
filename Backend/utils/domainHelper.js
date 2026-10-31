/**
 * Course Domain Taxonomy and Normalization Helpers
 *
 * Categorizes and groups courses into structured high-level domains
 * for enhanced filtering and database-level sorting.
 */

const DOMAIN_DEFINITIONS = [
  {
    id: "Web Development",
    label: "Web Development",
    icon: "🌐",
    patterns: [
      /\bweb\b/i,
      /\bhtml\b/i,
      /\bcss\b/i,
      /\bjavascript\b/i,
      /\bjs\b/i,
      /\breact\b/i,
      /\bnode\b/i,
      /\bvue\b/i,
      /\bangular\b/i,
      /\bfrontend\b/i,
      /\bbackend\b/i,
      /\bfullstack\b/i,
      /\bwordpress\b/i,
      /\bphp\b/i,
      /\bapi\b/i,
    ],
  },
  {
    id: "Programming & CS",
    label: "Programming & CS",
    icon: "💻",
    patterns: [
      /\bprogram/i,
      /\bsoftware/i,
      /\balgorithm/i,
      /\bdata structure/i,
      /\bdsa\b/i,
      /\bc\+\+/i,
      /\bc programming\b/i,
      /\bjava\b/i,
      /\bpython\b/i,
      /\bcode\b/i,
      /\bcomputer science\b/i,
      /\boperating system/i,
      /\bdatabase/i,
      /\bsql\b/i,
      /\bnetwork/i,
      /\blinux\b/i,
    ],
  },
  {
    id: "Data Science & AI",
    label: "Data Science & AI",
    icon: "🤖",
    patterns: [
      /\bdata science\b/i,
      /\bmachine learning\b/i,
      /\bdeep learning\b/i,
      /\bartificial intelligence\b/i,
      /\bneural network/i,
      /\banalytics\b/i,
      /\bstatistics\b/i,
      /\bpandas\b/i,
      /\bnumpy\b/i,
      /\bbig data\b/i,
      /\bml\b/i,
      /\bai\b/i,
      /\bdata visualization\b/i,
    ],
  },
  {
    id: "Business & Finance",
    label: "Business & Finance",
    icon: "📈",
    patterns: [
      /\bfinance\b/i,
      /\bbusiness\b/i,
      /\baccounting\b/i,
      /\binvest/i,
      /\bbanking\b/i,
      /\btrading\b/i,
      /\bstock/i,
      /\beconomic/i,
      /\bmarketing\b/i,
      /\bgst\b/i,
      /\bforex\b/i,
      /\bfinancial\b/i,
      /\bexcel\b/i,
      /\bmanagement\b/i,
    ],
  },
  {
    id: "Design & Creative",
    label: "Design & Creative",
    icon: "🎨",
    patterns: [
      /\bgraphic\b/i,
      /\bdesign\b/i,
      /\bphotoshop\b/i,
      /\billustrator\b/i,
      /\bui\b/i,
      /\bux\b/i,
      /\blogo\b/i,
      /\btypography\b/i,
      /\bdrawing\b/i,
      /\bcreative\b/i,
      /\banimation\b/i,
      /\b3d\b/i,
      /\bfigma\b/i,
    ],
  },
  {
    id: "Music & Audio",
    label: "Music & Audio",
    icon: "🎵",
    patterns: [
      /\bmusic/i,
      /\binstrument/i,
      /\bguitar\b/i,
      /\bpiano\b/i,
      /\bvocal\b/i,
      /\bsound\b/i,
      /\baudio\b/i,
      /\bsong/i,
      /\bcomposer\b/i,
      /\bharmonica\b/i,
      /\bviolin\b/i,
      /\bdrum/i,
    ],
  },
  {
    id: "Engineering",
    label: "Engineering",
    patterns: [
      /\bcircuit\b/i,
      /\belectronics\b/i,
      /\bmechanical\b/i,
      /\bcivil\b/i,
      /\bengineering\b/i,
      /\brobotics\b/i,
      /\belectric\b/i,
      /\bmanufacturing\b/i,
      /\bstructural\b/i,
    ],
  },
];

/**
 * Determines domain based on category, department, and course title.
 */
const determineDomain = (category = "", department = "", courseName = "") => {
  const combined = `${category} ${department} ${courseName}`.trim();

  // 1. Direct match with domain definitions
  for (const domain of DOMAIN_DEFINITIONS) {
    if (domain.patterns.some((re) => re.test(combined))) {
      return domain.id;
    }
  }

  // 2. Department fallback
  const dept = String(department || "").toUpperCase();
  if (dept === "CSE" || dept === "IT") return "Programming & CS";
  if (["ECE", "EEE", "MECH", "CIVIL"].includes(dept)) return "Engineering";

  // 3. Fallback to existing category or General Studies
  const cleanCat = String(category || "").trim();
  return cleanCat && cleanCat !== "All" ? cleanCat : "General Studies";
};

module.exports = {
  DOMAIN_DEFINITIONS,
  determineDomain,
};
