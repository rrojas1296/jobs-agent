import sys
import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile(sys.argv[1]) as archive:
    document = archive.getinfo('word/document.xml')
    if document.file_size > 4_000_000:
        raise ValueError('Document too large')
    root = ET.fromstring(archive.read(document))
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    for paragraph in root.findall('.//w:p', ns):
        print(''.join(node.text or '' for node in paragraph.findall('.//w:t', ns)))
