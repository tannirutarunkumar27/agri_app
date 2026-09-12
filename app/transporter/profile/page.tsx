'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Truck,
  ShieldCheck,
  Star,
  PlusCircle,
  MapPin,
  PhoneCall,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  Building,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function TransporterProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Edit Profile form state
  const [businessName, setBusinessName] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [baseLocation, setBaseLocation] = useState('')
  const [serviceArea, setServiceArea] = useState<string[]>([])

  // Add Vehicle modal state
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
  const [vehicleType, setVehicleType] = useState('Pickup Truck / Bolero Maxi (2-3T)')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [capacity, setCapacity] = useState<number>(30)
  const [refrigerationAvailable, setRefrigerationAvailable] = useState(false)
  const [addingVehicle, setAddingVehicle] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/marketplace/logistics/transporters/me')
      const data = await res.json()
      if (data.success && data.transporter) {
        setProfile(data.transporter)
        setBusinessName(data.transporter.businessName || '')
        setContactName(data.transporter.contactName || '')
        setPhone(data.transporter.phone || '')
        setBaseLocation(data.transporter.baseLocation || '')
        setServiceArea(data.transporter.serviceArea || ['Maharashtra'])
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFeedbackMsg(null)
    try {
      const res = await fetch('/api/marketplace/logistics/transporters/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          contactName,
          phone,
          baseLocation,
          serviceArea
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: 'Transporter profile updated successfully!' })
        fetchProfile()
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to update profile' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingVehicle(true)
    setFeedbackMsg(null)
    try {
      const res = await fetch('/api/marketplace/logistics/transporters/me/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleType,
          registrationNumber,
          capacity,
          refrigerationAvailable
        })
      })

      const data = await res.json()
      if (data.success) {
        setFeedbackMsg({ type: 'success', text: 'Vehicle registered in fleet successfully!' })
        setShowAddVehicleModal(false)
        setRegistrationNumber('')
        fetchProfile()
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to add vehicle' })
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error occurred' })
    } finally {
      setAddingVehicle(false)
    }
  }

  const toggleServiceAreaState = (stateName: string) => {
    if (serviceArea.includes(stateName)) {
      setServiceArea(serviceArea.filter((s) => s !== stateName))
    } else {
      setServiceArea([...serviceArea, stateName])
    }
  }

  const allAvailableStates = [
    'Maharashtra',
    'Madhya Pradesh',
    'Gujarat',
    'Karnataka',
    'Telangana',
    'Andhra Pradesh',
    'Rajasthan'
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Loading Transporter Profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white pb-20">
      {/* Top Banner */}
      <div className="bg-slate-900 px-4 py-1.5 text-center text-xs font-semibold text-slate-200 dark:bg-slate-950 flex items-center justify-center gap-3">
        <span>🚛 <strong>Transporter Fleet & Profile Management:</strong> Build Carrier Credibility & Expand Service Corridors</span>
      </div>

      {/* Nav */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/transporter/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 dark:text-slate-300">
            <ChevronLeft className="h-4 w-4" />
            <span>Transporter Dashboard</span>
          </Link>

          <Link
            href="/transporter/dashboard"
            className="rounded-full bg-blue-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800"
          >
            View Available Jobs →
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 space-y-6">
        {/* Profile Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Truck className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 dark:text-white">
                    {profile?.businessName || 'Your Fleet Profile'}
                  </h1>
                  {profile?.verificationStatus === 'VERIFIED' ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Verified Carrier
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Verification Pending
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Contact: {profile?.contactName} · +91 {profile?.phone} · Base: {profile?.baseLocation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-2 text-center dark:bg-slate-800">
                <div className="text-xs text-slate-400 font-semibold">Trips Done</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">{profile?.totalCompletedJobs || 0}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-2 text-center dark:bg-slate-800">
                <div className="text-xs text-slate-400 font-semibold">Rating</div>
                <div className="text-lg font-black text-amber-500 flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span>{Number(profile?.rating || 5.0).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`flex items-center justify-between rounded-2xl p-3.5 text-xs font-bold border ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        {/* Section 1: Fleet Vehicle Manager */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Registered Fleet Vehicles</h2>
              <p className="text-xs text-slate-500">
                Add your trucks, pickups, or reefer vans to bid on higher-capacity and cold-chain cargo.
              </p>
            </div>

            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="rounded-full bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800 flex items-center gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {profile?.vehicles && profile.vehicles.length > 0 ? (
              profile.vehicles.map((v: any) => (
                <div
                  key={v.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white">{v.registrationNumber}</span>
                      {v.refrigerationAvailable && (
                        <span className="rounded bg-cyan-100 px-1.5 py-0.2 text-[9px] font-black text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                          ❄ Reefer
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">{v.vehicleType}</div>
                    <div className="text-[11px] text-slate-400">
                      Capacity: <strong className="text-slate-700 dark:text-slate-200">{v.capacity} {v.capacityUnit}</strong>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {v.vehicleStatus}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 col-span-2 text-center py-4">
                No extra vehicles registered yet. Click "Add Vehicle" to register your fleet trucks.
              </p>
            )}
          </div>
        </div>

        {/* Section 2: Edit Business & Service Area */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
            Business Details & Haulage Corridors
          </h2>

          <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Business / Agency Name: *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Contact Person: *
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dispatch Phone Number: *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Base Location (City / Mandi Hub): *
                </label>
                <input
                  type="text"
                  required
                  value={baseLocation}
                  onChange={(e) => setBaseLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Service Area Selection */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Active Service Corridors (States where your fleet operates):
              </label>
              <div className="flex flex-wrap gap-2">
                {allAvailableStates.map((st) => {
                  const selected = serviceArea.includes(st)
                  return (
                    <button
                      type="button"
                      key={st}
                      onClick={() => toggleServiceAreaState(st)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        selected
                          ? 'bg-blue-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {selected ? `✓ ${st}` : `+ ${st}`}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-700 px-6 py-2.5 font-bold text-white shadow-sm hover:bg-blue-800 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* ADD VEHICLE MODAL */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold">Register Fleet Vehicle</h3>
              <button
                onClick={() => setShowAddVehicleModal(false)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Vehicle Registration Number (RTO): *
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g. MH-12-AB-9876"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Vehicle Type / Classification: *
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Tata Ace / Small Commercial Vehicle (1-1.5T)">Tata Ace / SCV (1-1.5T)</option>
                  <option value="Pickup Truck / Bolero Maxi (2-3T)">Pickup Truck / Bolero (2-3T)</option>
                  <option value="Medium Commercial Vehicle / Eicher (7-10T)">Medium Truck / Eicher (7-10T)</option>
                  <option value="Heavy Multi-Axle Truck (16-25T)">Heavy Multi-Axle Truck (16-25T)</option>
                  <option value="Refrigerated Reefer Container">Refrigerated Reefer Van</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Carrying Capacity (in Quintals): *
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-[11px] text-slate-400">1 Tonne = 10 Quintals</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reeferCheck"
                  checked={refrigerationAvailable}
                  onChange={(e) => setRefrigerationAvailable(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="reeferCheck" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Equipped with active cold-chain refrigeration unit (for fruits, vegetables & flowers)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingVehicle}
                  className="rounded-xl bg-blue-700 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-800 transition disabled:opacity-50"
                >
                  {addingVehicle ? 'Registering...' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
