import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { searchDrugs, processOCR } from '../services/api';

const commonConditions = [
  'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'Heart Disease',
  'Asthma', 'COPD', 'Kidney Disease', 'Liver Disease', 'Thyroid Disorder',
  'Depression', 'Anxiety', 'Arthritis'
];

function formatDrugName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function parseExtractedDrugName(rawText) {
  if (!rawText) return { name: '', dosage: '', form: '', brand: '' };
  
  const cleanedText = rawText.trim();
  
  const dosageMatch = cleanedText.match(/(\d+(?:\.\d+)?\s*(?:MG|ML|MCG|G))/i);
  const dosage = dosageMatch ? dosageMatch[1].toUpperCase() : '';
  
  let drugName = cleanedText
    .replace(/\d+\s*\(/g, '')
    .replace(/\)\s*\/\s*\d+/g, '/')
    .replace(/\(\s*Pack\s*\[.*?\]/gi, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\d+(?:\.\d+)?\s*(?:MG|ML|MCG|G)[^\s]*/gi, '')
    .replace(/\s*(?:Oral|Tablet|Capsule|Injection|Solution|Cream|Patch)/gi, '')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim();
  
  const nameParts = drugName.split('/').map(p => p.trim()).filter(p => p);
  if (nameParts.length > 0) {
    drugName = nameParts[0];
  }
  
  drugName = formatDrugName(drugName);
  
  return { name: drugName, dosage, form: '', brand: '' };
}

const commonDosages = [
  '10mg', '20mg', '25mg', '50mg', '100mg', '200mg', '500mg',
  '1mg', '5mg', '0.5mg', '0.25mg',
  '10mcg', '50mcg', '100mcg',
  '5ml', '10ml',
  '1 tablet', '2 tablets', 'As directed'
];

const commonTimings = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
  'Before breakfast', 'After breakfast', 'Before lunch', 'After lunch',
  'Before dinner', 'After dinner', 'At bedtime', 'As needed'
];

export default function IntakeForm() {
  const { t } = useTranslation();
  const {
    userData,
    updateUserData,
    startAnalysis,
    setCurrentScreen,
  } = useApp();

  const [drugSearch, setDrugSearch] = useState('');
  const [conditionSearch, setConditionSearch] = useState('');
  const [showDrugDropdown, setShowDrugDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [drugSearchResults, setDrugSearchResults] = useState([]);
  const [isSearchingDrugs, setIsSearchingDrugs] = useState(false);
  const [editableMedications, setEditableMedications] = useState(userData.medications);
  const [editableConditions, setEditableConditions] = useState(userData.conditions);
  const [editingDosage, setEditingDosage] = useState(null);
  const [editingTiming, setEditingTiming] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedMedications, setExtractedMedications] = useState([]);
  const [isProcessingPrescription, setIsProcessingPrescription] = useState(false);
  const [prescriptionProcessingStatus, setPrescriptionProcessingStatus] = useState('');
  const fileInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const filteredConditions = commonConditions.filter(
    (condition) =>
      condition.toLowerCase().includes(conditionSearch.toLowerCase()) &&
      !editableConditions.includes(condition)
  );

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (drugSearch.length < 2) {
      setDrugSearchResults([]);
      return;
    }

    setIsSearchingDrugs(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await searchDrugs(drugSearch, 15);
        const results = response.drugs || [];
        const filteredResults = results.filter(
          (drug) => !editableMedications.some((m) => m.name.toLowerCase() === drug.name.toLowerCase())
        );
        setDrugSearchResults(filteredResults);
      } catch (error) {
        console.error('Drug search error:', error);
        setDrugSearchResults([]);
      } finally {
        setIsSearchingDrugs(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [drugSearch, editableMedications]);

  const handleAddDrug = useCallback((drug) => {
    const requiresDosage = userData.prescriptionType === 'self';
    const newMed = {
      ...drug,
      id: Date.now(),
      dosage: drug.dosage || (requiresDosage ? '' : 'As prescribed'),
      requiresDosage: requiresDosage,
      timing: drug.timing || '',
    };
    setEditableMedications((prev) => [...prev, newMed]);
    setDrugSearch('');
    setShowDrugDropdown(false);
    setDrugSearchResults([]);
  }, [userData.prescriptionType]);

  const handleAddExtractedDrug = useCallback((drug) => {
    const parsed = parseExtractedDrugName(drug.name);
    
    const newMed = {
      name: parsed.name || formatDrugName(drug.name),
      dosage: drug.dosage && drug.dosage !== 'Not specified' ? drug.dosage : (parsed.dosage || 'As prescribed'),
      timing: drug.timing || '',
      category: drug.category || parsed.brand || 'Medication',
      id: `extracted-${Date.now()}-${Math.random()}`,
      source: 'prescription',
      fromOCR: true,
      requiresDosage: false,
    };
    setEditableMedications((prev) => {
      if (prev.some((m) => m.name.toLowerCase() === newMed.name.toLowerCase())) {
        return prev;
      }
      return [...prev, newMed];
    });
  }, []);

  const handleRemoveDrug = useCallback((drugName) => {
    setEditableMedications((prev) => prev.filter((m) => m.name !== drugName));
    setExtractedMedications((prev) => prev.filter((m) => m.name !== drugName));
  }, []);

  const handleDosageChange = useCallback((drugName, newDosage) => {
    setEditableMedications((prev) =>
      prev.map((m) => (m.name === drugName ? { ...m, dosage: newDosage } : m))
    );
    setEditingDosage(null);
  }, []);

  const handleTimingChange = useCallback((drugName, newTiming) => {
    setEditableMedications((prev) =>
      prev.map((m) => (m.name === drugName ? { ...m, timing: newTiming } : m))
    );
    setEditingTiming(null);
  }, []);

  const handleAddCondition = useCallback((condition) => {
    setEditableConditions((prev) => {
      if (prev.includes(condition)) return prev;
      return [...prev, condition];
    });
    setConditionSearch('');
    setShowConditionDropdown(false);
  }, []);

  const handleRemoveCondition = useCallback((condition) => {
    setEditableConditions((prev) => prev.filter((c) => c !== condition));
  }, []);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (file.type === 'application/pdf') {
          const base64 = result.split(',')[1];
          resolve(`data:application/pdf;base64,${base64}`);
        } else {
          resolve(result);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessingPrescription(true);
    setPrescriptionProcessingStatus(t('intake.upload.status.processing'));

    try {
      const base64 = await fileToBase64(file);
      setPrescriptionProcessingStatus(t('intake.upload.status.extracting'));
      
      const ocrResult = await processOCR(base64);

      let extractedMeds = [];

      if (ocrResult.success && ocrResult.medications) {
        extractedMeds = ocrResult.medications;
      }

      if (extractedMeds.length > 0) {
        setExtractedMedications(extractedMeds);
        extractedMeds.forEach((med) => handleAddExtractedDrug(med));
        setPrescriptionProcessingStatus(
          t('intake.upload.status.success', { count: extractedMeds.length })
        );
      } else {
        setPrescriptionProcessingStatus(t('intake.upload.status.noMedications'));
      }
    } catch (error) {
      console.error('Error processing prescription:', error);
      setPrescriptionProcessingStatus(t('intake.upload.status.failed'));
    } finally {
      setIsProcessingPrescription(false);
    }
  };

  const handleRemoveExtractedMed = useCallback((medName) => {
    setExtractedMedications((prev) => prev.filter((m) => m.name !== medName));
    setEditableMedications((prev) => prev.filter((m) => m.name !== medName));
  }, []);

  const handleSubmit = () => {
    const requiresDosage = userData.prescriptionType === 'self';

    const medsWithoutDosage = editableMedications.filter(
      (m) => requiresDosage && (!m.dosage || m.dosage.trim() === '')
    );

    if (requiresDosage && medsWithoutDosage.length > 0) {
      alert(`Please enter dosage for: ${medsWithoutDosage.map((m) => m.name).join(', ')}`);
      return;
    }

    if (editableMedications.length < 2) {
      alert(t('intake.validation.minMedications'));
      return;
    }

    if (!userData.gender || !userData.age) {
      alert(t('intake.validation.demographicsRequired'));
      return;
    }

    if (userData.prescriptionType === 'prescription' && !uploadedFile) {
      alert(t('intake.validation.prescriptionRequired'));
      return;
    }

    updateUserData({
      medications: editableMedications,
      conditions: editableConditions,
      prescriptionFile: uploadedFile,
      extractedMedications: extractedMedications,
    });

    setCurrentScreen('processing');
    startAnalysis(editableMedications, editableConditions);
  };

  const isFormValid =
    userData.gender &&
    userData.age &&
    editableMedications.length >= 2 &&
    editableMedications.every(
      (m) => !m.requiresDosage || (m.dosage && m.dosage.trim() !== '')
    ) &&
    (userData.prescriptionType !== 'prescription' || uploadedFile);

  return (
    <div className="max-w-4xl mx-auto mb-6">
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-secondary-container/40 border border-secondary-container text-on-secondary-container px-6 py-3 rounded-2xl flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" data-icon="volunteer_activism">volunteer_activism</span>
          <span className="font-medium">{t('app.tagline')}</span>
        </div>
      </div>

      <section className="max-w-4xl mx-auto mb-8 md:mb-12">
        <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] h-[200px] md:h-[280px] lg:h-[320px] flex items-center px-6 md:px-12 bg-primary">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/60" />
          <div className="relative z-10 max-w-lg">
            <h1 className="text-white text-2xl md:text-3xl lg:text-5xl font-bold tracking-tight mb-2 md:mb-4 leading-[1.1]">
              {t('intake.hero.title')}
            </h1>
            <p className="text-white/90 text-sm md:text-base lg:text-lg leading-relaxed font-light hidden sm:block">
              {t('intake.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
        <div className="flex justify-between items-center px-2 md:px-4">
          <div className="flex items-center gap-1 md:gap-2">
            <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs md:text-sm">1</span>
            <span className="text-xs md:text-sm font-semibold text-primary hidden sm:inline">{t('intake.prescriptionType.label')}</span>
          </div>
          <div className="h-px flex-1 mx-2 md:mx-4 bg-outline-variant" />
          <div className="flex items-center gap-1 md:gap-2 opacity-40">
            <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-xs md:text-sm">2</span>
            <span className="text-xs md:text-sm font-medium hidden sm:inline">{t('intake.demographics.label')}</span>
          </div>
          <div className="h-px flex-1 mx-2 md:mx-4 bg-outline-variant" />
          <div className="flex items-center gap-1 md:gap-2 opacity-40">
            <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold text-xs md:text-sm">3</span>
            <span className="text-xs md:text-sm font-medium hidden sm:inline">{t('intake.medications.label')}</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-[24px] p-4 md:p-6 lg:p-10 shadow-xl border border-surface-container-high">
          <form className="space-y-6 md:space-y-8 lg:space-y-12" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="space-y-4">
              <label className="block text-xs font-bold text-on-surface/50 uppercase tracking-widest">
                {t('intake.prescriptionType.label')}
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
                  {t('intake.prescriptionType.self')}
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
                  {t('intake.prescriptionType.active')}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-bold text-on-surface/50 uppercase tracking-widest">
                  {t('intake.demographics.label')}
                </label>
                <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                <div className="space-y-2">
                  <span className="text-on-surface font-semibold block text-sm">{t('intake.demographics.gender')}</span>
                  <select
                    className="w-full bg-surface-container-low border border-surface-container-high rounded-xl py-3 md:py-4 px-4 md:px-5 text-base md:text-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                    value={userData.gender}
                    onChange={(e) => updateUserData({ gender: e.target.value })}
                  >
                    <option value="">{t('intake.demographics.genderPlaceholder')}</option>
                    <option value="female">{t('intake.demographics.female')}</option>
                    <option value="male">{t('intake.demographics.male')}</option>
                    <option value="other">{t('intake.demographics.other')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <span className="text-on-surface font-semibold block text-sm">{t('intake.demographics.age')}</span>
                  <input
                    className="w-full bg-surface-container-low border border-surface-container-high rounded-xl py-3 md:py-4 px-4 md:px-5 text-base md:text-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder={t('intake.demographics.agePlaceholder')}
                    type="number"
                    min="1"
                    max="120"
                    value={userData.age}
                    onChange={(e) => updateUserData({ age: e.target.value })}
                  />
                </div>

                {userData.gender === 'female' && (
                  <div className="md:col-span-2 p-4 md:p-6 bg-secondary-container/30 rounded-2xl border border-secondary-container/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <span className="material-symbols-outlined text-on-secondary-container text-2xl md:text-3xl" data-icon="pregnant_woman">pregnant_woman</span>
                      <div>
                        <p className="font-bold text-on-secondary-container text-sm md:text-base">{t('intake.demographics.pregnant.title')}</p>
                        <p className="text-xs md:text-sm text-on-secondary-container/70 hidden sm:block">{t('intake.demographics.pregnant.subtitle')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        className={`flex-1 sm:flex-none px-4 md:px-8 py-2.5 rounded-full font-bold transition-all ${
                          userData.pregnant === true
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white text-on-secondary-container border border-secondary-container shadow-sm'
                        }`}
                        onClick={() => updateUserData({ pregnant: true })}
                      >
                        {t('common.yes')}
                      </button>
                      <button
                        type="button"
                        className={`flex-1 sm:flex-none px-4 md:px-8 py-2.5 rounded-full font-bold transition-all ${
                          userData.pregnant === false
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white text-on-secondary-container border border-secondary-container shadow-sm'
                        }`}
                        onClick={() => updateUserData({ pregnant: false })}
                      >
                        {t('common.no')}
                      </button>
                    </div>
                  </div>
                )}

                {userData.gender === 'female' && (
                  <div className="md:col-span-2 p-4 md:p-6 bg-secondary-container/30 rounded-2xl border border-secondary-container/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 md:gap-4">
                      <span className="material-symbols-outlined text-on-secondary-container text-2xl md:text-3xl" data-icon="child_friendly">child_friendly</span>
                      <div>
                        <p className="font-bold text-on-secondary-container text-sm md:text-base">{t('intake.demographics.lactating.title')}</p>
                        <p className="text-xs md:text-sm text-on-secondary-container/70 hidden sm:block">{t('intake.demographics.lactating.subtitle')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        className={`flex-1 sm:flex-none px-4 md:px-8 py-2.5 rounded-full font-bold transition-all ${
                          userData.lactating === true
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white text-on-secondary-container border border-secondary-container shadow-sm'
                        }`}
                        onClick={() => updateUserData({ lactating: true })}
                      >
                        {t('common.yes')}
                      </button>
                      <button
                        type="button"
                        className={`flex-1 sm:flex-none px-4 md:px-8 py-2.5 rounded-full font-bold transition-all ${
                          userData.lactating === false
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-white text-on-secondary-container border border-secondary-container shadow-sm'
                        }`}
                        onClick={() => updateUserData({ lactating: false })}
                      >
                        {t('common.no')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-bold text-on-surface/50 uppercase tracking-widest">
                  {t('intake.medications.label')}
                </label>
                <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  shield
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface/40 text-lg md:text-xl" data-icon="search">search</span>
                <input
                  className="w-full bg-surface-container-low border border-surface-container-high rounded-2xl py-3 md:py-4 lg:py-5 pl-12 md:pl-14 pr-4 md:pr-5 text-base md:text-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder={t('intake.medications.searchPlaceholder')}
                  type="text"
                  value={drugSearch}
                  onChange={(e) => {
                    setDrugSearch(e.target.value);
                    setShowDrugDropdown(true);
                  }}
                  onFocus={() => setShowDrugDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDrugDropdown(false), 200)}
                />

                {showDrugDropdown && (drugSearchResults.length > 0 || isSearchingDrugs) && (
                  <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-surface-container-high max-h-60 overflow-y-auto">
                    {isSearchingDrugs ? (
                      <div className="px-5 py-3 text-on-surface-variant">Searching...</div>
                    ) : (
                      drugSearchResults.map((drug) => (
                        <div
                          key={drug.name}
                          className="px-5 py-3 hover:bg-surface-container-low cursor-pointer flex justify-between items-center gap-3"
                          onClick={() => handleAddDrug({ ...drug, name: formatDrugName(drug.name) })}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-on-surface block truncate">{formatDrugName(drug.name)}</span>
                            <span className="text-sm text-on-surface/60">{drug.category}</span>
                          </div>
                          <span className="text-sm text-primary font-medium whitespace-nowrap bg-primary/10 px-2 py-1 rounded-lg">{drug.class}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {editableMedications.map((med) => (
                  <div
                    key={med.id || med.name}
                    className={`bg-secondary-container text-on-secondary-container px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-full flex items-center gap-1.5 sm:gap-2 font-medium text-xs sm:text-sm border border-secondary-container/50 max-w-full ${
                      med.requiresDosage && (!med.dosage || med.dosage.trim() === '') ? 'ring-2 ring-error' : ''
                    }`}
                  >
                    <span className="font-semibold whitespace-nowrap truncate max-w-[80px] sm:max-w-[120px]" title={formatDrugName(med.name)}>{formatDrugName(med.name)}</span>

                    {editingDosage === med.name ? (
                      <select
                        className="bg-white/90 border border-secondary-container/50 rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm min-w-[60px] sm:min-w-[80px]"
                        value={med.dosage || ''}
                        onChange={(e) => handleDosageChange(med.name, e.target.value)}
                        onBlur={() => setEditingDosage(null)}
                        autoFocus
                      >
                        <option value="">Dosage</option>
                        {commonDosages.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        className={`text-sm px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                          med.requiresDosage && (!med.dosage || med.dosage.trim() === '')
                            ? 'bg-error/20 text-error font-bold hover:bg-error/30 cursor-pointer'
                            : 'opacity-70 hover:opacity-100 bg-white/20'
                        }`}
                        onClick={() => setEditingDosage(med.name)}
                      >
                        {med.dosage || (med.requiresDosage ? '+ Dosage' : med.dosage)}
                      </button>
                    )}

                    {editingTiming === med.name ? (
                      <select
                        className="bg-white/90 border border-secondary-container/50 rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs sm:text-sm min-w-[70px] sm:min-w-[100px]"
                        value={med.timing || ''}
                        onChange={(e) => handleTimingChange(med.name, e.target.value)}
                        onBlur={() => setEditingTiming(null)}
                        autoFocus
                      >
                        <option value="">Time</option>
                        {commonTimings.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    ) : (
                      <button
                        type="button"
                        className={`text-sm px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                          med.timing ? 'bg-primary/20 text-primary' : 'opacity-50 hover:opacity-100 bg-white/10'
                        }`}
                        onClick={() => setEditingTiming(med.name)}
                        title="Click to set timing"
                      >
                        {med.timing || '⏰'}
                      </button>
                    )}

                    <button
                      type="button"
                      className="material-symbols-outlined text-[18px] cursor-pointer hover:text-red-600 flex-shrink-0 p-1"
                      onClick={() => handleRemoveDrug(med.name)}
                    >
                      close
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-primary font-bold text-xs sm:text-sm py-2 px-3 sm:px-4 hover:bg-primary/5 rounded-full transition-all"
                  onClick={() => document.querySelector('input[placeholder*="drug name"]')?.focus()}
                >
                  + {t('intake.medications.addMedication')}
                </button>
              </div>

              {userData.prescriptionType === 'self' && (
                <div className="bg-tertiary/10 rounded-xl p-3 sm:p-4 border border-tertiary/20">
                  <p className="text-xs sm:text-sm text-on-surface/70">
                    <span className="material-symbols-outlined text-tertiary text-sm align-middle mr-1">info</span>
                    Please enter the dosage for each medication. You can select from common dosages or enter a custom value.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4 sm:space-y-6">
              <label className="block text-xs font-bold text-on-surface/50 uppercase tracking-widest">
                {t('intake.conditions.label')}
              </label>
              <div className="relative">
                <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface/40" data-icon="medical_information">medical_information</span>
                <input
                  className="w-full bg-surface-container-low border border-surface-container-high rounded-2xl py-3 sm:py-5 pl-12 sm:pl-14 pr-4 sm:pr-5 text-base sm:text-lg focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder={t('intake.conditions.searchPlaceholder')}
                  type="text"
                  value={conditionSearch}
                  onChange={(e) => {
                    setConditionSearch(e.target.value);
                    setShowConditionDropdown(true);
                  }}
                  onFocus={() => setShowConditionDropdown(true)}
                  onBlur={() => setTimeout(() => setShowConditionDropdown(false), 200)}
                />

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

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {editableConditions.map((condition) => (
                  <div
                    key={condition}
                    className="bg-primary-container/20 text-on-surface px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-full flex items-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm border border-primary-container/30"
                  >
                    {condition}
                    <button
                      type="button"
                      className="material-symbols-outlined text-[16px] sm:text-[18px] cursor-pointer hover:text-red-600 p-0.5 sm:p-0"
                      onClick={() => handleRemoveCondition(condition)}
                    >
                      close
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <label className="block text-xs font-bold text-on-surface/50 uppercase tracking-widest flex items-center gap-2">
                {userData.prescriptionType === 'prescription' ? t('intake.upload.labelRequired') : t('intake.upload.labelOptional')}
              </label>
              <div
                className="border-2 border-dashed border-primary-container/30 rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center text-center hover:bg-surface-container-low transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-container/10 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  {isProcessingPrescription ? (
                    <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl" data-icon="add_a_photo">add_a_photo</span>
                  )}
                </div>
                {isProcessingPrescription ? (
                  <div>
                    <h3 className="text-on-surface font-bold text-base sm:text-lg">{t('intake.upload.processing')}</h3>
                    <p className="text-primary mt-1 max-w-[280px] text-sm">{prescriptionProcessingStatus}</p>
                    <div className="mt-4 w-48 mx-auto h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  </div>
                ) : uploadedFile ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <h3 className="text-on-surface font-bold text-base sm:text-lg">{uploadedFile.name}</h3>
                    </div>
                    <p className="text-on-surface/60 mt-1 max-w-[280px] text-xs sm:text-sm">
                      {prescriptionProcessingStatus || t('intake.upload.subtitle')}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-on-surface font-bold text-base sm:text-lg">{t('intake.upload.title')}</h3>
                    <p className="text-on-surface/60 mt-1 max-w-[280px] text-xs sm:text-sm">{t('intake.upload.subtitle')}</p>
                    <span className="mt-3 sm:mt-4 px-6 sm:px-8 py-2 sm:py-2.5 bg-primary-container text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm inline-block">
                      {t('intake.upload.chooseFile')}
                    </span>
                  </div>
                )}
              </div>

              {extractedMedications.length > 0 && (
                <div className="bg-surface-container-low rounded-2xl p-3 sm:p-4 border border-surface-container-high">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    <span className="font-bold text-on-surface text-sm sm:text-base">{t('intake.upload.aiExtracted')}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-on-surface-variant mb-2 sm:mb-3">
                    {t('intake.upload.aiExtractedSubtitle')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {extractedMedications.map((med) => (
                      <span
                        key={med.name}
                        className="bg-primary/10 text-primary px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 max-w-full"
                      >
                        <span className="material-symbols-outlined text-xs flex-shrink-0">medication</span>
                        <span className="truncate" title={formatDrugName(med.name)}>{formatDrugName(med.name)}</span>
                        {med.dosage && med.dosage !== 'Not specified' && (
                          <span className="text-xs opacity-70 whitespace-nowrap hidden sm:inline">{med.dosage}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveExtractedMed(med.name)}
                          className="material-symbols-outlined text-[12px] sm:text-[14px] hover:text-error flex-shrink-0 p-0.5"
                        >
                          close
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 sm:pt-8">
              <button
                type="submit"
                className={`w-full py-4 sm:py-6 rounded-[2rem] text-lg sm:text-2xl font-bold shadow-lg transition-all animate-soft-pulse ${
                  isFormValid
                    ? 'bg-primary text-white shadow-primary/30 hover:shadow-xl hover:-translate-y-1 active:translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isFormValid}
              >
                {userData.prescriptionType === 'prescription' && !uploadedFile
                  ? t('intake.submit.uploadToContinue')
                  : t('intake.submit.runAnalysis')}
              </button>
              <p className="text-center text-on-surface/40 text-xs sm:text-sm mt-4 sm:mt-6 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-primary" data-icon="lock" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                {t('intake.submit.privacyNote')}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
