import { ClubDocument } from "../models/ClubDocument.js";
import { DocumentAcceptance } from "../models/DocumentAcceptance.js";

function audienceClause(user) {
  return {
    $or: [
      { patentes: { $size: 0 } },
      { patentes: user.patente }
    ]
  };
}

export function applicableDocumentsQuery(user, extra = {}) {
  const now = new Date();
  return {
    ...extra,
    ativo: true,
    publishedAt: { $lte: now },
    effectiveAt: { $lte: now },
    ...audienceClause(user)
  };
}

export async function getApplicableDocuments(user, { requiredOnly = false } = {}) {
  const query = applicableDocumentsQuery(user, requiredOnly ? { obrigatorio: true } : {});
  return ClubDocument.find(query).sort({ obrigatorio: -1, tipo: 1, titulo: 1, effectiveAt: -1 }).lean();
}

export async function getDocumentCompliance(user) {
  const documents = await getApplicableDocuments(user);
  const ids = documents.map((item) => item._id);
  const acceptances = ids.length
    ? await DocumentAcceptance.find({ user: user._id, document: { $in: ids } }).lean()
    : [];
  const acceptanceMap = new Map(acceptances.map((item) => [String(item.document), item]));

  const items = documents.map((document) => {
    const acceptance = acceptanceMap.get(String(document._id));
    const accepted = Boolean(acceptance && acceptance.contentHash === document.contentHash);
    return {
      ...document,
      accepted,
      acceptedAt: accepted ? acceptance.acceptedAt : null,
      acceptanceId: accepted ? acceptance._id : null
    };
  });

  return {
    documents: items,
    requiredCount: items.filter((item) => item.obrigatorio).length,
    pendingRequiredCount: items.filter((item) => item.obrigatorio && !item.accepted).length,
    pendingRequired: items.filter((item) => item.obrigatorio && !item.accepted)
  };
}

export async function hasPendingRequiredDocuments(user) {
  const compliance = await getDocumentCompliance(user);
  return {
    pending: compliance.pendingRequiredCount > 0,
    count: compliance.pendingRequiredCount,
    documents: compliance.pendingRequired
  };
}
