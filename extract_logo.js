const fs = require('fs');

const html = fs.readFileSync('./backup/index.html', 'utf8');

const regex = /<img\s+src="(data:image\/png;base64,[^"]+)"/g;
const matches = [...html.matchAll(regex)];

if (matches.length > 0) {
  const logoBase64 = matches[0][1];
  
  const componentCode = `import React from 'react';

export const LogoImage = () => (
  <img src="${logoBase64}" width="60" height="auto" alt="rek logo" />
);
`;
  fs.writeFileSync('./src/components/LogoImage.jsx', componentCode);
  console.log('LogoImage.jsx created successfully');
} else {
  console.log('No base64 logo found');
}
