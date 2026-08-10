import { Bell, LogOut } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BottomDock } from "../components/BottomDock.jsx";
import { BrandCrest } from "../components/BrandCrest.jsx";
import { HeroBanner } from "../components/dashboard/HeroBanner.jsx";
import { EscudoTab } from "../components/dashboard/EscudoTab.jsx";
import { BeneficiosTab } from "../components/dashboard/BeneficiosTab.jsx";
import { ClubeTab } from "../components/dashboard/ClubeTab.jsx";
import { SosTab } from "../components/dashboard/SosTab.jsx";
import { PerfilTab } from "../components/dashboard/PerfilTab.jsx";
import { DiretoriaTab } from "../components/dashboard/DiretoriaTab.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { api } from "../services/api.js";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const isActive = user.statusAssinatura === "ativo";
  const isDiretoria = user.patente === "Diretoria";
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem("motoclube_active_tab") || "escudo");
  const [qr, setQr] = useState(null);
  const [qrError, setQrError] = useState("");
  const [loadingQr, setLoadingQr] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [benefits, setBenefits] = useState([]);
  const [benefitsLoading, setBenefitsLoading] = useState(false);
  const [benefitsError, setBenefitsError] = useState("");
  const [clubEvents, setClubEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [adminOverview, setAdminOverview] = useState(null);
  const [adminMembers, setAdminMembers] = useState([]);
  const [adminPartners, setAdminPartners] = useState([]);
  const [clubContent, setClubContent] = useState({ profile: null, officers: [], events: [], posts: [], chapters: [], media: [] });
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => { sessionStorage.setItem("motoclube_active_tab", activeTab); window.scrollTo({ top: 0, behavior: "smooth" }); }, [activeTab]);

  const loadQr = useCallback(async () => {
    if (!isActive) { setQr(null); return; }
    setLoadingQr(true); setQrError("");
    try { setQr(await api("/api/qr/me")); }
    catch (error) { setQr(null); setQrError(error.message); }
    finally { setLoadingQr(false); }
  }, [isActive]);

  useEffect(() => { loadQr(); }, [loadQr]);
  useEffect(() => { if (!isActive) return; const intervalId = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(intervalId); }, [isActive]);
  useEffect(() => { if (!qr?.expiresAt || !isActive) return; const msUntilRefresh = Math.max(1000, qr.expiresAt * 1000 - Date.now() + 300); const timeoutId = window.setTimeout(loadQr, msUntilRefresh); return () => window.clearTimeout(timeoutId); }, [qr?.expiresAt, isActive, loadQr]);

  const secondsRemaining = useMemo(() => !qr?.expiresAt ? 0 : Math.max(0, Math.ceil((qr.expiresAt * 1000 - now) / 1000)), [qr?.expiresAt, now]);

  useEffect(() => {
    if (activeTab !== "beneficios" || benefits.length > 0) return;
    setBenefitsLoading(true); setBenefitsError("");
    api("/api/benefits").then((data) => setBenefits(data.benefits || [])).catch((error) => setBenefitsError(error.message)).finally(() => setBenefitsLoading(false));
  }, [activeTab, benefits.length]);

  const loadClubEvents = useCallback(async () => {
    setEventsLoading(true); setEventsError("");
    try {
      const data = await api("/api/events");
      setClubEvents(data.events || []);
    } catch (error) {
      setEventsError(error.message);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => { if (activeTab === "carteira") loadClubEvents(); }, [activeTab, loadClubEvents]);

  async function updateRsvp(eventId, status) {
    await api(`/api/events/${eventId}/rsvp`, { method: "POST", body: JSON.stringify({ status }) });
    await loadClubEvents();
  }

  const loadAdminData = useCallback(async () => {
    if (!isDiretoria) return;
    setAdminLoading(true);
    try {
      const [overviewData, membersData, partnersData, contentData] = await Promise.all([
        api("/api/admin/overview"),
        api("/api/admin/members"),
        api("/api/admin/partners"),
        api("/api/admin/club/content")
      ]);
      setAdminOverview(overviewData.overview);
      setAdminMembers(membersData.members || []);
      setAdminPartners(partnersData.partners || []);
      setClubContent({
        profile: contentData.profile || null,
        officers: contentData.officers || [],
        events: contentData.events || [],
        posts: contentData.posts || [],
        chapters: contentData.chapters || [],
        media: contentData.media || []
      });
    } finally { setAdminLoading(false); }
  }, [isDiretoria]);

  useEffect(() => { if (activeTab === "diretoria" && isDiretoria) loadAdminData(); }, [activeTab, isDiretoria, loadAdminData]);

  async function updateMember(id, field, value) {
    const endpoint = field === "patente" ? `/api/admin/members/${id}/patente` : `/api/admin/members/${id}/status`;
    await api(endpoint, { method: "PATCH", body: JSON.stringify({ [field]: value }) });
    await loadAdminData();
  }

  return (
    <main className="mc-app-shell page-shell min-h-screen pb-32 text-zinc-100">
      <header className="mc-app-header">
        <div className="mc-app-header-inner">
          <div className="mc-app-brand">
            <div className="mc-app-crest"><BrandCrest active={isActive} compact /></div>
            <div><p>SEDE DIGITAL</p><h1>IRMÃOS DO ASFALTO</h1></div>
          </div>
          <div className="mc-member-chip">
            <span className={isActive ? "is-active" : "is-inactive"}>{isActive ? "ESCUDO ATIVO" : "ESCUDO SUSPENSO"}</span>
            <div><b>{user.apelidoEstrada}</b><small>{user.patente}</small></div>
          </div>
          <div className="mc-app-actions">
            <button className="mc-icon-button" aria-label="Notificações"><Bell /></button>
            <button onClick={logout} className="mc-icon-button" aria-label="Sair"><LogOut /></button>
          </div>
        </div>
      </header>

      <div className="mc-app-main">
        <HeroBanner user={user} activeTab={activeTab} />
        <div className="mc-app-tabstage">
          {activeTab === "escudo" && <EscudoTab user={user} isActive={isActive} qr={qr} loadingQr={loadingQr} qrError={qrError} secondsRemaining={secondsRemaining} onRefresh={loadQr} />}
          {activeTab === "beneficios" && <BeneficiosTab benefits={benefits} loading={benefitsLoading} error={benefitsError} />}
          {activeTab === "carteira" && <ClubeTab isActive={isActive} events={clubEvents} loading={eventsLoading} error={eventsError} onRsvp={updateRsvp} isDiretoria={isDiretoria} onEventsRefresh={loadClubEvents} />}
          {activeTab === "sos" && <SosTab />}
          {activeTab === "perfil" && <PerfilTab user={user} />}
          {activeTab === "diretoria" && isDiretoria && <DiretoriaTab overview={adminOverview} members={adminMembers} partners={adminPartners} clubContent={clubContent} loading={adminLoading} onUpdateMember={updateMember} onRefresh={loadAdminData} />}
        </div>
      </div>
      <BottomDock activeTab={activeTab} onChange={setActiveTab} isDiretoria={isDiretoria} />
    </main>
  );
}
