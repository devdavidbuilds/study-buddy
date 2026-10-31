/**
 * Course Domain Taxonomy and Normalization Helpers
 *
 * Categorizes and groups courses into structured high-level domains
 * for enhanced filtering and database-level sorting.
 */

const DOMAIN_DEFINITIONS = [
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
      /\bdata analytics?\b/i,
      /\bstatistics\b/i,
      /\bpandas\b/i,
      /\bnumpy\b/i,
      /\bbig data\b/i,
      /\bml\b/i,
      /\bai\b/i,
      /\bdata visualization\b/i,
      /\bpredictive\b/i,
      /\btensorflow\b/i,
      /\bpytorch\b/i,
      /\bscikit\b/i,
      /\bquantitative\b/i,
      /\bdata analysis\b/i,
      /\bnlp\b/i,
      /\bcomputer vision\b/i,
    ],
  },
  {
    id: "Programming & CS",
    label: "Programming & CS",
    icon: "💻",
    patterns: [
      /\bprogram/i,
      /\bsoftware\b/i,
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
      /\bdatabase\b/i,
      /\bsql\b/i,
      /\bnetwork/i,
      /\blinux\b/i,
      /\bgit\b/i,
      /\bbackend\b/i,
      /\bc#\b/i,
      /\brust\b/i,
      /\bgolang\b/i,
      /\bobject oriented\b/i,
      /\boop\b/i,
      /\bcompiler\b/i,
    ],
  },
  {
    id: "Engineering",
    label: "Engineering",
    icon: "⚙️",
    patterns: [
      /\bcircuit\b/i,
      /\belectronics?\b/i,
      /\bmechanical\b/i,
      /\bcivil\b/i,
      /\bengineering\b/i,
      /\brobotics?\b/i,
      /\belectric\b/i,
      /\bmanufacturing\b/i,
      /\bstructural\b/i,
      /\barduino\b/i,
      /\biot\b/i,
      /\bmatlab\b/i,
      /\bmicrocontroller\b/i,
      /\bembedded\b/i,
      /\bautomation\b/i,
      /\bvlsi\b/i,
      /\bsensors?\b/i,
      /\bcad\b/i,
    ],
  },
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
      /\bfullstack\b/i,
      /\bwordpress\b/i,
      /\bphp\b/i,
      /\bapi\b/i,
      /\bdjango\b/i,
      /\bflask\b/i,
      /\bbootstrap\b/i,
      /\btailwind\b/i,
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
      /\bukulele\b/i,
    ],
  },
];

/**
 * Determines domain based on courseName first, then department, then category.
 * Prioritizing courseName ensures programming languages (e.g., Python, C++, Java)
 * and technical subjects are classified under Programming & CS, Data Science & AI,
 * or Engineering rather than being swallowed by generic category tags.
 */
const determineDomain = (category = "", department = "", courseName = "") => {
  const cleanTitle = String(courseName || "").trim();
  const cleanCat = String(category || "").trim();
  const dept = String(department || "").toUpperCase();

  // 1. Specific title matches (highest priority)
  for (const domain of DOMAIN_DEFINITIONS) {
    if (domain.patterns.some((re) => re.test(cleanTitle))) {
      return domain.id;
    }
  }

  // 2. Department matches
  if (dept === "CSE" || dept === "IT") return "Programming & CS";
  if (["ECE", "EEE", "MECH", "CIVIL"].includes(dept)) return "Engineering";

  // 3. Category matches
  if (cleanCat === "Web Development") return "Web Development";
  if (cleanCat === "Business Finance") return "Business & Finance";
  if (cleanCat === "Graphic Design") return "Design & Creative";
  if (cleanCat === "Musical Instruments") return "Music & Audio";

  for (const domain of DOMAIN_DEFINITIONS) {
    if (domain.patterns.some((re) => re.test(cleanCat))) {
      return domain.id;
    }
  }

  // 4. Fallback
  return cleanCat && cleanCat !== "All" ? cleanCat : "General Studies";
};

module.exports = {
  DOMAIN_DEFINITIONS,
  determineDomain,
};
