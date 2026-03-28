export const medicineDatabase = [
  { name: 'Metformin', category: 'Antidiabetic', dosage: '500mg', class: 'Biguanide', conditions: ['Diabetes Type 2'] },
  { name: 'Metformin ER', category: 'Antidiabetic', dosage: '1000mg', class: 'Biguanide', conditions: ['Diabetes Type 2'] },
  { name: 'Glipizide', category: 'Antidiabetic', dosage: '5mg', class: 'Sulfonylurea', conditions: ['Diabetes Type 2'] },
  { name: 'Glyburide', category: 'Antidiabetic', dosage: '2.5mg', class: 'Sulfonylurea', conditions: ['Diabetes Type 2'] },
  { name: 'Glimepiride', category: 'Antidiabetic', dosage: '1mg', class: 'Sulfonylurea', conditions: ['Diabetes Type 2'] },
  { name: 'Sitagliptin', category: 'Antidiabetic', dosage: '100mg', class: 'DPP-4 Inhibitor', conditions: ['Diabetes Type 2'] },
  { name: 'Empagliflozin', category: 'Antidiabetic', dosage: '10mg', class: 'SGLT2 Inhibitor', conditions: ['Diabetes Type 2'] },
  { name: 'Liraglutide', category: 'Antidiabetic', dosage: '1.2mg', class: 'GLP-1 Agonist', conditions: ['Diabetes Type 2'] },
  { name: 'Insulin Glargine', category: 'Antidiabetic', dosage: '100 units', class: 'Insulin', conditions: ['Diabetes Type 1', 'Diabetes Type 2'] },
  { name: 'Insulin Lispro', category: 'Antidiabetic', dosage: '100 units', class: 'Insulin', conditions: ['Diabetes Type 1', 'Diabetes Type 2'] },
  
  { name: 'Lisinopril', category: 'Antihypertensive', dosage: '10mg', class: 'ACE Inhibitor', conditions: ['Hypertension', 'Heart Failure'] },
  { name: 'Enalapril', category: 'Antihypertensive', dosage: '5mg', class: 'ACE Inhibitor', conditions: ['Hypertension', 'Heart Failure'] },
  { name: 'Ramipril', category: 'Antihypertensive', dosage: '2.5mg', class: 'ACE Inhibitor', conditions: ['Hypertension', 'Heart Failure'] },
  { name: 'Amlodipine', category: 'Antihypertensive', dosage: '5mg', class: 'Calcium Channel Blocker', conditions: ['Hypertension'] },
  { name: 'Nifedipine', category: 'Antihypertensive', dosage: '30mg', class: 'Calcium Channel Blocker', conditions: ['Hypertension'] },
  { name: 'Losartan', category: 'Antihypertensive', dosage: '50mg', class: 'ARB', conditions: ['Hypertension'] },
  { name: 'Valsartan', category: 'Antihypertensive', dosage: '80mg', class: 'ARB', conditions: ['Hypertension', 'Heart Failure'] },
  { name: 'Olmesartan', category: 'Antihypertensive', dosage: '20mg', class: 'ARB', conditions: ['Hypertension'] },
  { name: 'Metoprolol', category: 'Antihypertensive', dosage: '50mg', class: 'Beta Blocker', conditions: ['Hypertension', 'Heart Disease'] },
  { name: 'Atenolol', category: 'Antihypertensive', dosage: '50mg', class: 'Beta Blocker', conditions: ['Hypertension'] },
  { name: 'Carvedilol', category: 'Antihypertensive', dosage: '12.5mg', class: 'Beta Blocker', conditions: ['Hypertension', 'Heart Failure'] },
  { name: 'Bisoprolol', category: 'Antihypertensive', dosage: '5mg', class: 'Beta Blocker', conditions: ['Hypertension'] },
  { name: 'Hydrochlorothiazide', category: 'Antihypertensive', dosage: '25mg', class: 'Thiazide Diuretic', conditions: ['Hypertension'] },
  { name: 'Chlorthalidone', category: 'Antihypertensive', dosage: '25mg', class: 'Thiazide Diuretic', conditions: ['Hypertension'] },
  { name: 'Furosemide', category: 'Diuretic', dosage: '40mg', class: 'Loop Diuretic', conditions: ['Heart Failure', 'Hypertension'] },
  { name: 'Spironolactone', category: 'Diuretic', dosage: '25mg', class: 'Potassium-sparing Diuretic', conditions: ['Heart Failure'] },
  
  { name: 'Atorvastatin', category: 'Cholesterol', dosage: '20mg', class: 'Statin', conditions: ['Heart Disease'] },
  { name: 'Simvastatin', category: 'Cholesterol', dosage: '20mg', class: 'Statin', conditions: ['Heart Disease'] },
  { name: 'Rosuvastatin', category: 'Cholesterol', dosage: '10mg', class: 'Statin', conditions: ['Heart Disease'] },
  { name: 'Pravastatin', category: 'Cholesterol', dosage: '40mg', class: 'Statin', conditions: ['Heart Disease'] },
  { name: 'Ezetimibe', category: 'Cholesterol', dosage: '10mg', class: 'Cholesterol Absorption Inhibitor', conditions: ['Heart Disease'] },
  
  { name: 'Omeprazole', category: 'Gastrointestinal', dosage: '20mg', class: 'PPI', conditions: [] },
  { name: 'Pantoprazole', category: 'Gastrointestinal', dosage: '40mg', class: 'PPI', conditions: [] },
  { name: 'Esomeprazole', category: 'Gastrointestinal', dosage: '40mg', class: 'PPI', conditions: [] },
  { name: 'Lansoprazole', category: 'Gastrointestinal', dosage: '30mg', class: 'PPI', conditions: [] },
  { name: 'Rabeprazole', category: 'Gastrointestinal', dosage: '20mg', class: 'PPI', conditions: [] },
  { name: 'Ranitidine', category: 'Gastrointestinal', dosage: '150mg', class: 'H2 Blocker', conditions: [] },
  { name: 'Famotidine', category: 'Gastrointestinal', dosage: '20mg', class: 'H2 Blocker', conditions: [] },
  
  { name: 'Gabapentin', category: 'Neurological', dosage: '300mg', class: 'Anticonvulsant', conditions: ['Anxiety', 'Epilepsy'] },
  { name: 'Pregabalin', category: 'Neurological', dosage: '75mg', class: 'Anticonvulsant', conditions: ['Anxiety', 'Epilepsy'] },
  { name: 'Levetiracetam', category: 'Neurological', dosage: '500mg', class: 'Anticonvulsant', conditions: ['Epilepsy'] },
  { name: 'Phenytoin', category: 'Neurological', dosage: '100mg', class: 'Anticonvulsant', conditions: ['Epilepsy'] },
  { name: 'Carbamazepine', category: 'Neurological', dosage: '200mg', class: 'Anticonvulsant', conditions: ['Epilepsy'] },
  
  { name: 'Sertraline', category: 'Antidepressant', dosage: '50mg', class: 'SSRI', conditions: ['Depression', 'Anxiety'] },
  { name: 'Fluoxetine', category: 'Antidepressant', dosage: '20mg', class: 'SSRI', conditions: ['Depression', 'Anxiety'] },
  { name: 'Escitalopram', category: 'Antidepressant', dosage: '10mg', class: 'SSRI', conditions: ['Depression', 'Anxiety'] },
  { name: 'Paroxetine', category: 'Antidepressant', dosage: '20mg', class: 'SSRI', conditions: ['Depression', 'Anxiety'] },
  { name: 'Citalopram', category: 'Antidepressant', dosage: '20mg', class: 'SSRI', conditions: ['Depression', 'Anxiety'] },
  { name: 'Venlafaxine', category: 'Antidepressant', dosage: '37.5mg', class: 'SNRI', conditions: ['Depression', 'Anxiety'] },
  { name: 'Duloxetine', category: 'Antidepressant', dosage: '30mg', class: 'SNRI', conditions: ['Depression', 'Anxiety'] },
  { name: 'Bupropion', category: 'Antidepressant', dosage: '150mg', class: 'NDRI', conditions: ['Depression'] },
  { name: 'Mirtazapine', category: 'Antidepressant', dosage: '15mg', class: 'Tetracyclic', conditions: ['Depression'] },
  { name: 'Trazodone', category: 'Antidepressant', dosage: '50mg', class: 'SARI', conditions: ['Depression', 'Insomnia'] },
  
  { name: 'Alprazolam', category: 'Anxiolytic', dosage: '0.5mg', class: 'Benzodiazepine', conditions: ['Anxiety'] },
  { name: 'Lorazepam', category: 'Anxiolytic', dosage: '1mg', class: 'Benzodiazepine', conditions: ['Anxiety', 'Insomnia'] },
  { name: 'Clonazepam', category: 'Anxiolytic', dosage: '0.5mg', class: 'Benzodiazepine', conditions: ['Anxiety', 'Epilepsy'] },
  { name: 'Diazepam', category: 'Anxiolytic', dosage: '5mg', class: 'Benzodiazepine', conditions: ['Anxiety'] },
  { name: 'Buspirone', category: 'Anxiolytic', dosage: '10mg', class: 'Azapirone', conditions: ['Anxiety'] },
  
  { name: 'Zolpidem', category: 'Sedative', dosage: '10mg', class: 'Z-drug', conditions: ['Insomnia'] },
  { name: 'Eszopiclone', category: 'Sedative', dosage: '2mg', class: 'Z-drug', conditions: ['Insomnia'] },
  { name: 'Hydroxyzine', category: 'Sedative', dosage: '25mg', class: 'Antihistamine', conditions: ['Anxiety', 'Insomnia'] },
  
  { name: 'Warfarin', category: 'Anticoagulant', dosage: '5mg', class: 'Vitamin K Antagonist', conditions: ['Heart Disease'] },
  { name: 'Rivaroxaban', category: 'Anticoagulant', dosage: '20mg', class: 'Factor Xa Inhibitor', conditions: ['Heart Disease'] },
  { name: 'Apixaban', category: 'Anticoagulant', dosage: '5mg', class: 'Factor Xa Inhibitor', conditions: ['Heart Disease'] },
  { name: 'Dabigatran', category: 'Anticoagulant', dosage: '150mg', class: 'Direct Thrombin Inhibitor', conditions: ['Heart Disease'] },
  { name: 'Clopidogrel', category: 'Antiplatelet', dosage: '75mg', class: 'P2Y12 Inhibitor', conditions: ['Heart Disease'] },
  { name: 'Aspirin', category: 'Antiplatelet', dosage: '81mg', class: 'NSAID', conditions: ['Heart Disease'] },
  
  { name: 'Amoxicillin', category: 'Antibiotic', dosage: '500mg', class: 'Penicillin', conditions: [] },
  { name: 'Azithromycin', category: 'Antibiotic', dosage: '250mg', class: 'Macrolide', conditions: [] },
  { name: 'Ciprofloxacin', category: 'Antibiotic', dosage: '500mg', class: 'Fluoroquinolone', conditions: [] },
  { name: 'Levofloxacin', category: 'Antibiotic', dosage: '500mg', class: 'Fluoroquinolone', conditions: [] },
  { name: 'Doxycycline', category: 'Antibiotic', dosage: '100mg', class: 'Tetracycline', conditions: [] },
  { name: 'Metronidazole', category: 'Antibiotic', dosage: '500mg', class: 'Nitroimidazole', conditions: [] },
  { name: ' Cephalexin', category: 'Antibiotic', dosage: '500mg', class: 'Cephalosporin', conditions: [] },
  { name: 'Sulfamethoxazole/Trimethoprim', category: 'Antibiotic', dosage: '800/160mg', class: 'Sulfonamide', conditions: [] },
  
  { name: 'Prednisone', category: 'Corticosteroid', dosage: '10mg', class: 'Glucocorticoid', conditions: ['Asthma', 'Arthritis'] },
  { name: 'Methylprednisolone', category: 'Corticosteroid', dosage: '4mg', class: 'Glucocorticoid', conditions: ['Asthma', 'Arthritis'] },
  { name: 'Dexamethasone', category: 'Corticosteroid', dosage: '4mg', class: 'Glucocorticoid', conditions: [] },
  { name: 'Hydrocortisone', category: 'Corticosteroid', dosage: '20mg', class: 'Glucocorticoid', conditions: [] },
  
  { name: 'Montelukast', category: 'Respiratory', dosage: '10mg', class: 'Leukotriene Inhibitor', conditions: ['Asthma'] },
  { name: 'Albuterol', category: 'Respiratory', dosage: '90mcg', class: 'Beta Agonist', conditions: ['Asthma', 'COPD'] },
  { name: 'Fluticasone', category: 'Respiratory', dosage: '250mcg', class: 'Inhaled Corticosteroid', conditions: ['Asthma', 'COPD'] },
  { name: 'Budesonide', category: 'Respiratory', dosage: '200mcg', class: 'Inhaled Corticosteroid', conditions: ['Asthma', 'COPD'] },
  { name: 'Tiotropium', category: 'Respiratory', dosage: '18mcg', class: 'Anticholinergic', conditions: ['COPD'] },
  
  { name: 'Levothyroxine', category: 'Thyroid', dosage: '50mcg', class: 'Thyroid Hormone', conditions: ['Thyroid Disorder'] },
  { name: 'Liothyronine', category: 'Thyroid', dosage: '25mcg', class: 'Thyroid Hormone', conditions: ['Thyroid Disorder'] },
  
  { name: 'Allopurinol', category: 'Antigout', dosage: '100mg', class: 'Xanthine Oxidase Inhibitor', conditions: [] },
  { name: 'Febuxostat', category: 'Antigout', dosage: '40mg', class: 'Xanthine Oxidase Inhibitor', conditions: [] },
  { name: 'Colchicine', category: 'Antigout', dosage: '0.6mg', class: 'Anti-inflammatory', conditions: [] },
  
  { name: 'Diclofenac', category: 'NSAID', dosage: '50mg', class: 'NSAID', conditions: ['Arthritis'] },
  { name: 'Ibuprofen', category: 'NSAID', dosage: '400mg', class: 'NSAID', conditions: ['Arthritis'] },
  { name: 'Naproxen', category: 'NSAID', dosage: '250mg', class: 'NSAID', conditions: ['Arthritis'] },
  { name: 'Meloxicam', category: 'NSAID', dosage: '7.5mg', class: 'NSAID', conditions: ['Arthritis'] },
  { name: 'Celecoxib', category: 'NSAID', dosage: '200mg', class: 'COX-2 Inhibitor', conditions: ['Arthritis'] },
  { name: 'Acetaminophen', category: 'Analgesic', dosage: '500mg', class: 'Analgesic', conditions: [] },
  { name: 'Tramadol', category: 'Analgesic', dosage: '50mg', class: 'Opioid', conditions: [] },
  { name: 'Oxycodone', category: 'Analgesic', dosage: '5mg', class: 'Opioid', conditions: [] },
  { name: 'Hydrocodone/Acetaminophen', category: 'Analgesic', dosage: '5/325mg', class: 'Opioid', conditions: [] },
  
  { name: 'Cyclobenzaprine', category: 'Muscle Relaxant', dosage: '10mg', class: 'Muscle Relaxant', conditions: ['Arthritis'] },
  { name: 'Methocarbamol', category: 'Muscle Relaxant', dosage: '500mg', class: 'Muscle Relaxant', conditions: [] },
  { name: 'Baclofen', category: 'Muscle Relaxant', dosage: '10mg', class: 'GABA Agonist', conditions: [] },
  { name: 'Tizanidine', category: 'Muscle Relaxant', dosage: '4mg', class: 'Alpha-2 Agonist', conditions: [] },
  
  { name: 'Tamsulosin', category: 'Urological', dosage: '0.4mg', class: 'Alpha Blocker', conditions: [] },
  { name: 'Finasteride', category: 'Urological', dosage: '5mg', class: '5-alpha Reductase Inhibitor', conditions: [] },
  { name: 'Dutasteride', category: 'Urological', dosage: '0.5mg', class: '5-alpha Reductase Inhibitor', conditions: [] },
  { name: 'Sildenafil', category: 'Urological', dosage: '50mg', class: 'PDE5 Inhibitor', conditions: [] },
  { name: 'Tadalafil', category: 'Urological', dosage: '10mg', class: 'PDE5 Inhibitor', conditions: [] },
  
  { name: 'Amitriptyline', category: 'Antidepressant', dosage: '25mg', class: 'Tricyclic', conditions: ['Depression', 'Chronic Pain'] },
  { name: 'Nortriptyline', category: 'Antidepressant', dosage: '25mg', class: 'Tricyclic', conditions: ['Depression'] },
  { name: 'Imipramine', category: 'Antidepressant', dosage: '25mg', class: 'Tricyclic', conditions: ['Depression'] },
  
  { name: 'Quetiapine', category: 'Antipsychotic', dosage: '50mg', class: 'Atypical Antipsychotic', conditions: ['Depression', 'Anxiety'] },
  { name: 'Olanzapine', category: 'Antipsychotic', dosage: '5mg', class: 'Atypical Antipsychotic', conditions: [] },
  { name: 'Risperidone', category: 'Antipsychotic', dosage: '1mg', class: 'Atypical Antipsychotic', conditions: [] },
  
  { name: 'Digoxin', category: 'Cardiac', dosage: '0.125mg', class: 'Cardiac Glycoside', conditions: ['Heart Failure', 'Heart Disease'] },
  { name: 'Amiodarone', category: 'Cardiac', dosage: '200mg', class: 'Antiarrhythmic', conditions: ['Heart Disease'] },
];

export const diseaseDatabase = [
  { name: 'Diabetes Type 1', category: 'Endocrine', symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Weight loss'] },
  { name: 'Diabetes Type 2', category: 'Endocrine', symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision'] },
  { name: 'Hypertension', category: 'Cardiovascular', symptoms: ['Headache', 'Shortness of breath', 'Nosebleeds', 'Dizziness'] },
  { name: 'Heart Disease', category: 'Cardiovascular', symptoms: ['Chest pain', 'Shortness of breath', 'Fatigue', 'Irregular heartbeat'] },
  { name: 'Heart Failure', category: 'Cardiovascular', symptoms: ['Shortness of breath', 'Fatigue', 'Swelling', 'Rapid weight gain'] },
  { name: 'Asthma', category: 'Respiratory', symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness', 'Coughing'] },
  { name: 'COPD', category: 'Respiratory', symptoms: ['Shortness of breath', 'Wheezing', 'Chronic cough', 'Chest tightness'] },
  { name: 'Chronic Kidney Disease', category: 'Renal', symptoms: ['Fatigue', 'Swelling', 'Changes in urination', 'Nausea'] },
  { name: 'Liver Disease', category: 'Hepatic', symptoms: ['Jaundice', 'Abdominal pain', 'Swelling', 'Fatigue'] },
  { name: 'Thyroid Disorder', category: 'Endocrine', symptoms: ['Fatigue', 'Weight changes', 'Temperature sensitivity', 'Mood changes'] },
  { name: 'Depression', category: 'Mental Health', symptoms: ['Persistent sadness', 'Loss of interest', 'Sleep changes', 'Fatigue'] },
  { name: 'Anxiety', category: 'Mental Health', symptoms: ['Excessive worry', 'Restlessness', 'Physical symptoms', 'Sleep problems'] },
  { name: 'Arthritis', category: 'Musculoskeletal', symptoms: ['Joint pain', 'Stiffness', 'Swelling', 'Reduced range of motion'] },
  { name: 'Epilepsy', category: 'Neurological', symptoms: ['Seizures', 'Confusion', 'Uncontrollable movements', 'Loss of consciousness'] },
  { name: 'Insomnia', category: 'Sleep', symptoms: ['Difficulty falling asleep', 'Difficulty staying asleep', 'Daytime fatigue', 'Irritability'] },
  { name: 'GERD', category: 'Gastrointestinal', symptoms: ['Heartburn', 'Regurgitation', 'Chest pain', 'Difficulty swallowing'] },
  { name: 'Chronic Pain', category: 'Neurological', symptoms: ['Persistent pain', 'Fatigue', 'Sleep disturbances', 'Mood changes'] },
  { name: 'Osteoporosis', category: 'Musculoskeletal', symptoms: ['Bone pain', 'Stooped posture', 'Loss of height', 'Fractures'] },
  { name: 'Anemia', category: 'Hematological', symptoms: ['Fatigue', 'Weakness', 'Pale skin', 'Shortness of breath'] },
  { name: 'Migraine', category: 'Neurological', symptoms: ['Severe headache', 'Nausea', 'Sensitivity to light', 'Visual disturbances'] },
];

export const drugInteractionsDatabase = {
  'warfarin+aspirin': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'Concurrent use of Warfarin and Aspirin significantly increases bleeding risk. Monitor INR closely and watch for signs of bleeding.' },
  'aspirin+warfarin': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'Concurrent use of Warfarin and Aspirin significantly increases bleeding risk. Monitor INR closely and watch for signs of bleeding.' },
  'lisinopril+ibuprofen': { severity: 'major', risk: 'Acute Renal Impairment', description: 'NSAIDs like Ibuprofen reduce the antihypertensive effect of ACE inhibitors and may impair kidney function, especially in dehydrated patients.' },
  'ibuprofen+lisinopril': { severity: 'major', risk: 'Acute Renal Impairment', description: 'NSAIDs like Ibuprofen reduce the antihypertensive effect of ACE inhibitors and may impair kidney function, especially in dehydrated patients.' },
  'metformin+alcohol': { severity: 'moderate', risk: 'Lactic Acidosis Risk', description: 'Alcohol enhances the hypoglycemic effect of Metformin and increases the risk of lactic acidosis. Avoid excessive alcohol consumption.' },
  'alcohol+metformin': { severity: 'moderate', risk: 'Lactic Acidosis Risk', description: 'Alcohol enhances the hypoglycemic effect of Metformin and increases the risk of lactic acidosis. Avoid excessive alcohol consumption.' },
  'metoprolol+amlodipine': { severity: 'moderate', risk: 'Enhanced Hypotension', description: 'Both Metoprolol and Amlodipine lower blood pressure. Combined use may cause excessive hypotension, dizziness, or bradycardia.' },
  'amlodipine+metoprolol': { severity: 'moderate', risk: 'Enhanced Hypotension', description: 'Both Metoprolol and Amlodipine lower blood pressure. Combined use may cause excessive hypotension, dizziness, or bradycardia.' },
  'simvastatin+amlodipine': { severity: 'major', risk: 'Increased Statin Toxicity', description: 'Amlodipine inhibits the metabolism of Simvastatin, increasing the risk of muscle problems (myopathy) and rhabdomyolysis.' },
  'amlodipine+simvastatin': { severity: 'major', risk: 'Increased Statin Toxicity', description: 'Amlodipine inhibits the metabolism of Simvastatin, increasing the risk of muscle problems (myopathy) and rhabdomyolysis.' },
  'sertraline+tramadol': { severity: 'major', risk: 'Serotonin Syndrome', description: 'Combined use of SSRIs and Tramadol increases the risk of serotonin syndrome, a potentially life-threatening condition.' },
  'tramadol+sertraline': { severity: 'major', risk: 'Serotonin Syndrome', description: 'Combined use of SSRIs and Tramadol increases the risk of serotonin syndrome, a potentially life-threatening condition.' },
  'alprazolam+alcohol': { severity: 'contraindicated', risk: 'CNS Depression', description: 'Combining Benzodiazepines with alcohol causes severe respiratory depression, sedation, and can be fatal. Do not mix.' },
  'alcohol+alprazolam': { severity: 'contraindicated', risk: 'CNS Depression', description: 'Combining Benzodiazepines with alcohol causes severe respiratory depression, sedation, and can be fatal. Do not mix.' },
  'metformin+ciprofloxacin': { severity: 'moderate', risk: 'Blood Sugar Abnormalities', description: 'Ciprofloxacin may cause significant hypoglycemia or hyperglycemia in diabetic patients taking Metformin. Monitor blood sugar closely.' },
  'ciprofloxacin+metformin': { severity: 'moderate', risk: 'Blood Sugar Abnormalities', description: 'Ciprofloxacin may cause significant hypoglycemia or hyperglycemia in diabetic patients taking Metformin. Monitor blood sugar closely.' },
  'levothyroxine+omeprazole': { severity: 'minor', risk: 'Reduced Absorption', description: 'Omeprazole may reduce Levothyroxine absorption. Take Levothyroxine on an empty stomach, 30-60 minutes before breakfast.' },
  'omeprazole+levothyroxine': { severity: 'minor', risk: 'Reduced Absorption', description: 'Omeprazole may reduce Levothyroxine absorption. Take Levothyroxine on an empty stomach, 30-60 minutes before breakfast.' },
  'fluoxetine+tramadol': { severity: 'major', risk: 'Serotonin Syndrome', description: 'SSRIs combined with Tramadol increase serotonin levels, raising the risk of serotonin syndrome.' },
  'tramadol+fluoxetine': { severity: 'major', risk: 'Serotonin Syndrome', description: 'SSRIs combined with Tramadol increase serotonin levels, raising the risk of serotonin syndrome.' },
  'escitalopram+tramadol': { severity: 'major', risk: 'Serotonin Syndrome', description: 'SSRIs combined with Tramadol increase serotonin levels, raising the risk of serotonin syndrome.' },
  'paroxetine+tramadol': { severity: 'major', risk: 'Serotonin Syndrome', description: 'SSRIs combined with Tramadol increase serotonin levels, raising the risk of serotonin syndrome.' },
  'clopidogrel+omeprazole': { severity: 'moderate', risk: 'Reduced Antiplatelet Effect', description: 'Omeprazole may reduce the effectiveness of Clopidogrel. Consider using an alternative PPI like Pantoprazole.' },
  'omeprazole+clopidogrel': { severity: 'moderate', risk: 'Reduced Antiplatelet Effect', description: 'Omeprazole may reduce the effectiveness of Clopidogrel. Consider using an alternative PPI like Pantoprazole.' },
  'digoxin+amlodipine': { severity: 'moderate', risk: 'Increased Digoxin Levels', description: 'Amlodipine may increase Digoxin levels, potentially leading to digoxin toxicity. Monitor digoxin levels and signs of toxicity.' },
  'amlodipine+digoxin': { severity: 'moderate', risk: 'Increased Digoxin Levels', description: 'Amlodipine may increase Digoxin levels, potentially leading to digoxin toxicity. Monitor digoxin levels and signs of toxicity.' },
  'spironolactone+lisinopril': { severity: 'moderate', risk: 'Hyperkalemia', description: 'Both medications can increase potassium levels. Monitor potassium levels regularly, especially in patients with kidney disease.' },
  'lisinopril+spironolactone': { severity: 'moderate', risk: 'Hyperkalemia', description: 'Both medications can increase potassium levels. Monitor potassium levels regularly, especially in patients with kidney disease.' },
  'warfarin+ibuprofen': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'NSAIDs increase bleeding risk when combined with Warfarin. Avoid this combination or use with extreme caution and close monitoring.' },
  'ibuprofen+warfarin': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'NSAIDs increase bleeding risk when combined with Warfarin. Avoid this combination or use with extreme caution and close monitoring.' },
  'lisinopril+potassium': { severity: 'moderate', risk: 'Hyperkalemia', description: 'ACE inhibitors can increase potassium levels. Supplementary potassium may cause dangerous hyperkalemia.' },
  'potassium+lisinopril': { severity: 'moderate', risk: 'Hyperkalemia', description: 'ACE inhibitors can increase potassium levels. Supplementary potassium may cause dangerous hyperkalemia.' },
  'amiodarone+warfarin': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'Amiodarone inhibits Warfarin metabolism, significantly increasing bleeding risk. Reduce Warfarin dose and monitor INR closely.' },
  'warfarin+amiodarone': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'Amiodarone inhibits Warfarin metabolism, significantly increasing bleeding risk. Reduce Warfarin dose and monitor INR closely.' },
  'fluoxetine+alprazolam': { severity: 'moderate', risk: 'Increased Sedation', description: 'Both medications cause sedation. Combined use may result in excessive drowsiness and impaired coordination.' },
  'alprazolam+fluoxetine': { severity: 'moderate', risk: 'Increased Sedation', description: 'Both medications cause sedation. Combined use may result in excessive drowsiness and impaired coordination.' },
  'metronidazole+alcohol': { severity: 'contraindicated', risk: 'Disulfiram-like Reaction', description: 'Combining Metronidazole with alcohol causes a disulfiram-like reaction with severe nausea, vomiting, and flushing.' },
  'alcohol+metronidazole': { severity: 'contraindicated', risk: 'Disulfiram-like Reaction', description: 'Combining Metronidazole with alcohol causes a disulfiram-like reaction with severe nausea, vomiting, and flushing.' },
  'ciprofloxacin+warfarin': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'Ciprofloxacin may increase the anticoagulant effect of Warfarin, significantly increasing bleeding risk.' },
  'warfarin+ciprofloxacin': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'Ciprofloxacin may increase the anticoagulant effect of Warfarin, significantly increasing bleeding risk.' },
  'levofloxacin+warfarin': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'Fluoroquinolone antibiotics may increase the anticoagulant effect of Warfarin, significantly increasing bleeding risk.' },
  'warfarin+levofloxacin': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'Fluoroquinolone antibiotics may increase the anticoagulant effect of Warfarin, significantly increasing bleeding risk.' },
  'simvastatin+gemfibrozil': { severity: 'contraindicated', risk: 'Severe Myopathy Risk', description: 'Gemfibrozil significantly increases Simvastatin levels, causing a very high risk of severe myopathy and rhabdomyolysis. Do not combine.' },
  'gemfibrozil+simvastatin': { severity: 'contraindicated', risk: 'Severe Myopathy Risk', description: 'Gemfibrozil significantly increases Simvastatin levels, causing a very high risk of severe myopathy and rhabdomyolysis. Do not combine.' },
  'methotrexate+ibuprofen': { severity: 'major', risk: 'Methotrexate Toxicity', description: 'NSAIDs reduce Methotrexate excretion, potentially causing toxic Methotrexate levels. Avoid this combination.' },
  'ibuprofen+methotrexate': { severity: 'major', risk: 'Methotrexate Toxicity', description: 'NSAIDs reduce Methotrexate excretion, potentially causing toxic Methotrexate levels. Avoid this combination.' },
  'lithium+ibuprofen': { severity: 'major', risk: 'Lithium Toxicity', description: 'NSAIDs reduce Lithium excretion, potentially causing Lithium toxicity. Monitor Lithium levels closely.' },
  'ibuprofen+lithium': { severity: 'major', risk: 'Lithium Toxicity', description: 'NSAIDs reduce Lithium excretion, potentially causing Lithium toxicity. Monitor Lithium levels closely.' },
  'digoxin+furosemide': { severity: 'moderate', risk: 'Hypokalemia', description: 'Furosemide-induced hypokalemia increases the risk of Digoxin toxicity. Monitor potassium levels and digoxin levels.' },
  'furosemide+digoxin': { severity: 'moderate', risk: 'Hypokalemia', description: 'Furosemide-induced hypokalemia increases the risk of Digoxin toxicity. Monitor potassium levels and digoxin levels.' },
};

export function searchMedications(query) {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();
  return medicineDatabase.filter(med => 
    med.name.toLowerCase().includes(lowerQuery) ||
    med.category.toLowerCase().includes(lowerQuery) ||
    med.class.toLowerCase().includes(lowerQuery)
  ).slice(0, 15);
}

export function searchDiseases(query) {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();
  return diseaseDatabase.filter(disease => 
    disease.name.toLowerCase().includes(lowerQuery) ||
    disease.category.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
}

export function getInteraction(drug1, drug2) {
  const key1 = `${drug1}+${drug2}`;
  const key2 = `${drug2}+${drug1}`;
  return drugInteractionsDatabase[key1] || drugInteractionsDatabase[key2] || null;
}

export function getAllInteractionsForDrugs(drugNames) {
  const interactions = [];
  const lowerDrugNames = drugNames.map(d => typeof d === 'string' ? d.toLowerCase() : d.name.toLowerCase());
  
  for (let i = 0; i < lowerDrugNames.length; i++) {
    for (let j = i + 1; j < lowerDrugNames.length; j++) {
      const interaction = getInteraction(lowerDrugNames[i], lowerDrugNames[j]);
      if (interaction) {
        interactions.push({
          id: interactions.length + 1,
          drugs: [drugNames[i], drugNames[j]],
          ...interaction,
          mechanism: interaction.description,
          recommendations: generateRecommendationsForInteraction(interaction.severity),
        });
      }
    }
  }
  
  return interactions;
}

function generateRecommendationsForInteraction(severity) {
  const recommendations = {
    contraindicated: [
      'DO NOT take these medications together',
      'Seek immediate medical attention',
      'Contact your prescribing physician',
    ],
    major: [
      'Consult your prescribing physician immediately',
      'Do not start or stop medications without medical advice',
      'Consider alternative treatment options',
    ],
    moderate: [
      'Discuss with your healthcare provider',
      'Monitor for adverse effects',
      'Consider timing separation if appropriate',
    ],
    minor: [
      'Generally safe but be aware of potential effects',
      'Monitor for any unusual symptoms',
    ],
  };
  return recommendations[severity] || recommendations.moderate;
}

export function getMedicationInfo(drugName) {
  return medicineDatabase.find(med => med.name.toLowerCase() === drugName.toLowerCase());
}
