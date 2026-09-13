const { maharashtraFacilities, maharashtraVillages } = require('../database/maharashtraData');

console.log('=== AUDITING MAHARASHTRA DATASET ===');
console.log('Total facilities:', maharashtraFacilities.length);
console.log('Total villages:', maharashtraVillages.length);

const dhs = maharashtraFacilities.filter(f => f.type === 'Government Hospital');
console.log('\n=== 36 DISTRICT HOSPITALS ===');
dhs.forEach((d, i) => {
  console.log(`${i+1}. [${d.name}]`);
  console.log(`   Address: ${d.address}`);
  console.log(`   GPS: ${d.lat}, ${d.lng} | Contact: ${d.contact}`);
});

// Check phone number formats
console.log('\n=== PHONE NUMBER VALIDATION ===');
let invalidPhoneCount = 0;
maharashtraFacilities.forEach(f => {
  const c = f.contact || '';
  // Valid Indian formats:
  // STD landline: 2-5 digits STD, hyphen, 6-8 digits number (total digits excluding hyphen = 10 or 11 with leading 0)
  // Mobile: 10 digits starting with 6,7,8,9
  // Emergency: 108, 104, 102, 112
  const cleaned = c.replace(/[^0-9]/g, '');
  const isValidLength = cleaned.length >= 10 && cleaned.length <= 12;
  if (!isValidLength && !['108', '104', '102', '112'].includes(cleaned)) {
    invalidPhoneCount++;
    if (invalidPhoneCount <= 10) {
      console.log(`Invalid format (#${f.id} ${f.name}): "${f.contact}" (digits: ${cleaned.length})`);
    }
  }
});
console.log(`Total facilities with invalid phone length (<10 or >12 digits): ${invalidPhoneCount} / ${maharashtraFacilities.length}`);
