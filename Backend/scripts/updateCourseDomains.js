require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Course = require("../models/Course");
const { determineDomain, DOMAIN_DEFINITIONS } = require("../utils/domainHelper");

const updateCourseDomains = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI not found in environment.");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for domain normalization...");

    const courses = await Course.find(
      {},
      "courseName courseCode category department domain status"
    ).lean();

    console.log(`Found ${courses.length} courses in database.`);

    let updatedCount = 0;
    const domainCounts = {};

    const bulkOps = [];
    for (const c of courses) {
      const computedDomain = determineDomain(c.category, c.department, c.courseName);
      domainCounts[computedDomain] = (domainCounts[computedDomain] || 0) + 1;

      if (c.domain !== computedDomain) {
        bulkOps.push({
          updateOne: {
            filter: { _id: c._id },
            update: { $set: { domain: computedDomain } },
          },
        });
        updatedCount++;
      }
    }

    if (bulkOps.length > 0) {
      await Course.bulkWrite(bulkOps);
      console.log(`✅ Updated ${updatedCount} courses with normalized domain values.`);
    } else {
      console.log("All courses already have valid domain values.");
    }

    // Build/ensure database indexes
    await Course.syncIndexes();
    console.log("✅ Synced database indexes (including domain index).");

    console.log("\n--- Domain Distribution ---");
    Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([domain, count]) => {
        console.log(`  ${domain.padEnd(25)}: ${count} courses`);
      });
    console.log("---------------------------\n");

    return { total: courses.length, updated: updatedCount, domainCounts };
  } catch (error) {
    console.error("❌ Error updating course domains:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
};

if (require.main === module) {
  updateCourseDomains()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { updateCourseDomains };
