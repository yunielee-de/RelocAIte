import assert from "node:assert/strict";
import { test } from "node:test";
import { contractFindings, demoSourceValues, employerRequest } from "../lib/contract-review";
import { confirmEmployment, createProfile, updateEmployment } from "../lib/journey-profile";
import { loadDemoContract, manualContract } from "../lib/demo-contract";

test("finding statuses distinguish confirmation from unclear or absent information", () => {
  const sample = loadDemoContract(createProfile());
  assert.equal(contractFindings(sample).filter(item => item.status === "Confirmed").length, 0);
  const confirmed = contractFindings(confirmEmployment(sample));
  assert.equal(confirmed.filter(item => item.status === "Confirmed").length, 9);
  assert.equal(confirmed.find(item => item.id === "remote")!.status, "Worth checking");
  assert.equal(confirmed.find(item => item.id === "visa-support")!.status, "Missing");
  assert.equal(confirmed.find(item => item.id === "relocation")!.status, "Confirmed");
});
test("corrections update findings but never rewrite linked source values", () => {
  const originalSource = demoSourceValues("salary");
  let profile = confirmEmployment(loadDemoContract(createProfile()));
  profile = updateEmployment(profile, "salaryAmount", "6000.50");
  const salary = contractFindings(profile).find(item => item.id === "salary")!;
  assert.equal(salary.status, "Worth checking");
  assert.equal(salary.corrected, true);
  assert.ok(salary.value.includes("6,000.5"));
  assert.deepEqual(demoSourceValues("salary"), originalSource);
  assert.equal(originalSource.find(field => field.key === "salaryAmount")!.value, "5,500");
  profile = confirmEmployment(profile);
  assert.equal(contractFindings(profile).find(item => item.id === "salary")!.status, "Confirmed");
  assert.equal(profile.employment.salaryAmount.extractedValue, "5500");
});
test("partial and manually entered contracts do not acquire demo findings or confirmed gaps", () => {
  let profile = manualContract(createProfile(), "personal.pdf");
  assert.ok(contractFindings(profile).every(item => item.status === "Missing"));
  profile = updateEmployment(profile, "employer", "User employer");
  profile = confirmEmployment(profile);
  assert.equal(contractFindings(profile).find(item => item.id === "role")!.status, "Missing");
  assert.ok(!contractFindings(profile).some(item => item.value.includes("Nordlicht")));
  assert.ok(contractFindings(profile).every(item => !item.corrected));
});
test("HR draft uses profile information and asks about unresolved policies without sending anything", () => {
  const profile = confirmEmployment(loadDemoContract(createProfile()));
  const draft = employerRequest(profile);
  assert.ok(draft.includes("Nordlicht Digital GmbH"));
  assert.ok(draft.includes("Visa support"));
  assert.ok(draft.includes("Remote-work policy"));
  assert.ok(!draft.includes("- Relocation support"));
  assert.ok(!draft.includes("CJ Foods"));
});
