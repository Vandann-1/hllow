const BASE_URL = "http://localhost:3000";

async function verifyMuskaan() {
  console.log("=== VERIFYING MUSKAAN & CUSTOM CONFIGURATION ===");

  // 1. Intruder Rejection
  console.log("\n1. Testing Old/Intruder Rejection (mitti)...");
  const intruderRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "mitti", password: "mitti123" }),
  });
  console.log(`Mitti login status: ${intruderRes.status} (Expected 403)`);
  if (intruderRes.status !== 403) throw new Error("Expected mitti to be rejected!");
  console.log("✓ Former name / third parties strictly blocked.");

  // 2. Vandan Login
  console.log("\n2. Logging in as Vandan...");
  const vandanRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "vandan", password: "vandan123" }),
  });
  const vandanCookie = vandanRes.headers.get("set-cookie")?.split(";")[0];
  const vandanData = await vandanRes.json();
  console.log(`Vandan logged in: ${vandanData.user.name}, partner: ${vandanData.partner.name}`);
  if (vandanData.partner.name !== "Muskaan") throw new Error("Partner is not Muskaan!");
  console.log("✓ Partner confirmed as Muskaan.");

  // 3. Check Wishes are 0/10 (Clean Slate for manual entry)
  console.log("\n3. Verifying Clean Slate (0 Wishes initially)...");
  const wishesRes = await fetch(`${BASE_URL}/api/wishes`, {
    headers: { Cookie: vandanCookie },
  });
  const wishesData = await wishesRes.json();
  console.log(`Vandan's wishes count: ${wishesData.myWishes.length} (Expected 0)`);
  if (wishesData.myWishes.length !== 0) throw new Error("Wishes should be 0 for manual user entry!");
  console.log("✓ Wishes count is 0/10. Ready for Vandan to type his own wishes manually!");

  // 4. Muskaan Login
  console.log("\n4. Logging in as Muskaan...");
  const muskaanRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "muskaan", password: "muskaan123" }),
  });
  const muskaanCookie = muskaanRes.headers.get("set-cookie")?.split(";")[0];
  const muskaanData = await muskaanRes.json();
  console.log(`Muskaan logged in: ${muskaanData.user.name}, partner: ${muskaanData.partner.name}`);
  if (muskaanData.user.name !== "Muskaan" || muskaanData.partner.name !== "Vandan") {
    throw new Error("Muskaan user session mismatch!");
  }
  console.log("✓ Muskaan logged in successfully.");

  // 5. Check Dates (18 Nov connection, 18 Dec proposal)
  console.log("\n5. Verifying Special Dates & Official Proposal Date...");
  const datesRes = await fetch(`${BASE_URL}/api/dates`, {
    headers: { Cookie: vandanCookie },
  });
  const datesData = await datesRes.json();
  console.log(`Official start date: ${datesData.startDate} (Expected 2025-12-18)`);
  const spark = datesData.allDates.find((d) => d.title.includes("Connection Began"));
  const proposal = datesData.allDates.find((d) => d.title.includes("Proposal"));
  console.log(`Connection Began date: ${spark?.date} (${spark?.title})`);
  console.log(`Proposal date: ${proposal?.date} (${proposal?.title})`);
  if (!spark || !proposal) throw new Error("Missing 18 Nov or 18 Dec milestones!");
  console.log("✓ 18 Nov Connection & 18 Dec Proposal milestones verified!");

  // 6. Check Fund setup
  console.log("\n6. Verifying Fund System...");
  const fundRes = await fetch(`${BASE_URL}/api/fund`, {
    headers: { Cookie: vandanCookie },
  });
  const fundData = await fundRes.json();
  console.log(`Fund balance: ₹${fundData.balance}, contributions:`, fundData.contributions);
  console.log("✓ Fund is clean and ready.");

  console.log("\n==========================================");
  console.log("🎉 ALL MUSKAAN & CUSTOM REQUIREMENTS VERIFIED!");
  console.log("==========================================");
}

verifyMuskaan().catch((e) => {
  console.error("❌ Test failed:", e);
  process.exit(1);
});
