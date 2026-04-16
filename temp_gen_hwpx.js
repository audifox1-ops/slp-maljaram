
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

async function createMinimalHwpx(filename, title, content) {
  const zip = new JSZip();

  // 1. mimetype (Must be FIRST and uncompressed)
  zip.file('mimetype', 'application/hwp+zip', { compression: 'STORE' });

  // 2. [Content_Types].xml
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Override PartName="/Contents/content.hpf" ContentType="application/oebps-package+xml"/>
  <Override PartName="/Contents/header.xml" ContentType="application/xml"/>
  <Override PartName="/Contents/section0.xml" ContentType="application/xml"/>
  <Override PartName="/Contents/settings.xml" ContentType="application/xml"/>
</Types>`);

  // 3. META-INF/container.xml
  zip.folder('META-INF').file('container.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="Contents/content.hpf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  // 4. Contents/content.hpf
  zip.folder('Contents').file('content.hpf', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<opf:package xmlns:opf="http://www.idpf.org/2007/opf" version="2.0">
  <opf:metadata>
    <opf:title>${title}</opf:title>
    <opf:language>ko</opf:language>
  </opf:metadata>
  <opf:manifest>
    <opf:item id="header" href="header.xml" media-type="application/xml"/>
    <opf:item id="section0" href="section0.xml" media-type="application/xml"/>
    <opf:item id="settings" href="settings.xml" media-type="application/xml"/>
  </opf:manifest>
  <opf:spine>
    <opf:itemref idref="header" linear="yes"/>
    <opf:itemref idref="section0" linear="yes"/>
  </opf:spine>
</opf:package>`);

  // 5. Contents/header.xml
  zip.folder('Contents').file('header.xml', `<hh:head xmlns:hh="http://www.hancom.com/hwpml/2011/header">
  <hh:beginNum/>
</hh:head>`);

  // 6. Contents/settings.xml
  zip.folder('Contents').file('settings.xml', `<hh:settings xmlns:hh="http://www.hancom.com/hwpml/2011/header">
  <hh:caretPos list="0" para="0" pos="0"/>
</hh:settings>`);

  // 7. Contents/section0.xml
  zip.folder('Contents').file('section0.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<hp:section xmlns:ha="http://www.hancom.co.kr/hwpml/2011/app" xmlns:hp="http://www.hancom.com/hwpml/2011/paragraph" xmlns:hh="http://www.hancom.com/hwpml/2011/header">
  <hp:secPr><hp:colPr/></hp:secPr>
  <hp:para>
    <hp:run>
      <hp:t>${content}</hp:t>
    </hp:run>
  </hp:para>
</hp:section>`);

  const buffer = await zip.generateAsync({ type: 'nodebuffer' });
  const dir = path.dirname(filename);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filename, buffer);
  console.log(`Created: ${filename}`);
}

const templatesDir = './public/assets/templates';

async function main() {
  await createMinimalHwpx(
    path.join(templatesDir, 'template_annual.hwpx'),
    '연간 계획서 템플릿',
    '학생 성명: {{STUDENT_NAME}}\\n치료 영역: {{TREATMENT_AREA}}\\n연간 목표: {{ANNUAL_GOAL}}'
  );
  
  await createMinimalHwpx(
    path.join(templatesDir, 'template_monthly.hwpx'),
    '월별 일지 템플릿',
    '학생 성명: {{STUDENT_NAME}}\\n해당 월: {{MONTH}}월\\n일지 내용:\\n{{SESSION_CONTENT}}'
  );
}

main().catch(console.error);
