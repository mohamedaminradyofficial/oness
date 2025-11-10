#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 تشغيل جميع الاختبارات مع تقرير التغطية...\n');

try {
  console.log('📊 تشغيل اختبارات الوحدة...');
  execSync('npm run test:unit -- --coverage', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '../backend')
  });

  console.log('\n🔗 تشغيل اختبارات التكامل...');
  execSync('npm run test:integration -- --coverage', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '../backend')
  });

  console.log('\n🎭 تشغيل اختبارات E2E...');
  execSync('npm run test:e2e', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '../backend')
  });

  const coveragePath = path.join(__dirname, '../backend/coverage/coverage-summary.json');
  if (fs.existsSync(coveragePath)) {
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const total = coverage.total;

    console.log('\n📈 تقرير التغطية النهائي:');
    console.log('================================');
    console.log(`الخطوط: ${total.lines.pct}%`);
    console.log(`الوظائف: ${total.functions.pct}%`);
    console.log(`الفروع: ${total.branches.pct}%`);
    console.log(`البيانات: ${total.statements.pct}%`);

    const threshold = 80;
    const meetsThreshold = 
      total.lines.pct >= threshold &&
      total.functions.pct >= threshold &&
      total.branches.pct >= threshold &&
      total.statements.pct >= threshold;

    if (meetsThreshold) {
      console.log('\n✅ تم تحقيق الحد الأدنى للتغطية (80%)');
      process.exit(0);
    } else {
      console.log('\n❌ لم يتم تحقيق الحد الأدنى للتغطية (80%)');
      process.exit(1);
    }
  } else {
    console.log('\n⚠️  لم يتم العثور على تقرير التغطية');
    process.exit(1);
  }

} catch (error) {
  console.error('\n❌ فشل في تشغيل الاختبارات:', error.message);
  process.exit(1);
}