import assert from "node:assert/strict";
import { test } from "node:test";
import { annualSalary, confirmEmployment, confirmQualification, createProfile, editField, invalidateAssessment, parseProfile, updateEmployment, type JourneyProfile, type QualificationKey } from "../lib/journey-profile";
import { loadDemoBackground, loadDemoContract, manualContract } from "../lib/demo-contract";
import { loadProfile, resetProfile, saveProfile, STORAGE_KEY } from "../lib/journey-storage";
import { assessVisa, checklistText, nextAction, routeChecklist, visaStageComplete } from "../lib/visa-assessment";
import { mvpRules } from "../lib/mvp-visa-rules";
import { documentAvailable, documentCatalog, recordDocument, setDocumentStatus, vaultDocument } from "../lib/document-vault";
import { journeyNextAction, journeyProgress, journeyStages, stageTasks } from "../lib/journey-stages";
import { POST } from "../app/api/visa-assessment/route";

const now = new Date("2026-09-12T12:00:00Z");
function example(): JourneyProfile { return confirmQualification(loadDemoBackground(confirmEmployment(loadDemoContract(createProfile())))); }
function answer(profile: JourneyProfile, key: QualificationKey, value: string) {
  return confirmQualification({ ...profile, qualification: { ...profile.qualification, [key]: editField(profile.qualification[key], value) } });
}
function recognised() { return answer(example(), "recognitionStatus", "recognised"); }
const route = (profile: JourneyProfile, id = "blue-card") => assessVisa(profile, now).routes.find(route => route.id === id)!;

test("normal start is empty and a sample is never treated as confirmed extraction", () => {
  const blank = createProfile();
  assert.equal(blank.name, ""); assert.equal(blank.contractDocument, null);
  const sample = loadDemoContract(blank);
  assert.equal(annualSalary(sample), null);
  assert.equal(sample.employment.employer.origin, "demo-contract");
  assert.equal(sample.employment.employer.confirmed, false);
  assert.equal(assessVisa(sample, now).routes.length, 0);
});
test("confirmed salary is annualized and corrections preserve the original sample value", () => {
  let profile = loadDemoContract(createProfile());
  profile.employment.salaryAmount = editField(profile.employment.salaryAmount, "6000.50");
  profile = confirmEmployment(profile);
  assert.equal(annualSalary(profile), 72006);
  assert.equal(profile.employment.salaryAmount.extractedValue, "5500");
  assert.equal(profile.employment.salaryAmount.confirmed, true);
  assert.equal(annualSalary(parseProfile(JSON.parse(JSON.stringify(profile)))), 72006);
});
test("missing recognition produces a next action; a checklist tick cannot verify it", () => {
  const profile = example(); profile.documentsReady.recognition = true;
  const blue = route(profile);
  assert.equal(blue.status, "verify");
  assert.ok(blue.missing.some(item => item.id === "recognition"));
  assert.equal(nextAction(profile, blue).title, "Check your qualification recognition");
});
test("standard Blue Card salary boundary uses numeric pay, including cents", () => {
  for (const [annual, expected] of [[50699.99, "outside-scope"], [50700, "potential"], [50700.01, "potential"]] as const) {
    let profile = recognised();
    profile.employment.salaryAmount = editField(profile.employment.salaryAmount, String(annual));
    profile.employment.salaryPeriod = editField(profile.employment.salaryPeriod, "annual");
    profile = confirmEmployment(profile);
    assert.equal(route(profile).status, expected);
  }
});
test("vocational cases lead to skilled-worker review without asserting Blue Card rejection", () => {
  const profile = answer(recognised(), "qualificationType", "vocational");
  const result = assessVisa(profile, now);
  assert.equal(result.routes[0].id, "skilled-worker");
  assert.equal(route(profile).status, "outside-scope");
});
test("EU / EEA / Swiss checklists differ from third-country checklists", () => {
  for (const nationality of ["FR", "NO", "CH"]) {
    const profile = answer(example(), "nationality", nationality);
    const result = assessVisa(profile, now);
    assert.equal(result.routes.length, 1);
    assert.equal(result.routes[0].id, nationality === "CH" ? "swiss" : "eu-eea");
    const ids = routeChecklist(profile, result.routes[0]).map(item => item.id);
    assert.ok(!ids.includes("declaration")); assert.ok(!ids.includes("qualification"));
    assert.equal(ids.includes("swiss-notification"), nationality === "CH");
  }
});
test("unknown nationality and missing licensing do not become positive findings", () => {
  assert.equal(assessVisa(answer(example(), "nationality", "UNKNOWN"), now).routes.length, 0);
  const regulated = answer(recognised(), "regulatedProfession", "yes");
  assert.ok(route(regulated).missing.some(item => item.id === "licence"));
  const eu = answer(regulated, "nationality", "FR");
  assert.equal(assessVisa(eu, now).routes[0].status, "verify");
});
test("unknown age, short contract, unconfirmed salary and non-EUR pay are flagged", () => {
  const aged = answer(recognised(), "ageBand", "45plus");
  assert.equal(route(aged, "skilled-worker").status, "outside-scope");
  const short = recognised(); short.employment.contractDuration.value = "under-six-months";
  assert.equal(route(short).status, "outside-scope");
  const unconfirmed = recognised(); unconfirmed.employment.salaryAmount.confirmed = false;
  assert.ok(route(unconfirmed).missing.some(item => item.id === "salary"));
  const dollars = recognised(); dollars.employment.currency.value = "USD";
  assert.ok(route(dollars).missing.some(item => item.id === "salary"));
});
test("future rules and start years require verification", () => {
  const profile = recognised();
  const result = assessVisa(profile, new Date("2027-01-01T12:00:00Z"));
  assert.ok(result.routes.every(route => route.status !== "potential"));
  assert.ok(result.routes.every(route => route.missing.some(item => item.id === "rules-date")));
  profile.employment.startDate.value = "2027-02-01";
  assert.ok(route(profile).missing.some(item => item.id === "start-year"));
});
test("manual contract metadata is reused without inventing extracted or verified facts", () => {
  const profile = manualContract(example(), "My contract.pdf");
  assert.equal(profile.employment.employer.value, "");
  assert.equal(profile.employment.employer.extractedValue, null);
  assert.equal(profile.contractDocument?.kind, "user-file");
  assert.equal(routeChecklist(profile, route(profile)).find(item => item.id === "employment")?.availability, "provided");
});
test("readiness requires confirmed checks and documents; changes clear stale completion", () => {
  let profile = recognised();
  profile.visaReviewed = true; profile.selectedRoute = "blue-card";
  const assessment = assessVisa(profile, now);
  assert.equal(visaStageComplete(profile, assessment), false);
  profile.application = { employmentDeclaration: "required", biometricPhoto: "required", routeDeclarations: "not-required", accommodationEvidence: "not-required", fastTrack: false };
  for (const item of routeChecklist(profile, route(profile))) {
    if (item.documentType) profile = recordDocument(profile, item.documentType, null, "self-reported");
    else profile.documentsReady[item.id] = true;
  }
  assert.equal(visaStageComplete(profile, assessment), true);
  profile = invalidateAssessment(profile);
  assert.equal(profile.visaReviewed, false); assert.equal(profile.selectedRoute, null);
  assert.deepEqual(profile.documentsReady, {});
});
test("browser persistence restores the whole profile and detects malformed or obsolete data", () => {
  const data = new Map<string, string>();
  const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); }, removeItem: (key: string) => { data.delete(key); } };
  const profile = recognised(); profile.documentsReady.identity = true;
  assert.equal(saveProfile(storage, profile), true);
  assert.deepEqual(loadProfile(storage).profile, profile);
  storage.setItem(STORAGE_KEY, '{"version":99}');
  assert.ok(loadProfile(storage).notice);
  assert.equal(storage.getItem(STORAGE_KEY), '{"version":99}');
  assert.equal(resetProfile(storage), true); assert.equal(storage.getItem(STORAGE_KEY), null);
  assert.equal(saveProfile({ ...storage, setItem: () => { throw new Error("Quota"); } }, profile), false);
});
test("new job titles require reconfirming job-specific answers, while nationality and qualifications carry forward", () => {
  const previous = recognised();
  const updated = updateEmployment(previous, "jobTitle", "Nurse");
  assert.equal(updated.qualification.degreeMatchesJob.confirmed, false);
  assert.equal(updated.qualification.regulatedProfession.confirmed, false);
  assert.equal(updated.qualification.nationality.confirmed, true);
  assert.equal(updated.qualification.recognitionStatus.confirmed, true);
  assert.ok(route(confirmEmployment(updated)).missing.some(item => item.id === "regulated"));
});
test("contradictory German-qualification and foreign country answers need clarification", () => {
  const profile = answer(example(), "recognitionStatus", "german-qualification");
  assert.ok(route(profile).missing.some(item => item.id === "qualification-country"));
  assert.notEqual(route(profile).status, "potential");
});
test("API rejects malformed JSON, missing shapes, negative salary, invalid choices and oversized payloads", async () => {
  for (const body of ["{", "null", "[]", "{}", JSON.stringify({ ...createProfile(), version: 5 })]) {
    assert.equal((await POST(new Request("http://localhost/api/visa-assessment", { method: "POST", body }))).status, 400);
  }
  for (const [field, value] of [["salaryAmount", "-100"], ["salaryPeriod", "hourly"], ["startDate", "2026-02-31"]] as const) {
    const profile = recognised(); profile.employment[field].value = value;
    assert.equal((await POST(new Request("http://localhost/api/visa-assessment", { method: "POST", body: JSON.stringify(profile) }))).status, 400);
  }
  assert.equal((await POST(new Request("http://localhost/api/visa-assessment", { method: "POST", body: "x".repeat(100001) }))).status, 413);
});
test("API returns current metadata and export contains the chosen route, missing requirements and sources", async () => {
  const profile = example();
  const response = await POST(new Request("http://localhost/api/visa-assessment", { method: "POST", body: JSON.stringify(profile) }));
  assert.equal(response.status, 200); assert.equal(response.headers.get("Cache-Control"), "no-store");
  const result = await response.json();
  assert.equal(result.rulesVersion, mvpRules.version);
  assert.ok(Math.abs(Date.parse(result.generatedAt) - Date.now()) < 5000);
  const text = checklistText(profile, route(profile));
  assert.ok(text.includes("sample")); assert.ok(text.includes("Needs verification")); assert.ok(text.includes("https://"));
});

test("version 1 profiles migrate contract and reported documents without inventing filenames or dates", () => {
  const original = recognised();
  original.documentsReady.identity = true;
  original.documentsReady["mission-checklist"] = true;
  const { documents, application, visitedStages, tasksDone, ...legacy } = original;
  void documents; void application; void visitedStages; void tasksDone;
  const migrated = parseProfile({ ...legacy, version: 1 });
  assert.equal(migrated.version, 2);
  assert.deepEqual(migrated.employment, original.employment);
  assert.deepEqual(migrated.qualification, original.qualification);
  assert.equal(vaultDocument(migrated, "employment")?.filename, original.contractDocument?.name);
  assert.equal(vaultDocument(migrated, "employment")?.dateAdded, null);
  assert.equal(vaultDocument(migrated, "identity")?.source, "self-reported");
  assert.equal(vaultDocument(migrated, "identity")?.filename, null);
  assert.equal(migrated.documentsReady["mission-checklist"], true);
  assert.deepEqual(parseProfile(JSON.parse(JSON.stringify(migrated))), migrated);
});

test("document records survive fact changes, reuse one ID on replacement and preserve other documents", () => {
  let profile = recordDocument(recognised(), "identity", "passport.pdf", "user-file", "2026-09-01T12:00:00Z");
  const contractId = vaultDocument(profile, "employment")!.id;
  profile = manualContract(profile, "updated-contract.pdf");
  assert.equal(vaultDocument(profile, "employment")!.id, contractId);
  assert.equal(profile.documents.filter(item => item.type === "employment").length, 1);
  assert.equal(vaultDocument(profile, "identity")!.filename, "passport.pdf");
  assert.equal(profile.contractReviewed, false);
  profile = updateEmployment(profile, "salaryAmount", "65000");
  assert.equal(documentAvailable(profile, "employment"), true);
  assert.equal(documentAvailable(profile, "identity"), true);
  profile = recordDocument(profile, "identity", "passport-renewed.pdf", "user-file", "2026-09-13T12:00:00Z");
  assert.equal(vaultDocument(profile, "identity")!.dateAdded, "2026-09-01T12:00:00Z");
  assert.equal(vaultDocument(profile, "identity")!.updatedAt, "2026-09-13T12:00:00Z");
  profile = setDocumentStatus(profile, "identity", "needs-update");
  assert.equal(documentAvailable(profile, "identity"), false);
});

test("conditional visa documents follow explicit application context and disappear for free movement", () => {
  let profile = recognised();
  let checklist = routeChecklist(profile, route(profile));
  assert.ok(!checklist.some(item => item.id === "fast-track" || item.id === "accommodation"));
  assert.equal(checklist.find(item => item.id === "photo")!.needsApplicability, true);
  profile = recordDocument(profile, "photo", "photo.jpg");
  assert.equal(routeChecklist(profile, route(profile)).find(item => item.id === "photo")!.ready, false);
  profile.application = { fastTrack: true, employmentDeclaration: "required", biometricPhoto: "required", routeDeclarations: "not-required", accommodationEvidence: "required" };
  checklist = routeChecklist(profile, route(profile));
  assert.ok(checklist.some(item => item.id === "fast-track"));
  assert.ok(checklist.some(item => item.id === "accommodation"));
  assert.ok(!checklist.some(item => item.id === "route-declarations"));
  assert.equal(checklist.find(item => item.id === "photo")!.ready, true);
  for (const nationality of ["FR", "CH"]) {
    const free = answer(profile, "nationality", nationality);
    const freeList = routeChecklist(free, assessVisa(free, now).routes[0]);
    assert.ok(!freeList.some(item => ["fast-track", "photo", "accommodation", "declaration", "route-declarations"].includes(item.id)));
  }
});

test("five-stage progress tracks actual reviews and moves to the next incomplete stage", () => {
  assert.equal(journeyStages.length, 5);
  let profile = createProfile();
  assert.equal(journeyProgress(profile, assessVisa(profile, now)).percent, 0);
  profile = confirmEmployment(loadDemoContract(profile));
  assert.equal(journeyProgress(profile, assessVisa(profile, now)).percent, 20);
  assert.equal(journeyNextAction(profile, assessVisa(profile, now)).destination, "visa");
  profile = answer(confirmQualification(loadDemoBackground(profile)), "nationality", "FR");
  profile.visaReviewed = true; profile.selectedRoute = "eu-eea";
  profile = recordDocument(profile, "identity", "passport.pdf");
  profile.documentsReady.registration = true;
  assert.equal(journeyProgress(profile, assessVisa(profile, now)).currentIndex, 2);
  assert.equal(journeyNextAction(profile, assessVisa(profile, now)).destination, "accommodation");
  for (const stage of Object.values(stageTasks)) for (const task of stage) profile.tasksDone[task.id] = true;
  assert.equal(journeyProgress(profile, assessVisa(profile, now)).percent, 100);
  profile.tasksDone["tax-plan"] = false;
  assert.equal(journeyNextAction(profile, assessVisa(profile, now)).destination, "setup");
});

test("Vault validation rejects duplicate or malformed records and normalises phase references", () => {
  const profile = recognised();
  assert.throws(() => parseProfile({ ...profile, documents: [...profile.documents, profile.documents[0]] }));
  for (const patch of [{ type: "__proto__" }, { dateAdded: "not a date" }, { status: "verified" }, { filename: "a".repeat(256) }, { phases: [6] }]) {
    assert.throws(() => parseProfile({ ...profile, documents: [{ ...profile.documents[0], ...patch }] }));
  }
  const restored = parseProfile({ ...profile, documents: [{ ...profile.documents[0], phases: [5] }] });
  assert.deepEqual(restored.documents[0].phases, [...documentCatalog.employment.phases]);
  assert.throws(() => parseProfile({ ...profile, application: { ...profile.application, fastTrack: "yes" } }));
});
