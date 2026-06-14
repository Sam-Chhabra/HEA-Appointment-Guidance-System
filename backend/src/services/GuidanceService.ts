import { guidanceRepository } from '../repositories/GuidanceRepository.js';
import { departmentRepository } from '../repositories/DepartmentRepository.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { guidanceInputSchema, detectEmergency } from '../utils/validation.js';

/**
 * Rule-based keyword map from symptoms/needs to departments.
 * Each department has an array of keywords that trigger a recommendation.
 */
const DEPARTMENT_KEYWORD_MAP: Record<string, string[]> = {
  'Cardiology': [
    'heart', 'chest pain', 'palpitations', 'blood pressure', 'cardiac',
    'heartbeat', 'arrhythmia', 'hypertension', 'cholesterol',
  ],
  'Dermatology': [
    'skin', 'rash', 'acne', 'mole', 'itch', 'eczema', 'psoriasis',
    'dermatitis', 'hives', 'wart', 'fungal', 'blister',
  ],
  'Orthopedics': [
    'bone', 'joint', 'knee', 'back pain', 'fracture', 'spine', 'shoulder',
    'hip', 'ankle', 'wrist', 'arthritis', 'osteoporosis', 'ligament',
    'muscle pain', 'sprain',
  ],
  'Neurology': [
    'headache', 'migraine', 'seizure', 'numbness', 'dizziness', 'vertigo',
    'tremor', 'nerve', 'memory', 'confusion', 'tingling', 'paralysis',
  ],
  'ENT': [
    'ear', 'nose', 'throat', 'hearing', 'sinus', 'tonsil', 'voice',
    'snoring', 'nosebleed', 'earache', 'hoarse', 'swallowing',
  ],
  'General Medicine': [
    'fever', 'tired', 'general', 'checkup', 'fatigue', 'cold', 'flu',
    'cough', 'weight', 'diabetes', 'infection', 'pain', 'sick',
    'nausea', 'vomiting', 'diarrhea', 'allergy',
  ],
};

const DISCLAIMER = 'This recommendation is only for appointment guidance and is not a medical diagnosis. If you have a medical emergency, please contact emergency services immediately.';

export class GuidanceService {
  submitGuidanceInput(inputText: string, patientId: number | null) {
    // Validate input
    guidanceInputSchema.parse({ inputText });

    // Check for emergency keywords
    if (detectEmergency(inputText)) {
      return {
        isEmergency: true,
        message: 'This system cannot handle emergencies or urgency assessment. Please contact emergency services or hospital staff immediately.',
        disclaimer: DISCLAIMER,
      };
    }

    // Extract keywords
    const keywords = this.extractKeywords(inputText);

    // Recommend department
    const recommendation = this.recommendDepartment(keywords);

    // Create guidance session
    const session = guidanceRepository.create(
      patientId,
      inputText,
      JSON.stringify(keywords),
      recommendation.departmentId,
      recommendation.departmentId // Initially, selected = recommended
    );

    return {
      isEmergency: false,
      sessionId: session.id,
      recommendedDepartment: recommendation.department
        ? { id: recommendation.department.id, name: recommendation.department.name }
        : null,
      explanation: recommendation.explanation,
      extractedKeywords: keywords,
      alternatives: recommendation.alternatives,
      disclaimer: DISCLAIMER,
    };
  }

  extractKeywords(inputText: string): string[] {
    const lower = inputText.toLowerCase();
    const allKeywords = Object.values(DEPARTMENT_KEYWORD_MAP).flat();
    const matched = allKeywords.filter((kw) => lower.includes(kw));
    // Deduplicate
    return [...new Set(matched)];
  }

  recommendDepartment(keywords: string[]): {
    departmentId: number | null;
    department: { id: number; name: string } | null;
    explanation: string;
    alternatives: { id: number; name: string }[];
  } {
    // Score each department by number of keyword matches
    const scores: Record<string, number> = {};

    for (const [deptName, deptKeywords] of Object.entries(DEPARTMENT_KEYWORD_MAP)) {
      scores[deptName] = keywords.filter((kw) => deptKeywords.includes(kw)).length;
    }

    // Sort by score descending
    const ranked = Object.entries(scores)
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);

    if (ranked.length === 0) {
      // Default to General Medicine if no match
      const generalMedicine = departmentRepository.findByName('General Medicine');
      return {
        departmentId: generalMedicine?.id ?? null,
        department: generalMedicine ? { id: generalMedicine.id, name: generalMedicine.name } : null,
        explanation: 'No specific department match found. We recommend General Medicine for an initial consultation.',
        alternatives: [],
      };
    }

    const topDeptName = ranked[0][0];
    const topDept = departmentRepository.findByName(topDeptName);

    const alternatives = ranked
      .slice(1, 4)
      .map(([name]) => departmentRepository.findByName(name))
      .filter((d): d is NonNullable<typeof d> => d !== undefined)
      .map((d) => ({ id: d.id, name: d.name }));

    return {
      departmentId: topDept?.id ?? null,
      department: topDept ? { id: topDept.id, name: topDept.name } : null,
      explanation: `Based on your symptoms, ${topDeptName} is the recommended department.`,
      alternatives,
    };
  }

  overrideDepartment(sessionId: number, departmentId: number, patientId: number) {
    const session = guidanceRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Guidance session not found.');
    }
    if (session.patient_id !== patientId) {
      throw new ValidationError('You can only modify your own guidance session.');
    }

    const department = departmentRepository.findById(departmentId);
    if (!department) {
      throw new NotFoundError('Department not found.');
    }

    guidanceRepository.updateSelectedDepartment(sessionId, departmentId);

    return {
      sessionId,
      selectedDepartment: { id: department.id, name: department.name },
      disclaimer: DISCLAIMER,
    };
  }

  getGuidanceSession(sessionId: number, patientId: number) {
    const session = guidanceRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Guidance session not found.');
    }
    if (session.patient_id !== patientId) {
      throw new ValidationError('You can only view your own guidance session.');
    }

    return {
      ...session,
      disclaimer: DISCLAIMER,
    };
  }
}

export const guidanceService = new GuidanceService();
