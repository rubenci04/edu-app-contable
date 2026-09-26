from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET
from pypdf import PdfReader

root = Path(__file__).resolve().parents[1]
output = root / 'tmp' / 'document-review'
output.mkdir(parents=True, exist_ok=True)
for path in sorted((root / 'docs').iterdir()):
    if path.suffix.lower() == '.pdf':
        reader = PdfReader(path)
        text = '\n\n'.join(f'--- Página {i+1} ---\n{page.extract_text()}' for i, page in enumerate(reader.pages))
    elif path.suffix.lower() == '.docx':
        with ZipFile(path) as archive:
            xml = ET.fromstring(archive.read('word/document.xml'))
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        text = '\n'.join(''.join(p.itertext()) for p in xml.findall('.//w:p', ns))
    else:
        continue
    (output / (path.stem + '.txt')).write_text(text, encoding='utf-8')
    print(path.name, len(text), 'caracteres')
