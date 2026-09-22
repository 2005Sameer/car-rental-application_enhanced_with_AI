import React, { useEffect, useState } from "react";
import { Plus, X, Trash2, Image as ImageIcon } from "lucide-react";
import { OwnerService } from "../../services/owner.js";
import CarThumb from "../../components/CarThumb.jsx";
import PhotoUploadButton from "../../components/PhotoUploadButton.jsx";
import { fmt } from "../../data/extras.js";

const EMPTY = { name: "", type: "Sedan", seats: 5, trans: "Auto", power: "", rangeLabel: "", price: 45, location: "Downtown Hub" };
const TYPES = ["Sedan", "SUV", "Sports", "Electric", "Compact"];
const LOCATIONS = ["Downtown Hub", "Airport North", "Central Station"];

export default function HostListingsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    OwnerService.listings().then(res => setCars(res.cars)).catch(err => setError(err.message)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function onPickPhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function createListing(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await OwnerService.createListing(form);
      if (photoFile) {
        await OwnerService.uploadImage(res.car.id, photoFile);
      }
      setForm(EMPTY);
      setPhotoFile(null);
      setPhotoPreview("");
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(car) {
    const status = car.status === "available" ? "maintenance" : "available";
    await OwnerService.updateListing(car.id, { status });
    load();
  }

  async function removeListing(id) {
    await OwnerService.deleteListing(id);
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="disp" style={{ fontSize: 20, margin: 0 }}>My cars</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setFormOpen(o => !o)}>
          {formOpen ? <X size={15} /> : <Plus size={15} />} {formOpen ? "Cancel" : "List a car"}
        </button>
      </div>

      {formOpen && (
        <form className="form-card" onSubmit={createListing} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{
              width: 88, height: 88, borderRadius: 8, border: "1px dashed var(--edge)", background: "var(--panel-2)",
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0,
            }}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <ImageIcon size={22} style={{ color: "var(--muted-2)" }} />
              )}
            </div>
            <div className="field">
              <label>Photo (optional)</label>
              <div className="field-input">
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPickPhoto} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 14 }}>
            <div className="field"><label>Name</label><div className="field-input"><input required value={form.name} onChange={e => updateField("name", e.target.value)} placeholder="e.g. My Tesla Model 3" /></div></div>
            <div className="field"><label>Type</label><div className="field-input"><select value={form.type} onChange={e => updateField("type", e.target.value)}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div></div>
            <div className="field"><label>Your location</label><div className="field-input"><select value={form.location} onChange={e => updateField("location", e.target.value)}>{LOCATIONS.map(l => <option key={l}>{l}</option>)}</select></div></div>
            <div className="field"><label>Seats</label><div className="field-input"><input type="number" min="1" value={form.seats} onChange={e => updateField("seats", e.target.value)} /></div></div>
            <div className="field"><label>Transmission</label><div className="field-input"><input value={form.trans} onChange={e => updateField("trans", e.target.value)} placeholder="Auto" /></div></div>
            <div className="field"><label>Power</label><div className="field-input"><input value={form.power} onChange={e => updateField("power", e.target.value)} placeholder="210 hp" /></div></div>
            <div className="field"><label>Range / economy</label><div className="field-input"><input value={form.rangeLabel} onChange={e => updateField("rangeLabel", e.target.value)} placeholder="34 mpg" /></div></div>
            <div className="field"><label>Price / day</label><div className="field-input"><input type="number" min="1" value={form.price} onChange={e => updateField("price", e.target.value)} /></div></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="btn btn-primary btn-block" disabled={saving}>{saving ? "Publishing..." : "Publish listing"}</button>
            </div>
          </div>
        </form>
      )}

      {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
      {loading ? (
        <div className="state-block">Loading...</div>
      ) : cars.length === 0 ? (
        <div className="state-block">You haven't listed a car yet. Publish one above to start earning from it.</div>
      ) : (
        <div className="card panel-pad">
          <table className="table">
            <thead>
              <tr><th>Vehicle</th><th>Type</th><th>Location</th><th>Price/day</th><th>Status</th><th>Photo</th><th /></tr>
            </thead>
            <tbody>
              {cars.map(car => (
                <tr key={car.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <CarThumb car={car} />
                      {car.name}
                    </div>
                  </td>
                  <td>{car.type}</td>
                  <td>{car.location}</td>
                  <td className="mono">{fmt(car.price)}</td>
                  <td>
                    <span className={"badge badge-" + (car.status === "available" ? "available" : "maintenance")} style={{ cursor: "pointer" }} onClick={() => toggleStatus(car)} title="Click to toggle">
                      {car.status}
                    </span>
                  </td>
                  <td>
                    <PhotoUploadButton label={car.imageUrl ? "Replace" : "Add"} onUpload={(file) => OwnerService.uploadImage(car.id, file).then(load)} />
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeListing(car.id)} aria-label="Remove listing">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
