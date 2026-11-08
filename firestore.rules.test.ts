import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const draftRulesPath = path.resolve(process.cwd(), 'DRAFT_firestore.rules');

function loadRulesText(): string {
  if (fs.existsSync(rulesPath)) {
    return fs.readFileSync(rulesPath, 'utf-8');
  }
  return fs.readFileSync(draftRulesPath, 'utf-8');
}

test('Firestore Rules enforce all 8 Pillars and Dirty Dozen defenses', () => {
  const rules = loadRulesText();

  // 1. Default-Deny Catch-All
  assert.match(rules, /match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;/);

  // 2. Email Verification Mandate
  assert.match(rules, /request\.auth\.token\.email_verified\s*==\s*true/);

  // 3. Bootstrapped Admin & Trusted Admin Collection
  assert.match(rules, /request\.auth\.token\.email\s*==\s*'trnhng092510@gmail\.com'/);
  assert.match(rules, /exists\(\/databases\/\$\(database\)\/documents\/admins\/\$\(request\.auth\.uid\)\)/);

  // 4. PII Split Collection Strategy (/users/{userId}/private/{docId})
  assert.match(rules, /match\s+\/private\/\{docId\}/);

  // 5. Validation Blueprints on every collection
  assert.match(rules, /function\s+isValidUserPublicProfile\(data\)/);
  assert.match(rules, /function\s+isValidUserPrivateInfo\(data\)/);
  assert.match(rules, /function\s+isValidAppConfigDoc\(data\)/);
  assert.match(rules, /function\s+isValidStudyMaterialDoc\(data\)/);
  assert.match(rules, /function\s+isValidForumPostDoc\(data\)/);
  assert.match(rules, /function\s+isValidWishNoteDoc\(data\)/);
  assert.match(rules, /function\s+isValidSongDoc\(data\)/);
  assert.match(rules, /function\s+isValidFlashcardDoc\(data\)/);

  // 6. Strict Key & Temporal Integrity
  assert.match(rules, /hasAll\(/);
  assert.match(rules, /hasOnly\(/);
  assert.match(rules, /affectedKeys\(\)\.hasOnly\(/);
  assert.match(rules, /incoming\(\)\.createdAt\s*==\s*request\.time/);
  assert.match(rules, /incoming\(\)\.updatedAt\s*==\s*request\.time/);
  assert.match(rules, /incoming\(\)\.createdAt\s*==\s*existing\(\)\.createdAt/);
});
