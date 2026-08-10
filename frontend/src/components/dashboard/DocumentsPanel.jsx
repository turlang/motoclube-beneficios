import { useMemo, useState } from "react";
import { BadgeCheck, FileCheck2, FileText, ShieldAlert } from "lucide-react";

export function DocumentsPanel({ documents = [], loading, error, pendingRequiredCount = 0, onAccept }) {
  const [confirmed, setConfirmed] = useState({});
  const sorted = useMemo(
    () => [...documents].sort((a, b) => Number(b.obrigatorio) - Number(a.obrigatorio) || a.titulo.localeCompare(b.titulo)),
    [documents]
  );

  return (
    <section className="mc-documents-panel">
      <div className="mc-documents-heading">
        <div>
          <p>DOCUMENTOS & REGULAMENTO</p>
          <h3>Versões vigentes e seus aceites</h3>
        </div>
        <span className={pendingRequiredCount > 0 ? "is-pending" : "is-clear"}>
          {pendingRequiredCount > 0 ? <ShieldAlert /> : <FileCheck2 />}
          {pendingRequiredCount > 0 ? `${pendingRequiredCount} pendente(s)` : "Regularizado"}
        </span>
      </div>

      <p className="mc-documents-intro">Cada aceite fica vinculado à versão e ao hash do conteúdo. Se a Diretoria alterar um documento obrigatório, a nova versão volta a exigir ciência do integrante.</p>

      {loading && <div className="mc-document-state">Carregando documentos...</div>}
      {error && <div className="mc-document-state is-error">{error}</div>}
      {!loading && !error && sorted.length === 0 && <div className="mc-document-state">Nenhum documento institucional publicado para seu perfil.</div>}

      <div className="mc-document-list">
        {sorted.map((document) => {
          const checked = Boolean(confirmed[document._id]);
          return (
            <details key={document._id} className={["mc-document-card", document.obrigatorio ? "is-required" : "", document.accepted ? "is-accepted" : ""].join(" ")}>
              <summary>
                <div className="mc-document-icon">{document.accepted ? <BadgeCheck /> : <FileText />}</div>
                <div>
                  <p>{typeLabel(document.tipo)} • versão {document.versao}</p>
                  <h4>{document.titulo}</h4>
                  <span>{document.resumo || "Documento institucional publicado pela Diretoria."}</span>
                </div>
                <b>{document.obrigatorio ? "OBRIGATÓRIO" : "INFORMATIVO"}</b>
              </summary>

              <div className="mc-document-body">
                <div className="mc-document-meta">
                  <span>Vigência: {formatDate(document.effectiveAt)}</span>
                  <span>Hash: {String(document.contentHash || "").slice(0, 12)}…</span>
                  {document.acceptedAt && <span>Aceito em: {formatDateTime(document.acceptedAt)}</span>}
                </div>
                <div className="mc-document-content">{document.conteudo}</div>

                {document.accepted ? (
                  <div className="mc-document-accepted"><BadgeCheck /> Ciência registrada para esta versão.</div>
                ) : (
                  <div className="mc-document-accept-box">
                    <label>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => setConfirmed((current) => ({ ...current, [document._id]: event.target.checked }))}
                      />
                      <span>{document.obrigatorio ? "Declaro que li e estou de acordo com esta versão." : "Declaro que li esta versão e desejo registrar ciência."}</span>
                    </label>
                    <button type="button" disabled={!checked || loading} onClick={() => onAccept(document._id)}>
                      <FileCheck2 /> {document.obrigatorio ? "REGISTRAR ACEITE" : "REGISTRAR CIÊNCIA"}
                    </button>
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}

function typeLabel(type) {
  return ({ regulamento: "Regulamento", estatuto: "Estatuto", termo: "Termo", politica: "Política", codigo_conduta: "Código de conduta", outro: "Documento" })[type] || "Documento";
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
