document-engine.js
export class DocumentEngine {
  createDocument(data) {
    return {
      type: "DOCUMENT",
      title: data.title || "Untitled",
      created: Date.now(),
      sections: data.sections || []
    };
  }

  addSection(doc, title, content) {
    doc.sections.push({ title, content });
    return doc;
  }

  finalize(doc) {
    return {
      ...doc,
      finalized: true,
      checksum: this.generateChecksum(JSON.stringify(doc))
    };
  }

  generateChecksum(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
