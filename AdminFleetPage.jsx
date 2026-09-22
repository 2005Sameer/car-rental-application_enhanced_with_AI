import React, { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { AdminService } from "../../services/admin.js";
import CarThumb from "../../components/CarThumb.jsx";
import PhotoUploadButton from "../../components/PhotoUploadButton.jsx";
import { fmt } from "../../data/extras.js";

const EMPTY = { name: "", type: "Sedan", seats: 5, trans: "Auto", power: "", rangeLabel: "", price: 50, location: "Downtown Hub" };
const TYPES = ["Sedan", "SUV", "Sports", "Electric", "Compact"];
const LOCATIONS = ["Downtown Hub", "Airport North", "Central Station"];

export default function AdminFleetPage() {
  const [cars, setCars] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    AdminService.fleet().then(res => setCars(res.cars)).catch(err => setError(err.message)).finally(() => setLoading(false));
  }
  useEffect(load, []);

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function createCar(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await AdminService.createCar({ ...form, seats: Number(form.seats), price: Number(form.price) });
      setForm(EMPTY);
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
    await AdminService.updateCar(car.id, { status });
    load();
  }

  async function removeCar(id) {
    await AdminService.deleteCar(id);
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 className="disp" style={{ fontSize: 28, margin: 0 }}>Fleet</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setFormOpen(o => !o)}>
          {formOpen ? <X size={15} /> : <Plus size={15} />} {formOpen ? "Cancel" : "Add vehicle"}
        </button>
      </div>

      {formOpen && (
        <form className="form-card" onSubmit={createCar} style={{ marginBottom: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <div className="field"><label>Name</label><div className="field-input"><input required value={form.name} onChange={e => updateField("name", e.target.value)} /></div></div>
          <div className="field"><label>Type</label><div className="field-input"><select value={form.type} onChange={e => updateField("type", e.target.value)}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div></div>
          <div className="field"><label>Location</label><div className="field-input"><select value={form.location} onChange={e => updateField("location", e.target.value)}>{LOCATIONS.map(l => <option key={l}>{l}</option>)}</select></div></div>
          <div className="field"><label>Seats</label><div className="field-input"><input type="number" min="1" value={form.seats} onChange={e => updateField("seats", e.target.value)} /></div></div>
          <div className="field"><label>Transmission</label><div className="field-input"><input value={form.trans} onChange={e => updateField("trans", e.target.value)} placeholder="Auto" /></div></div>
          <div className="field"><label>Power</label><div className="field-input"><input value={form.power} onChange={e => updateField("power", e.target.value)} placeholder="210 hp" /></div></div>
          <div className="field"><label>Range / economy</label><div className="field-input"><input value={form.rangeLabel} onChange={e => updateField("rangeLabel", e.target.value)} placeholder="34 mpg" /></div></div>
          <div className="field"><label>Price / day</label><div className="field-input"><input type="number" min="1" value={form.price} onChange={e => updateField("price", e.target.value)} /></div></div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="btn btn-primary btn-block" disabled={saving}>{saving ? "Saving..." : "Save vehicle"}</button>
          </div>
        </form>
      )}
      <p style={{ color: "var(--muted-2)", fontSize: 12.5, marginTop: -12, marginBottom: 16 }}>
        Photos are added after saving — use the "Add"/"Replace" button per row below.
      </p>

      {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
      {loading ? (
        <div className="state-block">Loading...</div>
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
                    <span
                      className={"badge badge-" + (car.status === "available" ? "available" : "maintenance")}
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleStatus(car)}
                      title="Click to toggle"
                    >
                      {car.status}
                    </span>
                  </td>
                  <td>
                    <PhotoUploadButton label={car.imageUrl ? "Replace" : "Add"} onUpload={(file) => AdminService.uploadCarImage(car.id, file).then(load)} />
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeCar(car.id)} aria-label="Remove vehicle">
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
