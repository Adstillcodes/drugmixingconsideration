import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

const commonConditions = [
  'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Heart Disease',
  'Asthma', 'COPD', 'Kidney Disease', 'Liver Disease', 'Thyroid Disorder',
  'Depression', 'Anxiety', 'Arthritis'
];

const commonDrugs = [
  { name: 'Metformin', category: 'Antidiabetic', dosage: '500mg' },
  { name: 'Lisinopril', category: 'ACE Inhibitor', dosage: '10mg' },
  { name: 'Atorvastatin', category: 'Statin', dosage: '20mg' },
  { name: 'Amlodipine', category: 'Calcium Channel Blocker', dosage: '5mg' },
  { name: 'Omeprazole', category: 'PPI', dosage: '20mg' },
  { name: 'Metoprolol', category: 'Beta Blocker', dosage: '50mg' },
  { name: 'Losartan', category: 'ARB', dosage: '50mg' },
  { name: 'Gabapentin', category: 'Anticonvulsant', dosage: '300mg' },
  { name: 'Warfarin', category: 'Anticoagulant', dosage: '5mg' },
  { name: 'Aspirin', category: 'NSAID', dosage: '81mg' },
  { name: 'Ibuprofen', category: 'NSAID', dosage: '400mg' },
  { name: 'Amoxicillin', category: 'Antibiotic', dosage: '500mg' },
  { name: 'Azithromycin', category: 'Antibiotic', dosage: '250mg' },
  { name: 'Prednisone', category: 'Corticosteroid', dosage: '10mg' },
  { name: 'Levothyroxine', category: 'Thyroid', dosage: '50mcg' },
];

export default function IntakeForm() {
  const {
    userData,
    updateUserData,
    addMedication,
    removeMedication,
    addCondition,
    removeCondition,
    startAnalysis,
    setCurrentScreen,
  } = useApp();

  const [drugSearch, setDrugSearch] = useState('');
  const [conditionSearch, setConditionSearch] = useState('');
  const [showDrugDropdown, setShowDrugDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [editableMedications, setEditableMedications] = useState(userData.medications);
  const [editableConditions, setEditableConditions] = useState(userData.conditions);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const filteredDrugs = commonDrugs.filter(
    (drug) =>
      drug.name.toLowerCase().includes(drugSearch.toLowerCase()) &&
      !editableMedications.some((m) => m.name === drug.name)
  );

  const filteredConditions = commonConditions.filter(
    (condition) =>
      condition.toLowerCase().includes(conditionSearch.toLowerCase()) &&
      !editableConditions.includes(condition)
  );

  const handleAddDrug = (drug) => {
    const newMed = { ...drug, id: Date.now() };
    setEditableMedications([...editableMedications, newMed]);
    setDrugSearch('');
    setShowDrugDropdown(false);
  };

  const handleRemoveDrug = (drugName) => {
    setEditableMedications(editableMedications.filter((m) => m.name !== drugName));
  };

  const handleAddCondition = (condition) => {
    setEditableConditions([...editableConditions, condition]);
    setConditionSearch('');
    setShowConditionDropdown(false);
  };

  const handleRemoveCondition = (condition) => {
    setEditableConditions(editableConditions.filter((c) => c !== condition));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = () => {
    if (editableMedications.length < 2) {
      alert('Please add at least 2 medications to analyze interactions.');
      return;
    }
    
    if (!userData.gender || !userData.age) {
      alert('Please fill in your gender and age.');
      return;
    }
    
    updateUserData({
      medications: editableMedications,
      conditions: editableConditions,
      prescriptionFile: uploadedFile,
    });
    
    setCurrentScreen('processing');
    startAnalysis(editableMedications, editableConditions);
  };

  const isFormValid = userData.gender && userData.age && editableMedications.length >= 2;

  return (
    <div className="max-w-4xl mx-auto mb-6">
      {/* Warm Banner */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-secondary-container/40 border border-secondary-container text-on-secondary-container px-6 py-3 rounded-2xl flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" data-icon="volunteer_activism">volunteer_activism</span>
          <span className="font-medium">Your safety is why we ask this.</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto mb-12">
        <div className="relative overflow-hidden rounded-[2.5rem] h-[320px] flex items-center px-12 bg-primary">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/60" />
          <div className="relative z-10 max-w-lg">
            <h1 className="text-white text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
              Let's keep your medications in harmony
            </h1>
            <p className="text-white/90 text-lg leading-relaxed font-light">
              Our Friendly Audit tool helps you understand how your treatments interact, keeping your well-being at the heart of everything.
            </p>
          </div>
        </div>
      </section>

      {/* Main Form Card */}
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Step Indicators */}
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</span>
            <span className="text-sm font-semibold text-primary">Intake</span>
          </div>
          <div className="h-px flex-1 mx-4 bg-outline-variant" />
          <div className="flex items-center gap-2 opacity-40">
            <span className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-sm">2</span>
            <span className="text-sm font-medium">Analysis</span>
          </div>
          <div className="h-px flex-1 mx-4 bg-outline-variant" />
          <div className="flex items-center gap-2 opacity-40">
            <span className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-sm">3</span>
            <span className="text-sm font-medium">Result</span>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-surface-container-lowest rounded-[24px] p-10 shadow-xl border border-surface-container-high">
          <form className="space-y-12" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {/* Step 1: Prescription Type */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-on-surface/50 uppercase tracking-widest">
                Step 1: Prescription Type
              </label>
              <div className="grid grid-cols-2 gap-4 p-1.5 bg-surface-container-low rounded-2xl border border-surface-container-high">
                <button
                  type="button"
                  className={`py-4 px-6 rounded-xl font-bold transition-all ${
                    userData.prescriptionType === 'self'
                      ? 'bg-white shadow-md text-primary border border-primary/10'
                      : 'text-on-surface/60 hover:bg-white/50'
                  }`}
                  onClick={() => updateUserData({ prescriptionType: 'self' })}
                >
                  Self-prescribed
                </button>
                <button
                  type="button"
                  className={`py-4 px-6 rounded-xl font-medium transition-all ${
                    userData.prescriptionType === 'prescription'
                      ? 'bg-white shadow-md text-primary border border-primary/10'
                      : 'text-on-surface/60 hover:bg-white/50'
                  }`}
                  onClick={() => updateUserData({ prescriptionType: 'prescription' })}
                >
                  Active prescription
                </button>
              </div>
            </div>

            {/* Step 2: Demographics */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-bold text-on-surface/50 uppercase tracking-widest">
                  Step 2: Tell us a bit about yourself
                </label>
                <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <span className="text-on-surface font-semibold block text-sm">Biological Gender</span>
                  <select
                    className="w-full bg-surface-container-low border border-surface-container-high rounded-xl py-4 px-5 text-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                    value={userData.gender}
                    onChange={(e) => updateUserData({ gender: e.target.value })}
                  >
                    <option value="">Select gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Prefer not to say</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <span className="text-on-surface font-semibold block text-sm">Age</span>
                  <input
                    className="w-full bg-surface-container-low border border-surface-container-high rounded-xl py-4 px-5 text-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="Years"
                    type="number"
                    min="1"
                    max="120"
                    value={userData.age}
                    onChange={(e) => updateUserData({ age: e.target.value })}
                  />
                </div>

                {/* Pregnancy/Lactation Check - Show only for females */}
                {userData.gender === 'female' && (
                  <div className="md:col-span-2 p-6 bg-secondary-container/30 rounded-2xl border border-secondary-container/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-on-secondary-container text-3xl" data-icon="pregnant_woman">pregnant_woman</span>
                      <div>
                        <p className="font-bold text-on-secondary-container">Are you currently pregnant?</p>
                        <p className="text-sm text-on-secondary-container/70">Safety for you and your baby is our top priority.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className={`px-8 py-2.5 rounded-full font-bold transition-all ${
                          userData.pregnant === true
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white text-on-secondary-container border border-secondary-container shadow-sm'
                        }`}
                        onClick={() => updateUserData({ pregnant: true })}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`px-8 py-2.5 rounded-full font-bold transition-all ${
                          userData.pregnant === false
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white text-on-secondary-container border border-secondary-container shadow-sm'
                        }`}
                        onClick={() => updateUserData({ pregnant: false })}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}

                {/* Lactation Check */}
                {userData.gender === 'female' && (
                  <div className="md:col-span-2 p-6 bg-secondary-container/30 rounded-2xl border border-secondary-container/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-on-secondary-container text-3xl" data-icon="child_friendly">child_friendly</span>
                      <div>
                        <p className="font-bold text-on-secondary-container">Are you currently breastfeeding?</p>
                        <p className="text-sm text-on-secondary-container/70">Some medications can pass through breast milk.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className={`px-8 py-2.5 rounded-full font-bold transition-all ${
                          userData.lactating === true
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white text-on-secondary-container border border-secondary-container shadow-sm'
                        }`}
                        onClick={() => updateUserData({ lactating: true })}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        className={`px-8 py-2.5 rounded-full font-bold transition-all ${
                          userData.lactating === false
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white text-on-secondary-container border border-secondary-container shadow-sm'
                        }`}
                        onClick={() => updateUserData({ lactating: false })}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Medications */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-bold text-on-surface/50 uppercase tracking-widest">
                  Step 3: Medications
                </label>
                <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield
                </span>
              </div>
              
              {/* Drug Search */}
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface/40" data-icon="search">search</span>
                <input
                  className="w-full bg-surface-container-low border border-surface-container-high rounded-2xl py-5 pl-14 pr-5 text-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="Search drug name (e.g. Lisinopril, Ibuprofen)"
                  type="text"
                  value={drugSearch}
                  onChange={(e) => {
                    setDrugSearch(e.target.value);
                    setShowDrugDropdown(true);
                  }}
                  onFocus={() => setShowDrugDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDrugDropdown(false), 200)}
                />
                
                {/* Drug Dropdown */}
                {showDrugDropdown && filteredDrugs.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-surface-container-high max-h-60 overflow-y-auto">
                    {filteredDrugs.map((drug) => (
                      <div
                        key={drug.name}
                        className="px-5 py-3 hover:bg-surface-container-low cursor-pointer flex justify-between items-center"
                        onClick={() => handleAddDrug(drug)}
                      >
                        <div>
                          <span className="font-semibold text-on-surface">{drug.name}</span>
                          <span className="text-sm text-on-surface/60 ml-2">{drug.category}</span>
                        </div>
                        <span className="text-sm text-primary font-medium">{drug.dosage}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Medication Tags */}
              <div className="flex flex-wrap gap-3">
                {editableMedications.map((med) => (
                  <div
                    key={med.id || med.name}
                    className="bg-secondary-container text-on-secondary-container px-4 py-2.5 rounded-full flex items-center gap-2 font-semibold text-sm border border-secondary-container/50"
                  >
                    {med.name} {med.dosage && med.dosage}
                    <button
                      type="button"
                      className="material-symbols-outlined text-[18px] cursor-pointer hover:text-red-600"
                      onClick={() => handleRemoveDrug(med.name)}
                    >
                      close
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-primary font-bold text-sm py-2 px-4 hover:bg-primary/5 rounded-full transition-all"
                  onClick={() => document.querySelector('input[placeholder*="drug name"]').focus()}
                >
                  + Add medication
                </button>
              </div>
            </div>

            {/* Step 4: Conditions */}
            <div className="space-y-6">
              <label className="block text-xs font-bold text-on-surface/50 uppercase tracking-widest">
                Step 4: Pre-existing Conditions
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface/40" data-icon="medical_information">medical_information</span>
                <input
                  className="w-full bg-surface-container-low border border-surface-container-high rounded-2xl py-5 pl-14 pr-5 text-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="Search health conditions (e.g. Diabetes, Heart Disease)"
                  type="text"
                  value={conditionSearch}
                  onChange={(e) => {
                    setConditionSearch(e.target.value);
                    setShowConditionDropdown(true);
                  }}
                  onFocus={() => setShowConditionDropdown(true)}
                  onBlur={() => setTimeout(() => setShowConditionDropdown(false), 200)}
                />
                
                {/* Condition Dropdown */}
                {showConditionDropdown && filteredConditions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-surface-container-high max-h-60 overflow-y-auto">
                    {filteredConditions.map((condition) => (
                      <div
                        key={condition}
                        className="px-5 py-3 hover:bg-surface-container-low cursor-pointer"
                        onClick={() => handleAddCondition(condition)}
                      >
                        <span className="font-semibold text-on-surface">{condition}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Condition Tags */}
              <div className="flex flex-wrap gap-3">
                {editableConditions.map((condition) => (
                  <div
                    key={condition}
                    className="bg-primary-container/20 text-on-surface px-4 py-2.5 rounded-full flex items-center gap-2 font-semibold text-sm border border-primary-container/30"
                  >
                    {condition}
                    <button
                      type="button"
                      className="material-symbols-outlined text-[18px] cursor-pointer hover:text-red-600"
                      onClick={() => handleRemoveCondition(condition)}
                    >
                      close
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 5: Upload Prescription */}
            <div className="space-y-6">
              <label className="block text-xs font-bold text-on-surface/50 uppercase tracking-widest">
                Step 5: Upload Prescription (Optional)
              </label>
              <div
                className="border-2 border-dashed border-primary-container/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:bg-surface-container-low transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="w-16 h-16 bg-primary-container/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl" data-icon="add_a_photo">add_a_photo</span>
                </div>
                {uploadedFile ? (
                  <div>
                    <h3 className="text-on-surface font-bold text-lg">{uploadedFile.name}</h3>
                    <p className="text-on-surface/60 mt-1 max-w-[280px]">File uploaded successfully. Click to replace.</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-on-surface font-bold text-lg">Snap or Drag File</h3>
                    <p className="text-on-surface/60 mt-1 max-w-[280px]">Upload a photo of your prescription for an even faster analysis.</p>
                    <span className="mt-4 px-8 py-2.5 bg-primary-container text-white font-bold rounded-xl text-sm shadow-sm inline-block">
                      Choose File
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Final CTA */}
            <div className="pt-8">
              <button
                type="submit"
                className={`w-full py-6 rounded-[2rem] text-2xl font-bold shadow-lg transition-all animate-soft-pulse ${
                  isFormValid
                    ? 'bg-primary text-white shadow-primary/30 hover:shadow-xl hover:-translate-y-1 active:translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isFormValid}
              >
                Run Friendly Analysis
              </button>
              <p className="text-center text-on-surface/40 text-sm mt-6 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary" data-icon="lock" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                Your medical data is encrypted and HIPAA compliant.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
