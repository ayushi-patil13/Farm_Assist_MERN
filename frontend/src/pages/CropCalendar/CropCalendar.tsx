import React, { useEffect, useState } from "react";
import axios from "axios";
import { IonPage, IonContent, useIonRouter } from "@ionic/react"; // Added useIonRouter
import "./CropCalendar.css";
import Footer from "../../components/Footer";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
// Removed useHistory import

const localizer = momentLocalizer(moment);

const token = localStorage.getItem("token");
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { Authorization: `Bearer ${token}` },
});

interface Crop { _id: string; cropName: string; plantedDate: string; }
interface CalendarData {
  cropName: string; season: string; sowingPeriod: string;
  irrigationFrequencyDays: number; pestCheckAfterDays: number;
  harvestAfterDays: number;
  fertilizerSchedule: { stage: string; daysAfterSowing: number }[];
}
interface Activity {
  _id: string; activityType: string; stage: string;
  scheduledDate: string; status: string;
}
interface CalendarEvent { title: string; start: Date; end: Date; type: string; }

const ACTIVITY_META: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  fertilizer: { color: "#D97706", bg: "#FEF3C7", icon: "🌿", label: "Fertilizer" },
  irrigation:  { color: "#2563EB", bg: "#DBEAFE", icon: "💧", label: "Irrigation" },
  pest_check:  { color: "#DC2626", bg: "#FEE2E2", icon: "🐛", label: "Pest Check" },
  harvest:     { color: "#16A34A", bg: "#DCFCE7", icon: "🌾", label: "Harvest"    },
};

const CropCalendar: React.FC = () => {
  const router = useIonRouter(); // Switched from useHistory
  const [crops, setCrops]                   = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState("");
  const [calendarData, setCalendarData]     = useState<CalendarData | null>(null);
  const [activities, setActivities]         = useState<Activity[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [sowingDate, setSowingDate]         = useState("");
  const [calendarDate, setCalendarDate]     = useState(new Date());
  const [generating, setGenerating]         = useState(false);
  const [feedback, setFeedback]             = useState<{ msg: string; ok: boolean } | null>(null);
  const [activeTab, setActiveTab]           = useState<"calendar" | "list">("calendar");

  useEffect(() => {
    API.get("/crops/my").then(r => setCrops(r.data)).catch(console.error);
  }, []);

  const loadCalendar = async (cropName: string) => {
    try { const r = await API.get(`/crop-calendar/${cropName}`); setCalendarData(r.data); }
    catch (e) { console.error(e); }
  };

  const loadActivities = async (cropId: string) => {
    try {
      const r = await API.get(`/crop-calendar/schedule/${cropId}`);
      const data: Activity[] = r.data;
      setActivities(data);
      const events: CalendarEvent[] = data.map(a => {
        const start = new Date(a.scheduledDate);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        const meta = ACTIVITY_META[a.activityType];
        return {
          title: `${meta?.icon || ""} ${a.activityType.replace("_"," ")}${a.stage ? " · " + a.stage : ""}`,
          start, end, type: a.activityType
        };
      });
      setCalendarEvents(events);
      if (events.length > 0) setCalendarDate(events[0].start);
    } catch (e) { console.error(e); }
  };

  const handleCropChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cropId = e.target.value;
    setSelectedCropId(cropId);
    setActivities([]); setCalendarEvents([]); setCalendarData(null); setFeedback(null);
    const crop = crops.find(c => c._id === cropId);
    if (crop) {
      loadCalendar(crop.cropName);
      loadActivities(cropId);
      setSowingDate(crop.plantedDate?.split("T")[0] || "");
    }
  };

  const generateSchedule = async () => {
    if (!sowingDate) { setFeedback({ msg: "Please enter a sowing date first.", ok: false }); return; }
    setGenerating(true); setFeedback(null);
    try {
      await API.post(`/crop-calendar/generate/${selectedCropId}`, { sowingDate });
      await loadActivities(selectedCropId);
      setFeedback({ msg: "Schedule generated successfully!", ok: true });
    } catch { setFeedback({ msg: "Failed to generate schedule. Please try again.", ok: false }); }
    finally { setGenerating(false); }
  };

  const completeActivity = async (activityId: string) => {
    try { await API.post(`/crop-calendar/complete/${activityId}`); await loadActivities(selectedCropId); }
    catch (e) { console.error(e); }
  };

  const eventPropGetter = (event: CalendarEvent) => {
    const meta = ACTIVITY_META[event.type] || ACTIVITY_META.harvest;
    return {
      style: {
        backgroundColor: meta.color, border: "none", borderRadius: "6px",
        color: "#fff", fontSize: "12px", padding: "2px 8px", fontWeight: 500,
      }
    };
  };

  const harvestEst = calendarData && sowingDate
    ? new Date(new Date(sowingDate).getTime() + calendarData.harvestAfterDays * 86400000)
    : null;

  const pending   = activities.filter(a => a.status !== "completed").length;
  const completed = activities.filter(a => a.status === "completed").length;
  const selectedCrop = crops.find(c => c._id === selectedCropId);

  return (
     <IonPage>
      <IonContent fullscreen>
        <div className="wcc-page">

          {/* ── TOP NAV BAR ── */}
          <nav className="wcc-nav">
            {/* Updated onClick to use router.back() */}
            <button className="wcc-nav-back" onClick={() => router.back()}>
              Back
            </button>
            <div className="wcc-nav-center">
              <span className="wcc-nav-logo">🌾</span>
              <span className="wcc-nav-title">Crop Calendar</span>
            </div>
            <div className="wcc-nav-right">
              {activities.length > 0 && (
                <span className="wcc-nav-badge">{pending} task{pending !== 1 ? "s" : ""} pending</span>
              )}
            </div>
          </nav>

          {/* ── HERO BANNER ── */}
          <div className="wcc-hero">
            <div className="wcc-hero-inner">
              <div>
                <h1 className="wcc-hero-title">
                  {selectedCrop ? `${selectedCrop.cropName} Schedule` : "Your Personalized Crop Calendar"}
                </h1>
                <p className="wcc-hero-sub">
                  {selectedCrop && calendarData
                    ? `${calendarData.season} season · Sow ${calendarData.sowingPeriod} · Harvest in ${calendarData.harvestAfterDays} days`
                    : "Select a crop to generate your personalized sowing, irrigation and harvest schedule"}
                </p>
              </div>
              {activities.length > 0 && (
                <div className="wcc-hero-stats">
                  <div className="wcc-hstat">
                    <span className="wcc-hstat-n">{activities.length}</span>
                    <span className="wcc-hstat-l">Total tasks</span>
                  </div>
                  <div className="wcc-hstat-sep"/>
                  <div className="wcc-hstat">
                    <span className="wcc-hstat-n" style={{ color: "#FDE68A" }}>{pending}</span>
                    <span className="wcc-hstat-l">Pending</span>
                  </div>
                  <div className="wcc-hstat-sep"/>
                  <div className="wcc-hstat">
                    <span className="wcc-hstat-n" style={{ color: "#BBF7D0" }}>{completed}</span>
                    <span className="wcc-hstat-l">Completed</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div className="wcc-body">

            {/* ── LEFT SIDEBAR ── */}
            <aside className="wcc-sidebar">

              {/* Crop selector */}
              <div className="wcc-panel">
                <h3 className="wcc-panel-title">Select Crop</h3>
                {crops.length === 0 ? (
                  <div className="wcc-empty">
                    <span style={{ fontSize: "32px" }}>🌱</span>
                    <p className="wcc-empty-title">No crops yet</p>
                    <p className="wcc-empty-sub">Add a crop to get started</p>
                    {/* Updated history.push to router.push */}
                    <button className="wcc-btn-primary" onClick={() => router.push("/add-crop", "forward")}>
                      + Add Crop
                    </button>
                  </div>
                ) : (
                  <div className="wcc-select-wrap">
                    <select className="wcc-select" value={selectedCropId} onChange={handleCropChange}>
                      <option value="">Choose a crop...</option>
                      {crops.map(c => <option key={c._id} value={c._id}>{c.cropName}</option>)}
                    </select>
                    <svg className="wcc-sel-arr" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Ideal schedule info */}
              {calendarData && (
                <div className="wcc-panel">
                  <h3 className="wcc-panel-title">Ideal Schedule</h3>
                  <div className="wcc-info-list">
                    <div className="wcc-info-row">
                      <span className="wcc-info-icon" style={{ background: "#DCFCE7" }}>🌱</span>
                      <div>
                        <p className="wcc-info-label">Sowing Period</p>
                        <p className="wcc-info-val">{calendarData.sowingPeriod}</p>
                      </div>
                    </div>
                    <div className="wcc-info-row">
                      <span className="wcc-info-icon" style={{ background: "#DBEAFE" }}>💧</span>
                      <div>
                        <p className="wcc-info-label">Irrigation</p>
                        <p className="wcc-info-val">Every {calendarData.irrigationFrequencyDays} days</p>
                      </div>
                    </div>
                    <div className="wcc-info-row">
                      <span className="wcc-info-icon" style={{ background: "#FEE2E2" }}>🐛</span>
                      <div>
                        <p className="wcc-info-label">First Pest Check</p>
                        <p className="wcc-info-val">Day {calendarData.pestCheckAfterDays}</p>
                      </div>
                    </div>
                    <div className="wcc-info-row">
                      <span className="wcc-info-icon" style={{ background: "#FEF3C7" }}>🌿</span>
                      <div>
                        <p className="wcc-info-label">Fertilizer Applications</p>
                        {calendarData.fertilizerSchedule.map((f, i) => (
                          <p key={i} className="wcc-info-val">{f.stage} — Day {f.daysAfterSowing}</p>
                        ))}
                      </div>
                    </div>
                    <div className="wcc-info-row" style={{ borderBottom: "none" }}>
                      <span className="wcc-info-icon" style={{ background: "#DCFCE7" }}>🌾</span>
                      <div>
                        <p className="wcc-info-label">Expected Harvest</p>
                        <p className="wcc-info-val">{calendarData.harvestAfterDays} days</p>
                        {harvestEst && (
                          <p className="wcc-info-est">
                            {harvestEst.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate schedule */}
              {selectedCropId && (
                <div className="wcc-panel">
                  <h3 className="wcc-panel-title">Generate Schedule</h3>
                  <label className="wcc-field-label">Actual Sowing Date</label>
                  <input
                    type="date"
                    className="wcc-date-input"
                    value={sowingDate}
                    onChange={e => setSowingDate(e.target.value)}
                  />
                  <button
                    className="wcc-btn-primary wcc-btn-full"
                    onClick={generateSchedule}
                    disabled={generating}
                  >
                    {generating ? <><span className="wcc-spin"/> Generating...</> : "Generate My Schedule"}
                  </button>
                  {feedback && (
                    <div className={`wcc-feedback ${feedback.ok ? "wcc-fb-ok" : "wcc-fb-err"}`}>
                      {feedback.ok ? "✓" : "✕"} {feedback.msg}
                    </div>
                  )}
                </div>
              )}

              {/* Legend */}
              {activities.length > 0 && (
                <div className="wcc-panel">
                  <h3 className="wcc-panel-title">Activity Types</h3>
                  <div className="wcc-legend">
                    {Object.entries(ACTIVITY_META).map(([key, meta]) => (
                      <div key={key} className="wcc-legend-row">
                        <span className="wcc-legend-dot" style={{ background: meta.color }}/>
                        <span className="wcc-legend-icon">{meta.icon}</span>
                        <span className="wcc-legend-name">{meta.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* ── MAIN PANEL ── */}
            <main className="wcc-main">

              {!selectedCropId && (
                <div className="wcc-start-prompt">
                  <span style={{ fontSize: "56px" }}>🗓️</span>
                  <h2 className="wcc-start-title">Select a crop to begin</h2>
                  <p className="wcc-start-sub">Choose one of your crops from the left panel to view its ideal farming schedule and generate a personalised activity calendar.</p>
                </div>
              )}

              {activities.length > 0 && (
                <>
                  {/* Tab bar */}
                  <div className="wcc-tabs">
                    <button
                      className={`wcc-tab ${activeTab === "calendar" ? "wcc-tab-active" : ""}`}
                      onClick={() => setActiveTab("calendar")}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: "6px" }}>
                        <rect x="1" y="2" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M1 6H15M5 1V3M11 1V3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                      Calendar View
                    </button>
                    <button
                      className={`wcc-tab ${activeTab === "list" ? "wcc-tab-active" : ""}`}
                      onClick={() => setActiveTab("list")}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: "6px" }}>
                        <path d="M5 4H13M5 8H13M5 12H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                        <circle cx="2.5" cy="4" r="1" fill="currentColor"/>
                        <circle cx="2.5" cy="8" r="1" fill="currentColor"/>
                        <circle cx="2.5" cy="12" r="1" fill="currentColor"/>
                      </svg>
                      Activity List
                      <span className="wcc-tab-count">{activities.length}</span>
                    </button>
                  </div>

                  {/* Calendar */}
                  {activeTab === "calendar" && (
                    <div className="wcc-cal-wrap">
                      <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        date={calendarDate}
                        onNavigate={d => setCalendarDate(d)}
                        views={["month", "week"]}
                        defaultView="month"
                        toolbar={true}
                        style={{ height: 580 }}
                        eventPropGetter={eventPropGetter}
                      />
                    </div>
                  )}

                  {/* Activity list */}
                  {activeTab === "list" && (
                    <div className="wcc-table-wrap">
                      <table className="wcc-table">
                        <thead>
                          <tr>
                            <th>Activity</th>
                            <th>Stage</th>
                            <th>Scheduled Date</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activities.map((a, i) => {
                            const meta = ACTIVITY_META[a.activityType] || ACTIVITY_META.harvest;
                            const done = a.status === "completed";
                            return (
                              <tr key={a._id || i} className={done ? "wcc-row-done" : ""}>
                                <td>
                                  <div className="wcc-td-activity">
                                    <span className="wcc-td-icon" style={{ background: meta.bg }}>{meta.icon}</span>
                                    <span className="wcc-td-name" style={{ color: meta.color }}>{meta.label}</span>
                                  </div>
                                </td>
                                <td className="wcc-td-stage">{a.stage || "—"}</td>
                                <td className="wcc-td-date">
                                  {new Date(a.scheduledDate).toLocaleDateString("en-IN", {
                                    weekday: "short", day: "numeric", month: "short", year: "numeric"
                                  })}
                                </td>
                                <td>
                                  <span className={done ? "wcc-badge-done" : "wcc-badge-pending"}>
                                    {done ? "Completed" : "Pending"}
                                  </span>
                                </td>
                                <td>
                                  {!done && (
                                    <button className="wcc-action-btn" onClick={() => completeActivity(a._id)}>
                                      Mark as done
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {selectedCropId && activities.length === 0 && calendarData && (
                <div className="wcc-start-prompt">
                  <span style={{ fontSize: "48px" }}>📋</span>
                  <h2 className="wcc-start-title">No schedule generated yet</h2>
                  <p className="wcc-start-sub">Enter your actual sowing date in the left panel and click "Generate My Schedule" to create your personalized activity plan.</p>
                </div>
              )}
            </main>
          </div>

          <Footer />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CropCalendar;